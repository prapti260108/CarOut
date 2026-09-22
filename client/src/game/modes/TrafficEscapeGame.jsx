import React, { useEffect, useRef, useState } from 'react';
import { Zap, RotateCcw, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

export default function TrafficEscapeGame({
  levelId = 1,
  onLevelComplete,
  onOpenHub,
}) {
  const [level, setLevel] = useState(null);
  const [currentLvlId, setCurrentLvlId] = useState(levelId);
  const [remainingCars, setRemainingCars] = useState(3);
  const [escapedCars, setEscapedCars] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Tap when you spot a gap in traffic to merge!');

  const canvasRef = useRef(null);
  const stateRef = useRef({
    highwayCars: [],
    mergingCar: null,
    trafficSpeed: 3.0,
    nextSpawn: 0,
    running: true,
  });

  useEffect(() => {
    fetchLevel(currentLvlId);
  }, [currentLvlId]);

  const fetchLevel = async (id) => {
    try {
      const res = await fetch(`/api/modes/traffic_escape/levels/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLevel(data.level);
        resetLevel(data.level);
      }
    } catch (err) {
      console.error('Failed to load traffic escape level', err);
    }
  };

  const resetLevel = (lvl = level) => {
    if (!lvl) return;
    setRemainingCars(lvl.playerCarsCount);
    setEscapedCars(0);
    setIsLaunching(false);
    setCrashed(false);
    setStatusMessage('Tap when you spot a gap in traffic to merge!');

    stateRef.current.highwayCars = [];
    stateRef.current.mergingCar = null;
    stateRef.current.trafficSpeed = lvl.speed || 3.0;
    stateRef.current.running = true;

    // Pre-populate some traffic cars across the highway
    const colors = lvl.trafficColors || ['#EF4444', '#3B82F6', '#10B981'];
    for (let i = 0; i < 4; i++) {
      stateRef.current.highwayCars.push({
        x: i * 110 + 20,
        y: 190,
        width: 48,
        height: 26,
        color: colors[i % colors.length],
      });
    }
  };

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const loop = () => {
      const state = stateRef.current;
      if (!state.running) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Road Background
      // Highway asphalt
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 160, canvas.width, 90);

      // Yellow dashed centerline
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.moveTo(0, 205);
      ctx.lineTo(canvas.width, 205);
      ctx.stroke();
      ctx.setLineDash([]);

      // Feeder lane from bottom
      ctx.fillStyle = '#334155';
      ctx.fillRect(145, 250, 60, canvas.height - 250);

      // Stop line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(145, 250);
      ctx.lineTo(205, 250);
      ctx.stroke();

      // 2. Move & Draw Highway Traffic
      state.nextSpawn += state.trafficSpeed;
      if (state.nextSpawn > (level?.gapMin || 120) + Math.random() * (level?.gapMax || 180)) {
        state.nextSpawn = 0;
        const colors = level?.trafficColors || ['#EF4444', '#3B82F6', '#10B981'];
        state.highwayCars.push({
          x: -60,
          y: 192,
          width: 50,
          height: 26,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      for (let i = state.highwayCars.length - 1; i >= 0; i--) {
        const car = state.highwayCars[i];
        car.x += state.trafficSpeed;

        // Draw car
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(car.x, car.y, car.width, car.height, 6);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(car.x + 28, car.y + 3, 10, car.height - 6);

        // Remove off-screen cars
        if (car.x > canvas.width + 60) {
          state.highwayCars.splice(i, 1);
        }
      }

      // 3. Move & Draw Merging Car
      if (state.mergingCar) {
        const m = state.mergingCar;
        m.y -= 5.5; // Accelerate forward across the highway

        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.roundRect(m.x, m.y, m.width, m.height, 6);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(m.x + 4, m.y + 6, m.width - 8, 10);

        // Check collision between merging car and any highway car
        for (const h of state.highwayCars) {
          if (
            m.x < h.x + h.width &&
            m.x + m.width > h.x &&
            m.y < h.y + h.height &&
            m.y + m.height > h.y
          ) {
            // CRASH!
            audio.playCrash();
            audio.playHorn();
            state.mergingCar = null;
            setIsLaunching(false);
            setCrashed(true);
            setStatusMessage('💥 TRAFFIC COLLISION! Watch the gaps and tap carefully.');
            return;
          }
        }

        // Successfully cleared the highway!
        if (m.y < 80) {
          audio.playDriveOff();
          state.mergingCar = null;
          setIsLaunching(false);
          setEscapedCars((prev) => {
            const nextCount = prev + 1;
            if (nextCount >= (level?.playerCarsCount || 3)) {
              // Level Victory!
              audio.playVictory();
              try {
                confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
              } catch (e) {}
              setStatusMessage('🎉 ALL CARS MERGED SAFELY! Perfect timing!');
              onLevelComplete({
                mode: 'traffic_escape',
                levelId: currentLvlId,
                levelName: level.name,
                moves: nextCount,
                stars: 3,
                timeSeconds: 10,
              });
            } else {
              setStatusMessage(`Great merge! ${level.playerCarsCount - nextCount} more cars to go.`);
            }
            return nextCount;
          });
        }
      }

      // 4. Draw Waiting Queue at the stop line
      const waitingCount = remainingCars;
      for (let i = 0; i < Math.min(waitingCount, 3); i++) {
        if (i === 0 && isLaunching) continue; // front car is moving
        const qY = 270 + i * 54;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(160, qY, 30, 46, 6);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(164, qY + 8, 22, 12);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [level, remainingCars, isLaunching, currentLvlId]);

  // Tap to launch the front car into traffic
  const handleTapToMerge = () => {
    if (isLaunching || crashed || remainingCars <= 0) return;

    audio.playClick();
    setIsLaunching(true);
    setRemainingCars((prev) => prev - 1);

    stateRef.current.mergingCar = {
      x: 160,
      y: 260,
      width: 30,
      height: 48,
      color: '#38bdf8',
    };
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center p-3 pt-16 pb-20 select-none bg-slate-950 overflow-hidden cursor-pointer"
      onClick={handleTapToMerge}
    >
      {/* Background road texture */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Level Info Banner */}
      <div className="glass-panel px-4 py-2 rounded-2xl border border-rose-500/30 text-center mb-3 z-10 flex items-center gap-3 pointer-events-none">
        <span className="text-xl">🚦</span>
        <div>
          <h2 className="text-sm sm:text-base font-black text-white">
            Traffic Escape: {level ? `Level ${level.id} - ${level.name}` : 'Loading...'}
          </h2>
          <p className="text-[11px] font-semibold text-rose-300">{statusMessage}</p>
        </div>
      </div>

      {/* Main 2D Canvas Highway */}
      <div
        className="relative bg-slate-900/90 rounded-3xl border-2 border-slate-700/80 shadow-2xl overflow-hidden"
        style={{ width: 350, height: 460 }}
      >
        <canvas ref={canvasRef} width={350} height={460} className="w-full h-full" />

        {/* Big Tap to Merge prompt button overlay */}
        {!crashed && remainingCars > 0 && !isLaunching && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none animate-pulse">
            <div className="glass-panel px-5 py-2.5 rounded-2xl border border-sky-400/50 bg-sky-500/20 text-sky-300 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>TAP ANYWHERE TO MERGE</span>
            </div>
          </div>
        )}

        {/* Crash alert overlay */}
        {crashed && (
          <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <ShieldAlert className="w-14 h-14 text-rose-400 mb-2 animate-bounce" />
            <h3 className="game-title text-xl font-black text-white mb-1">TRAFFIC CRASH!</h3>
            <p className="text-xs text-rose-200 mb-4">You mistimed the highway gap.</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                audio.playClick();
                resetLevel();
              }}
              className="btn-game-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Reset & Next Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            audio.playClick();
            resetLevel();
          }}
          className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white border-slate-700/80 active:scale-95 shadow-xl cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span>Reset</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            audio.playClick();
            const nextLvl = currentLvlId + 1 <= 4 ? currentLvlId + 1 : 1;
            setCurrentLvlId(nextLvl);
          }}
          className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-1.5 text-sm font-bold text-rose-400 hover:text-white border-slate-700/80 active:scale-95 shadow-xl cursor-pointer"
        >
          <span>Next Level</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
