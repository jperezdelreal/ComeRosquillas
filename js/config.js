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
    ST_LEVEL_DONE = 4, ST_GAME_OVER = 5, ST_PAUSED = 6;

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

// ==================== MAZE TEMPLATE ====================
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
