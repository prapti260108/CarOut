import React from 'react';
import audio from '../game/AudioEngine';

export default function LeaveGameModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-[280px] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col items-center pt-7 animate-scale-up border border-slate-100/80">
        {/* Cute Pleading Face with Aura & Pastel Sparkles (Exact match to screenshot) */}
        <div className="relative mb-2 flex items-center justify-center">
          {/* Soft pastel aura glow */}
          <div className="absolute w-20 h-20 rounded-full bg-amber-100/80 blur-md animate-pulse" />

          {/* Pastel Sparkle Stars around the head */}
          <span className="absolute -top-2 right-1 text-sm text-pink-300 animate-ping" style={{ animationDuration: '1.8s' }}>✨</span>
          <span className="absolute -bottom-1 -left-3 text-xs text-sky-300 animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>✦</span>
          <span className="absolute top-1 -left-3 text-sm text-amber-300 animate-pulse">★</span>
          <span className="absolute -top-1 -left-1 text-xs text-emerald-300">✦</span>
          <span className="absolute top-2 right-5 text-xs text-indigo-300">✨</span>

          {/* Cute Soft Wings / Glow Rays behind */}
          <div className="absolute -left-3 w-4 h-6 bg-sky-100/80 rounded-full blur-[1px] rotate-[-25deg]" />
          <div className="absolute -right-3 w-4 h-6 bg-sky-100/80 rounded-full blur-[1px] rotate-[25deg]" />

          {/* Main 🥺 Emoji */}
          <span className="text-5xl relative z-10 select-none drop-shadow-sm animate-bounce" style={{ animationDuration: '2.5s' }}>
            🥺
          </span>
        </div>

        {/* Faint ground shadow below emoji */}
        <div className="w-14 h-1 bg-[#ecdcd0]/60 rounded-full mb-4" />

        {/* Title Text (Exact typography from user screenshot) */}
        <h3 className="text-[17px] font-black text-[#222939] text-center px-4 mb-6 tracking-normal leading-tight font-sans">
          Do you want to leave?
        </h3>

        {/* Action Buttons: Cancel on Left, OK on Right with crisp divider */}
        <div className="w-full grid grid-cols-2 border-t border-slate-200/80 divide-x divide-slate-200/80">
          <button
            onClick={() => {
              audio.playClick();
              onCancel();
            }}
            className="py-3.5 text-center text-slate-700 hover:text-slate-900 font-black text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              audio.playClick();
              onConfirm();
            }}
            className="py-3.5 text-center text-slate-800 hover:text-black font-black text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
