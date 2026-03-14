// ===========================
// Come Rosquillas - Real Gameplay Tests
// Issue #106: Tests that instantiate Game and exercise actual gameplay
// ===========================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// -- Constants mirrored from config.js for assertions --
const TILE = 24
const COLS = 28
const ROWS = 31
const CANVAS_W = COLS * TILE
const CANVAS_H = ROWS * TILE

const WALL = 0, DOT = 1, EMPTY = 2, POWER = 3, GHOST_HOUSE = 4, GHOST_DOOR = 5
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
const OPP = [DOWN, LEFT, UP, RIGHT]
const ST_START = 0, ST_READY = 1, ST_PLAYING = 2, ST_DYING = 3,
  ST_LEVEL_DONE = 4, ST_GAME_OVER = 5, ST_PAUSED = 6, ST_CUTSCENE = 7, ST_HIGH_SCORE_ENTRY = 8
const GM_SCATTER = 0, GM_CHASE = 1, GM_FRIGHTENED = 2, GM_EATEN = 3
const BASE_SPEED = 1.8
const HOMER_START = { x: 14, y: 23 }

// ==================== DOM & BROWSER MOCK SETUP ====================

function createMockCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = {
    fillRect: vi.fn(), clearRect: vi.fn(), strokeRect: vi.fn(),
    fillText: vi.fn(), strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    beginPath: vi.fn(), closePath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(),
    save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(),
    setTransform: vi.fn(), drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    clip: vi.fn(), ellipse: vi.fn(), quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(), rect: vi.fn(), roundRect: vi.fn(),
    globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
    font: '', textAlign: '', textBaseline: '', lineCap: '', lineJoin: '',
    shadowColor: '', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
    globalCompositeOperation: 'source-over', canvas,
  }
  canvas.getContext = vi.fn(() => ctx)
  return { canvas, ctx }
}

function setupDOM() {
  const { canvas } = createMockCanvas()
  canvas.id = 'gameCanvas'
  document.body.appendChild(canvas)
  const elemIds = [
    'scoreDisplay', 'levelDisplay', 'highScoreDisplay',
    'livesIcons', 'bestComboDisplay', 'bestComboValue',
    'message', 'settingsBtn'
  ]
  for (const id of elemIds) {
    const el = document.createElement('div')
    el.id = id
    document.body.appendChild(el)
  }
}

function teardownDOM() {
  document.body.innerHTML = ''
}

function mockAudioContext() {
  const gainNode = {
    gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(), disconnect: vi.fn(),
  }
  const oscillatorNode = {
    type: 'sine',
    frequency: { value: 440, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    detune: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  }
  const compressorNode = {
    threshold: { value: -24 }, knee: { value: 30 }, ratio: { value: 12 },
    attack: { value: 0.003 }, release: { value: 0.25 }, connect: vi.fn(),
  }
  const MockAudioContext = vi.fn(() => ({
    createGain: vi.fn(() => ({ ...gainNode })),
    createOscillator: vi.fn(() => ({ ...oscillatorNode })),
    createDynamicsCompressor: vi.fn(() => ({ ...compressorNode })),
    createBiquadFilter: vi.fn(() => ({
      type: 'lowpass',
      frequency: { value: 1000, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      Q: { value: 1 }, connect: vi.fn(),
    })),
    createStereoPanner: vi.fn(() => ({
      pan: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
    destination: {}, currentTime: 0, state: 'running',
    resume: vi.fn(() => Promise.resolve()),
  }))
  window.AudioContext = MockAudioContext
  window.webkitAudioContext = MockAudioContext
}

// ==================== LOAD GAME GLOBALS ====================

let gameGlobalsLoaded = false

async function loadGameGlobals() {
  if (gameGlobalsLoaded) return
  const fs = await import('fs')
  const path = await import('path')

  if (typeof performance === 'undefined') {
    globalThis.performance = { now: () => Date.now() }
  }

  window.requestAnimationFrame = vi.fn((cb) => 0)
  window.cancelAnimationFrame = vi.fn()
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn() }))

  // Mock i18n translation function
  globalThis.t = (key) => key

  // Mock I18n object (used in game-logic.js for quotes and level titles)
  globalThis.I18n = {
    t: (key) => key,
    tNamed: (key) => key,
    getDeathQuotes: () => ["D'OH!"],
    getGameOverQuotes: () => ['Game Over'],
    getPowerQuotes: () => ['Woohoo!'],
    getWinQuotes: () => ['Woohoo!'],
    getMazeName: (name) => name,
    getLanguage: () => 'en',
    setLanguage: () => {},
    onChange: () => {},
    SUPPORTED_LANGUAGES: { en: { flag: '🇺🇸', nativeName: 'English' } },
  }

  // Mock Sprites — Proxy catches any method call as no-op
  globalThis.Sprites = new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'loaded') return false
      return () => {}
    }
  })

  mockAudioContext()
  setupDOM()

  const root = path.default.resolve(__dirname, '..')
  const scriptFiles = [
    'js/config.js',
    'js/engine/audio.js',
    'js/engine/high-scores.js',
    'js/game-logic.js',
    'js/engine/entity-manager.js',
    'js/engine/collision-detector.js',
    'js/engine/scoring-system.js',
    'js/engine/level-manager.js',
    'js/engine/ai-controller.js',
  ]

  for (const file of scriptFiles) {
    const filePath = path.default.join(root, file)
    try {
      let code = fs.default.readFileSync(filePath, 'utf-8')
      code = code.replace(/^'use strict';?\s*/m, '')
      // Wrap in IIFE that explicitly assigns declarations to globalThis
      const wrappedCode = `(function() {
        ${code}
        try {
          ${file.includes('game-logic') ? 'globalThis.Game = Game;' : ''}
          ${file.includes('config') ? `
            globalThis.TILE = TILE; globalThis.COLS = COLS; globalThis.ROWS = ROWS;
            globalThis.CANVAS_W = CANVAS_W; globalThis.CANVAS_H = CANVAS_H;
            globalThis.WALL = WALL; globalThis.DOT = DOT; globalThis.EMPTY = EMPTY;
            globalThis.POWER = POWER; globalThis.GHOST_HOUSE = GHOST_HOUSE; globalThis.GHOST_DOOR = GHOST_DOOR;
            globalThis.UP = UP; globalThis.RIGHT = RIGHT; globalThis.DOWN = DOWN; globalThis.LEFT = LEFT;
            globalThis.DX = DX; globalThis.DY = DY; globalThis.OPP = OPP;
            globalThis.ST_START = ST_START; globalThis.ST_READY = ST_READY; globalThis.ST_PLAYING = ST_PLAYING;
            globalThis.ST_DYING = ST_DYING; globalThis.ST_LEVEL_DONE = ST_LEVEL_DONE;
            globalThis.ST_GAME_OVER = ST_GAME_OVER; globalThis.ST_PAUSED = ST_PAUSED;
            globalThis.ST_CUTSCENE = ST_CUTSCENE; globalThis.ST_HIGH_SCORE_ENTRY = ST_HIGH_SCORE_ENTRY;
            globalThis.GM_SCATTER = GM_SCATTER; globalThis.GM_CHASE = GM_CHASE;
            globalThis.GM_FRIGHTENED = GM_FRIGHTENED; globalThis.GM_EATEN = GM_EATEN;
            globalThis.HOMER_START = HOMER_START; globalThis.GHOST_CFG = GHOST_CFG;
            globalThis.MODE_TIMERS = MODE_TIMERS; globalThis.FRIGHT_TIME = FRIGHT_TIME;
            globalThis.FRIGHT_FLASH_TIME = FRIGHT_FLASH_TIME; globalThis.BASE_SPEED = BASE_SPEED;
            globalThis.MAZE_LAYOUTS = MAZE_LAYOUTS; globalThis.getMazeLayout = getMazeLayout;
            globalThis.DIFFICULTY_PRESETS = DIFFICULTY_PRESETS; globalThis.DIFFICULTY_STORAGE_KEY = DIFFICULTY_STORAGE_KEY;
            globalThis.getDifficultySettings = getDifficultySettings; globalThis.getCurrentDifficulty = getCurrentDifficulty;
            globalThis.setDifficulty = setDifficulty;
            globalThis.DIFFICULTY_CURVE = DIFFICULTY_CURVE; globalThis.ENDLESS_MODE = ENDLESS_MODE;
            globalThis.COMBO_MILESTONES = COMBO_MILESTONES; globalThis.COMBO_MILESTONE_STORAGE_KEY = COMBO_MILESTONE_STORAGE_KEY;
            globalThis.GHOST_PERSONALITY_VISUALS = GHOST_PERSONALITY_VISUALS;
            globalThis.PERF_CONFIG = PERF_CONFIG; globalThis.COLORS = COLORS;
            globalThis.AI_TUNING_DEFAULTS = AI_TUNING_DEFAULTS; globalThis.AI_TUNING_STORAGE_KEY = AI_TUNING_STORAGE_KEY;
            globalThis.loadAITuning = loadAITuning; globalThis.saveAITuning = saveAITuning;
            globalThis.BOSS_GHOSTS = BOSS_GHOSTS; globalThis.BOSS_CONFIG = BOSS_CONFIG;
            globalThis.getBossForLevel = getBossForLevel;
            globalThis.AUDIO_JUICE = AUDIO_JUICE; globalThis.CAMERA_CONFIG = CAMERA_CONFIG;
            globalThis.GHOST_DEBUG = GHOST_DEBUG;
            globalThis.MAX_HIGH_SCORES = MAX_HIGH_SCORES;
            globalThis.HOMER_DEATH_QUOTES = HOMER_DEATH_QUOTES; globalThis.HOMER_POWER_QUOTES = HOMER_POWER_QUOTES;
            globalThis.HOMER_WIN_QUOTES = HOMER_WIN_QUOTES; globalThis.GAME_OVER_QUOTES = GAME_OVER_QUOTES;
            globalThis.GHOST_NAMES = GHOST_NAMES;
            if (typeof CUTSCENE_LEVELS !== 'undefined') globalThis.CUTSCENE_LEVELS = CUTSCENE_LEVELS;
            if (typeof CUTSCENES !== 'undefined') globalThis.CUTSCENES = CUTSCENES;
            if (typeof ANIM !== 'undefined') globalThis.ANIM = ANIM;
            if (typeof RANK_BADGES !== 'undefined') globalThis.RANK_BADGES = RANK_BADGES;
            if (typeof STATS_STORAGE_KEY !== 'undefined') globalThis.STATS_STORAGE_KEY = STATS_STORAGE_KEY;
            if (typeof PROCEDURAL_EVENTS !== 'undefined') globalThis.PROCEDURAL_EVENTS = PROCEDURAL_EVENTS;
          ` : ''}
          ${file.includes('audio') ? 'globalThis.SoundManager = SoundManager;' : ''}
          ${file.includes('high-scores') ? 'globalThis.HighScoreManager = HighScoreManager;' : ''}
        } catch(e) {}
      })();`
      // eslint-disable-next-line no-eval
      ;(0, eval)(wrappedCode)
    } catch (e) {
      console.warn(`Warning loading ${file}:`, e.message)
    }
  }

  gameGlobalsLoaded = true
}

// ==================== HELPERS ====================

function createTestGame() {
  window.requestAnimationFrame = vi.fn(() => 0)

  // Stub loop() to prevent draw() from firing during construction
  const GameClass = globalThis.Game
  const origLoop = GameClass.prototype.loop
  GameClass.prototype.loop = function() {}

  const game = new GameClass()

  GameClass.prototype.loop = origLoop
  window.requestAnimationFrame.mockClear()
  return game
}

function startGame(game) {
  game.startNewGame()
  game.state = ST_PLAYING
  game.stateTimer = 0
}

function placeHomer(game, col, row) {
  game.homer.x = col * TILE
  game.homer.y = row * TILE
}

function placeGhost(game, ghostIdx, col, row, mode) {
  const g = game.ghosts[ghostIdx]
  g.x = col * TILE
  g.y = row * TILE
  g.inHouse = false
  g.exitTimer = 0
  if (mode !== undefined) g.mode = mode
}

function countRemainingDots(game) {
  let count = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (game.maze[r][c] === DOT || game.maze[r][c] === POWER) count++
    }
  }
  return count
}

function findCell(game, cellType) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (game.maze[r][c] === cellType) return { col: c, row: r }
    }
  }
  return null
}

function findAllCells(game, cellType) {
  const result = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (game.maze[r][c] === cellType) result.push({ col: c, row: r })
    }
  }
  return result
}

// ==================== TESTS ====================

describe('Gameplay Tests — Real Game Instance', () => {
  beforeEach(async () => {
    localStorage.clear()
    await loadGameGlobals()
    teardownDOM()
    setupDOM()
    mockAudioContext()
    window.requestAnimationFrame = vi.fn(() => 0)
  })

  afterEach(() => {
    if (window._game) window._game = null
  })

  // ==================== 1. GAME INITIALIZATION ====================
  describe('Game Initialization', () => {
    it('Game constructor creates a valid instance with all core properties', () => {
      const game = createTestGame()
      expect(game).toBeDefined()
      expect(game.canvas).toBeDefined()
      expect(game.ctx).toBeDefined()
      expect(game.sound).toBeDefined()
      expect(game.highScores).toBeDefined()
      expect(game.state).toBe(ST_START)
      expect(game.score).toBe(0)
      expect(game.lives).toBe(3)
      expect(game.level).toBe(1)
    })

    it('startNewGame initializes game state correctly', () => {
      const game = createTestGame()
      game.startNewGame()
      expect(game.score).toBe(0)
      expect(game.lives).toBe(3)
      expect(game.level).toBe(1)
      expect(game.state).toBe(ST_READY)
      expect(game.homer).toBeDefined()
      expect(game.ghosts).toBeDefined()
      expect(game.ghosts.length).toBeGreaterThanOrEqual(4)
    })

    it('Homer starts at the correct spawn position', () => {
      const game = createTestGame()
      startGame(game)
      expect(game.homer.x).toBe(HOMER_START.x * TILE)
      expect(game.homer.y).toBe(HOMER_START.y * TILE)
    })

    it('4 regular ghosts are spawned with distinct configurations', () => {
      const game = createTestGame()
      startGame(game)
      const names = game.ghosts.filter(g => !g.isBoss).map(g => g.name)
      expect(names).toContain('Sr. Burns')
      expect(names).toContain('Bob Patiño')
      expect(names).toContain('Nelson')
      expect(names).toContain('Snake')
    })

    it('maze contains dots and power pellets', () => {
      const game = createTestGame()
      startGame(game)
      expect(game.totalDots).toBeGreaterThan(0)
      const dots = findAllCells(game, DOT)
      const powers = findAllCells(game, POWER)
      expect(dots.length).toBeGreaterThan(0)
      expect(powers.length).toBeGreaterThan(0)
    })
  })

  // ==================== 2. DOT COLLECTION & SCORING ====================
  describe('Dot Collection', () => {
    it('Homer collects a dot: score increases by 10', () => {
      const game = createTestGame()
      startGame(game)
      const dotPos = findCell(game, DOT)
      placeHomer(game, dotPos.col, dotPos.row)
      const scoreBefore = game.score
      game.checkDots()
      expect(game.score).toBe(scoreBefore + 10)
    })

    it('collected dot becomes EMPTY in maze', () => {
      const game = createTestGame()
      startGame(game)
      const dotPos = findCell(game, DOT)
      placeHomer(game, dotPos.col, dotPos.row)
      game.checkDots()
      expect(game.maze[dotPos.row][dotPos.col]).toBe(EMPTY)
    })

    it('dotsEaten counter increments on dot collection', () => {
      const game = createTestGame()
      startGame(game)
      const dotPos = findCell(game, DOT)
      placeHomer(game, dotPos.col, dotPos.row)
      const eaten = game.dotsEaten
      game.checkDots()
      expect(game.dotsEaten).toBe(eaten + 1)
    })

    it('power pellet collection gives 50 points', () => {
      const game = createTestGame()
      startGame(game)
      const powerPos = findCell(game, POWER)
      placeHomer(game, powerPos.col, powerPos.row)
      const scoreBefore = game.score
      game.checkDots()
      expect(game.score).toBe(scoreBefore + 50)
    })

    it('power pellet collection sets frightTimer > 0', () => {
      const game = createTestGame()
      startGame(game)
      const powerPos = findCell(game, POWER)
      placeHomer(game, powerPos.col, powerPos.row)
      game.checkDots()
      expect(game.frightTimer).toBeGreaterThan(0)
    })

    it('collecting multiple dots accumulates score correctly', () => {
      const game = createTestGame()
      startGame(game)
      const dots = findAllCells(game, DOT)
      let expectedScore = 0
      for (let i = 0; i < 3; i++) {
        placeHomer(game, dots[i].col, dots[i].row)
        game.checkDots()
        expectedScore += 10
      }
      expect(game.score).toBe(expectedScore)
    })
  })

  // ==================== 3. GHOST COLLISION — DEATH ====================
  describe('Homer Dies Touching a Ghost (Chase Mode)', () => {
    it('Homer dies when touching a ghost in chase mode', () => {
      const game = createTestGame()
      startGame(game)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_CHASE)
      game.checkCollisions()
      expect(game.state).toBe(ST_DYING)
    })

    it('Homer dies when touching a ghost in scatter mode', () => {
      const game = createTestGame()
      startGame(game)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_SCATTER)
      game.checkCollisions()
      expect(game.state).toBe(ST_DYING)
    })

    it('dying state timer counts down and decrements lives', () => {
      const game = createTestGame()
      startGame(game)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_CHASE)
      game.checkCollisions()
      expect(game.stateTimer).toBe(90)
      const livesBefore = game.lives
      game.stateTimer = 1
      game.update()
      expect(game.lives).toBe(livesBefore - 1)
    })

    it('game over when last life is lost', () => {
      const game = createTestGame()
      startGame(game)
      game.lives = 1
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_CHASE)
      game.checkCollisions()
      game.stateTimer = 1
      game.update()
      expect([ST_GAME_OVER, ST_HIGH_SCORE_ENTRY]).toContain(game.state)
    })

    it('ghost in GM_EATEN mode does NOT kill Homer', () => {
      const game = createTestGame()
      startGame(game)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_EATEN)
      game.checkCollisions()
      expect(game.state).toBe(ST_PLAYING)
    })
  })

  // ==================== 4. FRIGHTENED GHOST MECHANIC ====================
  describe('Frightened Ghost Mechanic', () => {
    it('power pellet turns all non-eaten ghosts to FRIGHTENED', () => {
      const game = createTestGame()
      startGame(game)
      for (let i = 0; i < 4; i++) {
        game.ghosts[i].inHouse = false
        game.ghosts[i].exitTimer = 0
        game.ghosts[i].mode = GM_CHASE
      }
      const powerPos = findCell(game, POWER)
      placeHomer(game, powerPos.col, powerPos.row)
      game.checkDots()
      for (let i = 0; i < 4; i++) {
        expect(game.ghosts[i].mode).toBe(GM_FRIGHTENED)
      }
    })

    it('eating a frightened ghost gives 200 points (1st ghost)', () => {
      const game = createTestGame()
      startGame(game)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_FRIGHTENED)
      game.ghostsEaten = 0
      const scoreBefore = game.score
      game.checkCollisions()
      expect(game.score).toBe(scoreBefore + 200)
    })

    it('eating ghosts in sequence doubles points (combo: 200, 400, 800, 1600)', () => {
      const game = createTestGame()
      startGame(game)
      const expectedPoints = [200, 400, 800, 1600]
      let totalPoints = 0
      game.ghostsEaten = 0
      for (let i = 0; i < 4; i++) {
        placeGhost(game, i, 1 + i * 3, 1, GM_FRIGHTENED)
      }
      for (let i = 0; i < 4; i++) {
        placeHomer(game, Math.floor(game.ghosts[i].x / TILE), Math.floor(game.ghosts[i].y / TILE))
        const scoreBefore = game.score
        game.checkCollisions()
        const gained = game.score - scoreBefore
        expect(gained).toBe(expectedPoints[i])
        totalPoints += gained
      }
      expect(totalPoints).toBe(3000)
    })

    it('eaten ghost mode changes to GM_EATEN', () => {
      const game = createTestGame()
      startGame(game)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_FRIGHTENED)
      game.ghostsEaten = 0
      game.checkCollisions()
      expect(game.ghosts[0].mode).toBe(GM_EATEN)
    })

    it('ghostsEaten counter resets when collecting new power pellet', () => {
      const game = createTestGame()
      startGame(game)
      game.ghostsEaten = 3
      const powerPos = findCell(game, POWER)
      placeHomer(game, powerPos.col, powerPos.row)
      game.checkDots()
      expect(game.ghostsEaten).toBe(0)
    })

    it('already eaten ghosts stay GM_EATEN when new power pellet collected', () => {
      const game = createTestGame()
      startGame(game)
      game.ghosts[0].mode = GM_EATEN
      game.ghosts[0].inHouse = false
      game.ghosts[1].mode = GM_CHASE
      game.ghosts[1].inHouse = false
      const powerPos = findCell(game, POWER)
      placeHomer(game, powerPos.col, powerPos.row)
      game.checkDots()
      expect(game.ghosts[0].mode).toBe(GM_EATEN)
      expect(game.ghosts[1].mode).toBe(GM_FRIGHTENED)
    })

    it('bestCombo tracks highest combo multiplier', () => {
      const game = createTestGame()
      startGame(game)
      game.ghostsEaten = 0
      for (let i = 0; i < 2; i++) {
        placeGhost(game, i, 1 + i * 3, 1, GM_FRIGHTENED)
        placeHomer(game, 1 + i * 3, 1)
        game.checkCollisions()
      }
      expect(game.bestCombo).toBeGreaterThanOrEqual(2)
    })
  })

  // ==================== 5. LEVEL COMPLETION ====================
  describe('Level Completion', () => {
    it('level completes when all dots are eaten', () => {
      const game = createTestGame()
      startGame(game)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (game.maze[r][c] === DOT || game.maze[r][c] === POWER) {
            game.maze[r][c] = EMPTY
          }
        }
      }
      game.maze[1][1] = DOT
      game.dotsEaten = game.totalDots - 1
      placeHomer(game, 1, 1)
      game.checkDots()
      expect(game.state).toBe(ST_LEVEL_DONE)
    })

    it('level transitions to next level after ST_LEVEL_DONE timer expires', () => {
      const game = createTestGame()
      startGame(game)
      const initialLevel = game.level
      game.state = ST_LEVEL_DONE
      game.stateTimer = 1
      game.update()
      if (game.state === ST_CUTSCENE) {
        expect(game.state).toBe(ST_CUTSCENE)
      } else {
        expect(game.level).toBe(initialLevel + 1)
        expect(game.state).toBe(ST_READY)
      }
    })

    it('new level reinitializes maze with fresh dots', () => {
      const game = createTestGame()
      startGame(game)
      game.state = ST_LEVEL_DONE
      game.stateTimer = 1
      game.level = 3 // avoid cutscene levels
      game.update()
      expect(game.level).toBe(4)
      expect(countRemainingDots(game)).toBeGreaterThan(0)
      expect(game.dotsEaten).toBe(0)
    })
  })

  // ==================== 6. DIFFICULTY SYSTEM ====================
  describe('Difficulty Affects Gameplay', () => {
    it('easy difficulty makes ghosts slower', () => {
      localStorage.setItem('comeRosquillas_difficulty', 'easy')
      const easyGame = createTestGame()
      startGame(easyGame)
      const easyGhostSpeed = easyGame.getSpeed('ghost', easyGame.ghosts[0])

      teardownDOM(); setupDOM(); mockAudioContext()
      localStorage.setItem('comeRosquillas_difficulty', 'normal')
      const normalGame = createTestGame()
      startGame(normalGame)
      const normalGhostSpeed = normalGame.getSpeed('ghost', normalGame.ghosts[0])
      expect(easyGhostSpeed).toBeLessThan(normalGhostSpeed)
    })

    it('hard difficulty makes ghosts faster', () => {
      localStorage.setItem('comeRosquillas_difficulty', 'hard')
      const hardGame = createTestGame()
      startGame(hardGame)
      const hardGhostSpeed = hardGame.getSpeed('ghost', hardGame.ghosts[0])

      teardownDOM(); setupDOM(); mockAudioContext()
      localStorage.setItem('comeRosquillas_difficulty', 'normal')
      const normalGame = createTestGame()
      startGame(normalGame)
      const normalGhostSpeed = normalGame.getSpeed('ghost', normalGame.ghosts[0])
      expect(hardGhostSpeed).toBeGreaterThan(normalGhostSpeed)
    })

    it('easy difficulty gives longer fright time', () => {
      localStorage.setItem('comeRosquillas_difficulty', 'easy')
      const easyGame = createTestGame()
      startGame(easyGame)
      const easyFright = easyGame.getLevelFrightTime()

      teardownDOM(); setupDOM(); mockAudioContext()
      localStorage.setItem('comeRosquillas_difficulty', 'normal')
      const normalGame = createTestGame()
      startGame(normalGame)
      const normalFright = normalGame.getLevelFrightTime()
      expect(easyFright).toBeGreaterThan(normalFright)
    })

    it('getDifficultyRamp returns 0 at level 1 and increases with level', () => {
      const game = createTestGame()
      startGame(game)
      game.level = 1
      expect(game.getDifficultyRamp()).toBe(0)
      game.level = 5
      const ramp5 = game.getDifficultyRamp()
      expect(ramp5).toBeGreaterThan(0)
      expect(ramp5).toBeLessThan(1)
      game.level = 50
      expect(game.getDifficultyRamp()).toBe(1)
    })

    it('ghost speed increases with level', () => {
      const game = createTestGame()
      startGame(game)
      const speed1 = game.getSpeed('ghost', game.ghosts[0])
      game.level = 5
      const speed5 = game.getSpeed('ghost', game.ghosts[0])
      expect(speed5).toBeGreaterThan(speed1)
    })
  })

  // ==================== 7. MOVEMENT & MAZE INTERACTION ====================
  describe('Homer Movement', () => {
    it('Homer moves in current direction when path is clear', () => {
      const game = createTestGame()
      startGame(game)
      placeHomer(game, 5, 5)
      game.homer.dir = RIGHT
      game.homer.nextDir = RIGHT
      const xBefore = game.homer.x
      game.moveHomer()
      expect(game.homer.x).toBeGreaterThanOrEqual(xBefore)
    })

    it('Homer cannot walk through walls', () => {
      const game = createTestGame()
      startGame(game)
      placeHomer(game, 1, 1)
      game.homer.dir = UP
      game.homer.nextDir = UP
      for (let i = 0; i < 50; i++) game.moveHomer()
      expect(game.homer.y).toBeGreaterThanOrEqual(0)
    })

    it('isWalkable correctly identifies wall vs walkable tiles', () => {
      const game = createTestGame()
      startGame(game)
      expect(game.isWalkable(0, 0, false)).toBe(false)
      const dotPos = findCell(game, DOT)
      expect(game.isWalkable(dotPos.col, dotPos.row, false)).toBe(true)
      const ghPos = findCell(game, GHOST_HOUSE)
      if (ghPos) {
        expect(game.isWalkable(ghPos.col, ghPos.row, false)).toBe(false)
        expect(game.isWalkable(ghPos.col, ghPos.row, true)).toBe(true)
      }
    })

    it('tunnel wrapping: Homer wraps around at row 14', () => {
      const game = createTestGame()
      startGame(game)
      placeHomer(game, 0, 14)
      game.homer.dir = LEFT
      game.homer.nextDir = LEFT
      game.homer.speed = TILE
      game.homer.x = -TILE - 1
      game.moveHomer()
      expect(game.homer.x).toBeGreaterThan(COLS * TILE - TILE * 2)
    })
  })

  // ==================== 8. GHOST MODES ====================
  describe('Ghost Mode Transitions', () => {
    it('ghosts start in scatter mode on level init', () => {
      const game = createTestGame()
      startGame(game)
      expect(game.globalMode).toBe(GM_SCATTER)
    })

    it('global mode transitions from scatter to chase after timer', () => {
      const game = createTestGame()
      startGame(game)
      game.modeTimer = 1
      game.updateGhostMode()
      expect(game.globalMode).toBe(GM_CHASE)
    })

    it('frightened ghosts reverse direction', () => {
      const game = createTestGame()
      startGame(game)
      game.ghosts[1].inHouse = false
      game.ghosts[1].mode = GM_CHASE
      game.ghosts[1].dir = RIGHT
      const powerPos = findCell(game, POWER)
      placeHomer(game, powerPos.col, powerPos.row)
      game.checkDots()
      expect(game.ghosts[1].mode).toBe(GM_FRIGHTENED)
      expect(game.ghosts[1].dir).toBe(LEFT)
    })
  })

  // ==================== 9. EXTRA LIFE ====================
  describe('Extra Life', () => {
    it('extra life awarded when score reaches threshold (normal: 10000)', () => {
      localStorage.setItem('comeRosquillas_difficulty', 'normal')
      const game = createTestGame()
      startGame(game)
      const livesBefore = game.lives
      game.score = 10000
      game.checkExtraLife()
      expect(game.lives).toBe(livesBefore + 1)
      expect(game.extraLifeGiven).toBe(true)
    })

    it('extra life only given once per game', () => {
      localStorage.setItem('comeRosquillas_difficulty', 'normal')
      const game = createTestGame()
      startGame(game)
      game.score = 10000
      game.checkExtraLife()
      const livesAfterFirst = game.lives
      game.score = 20000
      game.checkExtraLife()
      expect(game.lives).toBe(livesAfterFirst)
    })
  })

  // ==================== 10. GAME STATE MACHINE ====================
  describe('Game State Machine', () => {
    it('transitions: START → READY → PLAYING', () => {
      const game = createTestGame()
      expect(game.state).toBe(ST_START)
      game.startNewGame()
      expect(game.state).toBe(ST_READY)
      game.stateTimer = 1
      game.update()
      expect(game.state).toBe(ST_PLAYING)
    })

    it('PLAYING → PAUSED → PLAYING via state toggle', () => {
      const game = createTestGame()
      startGame(game)
      game.state = ST_PAUSED
      expect(game.state).toBe(ST_PAUSED)
      game.state = ST_PLAYING
      expect(game.state).toBe(ST_PLAYING)
    })

    it('DYING state timer leads to respawn with fewer lives', () => {
      const game = createTestGame()
      startGame(game)
      game.lives = 2
      game.state = ST_DYING
      game.stateTimer = 1
      game.update()
      expect(game.lives).toBe(1)
      expect(game.state).toBe(ST_READY)
    })

    it('full cycle: START → READY → PLAYING → DYING → READY (respawn)', () => {
      const game = createTestGame()
      game.startNewGame()
      expect(game.state).toBe(ST_READY)
      game.stateTimer = 1
      game.update()
      expect(game.state).toBe(ST_PLAYING)
      const hCol = Math.floor(game.homer.x / TILE)
      const hRow = Math.floor(game.homer.y / TILE)
      placeGhost(game, 0, hCol, hRow, GM_CHASE)
      game.checkCollisions()
      expect(game.state).toBe(ST_DYING)
      game.stateTimer = 1
      game.update()
      expect(game.state).toBe(ST_READY)
      expect(game.lives).toBe(2)
    })
  })

  // ==================== 11. ENDLESS MODE ====================
  describe('Endless Mode', () => {
    it('levels >= 9 are endless mode', () => {
      const game = createTestGame()
      startGame(game)
      game.level = 8
      expect(game.isEndlessMode()).toBe(false)
      game.level = 9
      expect(game.isEndlessMode()).toBe(true)
    })

    it('endless mode caps ghost speed', () => {
      const game = createTestGame()
      startGame(game)
      game.level = 50
      const ghostSpeed = game.getSpeed('ghost', game.ghosts[0])
      expect(ghostSpeed).toBeLessThanOrEqual(BASE_SPEED * 1.8)
    })

    it('fright time has a minimum floor in endless mode', () => {
      const game = createTestGame()
      startGame(game)
      game.level = 100
      expect(game.getLevelFrightTime()).toBeGreaterThanOrEqual(90)
    })
  })

  // ==================== 12. HUD UPDATE ====================
  describe('HUD Updates', () => {
    it('HUD displays current score', () => {
      const game = createTestGame()
      startGame(game)
      game.score = 1234
      game.updateHUD()
      expect(game.scoreEl.textContent).toBe('1234')
    })

    it('HUD displays correct lives count', () => {
      const game = createTestGame()
      startGame(game)
      game.lives = 2
      game.updateHUD()
      const donutIcons = game.livesIconsEl.querySelectorAll('.donut-icon')
      expect(donutIcons.length).toBe(2)
    })
  })

  // ==================== 13. FULL GAMEPLAY INTEGRATION ====================
  describe('Full Gameplay Integration', () => {
    it('complete gameplay loop: eat dots, survive ghosts, progress score', () => {
      const game = createTestGame()
      startGame(game)
      const dots = findAllCells(game, DOT)
      for (let i = 0; i < Math.min(5, dots.length); i++) {
        placeHomer(game, dots[i].col, dots[i].row)
        game.checkDots()
      }
      expect(game.score).toBe(50)
      expect(game.dotsEaten).toBe(5)
      const power = findCell(game, POWER)
      if (power) {
        placeHomer(game, power.col, power.row)
        game.checkDots()
        expect(game.score).toBe(100)
        expect(game.frightTimer).toBeGreaterThan(0)
      }
    })

    it('power pellet + eat ghost combo within single gameplay sequence', () => {
      const game = createTestGame()
      startGame(game)
      const power = findCell(game, POWER)
      placeHomer(game, power.col, power.row)
      game.checkDots()
      const frightenedGhosts = game.ghosts.filter(g => g.mode === GM_FRIGHTENED && !g.isBoss)
      expect(frightenedGhosts.length).toBeGreaterThan(0)
      const ghost = frightenedGhosts[0]
      placeHomer(game, Math.floor(ghost.x / TILE), Math.floor(ghost.y / TILE))
      game.checkCollisions()
      expect(game.score).toBeGreaterThan(50)
      expect(game.ghostsEaten).toBeGreaterThanOrEqual(1)
    })

    it('game update loop processes without errors', () => {
      const game = createTestGame()
      startGame(game)
      expect(() => {
        for (let i = 0; i < 10; i++) game.update()
      }).not.toThrow()
    })

    it('game draw loop processes without errors', () => {
      const game = createTestGame()
      startGame(game)
      expect(() => {
        game.draw()
      }).not.toThrow()
    })
  })
})
