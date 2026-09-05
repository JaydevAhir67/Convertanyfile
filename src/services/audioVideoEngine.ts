export interface VideoGeneratorOptions {
  audioFile: File;
  imageFile?: File;
  videoTitle?: string;
  artistName?: string;
  resolution?: '720p' | '1080p' | '480p';
  onProgress?: (progress: number) => void;
}

export class AudioVideoEngine {
  // Convert any browser-decodable audio into high-fidelity uncompressed 16-bit PCM WAV
  public static async audioToWav(audioFile: File): Promise<Blob> {
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const wavBytes = this.encodeWav(audioBuffer);
      return new Blob([wavBytes], { type: 'audio/wav' });
    } finally {
      if (audioCtx.state !== 'closed') {
        await audioCtx.close();
      }
    }
  }

  // Generate PCM WAV buffer from AudioBuffer
  private static encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const numSamples = audioBuffer.length;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF identifier
    writeString(0, 'RIFF');
    // file length
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type
    writeString(8, 'WAVE');
    // format chunk identifier
    writeString(12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw PCM)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate
    view.setUint32(28, sampleRate * blockAlign, true);
    // block align
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(36, 'data');
    // data chunk length
    view.setUint32(40, dataSize, true);

    // Write interleaved samples
    let offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    for (let i = 0; i < numSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channels[ch][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += bytesPerSample;
      }
    }

    return buffer;
  }

  // MP3 + Image to MP4/WebM Video Generator with live audio visualizer waveform!
  public static async generateVideoFromAudioAndImage(options: VideoGeneratorOptions): Promise<Blob> {
    const { audioFile, imageFile, videoTitle = 'Audio Track', artistName = 'ConvertAnyFile Studio', onProgress } = options;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Canvas dimensions
    let width = 1280;
    let height = 720;
    if (options.resolution === '1080p') {
      width = 1920;
      height = 1080;
    } else if (options.resolution === '480p') {
      width = 854;
      height = 480;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Load background image if provided
    let bgImg: HTMLImageElement | null = null;
    if (imageFile) {
      bgImg = await new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(imageFile);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    }

    // Set up Audio Graph & Destination
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(dest);

    // Video stream from canvas
    const canvasStream = canvas.captureStream(30);
    // Combine video stream + audio stream
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    // Choose supported MIME type
    const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
      ? 'video/mp4;codecs=avc1'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 2500000
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      const durationSec = Math.min(audioBuffer.duration, 60); // Cap preview synthesis up to 60s for responsiveness
      const startTime = audioCtx.currentTime;
      let animFrameId: number;

      recorder.onstop = () => {
        cancelAnimationFrame(animFrameId);
        source.stop();
        audioCtx.close();
        const outputBlob = new Blob(chunks, { type: mimeType.split(';')[0] });
        resolve(outputBlob);
      };

      recorder.onerror = (err) => {
        cancelAnimationFrame(animFrameId);
        audioCtx.close();
        reject(err);
      };

      recorder.start();
      source.start();

      const drawFrame = () => {
        const elapsed = audioCtx.currentTime - startTime;
        if (onProgress) {
          onProgress(Math.min(100, Math.round((elapsed / durationSec) * 100)));
        }

        if (elapsed >= durationSec) {
          recorder.stop();
          return;
        }

        // 1. Draw Background
        if (bgImg) {
          ctx.drawImage(bgImg, 0, 0, width, height);
          // Dark overlay for contrast
          ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          ctx.fillRect(0, 0, width, height);
        } else {
          // Elegant gradient background
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e1b4b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw Visualizer Waveform / Spectrum
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.35);

          // Subtle gradient bar
          const barGrad = ctx.createLinearGradient(0, height - barHeight - 40, 0, height - 40);
          barGrad.addColorStop(0, '#38bdf8');
          barGrad.addColorStop(1, '#818cf8');

          ctx.fillStyle = barGrad;
          ctx.fillRect(x, height - barHeight - 50, barWidth - 2, barHeight);
          x += barWidth;
        }

        // 3. Draw Track Details & Typography
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(videoTitle, width / 2, height / 2 - 20);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '20px sans-serif';
        ctx.fillText(artistName, width / 2, height / 2 + 25);

        // 4. Progress bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(100, height - 25, width - 200, 6);

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(100, height - 25, (width - 200) * (elapsed / durationSec), 6);

        animFrameId = requestAnimationFrame(drawFrame);
      };

      drawFrame();
    });
  }
}
