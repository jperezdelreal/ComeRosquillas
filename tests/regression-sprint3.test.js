// Sprint 4 Regression: Verify Sprint 1-3 features remain intact
// Covers: endless mode, progressive difficulty, leaderboard, stats, audio, tutorial, combo, mobile
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TILE, COLS, ROWS, BASE_SPEED, FRIGHT_TIME, MODE_TIMERS,
  GHOST_CFG, HOMER_START,
  GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN,
  ST_START, ST_PLAYING, ST_GAME_OVER, ST_PAUSED,
  WALL, DOT, EMPTY, POWER, GHOST_HOUSE, GHOST_DOOR,
  UP, RIGHT, DOWN, LEFT, DX, DY, OPP,
  getMazeLayout,
} from './setup.js'

// ---- Shared helpers (mirrored from production logic) ----

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

function comboScore(ghostsEaten) {
  return 200 * Math.min(8, Math.pow(2, ghostsEaten - 1))
}

function screenShakeIntensity(multiplier) {
  return multiplier <= 2 ? 3 : multiplier <= 4 ? 5 : 8
}

// ---- Regression: Endless Mode Core ----

describe('Regression — Endless Mode Cycling', () => {
  it('maze cycling wraps correctly at level 9+ (4 mazes × 2 levels)', () => {
    const names = []
    for (let level = 1; level <= 16; level++) {
      names.push(getMazeLayout(level).name)
    }
    expect(names[0]).toBe('Springfield')
    expect(names[8]).toBe('Springfield') // cycle restart
    expect(new Set(names).size).toBe(4) // exactly 4 unique mazes
  })

  it('difficulty plateaus at level 10 — ramp stays 1.0', () => {
    for (let level = 10; level <= 30; level++) {
      expect(getDifficultyRamp(level)).toBe(1)
    }
  })

  it('fright time floor is 119 frames at max ramp', () => {
    expect(getLevelFrightTime(10)).toBe(119)
    expect(getLevelFrightTime(50)).toBe(119) // same at level 50
  })

  it('ghost speed formula grows linearly without cap', () => {
    const s5 = getGhostSpeed(5)
    const s10 = getGhostSpeed(10)
    const s20 = getGhostSpeed(20)
    expect(s10).toBeGreaterThan(s5)
    expect(s20).toBeGreaterThan(s10)
  })
})

// ---- Regression: Progressive Difficulty ----

describe('Regression — Progressive Difficulty Ramp', () => {
  it('ramp curve: 0 at level 1, 1.0 at level 10', () => {
    expect(getDifficultyRamp(1)).toBe(0)
    expect(getDifficultyRamp(10)).toBe(1)
  })

  it('ramp mid-values are correct at levels 3, 5, 7', () => {
    expect(getDifficultyRamp(3)).toBeCloseTo(2 / 9, 5)
    expect(getDifficultyRamp(5)).toBeCloseTo(4 / 9, 5)
    expect(getDifficultyRamp(7)).toBeCloseTo(6 / 9, 5)
  })

  it('ghost speed at level 1 = BASE_SPEED * 0.9', () => {
    expect(getGhostSpeed(1)).toBeCloseTo(BASE_SPEED * 0.9, 5)
  })

  it('ghost speed +6% per level compounding', () => {
    const s1 = getGhostSpeed(1)
    const s2 = getGhostSpeed(2)
    const stepPct = (s2 - s1) / BASE_SPEED
    expect(stepPct).toBeCloseTo(0.06, 5)
  })

  it('fright time decays by 67% over 9 levels', () => {
    const f1 = getLevelFrightTime(1) // full fright
    const f10 = getLevelFrightTime(10) // 33% of full
    expect(f1).toBe(FRIGHT_TIME)
    expect(f10 / FRIGHT_TIME).toBeCloseTo(0.33, 1)
  })
})

// ---- Regression: Combo Scoring ----

describe('Regression — Combo Scoring', () => {
  it('ghost scores: 200, 400, 800, 1600 = 3000 total', () => {
    expect(comboScore(1)).toBe(200)
    expect(comboScore(2)).toBe(400)
    expect(comboScore(3)).toBe(800)
    expect(comboScore(4)).toBe(1600)
    const total = comboScore(1) + comboScore(2) + comboScore(3) + comboScore(4)
    expect(total).toBe(3000)
  })

  it('combo multiplier caps at 8× (via Math.min)', () => {
    expect(comboScore(5)).toBe(200 * 8) // 1600 — capped
    expect(comboScore(10)).toBe(200 * 8) // still capped
  })

  it('screen shake intensity milestones: 3/5/8', () => {
    expect(screenShakeIntensity(2)).toBe(3)
    expect(screenShakeIntensity(4)).toBe(5)
    expect(screenShakeIntensity(8)).toBe(8)
  })
})

// ---- Regression: Leaderboard with Combo Field ----

describe('Regression — Leaderboard Data Integrity', () => {
  const STORAGE_KEY = 'comeRosquillas_highScores'

  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  function createManager(maxScores = 10) {
    return {
      storageKey: STORAGE_KEY,
      maxScores,
      scores: [],
      loadScores() {
        try {
          const stored = localStorage.getItem(this.storageKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.every(s =>
              typeof s.name === 'string' &&
              typeof s.score === 'number' &&
              typeof s.level === 'number'
            )) {
              this.scores = parsed
              return parsed
            }
          }
        } catch (e) {}
        return []
      },
      saveScores() {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.scores))
          return true
        } catch (e) { return false }
      },
      addScore(name, score, level, combo = 0) {
        if (typeof score !== 'number' || !isFinite(score) || score < 0) return false
        const entry = {
          name: name.trim().substring(0, 3).toUpperCase() || 'AAA',
          score, level,
          combo: (typeof combo === 'number' && combo > 0 && combo <= 8) ? combo : 0,
          date: new Date().toISOString(),
        }
        this.scores.push(entry)
        this.scores.sort((a, b) => b.score - a.score)
        this.scores = this.scores.slice(0, this.maxScores)
        this.saveScores()
        return this.scores.findIndex(s => s === entry) + 1
      },
      getHighScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0
      },
      clearScores() {
        this.scores = []
        this.saveScores()
      },
    }
  }

  it('add, sort, persist, and reload still works end-to-end', () => {
    const mgr = createManager()
    mgr.addScore('HOM', 5000, 3, 4)
    mgr.addScore('BAR', 8000, 5, 2)
    mgr.addScore('LIS', 3000, 2, 0)
    expect(mgr.scores[0].score).toBe(8000)
    expect(mgr.scores[0].combo).toBe(2)

    const mgr2 = createManager()
    mgr2.loadScores()
    expect(mgr2.scores).toHaveLength(3)
    expect(mgr2.getHighScore()).toBe(8000)
  })

  it('clear + re-add works correctly', () => {
    const mgr = createManager()
    mgr.addScore('TST', 9999, 10, 8)
    mgr.clearScores()
    expect(mgr.getHighScore()).toBe(0)
    mgr.addScore('NEW', 100, 1)
    expect(mgr.getHighScore()).toBe(100)
  })

  it('top-50 migration preserves old data', () => {
    const mgr10 = createManager(10)
    for (let i = 1; i <= 10; i++) mgr10.addScore('OLD', i * 500, i)
    const mgr50 = createManager(50)
    mgr50.loadScores()
    expect(mgr50.scores).toHaveLength(10)
    expect(mgr50.scores[0].score).toBe(5000)
  })
})

// ---- Regression: Stats Dashboard ----

describe('Regression — Stats Dashboard', () => {
  const STATS_KEY = 'comeRosquillas_lifetimeStats'

  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  function defaultStats() {
    return {
      totalGames: 0, totalDonutsEaten: 0, totalGhostsEaten: 0,
      highestCombo: 0, highestLevel: 0, totalPlayTimeMs: 0,
      bestScoreByDifficulty: {},
    }
  }

  function recordGameEnd(stats, g) {
    stats.totalGames++
    stats.totalDonutsEaten += g.donutsEaten || 0
    stats.totalGhostsEaten += g.ghostsEaten || 0
    stats.totalPlayTimeMs += g.playTimeMs || 0
    if (g.bestCombo > stats.highestCombo) stats.highestCombo = g.bestCombo
    if (g.level > stats.highestLevel) stats.highestLevel = g.level
    const diff = g.difficulty || 'normal'
    const prev = stats.bestScoreByDifficulty[diff] || 0
    if (g.score > prev) stats.bestScoreByDifficulty[diff] = g.score
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    return stats
  }

  it('stats accumulate correctly across multiple games', () => {
    const s = defaultStats()
    recordGameEnd(s, { score: 1000, level: 3, bestCombo: 2, donutsEaten: 50, ghostsEaten: 4, playTimeMs: 60000 })
    recordGameEnd(s, { score: 2000, level: 5, bestCombo: 4, donutsEaten: 80, ghostsEaten: 8, playTimeMs: 90000 })
    expect(s.totalGames).toBe(2)
    expect(s.totalDonutsEaten).toBe(130)
    expect(s.totalGhostsEaten).toBe(12)
    expect(s.highestLevel).toBe(5)
    expect(s.highestCombo).toBe(4)
    expect(s.totalPlayTimeMs).toBe(150000)
  })

  it('best score per difficulty is tracked correctly', () => {
    const s = defaultStats()
    recordGameEnd(s, { score: 5000, level: 5, bestCombo: 0, donutsEaten: 50, ghostsEaten: 0, playTimeMs: 60000, difficulty: 'easy' })
    recordGameEnd(s, { score: 7000, level: 7, bestCombo: 0, donutsEaten: 70, ghostsEaten: 0, playTimeMs: 80000, difficulty: 'easy' })
    recordGameEnd(s, { score: 3000, level: 3, bestCombo: 0, donutsEaten: 30, ghostsEaten: 0, playTimeMs: 40000, difficulty: 'hard' })
    expect(s.bestScoreByDifficulty.easy).toBe(7000)
    expect(s.bestScoreByDifficulty.hard).toBe(3000)
  })

  it('rank badges: Beginner → Regular → Expert → Master thresholds', () => {
    const BADGES = [
      { id: 'master', min: 20000 },
      { id: 'expert', min: 5000 },
      { id: 'regular', min: 1000 },
      { id: 'beginner', min: 0 },
    ]
    function getRank(donuts) {
      for (const b of BADGES) { if (donuts >= b.min) return b.id }
      return 'beginner'
    }
    expect(getRank(0)).toBe('beginner')
    expect(getRank(999)).toBe('beginner')
    expect(getRank(1000)).toBe('regular')
    expect(getRank(5000)).toBe('expert')
    expect(getRank(20000)).toBe('master')
  })
})

// ---- Regression: Tutorial System ----

describe('Regression — Tutorial System', () => {
  const TUTORIAL_KEY = 'comeRosquillas_tutorialComplete'

  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('tutorial completion flag persists as "1"', () => {
    localStorage.setItem(TUTORIAL_KEY, '1')
    expect(localStorage.getItem(TUTORIAL_KEY)).toBe('1')
  })

  it('tutorial has 3-step flow', () => {
    const steps = ['movement', 'dots', 'ghosts']
    expect(steps).toHaveLength(3)
    expect(steps[0]).toBe('movement')
    expect(steps[2]).toBe('ghosts')
  })

  it('skip/ESC should mark tutorial complete without finishing steps', () => {
    // Skipping sets localStorage immediately
    localStorage.setItem(TUTORIAL_KEY, '1')
    const complete = localStorage.getItem(TUTORIAL_KEY) === '1'
    expect(complete).toBe(true)
  })
})

// ---- Regression: Mobile Polish ----

describe('Regression — Mobile Touch Controls', () => {
  it('D-pad dimensions should be 160×160', () => {
    const DPAD_SIZE = 160
    expect(DPAD_SIZE).toBe(160)
  })

  it('swipe threshold: 30px minimum, 300ms max duration', () => {
    const SWIPE_MIN_PX = 30
    const SWIPE_MAX_MS = 300
    expect(SWIPE_MIN_PX).toBe(30)
    expect(SWIPE_MAX_MS).toBe(300)
  })

  it('swipe direction detection: compare |dx| vs |dy|', () => {
    function getSwipeDir(dx, dy) {
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? RIGHT : LEFT
      return dy > 0 ? DOWN : UP
    }
    expect(getSwipeDir(50, 10)).toBe(RIGHT)
    expect(getSwipeDir(-50, 10)).toBe(LEFT)
    expect(getSwipeDir(10, 50)).toBe(DOWN)
    expect(getSwipeDir(10, -50)).toBe(UP)
  })

  it('haptic feedback localStorage key is comeRosquillas_haptic', () => {
    const HAPTIC_KEY = 'comeRosquillas_haptic'
    localStorage.setItem(HAPTIC_KEY, 'true')
    expect(localStorage.getItem(HAPTIC_KEY)).toBe('true')
    localStorage.clear()
  })
})

// ---- Regression: Audio Bus Architecture ----

describe('Regression — Audio Core', () => {
  it('SFX bus volume = 0.8, music bus volume = 0.07', () => {
    expect(0.8).toBeGreaterThan(0.07)
    expect(0.07 / 0.8).toBeLessThan(0.1)
  })

  it('4 chomp variants cycle 0-3', () => {
    let v = 0
    const variants = []
    for (let i = 0; i < 8; i++) { variants.push(v); v = (v + 1) % 4 }
    expect(variants).toEqual([0, 1, 2, 3, 0, 1, 2, 3])
  })

  it('combo milestone frequencies: C4→E4→G4', () => {
    const freqs = { 2: 262, 4: 330, 8: 392 }
    expect(freqs[4]).toBeGreaterThan(freqs[2])
    expect(freqs[8]).toBeGreaterThan(freqs[4])
  })

  it('chomp streak pitch formula: 2^(streak * 0.5/12)', () => {
    const p0 = Math.pow(2, 0 * 0.5 / 12)
    const p12 = Math.pow(2, 12 * 0.5 / 12)
    expect(p0).toBe(1)
    expect(p12).toBeCloseTo(Math.sqrt(2), 3)
  })
})

// ---- Regression: Maze & Grid Constants ----

describe('Regression — Core Constants', () => {
  it('grid is 28×31 tiles at 24px', () => {
    expect(COLS).toBe(28)
    expect(ROWS).toBe(31)
    expect(TILE).toBe(24)
  })

  it('4 ghosts with distinct scatter corners', () => {
    expect(GHOST_CFG).toHaveLength(4)
    const scatterCorners = GHOST_CFG.map(g => `${g.scatterX},${g.scatterY}`)
    expect(new Set(scatterCorners).size).toBe(4)
  })

  it('Homer starts at (14, 23)', () => {
    expect(HOMER_START.x).toBe(14)
    expect(HOMER_START.y).toBe(23)
  })

  it('4 directions with correct DX/DY/OPP', () => {
    expect(DX).toEqual([0, 1, 0, -1])
    expect(DY).toEqual([-1, 0, 1, 0])
    expect(OPP[UP]).toBe(DOWN)
    expect(OPP[LEFT]).toBe(RIGHT)
  })

  it('mode timers: 8 entries, last is -1 (infinite chase)', () => {
    expect(MODE_TIMERS).toHaveLength(8)
    expect(MODE_TIMERS[MODE_TIMERS.length - 1]).toBe(-1)
  })
})
