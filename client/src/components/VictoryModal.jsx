import React, { useEffect, useState } from 'react';
import { Star, Trophy, ArrowRight, RotateCcw, Grid, Coins } from 'lucide-react';
import audio from '../game/AudioEngine';

export default function VictoryModal({
  isOpen,
  data,
  onNextLevel,
  onReplay,
  onOpenLevels,
}) {
  const [animatedStars, setAnimatedStars] = useState(0);

  useEffect(() => {
    if (isOpen && data) {
      setAnimatedStars(0);
      const timers = [];
      for (let i = 1; i <= data.stars; i++) {
        const timer = setTimeout(() => {
          setAnimatedStars(i);
          audio.playStarPop(i);
        }, i * 350);
        timers.push(timer);
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const coinsEarned = data.stars * 25 + Math.max(0, 100 - data.moves * 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-sm sm:max-w-md p-6 rounded-3xl border border-sky-500/30 text-center relative overflow-hidden shadow-2xl">
        {/* Glowing aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy className="w-9 h-9 text-slate-900" />
        </div>

        <h2 className="game-title text-2xl sm:text-3xl font-black text-white tracking-wide">
          PARKING CLEARED!
        </h2>
        <p className="text-sm font-medium text-slate-300 mb-4">{data.levelName}</p>

        {/* 3-Star Rating Animation */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const isFilled = animatedStars >= starIdx;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-300 transform ${
                  isFilled
                    ? 'scale-110 rotate-0 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'scale-90 text-slate-700 opacity-40'
                }`}
              >
                <Star className={`w-12 h-12 ${isFilled ? 'fill-current' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Reward & Moves stats */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 font-semibold mb-0.5">Moves</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">{data.moves}</span>
              <span className="text-xs text-slate-500">/ {data.targetPar} par</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-amber-500/30 flex flex-col items-center">
            <span className="text-xs text-amber-400 font-semibold mb-0.5">Reward</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-black text-xl">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>+{coinsEarned}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => {
              audio.playClick();
              onNextLevel();
            }}
            className="btn-game-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-black text-white tracking-wide uppercase shadow-lg shadow-sky-500/30"
          >
            <span>Next Level</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onReplay();
              }}
              className="btn-game-icon flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onOpenLevels();
              }}
              className="btn-game-icon flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
            >
              <Grid className="w-4 h-4 text-sky-400" />
              <span>Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
