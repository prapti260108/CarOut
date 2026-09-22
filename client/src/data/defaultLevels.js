import levelsData from './levels.json';

export const defaultLevels = levelsData;

export function getDefaultLevel(id = 1) {
  const numId = Number(id);
  const found = defaultLevels.find((lvl) => lvl.id === numId);
  return found || defaultLevels[0];
}

export default defaultLevels;
