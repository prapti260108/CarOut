import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Coins, Check, Lock, Palette } from 'lucide-react';
import audio from '../game/AudioEngine';

export default function ShopModal({
  isOpen,
  onClose,
  coins,
  selectedSkin,
  selectedTheme,
  onSelectSkin,
  onSelectTheme,
}) {
  const [activeTab, setActiveTab] = useState('skins');
  const [shopData, setShopData] = useState({ skins: [], themes: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShopData();
    }
  }, [isOpen]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shop');
      if (res.ok) {
        const data = await res.json();
        setShopData(data);
      }
    } catch (err) {
      console.error('Failed to load shop items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyOrSelect = async (type, item) => {
    audio.playClick();
    try {
      const res = await fetch('/api/shop/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'skin') onSelectSkin(item.id);
        if (type === 'theme') onSelectTheme(item.id);
        fetchShopData();
      } else {
        alert(data.error || 'Failed to purchase');
      }
    } catch (err) {
      console.error('Purchase error', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl max-h-[85vh] rounded-3xl border border-amber-500/30 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="game-title text-xl font-black text-white">CUSTOM GARAGE</h2>
              <p className="text-xs text-slate-400">Upgrade skins & parking lot themes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 font-black text-sm flex items-center gap-1.5 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{coins}</span>
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
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 flex gap-2 border-b border-slate-800/60 bg-slate-900/40">
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('skins');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'skins'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vehicle Fleet Skins
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('themes');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'themes'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            World Themes
          </button>
        </div>

        {/* Items Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeTab === 'skins' ? (
            shopData.skins.map((skin) => {
              const isSelected = selectedSkin === skin.id;
              const isUnlocked = skin.unlocked;
              const canAfford = coins >= skin.price;

              return (
                <div
                  key={skin.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40'
                      : isUnlocked
                      ? 'bg-slate-800/60 border-slate-700'
                      : 'bg-slate-900/60 border-slate-800 opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20"
                      style={{ backgroundColor: skin.previewColor }}
                    >
                      🚗
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{skin.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {skin.price === 0 ? 'Default Fleet' : `${skin.price} Coins`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyOrSelect('skin', skin)}
                    disabled={!isUnlocked && !canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : isUnlocked
                        ? 'btn-game-primary text-white shadow-md'
                        : canAfford
                        ? 'btn-game-gold text-slate-950 shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" /> Selected
                      </>
                    ) : isUnlocked ? (
                      'Equip Skin'
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Unlock {skin.price}
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            shopData.themes.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              const isUnlocked = theme.unlocked;
              const canAfford = coins >= theme.price;

              return (
                <div
                  key={theme.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-400 shadow-lg shadow-sky-500/10 ring-2 ring-sky-400/40'
                      : isUnlocked
                      ? 'bg-slate-800/60 border-slate-700'
                      : 'bg-slate-900/60 border-slate-800 opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20"
                      style={{ backgroundColor: theme.groundColor }}
                    >
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{theme.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {theme.price === 0 ? 'Default Theme' : `${theme.price} Coins`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyOrSelect('theme', theme)}
                    disabled={!isUnlocked && !canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : isUnlocked
                        ? 'btn-game-primary text-white shadow-md'
                        : canAfford
                        ? 'btn-game-gold text-slate-950 shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" /> Active
                      </>
                    ) : isUnlocked ? (
                      'Apply Theme'
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Unlock {theme.price}
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
