import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  X,
  Sparkles,
  Rocket,
  Zap,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { SoundEngine } from '../services/soundEffects';

interface SoundFxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SoundItem {
  id: string;
  name: string;
  category: 'Rocket & Engines' | 'Speed & Warps' | 'Mission & Feedback';
  duration: string;
  description: string;
  action: () => void;
  isContinuous?: boolean;
}

export const SoundFxModal: React.FC<SoundFxModalProps> = ({ isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(() => SoundEngine.getMuted());
  const [volume, setVolume] = useState(() => Math.round(SoundEngine.getVolume() * 100));
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isContinuousPlaying, setIsContinuousPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up continuous sound if user closes modal while playing
      SoundEngine.stopContinuousRocketHum();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleMute = async () => {
    await SoundEngine.unlockAudioContext();
    const next = !isMuted;
    setIsMuted(next);
    SoundEngine.setMuted(next);
    if (!next) {
      SoundEngine.playLaserPulseSound();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    SoundEngine.setVolume(val / 100);
  };

  const playSound = async (item: SoundItem) => {
    await SoundEngine.unlockAudioContext();
    if (item.isContinuous) {
      if (isContinuousPlaying) {
        SoundEngine.stopContinuousRocketHum();
        setIsContinuousPlaying(false);
        setPlayingId(null);
      } else {
        SoundEngine.startContinuousRocketHum();
        setIsContinuousPlaying(true);
        setPlayingId(item.id);
      }
      return;
    }

    setPlayingId(item.id);
    item.action();

    // Reset playing state after effect duration
    const timeout = item.duration.includes('4.5s')
      ? 4600
      : item.duration.includes('1.5s')
      ? 1600
      : 900;

    setTimeout(() => {
      setPlayingId((curr) => (curr === item.id ? null : curr));
    }, timeout);
  };

  const soundList: SoundItem[] = [
    {
      id: 'long_rocket',
      name: 'Long Rocket Engine Thruster Burn',
      category: 'Rocket & Engines',
      duration: '4.5s extended',
      description:
        'Sustained multi-stage rocket burn: sub-bass ignition pulse, turbulent brown noise exhaust, dynamic nozzle hiss & twin turbine whine.',
      action: () => SoundEngine.playLongRocketEngineSound(4.5)
    },
    {
      id: 'continuous_hum',
      name: 'Continuous Rocket Engine Hum',
      category: 'Rocket & Engines',
      duration: 'Looping thrust',
      isContinuous: true,
      description:
        'Continuous deep acoustic rocket propellant rumble that plays during document transcoding and long file conversions.',
      action: () => {}
    },
    {
      id: 'supersonic_whoosh',
      name: 'Supersonic Speed Appearance Whoosh',
      category: 'Rocket & Engines',
      duration: '0.8s',
      description:
        'Supersonic air displacement burst with ion turbine pitch glide and warp sparkle as the rocket appears.',
      action: () => SoundEngine.playRocketAppearanceSound()
    },
    {
      id: 'blast_off',
      name: 'Hyper-Drive Blast-Off (100% Launch)',
      category: 'Rocket & Engines',
      duration: '0.6s',
      description:
        'Sub-bass launch thump paired with accelerating high-velocity whistle into deep space.',
      action: () => SoundEngine.playRocketBlastOffSound()
    },
    {
      id: 'sonic_boom',
      name: 'Supersonic Sonic Boom (Mach Shockwave)',
      category: 'Speed & Warps',
      duration: '1.4s',
      description:
        'Atmospheric supersonic shock crack followed by deep low-frequency explosive ground shockwave rumble.',
      action: () => SoundEngine.playSonicBoomSound()
    },
    {
      id: 'warp_jump',
      name: 'Hyperdrive Warp Jump',
      category: 'Speed & Warps',
      duration: '1.0s',
      description:
        'Ascending resonant laser glissando collapsing into relativistic warp speed.',
      action: () => SoundEngine.playWarpJumpSound()
    },
    {
      id: 'laser_pulse',
      name: 'Speed Laser Pulse',
      category: 'Speed & Warps',
      duration: '0.2s',
      description: 'Quick, high-energy tactical speed burst chirp.',
      action: () => SoundEngine.playLaserPulseSound()
    },
    {
      id: 'mission_success',
      name: 'Mission Success Chime',
      category: 'Mission & Feedback',
      duration: '0.9s',
      description:
        'Euphoric 4-tone ascending harmonic chord (C-E-G-C) triggered upon complete file generation.',
      action: () => SoundEngine.playSuccessChimeSound()
    },
    {
      id: 'payload_lock',
      name: 'Magnetic Payload Dock',
      category: 'Mission & Feedback',
      duration: '0.1s',
      description:
        'Tactile mechanical latch sound triggered during file drops and batch queue attachments.',
      action: () => SoundEngine.playPayloadLockSound()
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Rocket Sound Effects Station
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  Web Audio Synthesizer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                100% Client-Side procedural audio • Zero external audio file lag
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Controls: Volume & Master Mute */}
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">{volume}%</span>
          </div>

          <button
            onClick={handleToggleMute}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isMuted
                ? 'bg-red-950/40 border-red-800/80 text-red-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />}
            <span>{isMuted ? 'Muted' : 'Audio Active'}</span>
          </button>
        </div>

        {/* Soundboard List */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800/40 flex-1">
          {soundList.map((item) => {
            const isThisPlaying =
              item.isContinuous ? isContinuousPlaying : playingId === item.id;

            return (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex items-center justify-between gap-4 group"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {item.duration}
                    </span>
                    {item.id === 'long_rocket' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800/80 flex items-center gap-1">
                        <Rocket className="w-3 h-3 text-red-500 animate-bounce" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => playSound(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    isThisPlaying
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 ring-2 ring-red-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {isThisPlaying ? (
                    item.isContinuous ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Engine</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Playing...</span>
                      </>
                    )
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{item.isContinuous ? 'Start Loop' : 'Play Sound'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Multi-Stage Waveform Synthesis Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
