import React, { useEffect, useState, useRef } from 'react';
import { Rocket, Shield, Cpu, Zap, Flame, Volume2, Sparkles } from 'lucide-react';
import { SoundEngine } from '../services/soundEffects';

interface WebsiteLoadingScreenProps {
  onComplete: () => void;
}

export const WebsiteLoadingScreen: React.FC<WebsiteLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [phaseText, setPhaseText] = useState('Rocket on Launchpad • Ready for Ignition');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSoundIgnited, setIsSoundIgnited] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Trigger rocket launch with guaranteed Web Audio unlock on user gesture
  const triggerRocketLaunch = async () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    setIsSoundIgnited(true);

    try {
      // 1. Synchronously unlock and resume Web Audio Context on the direct user gesture
      await SoundEngine.unlockAudioContext();
      // 2. Play supersonic appearance sound
      SoundEngine.playRocketAppearanceSound();
    } catch {}

    // Start accelerated countdown to blast-off
    setPhaseText('Igniting Core Thrusters & Supersonic Decoders...');
    setProgress(45);

    setTimeout(() => {
      setProgress(85);
      setPhaseText('Mach 5 Relativistic Transition...');
    }, 280);

    setTimeout(() => {
      setProgress(100);
      setPhaseText('Liftoff Confirmed — Entering ConvertAnyFile!');
      setIsLaunching(true);
      try {
        SoundEngine.playRocketBlastOffSound();
      } catch {}

      setTimeout(() => {
        onComplete();
      }, 500);
    }, 600);
  };

  // Passive auto-launch timer if user doesn't click after 3.8 seconds
  useEffect(() => {
    // Attempt gentle unlock on mount in case browser allows it
    SoundEngine.unlockAudioContext().then(() => {
      SoundEngine.playRocketAppearanceSound();
    }).catch(() => {});

    const autoTimer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setProgress(60);
        setPhaseText('Auto-launching ConvertAnyFile...');

        setTimeout(() => {
          setProgress(100);
          setIsLaunching(true);
          try {
            SoundEngine.playRocketBlastOffSound();
          } catch {}

          setTimeout(() => {
            onComplete();
          }, 450);
        }, 400);
      }
    }, 3800);

    return () => clearTimeout(autoTimer);
  }, [onComplete]);

  return (
    <div
      id="website-initial-loader"
      onClick={triggerRocketLaunch}
      onTouchStart={triggerRocketLaunch}
      className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
    >
      {/* Dynamic Cosmic Starfield & Speed Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Speed lines */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-red-500/60 to-transparent animate-star-stream"
            style={{
              left: `${i * 6.25 + 3}%`,
              top: '-50px',
              height: `${60 + (i % 5) * 35}px`,
              animationDelay: `${(i * 0.12).toFixed(2)}s`,
              animationDuration: `${0.8 + (i % 4) * 0.25}s`
            }}
          />
        ))}

        {/* Ambient Red Nebula Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-rose-500/20 rounded-full blur-[70px] pointer-events-none" />
      </div>

      {/* Main Rocket Launch Centerpiece */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-in ${
          isLaunching ? '-translate-y-96 scale-125 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Rocket Container */}
        <div className="relative mb-6">
          {/* Circular Orbit Ring */}
          <div
            className="w-36 h-36 rounded-full border border-red-500/30 border-dashed flex items-center justify-center animate-spin"
            style={{ animationDuration: '14s' }}
          >
            <div className="w-full h-full rounded-full border border-red-500/10" />
          </div>

          {/* Rocket Core Graphic */}
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-rocket-bob">
            {/* SVG Rocket */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/50 border border-red-400/40">
                <Rocket className="w-9 h-9 text-white -rotate-45 drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]" />
              </div>

              {/* Glowing Cockpit Pip */}
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-ping" />

              {/* Animated Thruster Plasma Flame */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                {/* Outer Red Flame */}
                <div
                  className={`w-5 bg-gradient-to-b from-red-500 via-orange-500 to-transparent rounded-full blur-[1px] ${
                    isSoundIgnited ? 'h-12 animate-pulse scale-125' : 'h-8 animate-rocket-thrust'
                  }`}
                />
                {/* Inner White/Yellow Plasma Core */}
                <div className="absolute top-0 w-2.5 h-4 bg-gradient-to-b from-white via-yellow-300 to-transparent rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand & Loading Titles */}
        <div className="text-center max-w-sm px-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-700/50 text-red-400 text-xs font-mono font-semibold mb-3 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>ConvertAnyFile Red Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5 font-sans">
            <span>Convert</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-orange-400">
              AnyFile
            </span>
          </h2>

          <p className="text-xs text-slate-400 mt-1 font-medium">
            Universal In-Browser Processing & Conversion
          </p>

          {/* Interactive Ignition Button: Guarantees Audio Plays on Click */}
          <div className="mt-5">
            <button
              type="button"
              id="launch-rocket-ignition-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerRocketLaunch();
              }}
              className="group relative inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 text-white font-bold text-xs shadow-xl shadow-red-600/40 hover:shadow-red-500/60 hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/50 cursor-pointer animate-pulse"
            >
              <Volume2 className="w-4 h-4 mr-2 text-yellow-300" />
              <span>IGNITE ROCKET WITH SOUND</span>
              <Rocket className="w-3.5 h-3.5 ml-2 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
              (or click anywhere on screen to launch)
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-4 w-64 sm:w-80 mx-auto">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="truncate max-w-[200px] text-slate-300">{phaseText}</span>
              <span className="font-bold text-red-400">{progress}%</span>
            </div>

            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-full h-2 p-0.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Engine Specs Badges */}
          <div className="flex items-center justify-center gap-4 mt-5 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-red-400" />
              <span>100% Client-Side</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Zero Server Latency</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>WebAssembly Speed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sound FX Indicator */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
        <Volume2 className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span>Audio Engine Ready (Click to Ignite)</span>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono transition-colors"
      >
        Skip Launch &rarr;
      </button>
    </div>
  );
};
