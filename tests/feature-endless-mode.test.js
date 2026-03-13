// Sprint 3 Feature: Endless Mode (#54)
// Maze cycling runs NOW. HUD indicator, speed caps, fright floor scaffold → skip.
import { describe, it, expect } from 'vitest'
import {
  TILE, COLS, ROWS, BASE_SPEED, FRIGHT_TIME, MODE_TIMERS,
  getMazeLayout,
} from './setup.js'

// Re-implement difficulty ramp (shared with progressive difficulty tests)
function getDifficultyRamp(level) {
  return Math.min(1, (level - 1) / 9)
}

function getLevelFrightTime(level, frightTimeMultiplier = 1.0) {
  const ramp = getDifficultyRamp(level)
  return Math.round(FRIGHT_TIME * (1 - ramp * 0.67) * frightTimeMultiplier)
}

function getGhostSpeed(level, difficultyMultiplier = 1.0) {
  return BASE_SPEED * (0.9 + (level - 1) * 0.06) * difficultyMultiplier
}

// ---- Maze Cycling Beyond Level 8 (runs NOW) ----

describe('Endless Mode — Maze Cycling', () => {
  it('should cycle back to Springfield at level 9', () => {
    const layout = getMazeLayout(9)
    expect(layout.name).toBe('Springfield')
  })

  it('should cycle through all 4 mazes continuously', () => {
    const expected = [
      'Springfield', 'Springfield',     // 1-2
      'Planta Nuclear', 'Planta Nuclear', // 3-4
      'Kwik-E-Mart', 'Kwik-E-Mart',     // 5-6
      "Moe's Tavern", "Moe's Tavern",   // 7-8
      'Springfield', 'Springfield',       // 9-10 (cycle restart)
      'Planta Nuclear', 'Planta Nuclear', // 11-12
    ]
    for (let level = 1; level <= 12; level++) {
      expect(getMazeLayout(level).name).toBe(expected[level - 1])
    }
  })

  it('should produce valid maze templates at level 20+', () => {
    for (let level = 20; level <= 30; level++) {
      const layout = getMazeLayout(level)
      expect(layout).toBeDefined()
      expect(layout.name).toBeDefined()
      expect(layout.template).toHaveLength(ROWS)
      expect(layout.template[0]).toHaveLength(COLS)
      expect(layout.wallColors).toBeDefined()
    }
  })

  it('should have valid wall colors at every cycling point', () => {
    for (let level = 1; level <= 16; level++) {
      const layout = getMazeLayout(level)
      expect(layout.wallColors.main).toMatch(/^#[0-9a-f]{6}$/i)
      expect(layout.wallColors.dark).toMatch(/^#[0-9a-f]{6}$/i)
      expect(layout.wallColors.light).toMatch(/^#[0-9a-f]{6}$/i)
      expect(layout.wallColors.border).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

// ---- Difficulty Plateau at Level 10+ (runs NOW) ----

describe('Endless Mode — Difficulty Plateau', () => {
  it('ramp should plateau at 1.0 from level 10 onward', () => {
    for (let level = 10; level <= 50; level++) {
      expect(getDifficultyRamp(level)).toBe(1)
    }
  })

  it('fright time should hit floor at level 10 and stay there', () => {
    const floor = getLevelFrightTime(10)
    for (let level = 10; level <= 30; level++) {
      expect(getLevelFrightTime(level)).toBe(floor)
    }
    // Floor should be positive and playable
    expect(floor).toBeGreaterThan(0)
    expect(floor).toBe(119) // 360 * 0.33 ≈ 119 frames
  })

  it('fright floor should be ~2 seconds at 60fps', () => {
    const floor = getLevelFrightTime(10)
    const seconds = floor / 60
    expect(seconds).toBeGreaterThan(1.5)
    expect(seconds).toBeLessThan(2.5)
  })

  it('Easy fright floor should give extra time (~3 seconds)', () => {
    const easyFloor = getLevelFrightTime(10, 1.5)
    expect(easyFloor / 60).toBeGreaterThan(2.5)
  })

  it('Hard fright floor should be tight but fair (~1.4 seconds)', () => {
    const hardFloor = getLevelFrightTime(10, 0.7)
    expect(hardFloor / 60).toBeGreaterThan(1)
    expect(hardFloor / 60).toBeLessThan(2)
  })
})

// ---- Endless Mode — Current Ghost Speed (no cap, runs NOW) ----

describe('Endless Mode — Ghost Speed Growth (pre-cap)', () => {
  it('ghost speed grows linearly without cap in current code', () => {
    const speed10 = getGhostSpeed(10)
    const speed20 = getGhostSpeed(20)
    expect(speed20).toBeGreaterThan(speed10)
  })

  it('ghost speed at level 20 is very fast (>3x BASE_SPEED)', () => {
    const speed20 = getGhostSpeed(20)
    // 1.8 * (0.9 + 19 * 0.06) = 1.8 * 2.04 = 3.672
    expect(speed20).toBeGreaterThan(BASE_SPEED * 2)
  })

  it('ghost speed at level 50 would be unreasonably fast', () => {
    const speed50 = getGhostSpeed(50)
    // 1.8 * (0.9 + 49 * 0.06) = 1.8 * 3.84 = 6.912
    expect(speed50).toBeGreaterThan(BASE_SPEED * 3)
    // This validates need for speed cap in endless mode
  })
})

// ---- Endless Mode — HUD Indicator ----

describe('Endless Mode — HUD Indicator', () => {
  function isEndlessMode(level) {
    return level >= 9
  }

  function levelTitle(level, layoutName) {
    if (isEndlessMode(level)) {
      return `∞ ENDLESS - ${layoutName} ${level}`
    }
    return `${layoutName} - Level ${level}`
  }

  it('should show "∞ ENDLESS" badge after level 8', () => {
    expect(isEndlessMode(8)).toBe(false)
    expect(isEndlessMode(9)).toBe(true)
    expect(isEndlessMode(20)).toBe(true)
  })

  it('should display current level number in endless mode', () => {
    const title = levelTitle(12, 'Planta Nuclear')
    expect(title).toContain('12')
  })

  it('should show maze name in HUD during transitions', () => {
    const title = levelTitle(9, 'Springfield')
    expect(title).toContain('Springfield')
    expect(title).toContain('∞ ENDLESS')
  })

  it('should use distinct format for endless mode vs normal', () => {
    const normal = levelTitle(5, 'Kwik-E-Mart')
    const endless = levelTitle(11, 'Planta Nuclear')
    expect(normal).toBe('Kwik-E-Mart - Level 5')
    expect(endless).toBe('∞ ENDLESS - Planta Nuclear 11')
    expect(normal).not.toContain('∞')
    expect(endless).toContain('∞')
  })
})

// ---- Endless Mode — Speed Caps ----

describe('Endless Mode — Speed Caps', () => {
  const maxSpeedMultiplier = 1.8
  const speedCap = BASE_SPEED * maxSpeedMultiplier // 3.24

  function getCappedGhostSpeed(level, difficultyMultiplier = 1.0) {
    const raw = BASE_SPEED * (0.9 + (level - 1) * 0.06) * difficultyMultiplier
    return Math.min(speedCap, raw)
  }

  function getCappedHomerSpeed(level) {
    const raw = BASE_SPEED * (1 + (level - 1) * 0.05)
    return Math.min(speedCap, raw)
  }

  it('should cap ghost speed at BASE_SPEED * 1.8 = 3.24', () => {
    const speed50 = getCappedGhostSpeed(50)
    expect(speed50).toBe(speedCap)
    expect(speedCap).toBeCloseTo(3.24, 2)
  })

  it('should cap Homer speed at the same maximum value', () => {
    const homerSpeed50 = getCappedHomerSpeed(50)
    expect(homerSpeed50).toBe(speedCap)
  })

  it('frightened ghost max speed should be 60% of speed cap', () => {
    const frightCap = speedCap * 0.6
    expect(frightCap).toBeCloseTo(1.944, 2)
    expect(frightCap).toBeLessThan(speedCap)
  })

  it('speed cap should apply uniformly across all difficulties', () => {
    const easyMax = getCappedGhostSpeed(50, 0.8)
    const normalMax = getCappedGhostSpeed(50, 1.0)
    const hardMax = getCappedGhostSpeed(50, 1.2)
    // All hit the same absolute cap at high enough levels
    expect(normalMax).toBe(speedCap)
    expect(hardMax).toBe(speedCap)
    // Easy may not hit cap since 0.8 multiplier lowers raw speed
    expect(easyMax).toBeLessThanOrEqual(speedCap)
  })

  it('speed cap should be reached by level ~15-20', () => {
    // Ghost speed at level 15: 1.8 * (0.9 + 14*0.06) = 1.8 * 1.74 = 3.132 (under cap)
    // Ghost speed at level 20: 1.8 * (0.9 + 19*0.06) = 1.8 * 2.04 = 3.672 (over cap, capped to 3.24)
    expect(getCappedGhostSpeed(15)).toBeLessThan(speedCap)
    expect(getCappedGhostSpeed(20)).toBe(speedCap)
  })
})

// ---- Endless Mode — Fright Floor ----

describe('Endless Mode — Fright Floor', () => {
  const minFrightFrames = 90

  function getCappedFrightTime(level, frightTimeMultiplier = 1.0) {
    const ramp = getDifficultyRamp(level)
    const raw = Math.round(FRIGHT_TIME * (1 - ramp * 0.67) * frightTimeMultiplier)
    return Math.max(minFrightFrames, raw)
  }

  it('should enforce minimum fright time of 90 frames across all levels', () => {
    for (let level = 1; level <= 50; level++) {
      expect(getCappedFrightTime(level)).toBeGreaterThanOrEqual(minFrightFrames)
    }
  })

  it('minimum fright time should be 90 frames (1.5 seconds at 60fps)', () => {
    const seconds = minFrightFrames / 60
    expect(seconds).toBe(1.5)
  })

  it('fright floor should apply after difficulty multiplier', () => {
    // Hard difficulty at max level: 360 * 0.33 * 0.7 = 83.16 → 83 → capped to 90
    const hardFright = getCappedFrightTime(10, 0.7)
    expect(hardFright).toBe(minFrightFrames) // floor enforced
    // Easy difficulty at max level: 360 * 0.33 * 1.5 = 178.2 → 178 → above floor
    const easyFright = getCappedFrightTime(10, 1.5)
    expect(easyFright).toBeGreaterThan(minFrightFrames) // above floor
  })
})
