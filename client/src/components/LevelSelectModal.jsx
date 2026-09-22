import React, { useState } from 'react';
import { X, Star, Lock, Car, CheckCircle2, Plus } from 'lucide-react';
import audio from '../game/AudioEngine';

export default function LevelSelectModal({
  isOpen,
  onClose,
  levels = [],
  customLevels = [],
  currentLevelId,
  onSelectLevel,
  onOpenEditor,
}) {
  const [activeTab, setActiveTab] = useState('campaign');

  if (!isOpen) return null;

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'tutorial':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'easy':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'hard':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'expert':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'master':
      case 'grandmaster':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl border border-slate-700/80 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚦</span>
            <div>
              <h2 className="game-title text-xl sm:text-2xl font-black text-white">SELECT LEVEL</h2>
              <p className="text-xs text-slate-400">Choose a parking challenge</p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="btn-game-icon p-2 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 flex gap-2 border-b border-slate-800/60 bg-slate-900/40">
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('campaign');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'campaign'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Campaign ({levels.length})
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('custom');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Puzzles ({customLevels.length})
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {activeTab === 'campaign' ? (
            levels.map((lvl) => {
              const isCurrent = currentLevelId === lvl.id;
              const isCompleted = lvl.completed;

              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    audio.playClick();
                    onSelectLevel(lvl.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 ${
                    isCurrent
                      ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/40'
                      : isCompleted
                      ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg font-black text-white">#{lvl.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                        lvl.difficulty
                      )}`}
                    >
                      {lvl.difficulty}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-300 truncate mb-3">{lvl.name}</p>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/80">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            (lvl.stars || 0) >= s ? 'fill-current text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Cars count */}
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Car className="w-3 h-3 text-sky-400" />
                      <span>{lvl.vehiclesCount}</span>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <>
              {/* Add Custom Level Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  onClose();
                  onOpenEditor();
                }}
                className="p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center gap-2 text-emerald-400 transition-all min-h-[120px]"
              >
                <Plus className="w-7 h-7" />
                <span className="text-xs font-bold">Build Puzzle</span>
              </button>

              {customLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    audio.playClick();
                    onSelectLevel(lvl.id, true);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl border bg-slate-800/60 border-slate-700 hover:border-emerald-500 text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-black text-emerald-400">CUSTOM</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-emerald-300 bg-emerald-500/20 border-emerald-500/30">
                      User Made
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 truncate mb-3">{lvl.name}</p>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                    <span>{lvl.gridSize.rows}x{lvl.gridSize.cols}</span>
                    <div className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-sky-400" />
                      <span>{lvl.vehicles.length}</span>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
