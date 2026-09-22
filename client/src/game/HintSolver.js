/**
 * Client-Side BFS Solver for Car Out
 * Quickly finds the next move or full solution for hints.
 */

export function buildGrid(gridSize, vehicles, obstacles, exitedCarIds = new Set()) {
  const { rows, cols } = gridSize;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (const obs of obstacles || []) {
    if (obs.row >= 0 && obs.row < rows && obs.col >= 0 && obs.col < cols) {
      grid[obs.row][obs.col] = { type: 'obstacle', ...obs };
    }
  }

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

export function getLevelExits(gridSize, rawExits) {
  if (rawExits && (rawExits.top || rawExits.bottom || rawExits.left || rawExits.right)) {
    return {
      top: rawExits.top || [],
      bottom: rawExits.bottom || [],
      left: rawExits.left || [],
      right: rawExits.right || [],
    };
  }
  // Default openings if no exits specified: center half of each perimeter side
  const rows = gridSize.rows;
  const cols = gridSize.cols;
  const top = [];
  const bottom = [];
  const left = [];
  const right = [];
  const startC = Math.max(0, Math.floor(cols / 4));
  const endC = Math.min(cols - 1, Math.ceil((cols * 3) / 4));
  for (let c = startC; c <= endC; c++) {
    top.push(c);
    bottom.push(c);
  }

  const startR = Math.max(0, Math.floor(rows / 4));
  const endR = Math.min(rows - 1, Math.ceil((rows * 3) / 4));
  for (let r = startR; r <= endR; r++) {
    left.push(r);
    right.push(r);
  }

  return { top, bottom, left, right };
}

export function canCarExit(vehicle, grid, gridSize, rawExits) {
  const { rows, cols } = gridSize;
  const { row, col, length, orientation, direction } = vehicle;
  const exits = getLevelExits(gridSize, rawExits);

  if (orientation === 'H') {
    if (direction === 'right') {
      const startC = col + length;
      for (let c = startC; c < cols; c++) {
        if (grid[row][c] !== null) return false;
      }
      return exits.right.includes(row);
    } else if (direction === 'left') {
      for (let c = col - 1; c >= 0; c--) {
        if (grid[row][c] !== null) return false;
      }
      return exits.left.includes(row);
    }
  } else if (orientation === 'V') {
    if (direction === 'down') {
      const startR = row + length;
      for (let r = startR; r < rows; r++) {
        if (grid[r][col] !== null) return false;
      }
      return exits.bottom.includes(col);
    } else if (direction === 'up') {
      for (let r = row - 1; r >= 0; r--) {
        if (grid[r][col] !== null) return false;
      }
      return exits.top.includes(col);
    }
  }
  return false;
}

/**
 * Calculates obstacle, car, or perimeter wall collision distance.
 * Used for animation travel distance before bumper bounce.
 */
export function getCarMoveDistance(vehicle, grid, gridSize, rawExits) {
  const { rows, cols } = gridSize;
  const { row, col, length, orientation, direction } = vehicle;
  const exits = getLevelExits(gridSize, rawExits);

  let clearSteps = 0;
  let blockedBy = null;

  if (orientation === 'H') {
    if (direction === 'right') {
      for (let c = col + length; c < cols; c++) {
        if (grid[row][c] !== null) {
          blockedBy = grid[row][c];
          break;
        }
        clearSteps++;
      }
      if (!blockedBy) {
        if (exits.right.includes(row)) {
          clearSteps += 3; // exit path distance through gate
        } else {
          blockedBy = { type: 'wall', side: 'right' };
        }
      }
    } else if (direction === 'left') {
      for (let c = col - 1; c >= 0; c--) {
        if (grid[row][c] !== null) {
          blockedBy = grid[row][c];
          break;
        }
        clearSteps++;
      }
      if (!blockedBy) {
        if (exits.left.includes(row)) {
          clearSteps += 3;
        } else {
          blockedBy = { type: 'wall', side: 'left' };
        }
      }
    }
  } else if (orientation === 'V') {
    if (direction === 'down') {
      for (let r = row + length; r < rows; r++) {
        if (grid[r][col] !== null) {
          blockedBy = grid[r][col];
          break;
        }
        clearSteps++;
      }
      if (!blockedBy) {
        if (exits.bottom.includes(col)) {
          clearSteps += 3;
        } else {
          blockedBy = { type: 'wall', side: 'bottom' };
        }
      }
    } else if (direction === 'up') {
      for (let r = row - 1; r >= 0; r--) {
        if (grid[r][col] !== null) {
          blockedBy = grid[r][col];
          break;
        }
        clearSteps++;
      }
      if (!blockedBy) {
        if (exits.top.includes(col)) {
          clearSteps += 3;
        } else {
          blockedBy = { type: 'wall', side: 'top' };
        }
      }
    }
  }

  return { clearSteps, canExit: !blockedBy, blockedBy };
}

/**
 * BFS to find next best car to move
 */
export function findNextHint(level, currentExitedIds = new Set()) {
  const { gridSize, vehicles, obstacles = [], exits } = level;
  const totalVehicles = vehicles.length;

  const queue = [{ exitedCarIds: new Set(currentExitedIds), moves: [] }];
  const visited = new Set();

  function stateKey(exitedSet) {
    return Array.from(exitedSet).sort().join(',');
  }

  while (queue.length > 0) {
    const { exitedCarIds, moves } = queue.shift();

    if (exitedCarIds.size === totalVehicles) {
      return moves[0] || null;
    }

    const key = stateKey(exitedCarIds);
    if (visited.has(key)) continue;
    visited.add(key);

    const grid = buildGrid(gridSize, vehicles, obstacles, exitedCarIds);
    for (const v of vehicles) {
      if (!exitedCarIds.has(v.id) && canCarExit(v, grid, gridSize, exits)) {
        const nextSet = new Set(exitedCarIds);
        nextSet.add(v.id);
        queue.push({
          exitedCarIds: nextSet,
          moves: [...moves, v.id],
        });
      }
    }
  }

  // Fallback: check any car that can exit immediately
  const grid = buildGrid(gridSize, vehicles, obstacles, currentExitedIds);
  for (const v of vehicles) {
    if (!currentExitedIds.has(v.id) && canCarExit(v, grid, gridSize, exits)) {
      return v.id;
    }
  }
  return null;
}
