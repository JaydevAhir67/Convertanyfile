import { useEffect, useState, useCallback, useRef } from 'react';
import { SoundEngine } from '../services/soundEffects';

export interface RocketSoundPreloadStatus {
  isPreloaded: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
  preload: () => Promise<void>;
}

/**
 * Custom preload hook for the rocket sound asset.
 * Ensures the Web Audio context is initialized, procedural audio buffers
 * (supersonic air burst, rocket burn exhaust) are pre-synthesized & cached in memory,
 * ready for zero-latency instant playback before animation completes.
 */
export function useRocketSoundPreload(): RocketSoundPreloadStatus {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => SoundEngine.getIsUnlocked());
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasPreloadedRef = useRef(false);

  const preload = useCallback(async () => {
    if (hasPreloadedRef.current) return;
    hasPreloadedRef.current = true;
    setIsLoading(true);

    try {
      // Step 1: Pre-initialize AudioContext
      setProgress(25);
      const ctx = SoundEngine.getOrCreateContext();
      if (ctx) {
        setProgress(50);
      }

      // Step 2: Synthesize and cache all rocket audio data in memory
      const success = await SoundEngine.preloadRocketAudioBuffers();
      setProgress(85);

      // Step 3: Attempt gentle silent unlock check
      const unlocked = await SoundEngine.unlockAudioContext().catch(() => false);
      setIsUnlocked(unlocked || SoundEngine.getIsUnlocked());

      setProgress(100);
      setIsPreloaded(success);
    } catch (err: any) {
      console.warn('[RocketSoundPreload] Audio cache warning:', err);
      setError(err?.message || 'Audio preload fallback active');
      setIsPreloaded(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    preload();
  }, [preload]);

  return {
    isPreloaded,
    isUnlocked,
    isLoading,
    progress,
    error,
    preload,
  };
}
