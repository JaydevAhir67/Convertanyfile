/**
 * Web Audio API Futuristic Sound Synthesizer & Sound FX Engine
 * Production-ready procedural audio synthesis for ConvertAnyFile.
 * Zero external asset dependencies — works in all modern browsers.
 */

export type RocketSoundTheme =
  | 'supersonic'
  | 'long_burn'
  | 'sonic_boom'
  | 'warp_jump';

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8; // 0.0 to 1.0
  private isUnlocked: boolean = false;
  private continuousRocketNodes: {
    noiseSource?: AudioBufferSourceNode;
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    gainNode?: GainNode;
    stop?: () => void;
  } | null = null;

  constructor() {
    this.setupGlobalUnlockListeners();
    // Load stored preferences if available
    try {
      if (typeof window !== 'undefined') {
        const storedMuted = localStorage.getItem('caf_sound_muted');
        if (storedMuted !== null) {
          this.isMuted = storedMuted === 'true';
        }
        const storedVol = localStorage.getItem('caf_sound_volume');
        if (storedVol !== null) {
          this.volume = Math.max(0.1, Math.min(1.0, parseFloat(storedVol)));
        }
      }
    } catch {}
  }

  /**
   * Sets up global event listeners on window to automatically unlock the
   * Web Audio API on user interaction.
   */
  private setupGlobalUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = async () => {
      await this.unlockAudioContext();
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
   * Unlocks the AudioContext by resuming it and playing a silent micro-buffer.
   */
  public async unlockAudioContext(): Promise<boolean> {
    try {
      const ctx = this.getOrCreateContext();
      if (!ctx) return false;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Silent buffer to unlock iOS Safari WebKit audio
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

  public getOrCreateContext(): AudioContext | null {
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
    if (muted) {
      this.stopContinuousRocketHum();
    }
    try {
      localStorage.setItem('caf_sound_muted', muted ? 'true' : 'false');
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1.0, vol));
    try {
      localStorage.setItem('caf_sound_volume', this.volume.toString());
    } catch {}
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked || (this.audioCtx !== null && this.audioCtx.state === 'running');
  }

  /**
   * 1. SUPERSONIC SPEED WHOOSH
   * Fast arrival sound: Supersonic air whoosh + ion turbine spin-up + warp sparkle
   */
  public async playRocketAppearanceSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.24 * this.volume, now);
      masterGain.connect(ctx.destination);

      // Layer 1: Supersonic Air Burst
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

      // Layer 2: Ion Turbine Spin-Up
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

      // Layer 3: Sci-Fi Warp Shimmer
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
    } catch {}
  }

  /**
   * 2. LONG ROCKET SOUND EFFECT (EXTENDED THRUST BURN ~4.5 SECONDS)
   * A full cinematic rocket burn:
   * - Deep sub-bass thruster ignition (40-65Hz)
   * - Sustained turbulent rocket exhaust rumble with lowpass sweep
   * - High-pressure nozzle gas hiss with LFO modulation
   * - Accelerating twin turbine jet whine
   * - Gradual supersonic climb and smooth tail exhaust
   */
  public async playLongRocketEngineSound(duration = 4.5) {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28 * this.volume, now);
      masterGain.connect(ctx.destination);

      // --- SUB-BASS IGNITION THUMP & PROPELLANT RUMBLE ---
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      // Sub-bass begins at 45Hz, climbs to 75Hz during burn, drops down
      subOsc.frequency.setValueAtTime(42, now);
      subOsc.frequency.linearRampToValueAtTime(68, now + duration * 0.4);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + duration);

      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
      subGain.gain.setValueAtTime(0.32, now + duration * 0.7);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + duration);

      // --- LONG TURBULENT EXHAUST ROAR (Stereo Filtered Pink/Brown Noise) ---
      const noiseBufferLen = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, noiseBufferLen, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < noiseBufferLen; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter for deep, heavy rocket exhaust
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Lowpass filter simulating heavy rocket mass and acoustic hull
      const exhaustFilter = ctx.createBiquadFilter();
      exhaustFilter.type = 'lowpass';
      exhaustFilter.frequency.setValueAtTime(160, now);
      // Sweeps higher as the rocket picks up extreme speed
      exhaustFilter.frequency.exponentialRampToValueAtTime(950, now + duration * 0.6);
      exhaustFilter.frequency.exponentialRampToValueAtTime(250, now + duration);

      // LFO modulation to simulate turbulent atmospheric shaking
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(6.5, now); // 6.5 Hz flutter
      lfoGain.gain.setValueAtTime(0.08, now);

      const roarGain = ctx.createGain();
      roarGain.gain.setValueAtTime(0.01, now);
      roarGain.gain.linearRampToValueAtTime(0.38, now + 0.5);
      roarGain.gain.setValueAtTime(0.35, now + duration * 0.75);
      roarGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      lfo.connect(lfoGain);
      lfoGain.connect(roarGain.gain);

      noiseSource.connect(exhaustFilter);
      exhaustFilter.connect(roarGain);
      roarGain.connect(masterGain);

      lfo.start(now);
      noiseSource.start(now);
      lfo.stop(now + duration);
      noiseSource.stop(now + duration);

      // --- TWIN TURBINE JET ACCELERATION WHINE ---
      const turbine1 = ctx.createOscillator();
      const turbine2 = ctx.createOscillator();
      const turbineGain = ctx.createGain();
      const turbineFilter = ctx.createBiquadFilter();

      turbine1.type = 'sawtooth';
      turbine2.type = 'triangle';

      // Sustained pitch climb from 90Hz to 680Hz
      turbine1.frequency.setValueAtTime(90, now);
      turbine1.frequency.exponentialRampToValueAtTime(680, now + duration * 0.7);
      turbine1.frequency.exponentialRampToValueAtTime(220, now + duration);

      turbine2.frequency.setValueAtTime(135, now);
      turbine2.frequency.exponentialRampToValueAtTime(1020, now + duration * 0.7);
      turbine2.frequency.exponentialRampToValueAtTime(330, now + duration);

      turbineFilter.type = 'bandpass';
      turbineFilter.Q.setValueAtTime(2.5, now);
      turbineFilter.frequency.setValueAtTime(350, now);
      turbineFilter.frequency.exponentialRampToValueAtTime(1800, now + duration * 0.65);
      turbineFilter.frequency.exponentialRampToValueAtTime(450, now + duration);

      turbineGain.gain.setValueAtTime(0.01, now);
      turbineGain.gain.linearRampToValueAtTime(0.16, now + 0.8);
      turbineGain.gain.setValueAtTime(0.15, now + duration * 0.7);
      turbineGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      turbine1.connect(turbineFilter);
      turbine2.connect(turbineFilter);
      turbineFilter.connect(turbineGain);
      turbineGain.connect(masterGain);

      turbine1.start(now);
      turbine2.start(now);
      turbine1.stop(now + duration);
      turbine2.stop(now + duration);

      // --- HIGH-PRESSURE NOZZLE AIR HISS ---
      const hissBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const hissData = hissBuffer.getChannelData(0);
      for (let i = 0; i < hissData.length; i++) {
        hissData[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const hissSource = ctx.createBufferSource();
      hissSource.buffer = hissBuffer;

      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = 'highpass';
      hissFilter.frequency.setValueAtTime(2200, now);

      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.001, now);
      hissGain.gain.linearRampToValueAtTime(0.09, now + 0.5);
      hissGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      hissSource.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(masterGain);

      hissSource.start(now);
      hissSource.stop(now + duration);
    } catch {}
  }

  /**
   * Continuous Rocket Hum that can be started and stopped dynamically
   */
  public startContinuousRocketHum() {
    if (this.isMuted || this.volume <= 0.01 || this.continuousRocketNodes) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.4);
      masterGain.connect(ctx.destination);

      // Infinite loop noise buffer (1 second loop)
      const bufferSize = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.02 * white) / 1.02;
        data[i] = brown * 3.0;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(58, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12, now);

      noise.connect(filter);
      filter.connect(masterGain);
      osc.connect(oscGain);
      oscGain.connect(masterGain);

      noise.start(now);
      osc.start(now);

      this.continuousRocketNodes = {
        noiseSource: noise,
        osc1: osc,
        gainNode: masterGain,
        stop: () => {
          try {
            const stopTime = ctx.currentTime;
            masterGain.gain.linearRampToValueAtTime(0.001, stopTime + 0.3);
            setTimeout(() => {
              try {
                noise.stop();
                osc.stop();
              } catch {}
            }, 320);
          } catch {}
        }
      };
    } catch {}
  }

  public stopContinuousRocketHum() {
    if (this.continuousRocketNodes) {
      if (this.continuousRocketNodes.stop) {
        this.continuousRocketNodes.stop();
      }
      this.continuousRocketNodes = null;
    }
  }

  /**
   * 3. SONIC BOOM (MACH SHOCKWAVE)
   * Supersonic atmospheric tear + deep echoing sonic boom
   */
  public async playSonicBoomSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3 * this.volume, now);
      masterGain.connect(ctx.destination);

      // Sharp supersonic whip crack (25ms burst)
      const crackOsc = ctx.createOscillator();
      const crackGain = ctx.createGain();
      crackOsc.type = 'square';
      crackOsc.frequency.setValueAtTime(1200, now);
      crackOsc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
      crackGain.gain.setValueAtTime(0.4, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      crackOsc.connect(crackGain);
      crackGain.connect(masterGain);
      crackOsc.start(now);
      crackOsc.stop(now + 0.09);

      // Deep Sub-Boom Shockwave (40Hz)
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(95, now + 0.03);
      boom.frequency.exponentialRampToValueAtTime(28, now + 1.2);
      boomGain.gain.setValueAtTime(0.45, now + 0.03);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
      boom.connect(boomGain);
      boomGain.connect(masterGain);
      boom.start(now + 0.02);
      boom.stop(now + 1.3);

      // Dispersed Noise Rumble Echo
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.4), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.4));
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(380, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(90, now + 1.3);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseSource.start(now + 0.02);
      noiseSource.stop(now + 1.4);
    } catch {}
  }

  /**
   * 4. HYPERDRIVE WARP JUMP
   * Ascending laser oscillation collapsing into warp speed
   */
  public async playWarpJumpSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25 * this.volume, now);
      masterGain.connect(ctx.destination);

      // Ascending Warp Glissando
      const warp = ctx.createOscillator();
      const warpGain = ctx.createGain();
      warp.type = 'sawtooth';
      warp.frequency.setValueAtTime(140, now);
      warp.frequency.exponentialRampToValueAtTime(3200, now + 0.6);
      warp.frequency.exponentialRampToValueAtTime(80, now + 0.9);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, now);
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 0.6);

      warpGain.gain.setValueAtTime(0.02, now);
      warpGain.gain.linearRampToValueAtTime(0.3, now + 0.4);
      warpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      warp.connect(filter);
      filter.connect(warpGain);
      warpGain.connect(masterGain);

      warp.start(now);
      warp.stop(now + 0.98);
    } catch {}
  }

  /**
   * 5. FINAL BLAST-OFF / HYPER-DRIVE
   * When conversion hits 100%
   */
  public async playRocketBlastOffSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.26 * this.volume, now);
      masterGain.connect(ctx.destination);

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
    } catch {}
  }

  /**
   * 6. MISSION SUCCESS CHIME
   * Euphoric 4-note ascending chord on job completion
   */
  public async playSuccessChimeSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2 * this.volume, now);
      masterGain.connect(ctx.destination);

      // C5, E5, G5, C6 frequencies
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.01, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.75);
      });
    } catch {}
  }

  /**
   * 7. MAGNETIC PAYLOAD DOCK / CLICK
   * Crisp tactile snap when dropping files or changing modes
   */
  public async playPayloadLockSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * 8. SPEED LASER PULSE
   * Quick energetic UI pulse
   */
  public async playLaserPulseSound() {
    if (this.isMuted || this.volume <= 0.01) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }
}

export const SoundEngine = new SoundEffectsService();
