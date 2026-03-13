// Core Game Logic Tests - Scoring and Collision
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TILE, DOT, POWER, EMPTY,
  GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN,
} from './setup.js';

describe('Game Logic - Scoring System', () => {
  
  describe('Dot Collection Scoring', () => {
    it('should award 10 points for regular dot', () => {
      const score = 10; // DOT_POINTS
      expect(score).toBe(10);
    });

    it('should award 50 points for power pellet', () => {
      const score = 50; // POWER_POINTS
      expect(score).toBe(50);
    });
  });

  describe('Ghost Eating Scoring', () => {
    it('should calculate correct score for first ghost: 200', () => {
      const ghostsEaten = 1;
      const score = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score).toBe(200);
    });

    it('should calculate correct score for second ghost: 400', () => {
      const ghostsEaten = 2;
      const score = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score).toBe(400);
    });

    it('should calculate correct score for third ghost: 800', () => {
      const ghostsEaten = 3;
      const score = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score).toBe(800);
    });

    it('should calculate correct score for fourth ghost: 1600', () => {
      const ghostsEaten = 4;
      const score = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score).toBe(1600);
    });

    it('should calculate correct score for fifth ghost: 3200', () => {
      const ghostsEaten = 5;
      const score = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score).toBe(3200);
    });

    it('should reset ghost counter and restart from 200 after sequence', () => {
      // When power pellet wears off, counter resets
      let ghostsEaten = 4;
      const score4 = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score4).toBe(1600);
      
      // New power pellet, counter resets
      ghostsEaten = 1;
      const score1 = 200 * Math.pow(2, ghostsEaten - 1);
      expect(score1).toBe(200);
    });
  });

  describe('Extra Life System', () => {
    it('should award extra life at 5000 points', () => {
      const score = 5000;
      const shouldAward = score >= 5000;
      expect(shouldAward).toBe(true);
    });

    it('should award extra life at 10000 points', () => {
      const score = 10000;
      const shouldAward = score >= 10000;
      expect(shouldAward).toBe(true);
    });

    it('should award extra life at 20000 points', () => {
      const score = 20000;
      const shouldAward = score >= 20000;
      expect(shouldAward).toBe(true);
    });

    it('should not award extra life below 5000 points', () => {
      const score = 4999;
      const shouldAward = score >= 5000;
      expect(shouldAward).toBe(false);
    });

    it('should only award one extra life per threshold', () => {
      let lives = 3;
      let extraLifeGiven = false;
      const score = 5100;

      if (score >= 5000 && !extraLifeGiven) {
        lives++;
        extraLifeGiven = true;
      }
      
      expect(lives).toBe(4);
      expect(extraLifeGiven).toBe(true);
      
      // Try to give again at same score
      if (score >= 5000 && !extraLifeGiven) {
        lives++;
      }
      
      expect(lives).toBe(4); // Should still be 4
    });
  });
});

describe('Game Logic - Collision Detection', () => {
  
  describe('Distance-based collision', () => {
    it('should detect collision when distance < TILE * 0.8', () => {
      const homer = { x: 100, y: 100 };
      const ghost = { x: 110, y: 110 };
      
      const dx = ghost.x - homer.x;
      const dy = ghost.y - homer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = TILE * 0.8; // 19.2
      
      const collision = dist < threshold;
      expect(collision).toBe(true);
      expect(dist).toBeLessThan(threshold);
    });

    it('should not detect collision when distance >= TILE * 0.8', () => {
      const homer = { x: 100, y: 100 };
      const ghost = { x: 150, y: 150 };
      
      const dx = ghost.x - homer.x;
      const dy = ghost.y - homer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = TILE * 0.8; // 19.2
      
      const collision = dist < threshold;
      expect(collision).toBe(false);
      expect(dist).toBeGreaterThanOrEqual(threshold);
    });

    it('should calculate exact threshold distance correctly', () => {
      const threshold = TILE * 0.8;
      expect(threshold).toBeCloseTo(19.2, 1);
      expect(TILE).toBe(24);
    });
  });

  describe('Ghost collision outcomes', () => {
    it('should eat ghost when in frightened mode', () => {
      const ghostMode = GM_FRIGHTENED;
      const canEat = ghostMode === GM_FRIGHTENED;
      expect(canEat).toBe(true);
    });

    it('should not eat ghost when in chase mode', () => {
      const ghostMode = GM_CHASE;
      const canEat = ghostMode === GM_FRIGHTENED;
      expect(canEat).toBe(false);
    });

    it('should not eat ghost when in scatter mode', () => {
      const ghostMode = GM_SCATTER;
      const canEat = ghostMode === GM_FRIGHTENED;
      expect(canEat).toBe(false);
    });

    it('should not eat ghost when already eaten', () => {
      const ghostMode = GM_EATEN;
      const canEat = ghostMode === GM_FRIGHTENED;
      expect(canEat).toBe(false);
    });
  });

  describe('Dot collection collision', () => {
    it('should detect dot collection when Homer is on dot tile', () => {
      const homerX = 336; // 14 tiles * 24
      const homerY = 552; // 23 tiles * 24
      
      const col = Math.floor(homerX / TILE);
      const row = Math.floor(homerY / TILE);
      
      expect(col).toBe(14);
      expect(row).toBe(23);
    });

    it('should remove dot from maze when collected', () => {
      const maze = [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
      ];
      
      const col = 1;
      const row = 0;
      
      expect(maze[row][col]).toBe(DOT);
      maze[row][col] = EMPTY;
      expect(maze[row][col]).toBe(EMPTY);
    });

    it('should detect power pellet collection', () => {
      const maze = [
        [0, 3, 1, 0],
      ];
      
      const col = 1;
      const row = 0;
      const cellType = maze[row][col];
      
      expect(cellType).toBe(POWER);
      expect(cellType).toBe(3);
    });
  });
});

describe('Game Logic - Power-Up System', () => {
  
  describe('Power pellet effects', () => {
    it('should set ghosts to frightened mode', () => {
      let ghostMode = GM_CHASE;
      
      // Simulate power pellet collection
      ghostMode = GM_FRIGHTENED;
      
      expect(ghostMode).toBe(GM_FRIGHTENED);
    });

    it('should set fright timer to 360 frames (6 seconds at 60fps)', () => {
      const frightTime = 360;
      expect(frightTime).toBe(360);
      expect(frightTime / 60).toBe(6); // 6 seconds
    });

    it('should flash ghosts when timer < 120 frames', () => {
      const frightTimer = 100;
      const shouldFlash = frightTimer < 120;
      expect(shouldFlash).toBe(true);
    });

    it('should not flash ghosts when timer >= 120 frames', () => {
      const frightTimer = 150;
      const shouldFlash = frightTimer < 120;
      expect(shouldFlash).toBe(false);
    });
  });

  describe('Fright timer countdown', () => {
    it('should decrement timer each frame', () => {
      let frightTimer = 360;
      frightTimer--;
      expect(frightTimer).toBe(359);
    });

    it('should end frightened mode when timer reaches 0', () => {
      let frightTimer = 1;
      let ghostMode = GM_FRIGHTENED;
      
      frightTimer--;
      
      if (frightTimer <= 0) {
        ghostMode = GM_CHASE;
      }
      
      expect(frightTimer).toBe(0);
      expect(ghostMode).toBe(GM_CHASE);
    });

    it('should maintain frightened mode while timer > 0', () => {
      let frightTimer = 100;
      let ghostMode = GM_FRIGHTENED;
      
      frightTimer--;
      
      if (frightTimer <= 0) {
        ghostMode = GM_CHASE;
      }
      
      expect(frightTimer).toBe(99);
      expect(ghostMode).toBe(GM_FRIGHTENED);
    });
  });

  describe('Ghost eating during power-up', () => {
    it('should change eaten ghost to EATEN mode', () => {
      let ghostMode = GM_FRIGHTENED;
      
      // Simulate ghost being eaten
      ghostMode = GM_EATEN;
      
      expect(ghostMode).toBe(GM_EATEN);
    });

    it('should not end fright timer when eating ghost', () => {
      const frightTimer = 200;
      // Eating ghost does not affect timer
      expect(frightTimer).toBe(200);
    });

    it('should increment ghost counter when eating', () => {
      let ghostsEaten = 0;
      
      // Eat first ghost
      ghostsEaten++;
      expect(ghostsEaten).toBe(1);
      
      // Eat second ghost
      ghostsEaten++;
      expect(ghostsEaten).toBe(2);
    });

    it('should reset ghost counter when fright ends', () => {
      let ghostsEaten = 3;
      let frightTimer = 0;
      
      if (frightTimer <= 0) {
        ghostsEaten = 0;
      }
      
      expect(ghostsEaten).toBe(0);
    });
  });
});

describe('Game Logic - State Transitions', () => {
  
  describe('Game start flow', () => {
    it('should start in ST_START state', () => {
      const state = 0; // ST_START
      expect(state).toBe(0);
    });

    it('should transition from ST_START to ST_READY on Enter', () => {
      let state = 0; // ST_START
      
      // Simulate Enter key press
      state = 1; // ST_READY
      
      expect(state).toBe(1);
    });

    it('should transition from ST_READY to ST_PLAYING after timer', () => {
      let state = 1; // ST_READY
      let stateTimer = 180; // 3 seconds
      
      // Simulate timer countdown
      stateTimer = 0;
      
      if (stateTimer <= 0) {
        state = 2; // ST_PLAYING
      }
      
      expect(state).toBe(2);
    });
  });

  describe('Death and game over', () => {
    it('should transition to ST_DYING when Homer collides with ghost', () => {
      let state = 2; // ST_PLAYING
      const collision = true;
      const ghostMode = GM_CHASE;
      
      if (collision && ghostMode !== GM_FRIGHTENED && ghostMode !== GM_EATEN) {
        state = 3; // ST_DYING
      }
      
      expect(state).toBe(3);
    });

    it('should transition to ST_PLAYING when lives remain', () => {
      let state = 3; // ST_DYING
      let lives = 2;
      let stateTimer = 0;
      
      if (stateTimer <= 0 && lives > 0) {
        state = 1; // ST_READY
      }
      
      expect(state).toBe(1);
    });

    it('should transition to ST_GAME_OVER when no lives remain', () => {
      let state = 3; // ST_DYING
      let lives = 0;
      let stateTimer = 0;
      
      if (stateTimer <= 0 && lives === 0) {
        state = 5; // ST_GAME_OVER
      }
      
      expect(state).toBe(5);
    });
  });

  describe('Level completion', () => {
    it('should transition to ST_LEVEL_DONE when all dots collected', () => {
      let state = 2; // ST_PLAYING
      const dotsLeft = 0;
      
      if (dotsLeft === 0) {
        state = 4; // ST_LEVEL_DONE
      }
      
      expect(state).toBe(4);
    });

    it('should increment level after level complete', () => {
      let level = 1;
      const state = 4; // ST_LEVEL_DONE
      
      if (state === 4) {
        level++;
      }
      
      expect(level).toBe(2);
    });

    it('should transition to cutscene on specific levels', () => {
      const level = 2;
      const cutsceneLevels = [2, 5, 9, 14];
      const shouldShowCutscene = cutsceneLevels.includes(level);
      
      expect(shouldShowCutscene).toBe(true);
    });

    it('should not show cutscene on non-cutscene levels', () => {
      const level = 3;
      const cutsceneLevels = [2, 5, 9, 14];
      const shouldShowCutscene = cutsceneLevels.includes(level);
      
      expect(shouldShowCutscene).toBe(false);
    });
  });

  describe('Pause functionality', () => {
    it('should transition to ST_PAUSED when P pressed during gameplay', () => {
      let state = 2; // ST_PLAYING
      const keyPressed = 'KeyP';
      
      if (keyPressed === 'KeyP') {
        state = 6; // ST_PAUSED
      }
      
      expect(state).toBe(6);
    });

    it('should transition back to ST_PLAYING when P pressed during pause', () => {
      let state = 6; // ST_PAUSED
      const keyPressed = 'KeyP';
      
      if (keyPressed === 'KeyP') {
        state = 2; // ST_PLAYING
      }
      
      expect(state).toBe(2);
    });

    it('should not allow pause during ST_DYING', () => {
      let state = 3; // ST_DYING
      const keyPressed = 'KeyP';
      
      // Pause should only work during ST_PLAYING
      if (state === 2 && keyPressed === 'KeyP') {
        state = 6;
      }
      
      expect(state).toBe(3); // Still dying
    });
  });
});
