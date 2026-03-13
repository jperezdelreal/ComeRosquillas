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
