import React, { useRef, useState, useEffect } from 'react';
import { Settings, RotateCcw, Paintbrush, ChevronLeft, ChevronRight } from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

// 15 Progressive Levels from Easy to Challenging
// Ground level calibrated to ~60% height (Y = 480) matching screenshot media_1790068325214.png
// Right-most platform automatically extends to right: 0 (100% full screen width) with ZERO gap!
const LEVELS = {
  // Level 1: Super easy straight bridge
  1: {
    title: 'Level 1',
    description: 'Straight Bridge',
    maxInk: 400,
    carStart: { x: 45, y: 463 },
    flag: { x: 330, y: 480 },
    platforms: [
      { x: 0, y: 480, width: 125, height: 400 },
      { x: 250, y: 480, width: 200, height: 400 },
    ],
    guide: [
      { x: 120, y: 480 },
      { x: 255, y: 480 },
    ],
  },
  // Level 2: Wide valley
  2: {
    title: 'Level 2',
    description: 'Wide Valley',
    maxInk: 480,
    carStart: { x: 40, y: 463 },
    flag: { x: 335, y: 480 },
    platforms: [
      { x: 0, y: 480, width: 95, height: 400 },
      { x: 265, y: 480, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 3: Gentle step up
  3: {
    title: 'Level 3',
    description: 'Gentle Slope Up',
    maxInk: 480,
    carStart: { x: 40, y: 493 },
    flag: { x: 335, y: 445 },
    platforms: [
      { x: 0, y: 510, width: 110, height: 400 },
      { x: 250, y: 445, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 4: Matches Screenshot media_1790068325214.png
  // Twin gaps with raised island plateau in the middle
  4: {
    title: 'Level 4',
    description: 'Twin Gaps with Island',
    maxInk: 550,
    carStart: { x: 40, y: 463 },
    flag: { x: 340, y: 480 },
    platforms: [
      { x: 0, y: 480, width: 105, height: 400 },
      { x: 165, y: 480, width: 80, height: 400 },
      { x: 280, y: 480, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 5: Matches Screenshot 1/4 (media_1790067123925.png)
  // Step up cliff with dotted triangle ramp guide ◢
  5: {
    title: 'Level 5',
    description: 'Climb the Cliff',
    maxInk: 520,
    carStart: { x: 40, y: 493 },
    flag: { x: 340, y: 420 },
    platforms: [
      { x: 0, y: 510, width: 180, height: 400 },
      { x: 255, y: 420, width: 200, height: 400 },
    ],
    guideRamp: {
      startX: 170,
      startY: 510,
      endX: 255,
      endY: 420,
    },
  },
  // Level 6: Matches Screenshot media_1790068379005.png
  // High plateau ascent with crackers celebration
  6: {
    title: 'Level 6',
    description: 'Grand Ascent',
    maxInk: 600,
    carStart: { x: 40, y: 493 },
    flag: { x: 340, y: 430 },
    platforms: [
      { x: 0, y: 510, width: 170, height: 400 },
      { x: 250, y: 430, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 7: Stepping stones (3 gaps, 2 rock pillars)
  7: {
    title: 'Level 7',
    description: 'Stepping Stones',
    maxInk: 600,
    carStart: { x: 35, y: 463 },
    flag: { x: 345, y: 480 },
    platforms: [
      { x: 0, y: 480, width: 75, height: 400 },
      { x: 120, y: 480, width: 50, height: 400 },
      { x: 215, y: 480, width: 50, height: 400 },
      { x: 300, y: 480, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 8: Mountain peak in the center (draw over peak)
  8: {
    title: 'Level 8',
    description: 'Mountain Peak',
    maxInk: 650,
    carStart: { x: 40, y: 483 },
    flag: { x: 340, y: 500 },
    platforms: [
      { x: 0, y: 500, width: 95, height: 400 },
      { x: 165, y: 430, width: 65, height: 400 },
      { x: 275, y: 500, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 9: Downhill ski ramp
  9: {
    title: 'Level 9',
    description: 'Downhill Cruise',
    maxInk: 500,
    carStart: { x: 40, y: 423 },
    flag: { x: 335, y: 510 },
    platforms: [
      { x: 0, y: 440, width: 95, height: 400 },
      { x: 245, y: 510, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 10: Deep canyon dip
  10: {
    title: 'Level 10',
    description: 'Canyon Suspension',
    maxInk: 650,
    carStart: { x: 40, y: 453 },
    flag: { x: 340, y: 470 },
    platforms: [
      { x: 0, y: 470, width: 90, height: 400 },
      { x: 275, y: 470, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 11: Two-stage staircase (Low -> Mid -> High)
  11: {
    title: 'Level 11',
    description: 'Stairway to Sky',
    maxInk: 650,
    carStart: { x: 35, y: 503 },
    flag: { x: 335, y: 410 },
    platforms: [
      { x: 0, y: 520, width: 85, height: 400 },
      { x: 140, y: 465, width: 75, height: 400 },
      { x: 260, y: 410, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 12: Island in the abyss
  12: {
    title: 'Level 12',
    description: 'Abyss Island',
    maxInk: 600,
    carStart: { x: 35, y: 463 },
    flag: { x: 335, y: 480 },
    platforms: [
      { x: 0, y: 480, width: 80, height: 400 },
      { x: 165, y: 460, width: 60, height: 400 },
      { x: 280, y: 480, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 13: High steep launch ramp
  13: {
    title: 'Level 13',
    description: 'High Altitude',
    maxInk: 650,
    carStart: { x: 35, y: 503 },
    flag: { x: 335, y: 400 },
    platforms: [
      { x: 0, y: 520, width: 135, height: 400 },
      { x: 250, y: 400, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 14: Four pillar causeway
  14: {
    title: 'Level 14',
    description: 'Pillar Causeway',
    maxInk: 700,
    carStart: { x: 30, y: 463 },
    flag: { x: 345, y: 480 },
    platforms: [
      { x: 0, y: 480, width: 55, height: 400 },
      { x: 95, y: 480, width: 40, height: 400 },
      { x: 175, y: 480, width: 40, height: 400 },
      { x: 255, y: 480, width: 40, height: 400 },
      { x: 325, y: 480, width: 200, height: 400 },
    ],
    guide: null,
  },
  // Level 15: Grand Master Canyon Challenge
  15: {
    title: 'Level 15',
    description: 'Master Challenge',
    maxInk: 750,
    carStart: { x: 30, y: 503 },
    flag: { x: 340, y: 390 },
    platforms: [
      { x: 0, y: 520, width: 75, height: 400 },
      { x: 130, y: 460, width: 65, height: 400 },
      { x: 255, y: 390, width: 200, height: 400 },
    ],
    guide: null,
  },
};

// Colorful Confetti Cracker Fountain sitting directly on the Road (Left & Right)
// Matching exact position and visual style from Screenshot media_1790069178223.png
function RoadCrackerGeyser({ x, y }) {
  const CONFETTI_PIECES = [
    // Lower plume (close to ground surface)
    { dx: -14, dy: -24, w: 7, h: 14, rot: -18, col: '#22c55e' },
    { dx: 12, dy: -28, w: 6, h: 16, rot: 25, col: '#00f0ff' },
    { dx: -4, dy: -42, w: 8, h: 12, rot: 10, col: '#ffe600' },
    { dx: -20, dy: -52, w: 6, h: 18, rot: -30, col: '#ff007f' },
    { dx: 18, dy: -56, w: 7, h: 14, rot: 35, col: '#ff9100' },
    { dx: 2, dy: -66, w: 8, h: 12, rot: -12, col: '#22c55e' },

    // Mid plume
    { dx: -12, dy: -85, w: 6, h: 18, rot: 20, col: '#00f0ff' },
    { dx: 15, dy: -95, w: 7, h: 14, rot: -25, col: '#ff007f' },
    { dx: -22, dy: -110, w: 8, h: 12, rot: 40, col: '#ffe600' },
    { dx: 4, dy: -118, w: 6, h: 16, rot: -15, col: '#b026ff' },
    { dx: -8, dy: -130, w: 7, h: 15, rot: 15, col: '#22c55e' },
    { dx: 20, dy: -135, w: 6, h: 18, rot: -35, col: '#00f0ff' },
    { dx: 8, dy: -145, w: 8, h: 12, rot: 28, col: '#ff9100' },
    { dx: -18, dy: -155, w: 6, h: 16, rot: -22, col: '#ff007f' },

    // High plume
    { dx: 12, dy: -170, w: 7, h: 14, rot: 18, col: '#ffe600' },
    { dx: -6, dy: -180, w: 6, h: 18, rot: -30, col: '#22c55e' },
    { dx: 16, dy: -195, w: 8, h: 12, rot: 45, col: '#00f0ff' },
    { dx: -15, dy: -205, w: 6, h: 16, rot: -15, col: '#ff007f' },
    { dx: 5, dy: -220, w: 7, h: 14, rot: 25, col: '#b026ff' },
    { dx: -10, dy: -235, w: 5, h: 16, rot: -40, col: '#ffe600' },
    { dx: 18, dy: -245, w: 6, h: 14, rot: 30, col: '#22c55e' },

    // Additional fluttering streamers
    { dx: -24, dy: -75, w: 5, h: 15, rot: -45, col: '#ff7b00' },
    { dx: 22, dy: -160, w: 7, h: 13, rot: 32, col: '#00f0ff' },
    { dx: -2, dy: -190, w: 6, h: 16, rot: -10, col: '#ff007f' },
    { dx: 10, dy: -210, w: 8, h: 12, rot: 15, col: '#22c55e' },
    { dx: -20, dy: -140, w: 6, h: 15, rot: -28, col: '#ffe600' },
    { dx: 0, dy: -100, w: 7, h: 14, rot: 5, col: '#b026ff' },
  ];

  return (
    <div
      className="absolute pointer-events-none z-35"
      style={{
        left: x,
        top: y,
      }}
    >
      {/* 1. Ground Smoke & Spark Clouds right at the road surface */}
      <div className="relative -top-1.5 flex items-center justify-center">
        <div className="absolute w-14 h-6 rounded-full bg-white/90 blur-[1px] shadow-lg animate-ping" />
        <div className="absolute w-12 h-5 rounded-full bg-cyan-100/90 blur-[1px] -left-3 animate-pulse" />
        <div className="absolute w-12 h-5 rounded-full bg-amber-100/90 blur-[1px] -right-3 animate-pulse" />
        <div className="absolute w-8 h-4 rounded-full bg-white shadow-md animate-bounce" />
        <div className="absolute w-4 h-4 rounded-full bg-yellow-300 animate-ping" />
      </div>

      {/* 2. Confetti Geyser Streamers shooting straight up from the road */}
      <div className="relative w-0 h-0 overflow-visible">
        {CONFETTI_PIECES.map((piece, i) => (
          <div
            key={i}
            className="absolute shadow-xs animate-pulse"
            style={{
              left: `${piece.dx}px`,
              top: `${piece.dy}px`,
              width: `${piece.w}px`,
              height: `${piece.h}px`,
              backgroundColor: piece.col,
              transform: `rotate(${piece.rot}deg)`,
              boxShadow: `0 0 5px ${piece.col}cc`,
              borderRadius: '2px',
              animationDuration: `${0.6 + (i % 5) * 0.18}s`,
            }}
          />
        ))}

        {/* Upward spark particles */}
        {[-30, -60, -90, -120, -150, -180, -210].map((h, idx) => (
          <div
            key={`spark-${idx}`}
            className="absolute w-2 h-2 rounded-full bg-white animate-ping"
            style={{
              left: `${(idx % 2 === 0 ? -1 : 1) * (6 + idx * 2)}px`,
              top: `${h}px`,
              animationDuration: '0.8s',
              animationDelay: `${idx * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DrawBridgeGame({ onHome, onOpenSettings }) {
  const [level, setLevel] = useState(1);
  const currentLvl = LEVELS[level] || LEVELS[1];

  // Drawing state
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkUsed, setInkUsed] = useState(0);
  const [penColor, setPenColor] = useState('#1e293b');

  // Car state
  const [carX, setCarX] = useState(currentLvl.carStart.x);
  const [carY, setCarY] = useState(currentLvl.carStart.y);
  const [carAngle, setCarAngle] = useState(0);
  const [wheelSpin, setWheelSpin] = useState(0);
  const [isDriving, setIsDriving] = useState(false);
  const [snowPuffs, setSnowPuffs] = useState([]);

  // Crackers / Fireworks state (Screenshot media_1790068379005.png)
  const [showCrackers, setShowCrackers] = useState(false);

  // Status
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);

  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    handleReset();
  }, [level]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const handlePointerDown = (e) => {
    if (isDriving || success || failed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPoints([{ x, y }]);
    setInkUsed(0);
    audio.playClick();
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || isDriving || success || failed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints((prev) => {
      if (prev.length === 0) return [{ x, y }];
      const last = prev[prev.length - 1];
      const d = dist(last, { x, y });

      if (d > 4) {
        const newInk = inkUsed + d;
        if (newInk > currentLvl.maxInk) {
          setIsDrawing(false);
          startDrive([...prev, { x, y }]);
          return prev;
        }
        setInkUsed(newInk);
        return [...prev, { x, y }];
      }
      return prev;
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (points.length > 5) {
      startDrive(points);
    }
  };

  // Query top-most road surface at horizontal coordinate X
  // With isLast check: the right-most platform extends infinitely to the right!
  const getSurfaceY = (x, drawnPts) => {
    let topY = null;

    // 1. Check all platforms at x
    for (let idx = 0; idx < currentLvl.platforms.length; idx++) {
      const plat = currentLvl.platforms[idx];
      const isLast = idx === currentLvl.platforms.length - 1;

      // The last platform extends to the right edge with NO gap!
      if (x >= plat.x - 2 && (isLast || x <= plat.x + plat.width + 2)) {
        if (topY === null || plat.y < topY) {
          topY = plat.y;
        }
      }
    }

    // 2. Check all drawn line segments at x
    for (let i = 0; i < drawnPts.length - 1; i++) {
      const p1 = drawnPts[i];
      const p2 = drawnPts[i + 1];

      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);

      if (x >= minX - 2 && x <= maxX + 2) {
        let segY;
        if (Math.abs(p2.x - p1.x) < 0.001) {
          segY = Math.min(p1.y, p2.y);
        } else {
          const t = (x - p1.x) / (p2.x - p1.x);
          segY = p1.y + t * (p2.y - p1.y);
        }

        if (topY === null || segY < topY) {
          topY = segY;
        }
      }
    }

    return topY;
  };

  // Start Car Drive Simulation
  const startDrive = (drawnPoints) => {
    if (isDriving || drawnPoints.length < 3) return;
    setIsDriving(true);
    audio.playDriveOff();

    let curX = carX;
    let curY = carY;
    let curAngle = 0;
    let curWheelSpin = 0;
    let isFalling = false;
    let vy = 0;
    let stepCount = 0;
    let hasCrossedFlag = false;

    // Calm cruising speed (~1.7 px/frame)
    const speed = 1.7;
    const flagX = currentLvl.flag.x;
    // Car moves PAST the flag all the way to right edge!
    const exitX = 460;

    const stepDrive = () => {
      stepCount++;

      if (!isFalling) {
        curX += speed;
        curWheelSpin += 10;

        // Check if car just crossed the flag!
        if (!hasCrossedFlag && curX >= flagX) {
          hasCrossedFlag = true;
          setShowCrackers(true);
          audio.playVictory();

          // Dual geysers of multi-colored confetti crackers bursting from road!
          try {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              const leftPlat = currentLvl.platforms[0];
              const rightPlat = currentLvl.platforms[currentLvl.platforms.length - 1];

              const leftPlatX = leftPlat.width * 0.55;
              const rightPlatX = currentLvl.flag.x - 22;

              const leftScreenX = (rect.left + leftPlatX) / window.innerWidth;
              const leftScreenY = (rect.top + leftPlat.y) / window.innerHeight;

              const rightScreenX = (rect.left + rightPlatX) / window.innerWidth;
              const rightScreenY = (rect.top + rightPlat.y) / window.innerHeight;

              const shootPlumes = () => {
                confetti({
                  particleCount: 50,
                  angle: 88,
                  spread: 35,
                  startVelocity: 48,
                  origin: { x: leftScreenX, y: leftScreenY },
                  colors: ['#22c55e', '#00f0ff', '#ffe600', '#ff007f', '#ff9100', '#b026ff'],
                  ticks: 200,
                  gravity: 1.1,
                });
                confetti({
                  particleCount: 50,
                  angle: 92,
                  spread: 35,
                  startVelocity: 48,
                  origin: { x: rightScreenX, y: rightScreenY },
                  colors: ['#22c55e', '#00f0ff', '#ffe600', '#ff007f', '#ff9100', '#b026ff'],
                  ticks: 200,
                  gravity: 1.1,
                });
              };

              shootPlumes();
              setTimeout(shootPlumes, 250);
              setTimeout(shootPlumes, 500);
            }
          } catch (e) {}

          // Show victory modal after car finishes driving past the flag
          setTimeout(() => {
            setIsDriving(false);
            setSuccess(true);
          }, 1400);
        }

        // Sample surface under rear wheel and front wheel (wheelbase 38px)
        const rearY = getSurfaceY(curX - 17, drawnPoints);
        const frontY = getSurfaceY(curX + 21, drawnPoints);
        const midY = getSurfaceY(curX, drawnPoints);

        // Gap detection
        if (!hasCrossedFlag && (midY === null || (rearY === null && frontY === null))) {
          isFalling = true;
          vy = 1.2;
        } else {
          const rY = rearY !== null ? rearY : midY !== null ? midY : curY + 17;
          const fY = frontY !== null ? frontY : midY !== null ? midY : curY + 17;

          const slope = (fY - rY) / 38;
          if (!hasCrossedFlag && slope < -1.9) {
            isFalling = true;
            vy = 1.5;
          } else {
            const surfaceY = (rY + fY) / 2;
            const targetY = surfaceY - 17;

            curY += (targetY - curY) * 0.4;
            const targetAngle = Math.max(-42, Math.min(42, (Math.atan2(fY - rY, 38) * 180) / Math.PI));
            curAngle += (targetAngle - curAngle) * 0.25;

            // Snow puffs behind rear tire
            if (stepCount % 5 === 0) {
              setSnowPuffs((prev) => [
                ...prev.slice(-10),
                {
                  id: Math.random(),
                  x: curX - 22,
                  y: curY + 15,
                  size: Math.random() * 5 + 3,
                },
              ]);
            }

            setCarX(curX);
            setCarY(curY);
            setCarAngle(curAngle);
            setWheelSpin(curWheelSpin);

            // Exit offscreen
            if (curX >= exitX) {
              return;
            }
          }
        }
      }

      // If falling into chasm
      if (isFalling) {
        curX += speed * 0.5;
        vy += 0.38;
        curY += vy;
        curAngle = Math.min(65, curAngle + 2.5);

        setCarX(curX);
        setCarY(curY);
        setCarAngle(curAngle);

        if (curY > 560) {
          audio.playCrash();
          setIsDriving(false);
          setFailed(true);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(stepDrive);
    };

    animFrameRef.current = requestAnimationFrame(stepDrive);
  };

  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setPoints([]);
    setIsDrawing(false);
    setIsDriving(false);
    setSuccess(false);
    setFailed(false);
    setShowCrackers(false);
    setInkUsed(0);
    setSnowPuffs([]);
    setCarX(currentLvl.carStart.x);
    setCarY(currentLvl.carStart.y);
    setCarAngle(0);
    setWheelSpin(0);
  };

  const handleNextLevel = () => {
    const nextLvlNum = level < 15 ? level + 1 : 1;
    setLevel(nextLvlNum);
  };

  const totalTicks = 16;
  const remainingPercent = Math.max(0, 1 - inkUsed / currentLvl.maxInk);
  const activeTicks = Math.round(remainingPercent * totalTicks);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none bg-gradient-to-b from-[#4ecdc4] via-[#67e8f9] to-[#bae6fd] overflow-hidden">
      {/* Ambient background clouds for desktop/laptop screens */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-48 h-20 bg-white/60 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-24 right-20 w-64 h-24 bg-white/50 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-32 bg-white/40 rounded-full blur-2xl" />
      </div>

      {/* 
          GAME VIEWPORT
          - 100% full screen on mobile (< sm)
          - Scaled & centered with sky backdrop on laptop/desktop (sm:)
      */}
      <div className="relative w-full max-w-[420px] sm:max-w-[460px] md:max-w-[500px] h-full flex flex-col justify-between select-none overflow-hidden text-slate-800 font-sans shadow-2xl sm:border-x sm:border-white/40 bg-[#e0f2fe] transition-all">
        {/* 1. SCENIC TURQUOISE WINTER SKY BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full object-cover" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="winterSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ecdc4" />
              <stop offset="40%" stopColor="#67e8f9" />
              <stop offset="75%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>

            <linearGradient id="cityMist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>

            {/* Repeating stone rocks pattern for 100% full-screen seamless bedrock */}
            <pattern id="rockPattern" width="160" height="160" patternUnits="userSpaceOnUse">
              <polygon points="20,20 45,15 55,35 30,45 15,35" fill="#adb5bd" opacity="0.45" />
              <polygon points="80,40 110,30 120,60 90,75 75,55" fill="#adb5bd" opacity="0.45" />
              <polygon points="15,80 40,70 50,105 25,115 10,95" fill="#adb5bd" opacity="0.45" />
              <polygon points="70,110 95,95 115,120 90,140 65,125" fill="#adb5bd" opacity="0.45" />
              <polygon points="30,150 60,135 75,170 45,185 20,165" fill="#adb5bd" opacity="0.45" />
              <polygon points="100,160 130,150 140,185 110,200 90,180" fill="#adb5bd" opacity="0.45" />
            </pattern>
          </defs>

          <rect width="400" height="800" fill="url(#winterSky)" />

          <path
            d="M 20 500 L 20 280 L 60 280 L 60 330 L 100 330 L 100 240 L 150 240 L 150 310 L 210 310 L 210 260 L 270 260 L 270 340 L 320 340 L 320 290 L 380 290 L 380 500 Z"
            fill="url(#cityMist)"
          />

          {[
            { cx: 50, cy: 120, r: 2.5 },
            { cx: 120, cy: 80, r: 1.8 },
            { cx: 210, cy: 150, r: 3 },
            { cx: 290, cy: 95, r: 2 },
            { cx: 350, cy: 160, r: 2.2 },
            { cx: 70, cy: 220, r: 2 },
            { cx: 180, cy: 260, r: 2.8 },
            { cx: 330, cy: 240, r: 1.5 },
            { cx: 40, cy: 340, r: 2.2 },
            { cx: 260, cy: 320, r: 2.5 },
          ].map((sf, idx) => (
            <g key={idx} opacity="0.65">
              <circle cx={sf.cx} cy={sf.cy} r={sf.r} fill="#ffffff" />
            </g>
          ))}
        </svg>
      </div>

      {/* 2. TOP HEADER */}
      <div className="relative z-20 flex flex-col pt-3 px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-12 h-12 rounded-2xl bg-[#00b4d8] border-2 border-white text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Settings className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  audio.playClick();
                  setLevel((l) => (l > 1 ? l - 1 : 15));
                }}
                className="w-6 h-6 rounded-full bg-white/40 text-white flex items-center justify-center hover:bg-white/60 active:scale-90"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </button>

              <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                Level {level}
              </h1>

              <button
                onClick={() => {
                  audio.playClick();
                  setLevel((l) => (l < 15 ? l + 1 : 1));
                }}
                className="w-6 h-6 rounded-full bg-white/40 text-white flex items-center justify-center hover:bg-white/60 active:scale-90"
              >
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Ink Gauge Pill */}
            <div className="mt-1 flex items-center bg-white/90 rounded-full py-1 px-1.5 shadow-md border border-sky-200">
              <div className="w-6 h-5 rounded-md border border-slate-300 bg-slate-50 mr-1" />

              <div className="flex items-center gap-0.5 px-1">
                {Array.from({ length: totalTicks }).map((_, i) => {
                  const isActive = i < activeTicks;
                  const isLow = i >= totalTicks * 0.6;
                  const isMed = i >= totalTicks * 0.3;

                  let barColor = 'bg-slate-200';
                  if (isActive) {
                    if (isLow) barColor = 'bg-amber-400';
                    else if (isMed) barColor = 'bg-emerald-400';
                    else barColor = 'bg-emerald-500';
                  }

                  return (
                    <div
                      key={i}
                      className={`w-1.5 h-3.5 rounded-full transition-colors duration-150 ${barColor}`}
                    />
                  );
                })}
              </div>

              <div className="w-6 h-5 rounded-md bg-gradient-to-tr from-purple-400 to-pink-300 ml-1 border border-purple-200 overflow-hidden flex items-center justify-center text-[10px]">
                🌲
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              handleReset();
            }}
            className="w-12 h-12 rounded-2xl bg-[#ff9100] border-2 border-white text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <RotateCcw className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        <div className="flex justify-start mt-1">
          <button
            onClick={() => {
              audio.playClick();
              if (onHome) onHome();
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-full hover:bg-white/70 shadow-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Main Hub
          </button>
        </div>
      </div>

      {/* 3. PLAY AREA: CANVAS, BEDROCK CLIFFS, CRACKERS, CAR & FLAG */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full overflow-hidden cursor-crosshair select-none"
      >
        {/* BEDROCK & SNOW PLATFORMS
            The right-most platform extends all the way to right: 0 (100% full screen width) with ZERO gap! */}
        {currentLvl.platforms.map((plat, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === currentLvl.platforms.length - 1;

          return (
            <div
              key={idx}
              className="absolute shadow-2xl overflow-hidden"
              style={{
                left: isFirst ? 0 : plat.x,
                right: isLast ? 0 : 'auto',
                width: isLast ? 'auto' : isFirst ? plat.width : plat.width,
                top: plat.y,
                height: plat.height,
                backgroundColor: '#6c757d',
              }}
            >
              <div className="w-full h-3.5 bg-white border-b border-sky-300 shadow-sm" />

              <svg className="w-full h-full pointer-events-none">
                <rect width="100%" height="100%" fill="url(#rockPattern)" />
              </svg>
            </div>
          );
        })}

        {/* DOTTED GUIDE RAMP ◢ (Level 5) */}
        {currentLvl.guideRamp && points.length === 0 && !isDriving && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M ${currentLvl.guideRamp.startX} ${currentLvl.guideRamp.startY} L ${currentLvl.guideRamp.endX} ${currentLvl.guideRamp.endY} L ${currentLvl.guideRamp.endX} ${currentLvl.guideRamp.startY} Z`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Dotted straight bridge guide (Level 1) */}
        {currentLvl.guide && points.length === 0 && !isDriving && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={currentLvl.guide[0].x}
              y1={currentLvl.guide[0].y}
              x2={currentLvl.guide[1].x}
              y2={currentLvl.guide[1].y}
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="6,6"
              opacity="0.75"
            />
          </svg>
        )}

        {/* DRAWN BRIDGE LINE */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
          {points.length > 1 && (
            <path
              d={`M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke={penColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* FLAG AT GOAL PLATFORM (Zoomed & Bold matching Screenshot) */}
        <div
          className="absolute pointer-events-none z-25 flex items-end"
          style={{
            left: currentLvl.flag.x,
            top: currentLvl.flag.y - 48,
          }}
        >
          <div className="w-3 h-2.5 bg-slate-900 rounded-t" />
          <div className="w-2 h-12 bg-white border border-slate-300 relative shadow-sm">
            <div className="absolute top-0 left-1 w-9 h-5.5 bg-gradient-to-r from-amber-400 to-[#ff9100] border-2 border-amber-500 rounded-r-md shadow-md flex items-center justify-center text-white text-[10px] font-black">
              🏁
            </div>
          </div>
        </div>

        {/* COLORFUL CRACKERS / CONFETTI GEYSERS ON ROAD (Left & Right - Exact Screenshot media_1790069178223.png Match!) */}
        {showCrackers && (
          <>
            {/* Left Road Cracker (Directly on left road surface) */}
            <RoadCrackerGeyser
              x={currentLvl.platforms[0].width * 0.55}
              y={currentLvl.platforms[0].y}
            />

            {/* Right Road Cracker (Directly on right road surface, right beside flag) */}
            <RoadCrackerGeyser
              x={currentLvl.flag.x - 22}
              y={currentLvl.platforms[currentLvl.platforms.length - 1].y}
            />
          </>
        )}

        {/* SNOW PUFFS FROM REAR TIRE */}
        {snowPuffs.map((puff) => (
          <div
            key={puff.id}
            className="absolute rounded-full bg-white/80 pointer-events-none animate-ping"
            style={{
              left: puff.x,
              top: puff.y,
              width: puff.size,
              height: puff.size,
            }}
          />
        ))}

        {/* AUTHENTIC YELLOW TAXI HATCHBACK CAR */}
        <div
          className="absolute pointer-events-none z-40 transition-transform duration-75"
          style={{
            left: carX,
            top: carY,
            transform: `translate(-50%, -50%) rotate(${carAngle}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <div className="relative w-20 h-12">
            <svg viewBox="0 0 80 50" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="taxiYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="60%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>

                <linearGradient id="windowTint" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              <rect x="24" y="6" width="28" height="2" fill="#334155" rx="1" />
              <rect x="28" y="4" width="3" height="3" fill="#334155" />
              <rect x="46" y="4" width="3" height="3" fill="#334155" />

              <path
                d="M 10 32 Q 10 26 16 25 L 24 12 Q 28 8 36 8 L 52 8 Q 60 8 66 18 L 74 24 Q 78 26 78 32 L 78 36 Q 78 38 74 38 L 8 38 Q 6 38 6 34 L 10 32 Z"
                fill="url(#taxiYellow)"
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              <path
                d="M 26 23 L 30 12 L 44 12 L 44 23 Z"
                fill="url(#windowTint)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <path
                d="M 48 23 L 48 12 L 54 12 L 63 23 Z"
                fill="url(#windowTint)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              <line x1="55" y1="14" x2="62" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

              <g transform="translate(14, 25)">
                {Array.from({ length: 9 }).map((_, i) => (
                  <rect
                    key={i}
                    x={i * 6}
                    y="0"
                    width="6"
                    height="4"
                    fill={i % 2 === 0 ? '#1e293b' : '#ffffff'}
                  />
                ))}
              </g>

              <rect x="74" y="27" width="4" height="4" rx="1" fill="#fef08a" stroke="#ca8a04" />
              <rect x="6" y="27" width="3" height="4" rx="1" fill="#ef4444" />

              <path d="M 14 38 A 9 9 0 0 1 32 38 Z" fill="#1e293b" />
              <path d="M 52 38 A 9 9 0 0 1 70 38 Z" fill="#1e293b" />

              <g transform={`translate(23, 38) rotate(${wheelSpin})`}>
                <circle cx="0" cy="0" r="9" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                <circle cx="0" cy="0" r="4.5" fill="#94a3b8" />
                <circle cx="0" cy="0" r="2" fill="#facc15" />
                <line x1="-7" y1="0" x2="7" y2="0" stroke="#475569" strokeWidth="1.5" />
                <line x1="0" y1="-7" x2="0" y2="7" stroke="#475569" strokeWidth="1.5" />
              </g>

              <g transform={`translate(61, 38) rotate(${wheelSpin})`}>
                <circle cx="0" cy="0" r="9" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                <circle cx="0" cy="0" r="4.5" fill="#94a3b8" />
                <circle cx="0" cy="0" r="2" fill="#facc15" />
                <line x1="-7" y1="0" x2="7" y2="0" stroke="#475569" strokeWidth="1.5" />
                <line x1="0" y1="-7" x2="0" y2="7" stroke="#475569" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
        </div>

        {!isDriving && points.length === 0 && (
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 pointer-events-none text-center bg-white/75 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-white">
            <p className="text-xs font-black text-slate-800 uppercase tracking-wider animate-pulse">
              ✏️ Draw a line to bridge the gap!
            </p>
          </div>
        )}
      </div>

      {/* 4. SUCCESS / LEVEL COMPLETE MODAL */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl flex flex-col items-center text-center border-4 border-amber-300">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              LEVEL COMPLETED!
            </h2>
            <p className="text-slate-600 font-semibold text-xs mb-4">
              Awesome bridge! The taxi safely reached the flag!
            </p>

            <div className="bg-amber-100 text-amber-900 px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-sm mb-5">
              <span>🪙</span> +25 Coins
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  audio.playClick();
                  handleNextLevel();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-black text-base uppercase tracking-wider shadow-lg active:scale-95"
              >
                {level < 15 ? 'NEXT LEVEL' : 'PLAY AGAIN'}
              </button>

              <button
                onClick={() => {
                  audio.playClick();
                  handleReset();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
              >
                Replay Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FAILURE MODAL */}
      {failed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl flex flex-col items-center text-center border-4 border-rose-400">
            <div className="text-5xl mb-2">💥</div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              TRY AGAIN!
            </h2>
            <p className="text-slate-600 font-semibold text-xs mb-4">
              The bridge was too steep or had a gap. Draw a smoother bridge!
            </p>

            <button
              onClick={() => {
                audio.playClick();
                handleReset();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff4081] to-[#e91e63] text-white font-black text-base uppercase tracking-wider shadow-lg active:scale-95"
            >
              RETRY LEVEL
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
