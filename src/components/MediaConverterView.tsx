import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Music,
  Video,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { ImageEngine } from '../services/imageEngine';
import { AudioVideoEngine } from '../services/audioVideoEngine';
import { ConversionRocketModal } from './ConversionRocketModal';

export const MediaConverterView: React.FC = () => {
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'audio' | 'video'>('image');

  // Image Processing State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetImgFormat, setTargetImgFormat] = useState<string>('image/png');
  const [imgQuality, setImgQuality] = useState<number>(90);
  const [resizeWidth, setResizeWidth] = useState<string>('');
  const [resizeHeight, setResizeHeight] = useState<string>('');
  const [convertedImgBlob, setConvertedImgBlob] = useState<Blob | null>(null);
  const [imgProcessing, setImgProcessing] = useState(false);

  // Audio State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTarget, setAudioTarget] = useState<'wav' | 'mp3'>('wav');
  const [convertedAudioBlob, setConvertedAudioBlob] = useState<Blob | null>(null);
  const [audioProcessing, setAudioProcessing] = useState(false);

  // Video State
  const [videoAudioFile, setVideoAudioFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('ConvertAnyFile Audio Visualizer');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoProcessing, setVideoProcessing] = useState<boolean>(false);

  // General Rocket Progress State
  const [mediaProgress, setMediaProgress] = useState<number>(0);
  const [mediaStage, setMediaStage] = useState<string>('Processing media stream...');

  // Handle Image File Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setConvertedImgBlob(null);
  };

  const handleConvertImage = async () => {
    if (!imageFile) return;
    setImgProcessing(true);
    setMediaProgress(20);
    setMediaStage('Decoding raster buffers and scaling canvas...');
    try {
      await new Promise(r => setTimeout(r, 150));
      setMediaProgress(60);
      setMediaStage(`Encoding pixel matrix to ${targetImgFormat.split('/')[1]?.toUpperCase() || 'IMAGE'}...`);
      const blob = await ImageEngine.convertImage(imageFile, {
        format: targetImgFormat as any,
        quality: imgQuality / 100,
        maxWidth: resizeWidth ? Number(resizeWidth) : undefined,
        maxHeight: resizeHeight ? Number(resizeHeight) : undefined
      });
      setConvertedImgBlob(blob);
      setMediaProgress(100);
      setMediaStage('Image transformation complete! Launching...');
      await new Promise(r => setTimeout(r, 550));
    } catch (err: any) {
      alert(`Image processing error: ${err.message}`);
    } finally {
      setImgProcessing(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setConvertedAudioBlob(null);
  };

  const handleConvertAudio = async () => {
    if (!audioFile) return;
    setAudioProcessing(true);
    setMediaProgress(25);
    setMediaStage('Decoding audio PCM stream via Web Audio API...');
    try {
      await new Promise(r => setTimeout(r, 150));
      setMediaProgress(70);
      setMediaStage('Assembling RIFF header and interleaving audio samples...');
      const wavBlob = await AudioVideoEngine.audioToWav(audioFile);
      setConvertedAudioBlob(wavBlob);
      setMediaProgress(100);
      setMediaStage('Audio transcoding complete! Launching...');
      await new Promise(r => setTimeout(r, 550));
    } catch (err: any) {
      alert(`Audio conversion error: ${err.message}`);
    } finally {
      setAudioProcessing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoAudioFile) return;
    setVideoProcessing(true);
    setVideoProgress(10);
    try {
      const vBlob = await AudioVideoEngine.generateVideoFromAudioAndImage({
        audioFile: videoAudioFile,
        videoTitle: videoTitle || 'ConvertAnyFile Visualizer',
        onProgress: p => setVideoProgress(p)
      });
      setVideoBlob(vBlob);
      setVideoProgress(100);
      await new Promise(r => setTimeout(r, 550));
    } catch (err: any) {
      alert(`Video rendering error: ${err.message}`);
    } finally {
      setVideoProcessing(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Rocket Loading Modal for Media Conversions */}
      {imgProcessing && (
        <ConversionRocketModal
          progress={mediaProgress}
          filename={imageFile?.name || 'Image'}
          targetFormat={targetImgFormat.split('/')[1]?.toUpperCase() || 'IMAGE'}
          stageText={mediaStage}
        />
      )}

      {audioProcessing && (
        <ConversionRocketModal
          progress={mediaProgress}
          filename={audioFile?.name || 'Audio'}
          targetFormat={audioTarget.toUpperCase()}
          stageText={mediaStage}
        />
      )}

      {videoProcessing && (
        <ConversionRocketModal
          progress={videoProgress}
          filename={videoAudioFile?.name || 'Audio Track'}
          targetFormat="MP4 VIDEO"
          stageText="Synthesizing audio frequencies into Canvas video stream..."
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-sky-600" />
            <span>Media Engine & Canvas Synthesizer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Client-side image conversion, resolution scaling, Audio-to-WAV PCM transcoding, and Canvas MediaRecorder MP4 synthesizer.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveMediaTab('image')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
            activeMediaTab === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image Converter</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMediaTab('audio')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
            activeMediaTab === 'audio' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Audio Engine (WAV)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMediaTab('video')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
            activeMediaTab === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Audio to Video (MP4)</span>
        </button>
      </div>

      {/* Image Panel */}
      {activeMediaTab === 'image' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <label className="block text-xs font-bold text-slate-700">1. Select Source Graphic</label>
              <label className="cursor-pointer block border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center bg-white transition-colors">
                <Upload className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-700 block">
                  {imageFile ? imageFile.name : 'Click to select JPG, PNG, WEBP, BMP, or SVG'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Up to 25MB supported'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {/* Format & Quality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Format</label>
                  <select
                    value={targetImgFormat}
                    onChange={e => setTargetImgFormat(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/jpeg">JPEG (Compressed)</option>
                    <option value="image/webp">WEBP (Web-optimized)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quality ({imgQuality}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={imgQuality}
                    onChange={e => setImgQuality(Number(e.target.value))}
                    className="w-full mt-2 accent-sky-600"
                  />
                </div>
              </div>

              {/* Optional Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Width (px)</label>
                  <input
                    type="number"
                    placeholder="Auto / Keep"
                    value={resizeWidth}
                    onChange={e => setResizeWidth(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Height (px)</label>
                  <input
                    type="number"
                    placeholder="Auto / Keep"
                    value={resizeHeight}
                    onChange={e => setResizeHeight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!imageFile || imgProcessing}
                onClick={handleConvertImage}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {imgProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Frame...</span>
                  </>
                ) : (
                  <span>Execute Canvas Transformation</span>
                )}
              </button>
            </div>
          </div>

          {/* Preview & Download */}
          <div className="md:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                Real-Time Preview
              </span>
              {imagePreview ? (
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center justify-center max-h-72 overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="max-h-64 object-contain rounded" />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg h-56 flex items-center justify-center text-slate-400 text-xs">
                  No image currently loaded
                </div>
              )}
            </div>

            {convertedImgBlob && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Conversion Ready</span>
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    Output Size: {(convertedImgBlob.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = URL.createObjectURL(convertedImgBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    const ext = targetImgFormat.split('/')[1] || 'png';
                    a.download = `ConvertAnyFile_${Date.now()}.${ext}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Panel */}
      {activeMediaTab === 'audio' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 max-w-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-800">In-Browser Audio Transcoder</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Decodes MP3/OGG/M4A via Web Audio API AudioContext and re-encodes into lossless 44.1kHz 16-bit PCM WAV.
            </p>
          </div>

          <label className="cursor-pointer block border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-8 text-center bg-slate-50 transition-colors">
            <Music className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-700 block">
              {audioFile ? audioFile.name : 'Select MP3, OGG, or M4A audio file'}
            </span>
            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
          </label>

          <button
            type="button"
            disabled={!audioFile || audioProcessing}
            onClick={handleConvertAudio}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            {audioProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Transcoding to WAV PCM...</span>
              </>
            ) : (
              <span>Transcode Audio to WAV</span>
            )}
          </button>

          {convertedAudioBlob && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Lossless WAV Generated</span>
                <span className="text-[11px] text-emerald-700">{(convertedAudioBlob.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = URL.createObjectURL(convertedAudioBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `audio_transcoded_${Date.now()}.wav`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download WAV</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Video Synthesizer Panel */}
      {activeMediaTab === 'video' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 max-w-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Audio to Video Synthesizer (MP4/WebM)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Converts audio tracks into shareable video files with animated waveforms using HTML5 Canvas & MediaRecorder.
            </p>
          </div>

          <label className="cursor-pointer block border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center bg-slate-50 transition-colors">
            <Video className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-700 block">
              {videoAudioFile ? videoAudioFile.name : 'Select audio track (MP3, WAV, OGG)'}
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={e => setVideoAudioFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Video Title Overlay</label>
            <input
              type="text"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
            />
          </div>

          <button
            type="button"
            disabled={!videoAudioFile || videoProcessing}
            onClick={handleGenerateVideo}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            {videoProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering Video ({videoProgress}%)...</span>
              </>
            ) : (
              <span>Synthesize Video Track</span>
            )}
          </button>

          {videoBlob && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Video Synthesized Successfully</span>
                <span className="text-[11px] text-emerald-700">{(videoBlob.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = URL.createObjectURL(videoBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `synthesized_video_${Date.now()}.mp4`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
