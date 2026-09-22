import React from 'react';
import { X, Lightbulb, Undo2, Star, Navigation, AlertCircle } from 'lucide-react';
import audio from '../game/AudioEngine';

export default function InstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-sky-500/30 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <h2 className="game-title text-xl font-black text-white">HOW TO PLAY</h2>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="btn-game-icon p-2 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 flex flex-col gap-3.5 text-sm text-slate-200">
          <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Tap to Drive Out</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Each vehicle has a floating arrow indicating its exit direction. Tap any car to send it driving out to the highway!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Avoid Collisions</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                If the car's path is blocked by another vehicle, barrier, or cone, it will bump and recoil back into place!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Use Smart Tools</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Need help? Tap <strong>Hint</strong> to highlight which car can safely exit next. Make a bad move? Tap <strong>Undo</strong>!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Earn 3 Stars & Coins</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Solve each parking jam in the fewest moves to earn 3 stars and coins for unlocking custom fleet skins in the Garage!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="btn-game-primary w-full py-3.5 rounded-2xl text-sm font-black uppercase text-white shadow-lg shadow-sky-500/20"
        >
          Got It! Let's Drive!
        </button>
      </div>
    </div>
  );
}
