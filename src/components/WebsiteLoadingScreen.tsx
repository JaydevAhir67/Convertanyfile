import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { ThreeDRocketCanvas } from './ThreeDRocketCanvas';
import { SoundEngine } from '../services/soundEffects';

interface WebsiteLoadingScreenProps {
  onComplete: () => void;
  isDarkMode?: boolean;
}

export const WebsiteLoadingScreen: React.FC<WebsiteLoadingScreenProps> = ({
  onComplete,
  isDarkMode = true
}) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    // Attempt graceful unlock & sound
    SoundEngine.unlockAudioContext().then(() => {
      SoundEngine.playFileSelectedSound();
    }).catch(() => {});

    // Fast 850ms accelerated initialization sequence
    const t1 = setTimeout(() => {
      setProgress(75);
    }, 280);

    const t2 = setTimeout(() => {
      setProgress(100);
      setFading(true);
    }, 650);

    const t3 = setTimeout(() => {
      onComplete();
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(onComplete, 120);
  };

  return (
    <div
      id="website-initial-loader"
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-opacity duration-300 cursor-pointer select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-xs text-center space-y-4">
        {/* Brand Mark */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
            ConvertAnyFile
          </span>
        </div>

        {/* 3D Rocket Preview */}
        <div className="w-48 h-36 relative flex items-center justify-center">
          <ThreeDRocketCanvas
            progress={progress}
            stage="almost_done"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Status Line */}
        <div className="space-y-1.5 w-full">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Initializing client-side engine...
          </p>
          <div className="w-36 mx-auto bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 dark:bg-white h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
