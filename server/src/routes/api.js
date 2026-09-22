const express = require('express');
const fs = require('fs');
const path = require('path');
const { solveCarOut } = require('../utils/solver');

const router = express.Router();
const levelsDataPath = path.join(__dirname, '../data/levels.json');
const customLevelsPath = path.join(__dirname, '../data/custom_levels.json');
const modeLevelsPath = path.join(__dirname, '../data/mode_levels.json');

// In-memory / persistent user progress store
let playerProgress = {
  coins: 250,
  levels: {}, // car_out levels
  modeProgress: {
    park_master: {},
    bus_jam: {},
    traffic_escape: {},
    car_match: {},
  },
  unlockedSkins: ['classic', 'sedan'],
  unlockedThemes: ['city_asphalt'],
  selectedSkin: 'classic',
  selectedTheme: 'city_asphalt',
};

// Initial shop items
const shopItems = {
  skins: [
    { id: 'classic', name: 'Standard Fleet', type: 'skin', price: 0, previewColor: '#3B82F6', icon: 'Car' },
    { id: 'cyber', name: 'Cyber Neon', type: 'skin', price: 300, previewColor: '#06B6D4', icon: 'Zap' },
    { id: 'police_vip', name: 'Police Patrol', type: 'skin', price: 500, previewColor: '#1E293B', icon: 'Shield' },
    { id: 'golden', name: 'Golden Luxury', type: 'skin', price: 800, previewColor: '#F59E0B', icon: 'Crown' },
    { id: 'speedster', name: 'Red Speedster', type: 'skin', price: 1000, previewColor: '#EF4444', icon: 'Flame' },
  ],
  themes: [
    { id: 'city_asphalt', name: 'Metro Asphalt', type: 'theme', price: 0, groundColor: '#1e293b', accentColor: '#38bdf8' },
    { id: 'cyber_grid', name: 'Neon Cyberpunk', type: 'theme', price: 400, groundColor: '#0f172a', accentColor: '#ec4899' },
    { id: 'sunny_beach', name: 'Sunny Coast', type: 'theme', price: 600, groundColor: '#fef08a', accentColor: '#0ea5e9' },
    { id: 'emerald_park', name: 'Emerald Park', type: 'theme', price: 750, groundColor: '#064e3b', accentColor: '#10b981' },
  ],
};

function getLevels() {
  const data = fs.readFileSync(levelsDataPath, 'utf8');
  return JSON.parse(data);
}

function getModeLevels() {
  const data = fs.readFileSync(modeLevelsPath, 'utf8');
  return JSON.parse(data);
}

function getCustomLevels() {
  if (!fs.existsSync(customLevelsPath)) {
    fs.writeFileSync(customLevelsPath, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(customLevelsPath, 'utf8');
  return JSON.parse(data);
}

// 0. List all 5 game modes
router.get('/modes', (req, res) => {
  const modes = [
    {
      id: 'car_out',
      name: 'Car Out (Parking Jam)',
      tagline: 'Classic 3D Gridlock Puzzle',
      icon: 'Car',
      description: 'Tap to maneuver crowded cars out of the 3D parking lot without crashing into other cars or obstacles.',
      badge: 'Main Game',
      color: '#38bdf8',
      levelsCount: getLevels().length,
    },
    {
      id: 'park_master',
      name: 'Park Master (Draw Path)',
      tagline: 'Multi-Car Route Planner',
      icon: 'Edit3',
      description: 'Draw finger trajectories for each car to reach its matching colored parking bay. Avoid intersections and crashes!',
      badge: 'Popular',
      color: '#fbbf24',
      levelsCount: getModeLevels().park_master.length,
    },
    {
      id: 'bus_jam',
      name: 'Bus Jam (Passenger Sort)',
      tagline: 'Queue & Color Matching',
      icon: 'Bus',
      description: 'Waiting passengers want to board buses of their matching color. Clear the pickup docks without gridlocking!',
      badge: 'Puzzle',
      color: '#10b981',
      levelsCount: getModeLevels().bus_jam.length,
    },
    {
      id: 'traffic_escape',
      name: 'Traffic Escape (Highway Merge)',
      tagline: 'Precision Speed & Timing',
      icon: 'Zap',
      description: 'Tap at the exact right millisecond to merge from the on-ramp into high-speed continuous highway traffic.',
      badge: 'Action',
      color: '#ef4444',
      levelsCount: getModeLevels().traffic_escape.length,
    },
    {
      id: 'car_match',
      name: 'Car Match 3D (Triple Sort)',
      tagline: 'Tile-Matching Dock Challenge',
      icon: 'Layers',
      description: 'Dock cars into your 7-slot tray. Collect 3 of the same color to clear them before the dock overflows!',
      badge: 'Addictive',
      color: '#a855f7',
      levelsCount: getModeLevels().car_match.length,
    },
  ];
  res.json({ modes, coins: playerProgress.coins });
});

// 0.1 Specific mode levels
router.get('/modes/:mode/levels', (req, res) => {
  const { mode } = req.params;
  const modeData = getModeLevels();
  if (!modeData[mode]) {
    return res.status(404).json({ error: 'Mode not found' });
  }
  const levels = modeData[mode].map((lvl) => ({
    id: lvl.id,
    name: lvl.name,
    stars: playerProgress.modeProgress[mode]?.[lvl.id]?.stars || 0,
    completed: !!playerProgress.modeProgress[mode]?.[lvl.id]?.completed,
  }));
  res.json({ mode, levels, coins: playerProgress.coins });
});

router.get('/modes/:mode/levels/:id', (req, res) => {
  const { mode, id } = req.params;
  const modeData = getModeLevels();
  if (!modeData[mode]) {
    return res.status(404).json({ error: 'Mode not found' });
  }
  const levelId = parseInt(id, 10);
  const level = modeData[mode].find((l) => l.id === levelId);
  if (!level) {
    return res.status(404).json({ error: 'Level not found' });
  }
  res.json({ mode, level, coins: playerProgress.coins });
});

// 1. Get all Car Out levels summary
router.get('/levels', (req, res) => {
  try {
    const levels = getLevels();
    const summary = levels.map((lvl) => ({
      id: lvl.id,
      name: lvl.name,
      difficulty: lvl.difficulty,
      vehiclesCount: lvl.vehicles.length,
      obstaclesCount: lvl.obstacles?.length || 0,
      gridSize: lvl.gridSize,
      targetPar: lvl.targetPar,
      stars: playerProgress.levels[lvl.id]?.stars || 0,
      completed: !!playerProgress.levels[lvl.id]?.completed,
      bestMoves: playerProgress.levels[lvl.id]?.bestMoves || null,
    }));
    res.json({ levels: summary, playerProgress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get specific Car Out level
router.get('/levels/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const levels = getLevels();
    const level = levels.find((l) => l.id === id);

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    res.json({
      level,
      progress: playerProgress.levels[id] || null,
      playerCoins: playerProgress.coins,
      selectedSkin: playerProgress.selectedSkin,
      selectedTheme: playerProgress.selectedTheme,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Request hint for Car Out level
router.get('/levels/:id/hint', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const levels = getLevels();
    const level = levels.find((l) => l.id === id);

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const solution = solveCarOut(level);
    res.json({
      solvable: solution.solvable,
      suggestedNextCarId: solution.moves[0] || null,
      fullSequence: solution.moves,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Save score / completion for any mode
router.post('/score', (req, res) => {
  try {
    const { levelId, moves = 1, timeSeconds = 10, stars = 3, mode = 'car_out' } = req.body;
    const id = parseInt(levelId, 10);

    const coinsEarned = stars * 25 + Math.max(0, 100 - moves * 5);
    playerProgress.coins += coinsEarned;

    if (mode === 'car_out') {
      const prev = playerProgress.levels[id] || { stars: 0, bestMoves: Infinity, completed: false };
      playerProgress.levels[id] = {
        completed: true,
        stars: Math.max(prev.stars, stars),
        bestMoves: Math.min(prev.bestMoves, moves),
        lastTime: timeSeconds,
      };
    } else {
      if (!playerProgress.modeProgress[mode]) {
        playerProgress.modeProgress[mode] = {};
      }
      playerProgress.modeProgress[mode][id] = {
        completed: true,
        stars: Math.max(playerProgress.modeProgress[mode][id]?.stars || 0, stars),
        lastTime: timeSeconds,
      };
    }

    res.json({
      success: true,
      coinsEarned,
      totalCoins: playerProgress.coins,
      mode,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Overall player stats
router.get('/stats', (req, res) => {
  try {
    const levels = getLevels();
    const totalLevels = levels.length;
    let completedCount = 0;
    let totalStars = 0;

    for (const key in playerProgress.levels) {
      if (playerProgress.levels[key].completed) completedCount++;
      totalStars += playerProgress.levels[key].stars || 0;
    }

    res.json({
      totalLevels,
      completedCount,
      totalStars,
      maxStars: totalLevels * 3,
      coins: playerProgress.coins,
      selectedSkin: playerProgress.selectedSkin,
      selectedTheme: playerProgress.selectedTheme,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Shop items
router.get('/shop', (req, res) => {
  res.json({
    coins: playerProgress.coins,
    skins: shopItems.skins.map((s) => ({
      ...s,
      unlocked: playerProgress.unlockedSkins.includes(s.id),
      selected: playerProgress.selectedSkin === s.id,
    })),
    themes: shopItems.themes.map((t) => ({
      ...t,
      unlocked: playerProgress.unlockedThemes.includes(t.id),
      selected: playerProgress.selectedTheme === t.id,
    })),
  });
});

// 7. Shop unlock / select
router.post('/shop/select', (req, res) => {
  const { type, id } = req.body;
  if (type === 'skin') {
    if (playerProgress.unlockedSkins.includes(id)) {
      playerProgress.selectedSkin = id;
      return res.json({ success: true, selectedSkin: id });
    }
    const item = shopItems.skins.find((s) => s.id === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (playerProgress.coins < item.price) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    playerProgress.coins -= item.price;
    playerProgress.unlockedSkins.push(id);
    playerProgress.selectedSkin = id;
    return res.json({ success: true, unlocked: true, coins: playerProgress.coins, selectedSkin: id });
  } else if (type === 'theme') {
    if (playerProgress.unlockedThemes.includes(id)) {
      playerProgress.selectedTheme = id;
      return res.json({ success: true, selectedTheme: id });
    }
    const item = shopItems.themes.find((t) => t.id === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (playerProgress.coins < item.price) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    playerProgress.coins -= item.price;
    playerProgress.unlockedThemes.push(id);
    playerProgress.selectedTheme = id;
    return res.json({ success: true, unlocked: true, coins: playerProgress.coins, selectedTheme: id });
  }
  res.status(400).json({ error: 'Invalid type' });
});

// 8. Custom levels (list and create)
router.get('/custom-levels', (req, res) => {
  const list = getCustomLevels();
  res.json({ customLevels: list });
});

router.post('/custom-levels', (req, res) => {
  try {
    const customLevel = req.body;
    if (!customLevel.name || !customLevel.gridSize || !customLevel.vehicles || customLevel.vehicles.length === 0) {
      return res.status(400).json({ error: 'Incomplete level definition' });
    }

    const solution = solveCarOut(customLevel);
    if (!solution.solvable) {
      return res.status(400).json({
        error: 'This puzzle cannot be solved! At least one car is permanently trapped or blocked. Adjust vehicle directions and obstacles.',
      });
    }

    customLevel.id = 'custom_' + Date.now();
    customLevel.targetPar = solution.minMoves;
    customLevel.solutionMoves = solution.moves;

    const current = getCustomLevels();
    current.push(customLevel);
    fs.writeFileSync(customLevelsPath, JSON.stringify(current, null, 2));

    res.json({ success: true, level: customLevel, minMoves: solution.minMoves });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
