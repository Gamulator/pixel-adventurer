
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Position, GameItem, ItemType, Direction, Obstacle, ObstacleType } from '../types';
import { GRID_SIZE, INITIAL_TIME, BASE_SPEED_MS, FAST_SPEED_MS, SPAWN_RATE_MS, POINTS, STORAGE_KEY } from '../constants';
import { soundManager } from '../audio';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

const CENTER_POS = Math.floor(GRID_SIZE / 2);

export const useGameLogic = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [playerPos, setPlayerPos] = useState<Position>({ x: CENTER_POS, y: CENTER_POS });
  const [items, setItems] = useState<GameItem[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [highScore, setHighScore] = useState<number>(0);
  const [isSpeedBoosted, setIsSpeedBoosted] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuteStatus());
  
  // Leveling State
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(100);

  // Animation states
  const [facing, setFacing] = useState<Direction>('DOWN');
  const [walkFrame, setWalkFrame] = useState(false);

  // Mutable refs for game loop to avoid closure staleness without re-renders
  const directionRef = useRef<Direction>(null);
  const playerPosRef = useRef<Position>({ x: CENTER_POS, y: CENTER_POS });
  const itemsRef = useRef<GameItem[]>([]); 
  const obstaclesRef = useRef<Obstacle[]>([]);
  const lastMoveTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const speedRef = useRef<number>(BASE_SPEED_MS);
  const gameLoopRef = useRef<number | null>(null);
  const speedBoostTimeoutRef = useRef<number | null>(null);
  const pauseStartTimeRef = useRef<number>(0);
  const levelRef = useRef<number>(1);
  const targetScoreRef = useRef<number>(100);

  // Sync state to refs
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  
  useEffect(() => {
    levelRef.current = level;
    targetScoreRef.current = targetScore;
  }, [level, targetScore]);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const toggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const togglePause = useCallback(() => {
    setStatus(prev => {
      if (prev === GameStatus.PLAYING) {
        pauseStartTimeRef.current = performance.now();
        soundManager.resume(); 
        return GameStatus.PAUSED;
      } else if (prev === GameStatus.PAUSED) {
        // Correct time drift so player doesn't instantly jump/spawn upon resume
        const now = performance.now();
        const pausedDuration = now - pauseStartTimeRef.current;
        lastMoveTimeRef.current += pausedDuration;
        lastSpawnTimeRef.current += pausedDuration;
        soundManager.resume();
        return GameStatus.PLAYING;
      }
      return prev;
    });
  }, []);

  const generateObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    const occupied = new Set<string>();
    
    // Reserve center for player
    occupied.add(`${CENTER_POS},${CENTER_POS}`);

    // Determine obstacle count based on level
    const currentLevel = levelRef.current;
    let minObs = 5;
    let maxObs = 10;

    if (currentLevel === 1) {
      minObs = 5; maxObs = 10;
    } else if (currentLevel === 2) {
      minObs = 10; maxObs = 15;
    } else if (currentLevel === 3) {
      minObs = 15; maxObs = 20;
    } else if (currentLevel === 4) {
      minObs = 20; maxObs = 25;
    } else {
      // Level 5+
      minObs = 30; maxObs = 30;
    }

    const count = Math.floor(Math.random() * (maxObs - minObs + 1)) + minObs;

    while (newObstacles.length < count) {
      const pos = getRandomPosition();
      const key = `${pos.x},${pos.y}`;
      
      if (!occupied.has(key)) {
        occupied.add(key);
        newObstacles.push({
          id: generateId(),
          position: pos,
          type: Math.random() > 0.6 ? ObstacleType.ROCK : ObstacleType.LAKE
        });
      }
    }
    setObstacles(newObstacles);
    obstaclesRef.current = newObstacles; // Update ref immediately for sequential logic
  }, []);

  const spawnItem = useCallback((count: number = 1) => {
    const newItems: GameItem[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type = ItemType.CRYSTAL_COMMON;
      
      if (rand > 0.95) type = ItemType.CRYSTAL_RARE;
      else if (rand > 0.90) type = ItemType.POWERUP_SPEED;
      else if (rand > 0.85) type = ItemType.POWERUP_TIME;

      // Prevent spawning on player or obstacles
      let pos = getRandomPosition();
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 50) {
        valid = true;
        // Check player
        if (pos.x === playerPosRef.current.x && pos.y === playerPosRef.current.y) valid = false;
        
        // Check obstacles
        if (obstaclesRef.current.some(o => o.position.x === pos.x && o.position.y === pos.y)) valid = false;
        
        // Check existing items
        if (itemsRef.current.some(i => i.position.x === pos.x && i.position.y === pos.y)) valid = false;

        // Check items currently being created in this batch
        if (newItems.some(i => i.position.x === pos.x && i.position.y === pos.y)) valid = false;

        if (!valid) {
          pos = getRandomPosition();
          attempts++;
        }
      }

      if (valid) {
        newItems.push({
          id: generateId(),
          position: pos,
          type,
          expiresAt: Date.now() + 10000 + Math.random() * 5000
        });
      }
    }
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const gameOver = useCallback(() => {
    setStatus(GameStatus.GAME_OVER);
    soundManager.playGameOver();
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
  }, []);

  const advanceLevel = useCallback(() => {
      soundManager.playLevelUp();
      const nextLevel = levelRef.current + 1;
      const pointsNeededForNext = nextLevel * 100; // e.g., Level 2 needs 200 more points
      const nextTarget = targetScoreRef.current + pointsNeededForNext;
      
      setStatus(GameStatus.LEVEL_TRANSITION);
      setLevel(nextLevel);
      setTargetScore(nextTarget);

      // Transition Delay
      setTimeout(() => {
         // Reset for next level
         setTimeLeft(INITIAL_TIME);
         generateObstacles();
         setItems([]);
         itemsRef.current = []; // Clear ref immediately so spawnItem sees empty board
         setPlayerPos({ x: CENTER_POS, y: CENTER_POS });
         playerPosRef.current = { x: CENTER_POS, y: CENTER_POS };
         
         // Update Logic Refs
         lastMoveTimeRef.current = performance.now();
         lastSpawnTimeRef.current = performance.now();
         
         spawnItem(3);
         setStatus(GameStatus.PLAYING);
      }, 3000);
  }, [generateObstacles, spawnItem]);

  // Update Game Logic
  const updatePosition = useCallback((timestamp: number) => {
    if (status !== GameStatus.PLAYING) return;

    // Spawning Logic
    if (timestamp - lastSpawnTimeRef.current > SPAWN_RATE_MS) {
      spawnItem(1);
      lastSpawnTimeRef.current = timestamp;
    }

    // Movement Logic
    if (timestamp - lastMoveTimeRef.current > speedRef.current) {
      if (directionRef.current) {
        let { x, y } = playerPosRef.current;
        let targetX = x;
        let targetY = y;
        
        // Calculate Target
        switch (directionRef.current) {
          case 'UP': targetY = (y - 1 + GRID_SIZE) % GRID_SIZE; break;
          case 'DOWN': targetY = (y + 1) % GRID_SIZE; break;
          case 'LEFT': targetX = (x - 1 + GRID_SIZE) % GRID_SIZE; break;
          case 'RIGHT': targetX = (x + 1) % GRID_SIZE; break;
        }

        setFacing(directionRef.current);

        // Check Obstacle Collision
        const hitObstacle = obstaclesRef.current.find(o => o.position.x === targetX && o.position.y === targetY);
        
        if (!hitObstacle) {
          // Move allowed
          playerPosRef.current = { x: targetX, y: targetY };
          setPlayerPos({ x: targetX, y: targetY });
          setWalkFrame(prev => !prev); // Toggle walk frame
          soundManager.playMove();

          // Check Item Collision
          const currentItems = itemsRef.current;
          const collidedItem = currentItems.find(i => i.position.x === targetX && i.position.y === targetY);

          if (collidedItem) {
            // Play Sound
            if (collidedItem.type === ItemType.POWERUP_SPEED || collidedItem.type === ItemType.POWERUP_TIME) {
              soundManager.playPowerup();
            } else {
              soundManager.playCollect(collidedItem.type === ItemType.CRYSTAL_RARE);
            }

            // Apply Effects
            let newScore = score;
            setScore(s => {
                newScore = s + POINTS[collidedItem.type];
                return newScore;
            });
            
            if (collidedItem.type === ItemType.POWERUP_TIME) {
               setTimeLeft(t => t + 5);
            } else if (collidedItem.type === ItemType.POWERUP_SPEED) {
               setIsSpeedBoosted(true);
               speedRef.current = FAST_SPEED_MS;
               // Clear existing timeout if any
               if (speedBoostTimeoutRef.current) clearTimeout(speedBoostTimeoutRef.current);
               speedBoostTimeoutRef.current = window.setTimeout(() => {
                 setIsSpeedBoosted(false);
                 speedRef.current = BASE_SPEED_MS;
               }, 5000);
            }

            // Remove item
            setItems(prev => prev.filter(i => i.id !== collidedItem.id));

            // Check Level Progression
            if (newScore >= targetScoreRef.current) {
                advanceLevel();
                return; // Stop update loop for this frame since we are transitioning
            }

            // Ensure at least one item exists (current items - the one we just removed)
            if (currentItems.length - 1 <= 0) {
                 spawnItem(1);
            }
          }
        } else {
          // Hit obstacle
        }
      }
      lastMoveTimeRef.current = timestamp;
    }

    gameLoopRef.current = requestAnimationFrame(updatePosition);
  }, [status, spawnItem, score, advanceLevel]);

  // Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrows and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Handle Pause Toggle
      if (e.key === ' ' && (status === GameStatus.PLAYING || status === GameStatus.PAUSED)) {
        togglePause();
        return;
      }

      if (status === GameStatus.PLAYING) {
        switch (e.key) {
          case 'ArrowUp': directionRef.current = 'UP'; break;
          case 'ArrowDown': directionRef.current = 'DOWN'; break;
          case 'ArrowLeft': directionRef.current = 'LEFT'; break;
          case 'ArrowRight': directionRef.current = 'RIGHT'; break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, togglePause]);

  // Timer
  useEffect(() => {
    let timer: number;
    if (status === GameStatus.PLAYING) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0; // Will trigger effect below
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Check Game Over State
  useEffect(() => {
    if (timeLeft === 0 && status === GameStatus.PLAYING) {
      gameOver();
      // Update high score safely
      setHighScore(prev => {
        const final = Math.max(prev, score);
        localStorage.setItem(STORAGE_KEY, final.toString());
        return final;
      });
    }
  }, [timeLeft, status, gameOver, score]);

  // Start Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      gameLoopRef.current = requestAnimationFrame(updatePosition);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [status, updatePosition]);

  const startGame = useCallback(() => {
    soundManager.resume();
    setScore(0);
    setHighScore(prev => {
       // Just ensuring it's loaded, logic handled in effects usually but good to keep synced
       return prev; 
    });
    
    // Level 1 Setup
    setLevel(1);
    setTargetScore(100);
    setStatus(GameStatus.LEVEL_TRANSITION);
    soundManager.playLevelUp(); // Optional: sound for game start/level 1

    // Transition Logic for Level 1
    setTimeout(() => {
        generateObstacles();
        setTimeLeft(INITIAL_TIME);
        setItems([]);
        itemsRef.current = []; // Clear ref immediately
        setPlayerPos({ x: CENTER_POS, y: CENTER_POS });
        setIsSpeedBoosted(false);
        
        playerPosRef.current = { x: CENTER_POS, y: CENTER_POS };
        directionRef.current = null;
        setFacing('DOWN'); 
        speedRef.current = BASE_SPEED_MS;
        
        lastMoveTimeRef.current = performance.now();
        lastSpawnTimeRef.current = performance.now();
        
        spawnItem(3); 
        setStatus(GameStatus.PLAYING);
    }, 3000);

  }, [spawnItem, generateObstacles]);

  return {
    status,
    playerPos,
    items,
    obstacles,
    score,
    timeLeft,
    highScore,
    isSpeedBoosted,
    startGame,
    isMuted,
    toggleMute,
    facing,
    walkFrame,
    togglePause,
    level,
    targetScore
  };
};
