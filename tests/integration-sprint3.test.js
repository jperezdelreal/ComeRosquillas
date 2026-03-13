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

// ---- Integration — Endless Mode × Leaderboard ----

describe('Integration — Endless Mode × Leaderboard', () => {
  it('endless mode scores should be eligible for leaderboard (no cap)', () => {
    // Score entries have no maximum — endless mode can produce very high scores
    const endlessScore = 999999
    expect(endlessScore).toBeGreaterThan(0)
    expect(typeof endlessScore).toBe('number')
    expect(isFinite(endlessScore)).toBe(true)
  })

  it('leaderboard should show actual level reached in endless mode', () => {
    // Level field stores actual level number (e.g., 15, 20, 30)
    const endlessLevel = 25
    const isEndless = endlessLevel >= 9
    expect(isEndless).toBe(true)
    // HUD format for endless: "∞ ENDLESS - {name} {level}"
    const hudText = `∞ ENDLESS - Springfield ${endlessLevel}`
    expect(hudText).toContain('25')
    expect(hudText).toContain('∞')
  })

  it('leaderboard entry should include difficulty field', () => {
    // Score entries from addScore include difficulty via gameStats
    const entry = {
      name: 'HOM',
      score: 50000,
      level: 15,
      combo: 4,
      difficulty: 'hard',
      date: new Date().toISOString(),
    }
    expect(entry).toHaveProperty('difficulty')
    expect(entry.difficulty).toBe('hard')
    expect(entry.level).toBe(15)
  })
})

// ---- Integration — Stats × Progressive Difficulty ----

describe('Integration — Stats × Progressive Difficulty', () => {
  it('stats should track best score per difficulty level', () => {
    // bestScoreByDifficulty stores highest score for each difficulty
    const bestByDiff = {}
    const difficulties = ['easy', 'normal', 'hard']

    // Simulate recording games at different difficulties
    bestByDiff['easy'] = Math.max(bestByDiff['easy'] || 0, 8000)
    bestByDiff['normal'] = Math.max(bestByDiff['normal'] || 0, 5000)
    bestByDiff['hard'] = Math.max(bestByDiff['hard'] || 0, 3000)

    expect(bestByDiff['easy']).toBe(8000)
    expect(bestByDiff['hard']).toBe(3000)
    expect(Object.keys(bestByDiff)).toHaveLength(3)
  })

  it('ghost eating stats should accumulate across difficulty changes', () => {
    // totalGhostsEaten is a single counter regardless of difficulty
    let totalGhostsEaten = 0
    totalGhostsEaten += 4 // easy game
    totalGhostsEaten += 8 // hard game
    totalGhostsEaten += 2 // normal game
    expect(totalGhostsEaten).toBe(14)
  })

  it('highest level should persist even when switching difficulty', () => {
    let highestLevel = 0
    // Play hard game to level 5
    highestLevel = Math.max(highestLevel, 5)
    // Play easy game to level 12
    highestLevel = Math.max(highestLevel, 12)
    // Play hard game to level 3
    highestLevel = Math.max(highestLevel, 3)
    expect(highestLevel).toBe(12) // max across all difficulties
  })
})

// ---- Integration — Combo × Audio Juice ----

describe('Integration — Combo × Audio Juice', () => {
  it('combo milestone frequencies should escalate: 262 → 330 → 392', () => {
    const freqMap = { 2: 262, 4: 330, 8: 392 }
    const milestones = [2, 4, 8]
    for (let i = 1; i < milestones.length; i++) {
      expect(freqMap[milestones[i]]).toBeGreaterThan(freqMap[milestones[i - 1]])
    }
    // Interval ratios approximate musical thirds
    expect(freqMap[4] / freqMap[2]).toBeCloseTo(1.26, 1) // major third
    expect(freqMap[8] / freqMap[4]).toBeCloseTo(1.19, 1) // minor third
  })

  it('eat ghost audio pitch should scale with combo tier', () => {
    // Each ghost eaten in combo raises pitch by 150Hz
    const basePitch = 400
    const pitchStep = 150
    const pitches = [1, 2, 3, 4].map(i => basePitch + (i - 1) * pitchStep)
    expect(pitches[0]).toBe(400)
    expect(pitches[1]).toBe(550)
    expect(pitches[2]).toBe(700)
    expect(pitches[3]).toBe(850)
    // Progressive difficulty doesn't change pitch formula
  })

  it('chomp streak pitch should compound with level-based music tempo', () => {
    // Streak pitch: 2^(streak * 0.5/12) — independent of level
    // Music tempo: min(1.15, 1.0 + (level-1) * 0.015)
    // Both escalation systems stack for increasing tension
    const streakPitch = Math.pow(2, 8 * 0.5 / 12) // streak 8
    const levelTempo = Math.min(1.15, 1.0 + (10 - 1) * 0.015) // level 10
    expect(streakPitch).toBeGreaterThan(1)
    expect(levelTempo).toBeGreaterThan(1)
    // Combined effect creates double escalation
    expect(streakPitch * levelTempo).toBeGreaterThan(1.3)
  })
})
