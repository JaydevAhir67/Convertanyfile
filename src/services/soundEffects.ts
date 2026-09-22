/**
 * Web Audio API Futuristic Sound Synthesizer
 * Generates custom zero-latency, client-side sound effects for the rocket propulsion animations.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound effect played during the sudden appearance of the rocket.
   * Multi-layered sound:
   * 1. Supersonic Mach Air Whoosh (filtered noise burst)
   * 2. Ion Engine Pitch Sweep (turbofan spin-up ramp)
   * 3. Quantum Warp Sparkle (high-frequency harmonic shimmer)
   */
  public playRocketAppearanceSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master Gain for Appearance Sound
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.22, now);
      masterGain.connect(ctx.destination);

      // --- LAYER 1: Supersonic Air Burst (Bandpass Filtered White Noise) ---
      const bufferSize = Math.floor(ctx.sampleRate * 0.7); // 700ms buffer
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Pink-tinted random noise
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(3.5, now);
      // Fast pitch sweep simulating extreme approach speed
      bandpass.frequency.setValueAtTime(250, now);
      bandpass.frequency.exponentialRampToValueAtTime(3400, now + 0.28);
      bandpass.frequency.exponentialRampToValueAtTime(800, now + 0.65);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.12);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.7);

      // --- LAYER 2: Ion Turbine Spin-Up (Dual Sawtooth/Triangle Pitch Glide) ---
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const turbineGain = ctx.createGain();
      const turbineFilter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      // Pitch glide: low rumble accelerating to high-tech jet whine
      osc1.frequency.setValueAtTime(75, now);
      osc1.frequency.exponentialRampToValueAtTime(580, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.7);

      osc2.frequency.setValueAtTime(110, now);
      osc2.frequency.exponentialRampToValueAtTime(870, now + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(480, now + 0.7);

      turbineFilter.type = 'lowpass';
      turbineFilter.frequency.setValueAtTime(400, now);
      turbineFilter.frequency.exponentialRampToValueAtTime(2800, now + 0.3);
      turbineFilter.frequency.exponentialRampToValueAtTime(600, now + 0.7);

      turbineGain.gain.setValueAtTime(0.02, now);
      turbineGain.gain.linearRampToValueAtTime(0.18, now + 0.18);
      turbineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(turbineFilter);
      osc2.connect(turbineFilter);
      turbineFilter.connect(turbineGain);
      turbineGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.72);
      osc2.stop(now + 0.72);

      // --- LAYER 3: Sci-Fi Warp Shimmer (Harmonic Chimes) ---
      const chime1 = ctx.createOscillator();
      const chime2 = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chime1.type = 'sine';
      chime2.type = 'sine';

      chime1.frequency.setValueAtTime(1240, now);
      chime1.frequency.exponentialRampToValueAtTime(2480, now + 0.25);

      chime2.frequency.setValueAtTime(1860, now);
      chime2.frequency.exponentialRampToValueAtTime(3720, now + 0.25);

      chimeGain.gain.setValueAtTime(0.01, now);
      chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      chime1.connect(chimeGain);
      chime2.connect(chimeGain);
      chimeGain.connect(masterGain);

      chime1.start(now);
      chime2.start(now);
      chime1.stop(now + 0.52);
      chime2.stop(now + 0.52);
    } catch {
      // AudioContext failure gracefully handled
    }
  }

  /**
   * Sound effect played during final blast-off / launch into space
   */
  public playRocketBlastOffSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master Gain for Blast Off
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.24, now);
      masterGain.connect(ctx.destination);

      // Sub-bass thump
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      sub.connect(subGain);
      subGain.connect(masterGain);
      sub.start(now);
      sub.stop(now + 0.45);

      // Rising hyper-velocity rocket whistle
      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = 'triangle';
      whistle.frequency.setValueAtTime(220, now);
      whistle.frequency.exponentialRampToValueAtTime(1450, now + 0.55);
      whistleGain.gain.setValueAtTime(0.05, now);
      whistleGain.gain.linearRampToValueAtTime(0.22, now + 0.15);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      whistle.connect(whistleGain);
      whistleGain.connect(masterGain);
      whistle.start(now);
      whistle.stop(now + 0.6);
    } catch {
      // Ignore
    }
  }
}

export const SoundEngine = new SoundEffectsService();
