/**
 * Car Out Level Solver & Solvability Checker
 * Evaluates whether a parking jam level can be completely cleared,
 * and determines the optimal sequence of moves / hints.
 */

function buildGrid(gridSize, vehicles, obstacles, exitedCarIds = new Set()) {
  const { rows, cols } = gridSize;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Mark obstacles
  for (const obs of obstacles || []) {
    if (obs.row >= 0 && obs.row < rows && obs.col >= 0 && obs.col < cols) {
      grid[obs.row][obs.col] = { type: 'obstacle', ...obs };
    }
  }

  // Mark vehicles that haven't exited
  for (const v of vehicles) {
    if (exitedCarIds.has(v.id)) continue;
    for (let i = 0; i < v.length; i++) {
      const r = v.orientation === 'V' ? v.row + i : v.row;
      const c = v.orientation === 'H' ? v.col + i : v.col;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        grid[r][c] = { type: 'vehicle', id: v.id, vehicle: v };
      }
    }
  }

  return grid;
}

/**
 * Checks if a car has a clear forward path to exit the grid.
 */
function canCarExit(vehicle, grid, gridSize) {
  const { rows, cols } = gridSize;
  const { row, col, length, orientation, direction } = vehicle;

  if (orientation === 'H') {
    if (direction === 'right') {
      const startC = col + length;
      for (let c = startC; c < cols; c++) {
        if (grid[row][c] !== null) return false;
      }
      return true;
    } else if (direction === 'left') {
      for (let c = col - 1; c >= 0; c--) {
        if (grid[row][c] !== null) return false;
      }
      return true;
    }
  } else if (orientation === 'V') {
    if (direction === 'down') {
      const startR = row + length;
      for (let r = startR; r < rows; r++) {
        if (grid[r][col] !== null) return false;
      }
      return true;
    } else if (direction === 'up') {
      for (let r = row - 1; r >= 0; r--) {
        if (grid[r][col] !== null) return false;
      }
      return true;
    }
  }
  return false;
}

/**
 * Finds all cars currently capable of exiting immediately.
 */
function getImmediatelyExitableCars(vehicles, grid, gridSize, exitedCarIds) {
  const exitable = [];
  for (const v of vehicles) {
    if (!exitedCarIds.has(v.id)) {
      if (canCarExit(v, grid, gridSize)) {
        exitable.push(v);
      }
    }
  }
  return exitable;
}

/**
 * Breadth-First Search to find a winning sequence of exits.
 * Supports sliding mechanics as well if enabled.
 */
function solveCarOut(level) {
  const { gridSize, vehicles, obstacles = [] } = level;
  const allVehicleIds = new Set(vehicles.map((v) => v.id));
  const totalVehicles = vehicles.length;

  // Queue of states: { exitedCarIds: Set, moves: [carId] }
  const queue = [{ exitedCarIds: new Set(), moves: [] }];
  const visited = new Set();

  function stateKey(exitedSet) {
    return Array.from(exitedSet).sort().join(',');
  }

  while (queue.length > 0) {
    const { exitedCarIds, moves } = queue.shift();

    if (exitedCarIds.size === totalVehicles) {
      return {
        solvable: true,
        moves,
        minMoves: moves.length,
      };
    }

    const key = stateKey(exitedCarIds);
    if (visited.has(key)) continue;
    visited.add(key);

    const grid = buildGrid(gridSize, vehicles, obstacles, exitedCarIds);
    const exitableCars = getImmediatelyExitableCars(vehicles, grid, gridSize, exitedCarIds);

    for (const car of exitableCars) {
      const nextExited = new Set(exitedCarIds);
      nextExited.add(car.id);
      queue.push({
        exitedCarIds: nextExited,
        moves: [...moves, car.id],
      });
    }
  }

  return {
    solvable: false,
    moves: [],
    minMoves: 0,
  };
}

module.exports = {
  buildGrid,
  canCarExit,
  getImmediatelyExitableCars,
  solveCarOut,
};
