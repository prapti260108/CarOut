import React, { useState, useRef, useEffect } from 'react';
import { Settings, RotateCcw, Check, Undo2, ChevronLeft, ChevronRight, FastForward, Sparkles } from 'lucide-react';
import audio from '../AudioEngine';
import confetti from 'canvas-confetti';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL CONFIGURATIONS
// Progressive difficulty:
// Level 1: 2 items (Easy tutorial)
// Level 2: 3 items (Easy)
// Level 3: 4 items (Medium with horizontal basket scrolling)
// Level 4: 5 items (Challenging)
// Level 5: 7 items (Grand Master - exact match of user's screenshots!)
// ─────────────────────────────────────────────────────────────────────────────
const LEVELS = {
  1: {
    levelNum: 1,
    title: 'Easy Start',
    baskets: [
      { id: 'b_flour', type: 'flour', label: 'Flour Boxes', count: 3, total: 3 },
      { id: 'b_soda', type: 'soda_can', label: 'Soda Cans', count: 4, total: 4 },
    ],
    containers: [
      { id: 'c1', shelf: 2, slot: 0, type: 'flour', capacity: 3, items: [], isConfirmed: false, label: 'Bakery' },
      { id: 'c2', shelf: 2, slot: 1, type: 'soda_can', capacity: 4, items: [], isConfirmed: false, label: 'Cold Drinks' },
    ],
  },
  2: {
    levelNum: 2,
    title: 'Fresh Groceries',
    baskets: [
      { id: 'b_meat', type: 'meat', label: 'Steak Packs', count: 3, total: 3 },
      { id: 'b_bottle', type: 'green_bottle', label: 'Green Soda', count: 4, total: 4 },
      { id: 'b_pickle', type: 'pickle_jar', label: 'Pickle Jars', count: 3, total: 3 },
    ],
    containers: [
      { id: 'c1', shelf: 3, slot: 0, type: 'meat', capacity: 3, items: [], isConfirmed: false, label: 'Meat Section' },
      { id: 'c2', shelf: 3, slot: 1, type: 'green_bottle', capacity: 4, items: [], isConfirmed: false, label: 'Beverages' },
      { id: 'c3', shelf: 3, slot: 2, type: 'pickle_jar', capacity: 3, items: [], isConfirmed: false, label: 'Preserves' },
    ],
  },
  3: {
    levelNum: 3,
    title: 'Family Feast',
    baskets: [
      { id: 'b_cookies', type: 'cookie_box', label: 'Snack Boxes', count: 4, total: 4 },
      { id: 'b_water', type: 'water_bottle', label: 'Spring Water', count: 4, total: 4 },
      { id: 'b_soda', type: 'soda_can', label: 'Soda Cans', count: 6, total: 6 },
      { id: 'b_meat', type: 'meat', label: 'Steak Packs', count: 3, total: 3 },
    ],
    containers: [
      { id: 'c1', shelf: 1, slot: 0, type: 'cookie_box', capacity: 4, items: [], isConfirmed: false, label: 'Snacks' },
      { id: 'c2', shelf: 2, slot: 0, type: 'water_bottle', capacity: 4, items: [], isConfirmed: false, label: 'Water' },
      { id: 'c3', shelf: 2, slot: 1, type: 'soda_can', capacity: 6, items: [], isConfirmed: false, label: 'Soda' },
      { id: 'c4', shelf: 4, slot: 0, type: 'meat', capacity: 3, items: [], isConfirmed: false, label: 'Meat Bin' },
    ],
  },
  4: {
    levelNum: 4,
    title: 'Kitchen Stockup',
    baskets: [
      { id: 'b_flour', type: 'flour', label: 'Flour Boxes', count: 4, total: 4 },
      { id: 'b_meat', type: 'meat', label: 'Steak Packs', count: 3, total: 3 },
      { id: 'b_bottle', type: 'green_bottle', label: 'Green Soda', count: 6, total: 6 },
      { id: 'b_pickle', type: 'pickle_jar', label: 'Pickle Jars', count: 4, total: 4 },
      { id: 'b_juice', type: 'juice', label: 'Smoothies', count: 4, total: 4 },
    ],
    containers: [
      { id: 'c1', shelf: 1, slot: 0, type: 'flour', capacity: 4, items: [], isConfirmed: false, label: 'Pantry Shelf' },
      { id: 'c2', shelf: 2, slot: 0, type: 'meat', capacity: 3, items: [], isConfirmed: false, label: 'Deli Meat' },
      { id: 'c3', shelf: 2, slot: 1, type: 'green_bottle', capacity: 6, items: [], isConfirmed: false, label: 'Soda Stash' },
      { id: 'c4', shelf: 3, slot: 0, type: 'pickle_jar', capacity: 4, items: [], isConfirmed: false, label: 'Jars' },
      { id: 'c5', shelf: 3, slot: 1, type: 'juice', capacity: 4, items: [], isConfirmed: false, label: 'Juices' },
    ],
  },
  // Level 5: Exact match from Screenshots media_1790069456789.png to media_1790069492129.png!
  5: {
    levelNum: 5,
    title: 'Supermarket Haul',
    baskets: [
      { id: 'b_pickle', type: 'pickle_jar', label: 'Pickle Jars', count: 4, total: 4 },
      { id: 'b_soda', type: 'soda_can', label: 'Soda Cans', count: 6, total: 6 },
      { id: 'b_canned', type: 'canned', label: 'Canned Goods', count: 4, total: 4 },
      { id: 'b_flour', type: 'flour', label: 'Flour Boxes', count: 4, total: 4 },
      { id: 'b_cookies', type: 'cookie_box', label: 'Snack Boxes', count: 4, total: 4 },
      { id: 'b_meat', type: 'meat', label: 'Steak Packs', count: 3, total: 3 },
      { id: 'b_bottle', type: 'green_bottle', label: 'Green Soda', count: 6, total: 6 },
    ],
    containers: [
      { id: 'c1', shelf: 1, slot: 0, type: 'cookie_box', capacity: 4, items: [], isConfirmed: false, label: 'Top Pantry' },
      { id: 'c2', shelf: 2, slot: 0, type: 'flour', capacity: 4, items: [], isConfirmed: false, label: 'Bakery' },
      { id: 'c3', shelf: 2, slot: 1, type: 'canned', capacity: 4, items: [], isConfirmed: false, label: 'Canned Goods' },
      { id: 'c4', shelf: 3, slot: 0, type: 'meat', capacity: 3, items: [], isConfirmed: false, label: 'Fresh Meats' },
      { id: 'c5', shelf: 3, slot: 1, type: 'pickle_jar', capacity: 4, items: [], isConfirmed: false, label: 'Pickles & Jars' },
      { id: 'c6', shelf: 4, slot: 0, type: 'soda_can', capacity: 6, items: [], isConfirmed: false, label: 'Chilled Cans' },
      { id: 'c7', shelf: 4, slot: 1, type: 'green_bottle', capacity: 6, items: [], isConfirmed: false, label: 'Bottles' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3D GROCERY ITEM GRAPHICS
// Authentic visual representations matching the screenshots
// ─────────────────────────────────────────────────────────────────────────────
function GroceryItemGraphic({ type, size = 'md', isZoomed = false, isSlanted = false }) {
  const slantedClass = isSlanted ? 'rotate-45 scale-105 shadow-xl' : '';

  if (type === 'meat') {
    // Steak/Ham cut on yellow packaging tray (media_1790069476748.png & media_1790069492129.png)
    return (
      <div className={`relative flex flex-col items-center justify-center transition-transform ${slantedClass} ${isZoomed ? (isSlanted ? 'w-28 h-32' : 'w-24 h-28') : 'w-12 h-14'}`}>
        {/* 2x Slot Indicator if slanted */}
        {isSlanted && isZoomed && (
          <div className="absolute -top-1 -right-1 z-30 bg-amber-500 text-amber-950 text-[8px] font-black px-1 rounded shadow-xs border border-white">
            2x
          </div>
        )}
        {/* Yellow Styrofoam Tray */}
        <div className="absolute inset-x-0 bottom-0 top-3 rounded-xl bg-gradient-to-b from-[#fef08a] to-[#eab308] border-2 border-[#ca8a04] shadow-md -skew-y-3" />
        {/* Fresh Meat Cut */}
        <div className="relative w-4/5 h-4/5 rounded-full bg-gradient-to-br from-[#ef4444] via-[#dc2626] to-[#b91c1c] border-2 border-[#991b1b] shadow-inner flex items-center justify-center -rotate-6">
          {/* Marbling lines */}
          <div className="absolute inset-1 rounded-full border border-pink-200/50" />
          <div className="absolute w-8 h-0.5 bg-pink-100/70 rounded-full rotate-45" />
          <div className="absolute w-6 h-0.5 bg-pink-100/70 rounded-full -rotate-30" />
          {/* Central Bone marrow circle */}
          <div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-100" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'soda_can') {
    // Red and silver/blue soda can (media_1790069456789.png)
    return (
      <div className={`relative flex flex-col items-center justify-center ${isZoomed ? 'w-14 h-22' : 'w-8 h-12'}`}>
        {/* Top Metallic Ring */}
        <div className="w-full h-3 rounded-t-full bg-gradient-to-r from-slate-200 via-white to-slate-300 border border-slate-400 flex items-center justify-center">
          <div className="w-3 h-1 rounded-full bg-slate-500" />
        </div>
        {/* Can Body */}
        <div className="w-full flex-1 rounded-b-md bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#b91c1c] border-x border-b border-red-900 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="w-full h-1 bg-white/40" />
          {/* Blue wave stripe */}
          <div className="w-full h-3 bg-[#1d4ed8] -skew-y-12 flex items-center justify-center text-[7px] text-white font-black">
            COLA
          </div>
          <div className="w-full h-1.5 bg-slate-300" />
        </div>
      </div>
    );
  }

  if (type === 'green_bottle') {
    // Lime green soda/oil bottle with yellow cap (media_1790069476748.png)
    return (
      <div className={`relative flex flex-col items-center justify-center ${isZoomed ? 'w-12 h-26' : 'w-7 h-14'}`}>
        {/* Yellow Screw Cap */}
        <div className="w-4 h-2.5 rounded-t bg-gradient-to-b from-[#fef08a] to-[#eab308] border border-amber-600 shadow-xs" />
        {/* Bottle Neck */}
        <div className="w-2.5 h-3 bg-[#22c55e] border-x border-[#15803d]" />
        {/* Bottle Body */}
        <div className="w-full flex-1 rounded-b-xl bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#15803d] border border-[#166534] shadow-md relative overflow-hidden flex items-center justify-center">
          <div className="w-1.5 h-full bg-white/30 rounded-full blur-[0.5px]" />
          <div className="absolute bottom-2 w-full h-2 bg-[#facc15]/80" />
        </div>
      </div>
    );
  }

  if (type === 'flour') {
    // White Flour/Cereal box with golden wheat sheaf (media_1790069456789.png)
    return (
      <div className={`relative flex flex-col items-center justify-between rounded-md bg-white border-2 border-slate-300 shadow-md p-1 ${isZoomed ? 'w-22 h-24' : 'w-12 h-14'}`}>
        <div className="w-full h-1.5 bg-amber-400 rounded-t-xs" />
        <div className="text-xl">🌾</div>
        <div className="w-4/5 h-2 rounded bg-amber-200 flex items-center justify-center text-[7px] font-bold text-amber-900">
          FLOUR
        </div>
      </div>
    );
  }

  if (type === 'cookie_box') {
    // Blue cookie/snack box (media_1790069465841.png)
    return (
      <div className={`relative flex flex-col items-center justify-between rounded-md bg-[#2563eb] border-2 border-blue-800 shadow-md p-1 ${isZoomed ? 'w-22 h-24' : 'w-12 h-14'}`}>
        <div className="w-full h-1.5 bg-white/80 rounded-t-xs" />
        <div className="text-xl">🍪</div>
        <div className="w-full text-center text-[8px] font-black text-white bg-blue-900/60 rounded px-1">
          OREO
        </div>
      </div>
    );
  }

  if (type === 'pickle_jar') {
    // Green Pickle / Condiment jar with green lid (media_1790069456789.png)
    return (
      <div className={`relative flex flex-col items-center justify-center ${isZoomed ? 'w-16 h-22' : 'w-8 h-12'}`}>
        {/* Green Lid */}
        <div className="w-4/5 h-3 rounded-t-lg bg-[#65a30d] border border-[#3f6212] shadow-xs" />
        {/* Glass Jar Body */}
        <div className="w-full flex-1 rounded-b-xl bg-gradient-to-r from-[#bef264] via-[#a3e635] to-[#65a30d] border-2 border-[#4d7c0f] shadow-md p-0.5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-3/4 h-3/5 rounded bg-[#fef08a] border border-amber-400 flex items-center justify-center text-[8px]">
            🥒
          </div>
        </div>
      </div>
    );
  }

  if (type === 'water_bottle') {
    // Blue water bottle with blue cap (media_1790069465841.png)
    return (
      <div className={`relative flex flex-col items-center justify-center ${isZoomed ? 'w-12 h-24' : 'w-7 h-13'}`}>
        <div className="w-3 h-2 rounded-t bg-[#1d4ed8] border border-blue-900" />
        <div className="w-2 h-2 bg-sky-200" />
        <div className="w-full flex-1 rounded-b-xl bg-gradient-to-r from-sky-200 via-sky-300 to-sky-400 border border-sky-600 shadow-md relative flex items-center justify-center">
          <div className="text-[10px]">💧</div>
        </div>
      </div>
    );
  }

  // Default / Canned / Juice
  return (
    <div className={`relative flex flex-col items-center justify-center ${isZoomed ? 'w-14 h-22' : 'w-8 h-12'}`}>
      <div className="w-full h-3 rounded-t bg-amber-200 border border-amber-400" />
      <div className="w-full flex-1 rounded-b bg-gradient-to-b from-[#d97706] to-[#b45309] border border-amber-900 shadow-md flex items-center justify-center text-white text-xs font-bold">
        🥫
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT: Fill The Fridge 3D
// ─────────────────────────────────────────────────────────────────────────────
export default function FridgeGame({ onHome, onOpenSettings }) {
  const [levelNum, setLevelNum] = useState(1);
  const currentLvlConfig = LEVELS[levelNum] || LEVELS[1];

  const [coins, setCoins] = useState(520);
  // Game Phase: 'closed' (door closed) -> 'open' (door open, shelves view) -> 'zoomed' (container packing view) -> 'completed'
  const [phase, setPhase] = useState('closed');

  // Containers state for current level
  const [containers, setContainers] = useState(currentLvlConfig.containers);
  // Baskets state for current level
  const [baskets, setBaskets] = useState(currentLvlConfig.baskets);
  // Active container index in zoom mode
  const [activeContainerIdx, setActiveContainerIdx] = useState(null);
  // Active basket index selected by user
  const [activeBasketIdx, setActiveBasketIdx] = useState(0);

  // Packing history stack for Undo button
  const [packHistory, setPackHistory] = useState([]);

  // Pack mode: 'compact' (takes 1 slot) or 'slanted' (takes 2 slots - uneven packing!)
  const [packMode, setPackMode] = useState('compact');
  // Error alert banner state
  const [errorAlert, setErrorAlert] = useState({ show: false, title: '', message: '' });
  // Container shaking animation state
  const [isShaking, setIsShaking] = useState(false);

  // Baskets horizontal scroll ref
  const scrollRef = useRef(null);

  // Initialize level
  useEffect(() => {
    handleResetLevel(levelNum);
  }, [levelNum]);

  const handleResetLevel = (lvl = levelNum) => {
    const cfg = LEVELS[lvl] || LEVELS[1];
    setContainers(JSON.parse(JSON.stringify(cfg.containers)));
    setBaskets(JSON.parse(JSON.stringify(cfg.baskets)));
    setPhase('closed');
    setActiveContainerIdx(null);
    setActiveBasketIdx(0);
    setPackHistory([]);
    setPackMode('compact');
    setErrorAlert({ show: false, title: '', message: '' });
    setIsShaking(false);
  };

  // 1. Tap Fridge to Open
  const handleOpenFridge = () => {
    if (phase === 'closed') {
      audio.playDrawerSlide();
      setPhase('open');
    }
  };

  // 2. Tap Container on Shelf to Zoom In (matching media_1790069492129.png)
  const handleSelectContainer = (idx) => {
    audio.playDrawerSlide();
    setActiveContainerIdx(idx);
    setPhase('zoomed');
    setErrorAlert({ show: false, title: '', message: '' });

    // Automatically align active basket with container type
    const targetType = containers[idx].type;
    const matchingBasketIdx = baskets.findIndex((b) => b.type === targetType);
    if (matchingBasketIdx !== -1) {
      setActiveBasketIdx(matchingBasketIdx);
      // Auto-scroll to matching basket
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: matchingBasketIdx * 110,
          behavior: 'smooth',
        });
      }
    }
  };

  // 3. Pack Item from Active Basket into Active Container
  // If items are unevenly packed (e.g. slanted taking 2 slots) and space runs out, triggers ERROR!
  const handlePackItem = (basketIdx = activeBasketIdx) => {
    if (activeContainerIdx === null) return;
    const activeCont = containers[activeContainerIdx];
    const basket = baskets[basketIdx];

    if (!basket || basket.count <= 0) return;

    // Only allow packing matching items
    if (activeCont.type && activeCont.type !== basket.type) {
      audio.playCrash();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      setErrorAlert({
        show: true,
        title: 'WRONG CONTAINER!',
        message: `⚠️ This container is for ${activeCont.label}! Please pack into the correct shelf container.`,
      });
      return;
    }

    const itemSize = packMode === 'slanted' ? 2 : 1;
    const currentUsedSlots = activeCont.items.reduce((sum, it) => sum + (it.size || 1), 0);

    // ERROR CHECK 1: If current item cannot fit in remaining slots!
    if (currentUsedSlots + itemSize > activeCont.capacity) {
      audio.playCrash();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      setErrorAlert({
        show: true,
        title: 'OUT OF SPACE!',
        message: `⚠️ Jagah khatam ho gayi! Uneven packing ki wajah se item fit nahi ho raha (${activeCont.capacity - currentUsedSlots} slot bacha hai, item ko ${itemSize} slot chahiye). Red ↺ Button se remove karke Compact mode me pack karein!`,
      });
      return;
    }

    audio.playItemClink();

    const newItem = {
      type: basket.type,
      isSlanted: packMode === 'slanted',
      size: itemSize,
    };

    const newUsedSlots = currentUsedSlots + itemSize;
    const remainingBasketCount = basket.count - 1;

    // Add item to container
    const updatedContainers = [...containers];
    updatedContainers[activeContainerIdx] = {
      ...activeCont,
      items: [...activeCont.items, newItem],
    };
    setContainers(updatedContainers);

    // Decrement basket count
    const updatedBaskets = [...baskets];
    updatedBaskets[basketIdx] = {
      ...basket,
      count: remainingBasketCount,
    };
    setBaskets(updatedBaskets);

    // Record in history for Undo
    setPackHistory((prev) => [
      ...prev,
      {
        containerIdx: activeContainerIdx,
        basketIdx: basketIdx,
        item: newItem,
      },
    ]);

    // ERROR CHECK 2: All slots full, BUT items are still left in the basket!
    // ("agar vo sari vastu orgenige na ho or space bhi na bache kyuki uneven orgonize ki ho to error aani cahiye")
    if (newUsedSlots >= activeCont.capacity && remainingBasketCount > 0) {
      audio.playCrash();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      setErrorAlert({
        show: true,
        title: 'UNEVEN PACKING ERROR!',
        message: `⚠️ Unevenly organized! Container pura bhar gaya par ${remainingBasketCount} vastu abhi bhi basket me bachi reh gayi! Red ↺ Button se remove karke Compact organize karein.`,
      });
    } else {
      setErrorAlert({ show: false, title: '', message: '' });
    }
  };

  // 4. Undo / Remove Item (Red ↺ Button matching media_1790069492129.png)
  const handleUndoRemove = () => {
    if (packHistory.length === 0) return;
    const lastAction = packHistory[packHistory.length - 1];

    // Remove from container
    const updatedContainers = [...containers];
    const cont = updatedContainers[lastAction.containerIdx];
    if (cont.items.length > 0) {
      cont.items = cont.items.slice(0, -1);
    }
    setContainers(updatedContainers);

    // Return to basket
    const updatedBaskets = [...baskets];
    updatedBaskets[lastAction.basketIdx].count += 1;
    setBaskets(updatedBaskets);

    // Pop from history
    setPackHistory((prev) => prev.slice(0, -1));
    setErrorAlert({ show: false, title: '', message: '' });
    audio.playClick();
  };

  // 5. Confirm Container (Green ✓ Button matching media_1790069492129.png)
  const handleConfirmContainer = () => {
    if (activeContainerIdx === null) return;
    const activeCont = containers[activeContainerIdx];
    const matchingBasket = baskets.find((b) => b.type === activeCont.type);

    // ERROR CHECK 3: If user tries to confirm while items are still left outside in the basket!
    if (matchingBasket && matchingBasket.count > 0) {
      audio.playCrash();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      setErrorAlert({
        show: true,
        title: 'CANNOT CONFIRM!',
        message: `⚠️ Sari vastu organize nahi hui! ${matchingBasket.count} vastu basket me bachi hai. Sabhi vastu ko container me organize kijiye!`,
      });
      return;
    }

    audio.playDrawerSlide();
    setErrorAlert({ show: false, title: '', message: '' });
    const updatedContainers = [...containers];
    updatedContainers[activeContainerIdx].isConfirmed = true;
    setContainers(updatedContainers);

    setActiveContainerIdx(null);
    setPhase('open');

    // Check if ALL containers are completed / all baskets emptied!
    const totalRemaining = baskets.reduce((sum, b) => sum + b.count, 0);
    const allContainersFilled = updatedContainers.every(
      (c) => c.isConfirmed
    );

    if (totalRemaining === 0 && allContainersFilled) {
      setTimeout(() => {
        setPhase('completed');
        audio.playVictory();
        setCoins((c) => c + 50);

        try {
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { x: 0.5, y: 0.5 },
          });
        } catch (e) {}
      }, 600);
    }
  };

  // Skip Level (Magenta AD Button)
  const handleSkipLevel = () => {
    audio.playClick();
    const nextLvl = levelNum < 5 ? levelNum + 1 : 1;
    setLevelNum(nextLvl);
  };

  // Calculate Milestone Progress (Vertical Slider on Left)
  const totalSlots = containers.reduce((sum, c) => sum + c.capacity, 0);
  const packedSlots = containers.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + (it.size || 1), 0),
    0
  );
  const progressPercent = totalSlots > 0 ? (packedSlots / totalSlots) * 100 : 0;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none bg-[#ebdcc9] overflow-hidden">
      {/* Ambient kitchen backdrop on desktop/laptop */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none">
        {/* Subtle wallpaper stripes */}
        <div className="absolute inset-0 bg-[radial-gradient(#d6c0a6_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        {/* Ambient bottom wooden floor */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-[#6c4323] opacity-80 border-t-4 border-[#523015] shadow-inner" />
      </div>

      {/* Centered Device Viewport matching Screenshots */}
      <div className="relative w-full max-w-[440px] sm:max-w-[480px] md:max-w-[520px] h-full flex flex-col justify-between select-none overflow-hidden font-sans bg-[#f7eedf] shadow-2xl sm:border-x sm:border-amber-200/60 transition-all">
        
        {/* ─────────────────────────────────────────────────────────────
            1. TOP HEADER HUD (Settings, Level 5, Coin Pill)
            ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 flex items-center justify-between px-4 pt-3 pb-1">
          {/* Settings Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-11 h-11 rounded-full bg-white/90 border-2 border-slate-300 shadow-md flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          >
            <Settings className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Level Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLevelNum((l) => (l > 1 ? l - 1 : 5))}
              className="w-6 h-6 rounded-full bg-black/10 text-slate-700 flex items-center justify-center hover:bg-black/20"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight drop-shadow-xs">
              Level {levelNum}
            </h1>
            <button
              onClick={() => setLevelNum((l) => (l < 5 ? l + 1 : 1))}
              className="w-6 h-6 rounded-full bg-black/10 text-slate-700 flex items-center justify-center hover:bg-black/20"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Coins Pill (Golden 520) */}
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-md border border-slate-200">
            <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-[10px] shadow-xs">
              🐾
            </div>
            <span className="text-sm font-black text-slate-800">{coins}</span>
          </div>
        </div>

        {/* Return to Home / Main Hub Button (Triggers Leave Modal matching media_1790070446761.png) */}
        <div className="flex justify-start px-4 -mt-1 mb-1 z-30">
          <button
            onClick={() => {
              audio.playClick();
              if (onHome) onHome();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full hover:bg-white shadow-xs cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-3 h-3" /> Main Hub
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN KITCHEN SCENE & FRIDGE AREA
            ───────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-end">
          
          {/* ERROR ALERT BANNER (Uneven Organization / Out of Space) */}
          {errorAlert.show && (
            <div className="absolute top-2 inset-x-3 z-50 animate-shake">
              <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-3 shadow-2xl border-2 border-white flex items-start gap-2.5">
                <span className="text-2xl animate-bounce">⚠️</span>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">
                    {errorAlert.title}
                  </h4>
                  <p className="text-[11px] font-bold leading-tight mt-0.5 text-white drop-shadow-xs">
                    {errorAlert.message}
                  </p>
                </div>
                <button
                  onClick={() => setErrorAlert({ show: false, title: '', message: '' })}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-xs font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* Kitchen Wall Backdrop with Window & Cabinetry */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Upper wall: Warm cream paint */}
            <div className="w-full h-1/2 bg-[#ebd5bc] relative">
              {/* Window on top left */}
              <div className="absolute top-2 left-3 w-28 h-32 rounded-sm border-4 border-[#8c5225] bg-[#93c5fd] shadow-inner flex flex-col justify-between p-1 overflow-hidden opacity-90">
                <div className="w-full h-3 bg-[#b45309] rounded-xs shadow-xs" />
                <div className="w-full h-0.5 bg-white/60" />
                <div className="w-full h-full border-t border-b border-white/50 flex">
                  <div className="w-1/2 h-full border-r border-white/50" />
                </div>
              </div>
            </div>

            {/* Lower wall: White Kitchen Cabinets with silver handles */}
            <div className="w-full h-1/2 bg-[#e2e8f0] border-t-2 border-slate-300 flex justify-around items-center px-4">
              <div className="w-1.5 h-10 rounded-full bg-slate-400 shadow-xs" />
              <div className="w-1.5 h-10 rounded-full bg-slate-400 shadow-xs" />
              <div className="w-1.5 h-10 rounded-full bg-slate-400 shadow-xs" />
              <div className="w-1.5 h-10 rounded-full bg-slate-400 shadow-xs" />
            </div>

            {/* Wooden Floor Planks at the bottom */}
            <div className="absolute bottom-0 inset-x-0 h-44 bg-[#6c4832] border-t-4 border-[#52331f] shadow-2xl">
              {/* Wood grain plank lines */}
              <div className="w-full h-full opacity-20 flex flex-col justify-between py-2">
                <div className="w-full h-0.5 bg-black" />
                <div className="w-full h-0.5 bg-black" />
                <div className="w-full h-0.5 bg-black" />
                <div className="w-full h-0.5 bg-black" />
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────
              LEFT PROGRESS BAR SLIDER & RESTART BUTTON (Images 4 & 5)
              ─────────────────────────────────────────────────────────── */}
          {(phase === 'open' || phase === 'zoomed') && (
            <div className="absolute left-3 top-8 z-30 flex flex-col items-center gap-3">
              {/* Blue Circular Restart Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  handleResetLevel();
                }}
                className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#38bdf8] to-[#0284c7] border-2 border-white shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <RotateCcw className="w-6 h-6 stroke-[2.8]" />
              </button>

              {/* Vertical Milestone Progress Slider */}
              <div className="w-5 h-48 rounded-full bg-white/90 border-2 border-slate-300 shadow-lg relative p-0.5 flex flex-col justify-between items-center overflow-hidden">
                {/* Golden Liquid Fill */}
                <div
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 transition-all duration-500 rounded-b-full shadow-inner"
                  style={{ height: `${progressPercent}%` }}
                />

                {/* Milestone Beads (4 nodes) */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-slate-400 bg-white/80 shadow-xs z-10 my-1"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              RIGHT SIDE ACTION CONTROLS (Image 5: Zoom Mode)
              ─────────────────────────────────────────────────────────── */}
          {phase === 'zoomed' && (
            <div className="absolute right-3 top-12 z-40 flex flex-col items-center gap-3">
              {/* Skip Level Button (Magenta Pill with AD badge) */}
              <button
                onClick={handleSkipLevel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#d946ef] to-[#c026d3] border-2 border-white shadow-lg text-white font-black text-xs active:scale-95 transition-transform"
              >
                <FastForward className="w-4 h-4 fill-white" />
                <span>Skip Level</span>
                <span className="text-[9px] bg-amber-400 text-amber-950 px-1 rounded font-black">
                  AD
                </span>
              </button>

              {/* Green Confirm Button (✓) */}
              <button
                onClick={handleConfirmContainer}
                className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#22c55e] to-[#16a34a] border-3 border-white shadow-xl flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
                title="Confirm Packed Container"
              >
                <Check className="w-9 h-9 stroke-[3.5]" />
              </button>

              {/* Red Undo / Remove Button (↺) */}
              <button
                onClick={handleUndoRemove}
                disabled={packHistory.length === 0}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-b from-[#f43f5e] to-[#e11d48] border-3 border-white shadow-xl flex items-center justify-center text-white transition-transform ${
                  packHistory.length > 0
                    ? 'active:scale-90 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                title="Remove Last Item"
              >
                <Undo2 className="w-8 h-8 stroke-[3]" />
              </button>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              GREEN REFRIGERATOR BODY (3D Perspective Center)
              ─────────────────────────────────────────────────────────── */}
          <div className="relative z-10 w-[310px] mx-auto h-[460px] flex flex-col items-center justify-center">
            
            {/* PHASE A: CLOSED REFRIGERATOR (media_1790069456789.png) */}
            {phase === 'closed' && (
              <div
                onClick={handleOpenFridge}
                className="relative w-full h-full rounded-2xl bg-gradient-to-r from-[#2e9d4a] via-[#34a853] to-[#278a3f] border-4 border-[#1f7033] shadow-2xl p-2 flex flex-col justify-between cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all"
              >
                {/* Upper Fridge Door */}
                <div className="relative w-full h-[320px] rounded-xl bg-[#2e9d4a] border-2 border-[#1f7033] shadow-inner p-3 overflow-hidden flex flex-col justify-between">
                  {/* Vertical Silver Door Handle */}
                  <div className="absolute left-2.5 top-20 w-4 h-32 rounded-md bg-gradient-to-r from-slate-200 via-white to-slate-400 border border-slate-400 shadow-lg" />

                  {/* Top Door Magnets */}
                  <div className="flex justify-between items-start pl-8 pr-2">
                    {/* Beer Mug Magnet */}
                    <div className="relative w-12 h-14 bg-gradient-to-b from-amber-300 to-amber-500 rounded-md border-2 border-amber-600 shadow-md flex flex-col items-center justify-between p-1 -rotate-6">
                      <div className="w-full h-3 rounded-full bg-white shadow-xs -mt-2" />
                      <div className="flex gap-1">
                        <div className="w-1 h-6 bg-white/70 rounded-full" />
                        <div className="w-1 h-6 bg-white/70 rounded-full" />
                      </div>
                      {/* Handle */}
                      <div className="absolute -right-2.5 top-3 w-3 h-7 rounded-r-md border-2 border-amber-600 border-l-0" />
                    </div>

                    {/* Photo / Recipe Card Memo */}
                    <div className="relative w-16 h-20 bg-white rounded-md border border-slate-300 shadow-lg p-1 flex flex-col justify-between rotate-3">
                      {/* Black round magnet pin */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-800 shadow" />
                      <div className="w-full h-3 bg-gradient-to-r from-red-500 to-amber-400 rounded-t-xs" />
                      <div className="w-full flex-1 bg-sky-200 rounded-xs my-0.5 shadow-inner" />
                    </div>
                  </div>

                  {/* Middle Sunny-Side Up Fried Egg Magnet */}
                  <div className="self-end mr-6 -mt-2">
                    <div className="relative w-11 h-11 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 border border-amber-500 shadow-inner" />
                    </div>
                  </div>

                  {/* Bottom Right Yellow Sticky Note */}
                  <div className="self-end mr-4 mb-2 relative w-12 h-12 bg-[#fef08a] border border-amber-300 shadow-md p-1 -rotate-3">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-full h-0.5 bg-amber-300 my-1" />
                    <div className="w-full h-0.5 bg-amber-300 my-1" />
                  </div>
                </div>

                {/* Bottom Freezer Drawer */}
                <div className="relative w-full h-[100px] rounded-xl bg-[#2e9d4a] border-2 border-[#1f7033] shadow-inner flex items-center justify-center">
                  {/* Horizontal Silver Handle */}
                  <div className="w-28 h-4 rounded-md bg-gradient-to-b from-slate-200 via-white to-slate-400 border border-slate-400 shadow-md" />
                </div>

                {/* Pulsating Tap Hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 px-4 py-1.5 rounded-full shadow-lg border border-emerald-300 flex items-center gap-1.5 animate-bounce">
                  <span className="text-xs font-black text-emerald-800">
                    👆 TAP FRIDGE TO OPEN
                  </span>
                </div>
              </div>
            )}

            {/* PHASE B: OPEN REFRIGERATOR SHELVES VIEW (media_1790069480970.png) */}
            {phase === 'open' && (
              <div className="relative w-full h-full flex">
                {/* Fridge Interior Cavity */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#e8f5e9] to-[#d1fae5] border-4 border-[#1f7033] shadow-2xl p-2 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* 4 Shelves with Translucent Acrylic Containers */}
                  {[1, 2, 3, 4].map((shelfNum) => {
                    const shelfContainers = containers.filter((c) => c.shelf === shelfNum);

                    return (
                      <div
                        key={shelfNum}
                        className="relative w-full rounded-xl bg-white/70 border-b-4 border-[#2dd4bf] p-1.5 flex gap-2 items-center justify-around min-h-[85px] shadow-sm"
                      >
                        {shelfContainers.length === 0 ? (
                          <div className="w-full h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            Empty Shelf
                          </div>
                        ) : (
                          shelfContainers.map((cont, cIdx) => {
                            const contGlobalIdx = containers.findIndex((c) => c.id === cont.id);
                            const isFull = cont.items.length >= cont.capacity;

                            return (
                              <button
                                key={cont.id}
                                onClick={() => handleSelectContainer(contGlobalIdx)}
                                className={`flex-1 h-[72px] rounded-xl border-2 transition-all p-1 flex flex-col justify-between items-center relative cursor-pointer active:scale-95 shadow-md ${
                                  isFull
                                    ? 'bg-emerald-50/90 border-emerald-400'
                                    : 'bg-white/90 border-[#2dd4bf] hover:border-emerald-500 animate-pulse'
                                }`}
                              >
                                {/* Acrylic Top Rim */}
                                <div className="w-full h-2 rounded-t-lg bg-[#2dd4bf]/40 border-b border-[#0d9488]" />

                                {/* Container Packed Items Preview */}
                                <div className="flex-1 w-full flex items-center justify-center gap-1 overflow-hidden">
                                  {cont.items.length === 0 ? (
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                      + PACK
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-0.5 items-center justify-center">
                                      {cont.items.map((it, itIdx) => (
                                        <div key={itIdx} className="scale-75 -m-1">
                                          <GroceryItemGraphic type={it.type} size="sm" isSlanted={it.isSlanted} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Item Count Pill */}
                                <div className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700">
                                  {cont.items.reduce((s, it) => s + (it.size || 1), 0)}/{cont.capacity}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3D Open Door Swung to the Right */}
                <div className="w-8 h-full bg-[#2e9d4a] border-l-2 border-[#1f7033] shadow-2xl rounded-r-lg opacity-90 -mr-2" />
              </div>
            )}

            {/* PHASE C: ZOOMED CONTAINER PACKING VIEW (media_1790069492129.png) */}
            {phase === 'zoomed' && activeContainerIdx !== null && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                
                {/* 1. Pack Mode Switcher: Compact (1 slot) vs Slanted/Uneven (2 slots) */}
                <div className="flex items-center gap-1.5 bg-white/95 rounded-2xl p-1 shadow-md border border-slate-300 mb-1 z-30">
                  <button
                    onClick={() => {
                      audio.playClick();
                      setPackMode('compact');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                      packMode === 'compact'
                        ? 'bg-emerald-500 text-white shadow-sm scale-105'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>📐 Compact (1 slot)</span>
                  </button>
                  <button
                    onClick={() => {
                      audio.playClick();
                      setPackMode('slanted');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                      packMode === 'slanted'
                        ? 'bg-amber-500 text-white shadow-sm scale-105'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>📐 Slanted (2 slots)</span>
                  </button>
                </div>

                {/* 2. 3D Zoomed Acrylic Container */}
                <div
                  className={`relative w-64 h-[305px] rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100 border-4 shadow-2xl p-3 flex flex-col justify-between overflow-hidden transition-all duration-200 ${
                    isShaking
                      ? 'animate-shake border-rose-500 ring-4 ring-rose-400 bg-rose-50/30'
                      : 'border-[#2dd4bf]'
                  }`}
                >
                  {/* Container Rim Header */}
                  <div className="w-full h-5 rounded-t-xl bg-[#2dd4bf]/40 border-b-2 border-[#0d9488] flex items-center justify-between px-2 text-[10px] font-black text-teal-900">
                    <span>{containers[activeContainerIdx].label}</span>
                    <span>
                      Slots: {containers[activeContainerIdx].items.reduce((s, it) => s + (it.size || 1), 0)} /{' '}
                      {containers[activeContainerIdx].capacity}
                    </span>
                  </div>

                  {/* Slot Capacity Progress Bars */}
                  <div className="w-full flex gap-1 h-2 bg-slate-200 rounded-full p-0.5 my-0.5">
                    {Array.from({ length: containers[activeContainerIdx].capacity }).map((_, slotI) => {
                      const used = containers[activeContainerIdx].items.reduce((s, it) => s + (it.size || 1), 0);
                      const isSlotFilled = slotI < used;
                      return (
                        <div
                          key={slotI}
                          className={`flex-1 h-full rounded-full transition-all ${
                            isSlotFilled
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* 3D Container Cavity: Items stack neatly inside */}
                  <div className="flex-1 w-full bg-gradient-to-b from-slate-200/50 via-slate-100/70 to-white rounded-xl p-2 shadow-inner flex flex-wrap gap-2 items-center justify-center content-center relative overflow-hidden">
                    {containers[activeContainerIdx].items.length === 0 ? (
                      <div className="flex flex-col items-center text-center text-slate-400">
                        <span className="text-3xl mb-1 animate-bounce">📦</span>
                        <span className="text-xs font-black">
                          TAP BASKET BELOW TO PACK!
                        </span>
                      </div>
                    ) : (
                      containers[activeContainerIdx].items.map((it, idx) => (
                        <div
                          key={idx}
                          className="transition-all duration-200 animate-fade-in"
                        >
                          <GroceryItemGraphic
                            type={it.type}
                            isZoomed={true}
                            isSlanted={it.isSlanted}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bottom Status bar */}
                  <div className="w-full text-center text-[10px] font-black text-slate-600">
                    {containers[activeContainerIdx].items.reduce((s, it) => s + (it.size || 1), 0) >=
                    containers[activeContainerIdx].capacity ? (
                      <span className="text-emerald-600 font-bold">
                        Full! Press ✓ to confirm
                      </span>
                    ) : (
                      <span>
                        {containers[activeContainerIdx].capacity -
                          containers[activeContainerIdx].items.reduce((s, it) => s + (it.size || 1), 0)}{' '}
                        slot(s) remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────
              3. GROCERY BASKETS (Horizontal Scrolling Wooden Floor)
              Matches media_1790069456789.png, media_1790069465841.png, media_1790069476748.png
              ─────────────────────────────────────────────────────────── */}
          <div className="relative z-20 w-full bg-[#52331f]/90 border-t-2 border-amber-900/40 py-2.5 px-2">
            
            {/* Horizontal Scrollable Baskets Container */}
            <div
              ref={scrollRef}
              className="w-full overflow-x-auto scrollbar-none flex gap-3 px-2 py-1 items-end select-none"
            >
              {baskets.map((basket, bIdx) => {
                const isSelected = activeBasketIdx === bIdx;
                const isExhausted = basket.count <= 0;

                return (
                  <button
                    key={basket.id}
                    onClick={() => {
                      setActiveBasketIdx(bIdx);
                      if (phase === 'zoomed') {
                        handlePackItem(bIdx);
                      } else if (phase === 'open') {
                        // Find matching container and zoom into it!
                        const matchingContIdx = containers.findIndex((c) => c.type === basket.type);
                        if (matchingContIdx !== -1) {
                          handleSelectContainer(matchingContIdx);
                        }
                      }
                    }}
                    className={`shrink-0 w-24 h-28 rounded-2xl border-3 transition-all p-1.5 flex flex-col justify-between items-center relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#c4c1f0] border-white shadow-xl scale-105 z-10'
                        : 'bg-[#b4b2e6] border-[#9592cc] hover:bg-[#c4c1f0] shadow-md'
                    } ${isExhausted ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    {/* Lavender Mesh Plastic Basket Pattern */}
                    <div className="absolute inset-1 rounded-xl border border-dashed border-indigo-300 pointer-events-none" />

                    {/* Basket 3D Grocery Items Graphic */}
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                      <GroceryItemGraphic type={basket.type} size="md" />
                    </div>

                    {/* Count Badge (e.g. x4) */}
                    <div className="w-full flex items-center justify-between px-1 bg-white/80 rounded-lg text-[10px] font-black text-slate-800">
                      <span className="truncate max-w-[50px]">{basket.label}</span>
                      <span className="text-indigo-700">x{basket.count}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scroll indicators if more than 3 baskets */}
            {baskets.length > 3 && (
              <div className="flex justify-between items-center px-4 pt-1 text-[10px] font-black text-amber-200/70">
                <span>◀ Scroll</span>
                <span>👉 Swipe right for more items</span>
                <span>Scroll ▶</span>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. LEVEL COMPLETED VICTORY MODAL (Matches Video Reference)
            ───────────────────────────────────────────────────────────── */}
        {phase === 'completed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xs rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 shadow-2xl flex flex-col items-center text-center">
              
              {/* Level Ribbon */}
              <div className="w-48 h-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl flex items-center justify-center font-black text-sm uppercase mb-3 shadow-lg">
                Level {levelNum} Completed!
              </div>

              {/* Golden Piggy Bank */}
              <div className="text-7xl mb-2 animate-bounce">🐷</div>

              {/* 3 Golden Stars */}
              <div className="flex gap-2 text-amber-400 text-3xl mb-3">
                <span className="animate-pulse">⭐</span>
                <span className="animate-pulse">⭐</span>
                <span className="animate-pulse">⭐</span>
              </div>

              <div className="bg-amber-400/20 text-amber-300 font-black text-base px-4 py-1.5 rounded-full border border-amber-400/40 mb-5">
                +100 🪙 Rewarded!
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    audio.playClick();
                    const next = levelNum < 5 ? levelNum + 1 : 1;
                    setLevelNum(next);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-black text-base uppercase tracking-wider shadow-lg active:scale-95"
                >
                  {levelNum < 5 ? 'Next Level' : 'Play Again'}
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    handleResetLevel(levelNum);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 active:scale-95"
                >
                  Replay Level
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    if (onHome) onHome();
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800/60 text-slate-400 font-bold text-xs hover:bg-slate-800 active:scale-95 cursor-pointer"
                >
                  Exit to Main Hub
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
