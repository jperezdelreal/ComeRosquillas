// ===========================
// Come Rosquillas - Configuration & Constants
// ===========================

'use strict';

// ==================== GRID & CANVAS ====================
const TILE = 24;
const COLS = 28;
const ROWS = 31;
const CANVAS_W = COLS * TILE;
const CANVAS_H = ROWS * TILE;

// ==================== CELL TYPES ====================
const WALL = 0, DOT = 1, EMPTY = 2, POWER = 3, GHOST_HOUSE = 4, GHOST_DOOR = 5;

// ==================== DIRECTIONS ====================
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
const OPP = [DOWN, LEFT, UP, RIGHT];

// ==================== GAME STATES ====================
const ST_START = 0, ST_READY = 1, ST_PLAYING = 2, ST_DYING = 3,
    ST_LEVEL_DONE = 4, ST_GAME_OVER = 5, ST_PAUSED = 6, ST_CUTSCENE = 7, ST_HIGH_SCORE_ENTRY = 8;

// ==================== GHOST MODES ====================
const GM_SCATTER = 0, GM_CHASE = 1, GM_FRIGHTENED = 2, GM_EATEN = 3;

// ==================== SIMPSONS QUOTES ====================
const HOMER_DEATH_QUOTES = ["D'OH!", "¡D'OH!", "Why you little...!", "Mmm... floor."];
const HOMER_POWER_QUOTES = ["Mmm... Duff!", "Woohoo!", "¡Cerveza!", "In pizza we trust!"];
const HOMER_WIN_QUOTES = ["Woohoo!", "¡Ño ño ño!", "Donuts... is there anything they can't do?"];
const GAME_OVER_QUOTES = [
    "To alcohol! The cause of, and solution to, all of life's problems.",
    "Trying is the first step toward failure.",
    "Kids, you tried your best and you failed miserably.",
    "Mmm... game over."
];
const GHOST_NAMES = ['Sr. Burns', 'Bob Patiño', 'Nelson', 'Snake'];

// ==================== GHOST HOUSE AREA (rows 9-19, shared by all mazes) ====================
const _GHOST_AREA = [
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
];

// ==================== MAZE TEMPLATES ====================
// Level 1-2: Springfield (classic layout)
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

// Level 3-4: Nuclear Plant — Open corridors, wider passages, fewer chokepoints
const MAZE_NUCLEAR_PLANT = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,3,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,3,0],
    [0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0],
    [0,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0],
    [0,1,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,1,1,1,1,0],
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
    [0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,0,0,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,0,0,1,1,1,0],
    [0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,3,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,3,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Level 5-6: Kwik-E-Mart — Grid-like layout, small rooms, more chokepoints
const MAZE_KWIK_E_MART = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0],
    [0,3,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,3,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,0],
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
    [0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0],
    [0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0],
    [0,1,1,1,1,0,0,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0,0,1,1,1,1,0],
    [0,3,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,3,0],
    [0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Level 7-8: Moe's Tavern — Winding corridors, asymmetric, strategic escape routes
const MAZE_MOES_TAVERN = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0],
    [0,3,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,3,0],
    [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,0],
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
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,0,0,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,0,0,1,1,1,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0],
    [0,1,1,1,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,1,1,0],
    [0,3,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,3,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// ==================== MAZE LAYOUT DEFINITIONS ====================
const MAZE_LAYOUTS = [
    {
        name: 'Springfield',
        template: MAZE_TEMPLATE,
        wallColors: { main: '#2244aa', dark: '#1a3388', light: '#3366cc', border: '#5577ee' }
    },
    {
        name: 'Planta Nuclear',
        template: MAZE_NUCLEAR_PLANT,
        wallColors: { main: '#2d6b2d', dark: '#1a4a1a', light: '#3d8b3d', border: '#55cc55' }
    },
    {
        name: 'Kwik-E-Mart',
        template: MAZE_KWIK_E_MART,
        wallColors: { main: '#8b2252', dark: '#6b1a42', light: '#ab3272', border: '#dd4488' }
    },
    {
        name: "Moe's Tavern",
        template: MAZE_MOES_TAVERN,
        wallColors: { main: '#7a5c2e', dark: '#5a3c1e', light: '#9a7c4e', border: '#cc9944' }
    }
];

// Returns the maze layout for a given level (cycles every 2 levels)
function getMazeLayout(level) {
    const idx = Math.floor((level - 1) / 2) % MAZE_LAYOUTS.length;
    return MAZE_LAYOUTS[idx];
}

// ==================== ENTITY START POSITIONS ====================
const HOMER_START = { x: 14, y: 23 };

const GHOST_CFG = [
    { name: 'Sr. Burns',   color: '#ffd800', skinColor: '#f5e6a0', startX: 14, startY: 11, scatterX: 25, scatterY: 0,  homeX: 14, homeY: 14, exitDelay: 0 },
    { name: 'Bob Patiño',  color: '#ff4444', skinColor: '#f5d0a0', startX: 12, startY: 14, scatterX: 2,  scatterY: 0,  homeX: 12, homeY: 14, exitDelay: 50 },
    { name: 'Nelson',      color: '#ff8c00', skinColor: '#ffd800', startX: 14, startY: 14, scatterX: 27, scatterY: 30, homeX: 14, homeY: 14, exitDelay: 100 },
    { name: 'Snake',       color: '#44bb44', skinColor: '#f5d0a0', startX: 16, startY: 14, scatterX: 0,  scatterY: 30, homeX: 16, homeY: 14, exitDelay: 150 }
];

// ==================== TIMING ====================
const MODE_TIMERS = [180, 1200, 300, 1200, 300, 1200, 300, -1];
const FRIGHT_TIME = 360;
const FRIGHT_FLASH_TIME = 120;
const BASE_SPEED = 1.8;

// ==================== PROGRESSIVE DIFFICULTY CURVE ====================
// Levels 1-8: progressive scaling per level
const DIFFICULTY_CURVE = {
    ghostSpeedPerLevel: 0.025,          // +2.5% ghost speed per level
    frightReductionPerLevel: 0.04,      // -4% fright time per level
    scatterReductionPerLevel: 0.06,     // -6% scatter duration per level
    chaseLengtheningPerLevel: 0.04,     // +4% chase duration per level
    exitDelayReduction: 0.6,            // ghost exit delay reduction (0-1 ramp)
    curatedLevels: 8,                   // levels before endless mode
}

// ==================== ENDLESS MODE ====================
const ENDLESS_MODE = {
    startLevel: 9,                      // level at which endless mode begins
    maxSpeedMultiplier: 1.8,            // speed cap (prevents unplayable speeds)
    minFrightFrames: 90,                // ~1.5 seconds at 60fps (minimum floor)
    endlessScalingFactor: 0.5,          // difficulty scales at half rate in endless
    minScatterFrames: 60,               // 1 second minimum scatter duration
}

// ==================== COMBO MULTIPLIER ====================
// Multiplier values that trigger milestone particle + audio effects
const COMBO_MILESTONES = [2, 4, 8];
// localStorage key for persisting all-time best combo
const COMBO_MILESTONE_STORAGE_KEY = 'comeRosquillas_bestCombo';

// ==================== DIFFICULTY SYSTEM ====================
const DIFFICULTY_PRESETS = {
    easy: {
        name: 'Easy',
        ghostSpeedMultiplier: 0.8,      // Ghosts 20% slower
        frightTimeMultiplier: 1.5,       // Power pellets last 50% longer
        extraLifeThreshold: 5000,        // Extra life every 5000 points
        description: 'Slower ghosts, longer power-ups'
    },
    normal: {
        name: 'Normal',
        ghostSpeedMultiplier: 1.0,       // Default speed
        frightTimeMultiplier: 1.0,        // Default duration
        extraLifeThreshold: 10000,        // Extra life every 10000 points (current)
        description: 'Balanced gameplay'
    },
    hard: {
        name: 'Hard',
        ghostSpeedMultiplier: 1.2,       // Ghosts 20% faster
        frightTimeMultiplier: 0.7,        // Power pellets 30% shorter
        extraLifeThreshold: 20000,        // Extra life every 20000 points
        description: 'Faster ghosts, shorter power-ups'
    }
};

// Difficulty storage key
const DIFFICULTY_STORAGE_KEY = 'comeRosquillas_difficulty';

// ==================== LEADERBOARD & STATS ====================
const STATS_STORAGE_KEY = 'comeRosquillas_lifetimeStats';
const MAX_HIGH_SCORES = 50;

const RANK_BADGES = [
    { id: 'master',   name: 'Master',   emoji: '👑', minDonuts: 20000 },
    { id: 'expert',   name: 'Expert',   emoji: '🏆', minDonuts: 5000 },
    { id: 'regular',  name: 'Regular',  emoji: '🍕', minDonuts: 1000 },
    { id: 'beginner', name: 'Beginner', emoji: '🍩', minDonuts: 0 }
];

// Get current difficulty settings from localStorage (defaults to 'normal')
function getDifficultySettings() {
    try {
        const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
        const level = saved && DIFFICULTY_PRESETS[saved] ? saved : 'normal';
        return DIFFICULTY_PRESETS[level];
    } catch (e) {
        console.warn('Failed to load difficulty:', e);
        return DIFFICULTY_PRESETS.normal;
    }
}

// Get current difficulty level name
function getCurrentDifficulty() {
    const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    return saved && DIFFICULTY_PRESETS[saved] ? saved : 'normal';
}

// Set difficulty level and persist to localStorage
function setDifficulty(level) {
    if (!DIFFICULTY_PRESETS[level]) {
        console.warn(`Invalid difficulty level: ${level}. Using 'normal'.`);
        level = 'normal';
    }
    try {
        localStorage.setItem(DIFFICULTY_STORAGE_KEY, level);
    } catch (e) {
        console.warn('Failed to save difficulty:', e);
    }
    return DIFFICULTY_PRESETS[level];
}

// Load AI tuning profile from localStorage
function loadAITuning() {
    try {
        const saved = localStorage.getItem(AI_TUNING_STORAGE_KEY)
        if (saved) return { ...AI_TUNING_DEFAULTS, ...JSON.parse(saved) }
    } catch (e) { console.warn('Failed to load AI tuning:', e) }
    return { ...AI_TUNING_DEFAULTS }
}

// Save AI tuning profile to localStorage
function saveAITuning(profile) {
    try {
        localStorage.setItem(AI_TUNING_STORAGE_KEY, JSON.stringify(profile))
    } catch (e) { console.warn('Failed to save AI tuning:', e) }
}

// ==================== AUDIO JUICE ====================
const AUDIO_JUICE = {
    // Chomp pitch progression
    chompStreakSemitones: 0.5,           // semitone increase per consecutive chomp
    chompStreakMax: 12,                  // max streak before pitch resets
    chompStreakDecayMs: 600,             // ms of silence before streak resets
    chompRandomSpread: 0.16,            // ±8% random pitch spread

    // Ghost spatial audio
    spatialMaxDistance: 14,              // tiles — beyond this, ghost audio is silent
    spatialMinVolume: 0.0,              // volume at max distance
    spatialMaxVolume: 0.12,             // volume when ghost is on top of player
    spatialUpdateInterval: 6,           // update spatial every N frames (performance)

    // Power pellet hum
    powerHumFreq: 55,                   // base frequency for power pellet ambient hum
    powerHumVolume: 0.06,               // hum max volume

    // Audio ducking
    duckAmount: 0.25,                   // music volume multiplier during ducking (25%)
    duckFadeIn: 0.05,                   // seconds to duck down
    duckFadeOut: 0.3,                   // seconds to restore music
    duckDurationSfx: 0.4,              // seconds — short duck for SFX (power, eatGhost)
    duckDurationStinger: 2.5,          // seconds — long duck for stingers (levelComplete, gameOver)

    // Dynamic music tempo
    baseMusicTempo: 1.0,                // normal tempo multiplier
    frightMusicTempo: 1.25,             // tempo during fright mode
    maxLevelTempo: 1.15,                // max tempo boost from level progression
    tempoPerLevel: 0.015,               // tempo increase per level

    // Fright mode music shift (semitones down for eerie feel)
    frightDetune: -200,                 // cents detune for fright melody
}

// ==================== CAMERA EFFECTS ====================
const CAMERA_CONFIG = {
    // Screen shake intensities (pixels)
    shake: {
        ghostCollision:  { intensity: 5, duration: 18 },   // medium shake on death
        comboLight:      { intensity: 3, duration: 12 },    // 2x combo
        comboMedium:     { intensity: 5, duration: 14 },    // 4x combo
        comboHeavy:      { intensity: 8, duration: 18 },    // 8x combo
        powerPellet:     { intensity: 2, duration: 10 },    // light pulse on power pickup
    },
    // Zoom effects
    zoom: {
        levelStartScale:    1.5,    // zoom in on level start
        levelStartDuration: 60,     // frames (1s at 60fps)
        levelCompleteScale: 0.9,    // slight zoom out on level clear
        levelCompleteDuration: 40,
        deathScale:         1.2,    // zoom toward Homer on death
        deathDuration:      45,
        powerPulseScale:    1.02,   // subtle pulse on power pellet
        powerPulseDuration: 12,
    },
    // Camera follow (smooth lerp)
    follow: {
        lerpSpeed:      0.08,       // interpolation speed (0–1, higher = snappier)
        lookahead:      2.5,        // tiles ahead in movement direction
        edgePadding:    3,          // tiles from maze edge to stop centering
        viewportRatio:  0.8,        // keep Homer within 80% of viewport center
    },
    // Auto-disable threshold
    fpsThreshold: 45,               // disable camera effects below this FPS
    fpsCheckInterval: 120,          // frames between FPS checks (~2s)
}

// ==================== PERFORMANCE ====================
const PERF_CONFIG = {
    bfsCacheTTL: 3,                     // frames to cache BFS pathfinding results
    particlePoolSize: 100,              // pre-allocated particle pool size
    fpsBufferSize: 60,                  // ring buffer size for FPS counter
    devMode: false,                     // set true to show FPS counter
    frameBudgetMs: 18,                  // max ms per frame before skipping (slight headroom over 16.67)
    levelTransitionWipeDuration: 30,    // frames for level transition wipe effect
}

// ==================== GHOST DEBUG ====================
const GHOST_DEBUG = {
    modeColors: {
        [GM_SCATTER]: '#4488ff',
        [GM_CHASE]: '#ff4444',
        [GM_FRIGHTENED]: '#8844ff',
        [GM_EATEN]: '#888888',
    },
    modeLabels: {
        [GM_SCATTER]: 'SCT',
        [GM_CHASE]: 'CHS',
        [GM_FRIGHTENED]: 'FRT',
        [GM_EATEN]: 'EAT',
    },
    modeIcons: {
        [GM_SCATTER]: '🏠',
        [GM_CHASE]: '🎯',
        [GM_FRIGHTENED]: '😱',
        [GM_EATEN]: '👻',
    },
    targetLineAlpha: 0.45,
    breadcrumbAlpha: 0.3,
    breadcrumbRadius: 2,
    maxBreadcrumbs: 12,
}

// ==================== AI TUNING ====================
const AI_TUNING_STORAGE_KEY = 'comeRosquillas_aiProfile'
const AI_TUNING_DEFAULTS = {
    aggression: 1.0,            // 0.5–2.0 — multiplier on chase speed bonus
    chaseDistance: 8,            // 4–16 — Snake flee threshold (tiles)
    scatterMultiplier: 1.0,     // 0.25–3.0 — scales scatter timer durations
}

// ==================== DAILY CHALLENGE ====================
const DAILY_CHALLENGE_STORAGE_KEY = 'comerosquillas-daily'
const DAILY_CHALLENGE_HISTORY_KEY = 'comerosquillas-daily-history'

const DAILY_CHALLENGE_TYPES = [
  {
    id: 'speed_run',
    name: 'Speed Run',
    emoji: '⏱️',
    description: 'Clear the maze in 90 seconds!',
    color: '#ff4444',
    rules: { timeLimit: 90, lives: 3, scoreMultiplier: 1.0, powerUpsEnabled: true, donutSpawnMultiplier: 1, ghostSpeedBonus: 0 }
  },
  {
    id: 'ghost_hunter',
    name: 'Ghost Hunter',
    emoji: '👻',
    description: 'Eat 6+ ghosts in a single game!',
    color: '#8844ff',
    rules: { ghostTarget: 6, lives: 3, scoreMultiplier: 1.0, powerUpsEnabled: true, donutSpawnMultiplier: 1, ghostSpeedBonus: 0 }
  },
  {
    id: 'perfect_run',
    name: 'Perfect Run',
    emoji: '✨',
    description: 'Clear the maze without dying!',
    color: '#ffd800',
    rules: { perfectRun: true, lives: 1, scoreMultiplier: 2.0, powerUpsEnabled: true, donutSpawnMultiplier: 1, ghostSpeedBonus: 0 }
  },
  {
    id: 'no_powerups',
    name: 'No Power-Ups',
    emoji: '🚫',
    description: 'Survive without Duff power-ups!',
    color: '#ff8c00',
    rules: { lives: 3, scoreMultiplier: 1.5, powerUpsEnabled: false, donutSpawnMultiplier: 1, ghostSpeedBonus: 0 }
  },
  {
    id: 'donut_feast',
    name: 'Donut Feast',
    emoji: '🍩',
    description: 'Double donut spawns — eat them all!',
    color: '#ff69b4',
    rules: { lives: 3, scoreMultiplier: 1.0, powerUpsEnabled: true, donutSpawnMultiplier: 2, ghostSpeedBonus: 0 }
  },
  {
    id: 'high_score_attack',
    name: 'High Score Attack',
    emoji: '🏆',
    description: '1.5x points — go for the record!',
    color: '#44bb44',
    rules: { lives: 3, scoreMultiplier: 1.5, powerUpsEnabled: true, donutSpawnMultiplier: 1, ghostSpeedBonus: 0 }
  },
  {
    id: 'survival',
    name: 'Survival',
    emoji: '💀',
    description: 'One life only — how far can you go?',
    color: '#cc0000',
    rules: { lives: 1, scoreMultiplier: 2.0, powerUpsEnabled: true, donutSpawnMultiplier: 1, ghostSpeedBonus: 0.1 }
  }
]

// ==================== SIMPSONS COLOR PALETTE ====================
const COLORS = {
    simpsonYellow: '#ffd800',
    simpsonSkin: '#fcd667',
    homerWhite: '#ffffff',
    donutPink: '#ff69b4',
    donutDarkPink: '#ff1493',
    donutBrown: '#a0522d',
    donutDarkBrown: '#8b4513',
    sprinkle1: '#ff0000',
    sprinkle2: '#00ff00',
    sprinkle3: '#0088ff',
    sprinkle4: '#ffff00',
    sprinkle5: '#ff8800',
    duffRed: '#cc0000',
    duffGold: '#ffd700',
    wallBlue: '#2244aa',
    wallBlueDark: '#1a3388',
    wallBlueLight: '#3366cc',
    wallBorder: '#5577ee',
    pathDark: '#0a0a1a',
    skyBlue: '#87ceeb',
    springfieldGreen: '#2d8b2d',
    krustyPurple: '#6a0dad',
    burnsGreen: '#556b2f',
};

// ==================== POWER-UP TYPES ====================
// Data-driven power-up definitions — add new items here
const SPECIAL_ITEM = 6; // cell type for special item on maze grid

const POWER_UP_TYPES = [
    {
        id: 'duff_beer',
        name: 'Duff Beer',
        emoji: '🍺',
        description: '2x speed for 8 seconds',
        duration: 480,              // 8s at 60fps
        probability: 30,            // weighted chance (out of total weights)
        points: 200,
        colors: { primary: '#cc0000', secondary: '#ffd700', glow: 'rgba(255,215,0,0.3)' },
        quote: '¡Cerveza rápida!',
        effect: 'speed_boost',
        effectValue: 2.0,           // 2x speed multiplier
    },
    {
        id: 'donut_box',
        name: 'Donut Box',
        emoji: '📦',
        description: 'Bonus points jackpot',
        duration: 0,                // instant
        probability: 5,             // rare (5% relative weight)
        points: 0,                  // randomized at pickup: 1000-5000
        colors: { primary: '#ff69b4', secondary: '#ffd800', glow: 'rgba(255,105,180,0.3)' },
        quote: 'Mmm... caja de rosquillas!',
        effect: 'bonus_points',
        effectValue: [1000, 5000],  // [min, max] point range
    },
    {
        id: 'chili_pepper',
        name: 'Chili Pepper',
        emoji: '🌶️',
        description: 'Ghosts at 50% speed for 10s',
        duration: 600,              // 10s at 60fps
        probability: 25,
        points: 150,
        colors: { primary: '#ff2200', secondary: '#ff8800', glow: 'rgba(255,34,0,0.3)' },
        quote: '¡Ay, picante!',
        effect: 'slow_ghosts',
        effectValue: 0.5,           // ghost speed multiplier
    },
    {
        id: 'burns_token',
        name: 'Mr. Burns Token',
        emoji: '💰',
        description: 'Collect 3 for extra life',
        duration: 0,                // passive — collect counter
        probability: 1,             // very rare (1% relative weight)
        points: 500,
        colors: { primary: '#556b2f', secondary: '#ffd800', glow: 'rgba(85,107,47,0.3)' },
        quote: 'Excellent...',
        effect: 'collect_token',
        effectValue: 3,             // tokens needed for extra life
    },
    {
        id: 'lard_lad',
        name: 'Lard Lad Statue',
        emoji: '🗽',
        description: '5s invincibility',
        duration: 300,              // 5s at 60fps
        probability: 15,
        points: 300,
        colors: { primary: '#daa520', secondary: '#ff4500', glow: 'rgba(218,165,32,0.3)' },
        quote: '¡Soy invencible!',
        effect: 'invincibility',
        effectValue: true,
    },
]

// Total probability weight (for weighted random selection)
const POWER_UP_TOTAL_WEIGHT = POWER_UP_TYPES.reduce((sum, t) => sum + t.probability, 0)

// Pick a random power-up type using weighted probabilities
function getRandomPowerUpType() {
    let roll = Math.random() * POWER_UP_TOTAL_WEIGHT
    for (const type of POWER_UP_TYPES) {
        roll -= type.probability
        if (roll <= 0) return type
    }
    return POWER_UP_TYPES[0]
}

// Power-up combo stacking rules
const POWER_UP_COMBOS = {
    // Duff Beer + Power Pellet = score multiplier boost
    duff_beer_power_pellet: { scoreMultiplier: 1.5, label: 'DUFF COMBO!' },
}

// ==================== CUTSCENE DEFINITIONS ====================
// Levels that trigger cutscenes: 2, 5, 9, 14
const CUTSCENE_LEVELS = [2, 5, 9, 14];

// Timeline format: [{frame, action, params}]
// Actions: 'homer', 'donut', 'ghost', 'text', 'burns', 'nelson', 'duff'
const CUTSCENES = {
    1: { // After level 2: Homer chases a donut across the screen
        duration: 240, // 4 seconds at 60fps
        timeline: [
            {frame: 0, action: 'donut', params: {x: -TILE, y: CANVAS_H/2, vx: 3}},
            {frame: 10, action: 'homer', params: {x: -TILE*3, y: CANVAS_H/2, vx: 3, dir: RIGHT}},
        ]
    },
    2: { // After level 5: Nelson points at Homer and says 'HA-HA!'
        duration: 240, // 4 seconds
        timeline: [
            {frame: 0, action: 'homer', params: {x: CANVAS_W/3, y: CANVAS_H/2, vx: 0, vy: 0, dir: RIGHT}},
            {frame: 30, action: 'nelson', params: {x: CANVAS_W*2/3, y: CANVAS_H/2}},
            {frame: 60, action: 'text', params: {text: 'HA-HA!', x: CANVAS_W*2/3, y: CANVAS_H/2 - TILE*2, fontSize: 24}},
        ]
    },
    3: { // After level 9: Homer runs from Mr. Burns, then drinks a Duff and chases Burns
        duration: 480, // 8 seconds
        timeline: [
            {frame: 0, action: 'burns', params: {x: CANVAS_W - TILE*3, y: CANVAS_H/2, vx: -2}},
            {frame: 10, action: 'homer', params: {x: CANVAS_W + TILE, y: CANVAS_H/2, vx: -2, dir: LEFT}},
            {frame: 180, action: 'duff', params: {x: CANVAS_W/2, y: CANVAS_H/2}},
            {frame: 240, action: 'reverse', params: {}}, // Reverse directions at frame 240
        ]
    },
    4: { // After level 14: All ghosts lined up, Homer scares them all at once
        duration: 300, // 5 seconds
        timeline: [
            {frame: 0, action: 'ghost', params: {idx: 0, x: CANVAS_W/5, y: CANVAS_H/2}},
            {frame: 0, action: 'ghost', params: {idx: 1, x: CANVAS_W*2/5, y: CANVAS_H/2}},
            {frame: 0, action: 'ghost', params: {idx: 2, x: CANVAS_W*3/5, y: CANVAS_H/2}},
            {frame: 0, action: 'ghost', params: {idx: 3, x: CANVAS_W*4/5, y: CANVAS_H/2}},
            {frame: 90, action: 'homer', params: {x: -TILE*2, y: CANVAS_H/2, vx: 0, vy: 0, dir: RIGHT}},
            {frame: 120, action: 'power', params: {}}, // Show power effect
            {frame: 150, action: 'scatter', params: {}}, // Ghosts run away
        ]
    }
};
