/**
 * Web Audio API Futuristic Sound Synthesizer
 * Production-ready audio engine with browser Autoplay Policy unlocker
 * for Vercel, Netlify, Cloud Run, Safari, Chrome, Firefox, iOS & Android.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    this.setupGlobalUnlockListeners();
  }

  /**
   * Sets up global event listeners on window to automatically unlock the
   * Web Audio API on the user's very first touch, click, or keypress.
   * This is required by modern browser Autoplay policies (especially on Vercel/production domains).
   */
  private setupGlobalUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = async () => {
      await this.unlockAudioContext();
      // Remove listeners once successfully unlocked
      if (this.isUnlocked) {
        ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(evt => {
          window.removeEventListener(evt, unlock);
        });
      }
    };

    ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: false, passive: true });
    });
  }

  /**
   * Unlocks the AudioContext by resuming it and playing a silent buffer.
   */
  public async unlockAudioContext(): Promise<boolean> {
    try {
      const ctx = this.getOrCreateContext();
      if (!ctx) return false;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Play a short silent buffer to force unlock iOS/Safari WebKit audio pipeline
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      this.isUnlocked = ctx.state === 'running';
      return this.isUnlocked;
    } catch {
      return false;
    }
  }

  private getOrCreateContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('caf_sound_muted', muted ? 'true' : 'false');
    } catch {}
  }

  public getMuted(): boolean {
    if (this.isMuted) return true;
    try {
      return localStorage.getItem('caf_sound_muted') === 'true';
    } catch {
      return false;
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked || (this.audioCtx !== null && this.audioCtx.state === 'running');
  }

  /**
   * Sound effect played during the appearance of the rocket.
   * Multi-layered sound:
   * 1. Supersonic Mach Air Whoosh (filtered noise burst)
   * 2. Ion Engine Pitch Sweep (turbofan spin-up ramp)
   * 3. Quantum Warp Sparkle (high-frequency harmonic shimmer)
   */
  public async playRocketAppearanceSound() {
    if (this.getMuted()) return;

    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      // Ensure context is running before scheduling audio nodes
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;

      // Master Gain for Appearance Sound
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.24, now);
      masterGain.connect(ctx.destination);

      // --- LAYER 1: Supersonic Air Burst (Bandpass Filtered Noise) ---
      const bufferSize = Math.floor(ctx.sampleRate * 0.75);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(3.8, now);
      // Fast pitch sweep simulating extreme approach speed
      bandpass.frequency.setValueAtTime(260, now);
      bandpass.frequency.exponentialRampToValueAtTime(3600, now + 0.28);
      bandpass.frequency.exponentialRampToValueAtTime(750, now + 0.65);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.38, now + 0.12);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.72);

      // --- LAYER 2: Ion Turbine Spin-Up (Dual Sawtooth/Triangle Pitch Glide) ---
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const turbineGain = ctx.createGain();
      const turbineFilter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(620, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.7);

      osc2.frequency.setValueAtTime(120, now);
      osc2.frequency.exponentialRampToValueAtTime(940, now + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(480, now + 0.7);

      turbineFilter.type = 'lowpass';
      turbineFilter.frequency.setValueAtTime(450, now);
      turbineFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);
      turbineFilter.frequency.exponentialRampToValueAtTime(600, now + 0.7);

      turbineGain.gain.setValueAtTime(0.02, now);
      turbineGain.gain.linearRampToValueAtTime(0.2, now + 0.18);
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

      chime1.frequency.setValueAtTime(1280, now);
      chime1.frequency.exponentialRampToValueAtTime(2560, now + 0.25);

      chime2.frequency.setValueAtTime(1920, now);
      chime2.frequency.exponentialRampToValueAtTime(3840, now + 0.25);

      chimeGain.gain.setValueAtTime(0.01, now);
      chimeGain.gain.linearRampToValueAtTime(0.09, now + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

      chime1.connect(chimeGain);
      chime2.connect(chimeGain);
      chimeGain.connect(masterGain);

      chime1.start(now);
      chime2.start(now);
      chime1.stop(now + 0.54);
      chime2.stop(now + 0.54);
    } catch {
      // AudioContext failure gracefully handled
    }
  }

  /**
   * Sound effect played during final blast-off / launch into space
   */
  public async playRocketBlastOffSound() {
    if (this.getMuted()) return;

    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;

      // Master Gain for Blast Off
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.26, now);
      masterGain.connect(ctx.destination);

      // Sub-bass thump
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(190, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      subGain.gain.setValueAtTime(0.32, now);
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
      whistle.frequency.exponentialRampToValueAtTime(1550, now + 0.55);
      whistleGain.gain.setValueAtTime(0.05, now);
      whistleGain.gain.linearRampToValueAtTime(0.24, now + 0.15);
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
