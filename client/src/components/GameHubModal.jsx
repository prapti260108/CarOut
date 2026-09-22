import React from 'react';
import { X, Car, Edit3, Bus, Zap, Layers, Play, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import audio from '../game/AudioEngine';

const MODE_ICONS = {
  Car: Car,
  Edit3: Edit3,
  Bus: Bus,
  Zap: Zap,
  Layers: Layers,
};

export default function GameHubModal({
  isOpen,
  onClose,
  modes = [],
  currentMode,
  onSelectMode,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl border border-sky-500/40 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="game-title text-xl sm:text-2xl font-black text-white tracking-wide">
                  CAR OUT ARCADE
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  5 Games in 1
                </span>
              </div>
              <p className="text-xs text-slate-400">Choose any game mode to play anytime</p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="btn-game-icon p-2.5 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modes Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((mode) => {
            const isCurrent = currentMode === mode.id;
            const IconComponent = MODE_ICONS[mode.icon] || Car;

            return (
              <div
                key={mode.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                  isCurrent
                    ? 'bg-gradient-to-br from-sky-950/60 to-slate-900/90 border-sky-400/80 shadow-xl shadow-sky-500/15 ring-2 ring-sky-400/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                {/* Background Accent Glow */}
                <div
                  className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: mode.color }}
                />

                <div>
                  {/* Top line with Icon & Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10"
                      style={{ backgroundColor: `${mode.color}25` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: mode.color }} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm"
                        style={{
                          backgroundColor: `${mode.color}15`,
                          borderColor: `${mode.color}40`,
                          color: mode.color,
                        }}
                      >
                        {mode.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-black text-white group-hover:text-sky-300 transition-colors">
                    {mode.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-2">{mode.tagline}</p>

                  {/* Description */}
                  <p className="text-xs text-slate-300/80 leading-relaxed mb-4">
                    {mode.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {mode.levelsCount} Progressive Levels
                  </span>

                  <button
                    onClick={() => {
                      audio.playClick();
                      onSelectMode(mode.id);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'btn-game-primary text-white shadow-md'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Playing Now
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Play Mode
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
