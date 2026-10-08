/**
 * Centralized haptics controller for ConvertAnyFile.
 *
 * Real issue fixed here:
 * - haptics were being called without a reliable user-interaction gate
 * - iOS and unsupported browsers were not handled safely
 * - the controller was effectively a loose collection of methods instead of one
 *   central, throttled, event-driven system.
 */

export interface HapticBridge {
  postMessage?: (msg: any) => void;
}

class HapticsService {
  private isEnabled: boolean = true;
  private hasUserGesture: boolean = false;
  private hasNativeVibrate: boolean = false;
  private lastHapticTime: number = 0;
  private minIntervalMs: number = 40;
  private suppressUntil: number = 0;

  constructor() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('caf_haptics_enabled');
      if (stored !== null) this.isEnabled = stored === 'true';
    } catch {}

    this.hasNativeVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function';

    if (typeof window !== 'undefined') {
      const enableFromGesture = () => {
        this.hasUserGesture = true;
      };

      window.addEventListener('pointerdown', enableFromGesture, { passive: true });
      window.addEventListener('keydown', enableFromGesture, { passive: true });
      window.addEventListener('touchstart', enableFromGesture, { passive: true });
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

  public markUserGesture(): void {
    this.hasUserGesture = true;
  }

  private shouldThrottle(): boolean {
    const now = Date.now();
    if (now < this.suppressUntil) return true;
    if (now - this.lastHapticTime < this.minIntervalMs) {
      this.suppressUntil = now + this.minIntervalMs;
      return true;
    }
    this.lastHapticTime = now;
    return false;
  }

  private dispatchNative(pattern: number | number[]) {
    if (!this.hasNativeVibrate || !this.hasUserGesture) return false;

    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }

  private dispatchNativeBridge(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'ryno' | 'button', pattern?: number | number[]) {
    if (typeof window === 'undefined') return false;
    const win = window as any;

    try {
      if (win.Capacitor?.Plugins?.Haptics) {
        if (type === 'success' || type === 'error') {
          win.Capacitor.Plugins.Haptics.notification({ type: String(type).toUpperCase() });
        } else {
          win.Capacitor.Plugins.Haptics.impact({ style: String(type).toUpperCase() });
        }
        return true;
      }

      if (win.webkit?.messageHandlers?.haptic?.postMessage) {
        win.webkit.messageHandlers.haptic.postMessage({
          type,
          pattern: pattern ?? 15
        });
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  private trigger(pattern: number | number[], severity: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'ryno' | 'button' = 'light') {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined') return;

    try {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (reducedMotion && reducedMotion.matches) return;
    } catch {}

    if (!this.hasUserGesture && !this.isSupported()) return;
    if (!this.hasUserGesture && this.isSupported()) {
      // Do not fire on unsupported or blocked browsers until the user has interacted.
      return;
    }

    if (this.shouldThrottle()) return;

    // Android / modern browser support
    if (this.dispatchNative(pattern)) return;

    // iOS / installed app / WebView bridge support
    if (this.dispatchNativeBridge(severity, pattern)) return;

    // Graceful fallback: no fake vibration. This is intentionally silent on unsupported browsers.
  }

  public hapticSelect() { this.trigger(15, 'light'); }
  public hapticUpload() { this.trigger(22, 'light'); }
  public hapticEngine() { this.trigger([20, 35, 22, 35, 25], 'medium'); }
  public hapticLaunch() { this.trigger([45, 25, 65], 'heavy'); }
  public hapticTravel() { this.trigger(16, 'light'); }
  public hapticGalaxy() { this.trigger([30, 25, 35], 'medium'); }
  public hapticSuccess() { this.trigger([35, 45, 65], 'success'); }
  public hapticError() { this.trigger([60, 40, 60], 'error'); }
  public hapticButton() { this.trigger(12, 'button'); }
  public hapticRyno() { this.trigger(18, 'ryno'); }

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

export const hapticSelect = () => HapticsEngine.hapticSelect();
export const hapticUpload = () => HapticsEngine.hapticUpload();
export const hapticEngine = () => HapticsEngine.hapticEngine();
export const hapticLaunch = () => HapticsEngine.hapticLaunch();
export const hapticTravel = () => HapticsEngine.hapticTravel();
export const hapticGalaxy = () => HapticsEngine.hapticGalaxy();
export const hapticSuccess = () => HapticsEngine.hapticSuccess();
export const hapticError = () => HapticsEngine.hapticError();
export const hapticButton = () => HapticsEngine.hapticButton();
export const hapticRyno = () => HapticsEngine.hapticRyno();
export const isHapticsSupported = () => HapticsEngine.isSupported();
export const getHapticsEnabled = () => HapticsEngine.getIsEnabled();
export const setHapticsEnabled = (enabled: boolean) => HapticsEngine.setIsEnabled(enabled);
