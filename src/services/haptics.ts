/**
 * ConvertAnyFile Centralized Haptic Feedback Engine
 * 
 * Provides subtle, event-driven, premium haptic feedback synchronized
 * with the 3D rocket conversion journey:
 * 
 * 1. File selected           → Very light tap
 * 2. Upload starts           → Short soft pulse
 * 3. Engine ignition         → 2-3 subtle pulses resembling engine vibration
 * 4. Rocket launch           → Stronger but short haptic burst
 * 5. Space travel            → Occasional very subtle pulse (never continuous)
 * 6. Galaxy milestone        → Slightly stronger pulse
 * 7. Conversion completed    → Satisfying double-tap / success pattern
 * 8. Conversion failed       → Short distinct error pattern
 * 
 * Multi-Platform Architecture:
 * - Android / Modern Web: W3C Web Vibration API (navigator.vibrate)
 * - iOS Safari / PWA: Graceful fallback to audio-visual feedback, with support for native WebKit / PWA bridge
 * - User Preferences: Respects prefers-reduced-motion and user mute toggle
 */

export interface HapticBridge {
  postMessage?: (msg: any) => void;
}

class HapticsService {
  private isEnabled: boolean = true;
  private isAndroid: boolean = false;
  private isIOS: boolean = false;
  private hasNativeVibrate: boolean = false;
  private lastHapticTime: number = 0;
  private minIntervalMs: number = 40; // Prevent overlapping spam

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('caf_haptics_enabled');
        if (stored !== null) {
          this.isEnabled = stored === 'true';
        }

        const ua = navigator.userAgent || '';
        this.isAndroid = /Android/i.test(ua);
        this.isIOS =
          /iPad|iPhone|iPod/.test(ua) ||
          (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);

        this.hasNativeVibrate = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
      } catch {
        this.isEnabled = true;
      }
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setIsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('caf_haptics_enabled', enabled ? 'true' : 'false');
    } catch {}
  }

  public isSupported(): boolean {
    // True native support on Android/Standards, or iOS with native app wrapper
    return this.hasNativeVibrate || this.isNativeBridgeAvailable();
  }

  public isNativeBridgeAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(
      win.webkit?.messageHandlers?.haptic ||
      win.webkit?.messageHandlers?.impact ||
      win.AndroidBridge?.vibrate ||
      win.Capacitor?.isPluginAvailable?.('Haptics')
    );
  }

  /**
   * Internal dispatcher for haptic vibration patterns
   */
  private trigger(pattern: number | number[], iosFeedbackType?: 'light' | 'medium' | 'heavy' | 'success' | 'error') {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined') return;

    // Rate-limiting to ensure distinct, non-muddy pulses
    const now = Date.now();
    if (now - this.lastHapticTime < this.minIntervalMs) return;
    this.lastHapticTime = now;

    // Respect system accessibility: prefers-reduced-motion
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    } catch {}

    // 1. Android & Standard Web Vibration API
    if (this.hasNativeVibrate) {
      try {
        navigator.vibrate(pattern);
        return;
      } catch {}
    }

    // 2. iOS PWA / Native WebKit Bridge (if running inside installed PWA / Capacitor / WKWebView)
    const win = window as any;
    try {
      if (win.webkit?.messageHandlers?.haptic?.postMessage) {
        win.webkit.messageHandlers.haptic.postMessage({
          type: iosFeedbackType || 'light',
          pattern
        });
        return;
      }
      if (win.Capacitor?.Plugins?.Haptics) {
        if (iosFeedbackType === 'success' || iosFeedbackType === 'error') {
          win.Capacitor.Plugins.Haptics.notification({ type: iosFeedbackType.toUpperCase() });
        } else {
          win.Capacitor.Plugins.Haptics.impact({ style: (iosFeedbackType || 'LIGHT').toUpperCase() });
        }
        return;
      }
    } catch {}

    // 3. iPhone / iOS Safari Browser Fallback:
    // Safari on iOS does not support navigator.vibrate in regular web tabs.
    // We do NOT fake or claim navigator.vibrate works on iOS Safari.
    // Instead, graceful visual + audio synchronization handles the feedback.
  }

  /**
   * 1. FILE SELECTED — Very light tap
   * Gives instant tactile confirmation when user drops or selects a file
   */
  public hapticSelect() {
    this.trigger(15, 'light');
  }

  /**
   * 2. UPLOAD STARTS — Short soft pulse
   * Confirms the file payload has entered the conversion pipeline
   */
  public hapticUpload() {
    this.trigger(22, 'light');
  }

  /**
   * 3. ROCKET PREPARATION / ENGINE IGNITION — 2-3 subtle pulses
   * Recreates mechanical engine vibration before liftoff
   */
  public hapticEngine() {
    this.trigger([20, 35, 22, 35, 25], 'medium');
  }

  /**
   * 4. ROCKET LAUNCH — Stronger but short haptic burst
   * High-impact tactile liftoff sensation
   */
  public hapticLaunch() {
    this.trigger([45, 25, 65], 'heavy');
  }

  /**
   * 5. SPACE TRAVEL — Occasional very subtle pulse
   * Fired only at specific navigational milestones, NOT continuous
   */
  public hapticTravel() {
    this.trigger(16, 'light');
  }

  /**
   * 6. GALAXY / CONVERSION DESTINATION — Slightly stronger pulse
   * Tactile arrival cue at target galaxy
   */
  public hapticGalaxy() {
    this.trigger([30, 25, 35], 'medium');
  }

  /**
   * 7. CONVERSION COMPLETED — Satisfying double-tap / success pattern
   * Crisply marks file ready for download
   */
  public hapticSuccess() {
    this.trigger([35, 45, 65], 'success');
  }

  /**
   * 8. CONVERSION FAILED — Short distinct error pattern
   * Clear, distinct warning pulses
   */
  public hapticError() {
    this.trigger([60, 40, 60], 'error');
  }

  // Aliases for backwards compatibility
  public triggerFileSelected() { this.hapticSelect(); }
  public triggerDataCapsule() { this.hapticUpload(); }
  public triggerEngineStart() { this.hapticEngine(); }
  public triggerLaunch() { this.hapticLaunch(); }
  public triggerAcceleration() { this.hapticTravel(); }
  public triggerGalaxyArrival() { this.hapticGalaxy(); }
  public triggerComplete() { this.hapticSuccess(); }
  public triggerError() { this.hapticError(); }
}

export const HapticsEngine = new HapticsService();

// Standalone function exports as requested
export const hapticSelect = () => HapticsEngine.hapticSelect();
export const hapticUpload = () => HapticsEngine.hapticUpload();
export const hapticEngine = () => HapticsEngine.hapticEngine();
export const hapticLaunch = () => HapticsEngine.hapticLaunch();
export const hapticTravel = () => HapticsEngine.hapticTravel();
export const hapticGalaxy = () => HapticsEngine.hapticGalaxy();
export const hapticSuccess = () => HapticsEngine.hapticSuccess();
export const hapticError = () => HapticsEngine.hapticError();
export const isHapticsSupported = () => HapticsEngine.isSupported();
export const getHapticsEnabled = () => HapticsEngine.getIsEnabled();
export const setHapticsEnabled = (enabled: boolean) => HapticsEngine.setIsEnabled(enabled);
