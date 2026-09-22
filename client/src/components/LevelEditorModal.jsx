import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Play, Save, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import audio from '../game/AudioEngine';
import { findNextHint, buildGrid } from '../game/HintSolver';

export default function LevelEditorModal({
  isOpen,
  onClose,
  onPlayCustomLevel,
}) {
  const [levelName, setLevelName] = useState('My Custom Jam');
  const [gridDim, setGridDim] = useState(6);
  const [vehicles, setVehicles] = useState([
    { id: 'custom_1', row: 1, col: 1, length: 2, orientation: 'H', direction: 'right', color: '#EF4444', type: 'sedan' },
    { id: 'custom_2', row: 3, col: 2, length: 2, orientation: 'V', direction: 'down', color: '#3B82F6', type: 'sedan' },
  ]);
  const [obstacles, setObstacles] = useState([]);

  // Selected placement tool
  const [tool, setTool] = useState('car'); // 'car', 'obstacle', 'erase'
  const [carLength, setCarLength] = useState(2);
  const [carDir, setCarDir] = useState('right');
  const [carColor, setCarColor] = useState('#EF4444');
  const [obsType, setObsType] = useState('cone');

  const [validationResult, setValidationResult] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleCellClick = (r, c) => {
    audio.playClick();
    setValidationResult(null);

    if (tool === 'erase') {
      // Erase vehicle or obstacle on this cell
      setVehicles((prev) =>
        prev.filter((v) => {
          for (let i = 0; i < v.length; i++) {
            const vr = v.orientation === 'V' ? v.row + i : v.row;
            const vc = v.orientation === 'H' ? v.col + i : v.col;
            if (vr === r && vc === c) return false;
          }
          return true;
        })
      );
      setObstacles((prev) => prev.filter((o) => !(o.row === r && o.col === c)));
      return;
    }

    if (tool === 'obstacle') {
      // Remove any existing car/obstacle here first
      setObstacles((prev) => [
        ...prev.filter((o) => !(o.row === r && o.col === c)),
        { row: r, col: c, type: obsType },
      ]);
      return;
    }

    if (tool === 'car') {
      const orientation = carDir === 'left' || carDir === 'right' ? 'H' : 'V';
      // Bounds check
      if (orientation === 'H' && c + carLength > gridDim) return;
      if (orientation === 'V' && r + carLength > gridDim) return;

      const newCar = {
        id: 'car_' + Date.now().toString().slice(-4),
        row: r,
        col: c,
        length: carLength,
        orientation,
        direction: carDir,
        color: carColor,
        type: carLength === 3 ? 'truck' : 'sedan',
      };

      setVehicles((prev) => [...prev, newCar]);
    }
  };

  const validateSolvability = () => {
    audio.playClick();
    const candidate = {
      name: levelName,
      gridSize: { rows: gridDim, cols: gridDim },
      vehicles,
      obstacles,
    };

    // Client check
    const hint = findNextHint(candidate, new Set());
    if (!hint) {
      setValidationResult({
        solvable: false,
        message: 'Puzzle cannot be solved! At least one car is permanently trapped.',
      });
      audio.playCrash();
    } else {
      setValidationResult({
        solvable: true,
        message: 'Puzzle is 100% solvable and valid!',
      });
      audio.playSuccess();
    }
  };

  const handleSaveAndPlay = async () => {
    audio.playClick();
    setSaving(true);
    try {
      const candidate = {
        name: levelName,
        gridSize: { rows: gridDim, cols: gridDim },
        vehicles,
        obstacles,
      };

      const res = await fetch('/api/custom-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      });

      const data = await res.json();
      if (data.success) {
        onPlayCustomLevel(data.level);
        onClose();
      } else {
        setValidationResult({ solvable: false, message: data.error || 'Failed to save' });
      }
    } catch (err) {
      setValidationResult({ solvable: false, message: 'Server error saving level' });
    } finally {
      setSaving(false);
    }
  };

  // Build grid preview
  const grid = buildGrid({ rows: gridDim, cols: gridDim }, vehicles, obstacles);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <h2 className="game-title text-xl font-black text-white">LEVEL BUILDER</h2>
              <p className="text-xs text-slate-400">Design & test your custom parking jams</p>
            </div>
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

        {/* Builder Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col md:flex-row gap-5 items-center justify-center">
          {/* Left: Interactive 2D Grid Preview */}
          <div className="flex flex-col items-center">
            <div
              className="bg-slate-900/90 p-2.5 rounded-2xl border-2 border-slate-700 shadow-xl grid gap-1 select-none"
              style={{
                gridTemplateColumns: `repeat(${gridDim}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: gridDim }).map((_, r) =>
                Array.from({ length: gridDim }).map((_, c) => {
                  const cell = grid[r][c];
                  const isCar = cell?.type === 'vehicle';
                  const isObs = cell?.type === 'obstacle';

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all border text-xs font-bold ${
                        isCar
                          ? 'border-white/30 text-white shadow-md'
                          : isObs
                          ? 'bg-orange-600/80 border-orange-400 text-white'
                          : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/50 text-slate-500'
                      }`}
                      style={{
                        backgroundColor: isCar ? cell.vehicle.color : undefined,
                      }}
                    >
                      {isCar ? (
                        cell.vehicle.direction === 'right' ? (
                          <ArrowRight className="w-4 h-4" />
                        ) : cell.vehicle.direction === 'left' ? (
                          <ArrowLeft className="w-4 h-4" />
                        ) : cell.vehicle.direction === 'up' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : isObs ? (
                        '⚠️'
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <span className="text-[11px] text-slate-400 mt-2">
              Click cells to place vehicles or obstacles
            </span>
          </div>

          {/* Right: Controls & Tools */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {/* Level Name */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">Level Name</label>
              <input
                type="text"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Tool Selection */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Tool</label>
              <div className="flex gap-2">
                {[
                  { id: 'car', label: 'Car' },
                  { id: 'obstacle', label: 'Obstacle' },
                  { id: 'erase', label: 'Erase' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      tool === t.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Car Options */}
            {tool === 'car' && (
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Length:</span>
                  <div className="flex gap-2">
                    {[2, 3].map((len) => (
                      <button
                        key={len}
                        onClick={() => setCarLength(len)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          carLength === len
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {len === 2 ? 'Sedan (2)' : 'Truck (3)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Direction:</span>
                  <div className="flex gap-1">
                    {[
                      { id: 'left', icon: ArrowLeft },
                      { id: 'right', icon: ArrowRight },
                      { id: 'up', icon: ArrowUp },
                      { id: 'down', icon: ArrowDown },
                    ].map((d) => {
                      const Icon = d.icon;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setCarDir(d.id)}
                          className={`p-1.5 rounded-lg border ${
                            carDir === d.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Color:</span>
                  <div className="flex gap-1.5">
                    {['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCarColor(c)}
                        className={`w-5 h-5 rounded-full border-2 ${
                          carColor === c ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Feedback */}
            {validationResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  validationResult.solvable
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {validationResult.solvable ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={validateSolvability}
                className="btn-game-icon flex-1 py-2.5 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Test Solvability</span>
              </button>

              <button
                onClick={handleSaveAndPlay}
                disabled={saving || vehicles.length === 0}
                className="btn-game-primary flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Puzzle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
