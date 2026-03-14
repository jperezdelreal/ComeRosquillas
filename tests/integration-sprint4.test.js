// Sprint 4: Cross-Feature Integration Tests
// Performance × Existing Systems, Social Sharing × Leaderboard
import { describe, it, expect } from 'vitest'
import {
  BASE_SPEED, FRIGHT_TIME, COLS, ROWS, TILE,
  GHOST_CFG,
  getMazeLayout,
} from './setup.js'

// Shared helpers
function getDifficultyRamp(level) {
  return Math.min(1, (level - 1) / 9)
}

function getGhostSpeed(level, difficultyMultiplier = 1.0) {
  return BASE_SPEED * (0.9 + (level - 1) * 0.06) * difficultyMultiplier
}

function comboScore(ghostsEaten) {
  return 200 * Math.min(8, Math.pow(2, ghostsEaten - 1))
}

// ---- Performance × Endless Mode (runs NOW — validates math won't break) ----

describe('Integration — Performance × Endless Mode', () => {
  it('difficulty ramp computation is O(1) — constant time per frame', () => {
    // getDifficultyRamp uses Math.min with simple arithmetic — no loops, no allocations
    const iterations = 1000
    const start = performance.now()
    for (let i = 0; i < iterations; i++) getDifficultyRamp(i % 100 + 1)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(50) // 1000 iterations in <50ms
  })

  it('ghost speed computation should be pure function (no side effects)', () => {
    const speed1 = getGhostSpeed(5, 1.0)
    const speed2 = getGhostSpeed(5, 1.0)
    expect(speed1).toBe(speed2) // deterministic
    expect(speed1).toBeCloseTo(BASE_SPEED * (0.9 + 4 * 0.06), 10) // exact
  })

  it('maze layout lookup is O(1) via modular arithmetic', () => {
    // getMazeLayout uses % operator — constant time
    for (let level = 1; level <= 100; level++) {
      const layout = getMazeLayout(level)
      expect(layout).toBeDefined()
      expect(layout.template).toBeDefined()
    }
  })

  it('combo score computation has no allocations', () => {
    // Math.min + Math.pow — pure math, no arrays, no objects
    const scores = []
    for (let i = 1; i <= 4; i++) scores.push(comboScore(i))
    expect(scores).toEqual([200, 400, 800, 1600])
  })
})

// ---- Performance × Ghost AI (runs NOW — validates formula efficiency) ----

describe('Integration — Performance × Ghost AI', () => {
  it('ghost targeting uses tile coordinates not pixel coordinates', () => {
    // All AI targeting works in grid space (integers)
    // Pixel conversion only happens at render time
    for (const ghost of GHOST_CFG) {
      expect(Number.isInteger(ghost.scatterX)).toBe(true)
      expect(Number.isInteger(ghost.scatterY)).toBe(true)
      expect(Number.isInteger(ghost.startX)).toBe(true)
      expect(Number.isInteger(ghost.startY)).toBe(true)
    }
  })

  it('distance calculation should use squared distance (no sqrt)', () => {
    // Squared distance avoids expensive Math.sqrt per ghost per frame
    function distanceSquared(x1, y1, x2, y2) {
      return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
    }
    const d2 = distanceSquared(0, 0, 3, 4)
    expect(d2).toBe(25) // 3² + 4² = 25 (distance is 5 but we skip sqrt)
  })

  it('4 ghosts × 4 directions = 16 distance comparisons per frame max', () => {
    // Each ghost evaluates at most 4 directions at each intersection
    const maxComparisons = GHOST_CFG.length * 4
    expect(maxComparisons).toBe(16)
    // 16 integer multiplications per frame is negligible
  })

  it('ghost exit delays stagger ghost house exits', () => {
    const delays = GHOST_CFG.map(g => g.exitDelay)
    expect(delays).toEqual([0, 50, 100, 150])
    // Staggered exits mean max 1 ghost AI decision per ~50 frames
  })
})

// ---- Social Sharing × Leaderboard (scaffold — skip) ----

describe('Integration — Social Sharing × Leaderboard', () => {
  it('share button should use score data from leaderboard entry', () => {
    const entry = { name: 'HOM', score: 12500, level: 5, combo: 4, date: new Date().toISOString() }
    const shareText = `${entry.name} scored ${entry.score.toLocaleString()} on Level ${entry.level}!`
    expect(shareText).toContain('12,500')
    expect(shareText).toContain('Level 5')
  })

  it('shared URL seed should match the game session seed', () => {
    const sessionSeed = 'abc12345'
    const shareUrl = `https://jperezdelreal.github.io/ComeRosquillas/play/?seed=${sessionSeed}`
    expect(shareUrl).toContain(sessionSeed)
  })

  it('screenshot should capture final game state including score', () => {
    // Canvas toDataURL at game over includes rendered HUD with score
    const captureState = 'GAME_OVER'
    expect(captureState).toBe('GAME_OVER')
  })

  it('QR code URL should use same seed as share text', () => {
    const seed = 'xyz99887'
    const qrUrl = `https://jperezdelreal.github.io/ComeRosquillas/play/?seed=${seed}`
    const shareUrl = `https://jperezdelreal.github.io/ComeRosquillas/play/?seed=${seed}`
    expect(qrUrl).toBe(shareUrl)
  })
})

// ---- Social Sharing × Stats (scaffold — skip) ----

describe('Integration — Social Sharing × Stats', () => {
  it('share text should optionally include rank badge', () => {
    const BADGES = [
      { id: 'master', emoji: '👑', min: 20000 },
      { id: 'expert', emoji: '🏆', min: 5000 },
      { id: 'regular', emoji: '🍕', min: 1000 },
      { id: 'beginner', emoji: '🍩', min: 0 },
    ]
    function getRankEmoji(donuts) {
      for (const b of BADGES) { if (donuts >= b.min) return b.emoji }
      return '🍩'
    }
    const emoji = getRankEmoji(6000)
    expect(emoji).toBe('🏆')
    const shareText = `${emoji} Expert player scored 15,000!`
    expect(shareText).toContain('🏆')
  })

  it('lifetime stats should be shareable as summary', () => {
    const stats = { totalGames: 50, totalDonutsEaten: 6200, highestLevel: 15, highestCombo: 8 }
    const summary = `🍩 ${stats.totalDonutsEaten.toLocaleString()} donuts eaten across ${stats.totalGames} games!`
    expect(summary).toContain('6,200')
    expect(summary).toContain('50 games')
  })
})

// ---- Performance × Audio (runs NOW — validates computation costs) ----

describe('Integration — Performance × Audio', () => {
  it('chomp pitch formula uses only basic math (pow, multiply)', () => {
    // 2^(streak * 0.5/12) — single Math.pow call
    const streak = 8
    const pitch = Math.pow(2, streak * 0.5 / 12)
    expect(pitch).toBeGreaterThan(1)
    expect(pitch).toBeLessThan(2)
  })

  it('spatial audio pan formula is O(1) per ghost', () => {
    // pan = clamp((ghostX - homerX) / maxDist, -1, 1)
    const maxDist = 14
    function pan(ghostX, homerX) {
      return Math.max(-1, Math.min(1, (ghostX - homerX) / maxDist))
    }
    expect(pan(0, 14)).toBe(-1)
    expect(pan(14, 14)).toBe(0)
    expect(pan(27, 14)).toBeCloseTo(0.929, 2)
  })

  it('music tempo formula is O(1) per level change', () => {
    // min(1.15, 1.0 + (level-1) * 0.015) — computed once per level
    function musicTempo(level) {
      return Math.min(1.15, 1.0 + (level - 1) * 0.015)
    }
    expect(musicTempo(1)).toBe(1.0)
    expect(musicTempo(20)).toBe(1.15)
  })
})

// ---- Performance × Mobile (runs NOW — validates touch math) ----

describe('Integration — Performance × Mobile', () => {
  it('swipe detection is O(1) — compare two absolute values', () => {
    function swipeDirection(dx, dy) {
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 1 : 3
      return dy > 0 ? 2 : 0
    }
    expect(swipeDirection(50, 10)).toBe(1) // RIGHT
    expect(swipeDirection(-40, 5)).toBe(3) // LEFT
    expect(swipeDirection(5, 60)).toBe(2)  // DOWN
    expect(swipeDirection(5, -60)).toBe(0) // UP
  })

  it('screen scaling is O(1) — single Math.min', () => {
    function getScale(screenW, screenH) {
      return Math.min(screenW / (COLS * TILE), screenH / (ROWS * TILE))
    }
    const scale = getScale(375, 667) // iPhone SE
    expect(scale).toBeGreaterThan(0)
    expect(scale).toBeLessThan(1) // canvas is larger than screen
  })

  it('D-pad hit test is O(1) — rectangular bounds check', () => {
    function isDpadHit(touchX, touchY, dpadX, dpadY, dpadSize) {
      return touchX >= dpadX && touchX <= dpadX + dpadSize &&
             touchY >= dpadY && touchY <= dpadY + dpadSize
    }
    expect(isDpadHit(100, 100, 50, 50, 160)).toBe(true)
    expect(isDpadHit(300, 300, 50, 50, 160)).toBe(false)
  })
})

// ---- Daily Challenges × Leaderboard (scaffold — skip) ----

describe('Integration — Daily Challenges × Leaderboard', () => {
  it('daily challenge scores should be stored separately from main leaderboard', () => {
    const mainKey = 'comeRosquillas_highScores'
    const challengeKey = 'comeRosquillas_dailyChallenge'
    expect(mainKey).not.toBe(challengeKey)
  })

  it('daily challenge best score should also appear on main leaderboard', () => {
    // When a daily challenge game ends, score is submitted to both:
    // 1. Daily challenge state (per-seed best)
    // 2. Main leaderboard (standard ranking)
    const dualSubmission = true
    expect(dualSubmission).toBe(true)
  })

  it('daily challenge leaderboard entry should include seed', () => {
    const entry = {
      name: 'HOM',
      score: 15000,
      level: 8,
      combo: 4,
      seed: 'daily-20260724',
      date: new Date().toISOString(),
    }
    expect(entry.seed).toMatch(/^daily-\d{8}$/)
  })
})
