import React from 'react';
import { Pause, Home, RotateCcw, Award, SkipForward, Lightbulb, Paintbrush, RefreshCw, Coins } from 'lucide-react';
import audio from '../game/AudioEngine';

export default function TopBar({
  level,
  coins = 34,
  onHome,
  onRestart,
  onHint,
  onSkip,
  onRemoveCar,
  onOpenSettings,
}) {
  const levelNum = level ? String(level.id).padStart(2, '0') : '01';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-20 select-none">
      {/* 1. TOP HEADER (Exact match from user screenshot Image 1 & 2) */}
      <div className="flex items-start justify-between pointer-events-auto">
        {/* Left: 3 Light Blue Rounded Squircle Buttons */}
        <div className="flex flex-col gap-2">
          {/* Pause Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-11 h-11 rounded-2xl bg-[#7dd3fc] border-2 border-white/80 shadow-[0_4px_0_#0284c7] flex items-center justify-center text-white cursor-pointer active:translate-y-1 active:shadow-none transition-all"
            title="Pause"
          >
            <Pause className="w-6 h-6 fill-current" />
          </button>

          {/* Paint Roller / Skins Button (from Image 1) */}
          <button
            onClick={() => {
              audio.playClick();
            }}
            className="w-11 h-11 rounded-2xl bg-[#7dd3fc] border-2 border-white/80 shadow-[0_4px_0_#0284c7] flex items-center justify-center text-white cursor-pointer active:translate-y-1 active:shadow-none transition-all"
            title="Themes & Skins"
          >
            <Paintbrush className="w-5 h-5 fill-current" />
          </button>

          {/* Home Button (from Image 1) */}
          <button
            onClick={() => {
              audio.playClick();
              onHome();
            }}
            className="w-11 h-11 rounded-2xl bg-[#7dd3fc] border-2 border-white/80 shadow-[0_4px_0_#0284c7] flex items-center justify-center text-white cursor-pointer active:translate-y-1 active:shadow-none transition-all"
            title="Return to Menu"
          >
            <Home className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Center: "Level 03" with glowing horizontal line (Exact from Image 1 & 2) */}
        <div className="flex flex-col items-center pt-1">
          <span className="game-title text-3xl font-black text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Level {levelNum}
          </span>
          {/* Horizontal glowing underline bar from screenshot */}
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] mt-1" />
        </div>

        {/* Right: Restart & Ribbon Medal Buttons + Top Coin Balance */}
        <div className="flex flex-col items-end gap-2">
          {/* Top-Right Coin Balance Badge (34 from screenshot) */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/40 text-xs font-black text-amber-300 shadow-md -mt-1 mb-1">
            <span>{coins}</span>
            <Coins className="w-3.5 h-3.5 fill-current text-amber-400" />
          </div>

          {/* Restart Button (from Image 2) */}
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-11 h-11 rounded-2xl bg-[#7dd3fc] border-2 border-white/80 shadow-[0_4px_0_#0284c7] flex items-center justify-center text-white cursor-pointer active:translate-y-1 active:shadow-none transition-all"
            title="Restart Level"
          >
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Medal Ribbon Button with AD tag (from Image 1) */}
          <button
            onClick={() => {
              audio.playClick();
            }}
            className="w-11 h-11 rounded-2xl bg-[#7dd3fc] border-2 border-white/80 shadow-[0_4px_0_#0284c7] flex items-center justify-center text-white cursor-pointer active:translate-y-1 active:shadow-none transition-all relative"
            title="Achievements"
          >
            <Award className="w-6 h-6" />
            <div className="absolute -top-1.5 -right-1.5 bg-[#22c55e] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-md">
              AD
            </div>
          </button>
        </div>
      </div>

      {/* 2. BOTTOM TOOLBAR (Exact 3 Cyan Glossy Pill Buttons with AD in top-right from Image 1 & 2) */}
      <div className="pointer-events-auto pb-2 flex items-center justify-center gap-3">
        {/* Button 1: Skip */}
        <button
          onClick={() => {
            audio.playClick();
            onSkip();
          }}
          className="btn-carout-cyan relative px-4 py-2.5 rounded-2xl flex items-center gap-1.5 text-white font-black text-xs uppercase tracking-wide cursor-pointer shadow-lg active:scale-95 transition-all"
        >
          <div className="absolute -top-1.5 -right-1.5 bg-[#22c55e] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-md">
            AD
          </div>
          <SkipForward className="w-4 h-4 fill-current" />
          <span>Skip</span>
        </button>

        {/* Button 2: Hint */}
        <button
          onClick={() => {
            audio.playClick();
            onHint();
          }}
          className="btn-carout-cyan relative px-6 py-2.5 rounded-2xl flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider cursor-pointer shadow-xl scale-105 active:scale-100 transition-all"
        >
          <div className="absolute -top-1.5 -right-1.5 bg-[#22c55e] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-md">
            AD
          </div>
          <Lightbulb className="w-5 h-5 fill-current text-yellow-300" />
          <span>Hint</span>
        </button>

        {/* Button 3: Remove (Car inside circular arrows from screenshot) */}
        <button
          onClick={() => {
            audio.playClick();
            onRemoveCar();
          }}
          className="btn-carout-cyan relative px-4 py-2.5 rounded-2xl flex items-center gap-1.5 text-white font-black text-xs uppercase tracking-wide cursor-pointer shadow-lg active:scale-95 transition-all"
        >
          <div className="absolute -top-1.5 -right-1.5 bg-[#22c55e] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-md">
            AD
          </div>
          <RefreshCw className="w-4 h-4" />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
}
