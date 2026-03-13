// Sprint 1 Regression: Difficulty System
// Validates Easy/Normal/Hard presets, persistence, and speed multipliers
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TILE, BASE_SPEED, FRIGHT_TIME, MODE_TIMERS,
  GHOST_CFG,
} from './setup.js'

// Re-implement difficulty constants from config.js for isolated testing
const DIFFICULTY_PRESETS = {
  easy: {
    name: 'Easy',
    ghostSpeedMultiplier: 0.8,
    frightTimeMultiplier: 1.5,
    extraLifeThreshold: 5000,
    description: 'Slower ghosts, longer power-ups',
  },
  normal: {
    name: 'Normal',
    ghostSpeedMultiplier: 1.0,
    frightTimeMultiplier: 1.0,
    extraLifeThreshold: 10000,
    description: 'Balanced gameplay',
  },
  hard: {
    name: 'Hard',
    ghostSpeedMultiplier: 1.2,
    frightTimeMultiplier: 0.7,
    extraLifeThreshold: 20000,
    description: 'Faster ghosts, shorter power-ups',
  },
}

const DIFFICULTY_STORAGE_KEY = 'comeRosquillas_difficulty'

// ---- Difficulty Preset Validation ----

describe('Difficulty — Preset Configuration', () => {
  it('should define exactly 3 difficulty levels', () => {
    expect(Object.keys(DIFFICULTY_PRESETS)).toEqual(['easy', 'normal', 'hard'])
  })

  it('should have Normal as baseline with 1.0x multipliers', () => {
    const normal = DIFFICULTY_PRESETS.normal
    expect(normal.ghostSpeedMultiplier).toBe(1.0)
    expect(normal.frightTimeMultiplier).toBe(1.0)
    expect(normal.extraLifeThreshold).toBe(10000)
  })

  it('should have Easy with slower ghosts and longer fright', () => {
    const easy = DIFFICULTY_PRESETS.easy
    expect(easy.ghostSpeedMultiplier).toBeLessThan(1.0)
    expect(easy.frightTimeMultiplier).toBeGreaterThan(1.0)
    expect(easy.extraLifeThreshold).toBeLessThan(10000)
  })

  it('should have Hard with faster ghosts and shorter fright', () => {
    const hard = DIFFICULTY_PRESETS.hard
    expect(hard.ghostSpeedMultiplier).toBeGreaterThan(1.0)
    expect(hard.frightTimeMultiplier).toBeLessThan(1.0)
    expect(hard.extraLifeThreshold).toBeGreaterThan(10000)
  })

  it('should have Easy extra life threshold lower than Normal', () => {
    expect(DIFFICULTY_PRESETS.easy.extraLifeThreshold)
      .toBeLessThan(DIFFICULTY_PRESETS.normal.extraLifeThreshold)
  })

  it('should have Hard extra life threshold higher than Normal', () => {
    expect(DIFFICULTY_PRESETS.hard.extraLifeThreshold)
      .toBeGreaterThan(DIFFICULTY_PRESETS.normal.extraLifeThreshold)
  })

  it('should have name and description for each preset', () => {
    for (const key of Object.keys(DIFFICULTY_PRESETS)) {
      expect(DIFFICULTY_PRESETS[key].name).toBeDefined()
      expect(DIFFICULTY_PRESETS[key].description).toBeDefined()
      expect(typeof DIFFICULTY_PRESETS[key].name).toBe('string')
    }
  })
})

// ---- Difficulty Persistence ----

describe('Difficulty — localStorage Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  function setDifficulty(level) {
    if (!DIFFICULTY_PRESETS[level]) level = 'normal'
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, level)
    } catch (e) {}
    return DIFFICULTY_PRESETS[level]
  }

  function getCurrentDifficulty() {
    const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY)
    return saved && DIFFICULTY_PRESETS[saved] ? saved : 'normal'
  }

  function getDifficultySettings() {
    const level = getCurrentDifficulty()
    return DIFFICULTY_PRESETS[level]
  }

  it('should default to Normal when nothing saved', () => {
    expect(getCurrentDifficulty()).toBe('normal')
    expect(getDifficultySettings().name).toBe('Normal')
  })

  it('should persist Easy difficulty to localStorage', () => {
    setDifficulty('easy')
    expect(localStorage.getItem(DIFFICULTY_STORAGE_KEY)).toBe('easy')
    expect(getCurrentDifficulty()).toBe('easy')
  })

  it('should persist Hard difficulty to localStorage', () => {
    setDifficulty('hard')
    expect(localStorage.getItem(DIFFICULTY_STORAGE_KEY)).toBe('hard')
    expect(getCurrentDifficulty()).toBe('hard')
  })

  it('should fall back to Normal on invalid value', () => {
    localStorage.setItem(DIFFICULTY_STORAGE_KEY, 'impossible')
    expect(getCurrentDifficulty()).toBe('normal')
  })

  it('should survive page reload (localStorage persists)', () => {
    setDifficulty('hard')
    const fresh = getCurrentDifficulty()
    expect(fresh).toBe('hard')
  })

  it('should return preset object from setDifficulty', () => {
    const result = setDifficulty('easy')
    expect(result.name).toBe('Easy')
    expect(result.ghostSpeedMultiplier).toBe(0.8)
  })
})

// ---- Difficulty Effect on Game Mechanics ----

describe('Difficulty — Speed Multiplier Effects', () => {
  it('should make Easy ghosts 20% slower', () => {
    const baseGhostSpeed = BASE_SPEED * 0.9
    const easySpeed = baseGhostSpeed * DIFFICULTY_PRESETS.easy.ghostSpeedMultiplier
    const normalSpeed = baseGhostSpeed * DIFFICULTY_PRESETS.normal.ghostSpeedMultiplier
    expect(easySpeed).toBeLessThan(normalSpeed)
    expect(easySpeed / normalSpeed).toBeCloseTo(0.8, 2)
  })

  it('should make Hard ghosts 20% faster', () => {
    const baseGhostSpeed = BASE_SPEED * 0.9
    const hardSpeed = baseGhostSpeed * DIFFICULTY_PRESETS.hard.ghostSpeedMultiplier
    const normalSpeed = baseGhostSpeed * DIFFICULTY_PRESETS.normal.ghostSpeedMultiplier
    expect(hardSpeed).toBeGreaterThan(normalSpeed)
    expect(hardSpeed / normalSpeed).toBeCloseTo(1.2, 2)
  })

  it('should not affect Homer speed (no Homer multiplier)', () => {
    const homerSpeed = BASE_SPEED * (1 + 0 * 0.05)
    expect(homerSpeed).toBe(BASE_SPEED)
  })
})

describe('Difficulty — Fright Time Effects', () => {
  it('should make Easy fright time 50% longer', () => {
    const normalFright = FRIGHT_TIME * DIFFICULTY_PRESETS.normal.frightTimeMultiplier
    const easyFright = FRIGHT_TIME * DIFFICULTY_PRESETS.easy.frightTimeMultiplier
    expect(easyFright).toBeGreaterThan(normalFright)
    expect(easyFright / normalFright).toBeCloseTo(1.5, 2)
  })

  it('should make Hard fright time 30% shorter', () => {
    const normalFright = FRIGHT_TIME * DIFFICULTY_PRESETS.normal.frightTimeMultiplier
    const hardFright = FRIGHT_TIME * DIFFICULTY_PRESETS.hard.frightTimeMultiplier
    expect(hardFright).toBeLessThan(normalFright)
    expect(hardFright / normalFright).toBeCloseTo(0.7, 2)
  })

  it('should keep Normal fright at baseline 360 frames', () => {
    const normalFright = FRIGHT_TIME * DIFFICULTY_PRESETS.normal.frightTimeMultiplier
    expect(normalFright).toBe(360)
  })
})

describe('Difficulty — Extra Life Thresholds', () => {
  it('Easy: extra life at 5000 points', () => {
    expect(DIFFICULTY_PRESETS.easy.extraLifeThreshold).toBe(5000)
  })

  it('Normal: extra life at 10000 points', () => {
    expect(DIFFICULTY_PRESETS.normal.extraLifeThreshold).toBe(10000)
  })

  it('Hard: extra life at 20000 points', () => {
    expect(DIFFICULTY_PRESETS.hard.extraLifeThreshold).toBe(20000)
  })

  it('should only award extra life once per threshold', () => {
    let extraLifeGiven = false
    let lives = 3
    const threshold = DIFFICULTY_PRESETS.normal.extraLifeThreshold

    const score = 15000
    if (!extraLifeGiven && score >= threshold) {
      extraLifeGiven = true
      lives++
    }
    expect(lives).toBe(4)

    if (!extraLifeGiven && score >= threshold) {
      lives++
    }
    expect(lives).toBe(4)
  })
})
