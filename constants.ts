
import { ItemType } from './types';

// Map Dimensions
export const GRID_SIZE = 12;

// Game Settings
export const INITIAL_TIME = 60; // seconds
export const BASE_SPEED_MS = 250; // Milliseconds per move
export const FAST_SPEED_MS = 150;
export const SPAWN_RATE_MS = 2000; // Try to spawn item every 2 seconds

// Scoring
export const POINTS = {
  [ItemType.CRYSTAL_COMMON]: 10,
  [ItemType.CRYSTAL_RARE]: 50,
  [ItemType.POWERUP_SPEED]: 5,
  [ItemType.POWERUP_TIME]: 5,
};

// Colors for rendering
export const COLORS = {
  BACKGROUND_LIGHT: '#63c74d', // Light Grass
  BACKGROUND_DARK: '#3e8948',  // Dark Grass
  GRID_LINES: '#2f6936',
  PLAYER: '#d95763', // Red shirt
  CRYSTAL_COMMON: '#fbf236', // Gold
  CRYSTAL_RARE: '#5fcde4', // Diamond Blue
  POWERUP_SPEED: '#ac3232', // Red Potion
  POWERUP_TIME: '#df7126', // Orange/Sand
};

export const STORAGE_KEY = 'pixel_adventurer_highscore';
