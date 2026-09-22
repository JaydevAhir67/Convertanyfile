import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, Flame, Zap, Cpu, CheckCircle2, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { SoundEngine } from '../services/soundEffects';

export interface ConversionRocketModalProps {
  progress: number;
  filename?: string;
  targetFormat?: string;
  stageText?: string;
  mode?: 'fixed' | 'absolute';
}

export const ConversionRocketModal: React.FC<ConversionRocketModalProps> = ({
  progress,
  filename = 'document',
  targetFormat = 'CONVERT',
  stageText,
  mode = 'fixed'
}) => {
  const isComplete = progress >= 100;
  const [hasLaunched, setHasLaunched] = useState(false);
  const [isMuted, setIsMuted] = useState(() => SoundEngine.getMuted());

  // Futuristic high-speed whoosh sound on rocket appearance
  useEffect(() => {
    SoundEngine.playRocketAppearanceSound();
  }, []);

  // When reaching 100%, trigger blast-off hyper-drive transition sound
  useEffect(() => {
    if (progress >= 100 && !hasLaunched) {
      setHasLaunched(true);
      SoundEngine.playRocketBlastOffSound();
    }
  }, [progress, hasLaunched]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    SoundEngine.setMuted(next);
  };

  const defaultStageDescription = (p: number) => {
    if (p < 25) return 'Parsing binary byte stream & validating structure...';
    if (p < 55) return 'Propelling data through transformation pipeline...';
    if (p < 85) return `Transcoding and rendering ${targetFormat.toUpperCase()} stream...`;
    return 'Finalizing executive layout & assembling output...';
  };

  const currentStage = stageText || defaultStageDescription(progress);

  const containerClasses =
    mode === 'fixed'
      ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md'
      : 'absolute inset-0 z-40 rounded-3xl flex items-center justify-center p-6 bg-slate-950/92 backdrop-blur-md';

  return (
    <AnimatePresence>
      <motion.div
        id="conversion-processing-overlay"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`${containerClasses} select-none overflow-hidden`}
      >
        {/* Hyperspeed Cosmic Star Streaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -60, opacity: 0 }}
              animate={{
                y: ['0vh', '110vh'],
                opacity: [0, 0.9, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 0.7 + (i % 4) * 0.25,
                delay: (i * 0.08) % 1.2,
                ease: 'linear'
              }}
              className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-red-500 to-transparent"
              style={{
                left: `${(i * 6.25) + 2}%`,
                height: `${40 + (i % 5) * 25}px`
              }}
            />
          ))}

          {/* Deep Ambient Plasma Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/25 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
        </div>

        {/* Central Spacecraft Module Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-md w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 backdrop-blur-xl"
        >
          {/* Sound FX Toggle in Top Right */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
            )}
          </button>

          {/* Top Stage Tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 text-[11px] font-mono font-bold mb-5 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>High-Speed Engine Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Center Stage Rocket Launch Pad */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Holographic Radar Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="w-32 h-32 rounded-full border-2 border-dashed border-red-500/30 border-t-red-500 border-r-transparent flex items-center justify-center"
            />

            {/* Pulsing Concentric Outer Ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute w-36 h-36 rounded-full border border-red-600/20 pointer-events-none"
            />

            {/* The Rocket Spacecraft */}
            <motion.div
              animate={
                hasLaunched
                  ? {
                      y: -650,
                      scale: 1.35,
                      opacity: 0,
                      transition: { duration: 0.55, ease: [0.45, 0, 0.55, 1] }
                    }
                  : {
                      y: [-4, 4, -4],
                      rotate: [-1, 1, -1],
                      transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                    }
              }
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="relative">
                {/* Rocket Shell Pod */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/70 border border-red-300/40">
                  <Rocket className="w-9 h-9 text-white -rotate-45 drop-shadow-[0_2px_10px_rgba(255,255,255,0.9)]" />
                </div>

                {/* Strobe Navigation Beacon */}
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-white/50" />

                {/* Roaring Dynamic Thruster Plume */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <motion.div
                    animate={{
                      height: hasLaunched ? [50, 90] : [26, 42, 26],
                      opacity: [0.85, 1, 0.85]
                    }}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                    className="w-5 bg-gradient-to-b from-red-500 via-orange-400 to-transparent rounded-full blur-[1px] shadow-[0_0_20px_#ef4444]"
                  />
                  <div className="absolute top-0 w-2.5 h-4 bg-gradient-to-b from-white via-yellow-200 to-transparent rounded-full" />
                </div>

                {/* Ejected Particle Sparks */}
                {[...Array(4)].map((_, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      y: [0, 30 + idx * 10],
                      x: [(idx % 2 === 0 ? 1 : -1) * (4 + idx * 3), (idx % 2 === 0 ? 1 : -1) * (12 + idx * 5)],
                      opacity: [1, 0],
                      scale: [1, 0.4]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.4 + idx * 0.1,
                      delay: idx * 0.08
                    }}
                    className="absolute -bottom-7 left-1/2 w-1.5 h-1.5 rounded-full bg-orange-300 shadow-[0_0_8px_#f97316]"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Target Format Heading */}
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Transcoding to <span className="text-red-400 uppercase font-mono">{targetFormat}</span>
          </h3>

          <p className="text-xs text-slate-400 mt-1 truncate max-w-[300px] font-mono bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
            {filename}
          </p>

          {/* Progress Bar & Stage Indicator */}
          <div className="w-full mt-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 text-[11px] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="truncate max-w-[260px] text-left font-medium">{currentStage}</span>
              </span>
              <span className="font-extrabold text-red-400 text-sm">{progress}%</span>
            </div>

            {/* Styled Neon Progress Bar */}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner relative">
              <motion.div
                initial={{ width: '5%' }}
                animate={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 h-full rounded-full shadow-[0_0_15px_rgba(239,68,68,0.9)] relative overflow-hidden"
              >
                {/* Shimmer light sweep */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 font-medium w-full">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-red-400" />
              <span>Multi-Core Worker</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Bit-Exact Verification</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Zero Egress</span>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
