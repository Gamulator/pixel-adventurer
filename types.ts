
export type Position = {
  x: number;
  y: number;
};

export enum ItemType {
  CRYSTAL_COMMON = 'CRYSTAL_COMMON',
  CRYSTAL_RARE = 'CRYSTAL_RARE',
  POWERUP_SPEED = 'POWERUP_SPEED',
  POWERUP_TIME = 'POWERUP_TIME',
}

export interface GameItem {
  id: string;
  position: Position;
  type: ItemType;
  expiresAt?: number; // timestamp
}

export enum ObstacleType {
  ROCK = 'ROCK',
  LAKE = 'LAKE',
}

export interface Obstacle {
  id: string;
  position: Position;
  type: ObstacleType;
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_TRANSITION = 'LEVEL_TRANSITION',
  GAME_OVER = 'GAME_OVER',
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;

export interface HighScore {
  score: number;
  date: string;
}
