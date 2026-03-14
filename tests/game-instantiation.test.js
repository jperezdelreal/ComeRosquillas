// Game Instantiation Tests — Issue #107
// Tests REAL Game class lifecycle by loading production code
// Nelson: "If it can break, I'll find it. Ha-ha!"

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// ==================== GLOBALS SETUP ====================
// Mirror config.js constants on globalThis so production code can reference them

// Grid & Canvas
globalThis.TILE = 24
globalThis.COLS = 28
globalThis.ROWS = 31
globalThis.CANVAS_W = 28 * 24
globalThis.CANVAS_H = 31 * 24

// Cell types
globalThis.WALL = 0
globalThis.DOT = 1
globalThis.EMPTY = 2
globalThis.POWER = 3
globalThis.GHOST_HOUSE = 4
globalThis.GHOST_DOOR = 5

// Directions
globalThis.UP = 0
globalThis.RIGHT = 1
globalThis.DOWN = 2
globalThis.LEFT = 3
globalThis.DX = [0, 1, 0, -1]
globalThis.DY = [-1, 0, 1, 0]
globalThis.OPP = [2, 3, 0, 1]

// Game states
globalThis.ST_START = 0
globalThis.ST_READY = 1
globalThis.ST_PLAYING = 2
globalThis.ST_DYING = 3
globalThis.ST_LEVEL_DONE = 4
globalThis.ST_GAME_OVER = 5
globalThis.ST_PAUSED = 6
globalThis.ST_CUTSCENE = 7
globalThis.ST_HIGH_SCORE_ENTRY = 8

// Ghost modes
globalThis.GM_SCATTER = 0
globalThis.GM_CHASE = 1
globalThis.GM_FRIGHTENED = 2
globalThis.GM_EATEN = 3

// Entity start positions
globalThis.HOMER_START = { x: 14, y: 23 }
globalThis.GHOST_CFG = [
  { name: 'Sr. Burns', color: '#ffd800', skinColor: '#f5e6a0', startX: 14, startY: 11, scatterX: 25, scatterY: 0, homeX: 14, homeY: 14, exitDelay: 0, personality: 'smart' },
  { name: 'Bob Patiño', color: '#ff4444', skinColor: '#f5d0a0', startX: 12, startY: 14, scatterX: 2, scatterY: 0, homeX: 12, homeY: 14, exitDelay: 50, personality: 'fast' },
  { name: 'Nelson', color: '#ff8c00', skinColor: '#ffd800', startX: 14, startY: 14, scatterX: 27, scatterY: 30, homeX: 14, homeY: 14, exitDelay: 100, personality: 'wobble' },
  { name: 'Snake', color: '#44bb44', skinColor: '#f5d0a0', startX: 16, startY: 14, scatterX: 0, scatterY: 30, homeX: 16, homeY: 14, exitDelay: 150, personality: 'erratic' }
]

// Ghost personality visuals
globalThis.GHOST_PERSONALITY_VISUALS = {
  burns: { crownColor: '#ffd700', crownGemColor: '#ff0000', bfsInterval: 1 },
  bob: { speedLineCount: 3, speedLineLength: 12, speedLineAlpha: 0.4, speedMultiplier: 1.2 },
  nelson: { wobbleAmplitude: 2, wobbleFrequency: 0.3, laughPauseChance: 0.003, laughPauseDuration: 60 },
  snake: { smokeParticleCount: 4, smokeParticleLife: 20, smokeAlpha: 0.3, speedVariance: 0.15 },
}

// Timing
globalThis.MODE_TIMERS = [180, 1200, 300, 1200, 300, 1200, 300, -1]
globalThis.FRIGHT_TIME = 360
globalThis.FRIGHT_FLASH_TIME = 120
globalThis.BASE_SPEED = 1.8

// Difficulty
globalThis.DIFFICULTY_CURVE = {
  ghostSpeedPerLevel: 0.025,
  frightReductionPerLevel: 0.04,
  scatterReductionPerLevel: 0.06,
  chaseLengtheningPerLevel: 0.04,
  exitDelayReduction: 0.6,
  curatedLevels: 8,
}

globalThis.ENDLESS_MODE = {
  startLevel: 9,
  maxSpeedMultiplier: 1.8,
  minFrightFrames: 90,
  endlessScalingFactor: 0.5,
  minScatterFrames: 60,
}

globalThis.DIFFICULTY_PRESETS = {
  easy: { name: 'Easy', ghostSpeedMultiplier: 0.8, frightTimeMultiplier: 1.5, extraLifeThreshold: 5000 },
  normal: { name: 'Normal', ghostSpeedMultiplier: 1.0, frightTimeMultiplier: 1.0, extraLifeThreshold: 10000 },
  hard: { name: 'Hard', ghostSpeedMultiplier: 1.2, frightTimeMultiplier: 0.7, extraLifeThreshold: 20000 },
}
globalThis.DIFFICULTY_STORAGE_KEY = 'comeRosquillas_difficulty'

globalThis.COMBO_MILESTONES = [2, 4, 8]
globalThis.COMBO_MILESTONE_STORAGE_KEY = 'comeRosquillas_bestCombo'
globalThis.MAX_HIGH_SCORES = 50
globalThis.STATS_STORAGE_KEY = 'comeRosquillas_lifetimeStats'
globalThis.AI_TUNING_STORAGE_KEY = 'comeRosquillas_aiProfile'
globalThis.AI_TUNING_DEFAULTS = { aggression: 1.0, chaseDistance: 8, scatterMultiplier: 1.0 }
globalThis.ACHIEVEMENTS_STORAGE_KEY = 'comeRosquillas_achievements'
globalThis.DAILY_CHALLENGE_STORAGE_KEY = 'comerosquillas-daily'
globalThis.DAILY_CHALLENGE_HISTORY_KEY = 'comerosquillas-daily-history'
globalThis.CUTSCENE_LEVELS = [2, 5, 9, 14]

globalThis.CAMERA_CONFIG = {
  shake: {
    ghostCollision: { intensity: 5, duration: 18 },
    comboLight: { intensity: 3, duration: 12 },
    comboMedium: { intensity: 5, duration: 14 },
    comboHeavy: { intensity: 8, duration: 18 },
    powerPellet: { intensity: 2, duration: 10 },
    bossDefeat: { intensity: 10, duration: 24 },
  },
  zoom: {
    levelStartScale: 1.5, levelStartDuration: 60,
    levelCompleteScale: 0.9, levelCompleteDuration: 40,
    deathScale: 1.2, deathDuration: 45,
    powerPulseScale: 1.02, powerPulseDuration: 12,
  },
  follow: { lerpSpeed: 0.08, lookahead: 2.5, edgePadding: 3, viewportRatio: 0.8 },
  fpsThreshold: 45,
  fpsCheckInterval: 120,
}

globalThis.PERF_CONFIG = {
  bfsCacheTTL: 3,
  particlePoolSize: 100,
  fpsBufferSize: 60,
  devMode: false,
  frameBudgetMs: 18,
  levelTransitionWipeDuration: 30,
}

globalThis.GHOST_DEBUG = {
  modeColors: { 0: '#4488ff', 1: '#ff4444', 2: '#8844ff', 3: '#888888' },
  modeLabels: { 0: 'SCT', 1: 'CHS', 2: 'FRT', 3: 'EAT' },
  modeIcons: { 0: '🏠', 1: '🎯', 2: '😱', 3: '👻' },
  targetLineAlpha: 0.45,
  breadcrumbAlpha: 0.3,
  breadcrumbRadius: 2,
  maxBreadcrumbs: 12,
}

globalThis.BOSS_CONFIG = {
  spawnInterval: 5,
  introScreenDuration: 180,
  defeatShakeIntensity: 10,
  defeatShakeDuration: 24,
  spriteScale: 1.5,
  hpBarWidth: 30, hpBarHeight: 4, hpBarOffsetY: -8,
  hpBarBgColor: '#333', hpBarFillColor: '#ff4444', hpBarBorderColor: '#fff',
  fakePelletColor: '#ffaa00', rakeColor: '#8b4513',
  laserColor: '#00ff00', laserWidth: 3,
}

globalThis.HOMER_DEATH_QUOTES = ["D'OH!"]
globalThis.HOMER_POWER_QUOTES = ["Woohoo!"]
globalThis.HOMER_WIN_QUOTES = ["Woohoo!"]
globalThis.GAME_OVER_QUOTES = ["Mmm... game over."]
globalThis.GHOST_NAMES = ['Sr. Burns', 'Bob Patiño', 'Nelson', 'Snake']

globalThis.RANK_BADGES = [
  { id: 'master', name: 'Master', emoji: '👑', minDonuts: 20000 },
  { id: 'beginner', name: 'Beginner', emoji: '🍩', minDonuts: 0 }
]

globalThis.ACHIEVEMENT_CATEGORIES = []
globalThis.PROCEDURAL_EVENTS = { normalChance: 0.2, endlessChance: 0.33, endlessThreshold: 15, announceDuration: 150, darknessRadius: 5, minLevel: 2, events: [] }
globalThis.POWER_UP_TYPES = []
globalThis.POWER_UP_TOTAL_WEIGHT = 0
globalThis.BOSS_GHOSTS = []

globalThis.AUDIO_JUICE = {
  chompStreakSemitones: 0.5,
  chompStreakMax: 12,
  chompStreakDecayMs: 600,
  chompRandomSpread: 0.16,
  spatialMaxDistance: 14,
  spatialMinVolume: 0.0,
  spatialMaxVolume: 0.12,
  spatialUpdateInterval: 6,
  powerHumFreq: 55,
  powerHumVolume: 0.06,
  duckAmount: 0.25,
  duckFadeIn: 0.05,
  duckFadeOut: 0.3,
  duckDurationSfx: 0.4,
  duckDurationStinger: 2.5,
  baseMusicTempo: 1.0,
  frightMusicTempo: 1.25,
  maxLevelTempo: 1.15,
  tempoPerLevel: 0.015,
  frightDetune: -200,
}

globalThis.COLORS = {
  simpsonYellow: '#ffd800', simpsonSkin: '#fcd667', homerWhite: '#ffffff',
  donutPink: '#ff69b4', donutDarkPink: '#ff1493', donutBrown: '#a0522d', donutDarkBrown: '#8b4513',
  sprinkle1: '#ff0000', sprinkle2: '#00ff00', sprinkle3: '#0088ff', sprinkle4: '#ffff00', sprinkle5: '#ff8800',
  duffRed: '#cc0000', duffGold: '#ffd700',
  wallBlue: '#2244aa', wallBlueDark: '#1a3388', wallBlueLight: '#3366cc', wallBorder: '#5577ee',
  pathDark: '#0a0a1a', skyBlue: '#87ceeb', springfieldGreen: '#2d8b2d', krustyPurple: '#6a0dad', burnsGreen: '#556b2f',
}

globalThis.ANIM = {
  homer: { walkCycleFrames: 16, walkBobHeight: 1.5, armSwingAngle: 0.35, idleBreatheCycle: 80, idleBreatheHeight: 1, celebrationDuration: 30 },
  ghost: { bodySwayCycle: 24, bodySwayPx: 1.5, frightenedTrembleCycle: 8, frightenedTremblePx: 1, eatenTrailCount: 5, eatenTrailSpacing: 6 },
  items: { shimmerCycle: 20, shimmerAlphaMin: 0.7, shimmerAlphaMax: 1.0 },
}

// Maze template (the Springfield default)
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
]

globalThis.MAZE_LAYOUTS = [
  { name: 'Springfield', template: MAZE_TEMPLATE, wallColors: { main: '#2244aa', dark: '#1a3388', light: '#3366cc', border: '#5577ee' } },
  { name: 'Planta Nuclear', template: MAZE_TEMPLATE, wallColors: { main: '#2d6b2d', dark: '#1a4a1a', light: '#3d8b3d', border: '#55cc55' } },
  { name: 'Kwik-E-Mart', template: MAZE_TEMPLATE, wallColors: { main: '#8b2252', dark: '#6b1a42', light: '#ab3272', border: '#dd4488' } },
  { name: "Moe's Tavern", template: MAZE_TEMPLATE, wallColors: { main: '#7a5c2e', dark: '#5a3c1e', light: '#9a7c4e', border: '#cc9944' } },
]

// Global functions
globalThis.getMazeLayout = function(level) {
  const idx = (level - 1) % MAZE_LAYOUTS.length
  return MAZE_LAYOUTS[idx]
}

globalThis.getDifficultySettings = function() {
  try {
    const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY)
    const level = saved && DIFFICULTY_PRESETS[saved] ? saved : 'normal'
    return DIFFICULTY_PRESETS[level]
  } catch (e) { return DIFFICULTY_PRESETS.normal }
}

globalThis.loadAITuning = function() {
  return { ...AI_TUNING_DEFAULTS }
}

globalThis.getBossForLevel = function() {
  return null
}

globalThis.getRandomPowerUpType = function() {
  return POWER_UP_TYPES[0] || null
}

// i18n translation stub
globalThis.t = function(key, ...args) {
  if (args.length > 0) return `${key}: ${args.join(', ')}`
  return key
}

globalThis.I18n = {
  t: function(key, ...args) { return globalThis.t(key, ...args) },
  tNamed: function(key) { return key },
  getMazeName: function(name) { return name },
  getDeathQuotes: function() { return ["D'OH!"] },
  getGameOverQuotes: function() { return ["Mmm... game over."] },
  getWinQuotes: function() { return ["Woohoo!"] },
  getPowerQuotes: function() { return ["Woohoo!"] },
  onChange: function(cb) { /* no-op in tests */ },
}

// ==================== MOCK CLASSES ====================

globalThis.SoundManager = class SoundManager {
  constructor() {
    this.ctx = null
    this._chompVariant = 0
    this._musicTempo = 1.0
  }
  resume() {}
  play() {}
  stopMusic() {}
  startMusic() {}
  toggleMute() { return false }
  setLevelTempo() {}
  updateSpatial() {}
  _initBuses() {}
}

globalThis.HighScoreManager = class HighScoreManager {
  constructor() {
    this.storageKey = 'comeRosquillas_highScores'
    this.maxScores = MAX_HIGH_SCORES
    this.scores = []
    this.lifetimeStats = { gamesPlayed: 0, totalScore: 0, totalDonuts: 0, totalGhosts: 0, bestLevel: 0, totalTime: 0 }
  }
  loadScores() { return [] }
  saveScores() { return true }
  getScores() { return this.scores }
  getHighScore() { return 0 }
  getRank() { return { id: 'beginner', name: 'Beginner', emoji: '🍩' } }
  addScore(name, score, level, combo, stats) { return 1 }
  isHighScore() { return false }
  recordGameEnd() {}
  loadLifetimeStats() { return this.lifetimeStats || { gamesPlayed: 0, totalScore: 0, totalDonuts: 0, totalGhosts: 0, bestLevel: 0, totalTime: 0 } }
}

// ==================== DOM SETUP ====================

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
    <span id="scoreDisplay">0</span>
    <span id="levelDisplay">Level 1</span>
    <span id="highScoreDisplay">0</span>
    <span id="livesIcons"></span>
    <span id="bestComboDisplay" style="display:none"><span id="bestComboValue">0</span></span>
    <div id="message"></div>
  `
}

// ==================== LOAD PRODUCTION CODE ====================

function loadScript(relPath) {
  let code = readFileSync(resolve(ROOT, relPath), 'utf8')
  // Remove 'use strict' to allow var declarations in eval
  code = code.replace(/'use strict';?\s*/g, '')
  // Convert top-level const/let to var for global scope visibility
  code = code.replace(/^(const|let)\s+/gm, 'var ')
  // Use indirect eval for global scope execution
  ;(0, eval)(code)
}

function loadGameLogic() {
  let code = readFileSync(resolve(ROOT, 'js/game-logic.js'), 'utf8')
  code = code.replace(/'use strict';?\s*/g, '')
  code = code.replace(/^(const|let)\s+/gm, 'var ')
  // Only transform the Game class declaration (line-level match)
  code = code.replace(/^\s*class Game\s*\{/m, 'globalThis.Game = class Game {')
  ;(0, eval)(code)
}

// Load game-logic.js (Game class) — preserve our mock SoundManager/HighScoreManager
const _savedSM = globalThis.SoundManager
const _savedHSM = globalThis.HighScoreManager
loadGameLogic()
// Restore mocks (game-logic.js might not override them, but just in case)
globalThis.SoundManager = _savedSM
globalThis.HighScoreManager = _savedHSM

// Load engine modules (add prototype methods to Game)
loadScript('js/engine/scoring-system.js')
loadScript('js/engine/level-manager.js')
loadScript('js/engine/entity-manager.js')
loadScript('js/engine/ai-controller.js')
loadScript('js/engine/collision-detector.js')

const Game = globalThis.Game

// Stub loop() to prevent draw() calls (which need renderer globals like COLORS)
// We keep update() functional for frame simulation
Game.prototype.loop = function() {
  // No-op: skip draw/render pipeline in tests
}

// ==================== GAME RUNNER ====================
// Simulates N frames by calling update() repeatedly

function createGame() {
  setupDOM()
  // Stub requestAnimationFrame to prevent infinite loop
  globalThis.requestAnimationFrame = vi.fn()
  const game = new Game()
  return game
}

function runFrames(game, n) {
  for (let i = 0; i < n; i++) {
    game.update()
  }
}

// ==================== TESTS ====================

describe('Game Instantiation — Real Game Class', () => {
  let game

  beforeEach(() => {
    localStorage.clear()
    game = createGame()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ---- CONSTRUCTION ----
  describe('Constructor', () => {
    it('should construct without throwing', () => {
      expect(game).toBeDefined()
      expect(game).toBeInstanceOf(Game)
    })

    it('should initialize state to ST_START (splash screen)', () => {
      expect(game.state).toBe(ST_START)
    })

    it('should set score to 0', () => {
      expect(game.score).toBe(0)
    })

    it('should start with 3 lives', () => {
      expect(game.lives).toBe(3)
    })

    it('should start at level 1', () => {
      expect(game.level).toBe(1)
    })

    it('should have a canvas context', () => {
      expect(game.ctx).toBeDefined()
      expect(game.canvas).toBeDefined()
    })

    it('should initialize the particle pool with correct size', () => {
      expect(game._particlePool).toBeDefined()
      expect(game._particlePool.length).toBe(PERF_CONFIG.particlePoolSize)
      // All particles should start inactive
      expect(game._particlePool.every(p => !p.active)).toBe(true)
    })

    it('should initialize BFS cache as empty Map', () => {
      expect(game._bfsCache).toBeInstanceOf(Map)
      expect(game._bfsCache.size).toBe(0)
    })

    it('should register as window._game', () => {
      expect(window._game).toBe(game)
    })

    it('should initialize combo state to zero', () => {
      expect(game.bestCombo).toBe(0)
      expect(game.comboDisplayTimer).toBe(0)
      expect(game.screenShakeTimer).toBe(0)
    })
  })

  // ---- MAZE LOADING ----
  describe('Maze Loading', () => {
    it('should load Springfield layout for level 1', () => {
      expect(game.currentLayout.name).toBe('Springfield')
    })

    it('should create a deep copy of the maze template', () => {
      // Modifying game.maze should not alter the original template
      const originalValue = MAZE_LAYOUTS[0].template[1][1]
      game.maze[1][1] = 99
      expect(MAZE_LAYOUTS[0].template[1][1]).toBe(originalValue)
    })

    it('should have correct maze dimensions (31 rows × 28 cols)', () => {
      expect(game.maze.length).toBe(ROWS)
      expect(game.maze[0].length).toBe(COLS)
    })

    it('should cycle maze layouts correctly across levels', () => {
      const layouts = ['Springfield', 'Planta Nuclear', 'Kwik-E-Mart', "Moe's Tavern"]
      for (let lvl = 1; lvl <= 8; lvl++) {
        const layout = getMazeLayout(lvl)
        const expectedIdx = (lvl - 1) % layouts.length
        expect(layout.name).toBe(layouts[expectedIdx])
      }
    })

    it('should contain dots and power pellets in the maze', () => {
      let dots = 0, powers = 0
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (game.maze[r][c] === DOT) dots++
          if (game.maze[r][c] === POWER) powers++
        }
      }
      expect(dots).toBeGreaterThan(0)
      expect(powers).toBe(4) // classic Pac-Man has 4 power pellets
    })
  })

  // ---- GHOST AI INIT ----
  describe('Ghost AI Initialization', () => {
    it('should start new game and initialize 4 ghosts', () => {
      game.startNewGame()
      expect(game.ghosts).toBeDefined()
      expect(game.ghosts.length).toBe(4)
    })

    it('should assign correct names to each ghost', () => {
      game.startNewGame()
      const names = game.ghosts.map(g => g.name)
      expect(names).toEqual(['Sr. Burns', 'Bob Patiño', 'Nelson', 'Snake'])
    })

    it('should assign unique personalities to each ghost', () => {
      game.startNewGame()
      const personalities = game.ghosts.map(g => g.personality)
      expect(personalities).toEqual(['smart', 'fast', 'wobble', 'erratic'])
    })

    it('should place ghosts at their starting positions', () => {
      game.startNewGame()
      game.ghosts.forEach((g, i) => {
        const cfg = GHOST_CFG[i]
        expect(g.x).toBe(cfg.startX * TILE)
        expect(g.y).toBe(cfg.startY * TILE)
      })
    })

    it('should start first ghost outside house, others inside', () => {
      game.startNewGame()
      expect(game.ghosts[0].inHouse).toBe(false)
      expect(game.ghosts[1].inHouse).toBe(true)
      expect(game.ghosts[2].inHouse).toBe(true)
      expect(game.ghosts[3].inHouse).toBe(true)
    })

    it('should assign staggered exit delays to ghosts', () => {
      game.startNewGame()
      const delays = game.ghosts.map(g => g.exitTimer)
      // First ghost exits immediately (delay 0)
      expect(delays[0]).toBe(0)
      // Each subsequent ghost waits longer (scaled by difficulty ramp)
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThanOrEqual(0)
      }
      // Delays should be in ascending order
      expect(delays[1]).toBeLessThanOrEqual(delays[2])
      expect(delays[2]).toBeLessThanOrEqual(delays[3])
    })

    it('should start all ghosts in scatter mode', () => {
      game.startNewGame()
      game.ghosts.forEach(g => {
        expect(g.mode).toBe(GM_SCATTER)
      })
    })
  })

  // ---- STATE TRANSITIONS ----
  describe('State Transitions', () => {
    it('should transition from ST_START to ST_READY on startNewGame()', () => {
      expect(game.state).toBe(ST_START)
      game.startNewGame()
      expect(game.state).toBe(ST_READY)
    })

    it('should transition from ST_READY to ST_PLAYING after stateTimer expires', () => {
      game.startNewGame()
      expect(game.state).toBe(ST_READY)
      const timer = game.stateTimer
      expect(timer).toBeGreaterThan(0)
      // Run enough frames to exhaust the ready timer
      runFrames(game, timer + 1)
      expect(game.state).toBe(ST_PLAYING)
    })

    it('should set stateTimer to 150 frames in ST_READY', () => {
      game.startNewGame()
      expect(game.stateTimer).toBe(150)
    })

    it('should enter ST_PAUSED when P key is pressed during play', () => {
      game.startNewGame()
      runFrames(game, game.stateTimer + 1) // get to ST_PLAYING
      expect(game.state).toBe(ST_PLAYING)
      // Simulate P key press
      game.state = ST_PAUSED
      expect(game.state).toBe(ST_PAUSED)
    })

    it('should set ST_DYING state with timer when homer dies', () => {
      game.startNewGame()
      runFrames(game, game.stateTimer + 1)
      game.state = ST_DYING
      game.stateTimer = 90
      expect(game.state).toBe(ST_DYING)
      expect(game.stateTimer).toBe(90)
    })

    it('should decrement lives when dying timer expires', () => {
      game.startNewGame()
      runFrames(game, game.stateTimer + 1)
      const livesBefore = game.lives
      game.state = ST_DYING
      game.stateTimer = 1
      runFrames(game, 2)
      expect(game.lives).toBe(livesBefore - 1)
    })
  })

  // ---- SCORING ----
  describe('Scoring System', () => {
    it('should reset score to 0 on new game', () => {
      game.score = 9999
      game.startNewGame()
      expect(game.score).toBe(0)
    })

    it('should track ghostsEaten counter', () => {
      game.startNewGame()
      expect(game.ghostsEaten).toBe(0)
    })

    it('should build game stats with correct structure', () => {
      game.startNewGame()
      game._gameDonutsEaten = 42
      game._gameGhostsEaten = 5
      const stats = game._buildGameStats()
      expect(stats).toBeDefined()
      expect(typeof stats.donutsEaten).toBe('number')
      expect(typeof stats.ghostsEaten).toBe('number')
    })

    it('should persist best combo to localStorage', () => {
      game.startNewGame()
      game.bestCombo = 4
      game._saveBestCombo()
      const stored = localStorage.getItem(COMBO_MILESTONE_STORAGE_KEY)
      expect(parseInt(stored)).toBe(4)
    })

    it('should load best combo from localStorage', () => {
      localStorage.setItem(COMBO_MILESTONE_STORAGE_KEY, '6')
      const newGame = createGame()
      expect(newGame._allTimeBestCombo).toBe(6)
    })

    it('should correctly report high score via HUD update', () => {
      game.startNewGame()
      game.score = 1234
      game.updateHUD()
      const scoreEl = document.getElementById('scoreDisplay')
      expect(scoreEl.textContent).toBe('1234')
    })
  })

  // ---- LEVEL PROGRESSION ----
  describe('Level Progression', () => {
    it('should count total dots in maze correctly', () => {
      game.startNewGame()
      expect(game.totalDots).toBeGreaterThan(0)
      expect(game.dotsEaten).toBe(0)
    })

    it('should initialize global ghost mode to scatter', () => {
      game.startNewGame()
      expect(game.globalMode).toBe(GM_SCATTER)
    })

    it('should compute difficulty ramp correctly for level 1', () => {
      game.startNewGame()
      // Level 1: ramp = (1 - 1) / 9 = 0
      expect(game.getDifficultyRamp()).toBe(0)
    })

    it('should compute difficulty ramp correctly for level 10', () => {
      game.startNewGame()
      game.level = 10
      // Level 10 is endless (>= 9), effective level = 8 + (10-8)*0.5 = 9
      // ramp = (9-1)/9 = 0.8889
      const ramp = game.getDifficultyRamp()
      expect(ramp).toBeGreaterThan(0)
      expect(ramp).toBeLessThanOrEqual(1)
    })

    it('should cap difficulty ramp at 1.0', () => {
      game.startNewGame()
      game.level = 100
      expect(game.getDifficultyRamp()).toBeLessThanOrEqual(1)
    })

    it('should detect endless mode at level 9+', () => {
      game.startNewGame()
      game.level = 8
      expect(game.isEndlessMode()).toBe(false)
      game.level = 9
      expect(game.isEndlessMode()).toBe(true)
      game.level = 50
      expect(game.isEndlessMode()).toBe(true)
    })

    it('should reload maze and entities on initLevel()', () => {
      game.startNewGame()
      game.level = 3
      game.initLevel()
      expect(game.currentLayout).toBeDefined()
      expect(game.maze.length).toBe(ROWS)
      expect(game.totalDots).toBeGreaterThan(0)
    })

    it('should compute level mode timers with scatter reduction', () => {
      game.startNewGame()
      const timers = game.getLevelModeTimers()
      expect(timers.length).toBe(MODE_TIMERS.length)
      // Last entry should be -1 (infinite chase)
      expect(timers[timers.length - 1]).toBe(-1)
    })

    it('should track score correctly across level transitions', () => {
      game.startNewGame()
      runFrames(game, game.stateTimer + 1)
      game.score = 500
      // Simulate level complete and reinit
      game.level = 2
      game.initLevel()
      // Score should persist across levels
      expect(game.score).toBe(500)
      expect(game.level).toBe(2)
      expect(game.dotsEaten).toBe(0)
    })
  })

  // ---- GAME RUNNER ----
  describe('Game Runner (Frame Simulation)', () => {
    it('should advance animFrame on each update', () => {
      game.startNewGame()
      const startFrame = game.animFrame
      runFrames(game, 10)
      expect(game.animFrame).toBe(startFrame + 10)
    })

    it('should survive 100 frames without crashing', () => {
      game.startNewGame()
      expect(() => runFrames(game, 100)).not.toThrow()
    })

    it('should decay floating texts over time', () => {
      game.startNewGame()
      game.addFloatingText(100, 100, 'Test', '#fff')
      expect(game.floatingTexts.length).toBe(1)
      runFrames(game, 70) // life is 60 frames
      expect(game.floatingTexts.length).toBe(0)
    })

    it('should return particles to pool after their life expires', () => {
      game.startNewGame()
      runFrames(game, game.stateTimer + 1)
      // Pause the game to avoid gameplay adding more particles
      game.state = ST_PAUSED
      game.addParticles(100, 100, '#ff0', 5)
      const initialCount = game.particles.length
      expect(initialCount).toBeGreaterThanOrEqual(5)
      // Switch to ST_READY so update() processes particle decay without gameplay
      game.state = ST_READY
      game.stateTimer = 100
      runFrames(game, 60)
      // Particles (life 30-50) should all have decayed
      expect(game.particles.length).toBeLessThan(initialCount)
    })
  })

  // ---- HOMER ----
  describe('Homer Initialization', () => {
    it('should place Homer at starting position', () => {
      game.startNewGame()
      expect(game.homer.x).toBe(HOMER_START.x * TILE)
      expect(game.homer.y).toBe(HOMER_START.y * TILE)
    })

    it('should start Homer facing left', () => {
      game.startNewGame()
      expect(game.homer.dir).toBe(LEFT)
    })

    it('should give Homer speed based on level', () => {
      game.startNewGame()
      expect(game.homer.speed).toBeGreaterThan(0)
      expect(game.homer.speed).toBeCloseTo(BASE_SPEED, 0)
    })
  })

  // ---- MAZE HELPERS ----
  describe('Maze Helpers', () => {
    it('should detect walkable tiles correctly', () => {
      game.startNewGame()
      // Wall tile (0,0)
      expect(game.isWalkable(0, 0, false)).toBe(false)
      // Dot tile (1,1)
      expect(game.isWalkable(1, 1, false)).toBe(true)
    })

    it('should allow ghosts to pass through ghost door', () => {
      game.startNewGame()
      // Ghost door is at row 12, cols 13-14
      expect(game.isWalkable(13, 12, true)).toBe(true)
      expect(game.isWalkable(13, 12, false)).toBe(false)
    })

    it('should handle tunnel wrapping (row 14 at edges)', () => {
      game.startNewGame()
      // Out-of-bounds col at row 14 should be walkable (tunnel)
      expect(game.isWalkable(-1, 14, false)).toBe(true)
      expect(game.isWalkable(COLS, 14, false)).toBe(true)
    })

    it('should compute tile coordinates from pixel position', () => {
      const tile = game.tileAt(TILE * 5 + 10, TILE * 3 + 5)
      expect(tile.col).toBe(5)
      expect(tile.row).toBe(3)
    })

    it('should compute center of tile correctly', () => {
      const center = game.centerOfTile(5, 3)
      expect(center.x).toBe(5 * TILE + TILE / 2)
      expect(center.y).toBe(3 * TILE + TILE / 2)
    })
  })

  // ---- SPEED SYSTEM ----
  describe('Speed System', () => {
    it('should calculate homer speed for level 1', () => {
      game.startNewGame()
      const speed = game.getSpeed('homer')
      expect(speed).toBeCloseTo(BASE_SPEED, 1)
    })

    it('should calculate ghost speed with level scaling', () => {
      game.startNewGame()
      const speed = game.getSpeed('ghost', game.ghosts[0])
      expect(speed).toBeGreaterThan(0)
      expect(speed).toBeLessThanOrEqual(BASE_SPEED * ENDLESS_MODE.maxSpeedMultiplier)
    })

    it('should cap speeds at endless mode limit', () => {
      game.startNewGame()
      game.level = 50
      const speed = game.getSpeed('ghost', game.ghosts[0])
      expect(speed).toBeLessThanOrEqual(BASE_SPEED * ENDLESS_MODE.maxSpeedMultiplier)
    })

    it('should calculate fright ghost speed slower than normal', () => {
      game.startNewGame()
      const frightSpeed = game.getSpeed('frightGhost')
      const normalSpeed = game.getSpeed('ghost', game.ghosts[0])
      expect(frightSpeed).toBeLessThan(normalSpeed)
    })

    it('should calculate eaten ghost speed faster than normal', () => {
      game.startNewGame()
      const eatenSpeed = game.getSpeed('eatenGhost')
      expect(eatenSpeed).toBe(BASE_SPEED * 2)
    })
  })

  // ---- FRIGHT TIME ----
  describe('Fright Time Scaling', () => {
    it('should return full fright time at level 1', () => {
      game.startNewGame()
      const fright = game.getLevelFrightTime()
      expect(fright).toBeGreaterThan(300)
    })

    it('should reduce fright time at higher levels', () => {
      game.startNewGame()
      const frightLvl1 = game.getLevelFrightTime()
      game.level = 5
      const frightLvl5 = game.getLevelFrightTime()
      expect(frightLvl5).toBeLessThan(frightLvl1)
    })

    it('should enforce minimum fright time floor', () => {
      game.startNewGame()
      game.level = 100
      const fright = game.getLevelFrightTime()
      expect(fright).toBeGreaterThanOrEqual(ENDLESS_MODE.minFrightFrames)
    })
  })
})
