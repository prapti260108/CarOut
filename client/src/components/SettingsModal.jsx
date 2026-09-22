import React from 'react';
import { X, Volume2, Music, Smartphone, Share2, Edit3, Shield, FileText, Home } from 'lucide-react';
import audio from '../game/AudioEngine';

export default function SettingsModal({
  isOpen,
  onClose,
  onHome,
  soundOn,
  bgmOn,
  onToggleSound,
  onToggleBgm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xs rounded-3xl bg-[#e2f3fc] border-4 border-white shadow-2xl overflow-hidden p-5 pt-8 text-slate-800">
        {/* Blue Ribbon Header (from video 05:59) */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-b from-sky-400 to-blue-500 rounded-b-2xl border-b-2 border-white shadow-md flex items-center justify-center">
          <h2 className="game-title text-xl font-black text-white tracking-wider drop-shadow-sm">
            Settings
          </h2>
        </div>

        {/* Close Button on Ribbon Top-Right */}
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-600 active:scale-95"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Setting Options List */}
        <div className="flex flex-col gap-2.5 mt-6 mb-5">
          {/* BGM Toggle */}
          <div className="bg-white rounded-2xl p-3 border border-sky-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-sky-600 font-black text-sm">
              <Music className="w-5 h-5" />
              <span>BGM</span>
            </div>
            <button
              onClick={() => {
                audio.playClick();
                onToggleBgm();
              }}
              className={`w-14 h-7 rounded-full p-1 transition-colors flex items-center ${
                bgmOn ? 'bg-sky-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="bg-white rounded-2xl p-3 border border-sky-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-sky-600 font-black text-sm">
              <Volume2 className="w-5 h-5" />
              <span>Sound</span>
            </div>
            <button
              onClick={() => {
                audio.playClick();
                onToggleSound();
              }}
              className={`w-14 h-7 rounded-full p-1 transition-colors flex items-center ${
                soundOn ? 'bg-sky-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Vibration */}
          <div className="bg-white rounded-2xl p-3 border border-sky-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-sky-600 font-black text-sm">
              <Smartphone className="w-5 h-5" />
              <span>Haptics</span>
            </div>
            <div className="w-14 h-7 rounded-full p-1 bg-amber-600 flex items-center justify-end">
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </div>
          </div>

          {/* Share */}
          <button
            onClick={() => audio.playClick()}
            className="bg-white rounded-2xl p-3 border border-sky-100 flex items-center gap-2.5 text-sky-600 font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-98"
          >
            <Share2 className="w-4 h-4 text-sky-500" />
            <span>Share</span>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => audio.playClick()}
            className="bg-white rounded-2xl p-3 border border-sky-100 flex items-center gap-2.5 text-sky-600 font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-98"
          >
            <Shield className="w-4 h-4 text-sky-500" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Big Yellow HOME Button from video */}
        <button
          onClick={() => {
            audio.playClick();
            onHome();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 border-2 border-amber-300 text-slate-900 font-black text-base uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95"
        >
          <Home className="w-5 h-5 fill-current" />
          <span>HOME</span>
        </button>
      </div>
    </div>
  );
}
