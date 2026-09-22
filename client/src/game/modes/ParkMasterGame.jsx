import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

export default function ParkMasterGame({
  levelId = 1,
  onLevelComplete,
  onOpenHub,
}) {
  const [level, setLevel] = useState(null);
  const [currentLvlId, setCurrentLvlId] = useState(levelId);
  const [paths, setPaths] = useState({}); // carId -> [{x, y}]
  const [activeCarId, setActiveCarId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [carPositions, setCarPositions] = useState({}); // carId -> {x, y, angle}
  const [statusMessage, setStatusMessage] = useState('Draw lines from each car to its matching colored "P" spot!');
  const [crashState, setCrashState] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    fetchLevel(currentLvlId);
  }, [currentLvlId]);

  const fetchLevel = async (id) => {
    try {
      const res = await fetch(`/api/modes/park_master/levels/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLevel(data.level);
        resetLevel(data.level);
      }
    } catch (err) {
      console.error('Failed to load park master level', err);
    }
  };

  const resetLevel = (lvl = level) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPaths({});
    setActiveCarId(null);
    setIsSimulating(false);
    setCrashState(false);
    setStatusMessage('Draw paths connecting each car to its matching "P" bay!');

    if (lvl) {
      const initialPos = {};
      lvl.cars.forEach((c) => {
        initialPos[c.id] = { x: c.startX, y: c.startY, angle: -Math.PI / 2, progress: 0 };
      });
      setCarPositions(initialPos);
    }
  };

  // Pointer drawing handlers
  const handlePointerDown = (e) => {
    if (isSimulating || !level) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked near a car's starting position
    const clickedCar = level.cars.find((c) => {
      const dist = Math.hypot(c.startX - x, c.startY - y);
      return dist < 36;
    });

    if (clickedCar) {
      audio.playClick();
      setActiveCarId(clickedCar.id);
      setPaths((prev) => ({
        ...prev,
        [clickedCar.id]: [{ x: clickedCar.startX, y: clickedCar.startY }],
      }));
    }
  };

  const handlePointerMove = (e) => {
    if (!activeCarId || isSimulating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));

    setPaths((prev) => {
      const curr = prev[activeCarId] || [];
      const last = curr[curr.length - 1];
      if (!last || Math.hypot(last.x - x, last.y - y) > 6) {
        return {
          ...prev,
          [activeCarId]: [...curr, { x, y }],
        };
      }
      return prev;
    });
  };

  const handlePointerUp = () => {
    if (!activeCarId) return;
    const canvas = canvasRef.current;
    const targetCar = level.cars.find((c) => c.id === activeCarId);

    if (canvas && targetCar) {
      const curr = paths[activeCarId] || [];
      const last = curr[curr.length - 1];
      if (last) {
        const distToTarget = Math.hypot(last.x - targetCar.targetX, last.y - targetCar.targetY);
        if (distToTarget < 45) {
          // Snap to target bay
          setPaths((prev) => ({
            ...prev,
            [activeCarId]: [...curr, { x: targetCar.targetX, y: targetCar.targetY }],
          }));
          audio.playClick();
        }
      }
    }
    setActiveCarId(null);
  };

  // Launch simulation
  const handleLaunch = () => {
    if (isSimulating || !level) return;
    const allDrawn = level.cars.every((c) => paths[c.id] && paths[c.id].length > 5);
    if (!allDrawn) {
      setStatusMessage('Draw paths for ALL cars first before launching!');
      return;
    }

    setIsSimulating(true);
    setCrashState(false);
    setStatusMessage('Driving... Watch for intersections!');
    audio.playDriveOff();

    const carStates = {};
    level.cars.forEach((c) => {
      carStates[c.id] = {
        pointIndex: 0,
        subT: 0,
        arrived: false,
        x: c.startX,
        y: c.startY,
        angle: -Math.PI / 2,
      };
    });

    const speed = 2.8;

    const animateLoop = () => {
      let allDone = true;
      const updatedPos = {};

      // Advance each car along its points
      for (const car of level.cars) {
        const state = carStates[car.id];
        const path = paths[car.id];

        if (state.arrived || !path || state.pointIndex >= path.length - 1) {
          state.arrived = true;
          updatedPos[car.id] = { x: state.x, y: state.y, angle: state.angle };
          continue;
        }

        allDone = false;
        const p1 = path[state.pointIndex];
        const p2 = path[state.pointIndex + 1];
        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;

        state.subT += speed / segDist;
        if (state.subT >= 1) {
          state.pointIndex++;
          state.subT = 0;
        }

        const curP1 = path[state.pointIndex] || p2;
        const curP2 = path[state.pointIndex + 1] || curP1;
        state.x = curP1.x + (curP2.x - curP1.x) * state.subT;
        state.y = curP1.y + (curP2.y - curP1.y) * state.subT;
        state.angle = Math.atan2(curP2.y - curP1.y, curP2.x - curP1.x);

        updatedPos[car.id] = { x: state.x, y: state.y, angle: state.angle };
      }

      setCarPositions({ ...updatedPos });

      // Collision check between any two moving cars
      for (let i = 0; i < level.cars.length; i++) {
        for (let j = i + 1; j < level.cars.length; j++) {
          const id1 = level.cars[i].id;
          const id2 = level.cars[j].id;
          const p1 = updatedPos[id1];
          const p2 = updatedPos[id2];
          if (p1 && p2) {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 30) {
              // Crash!
              audio.playCrash();
              audio.playHorn();
              setIsSimulating(false);
              setCrashState(true);
              setStatusMessage('💥 CARS CRASHED! Redraw curves to adjust their timing.');
              return;
            }
          }
        }
      }

      // Obstacle collision check
      for (const car of level.cars) {
        const p = updatedPos[car.id];
        if (p) {
          for (const obs of level.obstacles || []) {
            if (Math.hypot(p.x - obs.x, p.y - obs.y) < obs.radius + 14) {
              audio.playCrash();
              setIsSimulating(false);
              setCrashState(true);
              setStatusMessage('💥 HIT OBSTACLE! Steer around barriers.');
              return;
            }
          }
        }
      }

      if (!allDone) {
        animRef.current = requestAnimationFrame(animateLoop);
      } else {
        // All arrived safely!
        setIsSimulating(false);
        audio.playVictory();
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        setStatusMessage('🎉 PERFECT PARK! All vehicles reached their bays safely!');
        onLevelComplete({
          mode: 'park_master',
          levelId: currentLvlId,
          levelName: level.name,
          moves: 1,
          stars: 3,
          timeSeconds: 5,
        });
      }
    };

    animRef.current = requestAnimationFrame(animateLoop);
  };

  const allCarsDrawn = level ? level.cars.every((c) => paths[c.id] && paths[c.id].length > 4) : false;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 pt-16 pb-20 select-none bg-slate-950 overflow-hidden">
      {/* Background parking grid texture */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Level Info Banner */}
      <div className="glass-panel px-4 py-2 rounded-2xl border border-amber-500/30 text-center mb-2 z-10 flex items-center gap-3">
        <span className="text-xl">✏️</span>
        <div>
          <h2 className="text-sm sm:text-base font-black text-white">
            Park Master: {level ? `Level ${level.id} - ${level.name}` : 'Loading...'}
          </h2>
          <p className="text-[11px] font-semibold text-amber-300">{statusMessage}</p>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className="relative bg-slate-900/90 rounded-3xl border-2 border-slate-700/80 shadow-2xl overflow-hidden cursor-crosshair"
        style={{ width: 340, height: 480 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} width={340} height={480} className="absolute inset-0 pointer-events-none" />

        {/* 1. Target Parking Bays (P) at the top */}
        {level?.cars.map((car) => (
          <div
            key={`bay_${car.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center shadow-lg"
            style={{
              left: car.targetX,
              top: car.targetY,
              borderColor: car.color,
              backgroundColor: `${car.color}20`,
            }}
          >
            <span className="text-sm font-black text-white">P</span>
            <span
              className="text-[9px] font-black uppercase px-1 rounded"
              style={{ backgroundColor: car.color, color: '#fff' }}
            >
              Bay
            </span>
          </div>
        ))}

        {/* 2. Obstacles */}
        {level?.obstacles?.map((obs, idx) => (
          <div
            key={`obs_${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs shadow-md"
            style={{
              left: obs.x,
              top: obs.y,
              width: obs.radius * 2,
              height: obs.radius * 2,
            }}
          >
            🚧
          </div>
        ))}

        {/* 3. Drawn SVG Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {level?.cars.map((car) => {
            const pts = paths[car.id];
            if (!pts || pts.length < 2) return null;
            const d = `M ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
            return (
              <g key={`path_${car.id}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={car.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8,6"
                  className="opacity-75"
                />
                <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill={car.color} />
              </g>
            );
          })}
        </svg>

        {/* 4. Cars */}
        {level?.cars.map((car) => {
          const pos = carPositions[car.id] || { x: car.startX, y: car.startY, angle: -Math.PI / 2 };
          return (
            <div
              key={`car_${car.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-14 rounded-xl shadow-xl border border-white/30 flex flex-col items-center justify-between p-1 transition-transform"
              style={{
                left: pos.x,
                top: pos.y,
                backgroundColor: car.color,
                transform: `translate(-50%, -50%) rotate(${pos.angle + Math.PI / 2}rad)`,
              }}
            >
              {/* Windshield */}
              <div className="w-5 h-3 bg-slate-900/80 rounded-sm mt-1" />
              {/* Headlights */}
              <div className="flex justify-between w-full px-0.5">
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Launch & Reset Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-auto">
        <button
          onClick={() => {
            audio.playClick();
            resetLevel();
          }}
          className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white border-slate-700/80 active:scale-95 shadow-xl cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span>Reset Lines</span>
        </button>

        <button
          onClick={handleLaunch}
          disabled={!allCarsDrawn || isSimulating}
          className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-wide transition-all shadow-xl ${
            allCarsDrawn && !isSimulating
              ? 'btn-game-primary text-white cursor-pointer active:scale-95'
              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch Cars!</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            const nextLvl = currentLvlId + 1 <= 8 ? currentLvlId + 1 : 1;
            setCurrentLvlId(nextLvl);
          }}
          className="glass-panel px-3.5 py-3 rounded-2xl flex items-center gap-1 text-sm font-bold text-sky-400 hover:text-white border-slate-700/80 active:scale-95 shadow-xl cursor-pointer"
          title="Next Level"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
