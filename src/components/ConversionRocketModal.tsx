import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, AlertCircle, RefreshCw, X, Smartphone, FastForward } from 'lucide-react';
import { ThreeDRocketCanvas, RocketFlightStage } from './ThreeDRocketCanvas';
import { SoundEngine } from '../services/soundEffects';
import {
  hapticUpload,
  hapticEngine,
  hapticLaunch,
  hapticTravel,
  hapticGalaxy,
  hapticSuccess,
  hapticError,
  HapticsEngine
} from '../services/haptics';

export interface ConversionRocketModalProps {
  realProgress?: number;
  progress?: number;
  isRealComplete?: boolean;
  filename?: string;
  sourceFormat?: string;
  targetFormat?: string;
  stageText?: string;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  onVisualComplete?: () => void;
  isDarkMode?: boolean;
}

export const ConversionRocketModal: React.FC<ConversionRocketModalProps> = ({
  realProgress,
  progress,
  isRealComplete,
  filename = 'document',
  sourceFormat = 'FILE',
  targetFormat = 'CONVERT',
  stageText,
  error = null,
  onRetry,
  onCancel,
  onVisualComplete,
  isDarkMode = true
}) => {
  const effectiveRealProgress = realProgress !== undefined ? realProgress : (progress !== undefined ? progress : 0);
  const effectiveIsRealComplete = isRealComplete !== undefined ? isRealComplete : effectiveRealProgress >= 100;

  const [stage, setStage] = useState<RocketFlightStage>('docking');
  const [displayProgress, setDisplayProgress] = useState<number>(6);
  const [isMuted, setIsMuted] = useState(() => SoundEngine.getMuted());
  const [isHapticsOn, setIsHapticsOn] = useState(() => HapticsEngine.getIsEnabled());
  const [canSkip, setCanSkip] = useState(false);

  const stageStartTimeRef = useRef(Date.now());
  const isRealCompleteRef = useRef(effectiveIsRealComplete);
  const isRealErrorRef = useRef(!!error);
  const isUnmountedRef = useRef(false);

  isRealCompleteRef.current = effectiveIsRealComplete;
  isRealErrorRef.current = !!error;

  // Track if sound/haptic milestones have already fired to prevent duplicate execution
  const eventsFiredRef = useRef({
    docking: false,
    preparing: false,
    startup: false,
    launch: false,
    spaceTravel: false,
    spaceTravelPulse: false,
    galaxy: false,
    complete: false,
    error: false
  });

  // Orchestrate Cinematic Timed Flight Stages with Synchronized Sound FX and Haptics
  useEffect(() => {
    isUnmountedRef.current = false;
    stageStartTimeRef.current = Date.now();

    // 1. STAGE: DOCKING (0s) — File enters into data capsule
    setStage('docking');
    setDisplayProgress(8);
    if (!eventsFiredRef.current.docking) {
      eventsFiredRef.current.docking = true;
      SoundEngine.playPayloadLockSound();
      hapticUpload(); // 2. Upload starts → short soft pulse
    }

    // 2. STAGE: PREPARING (~1.8s) — Pre-flight calibration
    const tPreparing = setTimeout(() => {
      if (isUnmountedRef.current || isRealErrorRef.current) return;
      setStage('preparing');
      setDisplayProgress(22);
      if (!eventsFiredRef.current.preparing) {
        eventsFiredRef.current.preparing = true;
        SoundEngine.playRocketAppearanceSound();
      }
    }, 1800);

    // 3. STAGE: ENGINE STARTUP (~3.8s) — 2-3 subtle pulses resembling engine vibration
    const tStartup = setTimeout(() => {
      if (isUnmountedRef.current || isRealErrorRef.current) return;
      setStage('startup');
      setDisplayProgress(38);
      if (!eventsFiredRef.current.startup) {
        eventsFiredRef.current.startup = true;
        SoundEngine.playRocketStartupSound();
        SoundEngine.playLongRocketEngineSound(4.5);
        hapticEngine(); // 3. Rocket preparation / engine ignition → 2–3 subtle pulses
      }
    }, 3800);

    // 4. STAGE: LAUNCH (~5.8s) — Stronger but short haptic burst
    const tLaunch = setTimeout(() => {
      if (isUnmountedRef.current || isRealErrorRef.current) return;
      setStage('launch');
      setDisplayProgress(52);
      if (!eventsFiredRef.current.launch) {
        eventsFiredRef.current.launch = true;
        SoundEngine.playRocketLaunchSound();
        SoundEngine.startContinuousRocketHum();
        hapticLaunch(); // 4. Rocket launch → stronger but short haptic burst
      }
    }, 5800);

    // 5. STAGE: SPACE TRAVEL (~8.2s) — Deep space journey begins
    const tSpace = setTimeout(() => {
      if (isUnmountedRef.current || isRealErrorRef.current) return;
      setStage('space_travel');
      setDisplayProgress(70);
      if (!eventsFiredRef.current.spaceTravel) {
        eventsFiredRef.current.spaceTravel = true;
        SoundEngine.playSonicBoomSound();
        hapticTravel(); // 5. Space travel milestone 1 → subtle pulse
      }
    }, 8200);

    // 5b. SPACE TRAVEL MID-POINT (~10.5s) — Occasional very subtle pulse (NOT continuous)
    const tSpaceMidPulse = setTimeout(() => {
      if (isUnmountedRef.current || isRealErrorRef.current) return;
      if (!eventsFiredRef.current.spaceTravelPulse) {
        eventsFiredRef.current.spaceTravelPulse = true;
        hapticTravel(); // 5. Space travel milestone 2 → occasional very subtle pulse
      }
    }, 10500);

    // 6. STAGE: GALAXY ARRIVAL (~12.5s) — Slightly stronger pulse upon reaching destination
    const tGalaxy = setTimeout(() => {
      if (isUnmountedRef.current || isRealErrorRef.current) return;
      setStage('galaxy_arrival');
      setDisplayProgress(88);
      if (!eventsFiredRef.current.galaxy) {
        eventsFiredRef.current.galaxy = true;
        SoundEngine.playWarpJumpSound();
        hapticGalaxy(); // 6. Rocket enters galaxy / milestone → slightly stronger pulse
      }
    }, 12500);

    // Authoritative completion polling: verifies backend finished + min cinematic duration (~14.5s)
    const completionInterval = setInterval(() => {
      if (isUnmountedRef.current) return;

      const elapsed = Date.now() - stageStartTimeRef.current;
      if (isRealErrorRef.current) {
        clearInterval(completionInterval);
        return;
      }

      // Allow user skip once real conversion is complete and minimum safe flight has passed (5s)
      if (isRealCompleteRef.current && elapsed > 5000) {
        setCanSkip(true);
      }

      // Automatically transition once backend is complete AND min cinematic duration is satisfied
      if (isRealCompleteRef.current && elapsed >= 14500) {
        clearInterval(completionInterval);
        triggerCompletionSequence();
      }
    }, 250);

    return () => {
      isUnmountedRef.current = true;
      clearTimeout(tPreparing);
      clearTimeout(tStartup);
      clearTimeout(tLaunch);
      clearTimeout(tSpace);
      clearTimeout(tSpaceMidPulse);
      clearTimeout(tGalaxy);
      clearInterval(completionInterval);
      SoundEngine.stopContinuousRocketHum();
    };
  }, []);

  // Handle Error Transition
  useEffect(() => {
    if (error && !eventsFiredRef.current.error) {
      eventsFiredRef.current.error = true;
      setStage('error');
      SoundEngine.stopContinuousRocketHum();
      SoundEngine.playErrorSound();
      hapticError(); // 8. Conversion failed → short distinct error pattern
    }
  }, [error]);

  // Synchronize display progress smoothly with real conversion progress
  useEffect(() => {
    if (stage === 'space_travel' || stage === 'galaxy_arrival') {
      setDisplayProgress(prev => Math.max(prev, Math.min(94, Math.round(effectiveRealProgress))));
    }
  }, [effectiveRealProgress, stage]);

  const triggerCompletionSequence = () => {
    if (stage === 'complete' || eventsFiredRef.current.complete) return;
    eventsFiredRef.current.complete = true;

    setStage('complete');
    setDisplayProgress(100);
    SoundEngine.stopContinuousRocketHum();
    SoundEngine.playRocketBlastOffSound();
    setTimeout(() => {
      SoundEngine.playSuccessChimeSound();
    }, 300);

    // 7. Conversion completed → satisfying double-tap / success pattern
    hapticSuccess();

    // Allow user 1.4s to view triumphant arrival before transitioning to download result
    setTimeout(() => {
      if (!isUnmountedRef.current && onVisualComplete) {
        onVisualComplete();
      }
    }, 1400);
  };

  const handleSkipToResult = () => {
    if (!effectiveIsRealComplete) return;
    triggerCompletionSequence();
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    SoundEngine.setMuted(next);
  };

  const toggleHaptics = () => {
    const next = !isHapticsOn;
    setIsHapticsOn(next);
    HapticsEngine.setIsEnabled(next);
    if (next) {
      hapticUpload();
    }
  };

  const getStageTitle = () => {
    if (error) return 'Conversion interrupted';
    if (stageText) return stageText;
    switch (stage) {
      case 'docking':
        return 'Packaging file into data capsule...';
      case 'preparing':
        return 'Pre-flight calibration & diagnostics...';
      case 'startup':
        return 'Engine startup & thruster ignition...';
      case 'launch':
        return 'Liftoff confirmed · Accelerating...';
      case 'space_travel':
        return 'Transcoding in flight · Deep space traversal...';
      case 'galaxy_arrival':
        return 'Approaching destination galaxy...';
      case 'complete':
        return 'Mission accomplished · Conversion verified!';
      default:
        return 'Processing your file...';
    }
  };

  return (
    <div
      id="conversion-rocket-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Top Controls: Sound FX Toggle, Haptics Toggle, Close */}
        <div className="absolute top-3.5 right-3.5 flex items-center space-x-1.5">
          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isMuted
                ? 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isMuted ? 'Sound FX Off (Click to turn on)' : 'Sound FX On (Click to mute)'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Haptic Feedback Toggle */}
          <button
            type="button"
            onClick={toggleHaptics}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              !isHapticsOn
                ? 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 opacity-60'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isHapticsOn ? 'Haptics On (Click to disable)' : 'Haptics Off (Click to enable)'}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cancel conversion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Focused 3D Rocket Viewport */}
        <div className="w-full h-56 relative flex items-center justify-center mb-1">
          <ThreeDRocketCanvas
            progress={displayProgress}
            stage={stage}
            fileExtension={sourceFormat}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Status Content */}
        {!error ? (
          <div className="w-full space-y-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {getStageTitle()}
            </h3>

            <div className="text-xs text-slate-500 truncate max-w-[260px] mx-auto font-normal">
              {filename}
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">
              <span>{sourceFormat.toUpperCase()}</span>
              <span className="mx-1 text-slate-400">→</span>
              <span>{targetFormat.toUpperCase()}</span>
            </div>

            {/* Sleek Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span className="capitalize">
                  {stage.replace('_', ' ')}
                </span>
                <span>{displayProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 dark:bg-white h-full transition-all duration-300 rounded-full"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </div>

            {/* Optional Skip Action when conversion has already completed in background */}
            {canSkip && stage !== 'complete' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSkipToResult}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <FastForward className="w-3 h-3" />
                  <span>Ready · View converted file</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Error State */
          <div className="w-full space-y-3 pt-2">
            <div className="flex items-center justify-center space-x-1.5 text-rose-600 dark:text-rose-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Conversion failed</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto">
              {error}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
