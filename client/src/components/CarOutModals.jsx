import React from 'react';
import { ArrowRight, Coins } from 'lucide-react';
import audio from '../game/AudioEngine';

// 1. Level Failed Modal ("Pretty Close! Challenge Failed") from video 00:20
export function LevelFailedModal({ isOpen, coins = 59, onRevive, onSkip, onTryAgain }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xs rounded-3xl p-5 bg-gradient-to-b from-slate-900 to-[#0c1222] border border-slate-700 shadow-2xl flex flex-col items-center text-center relative">
        {/* Top-Right Coin Balance from video 00:20 */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full border border-amber-500/30 text-xs font-black text-amber-300">
          <span>{coins}</span>
          <Coins className="w-3.5 h-3.5 fill-current text-amber-400" />
        </div>

        {/* Top Header */}
        <h2 className="game-title text-2xl font-black text-white mt-1 mb-0.5 tracking-tight">Pretty Close!</h2>
        <p className="text-xs font-bold text-amber-400/90 mb-4 tracking-wide">Challenge Failed</p>

        {/* Mini Level Preview Box from video 00:20 with side screws and top-down lot */}
        <div className="w-full h-32 rounded-2xl bg-[#1e293b] border-2 border-slate-600 p-2 flex flex-col justify-center items-center relative overflow-hidden mb-4 shadow-inner">
          {/* Top-down miniature parking lot visual */}
          <div className="w-4/5 h-4/5 rounded-lg bg-[#334155] border border-slate-500 relative flex items-center justify-center overflow-hidden">
            {/* Miniature parked cars */}
            <div className="absolute top-2 left-3 w-8 h-4 bg-red-500 rounded-sm shadow-sm" />
            <div className="absolute top-2 right-4 w-4 h-8 bg-sky-400 rounded-sm shadow-sm" />
            <div className="absolute bottom-2 left-6 w-9 h-4 bg-amber-400 rounded-sm shadow-sm" />
            <div className="absolute bottom-3 right-3 w-4 h-7 bg-emerald-500 rounded-sm shadow-sm" />
            <div className="absolute top-5 left-12 w-4 h-9 bg-purple-500 rounded-sm shadow-sm" />
          </div>

          {/* Corner Screws/Rivets from video */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-700" />
          </div>
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-700" />
          </div>
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-700" />
          </div>
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-700" />
          </div>
        </div>

        {/* Action 1: Big Green "AD REVIVE" Button from video */}
        <button
          onClick={() => {
            audio.playClick();
            onRevive();
          }}
          className="btn-carout-green w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-base uppercase tracking-wider mb-2.5 shadow-lg cursor-pointer"
        >
          <span className="ad-badge">AD</span>
          <span>REVIVE</span>
        </button>

        {/* Action 2: "AD Skip" Cyan Button */}
        <button
          onClick={() => {
            audio.playClick();
            onSkip();
          }}
          className="btn-carout-cyan w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-xs uppercase mb-3 shadow-md cursor-pointer"
        >
          <span className="ad-badge">AD</span>
          <span>Skip</span>
        </button>

        {/* Action 3: "Try again" text link */}
        <button
          onClick={() => {
            audio.playClick();
            onTryAgain();
          }}
          className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// 2. Level Completed Modal ("Wonderful!") from video 02:08
export function LevelCompletedModal({ isOpen, coins = 78, coinsAwarded = 19, onNext }) {
  if (!isOpen) return null;

  const TARGET_COINS = 100;
  // Calculate percentage based on coins
  const currentPercent = Math.min(100, Math.round(((coins || 0) / TARGET_COINS) * 100));
  const prevCoins = Math.max(0, (coins || 0) - (coinsAwarded || 19));
  const prevPercent = Math.max(0, Math.min(100, Math.round((prevCoins / TARGET_COINS) * 100)));

  const [displayPercent, setDisplayPercent] = React.useState(prevPercent);
  const [animatedWidth, setAnimatedWidth] = React.useState(prevPercent);

  React.useEffect(() => {
    setDisplayPercent(prevPercent);
    setAnimatedWidth(prevPercent);

    // After modal opens, smoothly fill up the progress bar and counter
    const timer = setTimeout(() => {
      setAnimatedWidth(currentPercent);

      let cur = prevPercent;
      const step = Math.max(1, Math.round((currentPercent - prevPercent) / 15));
      const interval = setInterval(() => {
        cur += step;
        if (cur >= currentPercent) {
          cur = currentPercent;
          clearInterval(interval);
        }
        setDisplayPercent(cur);
      }, 40);
    }, 350);

    return () => clearTimeout(timer);
  }, [coins, prevPercent, currentPercent]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xs rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-[#0c1222] border border-slate-700 shadow-2xl flex flex-col items-center text-center relative">
        {/* Top-Right Coin Balance from video 02:08 */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full border border-amber-500/30 text-xs font-black text-amber-300">
          <span>{coins}</span>
          <Coins className="w-3.5 h-3.5 fill-current text-amber-400" />
        </div>

        {/* Top Header */}
        <h2 className="game-title text-3xl font-black text-white mt-1 mb-2 tracking-tight">Wonderful!</h2>

        {/* Coins earned badge */}
        <div className="flex items-center gap-1.5 text-amber-400 font-black text-lg mb-4">
          <Coins className="w-5 h-5 fill-current" />
          <span>+{coinsAwarded}</span>
        </div>

        {/* Silhouette Unlock Card with Progress Bar from video 02:08 */}
        <div className="w-full rounded-2xl bg-white p-4 shadow-xl mb-5 flex flex-col items-center">
          {/* Island / Palm Tree Silhouette from video */}
          <div className="w-28 h-24 flex items-center justify-center text-5xl my-1 relative">
            <span className="drop-shadow-md transition-transform duration-500 hover:scale-110">
              🏝️
            </span>
            {displayPercent >= 100 && (
              <span className="absolute -top-1 -right-1 text-base animate-bounce">
                ✨
              </span>
            )}
          </div>

          <div className="text-xs font-black text-slate-700 mb-2 tracking-wide uppercase">
            {displayPercent >= 100 ? 'Theme Unlocked!' : 'Island Oasis Theme'}
          </div>

          {/* Yellow Progress Bar dynamically filling according to coins */}
          <div className="w-full bg-slate-200 h-6 rounded-md overflow-hidden relative border border-slate-300 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${animatedWidth}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900 drop-shadow-xs">
              {displayPercent}%
            </span>
          </div>

          <div className="flex justify-between w-full text-[10px] font-extrabold text-slate-400 mt-1.5 px-0.5">
            <span>{coins} / {TARGET_COINS} Coins</span>
            <span>{displayPercent >= 100 ? 'Unlocked!' : `${Math.max(0, TARGET_COINS - coins)} coins to go`}</span>
          </div>
        </div>

        {/* Big Green "Next" Button from video */}
        <button
          onClick={() => {
            audio.playClick();
            onNext();
          }}
          className="btn-carout-green w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-base uppercase tracking-wider shadow-lg cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
