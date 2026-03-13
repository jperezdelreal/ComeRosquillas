// Test setup file - defines game constants for testing
// These constants are copied from js/config.js to make them available in tests

// ==================== GRID & CANVAS ====================
export const TILE = 24;
export const COLS = 28;
export const ROWS = 31;
export const CANVAS_W = COLS * TILE;
export const CANVAS_H = ROWS * TILE;

// ==================== CELL TYPES ====================
export const WALL = 0;
export const DOT = 1;
export const EMPTY = 2;
export const POWER = 3;
export const GHOST_HOUSE = 4;
export const GHOST_DOOR = 5;

// ==================== DIRECTIONS ====================
export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];
export const OPP = [DOWN, LEFT, UP, RIGHT];

// ==================== GAME STATES ====================
export const ST_START = 0;
export const ST_READY = 1;
export const ST_PLAYING = 2;
export const ST_DYING = 3;
export const ST_LEVEL_DONE = 4;
export const ST_GAME_OVER = 5;
export const ST_PAUSED = 6;
export const ST_CUTSCENE = 7;
export const ST_HIGH_SCORE_ENTRY = 8;

// ==================== GHOST MODES ====================
export const GM_SCATTER = 0;
export const GM_CHASE = 1;
export const GM_FRIGHTENED = 2;
export const GM_EATEN = 3;

// ==================== ENTITY START POSITIONS ====================
export const HOMER_START = { x: 14, y: 23 };

export const GHOST_CFG = [
    { name: 'Sr. Burns',   color: '#ffd800', skinColor: '#f5e6a0', startX: 14, startY: 11, scatterX: 25, scatterY: 0,  homeX: 14, homeY: 14, exitDelay: 0 },
    { name: 'Bob Patiño',  color: '#ff4444', skinColor: '#f5d0a0', startX: 12, startY: 14, scatterX: 2,  scatterY: 0,  homeX: 12, homeY: 14, exitDelay: 50 },
    { name: 'Nelson',      color: '#ff8c00', skinColor: '#ffd800', startX: 14, startY: 14, scatterX: 27, scatterY: 30, homeX: 14, homeY: 14, exitDelay: 100 },
    { name: 'Snake',       color: '#44bb44', skinColor: '#f5d0a0', startX: 16, startY: 14, scatterX: 0,  scatterY: 30, homeX: 16, homeY: 14, exitDelay: 150 }
];

// ==================== TIMING ====================
export const MODE_TIMERS = [180, 1200, 300, 1200, 300, 1200, 300, -1];
export const FRIGHT_TIME = 360;
export const FRIGHT_FLASH_TIME = 120;
export const BASE_SPEED = 1.8;

// ==================== MAZE LAYOUTS ====================
const MAZE_TEMPLATE = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,3,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,3,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,2,0,0,0,5,5,0,0,0,2,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,2,0,4,4,4,4,4,4,0,2,2,2,1,0,0,0,0,0,0],
    [2,2,2,2,2,2,1,0,0,2,0,4,4,4,4,4,4,0,2,0,0,1,2,2,2,2,2,2],
    [0,0,0,0,0,0,1,0,0,2,0,4,4,4,4,4,4,0,2,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,2,2,2,2,2,2,2,2,2,2,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,3,1,1,0,0,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,0,0,1,1,3,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const MAZE_LAYOUTS = [
    {
        name: 'Springfield',
        template: MAZE_TEMPLATE,
        wallColors: { main: '#2244aa', dark: '#1a3388', light: '#3366cc', border: '#5577ee' }
    },
    {
        name: 'Planta Nuclear',
        template: MAZE_TEMPLATE, // Simplified for tests
        wallColors: { main: '#2d6b2d', dark: '#1a4a1a', light: '#3d8b3d', border: '#55cc55' }
    },
    {
        name: 'Kwik-E-Mart',
        template: MAZE_TEMPLATE, // Simplified for tests
        wallColors: { main: '#8b2252', dark: '#6b1a42', light: '#ab3272', border: '#dd4488' }
    },
    {
        name: "Moe's Tavern",
        template: MAZE_TEMPLATE, // Simplified for tests
        wallColors: { main: '#7a5c2e', dark: '#5a3c1e', light: '#9a7c4e', border: '#cc9944' }
    }
];

export function getMazeLayout(level) {
    const idx = Math.floor((level - 1) / 2) % MAZE_LAYOUTS.length;
    return MAZE_LAYOUTS[idx];
}
