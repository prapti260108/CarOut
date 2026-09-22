import React, { useEffect, useState } from 'react';
import { Layers, RotateCcw, ArrowRight, CheckCircle2, AlertOctagon, Sparkles } from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

export default function CarMatchGame({
  levelId = 1,
  onLevelComplete,
  onOpenHub,
}) {
  const [level, setLevel] = useState(null);
  const [currentLvlId, setCurrentLvlId] = useState(levelId);
  const [boardCars, setBoardCars] = useState([]);
  const [dock, setDock] = useState([]); // Max 7 slots
  const [statusMessage, setStatusMessage] = useState('Tap cars to dock them. Match 3 of the same color to clear!');
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    fetchLevel(currentLvlId);
  }, [currentLvlId]);

  const fetchLevel = async (id) => {
    try {
      const res = await fetch(`/api/modes/car_match/levels/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLevel(data.level);
        resetLevel(data.level);
      }
    } catch (err) {
      console.error('Failed to load car match level', err);
    }
  };

  const resetLevel = (lvl = level) => {
    if (!lvl) return;
    setBoardCars([...lvl.cars]);
    setDock([]);
    setIsGameOver(false);
    setStatusMessage('Tap cars to dock them. Match 3 of the same color to clear!');
  };

  // Move car from board to dock
  const handleCarClick = (car) => {
    if (dock.length >= 7 || isGameOver) return;

    audio.playClick();

    // Remove from board
    setBoardCars((prev) => prev.filter((c) => c.id !== car.id));

    // Add to dock, grouping matching colors
    setDock((prev) => {
      const nextDock = [...prev, car];
      // Group by color so identical cars sit adjacent
      nextDock.sort((a, b) => a.color.localeCompare(b.color));
      return nextDock;
    });
  };

  // Check 3-of-a-kind match in dock
  useEffect(() => {
    if (dock.length === 0) return;

    // Count colors
    const counts = {};
    dock.forEach((c) => {
      counts[c.color] = (counts[c.color] || 0) + 1;
    });

    // Check if any color has >= 3
    const matchedColor = Object.keys(counts).find((color) => counts[color] >= 3);

    if (matchedColor) {
      const timer = setTimeout(() => {
        audio.playStarPop(2);
        // Eliminate 3 of that color
        let removed = 0;
        setDock((prev) =>
          prev.filter((c) => {
            if (c.color === matchedColor && removed < 3) {
              removed++;
              return false;
            }
            return true;
          })
        );
        setStatusMessage('✨ 3-CAR MATCH! Dock slots cleared!');
      }, 350);

      return () => clearTimeout(timer);
    } else {
      // If dock has 7 cars and no match possible -> Game Over
      if (dock.length >= 7) {
        audio.playCrash();
        setIsGameOver(true);
        setStatusMessage('⚠️ DOCK OVERFLOW! 7 slots filled with no 3-matches.');
      }
    }
  }, [dock]);

  // Check win condition
  useEffect(() => {
    if (level && boardCars.length === 0 && dock.length === 0) {
      // Level cleared!
      audio.playVictory();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      setStatusMessage('🎉 PARKING LOT CLEARED! Perfect Triple Match!');
      onLevelComplete({
        mode: 'car_match',
        levelId: currentLvlId,
        levelName: level.name,
        moves: 1,
        stars: 3,
        timeSeconds: 12,
      });
    }
  }, [boardCars, dock, level]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 pt-16 pb-20 select-none bg-slate-950 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Level Info Banner */}
      <div className="glass-panel px-4 py-2 rounded-2xl border border-purple-500/30 text-center mb-3 z-10 flex items-center gap-3">
        <span className="text-xl">🎯</span>
        <div>
          <h2 className="text-sm sm:text-base font-black text-white">
            Car Match 3D: {level ? `Level ${level.id} - ${level.name}` : 'Loading...'}
          </h2>
          <p className="text-[11px] font-semibold text-purple-300">{statusMessage}</p>
        </div>
      </div>

      {/* Main Game Container */}
      <div
        className="relative bg-slate-900/90 rounded-3xl border-2 border-slate-700/80 shadow-2xl p-4 flex flex-col justify-between"
        style={{ width: 350, minHeight: 460 }}
      >
        {/* 1. Parking Lot Board of Cars */}
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <span className="text-xs text-slate-400 font-semibold mb-2 block">
            Parking Lot ({boardCars.length} Cars Left)
          </span>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[250px] overflow-y-auto w-full p-1">
            {boardCars.map((car) => (
              <button
                key={car.id}
                onClick={() => handleCarClick(car)}
                className="p-2.5 rounded-2xl border border-white/20 flex flex-col items-center justify-center gap-1 shadow-md transition-all hover:scale-105 active:scale-95 text-white"
                style={{ backgroundColor: car.color }}
              >
                <span className="text-lg">🚗</span>
                <span className="text-[10px] font-black truncate max-w-[60px]">{car.label}</span>
              </button>
            ))}

            {boardCars.length === 0 && (
              <div className="col-span-3 sm:col-span-4 py-8 text-center text-xs text-purple-300 font-black">
                ✨ Lot completely cleared!
              </div>
            )}
          </div>
        </div>

        {/* 2. Docking Tray (7 Slots) */}
        <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Matching Dock</span>
            </span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                dock.length >= 6
                  ? 'text-rose-400 bg-rose-500/20 border-rose-500/30 animate-pulse'
                  : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              }`}
            >
              {dock.length} / 7 Slots
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 w-full bg-slate-900/90 p-2 rounded-xl border border-slate-800 min-h-[58px]">
            {Array.from({ length: 7 }).map((_, slotIdx) => {
              const car = dock[slotIdx];

              return (
                <div
                  key={`dock_${slotIdx}`}
                  className={`w-9 h-11 rounded-xl border flex flex-col items-center justify-center text-xs shadow-inner transition-all ${
                    car
                      ? 'border-white/30 text-white shadow-md scale-105 animate-pop-in'
                      : 'border-slate-800 bg-slate-950/60 text-slate-700'
                  }`}
                  style={{
                    backgroundColor: car ? car.color : undefined,
                  }}
                >
                  {car ? <span>🚗</span> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Over Overflow Modal Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertOctagon className="w-14 h-14 text-rose-400 mb-2 animate-bounce" />
            <h3 className="game-title text-xl font-black text-white mb-1">DOCK OVERFLOW!</h3>
            <p className="text-xs text-slate-300 mb-4">No matching triplets in 7 slots.</p>
            <button
              onClick={() => {
                audio.playClick();
                resetLevel();
              }}
              className="btn-game-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg"
            >
              Retry Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Reset & Next Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-auto">
        <button
          onClick={() => {
            audio.playClick();
            resetLevel();
          }}
          className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white border-slate-700/80 active:scale-95 shadow-xl cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span>Reset</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            const nextLvl = currentLvlId + 1 <= 3 ? currentLvlId + 1 : 1;
            setCurrentLvlId(nextLvl);
          }}
          className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-1.5 text-sm font-bold text-purple-400 hover:text-white border-slate-700/80 active:scale-95 shadow-xl cursor-pointer"
        >
          <span>Next Level</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
