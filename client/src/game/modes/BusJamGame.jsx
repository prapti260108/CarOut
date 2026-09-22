import React, { useEffect, useState, useRef, useMemo } from 'react';
import { RotateCcw, ArrowRight, CheckCircle2, Film, ChevronLeft } from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

// Color definitions matching the screenshot
export const COLOR_CONFIG = {
  '#EF4444': { name: 'red', top: '#ef4444', side: '#dc2626', dark: '#991b1b', light: '#f87171' },
  '#EAB308': { name: 'yellow', top: '#facc15', side: '#eab308', dark: '#a16207', light: '#fef08a' },
  '#22C55E': { name: 'green', top: '#22c55e', side: '#16a34a', dark: '#15803d', light: '#86efac' },
  '#3B82F6': { name: 'blue', top: '#3b82f6', side: '#2563eb', dark: '#1d4ed8', light: '#93c5fd' },
  '#EC4899': { name: 'pink', top: '#f472b6', side: '#ec4899', dark: '#be185d', light: '#fbcfe8' },
  '#A855F7': { name: 'purple', top: '#c084fc', side: '#a855f7', dark: '#7e22ce', light: '#e9d5ff' },
  '#06B6D4': { name: 'cyan', top: '#22d3ee', side: '#06b6d4', dark: '#0e7490', light: '#a5f3fc' },
  '#F97316': { name: 'orange', top: '#fb923c', side: '#f97316', dark: '#c2410c', light: '#fed7aa' },
};

// ──────────────────────────────────────────────────────────
// 3D ISOMETRIC BUS COMPONENT (Properly scaled: 38px x 74px)
// ──────────────────────────────────────────────────────────
export function Bus3D({
  color = '#EF4444',
  angle = 315,
  isBlocked = false,
  isShaking = false,
  isInDock = false,
  boardedCount = 0,
  capacity = 4,
  onClick,
}) {
  const cfg = COLOR_CONFIG[color] || COLOR_CONFIG['#EF4444'];
  const busWidth = 28;
  const busHeight = 56;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none transition-transform active:scale-95 ${
        isShaking ? 'animate-car-wiggle' : ''
      }`}
      style={{
        width: `${busWidth}px`,
        height: `${busHeight}px`,
        transform: isInDock ? 'none' : `rotate(${angle}deg)`,
        transformOrigin: 'center center',
      }}
      title={isBlocked ? 'Blocked by other car!' : 'Click to drive into parking bay'}
    >
      <svg
        viewBox="0 0 38 74"
        className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] overflow-visible"
      >
        <defs>
          <linearGradient id={`busRoofGrad_${cfg.name}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={cfg.light} />
            <stop offset="40%" stopColor={cfg.top} />
            <stop offset="100%" stopColor={cfg.side} />
          </linearGradient>

          <filter id="busArrowShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Ground Contact Shadow */}
        <ellipse cx="19" cy="38" rx="17" ry="35" fill="rgba(0,0,0,0.28)" filter="blur(2px)" />

        {/* 2. Side Wheels */}
        <rect x="0" y="14" width="2.5" height="10" rx="1" fill="#0f172a" />
        <rect x="0.5" y="16.5" width="1.5" height="5" rx="0.7" fill="#94a3b8" />
        <rect x="0" y="48" width="2.5" height="10" rx="1" fill="#0f172a" />
        <rect x="0.5" y="50.5" width="1.5" height="5" rx="0.7" fill="#94a3b8" />

        <rect x="35.5" y="14" width="2.5" height="10" rx="1" fill="#0f172a" />
        <rect x="36" y="16.5" width="1.5" height="5" rx="0.7" fill="#94a3b8" />
        <rect x="35.5" y="48" width="2.5" height="10" rx="1" fill="#0f172a" />
        <rect x="36" y="50.5" width="1.5" height="5" rx="0.7" fill="#94a3b8" />

        {/* 3. Lower Chassis */}
        <rect x="2" y="2" width="34" height="70" rx="8" fill={cfg.dark} />

        {/* 4. Upper Main Body */}
        <rect
          x="3"
          y="3"
          width="32"
          height="68"
          rx="7.5"
          fill={`url(#busRoofGrad_${cfg.name})`}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.2"
        />

        {/* 5. Curved Front Windshield */}
        <path
          d="M 5 13 Q 19 7 33 13 L 33 20 Q 19 15 5 20 Z"
          fill="#090d16"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
        />
        {/* Windshield Glare Streak */}
        <path d="M 10 12 Q 17 9 22 10 L 20 17 Q 15 15 8 16 Z" fill="rgba(255,255,255,0.6)" />

        {/* Headlights */}
        <circle cx="7" cy="5.5" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
        <circle cx="31" cy="5.5" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />

        {/* 6. Side Windows */}
        <rect x="4" y="23" width="1.8" height="7.5" rx="0.8" fill="#090d16" />
        <rect x="4" y="33" width="1.8" height="7.5" rx="0.8" fill="#090d16" />
        <rect x="4" y="43" width="1.8" height="7.5" rx="0.8" fill="#090d16" />
        <rect x="4" y="53" width="1.8" height="7.5" rx="0.8" fill="#090d16" />

        <rect x="32.2" y="23" width="1.8" height="7.5" rx="0.8" fill="#090d16" />
        <rect x="32.2" y="33" width="1.8" height="7.5" rx="0.8" fill="#090d16" />
        <rect x="32.2" y="43" width="1.8" height="7.5" rx="0.8" fill="#090d16" />
        <rect x="32.2" y="53" width="1.8" height="7.5" rx="0.8" fill="#090d16" />

        {/* 7. Rear Window & Taillights */}
        <rect x="7" y="64" width="24" height="3" rx="1.5" fill="#090d16" />
        <rect x="5" y="67.5" width="4" height="1.5" rx="0.7" fill="#ef4444" />
        <rect x="29" y="67.5" width="4" height="1.5" rx="0.7" fill="#ef4444" />

        {/* 8. ROOF: DIRECTION ARROW (in Jam) OR PASSENGERS SITTING (in Dock) */}
        {!isInDock ? (
          /* Bold White Direction Arrow */
          <g filter="url(#busArrowShadow)">
            <path
              d="M 19 24 L 28 36 L 23 36 L 23 58 L 15 58 L 15 36 L 10 36 Z"
              fill="#ffffff"
            />
          </g>
        ) : (
          /* 4 Passenger Seats in Dock View with 3D Sitting Figures */
          <g>
            {/* 4 Seat Positions */}
            <circle cx="12" cy="30" r="4.2" fill={boardedCount >= 1 ? cfg.top : 'rgba(0,0,0,0.35)'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="26" cy="30" r="4.2" fill={boardedCount >= 2 ? cfg.top : 'rgba(0,0,0,0.35)'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="12" cy="48" r="4.2" fill={boardedCount >= 3 ? cfg.top : 'rgba(0,0,0,0.35)'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="26" cy="48" r="4.2" fill={boardedCount >= 4 ? cfg.top : 'rgba(0,0,0,0.35)'} stroke="#ffffff" strokeWidth="0.8" />

            {/* Render 3D Passenger Figures for occupied seats */}
            {boardedCount >= 1 && <circle cx="12" cy="28" r="4.5" fill={cfg.top} stroke="#ffffff" strokeWidth="1" />}
            {boardedCount >= 2 && <circle cx="26" cy="28" r="4.5" fill={cfg.top} stroke="#ffffff" strokeWidth="1" />}
            {boardedCount >= 3 && <circle cx="12" cy="46" r="4.5" fill={cfg.top} stroke="#ffffff" strokeWidth="1" />}
            {boardedCount >= 4 && <circle cx="26" cy="46" r="4.5" fill={cfg.top} stroke="#ffffff" strokeWidth="1" />}
          </g>
        )}
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 3D ISOMETRIC CAR / SEDAN COMPONENT (Scaled: 32px x 48px)
// ──────────────────────────────────────────────────────────
export function Car3D({
  color = '#22C55E',
  angle = 315,
  isBlocked = false,
  isShaking = false,
  isInDock = false,
  boardedCount = 0,
  capacity = 2,
  onClick,
}) {
  const cfg = COLOR_CONFIG[color] || COLOR_CONFIG['#22C55E'];
  const carWidth = 24;
  const carHeight = 38;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none transition-transform active:scale-95 ${
        isShaking ? 'animate-car-wiggle' : ''
      }`}
      style={{
        width: `${carWidth}px`,
        height: `${carHeight}px`,
        transform: isInDock ? 'none' : `rotate(${angle}deg)`,
        transformOrigin: 'center center',
      }}
      title={isBlocked ? 'Blocked by other car!' : 'Click to drive into parking bay'}
    >
      <svg
        viewBox="0 0 32 48"
        className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] overflow-visible"
      >
        <defs>
          <linearGradient id={`carRoofGrad_${cfg.name}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={cfg.light} />
            <stop offset="40%" stopColor={cfg.top} />
            <stop offset="100%" stopColor={cfg.side} />
          </linearGradient>
          <filter id="carArrowShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Ground Contact Shadow */}
        <ellipse cx="16" cy="26" rx="14" ry="22" fill="rgba(0,0,0,0.28)" filter="blur(1.8px)" />

        {/* 2. Wheels */}
        <rect x="0" y="9" width="2" height="7.5" rx="0.8" fill="#0f172a" />
        <rect x="0" y="32" width="2" height="7.5" rx="0.8" fill="#0f172a" />
        <rect x="30" y="9" width="2" height="7.5" rx="0.8" fill="#0f172a" />
        <rect x="30" y="32" width="2" height="7.5" rx="0.8" fill="#0f172a" />

        {/* 3. 3D Body */}
        <rect x="2" y="2" width="28" height="44" rx="7" fill={cfg.dark} />
        <rect
          x="3"
          y="3"
          width="26"
          height="42"
          rx="6"
          fill={`url(#carRoofGrad_${cfg.name})`}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.1"
        />

        {/* 4. Windshield */}
        <path
          d="M 4 9.5 Q 16 5.5 28 9.5 L 27 15.5 Q 16 11 5 15.5 Z"
          fill="#090d16"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.7"
        />
        <path d="M 9 9 Q 15 7 19 8 L 17 13 Q 13 11 7 12 Z" fill="rgba(255,255,255,0.6)" />

        {/* Headlights */}
        <circle cx="6" cy="4.5" r="1.8" fill="#fef08a" />
        <circle cx="26" cy="4.5" r="1.8" fill="#fef08a" />

        {/* Rear Window & Taillights */}
        <rect x="6" y="38" width="20" height="2.5" rx="1.2" fill="#090d16" />
        <rect x="4.5" y="41.5" width="3.5" height="1.2" rx="0.6" fill="#ef4444" />
        <rect x="24" y="41.5" width="3.5" height="1.2" rx="0.6" fill="#ef4444" />

        {/* 5. Roof Arrow OR Seats in Dock */}
        {!isInDock ? (
          <g filter="url(#carArrowShadow)">
            <path
              d="M 16 17 L 24 25 L 19.5 25 L 19.5 37 L 12.5 37 L 12.5 25 L 8 25 Z"
              fill="#ffffff"
            />
          </g>
        ) : (
          <g>
            <circle cx="11" cy="26" r="3.8" fill={boardedCount >= 1 ? cfg.top : 'rgba(0,0,0,0.35)'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="21" cy="26" r="3.8" fill={boardedCount >= 2 ? cfg.top : 'rgba(0,0,0,0.35)'} stroke="#ffffff" strokeWidth="0.8" />

            {/* Render 3D Passenger Figures for occupied seats */}
            {boardedCount >= 1 && <circle cx="11" cy="24" r="4.2" fill={cfg.top} stroke="#ffffff" strokeWidth="1" />}
            {boardedCount >= 2 && <circle cx="21" cy="24" r="4.2" fill={cfg.top} stroke="#ffffff" strokeWidth="1" />}
          </g>
        )}
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 3D JELLY PASSENGER
// ──────────────────────────────────────────────────────────
function JellyPassenger({ color = '#EF4444', isWalking = false }) {
  const cfg = COLOR_CONFIG[color] || COLOR_CONFIG['#EF4444'];

  return (
    <div
      className={`relative flex flex-col items-center justify-center shrink-0 select-none ${
        isWalking ? 'animate-passenger-bob scale-110' : ''
      }`}
      style={{ width: '22px', height: '34px' }}
    >
      <div
        className="w-4 h-4 rounded-full shadow-md border border-white/80 relative"
        style={{
          background: `radial-gradient(circle at 35% 25%, #ffffff 0%, ${cfg.top} 45%, ${cfg.dark} 100%)`,
        }}
      >
        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/90 rounded-full blur-[0.2px]" />
      </div>
      <div
        className="w-3.5 h-4 rounded-b-md rounded-t-sm shadow-sm border border-white/50 -mt-0.5"
        style={{ background: `linear-gradient(180deg, ${cfg.top} 0%, ${cfg.dark} 100%)` }}
      />
      <div className="flex gap-1 -mt-0.5">
        <div className="w-1.5 h-2 rounded-b-sm border border-black/20" style={{ backgroundColor: cfg.top }} />
        <div className="w-1.5 h-2 rounded-b-sm border border-black/20" style={{ backgroundColor: cfg.top }} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// AUTHENTIC AD FILM ICON (Matching locked stalls 6, 7, 8)
// ──────────────────────────────────────────────────────────
function AdFilmIcon({ className = 'w-7 h-6' }) {
  return (
    <svg viewBox="0 0 36 28" className={className} fill="none">
      <rect
        x="1.5"
        y="1.5"
        width="33"
        height="25"
        rx="5"
        stroke="#ffffff"
        strokeWidth="2.2"
        fill="rgba(255,255,255,0.06)"
      />
      {/* Film sprocket notches left */}
      <circle cx="4.5" cy="7" r="1.3" fill="#ffffff" />
      <circle cx="4.5" cy="14" r="1.3" fill="#ffffff" />
      <circle cx="4.5" cy="21" r="1.3" fill="#ffffff" />
      {/* Film sprocket notches right */}
      <circle cx="31.5" cy="7" r="1.3" fill="#ffffff" />
      <circle cx="31.5" cy="14" r="1.3" fill="#ffffff" />
      <circle cx="31.5" cy="21" r="1.3" fill="#ffffff" />
      <text
        x="18"
        y="18.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="-0.5"
      >
        AD
      </text>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// 5 PROGRESSIVE LEVELS (Cleanly spaced, ZERO overlap!)
// ──────────────────────────────────────────────────────────
const LEVELS_DATA = [
  // ── LEVEL 1: Easy Starter (5 Vehicles, Very Clear) ──
  {
    id: 1,
    name: 'Level 1',
    initialQueueCount: 16,
    passengers: [
      '#EF4444', '#EF4444', // Red Sedan (2)
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', // Blue Bus (4)
      '#EF4444', '#EF4444', '#EF4444', '#EF4444', // Red Bus (4)
      '#EAB308', '#EAB308', // Yellow Sedan (2)
      '#EAB308', '#EAB308', '#EAB308', '#EAB308', // Yellow Bus (4)
    ],
    vehicles: [
      // Front row (unblocked)
      { id: 'l1_v1', type: 'sedan', color: '#EF4444', capacity: 2, x: 26, y: 25, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l1_v2', type: 'bus', color: '#3B82F6', capacity: 4, x: 74, y: 25, angle: 0, dir: 'up', blockedBy: [] },

      // Second row
      { id: 'l1_v3', type: 'bus', color: '#EF4444', capacity: 4, x: 50, y: 55, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l1_v4', type: 'sedan', color: '#EAB308', capacity: 2, x: 22, y: 72, angle: 0, dir: 'up', blockedBy: ['l1_v1'] },
      { id: 'l1_v5', type: 'bus', color: '#EAB308', capacity: 4, x: 78, y: 72, angle: 0, dir: 'up', blockedBy: ['l1_v2'] },
    ],
  },

  // ── LEVEL 2: Exact V-Chevron Jam Puzzle (Spacious, Zero Overlap!) ──
  {
    id: 2,
    name: 'Level 2',
    initialQueueCount: 391,
    passengers: [
      // Outer unblocked vehicles first
      '#22C55E', '#22C55E', // l2_v1 Green Sedan (2)
      '#EF4444', '#EF4444', '#EF4444', '#EF4444', // l2_v2 Red Bus (4)
      '#3B82F6', '#3B82F6', // l2_v5 Blue Sedan (2)
      '#22C55E', '#22C55E', // l2_v8 Green Sedan (2)
      '#EAB308', '#EAB308', '#EAB308', '#EAB308', // l2_v9 Yellow Bus (4)
      '#EC4899', '#EC4899', '#EC4899', '#EC4899', // l2_v15 Pink Bus (4)

      // Next layers
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', // l2_v3 Blue Bus (4)
      '#22C55E', '#22C55E', '#22C55E', '#22C55E', // l2_v6 Green Bus (4)
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', // l2_v10 Blue Bus (4)
      '#EF4444', '#EF4444', '#EF4444', '#EF4444', // l2_v13 Red Bus (4)
      '#EAB308', '#EAB308', // l2_v12 Yellow Sedan (2)

      // Inner layers
      '#06B6D4', '#06B6D4', // l2_v4 Cyan Sedan (2)
      '#EAB308', '#EAB308', '#EAB308', '#EAB308', // l2_v7 Yellow Bus (4)
      '#EF4444', '#EF4444', // l2_v11 Red Sedan (2)
      '#22C55E', '#22C55E', '#22C55E', '#22C55E', // l2_v14 Green Bus (4)
      '#A855F7', '#A855F7', '#A855F7', '#A855F7', // l2_v16 Purple Bus (4)
    ],
    vehicles: [
      // ── LEFT WING (Angle 315° / facing up-left) ──
      { id: 'l2_v1', type: 'sedan', color: '#22C55E', capacity: 2, x: 10, y: 15, angle: 315, dir: 'up-left' },
      { id: 'l2_v2', type: 'bus',   color: '#EF4444', capacity: 4, x: 17, y: 34, angle: 315, dir: 'up-left' },
      { id: 'l2_v3', type: 'bus',   color: '#3B82F6', capacity: 4, x: 24, y: 55, angle: 315, dir: 'up-left' },
      { id: 'l2_v4', type: 'sedan', color: '#06B6D4', capacity: 2, x: 30, y: 74, angle: 315, dir: 'up-left' },

      { id: 'l2_v5', type: 'sedan', color: '#3B82F6', capacity: 2, x: 27, y: 18, angle: 315, dir: 'up-left' },
      { id: 'l2_v6', type: 'bus',   color: '#22C55E', capacity: 4, x: 36, y: 38, angle: 315, dir: 'up-left' },
      { id: 'l2_v7', type: 'bus',   color: '#EAB308', capacity: 4, x: 40, y: 62, angle: 315, dir: 'up-left' },

      // ── RIGHT WING (Angle 45° / facing up-right) ──
      { id: 'l2_v8',  type: 'sedan', color: '#22C55E', capacity: 2, x: 90, y: 15, angle: 45, dir: 'up-right' },
      { id: 'l2_v9',  type: 'bus',   color: '#EAB308', capacity: 4, x: 83, y: 34, angle: 45, dir: 'up-right' },
      { id: 'l2_v10', type: 'bus',   color: '#3B82F6', capacity: 4, x: 76, y: 55, angle: 45, dir: 'up-right' },
      { id: 'l2_v11', type: 'sedan', color: '#EF4444', capacity: 2, x: 70, y: 74, angle: 45, dir: 'up-right' },

      { id: 'l2_v12', type: 'sedan', color: '#EAB308', capacity: 2, x: 73, y: 18, angle: 45, dir: 'up-right' },
      { id: 'l2_v13', type: 'bus',   color: '#EF4444', capacity: 4, x: 64, y: 38, angle: 45, dir: 'up-right' },
      { id: 'l2_v14', type: 'bus',   color: '#22C55E', capacity: 4, x: 60, y: 62, angle: 45, dir: 'up-right' },

      // ── CENTER CHEVRON (Top & Base) ──
      { id: 'l2_v15', type: 'bus',   color: '#EC4899', capacity: 4, x: 50, y: 22, angle: 0, dir: 'up' },
      { id: 'l2_v16', type: 'bus',   color: '#A855F7', capacity: 4, x: 50, y: 82, angle: 0, dir: 'up' },
    ],
  },

  // ── LEVEL 3: Downtown Grid (12 Vehicles) ──
  {
    id: 3,
    name: 'Level 3',
    initialQueueCount: 36,
    passengers: [
      '#EC4899', '#EC4899',
      '#22C55E', '#22C55E',
      '#EAB308', '#EAB308', '#EAB308', '#EAB308',
      '#EF4444', '#EF4444', '#EF4444', '#EF4444',
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6',
      '#EC4899', '#EC4899', '#EC4899', '#EC4899',
      '#EAB308', '#EAB308',
      '#EF4444', '#EF4444', '#EF4444', '#EF4444',
      '#3B82F6', '#3B82F6',
      '#22C55E', '#22C55E', '#22C55E', '#22C55E',
      '#EAB308', '#EAB308', '#EAB308', '#EAB308',
      '#EF4444', '#EF4444',
    ],
    vehicles: [
      // Left Column
      { id: 'l3_v1', type: 'sedan', color: '#EC4899', capacity: 2, x: 18, y: 18, angle: 315, dir: 'up-left', blockedBy: [] },
      { id: 'l3_v2', type: 'bus', color: '#3B82F6', capacity: 4, x: 15, y: 48, angle: 315, dir: 'up-left', blockedBy: ['l3_v1'] },
      { id: 'l3_v3', type: 'bus', color: '#22C55E', capacity: 4, x: 14, y: 78, angle: 315, dir: 'up-left', blockedBy: ['l3_v2'] },

      // Center-Left
      { id: 'l3_v4', type: 'bus', color: '#EAB308', capacity: 4, x: 38, y: 25, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l3_v5', type: 'bus', color: '#EC4899', capacity: 4, x: 38, y: 62, angle: 0, dir: 'up', blockedBy: ['l3_v4'] },

      // Center-Right
      { id: 'l3_v6', type: 'bus', color: '#EF4444', capacity: 4, x: 62, y: 25, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l3_v7', type: 'sedan', color: '#EAB308', capacity: 2, x: 62, y: 58, angle: 0, dir: 'up', blockedBy: ['l3_v6'] },
      { id: 'l3_v8', type: 'sedan', color: '#EF4444', capacity: 2, x: 50, y: 82, angle: 0, dir: 'up', blockedBy: ['l3_v5', 'l3_v7'] },

      // Right Column
      { id: 'l3_v9', type: 'sedan', color: '#22C55E', capacity: 2, x: 82, y: 18, angle: 45, dir: 'up-right', blockedBy: [] },
      { id: 'l3_v10', type: 'bus', color: '#EF4444', capacity: 4, x: 85, y: 48, angle: 45, dir: 'up-right', blockedBy: ['l3_v9'] },
      { id: 'l3_v11', type: 'sedan', color: '#3B82F6', capacity: 2, x: 86, y: 76, angle: 45, dir: 'up-right', blockedBy: ['l3_v10'] },
      { id: 'l3_v12', type: 'bus', color: '#EAB308', capacity: 4, x: 70, y: 78, angle: 45, dir: 'up-right', blockedBy: ['l3_v7'] },
    ],
  },

  // ── LEVEL 4: Grand Terminal (16 Vehicles) ──
  {
    id: 4,
    name: 'Level 4',
    initialQueueCount: 48,
    passengers: [
      '#EF4444', '#EF4444',
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6',
      '#A855F7', '#A855F7', '#A855F7', '#A855F7',
      '#22C55E', '#22C55E',
      '#EC4899', '#EC4899', '#EC4899', '#EC4899',
      '#EAB308', '#EAB308',
      '#EF4444', '#EF4444', '#EF4444', '#EF4444',
      '#3B82F6', '#3B82F6',
      '#A855F7', '#A855F7',
      '#22C55E', '#22C55E', '#22C55E', '#22C55E',
      '#EC4899', '#EC4899',
      '#EAB308', '#EAB308', '#EAB308', '#EAB308',
      '#EF4444', '#EF4444',
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6',
      '#A855F7', '#A855F7',
      '#22C55E', '#22C55E',
    ],
    vehicles: [
      // 4 Columns, 4 Rows, perfectly spaced
      { id: 'l4_v1', type: 'sedan', color: '#EF4444', capacity: 2, x: 18, y: 16, angle: 315, dir: 'up-left', blockedBy: [] },
      { id: 'l4_v2', type: 'bus', color: '#3B82F6', capacity: 4, x: 40, y: 16, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l4_v3', type: 'bus', color: '#A855F7', capacity: 4, x: 62, y: 16, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l4_v4', type: 'sedan', color: '#22C55E', capacity: 2, x: 82, y: 16, angle: 45, dir: 'up-right', blockedBy: [] },

      { id: 'l4_v5', type: 'bus', color: '#EC4899', capacity: 4, x: 16, y: 40, angle: 315, dir: 'up-left', blockedBy: ['l4_v1'] },
      { id: 'l4_v6', type: 'sedan', color: '#EAB308', capacity: 2, x: 38, y: 39, angle: 0, dir: 'up', blockedBy: ['l4_v2'] },
      { id: 'l4_v7', type: 'bus', color: '#EF4444', capacity: 4, x: 62, y: 39, angle: 0, dir: 'up', blockedBy: ['l4_v3'] },
      { id: 'l4_v8', type: 'sedan', color: '#3B82F6', capacity: 2, x: 84, y: 40, angle: 45, dir: 'up-right', blockedBy: ['l4_v4'] },

      { id: 'l4_v9', type: 'sedan', color: '#A855F7', capacity: 2, x: 15, y: 64, angle: 315, dir: 'up-left', blockedBy: ['l4_v5'] },
      { id: 'l4_v10', type: 'bus', color: '#22C55E', capacity: 4, x: 38, y: 62, angle: 0, dir: 'up', blockedBy: ['l4_v6'] },
      { id: 'l4_v11', type: 'sedan', color: '#EC4899', capacity: 2, x: 62, y: 62, angle: 0, dir: 'up', blockedBy: ['l4_v7'] },
      { id: 'l4_v12', type: 'bus', color: '#EAB308', capacity: 4, x: 85, y: 64, angle: 45, dir: 'up-right', blockedBy: ['l4_v8'] },

      { id: 'l4_v13', type: 'bus', color: '#EF4444', capacity: 4, x: 22, y: 84, angle: 0, dir: 'up', blockedBy: ['l4_v9', 'l4_v10'] },
      { id: 'l4_v14', type: 'bus', color: '#3B82F6', capacity: 4, x: 44, y: 84, angle: 0, dir: 'up', blockedBy: ['l4_v10'] },
      { id: 'l4_v15', type: 'sedan', color: '#A855F7', capacity: 2, x: 64, y: 84, angle: 0, dir: 'up', blockedBy: ['l4_v11'] },
      { id: 'l4_v16', type: 'sedan', color: '#22C55E', capacity: 2, x: 80, y: 84, angle: 0, dir: 'up', blockedBy: ['l4_v12'] },
    ],
  },

  // ── LEVEL 5: Master Jam (20 Vehicles, Exact Palette, Zero Clipping) ──
  {
    id: 5,
    name: 'Level 5',
    initialQueueCount: 60,
    passengers: [
      '#EF4444', '#EF4444', '#EF4444', '#EF4444',
      '#22C55E', '#22C55E',
      '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6',
      '#EAB308', '#EAB308',
      '#EC4899', '#EC4899', '#EC4899', '#EC4899',
      '#06B6D4', '#06B6D4',
      '#A855F7', '#A855F7', '#A855F7', '#A855F7',
      '#F97316', '#F97316',
      '#EF4444', '#EF4444',
      '#22C55E', '#22C55E', '#22C55E', '#22C55E',
      '#3B82F6', '#3B82F6',
      '#EAB308', '#EAB308', '#EAB308', '#EAB308',
      '#EC4899', '#EC4899',
      '#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4',
      '#A855F7', '#A855F7',
      '#F97316', '#F97316', '#F97316', '#F97316',
      '#EF4444', '#EF4444',
      '#22C55E', '#22C55E',
    ],
    vehicles: [
      // Top Outer Row (Clear exits)
      { id: 'l5_v1', type: 'bus', color: '#EF4444', capacity: 4, x: 22, y: 15, angle: 315, dir: 'up-left', blockedBy: [] },
      { id: 'l5_v2', type: 'sedan', color: '#22C55E', capacity: 2, x: 10, y: 22, angle: 315, dir: 'up-left', blockedBy: [] },
      { id: 'l5_v3', type: 'bus', color: '#3B82F6', capacity: 4, x: 76, y: 15, angle: 45, dir: 'up-right', blockedBy: [] },
      { id: 'l5_v4', type: 'sedan', color: '#EAB308', capacity: 2, x: 90, y: 22, angle: 45, dir: 'up-right', blockedBy: [] },

      // Second Layer
      { id: 'l5_v5', type: 'bus', color: '#EC4899', capacity: 4, x: 30, y: 32, angle: 315, dir: 'up-left', blockedBy: ['l5_v1'] },
      { id: 'l5_v6', type: 'sedan', color: '#06B6D4', capacity: 2, x: 14, y: 44, angle: 315, dir: 'up-left', blockedBy: ['l5_v2'] },
      { id: 'l5_v7', type: 'bus', color: '#A855F7', capacity: 4, x: 70, y: 32, angle: 45, dir: 'up-right', blockedBy: ['l5_v3'] },
      { id: 'l5_v8', type: 'sedan', color: '#F97316', capacity: 2, x: 86, y: 44, angle: 45, dir: 'up-right', blockedBy: ['l5_v4'] },

      // Center Hub
      { id: 'l5_v9', type: 'sedan', color: '#EF4444', capacity: 2, x: 42, y: 24, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l5_v10', type: 'bus', color: '#22C55E', capacity: 4, x: 58, y: 24, angle: 0, dir: 'up', blockedBy: [] },
      { id: 'l5_v11', type: 'sedan', color: '#3B82F6', capacity: 2, x: 50, y: 45, angle: 0, dir: 'up', blockedBy: ['l5_v9', 'l5_v10'] },

      // Third Layer
      { id: 'l5_v12', type: 'bus', color: '#EAB308', capacity: 4, x: 26, y: 55, angle: 315, dir: 'up-left', blockedBy: ['l5_v5'] },
      { id: 'l5_v13', type: 'sedan', color: '#EC4899', capacity: 2, x: 12, y: 68, angle: 315, dir: 'up-left', blockedBy: ['l5_v6'] },
      { id: 'l5_v14', type: 'bus', color: '#06B6D4', capacity: 4, x: 74, y: 55, angle: 45, dir: 'up-right', blockedBy: ['l5_v7'] },
      { id: 'l5_v15', type: 'sedan', color: '#A855F7', capacity: 2, x: 88, y: 68, angle: 45, dir: 'up-right', blockedBy: ['l5_v8'] },

      // Bottom Row
      { id: 'l5_v16', type: 'bus', color: '#F97316', capacity: 4, x: 24, y: 78, angle: 0, dir: 'up', blockedBy: ['l5_v12'] },
      { id: 'l5_v17', type: 'sedan', color: '#EF4444', capacity: 2, x: 42, y: 74, angle: 0, dir: 'up', blockedBy: ['l5_v11'] },
      { id: 'l5_v18', type: 'sedan', color: '#22C55E', capacity: 2, x: 58, y: 74, angle: 0, dir: 'up', blockedBy: ['l5_v11'] },
      { id: 'l5_v19', type: 'bus', color: '#EAB308', capacity: 4, x: 76, y: 78, angle: 0, dir: 'up', blockedBy: ['l5_v14'] },
      { id: 'l5_v20', type: 'sedan', color: '#3B82F6', capacity: 2, x: 50, y: 88, angle: 0, dir: 'up', blockedBy: ['l5_v17', 'l5_v18'] },
    ],
  },
];

export default function BusJamGame({ onHome, onOpenSettings }) {
  // Current Level Index (Starts at 0 -> Level 1!)
  const [levelIndex, setLevelIndex] = useState(0);
  const activeLevel = LEVELS_DATA[levelIndex] || LEVELS_DATA[0];

  const [queueCount, setQueueCount] = useState(activeLevel.initialQueueCount);
  const [passengers, setPassengers] = useState(activeLevel.passengers);
  const [vehicles, setVehicles] = useState(activeLevel.vehicles);

  // 8 Parking Bay Slots (5 active, 3 locked)
  const [dockSlots, setDockSlots] = useState([
    null, null, null, null, null, 'locked', 'locked', 'locked'
  ]);

  const [shakingCarId, setShakingCarId] = useState(null);
  const [coins, setCoins] = useState(10);
  const [isFailed, setIsFailed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ── ACTIVE RIDE ANIMATIONS ──
  // 1. Vehicle driving head-first from Jam to Dock Bay
  const [travelingVehicle, setTravelingVehicle] = useState(null);
  // 2. Full vehicle riding out of Dock Bay onto road and away
  const [departingVehicle, setDepartingVehicle] = useState(null);

  // Switch Level
  const loadLevel = (idx) => {
    const lvl = LEVELS_DATA[idx] || LEVELS_DATA[0];
    setLevelIndex(idx);
    setQueueCount(lvl.initialQueueCount);
    setPassengers([...lvl.passengers]);
    setVehicles([...lvl.vehicles]);
    setDockSlots([null, null, null, null, null, 'locked', 'locked', 'locked']);
    setTravelingVehicle(null);
    setDepartingVehicle(null);
    setIsFailed(false);
    setIsCompleted(false);
    setToastMessage('');
  };

// ──────────────────────────────────────────────────────────
// 2D ORIENTED BOUNDING BOX & SAT COLLISION HELPER
// ──────────────────────────────────────────────────────────
function getObb(cxPct, cyPct, isBus, angleDeg, wCont = 420, hCont = 460) {
  const cx = (cxPct / 100) * wCont;
  const cy = (cyPct / 100) * hCont;
  const w = isBus ? 28 : 24;
  const h = isBus ? 56 : 38;
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const hw = w / 2;
  const hh = h / 2;
  const corners = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  return corners.map(([x, y]) => [
    cx + x * cosA - y * sinA,
    cy + x * sinA + y * cosA,
  ]);
}

function satCollision(c1, c2, buffer = 0) {
  for (const corners of [c1, c2]) {
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const edge = [p2[0] - p1[0], p2[1] - p1[1]];
      const lenEdge = Math.hypot(edge[0], edge[1]);
      if (lenEdge === 0) continue;
      const normal = [-edge[1] / lenEdge, edge[0] / lenEdge];

      const proj1 = c1.map((p) => p[0] * normal[0] + p[1] * normal[1]);
      const proj2 = c2.map((p) => p[0] * normal[0] + p[1] * normal[1]);

      const min1 = Math.min(...proj1);
      const max1 = Math.max(...proj1);
      const min2 = Math.min(...proj2);
      const max2 = Math.max(...proj2);

      if (min1 > max2 + buffer || min2 > max1 + buffer) {
        return false;
      }
    }
  }
  return true;
}

  // ── DYNAMIC FORWARD PATH COLLISION CHECK ──
  // Checks if another car physically blocks this car's forward path along its arrow!
  // If the path ahead has open space, it can ALWAYS go!
  const isVehicleBlocked = (veh, activeVehicles = vehicles) => {
    const rad = (veh.angle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const isBus = veh.type === 'bus';

    // Sweep forward along vehicle's arrow heading
    for (let dist = 8; dist <= 380; dist += 6) {
      const cxPct = veh.x + ((dx * dist) / 420) * 100;
      const cyPct = veh.y + ((dy * dist) / 460) * 100;

      // Reached boundary of the jam lot = clear exit to road!
      if (cxPct < -2 || cxPct > 102 || cyPct < 2) {
        return false; // PATH IS CLEAR!
      }

      const sweptObb = getObb(cxPct, cyPct, isBus, veh.angle);

      for (const other of activeVehicles) {
        if (other.id === veh.id) continue;
        const otherObb = getObb(other.x, other.y, other.type === 'bus', other.angle);
        if (satCollision(sweptObb, otherObb, 0)) {
          return true; // Physically blocked by another car!
        }
      }
    }

    return false;
  };

  // 1. BOARDING ENGINE: Matching passengers walk down and board docked cars
  useEffect(() => {
    if (passengers.length === 0) {
      if (vehicles.length === 0 && !travelingVehicle && !departingVehicle) {
        setIsCompleted(true);
        audio.playVictory();
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
      }
      return;
    }

    const frontColor = passengers[0];

    // Find docked car with matching color and open seat
    const targetSlotIdx = dockSlots.findIndex(
      (slot) =>
        slot &&
        typeof slot === 'object' &&
        slot.color === frontColor &&
        slot.boardedPassengers < slot.capacity
    );

    if (targetSlotIdx !== -1) {
      const timer = setTimeout(() => {
        audio.playStarPop(1);

        // Advance queue
        setPassengers((prev) => prev.slice(1));
        setQueueCount((prev) => Math.max(0, prev - 1));

        // Increment passenger count in docked car
        setDockSlots((prev) => {
          const next = [...prev];
          const car = { ...next[targetSlotIdx] };
          car.boardedPassengers = (car.boardedPassengers || 0) + 1;
          next[targetSlotIdx] = car;
          return next;
        });
      }, 260);

      return () => clearTimeout(timer);
    } else {
      // Check if all active dock bays are occupied by cars
      const activeSlots = dockSlots.filter((s) => s !== 'locked' && s !== 'reserved');
      const emptyActiveSlots = activeSlots.filter((s) => s === null).length;

      if (emptyActiveSlots === 0 && !isFailed && !isCompleted && !travelingVehicle) {
        const failTimer = setTimeout(() => {
          audio.playCrash();
          setIsFailed(true);
        }, 1200);
        return () => clearTimeout(failTimer);
      }
    }
  }, [passengers, dockSlots, vehicles, isFailed, isCompleted, travelingVehicle, departingVehicle]);

  // 2. DEPARTURE ENGINE: Full car rides out of bay onto Road, turns right and drives away
  useEffect(() => {
    dockSlots.forEach((slot, slotIdx) => {
      if (slot && typeof slot === 'object' && slot.boardedPassengers >= slot.capacity && !departingVehicle) {
        const departTimer = setTimeout(() => {
          audio.playHorn();
          audio.playDriveOff();

          const bayScreenX = 4 + (slotIdx + 0.5) * 11.5;
          const bayScreenY = 28; // inside parking bay

          // Set departing vehicle state
          setDepartingVehicle({
            ...slot,
            screenX: bayScreenX,
            screenY: bayScreenY,
            angle: 0,
            step: 0,
          });

          // Free dock bay immediately so departing vehicle layer animates it
          setDockSlots((prev) => {
            const next = [...prev];
            next[slotIdx] = null;
            return next;
          });

          // Step 1: Drive down out of the bay directly onto the Roadway!
          setTimeout(() => {
            setDepartingVehicle((prev) => (prev ? {
              ...prev,
              screenY: 36, // on Road
              step: 1,
            } : null));
          }, 40);

          // Step 2: Turn right onto Road!
          setTimeout(() => {
            setDepartingVehicle((prev) => (prev ? {
              ...prev,
              screenY: 36,
              angle: 90, // facing right
              step: 2,
            } : null));
          }, 200);

          // Step 3: Speed away to the right along the road off-screen!
          setTimeout(() => {
            setDepartingVehicle((prev) => (prev ? {
              ...prev,
              screenX: 115, // off-screen
              screenY: 36,
              angle: 90,
              step: 3,
            } : null));
          }, 380);

          // Step 4: Complete departure and check win
          setTimeout(() => {
            setDepartingVehicle(null);

            setVehicles((prev) => {
              if (prev.length === 0) {
                setIsCompleted(true);
                audio.playVictory();
                try {
                  confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                } catch (e) {}
              }
              return prev;
            });
          }, 680);
        }, 350);

        return () => clearTimeout(departTimer);
      }
    });
  }, [dockSlots, departingVehicle]);

  // Handle clicking a vehicle: RIDE HEAD-FIRST FORWARD ONTO ROAD AND INTO BAY!
  const handleCarClick = (vehicle) => {
    if (travelingVehicle) return; // smooth sequential ride
    if (isVehicleBlocked(vehicle)) {
      audio.playHorn();
      setShakingCarId(vehicle.id);
      setTimeout(() => setShakingCarId(null), 350);
      return;
    }

    const emptyBayIdx = dockSlots.findIndex((s) => s === null);
    if (emptyBayIdx === -1) {
      audio.playCrash();
      setToastMessage('No empty parking bay!');
      setTimeout(() => setToastMessage(''), 1500);
      return;
    }

    // Play engine rev / drive sound
    audio.playDriveOff();

    // Temporarily reserve dock slot
    setDockSlots((prev) => {
      const next = [...prev];
      next[emptyBayIdx] = 'reserved';
      return next;
    });

    // Remove from jam lot static list
    setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));

    // Convert center jam coordinates to screen percentage coordinates
    const startScreenX = 4 + vehicle.x * 0.92;
    const startScreenY = 40 + vehicle.y * 0.46;
    const targetBayScreenX = 4 + (emptyBayIdx + 0.5) * 11.5;
    const targetBayScreenY = 28; // inside parking bay

    // Initialize traveling vehicle
    setTravelingVehicle({
      ...vehicle,
      screenX: startScreenX,
      screenY: startScreenY,
      angle: vehicle.angle,
      targetBayIdx: emptyBayIdx,
      step: 0,
    });

    const isLeftExit = vehicle.angle === 315 || vehicle.angle === 270;
    const isRightExit = vehicle.angle === 45 || vehicle.angle === 90;

    // Step 1: Drive forward head-first along arrow direction onto the roadway!
    const midX = isLeftExit
      ? Math.max(10, startScreenX - 8)
      : isRightExit
      ? Math.min(90, startScreenX + 8)
      : startScreenX;

    setTimeout(() => {
      setTravelingVehicle((prev) => (prev ? {
        ...prev,
        screenX: midX,
        screenY: 36, // on roadway
        angle: vehicle.angle,
        step: 1,
      } : null));
    }, 40);

    // Step 2: Turn to face forward (angle 0) and cruise along roadway to target Bay
    setTimeout(() => {
      setTravelingVehicle((prev) => (prev ? {
        ...prev,
        screenX: targetBayScreenX,
        screenY: 36,
        angle: 0,
        step: 2,
      } : null));
    }, 250);

    // Step 3: Pull straight into parking bay
    setTimeout(() => {
      setTravelingVehicle((prev) => (prev ? {
        ...prev,
        screenX: targetBayScreenX,
        screenY: targetBayScreenY,
        angle: 0,
        step: 3,
      } : null));
    }, 460);

    // Step 4: Settle in bay!
    setTimeout(() => {
      setTravelingVehicle(null);
      setDockSlots((prev) => {
        const next = [...prev];
        next[emptyBayIdx] = {
          ...vehicle,
          boardedPassengers: 0,
        };
        return next;
      });
    }, 660);
  };

  // Unlock an AD Bay
  const handleUnlockBay = (idx) => {
    audio.playStarPop(2);
    setDockSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setToastMessage('New Parking Spot Unlocked! ✨');
    setTimeout(() => setToastMessage(''), 2000);
  };

  // Power-Ups
  const handleRefresh = () => {
    audio.playClick();
    setVehicles((prev) => prev.map((v) => ({ ...v, blockedBy: [] })));
    setToastMessage('All cars unblocked! 🚀');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleEliminate = () => {
    audio.playStarPop(3);
    const dockedIdx = dockSlots.findIndex((s) => s && typeof s === 'object');
    if (dockedIdx !== -1) {
      audio.playDriveOff();
      setDockSlots((prev) => {
        const next = [...prev];
        next[dockedIdx] = null;
        return next;
      });
      setToastMessage('VIP car cleared! 🌟');
    } else if (vehicles.length > 0) {
      const target = vehicles[0];
      setVehicles((prev) => prev.filter((v) => v.id !== target.id));
      setToastMessage('Blocking car cleared! 🌟');
    }
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleSort = () => {
    audio.playClick();
    const dockedColors = dockSlots
      .filter((s) => s && typeof s === 'object')
      .map((s) => s.color);

    if (dockedColors.length > 0) {
      setPassengers((prev) => {
        const matching = prev.filter((c) => dockedColors.includes(c));
        const rest = prev.filter((c) => !dockedColors.includes(c));
        return [...matching, ...rest];
      });
      setToastMessage('Matching passengers moved to front! 👥');
      setTimeout(() => setToastMessage(''), 2000);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none bg-gradient-to-b from-[#64748b] via-[#94a3b8] to-[#cbd5e1] overflow-hidden">
      {/* Ambient subway lights on desktop/laptop */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-72 h-32 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-slate-900/30" />
      </div>

      {/* ──────────────────────────────────────────────────────────
          MAIN DEVICE CONTAINER (Exact 9:20 aspect matching Screenshot)
          ────────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[460px] sm:max-w-[490px] md:max-w-[520px] h-full max-h-[1024px] sm:max-h-full aspect-[460/1024] bg-[#9ab7c4] overflow-hidden flex flex-col justify-between shadow-2xl sm:border-x sm:border-white/30 transition-all">
        {/* ──────────────────────────────────────────────────────────
            1. TOP HEADER (Exact Screenshot match)
            ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1 z-30 w-full">
          {/* Pause Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-11 h-11 rounded-full bg-gradient-to-b from-[#38bdf8] to-[#0284c7] border-2 border-white shadow-[0_3px_0_#0369a1] flex items-center justify-center text-white cursor-pointer active:translate-y-0.5 active:shadow-none transition-transform"
            title="Pause"
          >
            <div className="flex gap-1">
              <div className="w-1.5 h-4 bg-white rounded-sm" />
              <div className="w-1.5 h-4 bg-white rounded-sm" />
            </div>
          </button>

          {/* AD crossed out button */}
          <div
            onClick={() => audio.playClick()}
            className="w-10 h-10 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center relative cursor-pointer active:scale-95"
            title="No Ads"
          >
            <span className="text-[11px] font-black text-slate-800 tracking-tighter">AD</span>
            <div className="absolute inset-1 rounded-full border-2 border-rose-500 flex items-center justify-center">
              <div className="w-full h-0.5 bg-rose-500 rotate-45" />
            </div>
          </div>

          {/* Level Pill Badge (Live level indicator!) */}
          <div className="bg-[#1e293b]/90 border border-slate-500/50 px-6 py-1.5 rounded-full shadow-lg flex items-center justify-center">
            <span className="text-white text-base font-black tracking-wide">
              {activeLevel.name}
            </span>
          </div>

          {/* Coins Container Pill */}
          <div className="relative bg-white/95 border border-slate-300 shadow-md px-3.5 py-1 rounded-full flex items-center gap-1.5 font-black text-slate-800">
            <div className="w-6 h-6 rounded-full bg-amber-400 border border-amber-200 shadow flex items-center justify-center text-amber-900 text-xs font-black relative">
              🚗
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-black border border-white">
                +
              </div>
            </div>
            <span className="text-sm font-black text-slate-900 ml-1">{coins}</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white" />
          </div>
        </div>

        {/* Main Hub Exit Button */}
        <div className="flex justify-start px-3 -mt-0.5 mb-1 z-30">
          <button
            onClick={() => {
              audio.playClick();
              if (onHome) onHome();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full hover:bg-white shadow-xs cursor-pointer active:scale-95 transition-all"
            title="Return to Main Menu"
          >
            <ChevronLeft className="w-3 h-3" /> Main Hub
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────────
            2. SUBWAY TRAIN PLATFORM & QUEUE (Screenshot 1 & 2)
            ────────────────────────────────────────────────────────── */}
        <div className="relative z-20 w-full px-2">
          {/* Silver/Orange Subway Train in Background */}
          <div className="relative w-full h-12 bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] rounded-t-2xl border-t-2 border-x-2 border-white/80 shadow-md overflow-hidden flex items-center justify-between px-3">
            <div className="absolute top-7 left-0 right-0 h-1.5 bg-[#f97316]" />
            <div className="flex gap-4 w-2/3">
              <div className="w-12 h-5 bg-[#0f172a] rounded-sm border border-slate-400 shadow-inner" />
              <div className="w-12 h-5 bg-[#0f172a] rounded-sm border border-slate-400 shadow-inner" />
              <div className="w-12 h-5 bg-[#0f172a] rounded-sm border border-slate-400 shadow-inner" />
              <div className="w-12 h-5 bg-[#0f172a] rounded-sm border border-slate-400 shadow-inner" />
            </div>
            <div className="relative w-11 h-10 bg-[#475569] rounded-t border-t-2 border-x-2 border-slate-300 shadow-inner flex flex-col justify-end items-center">
              <div className="w-full h-1 bg-amber-400" />
            </div>
          </div>

          {/* Platform Floor & Props */}
          <div className="relative w-full bg-[#f1f5f9] border-x border-b border-slate-300 shadow-inner pt-2 pb-1 px-3">
            <div className="flex items-center justify-between mb-1">
              {/* Street Lamp */}
              <div className="w-4 flex flex-col items-center">
                <div className="w-3 h-3 bg-slate-800 rounded-t border border-slate-600" />
                <div className="w-1 h-6 bg-slate-700" />
              </div>

              {/* Blue Standing Signboard: "{queueCount} Queue" */}
              <div className="flex flex-col items-center -mt-3">
                <div className="bg-[#7dd3fc] border-2 border-white px-3 py-0.5 rounded-lg shadow-md flex flex-col items-center">
                  <span className="text-slate-900 font-black text-xs leading-none">
                    {queueCount}
                  </span>
                  <span className="text-slate-700 font-bold text-[9px] leading-none">
                    Queue
                  </span>
                </div>
                <div className="w-1.5 h-3 bg-slate-600" />
                <div className="w-4 h-1 bg-slate-500 rounded-full" />
              </div>

              {/* Bus Sign */}
              <div className="w-5 h-5 rounded-md bg-[#0284c7] border border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                🚏
              </div>

              {/* Blue Benches */}
              <div className="flex gap-0.5 bg-[#3b82f6] p-0.5 rounded border border-white shadow-sm">
                <div className="w-2 h-2.5 bg-blue-700 rounded-sm" />
                <div className="w-2 h-2.5 bg-blue-700 rounded-sm" />
                <div className="w-2 h-2.5 bg-blue-700 rounded-sm" />
                <div className="w-2 h-2.5 bg-blue-700 rounded-sm" />
              </div>
            </div>

            {/* Passenger Queue Line along Railing */}
            <div className="relative flex items-center justify-between overflow-x-auto py-1 scrollbar-none">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400 rounded-full border-t border-white" />
              <div className="flex items-center gap-1.5 z-10 pl-1 pr-2">
                {passengers.slice(0, 18).map((color, idx) => (
                  <JellyPassenger
                    key={idx}
                    color={color}
                    isWalking={idx === 0}
                  />
                ))}
                {passengers.length > 18 && (
                  <span className="text-[10px] font-black text-slate-500 pl-1">
                    +{passengers.length - 18}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-amber-100/95 border border-amber-400 text-amber-900 px-3 py-1 rounded-lg text-center text-xs font-black shadow-sm mt-1 animate-fade-in">
              {toastMessage}
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────
            3. BOARDING BAYS & ROADWAY ("Rasta" from Screenshot)
            ────────────────────────────────────────────────────────── */}
        <div className="relative z-20 w-full px-2 pt-1 flex flex-col">
          {/* Parking Stalls Asphalt Lot */}
          <div className="bg-[#64748b] border-t-[3px] border-x-[3px] border-white rounded-t-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-8 divide-x-[3px] divide-white">
              {dockSlots.map((slot, bayIdx) => {
                const isLocked = slot === 'locked';
                const car = slot && typeof slot === 'object' ? slot : null;

                return (
                  <div
                    key={bayIdx}
                    onClick={() => {
                      if (isLocked) handleUnlockBay(bayIdx);
                    }}
                    className={`relative h-24 flex flex-col items-center justify-center p-0.5 transition-all select-none ${
                      isLocked
                        ? 'bg-[#475569]/70 cursor-pointer hover:bg-[#475569]/90'
                        : car
                        ? 'bg-[#334155]/50'
                        : 'bg-transparent'
                    }`}
                    title={isLocked ? 'Click to watch AD and unlock parking spot' : undefined}
                  >
                    {isLocked ? (
                      <div className="flex items-center justify-center w-full h-full cursor-pointer hover:scale-105 transition-transform" title="Click to unlock spot">
                        <AdFilmIcon className="w-7 h-6 text-white drop-shadow" />
                      </div>
                    ) : car ? (
                      car.type === 'bus' ? (
                        <Bus3D
                          color={car.color}
                          isInDock={true}
                          boardedCount={car.boardedPassengers || 0}
                          capacity={car.capacity}
                        />
                      ) : (
                        <Car3D
                          color={car.color}
                          isInDock={true}
                          boardedCount={car.boardedPassengers || 0}
                          capacity={car.capacity}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-black text-white/30">P</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────
              ROADWAY ("Rasta" connecting Jam to Parking Bays)
              ────────────────────────────────────────────────────────── */}
          <div className="relative w-full h-11 bg-[#475569] border-y-[3px] border-white shadow-md flex items-center justify-center overflow-hidden z-20">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="w-full h-0 border-t border-dashed border-white/40" />
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            4. CENTER JAM PARKING LOT (Full Width, Spacious Concrete)
            ────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 w-full overflow-hidden select-none px-2 py-1.5 flex items-center justify-center">
          <div className="relative w-full h-full bg-[#cbd5e1] rounded-2xl border-2 border-slate-300 shadow-inner overflow-hidden p-1">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Render 3D Vehicles inside Center Jam Lot */}
            {vehicles.map((veh) => {
              const blocked = isVehicleBlocked(veh);
              const shaking = shakingCarId === veh.id;

              return (
                <div
                  key={veh.id}
                  className="absolute transition-transform duration-200"
                  style={{
                    left: `${veh.x}%`,
                    top: `${veh.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: Math.floor(veh.y),
                  }}
                >
                  {veh.type === 'bus' ? (
                    <Bus3D
                      color={veh.color}
                      angle={veh.angle}
                      isBlocked={blocked}
                      isShaking={shaking}
                      isInDock={false}
                      onClick={() => handleCarClick(veh)}
                    />
                  ) : (
                    <Car3D
                      color={veh.color}
                      angle={veh.angle}
                      isBlocked={blocked}
                      isShaking={shaking}
                      isInDock={false}
                      onClick={() => handleCarClick(veh)}
                    />
                  )}
                </div>
              );
            })}

            {vehicles.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 font-black text-sm">
                <span>All vehicles docked safely! 🎉</span>
              </div>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            5. BOTTOM TOOLBAR (Refresh, Eliminate, Sort - Matching Screenshot)
            ────────────────────────────────────────────────────────── */}
        <div className="relative z-30 w-full px-4 pt-2.5 pb-3 flex items-center justify-around gap-3 bg-[#9ea97c] border-t border-[#8c9869] shadow-inner">
          {/* Refresh Card */}
          <button
            onClick={handleRefresh}
            className="btn-powerup-card flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center relative cursor-pointer active:scale-95"
            title="Refresh / Unblock cars"
          >
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow">
              +
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Blue Car */}
              <svg viewBox="0 0 32 18" className="w-7 h-4 drop-shadow">
                <rect x="2" y="3" width="28" height="12" rx="3.5" fill="#2563eb" />
                <rect x="6" y="4" width="20" height="5" rx="1.5" fill="#93c5fd" />
                <circle cx="8" cy="15" r="2.2" fill="#0f172a" />
                <circle cx="24" cy="15" r="2.2" fill="#0f172a" />
              </svg>
              {/* Circular Green Refresh Arrows */}
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0 w-full h-full text-emerald-500 stroke-current fill-none stroke-[3]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 3v5h-5" />
                <path d="M3 21v-5h5" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </div>
            <span className="text-[12px] font-black text-white tracking-tight [text-shadow:1px_1px_0_#78350f,-1px_-1px_0_#78350f,1px_-1px_0_#78350f,-1px_1px_0_#78350f,0_2px_2px_rgba(0,0,0,0.5)] mt-0.5">
              Refresh
            </span>
          </button>

          {/* Eliminate Card */}
          <button
            onClick={handleEliminate}
            className="btn-powerup-card flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center relative cursor-pointer active:scale-95"
            title="Eliminate / VIP car clear"
          >
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow">
              +
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Pink Car */}
              <svg viewBox="0 0 32 18" className="w-7 h-4 drop-shadow">
                <rect x="2" y="3" width="28" height="12" rx="3.5" fill="#db2777" />
                <rect x="6" y="4" width="20" height="5" rx="1.5" fill="#fbcfe8" />
                <circle cx="8" cy="15" r="2.2" fill="#0f172a" />
                <circle cx="24" cy="15" r="2.2" fill="#0f172a" />
              </svg>
              {/* Golden VIP Ribbon */}
              <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-amber-950 font-black text-[8px] px-1 rounded-sm shadow border border-amber-600 rotate-12 leading-tight">
                VIP
              </div>
            </div>
            <span className="text-[12px] font-black text-white tracking-tight [text-shadow:1px_1px_0_#78350f,-1px_-1px_0_#78350f,1px_-1px_0_#78350f,-1px_1px_0_#78350f,0_2px_2px_rgba(0,0,0,0.5)] mt-0.5">
              Eliminate
            </span>
          </button>

          {/* Sort Card */}
          <button
            onClick={handleSort}
            className="btn-powerup-card flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center relative cursor-pointer active:scale-95"
            title="Sort / Matching passengers to front"
          >
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow">
              +
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Blue & Green Person Stickmen */}
              <div className="flex gap-1 items-center">
                <div className="w-2.5 h-4.5 rounded-full bg-blue-500 shadow-sm border border-white/60" />
                <div className="w-2.5 h-4.5 rounded-full bg-emerald-500 shadow-sm border border-white/60" />
              </div>
              {/* Swap Arrows */}
              <svg
                viewBox="0 0 24 24"
                className="absolute -bottom-0.5 w-5 h-3 text-amber-500 stroke-current fill-none stroke-[3]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8h16M16 4l4 4-4 4M20 16H4M8 12l-4 4 4 4" />
              </svg>
            </div>
            <span className="text-[12px] font-black text-white tracking-tight [text-shadow:1px_1px_0_#78350f,-1px_-1px_0_#78350f,1px_-1px_0_#78350f,-1px_1px_0_#78350f,0_2px_2px_rgba(0,0,0,0.5)] mt-0.5">
              Sort
            </span>
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────────
            ACTIVE RIDE OVERLAYS (Traveling to Dock & Departing from Dock)
            ────────────────────────────────────────────────────────── */}
        {/* 1. Vehicle Driving Head-First to Dock Bay */}
        {travelingVehicle && (
          <div
            className="absolute pointer-events-none z-50 transition-all duration-300 ease-out"
            style={{
              left: `${travelingVehicle.screenX}%`,
              top: `${travelingVehicle.screenY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {travelingVehicle.type === 'bus' ? (
              <Bus3D
                color={travelingVehicle.color}
                angle={travelingVehicle.angle}
                isInDock={travelingVehicle.step === 2}
                boardedCount={0}
                capacity={travelingVehicle.capacity}
              />
            ) : (
              <Car3D
                color={travelingVehicle.color}
                angle={travelingVehicle.angle}
                isInDock={travelingVehicle.step === 2}
                boardedCount={0}
                capacity={travelingVehicle.capacity}
              />
            )}
          </div>
        )}

        {/* 2. Full Vehicle Riding Out of Dock Bay onto Road and Off Screen */}
        {departingVehicle && (
          <div
            className="absolute pointer-events-none z-50 transition-all duration-300 ease-in"
            style={{
              left: `${departingVehicle.screenX}%`,
              top: `${departingVehicle.screenY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {departingVehicle.type === 'bus' ? (
              <Bus3D
                color={departingVehicle.color}
                angle={departingVehicle.angle}
                isInDock={false}
                boardedCount={departingVehicle.capacity}
                capacity={departingVehicle.capacity}
              />
            ) : (
              <Car3D
                color={departingVehicle.color}
                angle={departingVehicle.angle}
                isInDock={false}
                boardedCount={departingVehicle.capacity}
                capacity={departingVehicle.capacity}
              />
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            6. FAIL MODAL (Exact match from Screenshot 3)
            ────────────────────────────────────────────────────────── */}
        {isFailed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
            <div className="w-full max-w-sm rounded-[32px] bg-[#1e293b]/95 p-6 border-2 border-slate-400 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-20 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="ribbon-fail w-44 py-2 rounded-xl flex items-center justify-center mb-6 shadow-xl">
                <span className="text-2xl font-black text-slate-800 tracking-wider drop-shadow-sm">
                  Fail
                </span>
              </div>

              <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
                <div
                  className="w-32 h-32 rounded-full border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center relative"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #eab308 65%, #ca8a04 100%)',
                  }}
                >
                  <div className="flex justify-between w-20 px-1 mt-2">
                    <span className="text-2xl font-black text-amber-950">&gt;</span>
                    <span className="text-2xl font-black text-amber-950">&lt;</span>
                  </div>
                  <div className="w-12 h-10 bg-amber-950 rounded-b-full border-t-2 border-amber-900 mt-2 shadow-inner" />
                  <div className="absolute bottom-6 left-3 w-5 h-3 bg-amber-600/40 rounded-full blur-[1px]" />
                  <div className="absolute bottom-6 right-3 w-5 h-3 bg-amber-600/40 rounded-full blur-[1px]" />
                </div>

                <div className="absolute top-8 -left-3 flex flex-col gap-1 pointer-events-none">
                  <div className="w-4 h-7 bg-sky-400 rounded-full shadow-md animate-tear-spray" style={{ '--tx': '-15px', '--ty': '8px' }} />
                  <div className="w-3 h-5 bg-sky-300 rounded-full shadow-md animate-tear-spray" style={{ '--tx': '-20px', '--ty': '15px' }} />
                </div>
                <div className="absolute top-8 -right-3 flex flex-col gap-1 pointer-events-none">
                  <div className="w-4 h-7 bg-sky-400 rounded-full shadow-md animate-tear-spray" style={{ '--tx': '15px', '--ty': '8px' }} />
                  <div className="w-3 h-5 bg-sky-300 rounded-full shadow-md animate-tear-spray" style={{ '--tx': '20px', '--ty': '15px' }} />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    audio.playClick();
                    loadLevel((levelIndex + 1) % LEVELS_DATA.length);
                  }}
                  className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-white/80 shadow-[0_4px_0_#b45309] text-white font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                >
                  <div className="bg-slate-900/80 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                    <Film className="w-3 h-3 text-amber-300" />
                    <span>AD</span>
                  </div>
                  <span>Skip</span>
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    loadLevel(levelIndex);
                  }}
                  className="btn-carout-green flex-1 py-3 px-3 rounded-2xl text-white font-black text-base uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Replay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            7. VICTORY / LEVEL COMPLETED MODAL
            ────────────────────────────────────────────────────────── */}
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
            <div className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 border-2 border-emerald-400 shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white mb-3 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1 tracking-wide">
                {activeLevel.name} COMPLETED!
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                All passengers boarded safely!
              </p>
              <div className="bg-slate-800/80 px-5 py-2 rounded-2xl border border-slate-600 mb-6 flex items-center gap-2 text-amber-400 font-black text-lg">
                <span>🪙 +10 Coins</span>
              </div>
              <button
                onClick={() => {
                  audio.playClick();
                  setCoins((c) => c + 10);
                  loadLevel((levelIndex + 1) % LEVELS_DATA.length);
                }}
                className="btn-carout-green w-full py-3.5 rounded-2xl text-white font-black text-lg shadow-lg uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next Level</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
