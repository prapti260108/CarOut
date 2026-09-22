import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  RotateCcw,
  Undo2,
  Plus,
  Check,
  Lock,
  Palette,
  Home,
  Trophy,
  ChevronLeft,
  User,
  Sparkles,
  Dices,
  Film,
} from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

// Color Palette matching the screenshots
const COLORS = {
  CYAN: '#38bdf8', // Sky blue
  PURPLE: '#be4bdb', // Bright violet/purple
  ORANGE: '#f59f00', // Golden amber/orange
  GREEN: '#40c057', // Fresh green
  ROSE: '#f06595', // Pink/Rose
};

// Level configurations starting from Level 1
const LEVELS = {
  1: {
    moves: 8,
    bottles: [
      [COLORS.CYAN, COLORS.CYAN, COLORS.ORANGE, COLORS.ORANGE],
      [COLORS.ORANGE, COLORS.ORANGE, COLORS.CYAN, COLORS.CYAN],
      [],
    ],
  },
  2: {
    moves: 10,
    bottles: [
      [COLORS.CYAN, COLORS.PURPLE, COLORS.CYAN, COLORS.PURPLE],
      [COLORS.PURPLE, COLORS.CYAN, COLORS.PURPLE, COLORS.CYAN],
      [],
    ],
  },
  3: {
    moves: 12,
    bottles: [
      [COLORS.CYAN, COLORS.PURPLE, COLORS.ORANGE, COLORS.CYAN],
      [COLORS.PURPLE, COLORS.CYAN, COLORS.ORANGE, COLORS.PURPLE],
      [COLORS.ORANGE, COLORS.PURPLE, COLORS.CYAN, COLORS.ORANGE],
      [],
      [],
    ],
  },
  4: {
    moves: 10,
    bottles: [
      [COLORS.CYAN, COLORS.ORANGE, COLORS.PURPLE, COLORS.CYAN],
      [COLORS.PURPLE, COLORS.ORANGE, COLORS.CYAN, COLORS.CYAN],
      [COLORS.PURPLE, COLORS.PURPLE, COLORS.ORANGE, COLORS.ORANGE],
      [],
      [],
    ],
  },
  5: {
    moves: 14,
    bottles: [
      [COLORS.CYAN, COLORS.GREEN, COLORS.PURPLE, COLORS.ORANGE],
      [COLORS.GREEN, COLORS.ORANGE, COLORS.CYAN, COLORS.PURPLE],
      [COLORS.PURPLE, COLORS.CYAN, COLORS.GREEN, COLORS.ORANGE],
      [COLORS.ORANGE, COLORS.PURPLE, COLORS.CYAN, COLORS.GREEN],
      [],
      [],
    ],
  },
};

// Background Theme Options
const BACKGROUNDS = [
  { id: 'sunset', name: 'Sunset Valley', preview: '#efc2c4', cost: 0, unlocked: true },
  { id: 'pine', name: 'Misty Pines', preview: '#94a3b8', cost: 1000, unlocked: true },
  { id: 'snow', name: 'Snow Peaks', preview: '#7dd3fc', cost: 1000, unlocked: false },
  { id: 'desert', name: 'Desert Mirage', preview: '#fbbf24', cost: 1000, unlocked: false },
  { id: 'canyon', name: 'Grand Canyon', preview: '#ea580c', cost: 1000, unlocked: false },
  { id: 'night', name: 'Midnight Stag', preview: '#4338ca', cost: 1000, unlocked: false },
];

// Bottle Skin Options
const BOTTLE_SKINS = [
  { id: 'tubes', name: 'Classic Tubes', color: '#be4bdb', cost: 0, unlocked: true },
  { id: 'amber', name: 'Amber Soda', color: '#b45309', cost: 500, unlocked: false },
  { id: 'flasks', name: 'Chemistry Flasks', color: '#0284c7', cost: 500, unlocked: false },
  { id: 'cola', name: 'Ribbed Bottles', color: '#78350f', cost: 500, unlocked: false },
  { id: 'wine', name: 'Wine Decanters', color: '#9a3412', cost: 500, unlocked: false },
  { id: 'green', name: 'Sports Bottles', color: '#15803d', cost: 500, unlocked: false },
];

// Avatars from Screenshot 2
const AVATARS = [
  { id: 'girl1', emoji: '👩', name: 'Haley', bg: '#fed7aa', unlocked: true },
  { id: 'boy1', emoji: '👦', name: 'Leo', bg: '#e0e7ff', unlocked: false },
  { id: 'guy1', emoji: '🧑', name: 'Kai', bg: '#fef08a', unlocked: false },
  { id: 'beard1', emoji: '🧔', name: 'Ken', bg: '#cbd5e1', unlocked: false },
  { id: 'parka1', emoji: '👧', name: 'Maya', bg: '#fed7aa', unlocked: false },
  { id: 'pirate1', emoji: '🏴‍☠️', name: 'Drake', bg: '#bfdbfe', unlocked: false },
  { id: 'curly1', emoji: '🧑‍🦱', name: 'Jimmy', bg: '#fde047', unlocked: false },
  { id: 'blonde1', emoji: '👱', name: 'Luke', bg: '#ddd6fe', unlocked: false },
  { id: 'princess1', emoji: '👸', name: 'Luna', bg: '#fbcfe8', unlocked: false },
  { id: 'strong1', emoji: '🦸', name: 'Thor', bg: '#e2e8f0', unlocked: false },
  { id: 'geisha1', emoji: '👘', name: 'Yuki', bg: '#fecdd3', unlocked: false },
  { id: 'tropical1', emoji: '🌺', name: 'Tara', bg: '#fed7aa', unlocked: false },
  { id: 'blonde2', emoji: '👱‍♀️', name: 'Mia', bg: '#fef9c3', unlocked: false },
  { id: 'rose1', emoji: '🌹', name: 'Rose', bg: '#f87171', unlocked: false },
  { id: 'shiba1', emoji: '🐕', name: 'Hugh', bg: '#fde68a', unlocked: false },
  { id: 'cat1', emoji: '🐱', name: 'Lucky', bg: '#fecdd3', unlocked: false },
  { id: 'hacker1', emoji: '🥷', name: 'Ghost', bg: '#86efac', unlocked: false },
  { id: 'warrior1', emoji: '🗡️', name: 'Aiden', bg: '#93c5fd', unlocked: false },
  { id: 'knight1', emoji: '🛡️', name: 'Arthur', bg: '#e2e8f0', unlocked: false },
  { id: 'ninja1', emoji: '🥋', name: 'Ren', bg: '#fca5a5', unlocked: false },
];

// Frames from Screenshot 2
const FRAMES = [
  { id: 'classic', name: 'Simple Purple', border: 'border-2 border-purple-400', unlocked: true },
  { id: 'grey', name: 'Dark Slate', border: 'border-2 border-slate-600', unlocked: false },
  { id: 'gold_corner', name: 'Gold Corners', border: 'border-2 border-amber-400 ring-1 ring-amber-200', unlocked: false },
  { id: 'stone', name: 'Stone Relic', border: 'border-2 border-stone-500', unlocked: false },
  { id: 'green_crest', name: 'Green Crest', border: 'border-2 border-emerald-500 ring-2 ring-emerald-300', unlocked: false },
  { id: 'ribbon', name: 'Red Ribbon', border: 'border-2 border-rose-500 ring-2 ring-amber-300', unlocked: false },
  { id: 'gold_crown', name: 'Imperial Crown', border: 'border-2 border-amber-500 ring-2 ring-yellow-400 shadow-md', unlocked: false },
  { id: 'crystal', name: 'Frost Crystal', border: 'border-2 border-cyan-400 ring-2 ring-blue-300', unlocked: false },
];

export default function SortPuzGame({ onHome, onOpenSettings }) {
  // Navigation: 'map' (Home), 'skin' (Palette), 'leaderboard' (Trophy), 'gameplay'
  const [currentTab, setCurrentTab] = useState('map');
  const [skinSubTab, setSkinSubTab] = useState('bottles'); // 'bottles' | 'bg' | 'avatar'

  // Customization selections
  const [selectedBg, setSelectedBg] = useState('sunset');
  const [selectedBottleSkin, setSelectedBottleSkin] = useState('tubes');
  const [selectedAvatar, setSelectedAvatar] = useState('girl1');
  const [selectedFrame, setSelectedFrame] = useState('classic');

  // Game Progress & Coins
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [coins, setCoins] = useState(24);

  // Gameplay state
  const [movesLeft, setMovesLeft] = useState(LEVELS[1].moves);
  const [bottles, setBottles] = useState(LEVELS[1].bottles.map((b) => [...b]));
  const [selectedBottle, setSelectedBottle] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [undoCount, setUndoCount] = useState(2);
  const [addBottleCount, setAddBottleCount] = useState(4);
  const [history, setHistory] = useState([]);

  // Pouring Animation state
  const [pourAnim, setPourAnim] = useState(null);
  const [isPouring, setIsPouring] = useState(false);

  // Load a level
  const startLevel = (lvlNum) => {
    const lvl = LEVELS[lvlNum] || LEVELS[1];
    setCurrentLevel(lvlNum);
    setMovesLeft(lvl.moves);
    setBottles(lvl.bottles.map((b) => [...b]));
    setSelectedBottle(null);
    setCompleted(false);
    setUndoCount(2);
    setAddBottleCount(4);
    setHistory([]);
    setPourAnim(null);
    setIsPouring(false);
    setCurrentTab('gameplay');
  };

  const handleReset = () => {
    const lvl = LEVELS[currentLevel] || LEVELS[1];
    setMovesLeft(lvl.moves);
    setBottles(lvl.bottles.map((b) => [...b]));
    setSelectedBottle(null);
    setCompleted(false);
    setHistory([]);
    setPourAnim(null);
    setIsPouring(false);
  };

  // Undo Move
  const handleUndo = () => {
    if (isPouring || undoCount <= 0 || history.length === 0) return;
    audio.playClick();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setBottles(prev.bottles.map((b) => [...b]));
    setMovesLeft(prev.movesLeft);
    setSelectedBottle(null);
    setUndoCount((c) => Math.max(0, c - 1));
  };

  // Add Extra Bottle powerup
  const handleAddBottle = () => {
    if (isPouring || addBottleCount <= 0 || bottles.length >= 7) return;
    audio.playClick();
    setBottles((prev) => [...prev, []]);
    setAddBottleCount((c) => Math.max(0, c - 1));
  };

  // Handle bottle tap & authentic pouring
  const handleBottleClick = (targetIdx) => {
    if (isPouring || completed) return;
    audio.playClick();

    if (selectedBottle === null) {
      if (bottles[targetIdx].length > 0) {
        setSelectedBottle(targetIdx);
      }
      return;
    }

    if (selectedBottle === targetIdx) {
      setSelectedBottle(null);
      return;
    }

    const source = bottles[selectedBottle];
    const target = bottles[targetIdx];

    if (source.length === 0 || target.length >= 4) {
      if (bottles[targetIdx].length > 0) {
        setSelectedBottle(targetIdx);
      } else {
        setSelectedBottle(null);
      }
      return;
    }

    const topColor = source[source.length - 1];
    const targetTop = target[target.length - 1];

    if (target.length === 0 || targetTop === topColor) {
      let unitsToPour = 0;
      for (let i = source.length - 1; i >= 0; i--) {
        if (source[i] === topColor && target.length + unitsToPour < 4) {
          unitsToPour++;
        } else {
          break;
        }
      }

      if (unitsToPour === 0) {
        setSelectedBottle(null);
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          bottles: bottles.map((b) => [...b]),
          movesLeft,
        },
      ]);

      const fromIdx = selectedBottle;
      setSelectedBottle(null);
      setIsPouring(true);

      audio.playLiquidPour();

      setPourAnim({
        fromIdx,
        toIdx: targetIdx,
        color: topColor,
        units: unitsToPour,
        direction: targetIdx > fromIdx ? 'right' : 'left',
      });

      setTimeout(() => {
        const nextBottles = bottles.map((b) => [...b]);
        for (let u = 0; u < unitsToPour; u++) {
          nextBottles[fromIdx].pop();
          nextBottles[targetIdx].push(topColor);
        }

        const newMoves = Math.max(0, movesLeft - 1);
        setMovesLeft(newMoves);
        setBottles(nextBottles);
        setPourAnim(null);
        setIsPouring(false);

        if (
          nextBottles[targetIdx].length === 4 &&
          nextBottles[targetIdx].every((c) => c === nextBottles[targetIdx][0])
        ) {
          audio.playCorkPop();
        }

        const allDone = nextBottles.every(
          (b) => b.length === 0 || (b.length === 4 && b.every((c) => c === b[0]))
        );

        if (allDone) {
          setCompleted(true);
          audio.playVictory();
          try {
            confetti({ particleCount: 80, spread: 70 });
          } catch (e) {}

          const nextLvl = currentLevel + 1;
          if (nextLvl > unlockedLevel) {
            setUnlockedLevel(nextLvl);
          }
        }
      }, 750);
    } else {
      if (bottles[targetIdx].length > 0) {
        setSelectedBottle(targetIdx);
      } else {
        setSelectedBottle(null);
      }
    }
  };

  // Blue water height in Level Map test tube
  const waterHeightPercent = Math.min(96, Math.max(26, ((unlockedLevel - 0.2) / 4) * 100));

  // Current Player Score for Leaderboard
  const playerScore = 28 + (unlockedLevel - 1) * 8;

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden text-slate-800 font-sans">
      {/* 1. DYNAMIC VECTOR BACKGROUND (Changes with selectedBg Skin) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sunset theme */}
            <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#efc2c4" />
              <stop offset="50%" stopColor="#fbe8e4" />
              <stop offset="100%" stopColor="#edd0d7" />
            </linearGradient>

            {/* Pine forest theme */}
            <linearGradient id="skyPine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>

            {/* Snow peaks theme */}
            <linearGradient id="skySnow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>

            {/* Desert theme */}
            <linearGradient id="skyDesert" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>

            {/* Canyon theme */}
            <linearGradient id="skyCanyon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="60%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>

            {/* Night theme */}
            <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="60%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>

          {/* Dynamic Sky Background */}
          <rect
            width="400"
            height="800"
            fill={
              selectedBg === 'pine'
                ? 'url(#skyPine)'
                : selectedBg === 'snow'
                ? 'url(#skySnow)'
                : selectedBg === 'desert'
                ? 'url(#skyDesert)'
                : selectedBg === 'canyon'
                ? 'url(#skyCanyon)'
                : selectedBg === 'night'
                ? 'url(#skyNight)'
                : 'url(#skySunset)'
            }
          />

          {/* Mountains & Landscapes */}
          {selectedBg === 'night' ? (
            <>
              {/* Moon */}
              <circle cx="300" cy="180" r="32" fill="#fef08a" opacity="0.9" />
              {/* Night Mountains */}
              <path
                d="M -30 650 Q 80 580 200 640 Q 310 590 430 650 L 430 800 L -30 800 Z"
                fill="#1e1b4b"
                opacity="0.9"
              />
              <path
                d="M -20 680 L 30 730 L 70 700 L 130 760 L 200 720 L 280 770 L 350 730 L 430 780 L 430 800 L -20 800 Z"
                fill="#0f172a"
              />
            </>
          ) : (
            <>
              {/* Soft Clouds */}
              <path
                d="M 280 520 Q 320 480 370 510 Q 400 490 420 530 L 420 560 L 280 560 Z"
                fill="#ffffff"
                opacity="0.3"
              />
              {/* Far Mountains */}
              <path
                d="M -50 640 Q 60 590 180 645 Q 280 600 450 650 L 450 800 L -50 800 Z"
                fill={selectedBg === 'pine' ? '#64748b' : '#dca8ba'}
                opacity="0.75"
              />
              {/* Lake Surface */}
              <path
                d="M 120 635 Q 200 630 260 640 Q 310 632 350 642 L 340 680 Q 200 675 110 680 Z"
                fill="#eed0d7"
                opacity="0.7"
              />
              {/* Foreground Forest Ridges */}
              <path
                d="M -20 620 L 15 670 L 30 645 L 65 710 L 95 680 L 130 735 L 170 715 L 215 750 L 270 725 L 310 760 L 350 730 L 390 770 L 430 735 L 430 800 L -20 800 Z"
                fill="#180b20"
              />
            </>
          )}
        </svg>
      </div>

      {/* =========================================================================
          SCREEN 1: LEVEL MAP (HOME TAB) (Screenshot 1 & media_1790066714676.png)
         ========================================================================= */}
      {currentTab === 'map' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Top Bar: Settings, Main Hub & Coins Pill */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audio.playClick();
                  onOpenSettings();
                }}
                className="w-11 h-11 rounded-full bg-[#4a365b]/60 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center text-[#fbc02d] active:scale-95 transition-transform cursor-pointer"
                title="Settings"
              >
                <Settings className="w-6 h-6 stroke-[2.5]" />
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  if (onHome) onHome();
                }}
                className="flex items-center gap-1 text-xs font-bold text-white bg-[#4a365b]/60 backdrop-blur-md border border-white/20 px-3 py-2.5 rounded-full hover:bg-[#4a365b]/80 shadow-md active:scale-95 transition-all cursor-pointer"
                title="Return to Main Menu"
              >
                <ChevronLeft className="w-4 h-4" /> Main Hub
              </button>
            </div>

            {/* Coins Counter Pill */}
            <div className="flex items-center gap-2 bg-[#5d4468]/70 backdrop-blur-md border border-white/20 rounded-full py-1 pl-2 pr-2.5 shadow-md">
              <span className="text-xl">🪙</span>
              <span className="text-white font-extrabold text-base tracking-wide">
                {coins}
              </span>
              <button
                onClick={() => {
                  audio.playClick();
                  setCoins((c) => c + 100);
                }}
                className="w-5 h-5 rounded-md bg-[#fbc02d] text-[#5d4468] flex items-center justify-center font-black text-sm ml-1 active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          {/* Central Tall Glass Test Tube filled with Liquid */}
          <div className="flex-1 flex flex-col items-center justify-center relative my-2">
            <div className="relative w-24 h-[440px] max-h-[62vh] rounded-b-[48px] border-[3px] border-white/70 bg-white/15 backdrop-blur-[2px] shadow-2xl flex flex-col justify-end overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 border-b-2 border-white/40 bg-white/20" />
              <div className="absolute top-2 bottom-6 left-2 w-1.5 rounded-full bg-white/40 pointer-events-none" />
              <div className="absolute top-8 bottom-12 right-2 w-0.5 rounded-full bg-white/20 pointer-events-none" />

              {/* Blue Liquid Fill: dynamically fills according to unlocked level */}
              <div
                className="w-full bg-gradient-to-t from-[#0284c7] via-[#38bdf8] to-[#67e8f9] rounded-b-[45px] transition-all duration-700 shadow-inner relative flex flex-col-reverse items-center justify-start pb-4"
                style={{ height: `${waterHeightPercent}%` }}
              >
                <div className="absolute top-0 inset-x-0 h-2.5 bg-white/45 rounded-full blur-[1px]" />

                {/* Level Badges (Levels 1 to 4 stacked inside the tube) */}
                {[1, 2, 3, 4].map((lvlNum) => {
                  const isCurrent = lvlNum === currentLevel;
                  const isUnlocked = lvlNum <= unlockedLevel;

                  return (
                    <button
                      key={lvlNum}
                      onClick={() => {
                        if (isUnlocked) {
                          audio.playClick();
                          setCurrentLevel(lvlNum);
                        }
                      }}
                      className={`relative z-10 my-2 w-14 h-14 flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 ${
                        isCurrent ? 'scale-110' : isUnlocked ? 'hover:scale-105' : 'opacity-70'
                      }`}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                        {isCurrent ? (
                          <>
                            <path
                              d="M 50 6 C 54 4 62 4 66 6 L 88 19 C 93 22 96 28 96 34 L 96 66 C 96 72 93 78 88 81 L 66 94 C 62 96 54 96 50 94 L 28 81 C 23 78 20 72 20 66 L 20 34 C 20 28 23 22 28 19 Z"
                              fill="#fde047"
                            />
                            <path
                              d="M 50 11 C 53 9 60 9 63 11 L 83 23 C 87 25 90 30 90 35 L 90 65 C 90 70 87 75 83 77 L 63 89 C 60 91 53 91 50 89 L 30 77 C 26 75 23 70 23 65 L 23 35 C 23 30 26 25 30 23 Z"
                              fill="#4ade80"
                            />
                          </>
                        ) : isUnlocked ? (
                          <>
                            <path
                              d="M 50 6 C 54 4 62 4 66 6 L 88 19 C 93 22 96 28 96 34 L 96 66 C 96 72 93 78 88 81 L 66 94 C 62 96 54 96 50 94 L 28 81 C 23 78 20 72 20 66 L 20 34 C 20 28 23 22 28 19 Z"
                              fill="#ffffff"
                              opacity="0.9"
                            />
                            <path
                              d="M 50 10 C 53 8 60 8 63 10 L 84 22 C 88 24 91 29 91 34 L 91 66 C 91 71 88 76 84 78 L 63 90 C 60 92 53 92 50 90 L 29 78 C 25 76 22 71 22 66 L 22 34 C 22 29 25 24 29 22 Z"
                              fill="#38bdf8"
                            />
                          </>
                        ) : (
                          <>
                            <path
                              d="M 50 6 C 54 4 62 4 66 6 L 88 19 C 93 22 96 28 96 34 L 96 66 C 96 72 93 78 88 81 L 66 94 C 62 96 54 96 50 94 L 28 81 C 23 78 20 72 20 66 L 20 34 C 20 28 23 22 28 19 Z"
                              fill="rgba(255,255,255,0.4)"
                            />
                            <path
                              d="M 50 10 C 53 8 60 8 63 10 L 84 22 C 88 24 91 29 91 34 L 91 66 C 91 71 88 76 84 78 L 63 90 C 60 92 53 92 50 90 L 29 78 C 25 76 22 71 22 66 L 22 34 C 22 29 25 24 29 22 Z"
                              fill="#3b2b4d"
                              opacity="0.6"
                            />
                          </>
                        )}
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl drop-shadow">
                        {isUnlocked ? lvlNum : <Lock className="w-5 h-5 text-white/80" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Locked indicator at top */}
              <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full border border-white/50 bg-white/20 flex items-center justify-center shadow">
                  <Lock className="w-5 h-5 text-white/90" />
                </div>
              </div>
            </div>

            {/* Pink "Start" Button */}
            <button
              onClick={() => {
                audio.playClick();
                startLevel(currentLevel);
              }}
              className="mt-4 px-14 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff539a] via-[#ff2b7f] to-[#f43f5e] border-b-4 border-[#b91c5c] text-white font-black text-2xl tracking-wider shadow-xl active:scale-95 transition-transform"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: SKIN SHOP (PALETTE TAB) (Screenshots 2, 4, 5)
         ========================================================================= */}
      {currentTab === 'skin' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-y-auto">
          {/* Header: Settings, "SKIN", Coins */}
          <div className="flex items-center justify-between px-5 pt-4">
            <button
              onClick={() => {
                audio.playClick();
                onOpenSettings();
              }}
              className="w-11 h-11 rounded-full bg-[#4a365b]/60 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center text-[#fbc02d] active:scale-95"
            >
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </button>

            <h1 className="text-3xl font-black text-[#2b1f3d] tracking-wide">SKIN</h1>

            <div className="flex items-center gap-2 bg-[#5d4468]/70 backdrop-blur-md border border-white/20 rounded-full py-1 pl-2 pr-2.5 shadow-md">
              <span className="text-xl">🪙</span>
              <span className="text-white font-extrabold text-base tracking-wide">
                {coins}
              </span>
            </div>
          </div>

          {/* Sub-Tabs: Bottles (1), Backgrounds (2), Avatars (3) */}
          <div className="px-6 mt-3">
            <div className="w-full bg-white/90 rounded-full p-1.5 flex items-center justify-between shadow-lg border border-purple-200">
              {/* Tab 1: Bottle Skin */}
              <button
                onClick={() => {
                  audio.playClick();
                  setSkinSubTab('bottles');
                }}
                className={`flex-1 py-2 rounded-full flex items-center justify-center transition-all ${
                  skinSubTab === 'bottles'
                    ? 'bg-[#00b4d8] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="text-lg">🍼</span>
              </button>

              {/* Tab 2: Backgrounds */}
              <button
                onClick={() => {
                  audio.playClick();
                  setSkinSubTab('bg');
                }}
                className={`flex-1 py-2 rounded-full flex items-center justify-center transition-all ${
                  skinSubTab === 'bg'
                    ? 'bg-[#00b4d8] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Palette className="w-5 h-5" />
              </button>

              {/* Tab 3: Avatars & Frames */}
              <button
                onClick={() => {
                  audio.playClick();
                  setSkinSubTab('avatar');
                }}
                className={`flex-1 py-2 rounded-full flex items-center justify-center transition-all ${
                  skinSubTab === 'avatar'
                    ? 'bg-[#00b4d8] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Shop Card with Cyan/White Striped Awning */}
          <div className="flex-1 px-4 my-3 flex flex-col items-center">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-white/60">
              {/* Striped Awning Roof (Screenshot 2, 4, 5 match) */}
              <div className="w-full h-10 flex overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-b-xl ${
                      i % 2 === 0 ? 'bg-[#00b4d8]' : 'bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* SUB-TAB 1: BOTTLE SKINS (Screenshot 5) */}
              {skinSubTab === 'bottles' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-3">
                    {BOTTLE_SKINS.map((bSkin) => {
                      const isSelected = selectedBottleSkin === bSkin.id;
                      return (
                        <div
                          key={bSkin.id}
                          onClick={() => {
                            audio.playClick();
                            setSelectedBottleSkin(bSkin.id);
                          }}
                          className={`relative rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 ${
                            isSelected
                              ? 'bg-purple-50 ring-4 ring-purple-300 shadow-md'
                              : 'bg-slate-200/80 hover:bg-slate-300/80'
                          }`}
                        >
                          {/* 3 mini bottles rack preview */}
                          <div className="flex gap-1.5 h-20 items-end justify-center py-2">
                            {[1, 2, 3].map((_, idx) => (
                              <div
                                key={idx}
                                className="w-4 h-16 rounded-t-sm rounded-b-md border border-slate-700 shadow-sm relative overflow-hidden"
                                style={{ backgroundColor: bSkin.color }}
                              >
                                <div className="absolute top-0 inset-x-0 h-2 bg-amber-800" />
                              </div>
                            ))}
                          </div>

                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Coin Buttons inside card */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        audio.playClick();
                        if (coins >= 500) {
                          setCoins((c) => c - 500);
                          confetti({ particleCount: 40 });
                        }
                      }}
                      className="flex-1 py-3 rounded-2xl bg-[#00b4d8] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <Dices className="w-5 h-5 text-amber-300" />
                      <span>🪙 500</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playClick();
                        setCoins((c) => c + 200);
                        confetti({ particleCount: 50 });
                      }}
                      className="flex-1 py-3 rounded-2xl bg-[#ff4081] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md active:scale-95 relative"
                    >
                      <span>🪙 +200</span>
                      <span className="absolute -top-2 -right-1 bg-amber-300 text-[#ff4081] text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                        AD
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: BACKGROUNDS (Screenshot 4) */}
              {skinSubTab === 'bg' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-3">
                    {BACKGROUNDS.map((bg) => {
                      const isSelected = selectedBg === bg.id;
                      return (
                        <div
                          key={bg.id}
                          onClick={() => {
                            audio.playClick();
                            setSelectedBg(bg.id);
                          }}
                          className={`relative h-32 rounded-2xl cursor-pointer overflow-hidden transition-transform duration-200 active:scale-95 shadow-sm ${
                            isSelected ? 'ring-4 ring-purple-400 scale-105' : 'hover:opacity-90'
                          }`}
                          style={{ backgroundColor: bg.preview }}
                        >
                          {/* Mini Landscape Vector representation */}
                          <div className="w-full h-full flex flex-col justify-between p-2">
                            <div className="text-[10px] font-black text-slate-800/80 bg-white/70 px-1.5 py-0.5 rounded-md inline-block self-start">
                              {bg.name}
                            </div>
                            <div className="w-full h-8 bg-slate-900/30 rounded-b-xl" />
                          </div>

                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Coin Buttons inside card */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        audio.playClick();
                        if (coins >= 1000) {
                          setCoins((c) => c - 1000);
                          confetti({ particleCount: 50 });
                        }
                      }}
                      className="flex-1 py-3 rounded-2xl bg-[#00b4d8] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <Dices className="w-5 h-5 text-amber-300" />
                      <span>🪙 1000</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playClick();
                        setCoins((c) => c + 200);
                        confetti({ particleCount: 50 });
                      }}
                      className="flex-1 py-3 rounded-2xl bg-[#ff4081] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md active:scale-95 relative"
                    >
                      <span>🪙 +200</span>
                      <span className="absolute -top-2 -right-1 bg-amber-300 text-[#ff4081] text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                        AD
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: AVATARS & FRAMES (Screenshot 2) */}
              {skinSubTab === 'avatar' && (
                <div className="p-3 flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="text-center font-black text-[#00b4d8] text-lg mb-2">
                    Avatar/Frame
                  </div>

                  {/* Avatars Grid (5 columns) */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {AVATARS.map((av) => {
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <div
                          key={av.id}
                          onClick={() => {
                            audio.playClick();
                            setSelectedAvatar(av.id);
                          }}
                          className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl cursor-pointer shadow-sm transition-transform active:scale-90 ${
                            isSelected
                              ? 'ring-2 ring-purple-500 scale-105'
                              : 'hover:opacity-90'
                          }`}
                          style={{ backgroundColor: av.bg }}
                        >
                          <span>{av.emoji}</span>
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Frames Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {FRAMES.map((fr) => {
                      const isSelected = selectedFrame === fr.id;
                      return (
                        <div
                          key={fr.id}
                          onClick={() => {
                            audio.playClick();
                            setSelectedFrame(fr.id);
                          }}
                          className={`relative w-12 h-12 rounded-xl bg-slate-200/80 flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                            fr.border
                          } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                        >
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Coin Buttons inside card */}
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => {
                        audio.playClick();
                        if (coins >= 500) {
                          setCoins((c) => c - 500);
                          confetti({ particleCount: 50 });
                        }
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-[#00b4d8] text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Dices className="w-4 h-4 text-amber-300" />
                      <span>🪙 500</span>
                    </button>

                    <button
                      onClick={() => {
                        audio.playClick();
                        setCoins((c) => c + 200);
                        confetti({ particleCount: 50 });
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-[#ff4081] text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 relative"
                    >
                      <span>🪙 +200</span>
                      <span className="absolute -top-2 -right-1 bg-amber-300 text-[#ff4081] text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                        AD
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: LEADERBOARD (TROPHY TAB) (Screenshot 3 match)
         ========================================================================= */}
      {currentTab === 'leaderboard' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Top Bar: Settings & Coins */}
          <div className="flex items-center justify-between px-5 pt-4">
            <button
              onClick={() => {
                audio.playClick();
                onOpenSettings();
              }}
              className="w-11 h-11 rounded-full bg-[#4a365b]/60 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center text-[#fbc02d] active:scale-95"
            >
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 bg-[#5d4468]/70 backdrop-blur-md border border-white/20 rounded-full py-1 pl-2 pr-2.5 shadow-md">
              <span className="text-xl">🪙</span>
              <span className="text-white font-extrabold text-base tracking-wide">
                {coins}
              </span>
              <button
                onClick={() => {
                  audio.playClick();
                  setCoins((c) => c + 100);
                }}
                className="w-5 h-5 rounded-md bg-[#fbc02d] text-[#5d4468] flex items-center justify-center font-black text-sm ml-1"
              >
                +
              </button>
            </div>
          </div>

          {/* Leaderboard Card with Cyan Ribbon Header */}
          <div className="flex-1 px-4 my-2 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-white/70 relative">
              {/* Cyan Header Ribbon Banner */}
              <div className="relative w-full flex items-center justify-center pt-3 pb-2 bg-gradient-to-r from-[#00b4d8] to-[#0096c7] shadow-md">
                <div className="absolute -left-2 top-2 w-4 h-8 bg-[#0077b6] -skew-y-12 -z-10 rounded-l" />
                <div className="absolute -right-2 top-2 w-4 h-8 bg-[#0077b6] skew-y-12 -z-10 rounded-r" />
                <h2 className="text-2xl font-black text-white tracking-wider drop-shadow">
                  Leaderboard
                </h2>
              </div>

              {/* Ranked Players List */}
              <div className="p-3 flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[52vh]">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19807</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 border-2 border-amber-400 flex items-center justify-center text-xl shadow-sm">
                      👩
                    </div>
                    <span className="font-bold text-slate-700 text-sm">Haley</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">50</div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19808</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-rose-400 flex items-center justify-center text-xl shadow-sm">
                      🧔
                    </div>
                    <span className="font-bold text-slate-700 text-sm">田中健</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">47</div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19809</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-yellow-100 border-2 border-cyan-400 flex items-center justify-center text-xl shadow-sm">
                      🧑‍🦱
                    </div>
                    <span className="font-bold text-slate-700 text-sm">Jimmy</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">44</div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19810</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-red-100 border-2 border-stone-500 flex items-center justify-center text-xl shadow-sm">
                      🌹
                    </div>
                    <span className="font-bold text-slate-700 text-sm">木魚</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">40</div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19811</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-green-100 border-2 border-emerald-400 flex items-center justify-center text-xl shadow-sm">
                      👧
                    </div>
                    <span className="font-bold text-slate-700 text-sm">市口</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">35</div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19812</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 border-2 border-amber-400 flex items-center justify-center text-xl shadow-sm">
                      🐱
                    </div>
                    <span className="font-bold text-slate-700 text-sm">柔妹</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">31</div>
                  </div>
                </div>

                {/* RANK 19813: YOU (Highlighted in Lavender Row - Exact Screenshot Match) */}
                <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#ede7f6] border-2 border-purple-300 shadow-sm">
                  <span className="font-black text-purple-700 w-14 text-sm">19813</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                        FRAMES.find((f) => f.id === selectedFrame)?.border || 'border-2 border-purple-400'
                      }`}
                      style={{
                        backgroundColor:
                          AVATARS.find((a) => a.id === selectedAvatar)?.bg || '#fed7aa',
                      }}
                    >
                      {AVATARS.find((a) => a.id === selectedAvatar)?.emoji || '👩'}
                    </div>
                    <span className="font-black text-purple-900 text-sm tracking-wider">
                      YOU
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-purple-600 font-bold uppercase">Score</div>
                    <div className="font-black text-purple-800 text-lg leading-none">
                      {playerScore}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50">
                  <span className="font-extrabold text-[#00b4d8] w-14 text-sm">19814</span>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-xl shadow-sm">
                      🐕
                    </div>
                    <span className="font-bold text-slate-700 text-sm">Hugh</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-black text-[#00b4d8] text-base leading-none">25</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: GAMEPLAY SCREEN & WATER POURING
         ========================================================================= */}
      {currentTab === 'gameplay' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          <div className="flex items-center justify-between px-5 pt-4">
            <button
              onClick={() => {
                audio.playClick();
                onOpenSettings();
              }}
              className="w-11 h-11 rounded-full bg-[#4a365b]/60 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center text-[#fbc02d] active:scale-95"
            >
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div className="text-3xl font-black text-[#2b1f3d] tracking-wide drop-shadow-sm">
              Moves:{movesLeft}
            </div>

            <button
              onClick={() => {
                audio.playClick();
                handleReset();
              }}
              className="w-11 h-11 rounded-full bg-[#4a365b]/60 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center text-[#fbc02d] active:scale-95"
            >
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          <div className="px-5 pt-1 flex justify-between items-center">
            <button
              onClick={() => {
                audio.playClick();
                setCurrentTab('map');
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#4a365b] bg-white/40 backdrop-blur-sm px-2.5 py-1 rounded-full hover:bg-white/60"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Level Map
            </button>

            <span className="text-xs font-black tracking-wider text-[#4a365b] bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full">
              LEVEL {currentLevel}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center px-2 py-6 relative">
            <div className="flex items-end justify-center gap-3.5 relative max-w-full">
              {bottles.map((bottle, bIdx) => {
                const isSelected = selectedBottle === bIdx;
                const isSourcePouring = pourAnim && pourAnim.fromIdx === bIdx;
                const isTargetPouring = pourAnim && pourAnim.toIdx === bIdx;
                const isFullAndUniform =
                  bottle.length === 4 && bottle.every((c) => c === bottle[0]);

                let bottleTransform = '';
                let zIndex = isSelected ? 30 : isSourcePouring ? 50 : 10;

                if (isSourcePouring) {
                  const slotDiff = pourAnim.toIdx - pourAnim.fromIdx;
                  const isRight = pourAnim.direction === 'right';
                  const targetX = slotDiff * 68 + (isRight ? -12 : 12);
                  const targetY = -28;
                  const rotateAngle = isRight ? 62 : -62;
                  bottleTransform = `translate(${targetX}px, ${targetY}px) rotate(${rotateAngle}deg)`;
                } else if (isSelected) {
                  bottleTransform = 'translateY(-24px) scale(1.04)';
                }

                const surfaceY = 196 - bottle.length * 38;
                const streamHeight = Math.max(28, 24 + surfaceY);

                return (
                  <div
                    key={bIdx}
                    onClick={() => handleBottleClick(bIdx)}
                    className="relative flex flex-col items-center cursor-pointer select-none transition-all duration-300"
                    style={{
                      transform: bottleTransform,
                      transformOrigin: '27px 10px',
                      zIndex,
                    }}
                  >
                    <div className="relative w-[54px] h-[198px]">
                      {isFullAndUniform && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-4 bg-amber-800 rounded-sm border border-amber-950 flex items-center justify-center shadow z-20 animate-bounce">
                          <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />
                        </div>
                      )}

                      <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 60 220">
                        <defs>
                          <clipPath id={`bottleClip-${bIdx}`}>
                            <path d="M 18 14 L 42 14 L 42 26 Q 42 40 50 50 L 50 190 Q 50 212 30 212 Q 10 212 10 190 L 10 50 Q 18 40 18 26 Z" />
                          </clipPath>
                          <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
                            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        <path
                          d="M 17 8 L 43 8 Q 45 8 45 11 L 45 14 Q 42 14 42 26 Q 42 40 52 50 L 52 192 Q 52 216 30 216 Q 8 216 8 192 L 8 50 Q 18 40 18 26 Q 18 14 15 14 L 15 11 Q 15 8 17 8 Z"
                          fill={selectedBottleSkin === 'amber' ? 'rgba(180,83,9,0.2)' : 'url(#glassSheen)'}
                          stroke="#342442"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />

                        <rect
                          x="13"
                          y="6"
                          width="34"
                          height="6"
                          rx="3"
                          fill="rgba(255,255,255,0.7)"
                          stroke="#342442"
                          strokeWidth="2"
                        />

                        <g clipPath={`url(#bottleClip-${bIdx})`}>
                          {bottle.map((color, sIdx) => {
                            const segmentHeight = 38;
                            const yPos = 212 - (sIdx + 1) * segmentHeight;
                            return (
                              <g key={sIdx}>
                                <rect
                                  x="8"
                                  y={yPos}
                                  width="44"
                                  height={segmentHeight + 2}
                                  fill={color}
                                  stroke={color}
                                />
                                <line
                                  x1="8"
                                  y1={yPos}
                                  x2="52"
                                  y2={yPos}
                                  stroke="rgba(255,255,255,0.3)"
                                  strokeWidth="1.5"
                                />
                              </g>
                            );
                          })}

                          {isSourcePouring && (
                            <rect
                              x="18"
                              y="8"
                              width="24"
                              height="35"
                              fill={pourAnim.color}
                              opacity="0.95"
                            />
                          )}

                          {isTargetPouring && (
                            <rect
                              x="8"
                              y={212 - (bottle.length + 1) * 38}
                              width="44"
                              height={40}
                              fill={pourAnim.color}
                              className="animate-pulse"
                              opacity="0.95"
                            />
                          )}
                        </g>

                        <path
                          d="M 14 55 L 14 185"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      </svg>
                    </div>

                    {isTargetPouring && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-40 flex flex-col items-center"
                        style={{ top: '-24px' }}
                      >
                        <div
                          className="w-[7px] rounded-full relative"
                          style={{
                            height: `${streamHeight}px`,
                            backgroundColor: pourAnim.color,
                            boxShadow: `0 0 8px ${pourAnim.color}`,
                          }}
                        >
                          <div className="absolute inset-y-0 left-0.5 w-[2px] bg-white/45 rounded-full" />
                        </div>

                        <div className="relative w-8 h-3 -mt-1 flex items-center justify-center pointer-events-none">
                          <div
                            className="w-1.5 h-1.5 rounded-xs animate-ping absolute -left-2 -top-1 opacity-90"
                            style={{ backgroundColor: pourAnim.color }}
                          />
                          <div
                            className="w-2 h-2 rounded-xs animate-bounce absolute -top-1"
                            style={{ backgroundColor: pourAnim.color }}
                          />
                          <div
                            className="w-1.5 h-1.5 rounded-xs animate-pulse absolute -right-2 -top-1.5 opacity-90"
                            style={{ backgroundColor: pourAnim.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between px-7 pb-6 z-20">
            <button
              onClick={handleUndo}
              disabled={isPouring || undoCount <= 0 || history.length === 0}
              className={`relative w-16 h-16 rounded-2xl bg-[#342442]/85 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-all ${
                undoCount <= 0 || history.length === 0
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-[#342442]'
              }`}
            >
              <Undo2 className="w-7 h-7 text-[#fbc02d] stroke-[2.8]" />
              <span className="text-white font-extrabold text-sm leading-none mt-0.5">
                {undoCount}
              </span>
            </button>

            <button
              onClick={handleAddBottle}
              disabled={isPouring || addBottleCount <= 0 || bottles.length >= 7}
              className={`relative w-16 h-16 rounded-2xl bg-[#342442]/85 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-all ${
                addBottleCount <= 0 || bottles.length >= 7
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-[#342442]'
              }`}
            >
              <div className="flex items-center text-[#fbc02d]">
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="text-lg">🧪</span>
              </div>
              <span className="text-white font-extrabold text-sm leading-none mt-0.5">
                {addBottleCount}
              </span>
            </button>
          </div>

          {completed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl flex flex-col items-center text-center border-4 border-amber-300">
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  LEVEL COMPLETED!
                </h2>
                <p className="text-slate-600 font-semibold text-sm mb-4">
                  Great job! You sorted all the test tubes!
                </p>

                <div className="flex gap-3 mb-5">
                  <div className="bg-amber-100 text-amber-900 px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-sm">
                    <span>🪙</span> +25 Coins
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      audio.playClick();
                      const nextLvl = currentLevel + 1;
                      if (LEVELS[nextLvl]) {
                        startLevel(nextLvl);
                      } else {
                        setCurrentTab('map');
                      }
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff539a] to-[#f43f5e] border-b-4 border-[#b91c5c] text-white font-black text-base uppercase tracking-wider shadow-lg active:scale-95"
                  >
                    NEXT LEVEL
                  </button>

                  <button
                    onClick={() => {
                      audio.playClick();
                      setCurrentTab('map');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                  >
                    Level Map
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (3 TABS: PALETTE, HOME, TROPHY)
         ========================================================================= */}
      <div className="w-full bg-[#1b1126]/90 backdrop-blur-md flex items-center justify-around py-2 border-t border-white/10 z-20">
        <button
          onClick={() => {
            audio.playClick();
            setCurrentTab('skin');
          }}
          className={`p-2.5 rounded-2xl transition-all ${
            currentTab === 'skin'
              ? 'bg-[#e87a7a] text-white shadow-md scale-105'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Palette className="w-7 h-7" />
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setCurrentTab('map');
          }}
          className={`px-6 py-2.5 rounded-xl transition-all ${
            currentTab === 'map' || currentTab === 'gameplay'
              ? 'bg-[#e87a7a] text-white shadow-md scale-105'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Home className="w-7 h-7 fill-white stroke-none" />
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setCurrentTab('leaderboard');
          }}
          className={`p-2.5 rounded-2xl transition-all ${
            currentTab === 'leaderboard'
              ? 'bg-[#e87a7a] text-white shadow-md scale-105'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Trophy className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
