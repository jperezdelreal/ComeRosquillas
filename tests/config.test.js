// Configuration and Constants Tests
import { describe, it, expect } from 'vitest';
import {
  TILE, COLS, ROWS, CANVAS_W, CANVAS_H,
  WALL, DOT, EMPTY, POWER, GHOST_HOUSE, GHOST_DOOR,
  UP, RIGHT, DOWN, LEFT, DX, DY, OPP,
  ST_START, ST_READY, ST_PLAYING, ST_DYING, ST_LEVEL_DONE, ST_GAME_OVER, ST_PAUSED,
  GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN,
  HOMER_START, GHOST_CFG,
  MODE_TIMERS, FRIGHT_TIME, BASE_SPEED,
  getMazeLayout,
} from './setup.js';

describe('Configuration - Grid and Canvas', () => {
  it('should have correct tile size', () => {
    expect(TILE).toBe(24);
  });

  it('should have correct grid dimensions', () => {
    expect(COLS).toBe(28);
    expect(ROWS).toBe(31);
  });

  it('should calculate canvas dimensions correctly', () => {
    expect(CANVAS_W).toBe(COLS * TILE);
    expect(CANVAS_H).toBe(ROWS * TILE);
    expect(CANVAS_W).toBe(672);
    expect(CANVAS_H).toBe(744);
  });
});

describe('Configuration - Cell Types', () => {
  it('should define cell types correctly', () => {
    expect(WALL).toBe(0);
    expect(DOT).toBe(1);
    expect(EMPTY).toBe(2);
    expect(POWER).toBe(3);
    expect(GHOST_HOUSE).toBe(4);
    expect(GHOST_DOOR).toBe(5);
  });

  it('should have unique cell type values', () => {
    const types = [WALL, DOT, EMPTY, POWER, GHOST_HOUSE, GHOST_DOOR];
    const uniqueTypes = new Set(types);
    expect(uniqueTypes.size).toBe(types.length);
  });
});

describe('Configuration - Directions', () => {
  it('should define directions correctly', () => {
    expect(UP).toBe(0);
    expect(RIGHT).toBe(1);
    expect(DOWN).toBe(2);
    expect(LEFT).toBe(3);
  });

  it('should have correct direction deltas', () => {
    expect(DX).toEqual([0, 1, 0, -1]);
    expect(DY).toEqual([-1, 0, 1, 0]);
  });

  it('should map directions to correct X deltas', () => {
    expect(DX[UP]).toBe(0);
    expect(DX[RIGHT]).toBe(1);
    expect(DX[DOWN]).toBe(0);
    expect(DX[LEFT]).toBe(-1);
  });

  it('should map directions to correct Y deltas', () => {
    expect(DY[UP]).toBe(-1);
    expect(DY[RIGHT]).toBe(0);
    expect(DY[DOWN]).toBe(1);
    expect(DY[LEFT]).toBe(0);
  });

  it('should have correct opposite directions', () => {
    expect(OPP).toEqual([DOWN, LEFT, UP, RIGHT]);
    expect(OPP[UP]).toBe(DOWN);
    expect(OPP[RIGHT]).toBe(LEFT);
    expect(OPP[DOWN]).toBe(UP);
    expect(OPP[LEFT]).toBe(RIGHT);
  });
});

describe('Configuration - Game States', () => {
  it('should define all game states', () => {
    expect(ST_START).toBe(0);
    expect(ST_READY).toBe(1);
    expect(ST_PLAYING).toBe(2);
    expect(ST_DYING).toBe(3);
    expect(ST_LEVEL_DONE).toBe(4);
    expect(ST_GAME_OVER).toBe(5);
    expect(ST_PAUSED).toBe(6);
  });

  it('should have unique state values', () => {
    const states = [ST_START, ST_READY, ST_PLAYING, ST_DYING, ST_LEVEL_DONE, ST_GAME_OVER, ST_PAUSED];
    const uniqueStates = new Set(states);
    expect(uniqueStates.size).toBe(states.length);
  });
});

describe('Configuration - Ghost Modes', () => {
  it('should define ghost modes correctly', () => {
    expect(GM_SCATTER).toBe(0);
    expect(GM_CHASE).toBe(1);
    expect(GM_FRIGHTENED).toBe(2);
    expect(GM_EATEN).toBe(3);
  });

  it('should have unique mode values', () => {
    const modes = [GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN];
    const uniqueModes = new Set(modes);
    expect(uniqueModes.size).toBe(modes.length);
  });
});

describe('Configuration - Entity Positions', () => {
  it('should have Homer start position defined', () => {
    expect(HOMER_START).toBeDefined();
    expect(HOMER_START.x).toBe(14);
    expect(HOMER_START.y).toBe(23);
  });

  it('should have all ghost configurations defined', () => {
    expect(GHOST_CFG).toBeDefined();
    expect(GHOST_CFG).toHaveLength(4);
  });

  it('should have correct ghost names', () => {
    expect(GHOST_CFG[0].name).toBe('Sr. Burns');
    expect(GHOST_CFG[1].name).toBe('Bob Patiño');
    expect(GHOST_CFG[2].name).toBe('Nelson');
    expect(GHOST_CFG[3].name).toBe('Snake');
  });

  it('should have unique ghost colors', () => {
    const colors = GHOST_CFG.map(g => g.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });

  it('should have valid ghost exit delays', () => {
    expect(GHOST_CFG[0].exitDelay).toBe(0);
    expect(GHOST_CFG[1].exitDelay).toBe(50);
    expect(GHOST_CFG[2].exitDelay).toBe(100);
    expect(GHOST_CFG[3].exitDelay).toBe(150);
  });

  it('should have increasing exit delays', () => {
    for (let i = 1; i < GHOST_CFG.length; i++) {
      expect(GHOST_CFG[i].exitDelay).toBeGreaterThan(GHOST_CFG[i-1].exitDelay);
    }
  });
});

describe('Configuration - Timing', () => {
  it('should have mode timers defined', () => {
    expect(MODE_TIMERS).toBeDefined();
    expect(MODE_TIMERS).toHaveLength(8);
  });

  it('should have correct mode timer values', () => {
    expect(MODE_TIMERS).toEqual([180, 1200, 300, 1200, 300, 1200, 300, -1]);
  });

  it('should have last mode timer as infinite (-1)', () => {
    expect(MODE_TIMERS[MODE_TIMERS.length - 1]).toBe(-1);
  });

  it('should have fright time of 360 frames (6 seconds)', () => {
    expect(FRIGHT_TIME).toBe(360);
    expect(FRIGHT_TIME / 60).toBe(6);
  });

  it('should have base speed defined', () => {
    expect(BASE_SPEED).toBe(1.8);
  });
});

describe('Configuration - Maze Layouts', () => {
  it('should return first layout for level 1', () => {
    const layout = getMazeLayout(1);
    expect(layout).toBeDefined();
    expect(layout.name).toBe('Springfield');
  });

  it('should return first layout for level 2', () => {
    const layout = getMazeLayout(2);
    expect(layout.name).toBe('Springfield');
  });

  it('should return second layout for level 3', () => {
    const layout = getMazeLayout(3);
    expect(layout.name).toBe('Planta Nuclear');
  });

  it('should return second layout for level 4', () => {
    const layout = getMazeLayout(4);
    expect(layout.name).toBe('Planta Nuclear');
  });

  it('should return third layout for level 5', () => {
    const layout = getMazeLayout(5);
    expect(layout.name).toBe('Kwik-E-Mart');
  });

  it('should return fourth layout for level 7', () => {
    const layout = getMazeLayout(7);
    expect(layout.name).toBe("Moe's Tavern");
  });

  it('should cycle back to first layout after all layouts', () => {
    const layout = getMazeLayout(9);
    expect(layout.name).toBe('Springfield');
  });

  it('should have wall colors defined for each layout', () => {
    const layout = getMazeLayout(1);
    expect(layout.wallColors).toBeDefined();
    expect(layout.wallColors.main).toBeDefined();
    expect(layout.wallColors.dark).toBeDefined();
    expect(layout.wallColors.light).toBeDefined();
    expect(layout.wallColors.border).toBeDefined();
  });

  it('should have correct maze template dimensions', () => {
    const layout = getMazeLayout(1);
    expect(layout.template).toBeDefined();
    expect(layout.template.length).toBe(ROWS);
    expect(layout.template[0].length).toBe(COLS);
  });
});

describe('Utility Functions - Direction Logic', () => {
  it('should calculate correct movement for UP direction', () => {
    const dir = UP;
    const x = 100, y = 100;
    const newX = x + DX[dir] * BASE_SPEED;
    const newY = y + DY[dir] * BASE_SPEED;
    
    expect(newX).toBe(100);
    expect(newY).toBe(100 - BASE_SPEED);
  });

  it('should calculate correct movement for RIGHT direction', () => {
    const dir = RIGHT;
    const x = 100, y = 100;
    const newX = x + DX[dir] * BASE_SPEED;
    const newY = y + DY[dir] * BASE_SPEED;
    
    expect(newX).toBe(100 + BASE_SPEED);
    expect(newY).toBe(100);
  });

  it('should calculate correct movement for DOWN direction', () => {
    const dir = DOWN;
    const x = 100, y = 100;
    const newX = x + DX[dir] * BASE_SPEED;
    const newY = y + DY[dir] * BASE_SPEED;
    
    expect(newX).toBe(100);
    expect(newY).toBe(100 + BASE_SPEED);
  });

  it('should calculate correct movement for LEFT direction', () => {
    const dir = LEFT;
    const x = 100, y = 100;
    const newX = x + DX[dir] * BASE_SPEED;
    const newY = y + DY[dir] * BASE_SPEED;
    
    expect(newX).toBe(100 - BASE_SPEED);
    expect(newY).toBe(100);
  });
});

describe('Utility Functions - Coordinate Conversion', () => {
  it('should convert pixel to tile coordinates correctly', () => {
    const px = 336; // 14 * 24
    const py = 552; // 23 * 24
    
    const col = Math.floor(px / TILE);
    const row = Math.floor(py / TILE);
    
    expect(col).toBe(14);
    expect(row).toBe(23);
  });

  it('should handle fractional pixel coordinates', () => {
    const px = 340; // Between tiles 14 and 15
    const py = 555;
    
    const col = Math.floor(px / TILE);
    const row = Math.floor(py / TILE);
    
    expect(col).toBe(14);
    expect(row).toBe(23);
  });

  it('should convert tile to pixel coordinates correctly', () => {
    const col = 14;
    const row = 23;
    
    const px = col * TILE;
    const py = row * TILE;
    
    expect(px).toBe(336);
    expect(py).toBe(552);
  });
});

describe('Edge Cases', () => {
  it('should handle level wrapping correctly', () => {
    // Test that levels cycle through layouts
    for (let level = 1; level <= 20; level++) {
      const layout = getMazeLayout(level);
      expect(layout).toBeDefined();
      expect(layout.name).toBeDefined();
      expect(layout.template).toBeDefined();
    }
  });

  it('should handle boundary positions', () => {
    const minX = 0;
    const maxX = CANVAS_W;
    const minY = 0;
    const maxY = CANVAS_H;
    
    expect(minX).toBe(0);
    expect(maxX).toBe(672);
    expect(minY).toBe(0);
    expect(maxY).toBe(744);
  });

  it('should handle opposite direction double conversion', () => {
    // Converting a direction to opposite and back should return original
    const original = UP;
    const opposite = OPP[original];
    const backToOriginal = OPP[opposite];
    
    expect(backToOriginal).toBe(original);
  });
});
