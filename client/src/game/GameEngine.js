import { buildGrid, canCarExit, getCarMoveDistance, findNextHint } from './HintSolver';
import audio from './AudioEngine';
import confetti from 'canvas-confetti';

/**
 * GameEngine - Core Gameplay State Machine
 */
export class GameEngine {
  constructor({ renderer, onStateChange, onLevelComplete }) {
    this.renderer = renderer;
    this.onStateChange = onStateChange || (() => {});
    this.onLevelComplete = onLevelComplete || (() => {});

    this.level = null;
    this.moves = 0;
    this.startTime = null;
    this.exitedCarIds = new Set();
    this.history = []; // stack of exited vehicles for undo
    this.isGameOver = false;
    this.isProcessingMove = false;
  }

  loadLevel(level) {
    this.level = level;
    this.moves = 0;
    this.startTime = Date.now();
    this.exitedCarIds.clear();
    this.history = [];
    this.isGameOver = false;
    this.isProcessingMove = false;

    // Build 3D world
    this.renderer.clearHint();
    this.renderer.buildEnvironment(level.gridSize, level.exits);
    this.renderer.buildObstacles(level.obstacles || []);
    this.renderer.loadVehicles(level.vehicles);

    this.notifyState();
  }

  handleCarClick(carId) {
    if (this.isGameOver || this.isProcessingMove || !this.level) return;
    if (this.exitedCarIds.has(carId)) return;

    const vehicle = this.level.vehicles.find((v) => v.id === carId);
    if (!vehicle) return;

    this.renderer.clearHint();

    // Check grid status with wall exits
    const grid = buildGrid(this.level.gridSize, this.level.vehicles, this.level.obstacles, this.exitedCarIds);
    const { canExit, clearSteps } = getCarMoveDistance(vehicle, grid, this.level.gridSize, this.level.exits);

    this.moves++;

    if (canExit) {
      // Car exits successfully!
      this.isProcessingMove = true;
      this.exitedCarIds.add(carId);
      this.history.push({ ...vehicle });

      audio.playDriveOff();

      this.renderer.animateExit(carId, () => {
        this.isProcessingMove = false;
        this.checkWinCondition();
        this.notifyState();
      });
    } else {
      // Blocked! Crash & bump recoil
      audio.playCrash();
      setTimeout(() => audio.playHorn(), 120);

      this.renderer.animateCollision(carId, clearSteps);
    }

    this.notifyState();
  }

  checkWinCondition() {
    if (this.exitedCarIds.size === this.level.vehicles.length) {
      this.isGameOver = true;
      const elapsedSeconds = Math.round((Date.now() - this.startTime) / 1000);

      // Star calculation
      let stars = 1;
      if (this.moves <= this.level.targetPar) {
        stars = 3;
      } else if (this.moves <= this.level.targetPar + 3) {
        stars = 2;
      }

      // Allow player to see the last car exit onto the road before opening success modal
      setTimeout(() => {
        audio.playVictory();

        // Confetti burst
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#fbbf24', '#ef4444', '#10b981', '#a855f7'],
          });
        } catch (e) {
          // ignore if not supported
        }

        this.onLevelComplete({
          levelId: this.level.id,
          levelName: this.level.name,
          moves: this.moves,
          targetPar: this.level.targetPar,
          stars,
          timeSeconds: elapsedSeconds,
        });
      }, 500);
    }
  }

  undo() {
    if (this.isProcessingMove || this.history.length === 0) return;

    const restoredVehicle = this.history.pop();
    this.exitedCarIds.delete(restoredVehicle.id);

    audio.playUndo();
    this.renderer.restoreVehicle(restoredVehicle);
    this.renderer.clearHint();

    this.notifyState();
  }

  requestHint() {
    if (this.isGameOver || this.isProcessingMove || !this.level) return;

    const hintCarId = findNextHint(this.level, this.exitedCarIds);
    if (hintCarId) {
      audio.playHint();
      this.renderer.showHint(hintCarId);
    }
  }

  restart() {
    if (this.level) {
      this.loadLevel(this.level);
    }
  }

  notifyState() {
    const total = this.level ? this.level.vehicles.length : 0;
    const remaining = total - this.exitedCarIds.size;

    this.onStateChange({
      moves: this.moves,
      targetPar: this.level ? this.level.targetPar : 0,
      carsRemaining: remaining,
      totalCars: total,
      canUndo: this.history.length > 0 && !this.isProcessingMove && !this.isGameOver,
      isGameOver: this.isGameOver,
    });
  }
}
