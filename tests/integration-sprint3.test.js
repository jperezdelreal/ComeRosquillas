// Sprint 3: Cross-Feature Integration Tests
// Progressive Difficulty × Combo, Endless × Leaderboard, Difficulty × Maze
import { describe, it, expect } from 'vitest'
import {
  BASE_SPEED, FRIGHT_TIME, MODE_TIMERS,
  GHOST_CFG,
  getMazeLayout,
} from './setup.js'

// Shared helpers
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
  const multiplier = Math.min(8, Math.pow(2, ghostsEaten - 1))
  return 200 * multiplier
}

// ---- Progressive Difficulty × Combo (runs NOW) ----

describe('Integration — Progressive Difficulty × Combo', () => {
  it('combo window shrinks at higher levels (less time for 4-ghost chain)', () => {
    const fright1 = getLevelFrightTime(1)  // 360 frames
    const fright10 = getLevelFrightTime(10) // ~119 frames
    expect(fright1 / 60).toBe(6) // 6 seconds at level 1
    expect(fright10 / 60).toBeLessThan(2.5) // <2.5 seconds at level 10
    // 4 ghosts in 2 seconds is extremely hard — by design
  })

  it('full 4-ghost combo gives 3000 pts at any level', () => {
    const total = comboScore(1) + comboScore(2) + comboScore(3) + comboScore(4)
    expect(total).toBe(3000)
    // Points don't change with level — only the available window
  })

  it('Easy difficulty gives 9-second combo window at level 1', () => {
    const easyFright = getLevelFrightTime(1, 1.5)
    expect(easyFright / 60).toBe(9)
  })

  it('Hard difficulty gives 4.2-second combo window at level 1', () => {
    const hardFright = getLevelFrightTime(1, 0.7)
    expect(hardFright / 60).toBeCloseTo(4.2, 1)
  })

  it('Easy difficulty at level 10 still allows 3-second combos', () => {
    const easyFright10 = getLevelFrightTime(10, 1.5)
    expect(easyFright10 / 60).toBeGreaterThan(2.5)
  })

  it('Hard difficulty at level 10 makes 4-ghost combo nearly impossible', () => {
    const hardFright10 = getLevelFrightTime(10, 0.7)
    expect(hardFright10 / 60).toBeLessThan(1.5) // ~1.4 seconds
  })
})

// ---- Ghost Speed × Difficulty Level (runs NOW) ----

describe('Integration — Ghost Speed Across Levels & Difficulties', () => {
  it('Easy ghosts at level 1 should be manageable', () => {
    const easyGhost = getGhostSpeed(1, 0.8)
    const homer = BASE_SPEED
    expect(easyGhost).toBeLessThan(homer) // Homer faster than easy ghosts
  })

  it('Hard ghosts at level 5 should outpace Homer', () => {
    const hardGhost = getGhostSpeed(5, 1.2)
    const homer = BASE_SPEED * (1 + (5 - 1) * 0.05) // 2.16
    // Ghost: 1.8 * (0.9 + 0.24) * 1.2 = 2.4624
    expect(hardGhost).toBeGreaterThan(homer)
  })

  it('Normal ghosts at level 1 should be slower than Homer', () => {
    const normalGhost = getGhostSpeed(1, 1.0) // 1.62
    const homer = BASE_SPEED // 1.8
    expect(normalGhost).toBeLessThan(homer)
  })

  it('all 4 ghost personalities have same base speed (before bonuses)', () => {
    const baseSpeed = getGhostSpeed(5)
    // Bob Patiño gets a ramp-based bonus, Snake gets random variance
    // But the base formula is identical
    expect(baseSpeed).toBeCloseTo(BASE_SPEED * (0.9 + 4 * 0.06), 5)
  })
})

// ---- Maze × Progressive Difficulty (runs NOW) ----

describe('Integration — Maze Cycling × Difficulty', () => {
  it('each maze should be playable at its difficulty tier', () => {
    // Maze 1-2 (Springfield) at levels 1-2: low ramp
    // Maze 3-4 (Nuclear Plant) at levels 3-4: moderate ramp
    // Maze 5-6 (Kwik-E-Mart) at levels 5-6: high ramp
    // Maze 7-8 (Moe's) at levels 7-8: near-max ramp
    const ramps = [1, 3, 5, 7].map(getDifficultyRamp)
    expect(ramps[0]).toBe(0) // Springfield = no ramp
    expect(ramps[1]).toBeGreaterThan(0.2) // Nuclear Plant = some
    expect(ramps[2]).toBeGreaterThan(0.4) // Kwik-E-Mart = moderate
    expect(ramps[3]).toBeGreaterThan(0.6) // Moe's = tough
  })

  it('second cycle mazes (9-16) face max difficulty', () => {
    for (let level = 10; level <= 16; level++) {
      expect(getDifficultyRamp(level)).toBe(1)
    }
  })

  it('maze cycling produces 4 distinct mazes', () => {
    const names = new Set()
    for (let level = 1; level <= 8; level++) {
      names.add(getMazeLayout(level).name)
    }
    expect(names.size).toBe(4)
  })

  it('second cycle uses same maze names as first cycle', () => {
    for (let level = 1; level <= 8; level++) {
      expect(getMazeLayout(level).name).toBe(getMazeLayout(level + 8).name)
    }
  })
})

// ---- Mode Timers × Level (runs NOW) ----

describe('Integration — Mode Timers × Level Progression', () => {
  function getLevelModeTimers(level) {
    const ramp = getDifficultyRamp(level)
    return MODE_TIMERS.map((t, i) => {
      if (t < 0) return t
      if (i % 2 === 0) return Math.round(t * (1 - ramp * 0.5))
      return Math.round(t * (1 + ramp * 0.3))
    })
  }

  it('level 1: scatter/chase ratio favors scatter (safety)', () => {
    const timers = getLevelModeTimers(1)
    // First scatter: 180 frames (3s), first chase: 1200 frames (20s)
    expect(timers[0]).toBe(180)
    expect(timers[1]).toBe(1200)
  })

  it('level 10: scatter/chase ratio favors chase (pressure)', () => {
    const timers = getLevelModeTimers(10)
    expect(timers[0]).toBe(90)  // Scatter halved
    expect(timers[1]).toBe(1560) // Chase +30%
    expect(timers[1] / timers[0]).toBeGreaterThan(15) // Heavy chase
  })

  it('total cycle time per scatter-chase pair changes with level', () => {
    const timers1 = getLevelModeTimers(1)
    const timers10 = getLevelModeTimers(10)
    const pair1 = timers1[0] + timers1[1] // 180 + 1200 = 1380
    const pair10 = timers10[0] + timers10[1] // 90 + 1560 = 1650
    expect(pair10).toBeGreaterThan(pair1) // Total cycle gets longer
  })
})

// ---- Sprint 3 Scaffold: Endless × Leaderboard (skip) ----

describe.skip('Integration — Endless Mode × Leaderboard', () => {
  it('endless mode scores should be eligible for leaderboard', () => {
    // No score cap — endless mode can produce very high scores
  })

  it('leaderboard should show level reached in endless mode', () => {
    // Level field should display actual level (e.g., 15, 20, 30)
  })

  it('leaderboard should distinguish normal vs endless scores', () => {
    // Optional: badge or indicator for scores from level 9+
  })
})

// ---- Sprint 3 Scaffold: Stats × Progressive Difficulty (skip) ----

describe.skip('Integration — Stats × Progressive Difficulty', () => {
  it('stats should track highest level accounting for difficulty', () => {
    // Level 10 on Hard should be more impressive than level 10 on Easy
  })

  it('ghost eating stats should accumulate across difficulty changes', () => {
    // If player switches difficulty, total ghosts eaten still counts
  })
})

// ---- Sprint 3 Scaffold: Combo × Audio Juice (skip) ----

describe.skip('Integration — Combo × Audio Juice', () => {
  it('combo milestone audio should escalate with progressive difficulty', () => {
    // Higher level + higher combo = more dramatic audio
  })

  it('eat ghost audio pitch should scale with combo AND level ramp', () => {
    // Double escalation factor
  })
})
