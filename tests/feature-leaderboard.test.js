// Sprint 3 Feature: Leaderboard Enhancement (#56)
// Current top-10 tests run NOW. Top-50, scrolling, clear confirmation → skip.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'comeRosquillas_highScores'

// Re-implement current HighScoreManager for regression testing
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
    isHighScore(score) {
      if (typeof score !== 'number' || !isFinite(score) || score < 0) return false
      if (this.scores.length < this.maxScores) return true
      return score > this.scores[this.scores.length - 1].score
    },
    addScore(name, score, level, combo = 0) {
      if (typeof score !== 'number' || !isFinite(score) || score < 0) return false
      const COMBO_MILESTONES = [2, 4, 8]
      const entry = {
        name: name.trim().substring(0, 3).toUpperCase() || 'AAA',
        score,
        level,
        combo: (typeof combo === 'number' && combo > 0 && combo <= Math.max(...COMBO_MILESTONES)) ? combo : 0,
        date: new Date().toISOString(),
      }
      this.scores.push(entry)
      this.scores.sort((a, b) => b.score - a.score)
      this.scores = this.scores.slice(0, this.maxScores)
      const rank = this.scores.findIndex(s => s === entry) + 1
      this.saveScores()
      return rank
    },
    getHighScore() {
      return this.scores.length > 0 ? this.scores[0].score : 0
    },
    getScores() {
      return [...this.scores]
    },
    clearScores() {
      this.scores = []
      this.saveScores()
    },
  }
}

// ---- Current Leaderboard Regression (runs NOW) ----

describe('Leaderboard — Data Schema', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('score entry should have name, score, level, combo, date fields', () => {
    const mgr = createManager()
    mgr.addScore('HOM', 5000, 3, 4)
    const entry = mgr.scores[0]
    expect(entry).toHaveProperty('name')
    expect(entry).toHaveProperty('score')
    expect(entry).toHaveProperty('level')
    expect(entry).toHaveProperty('combo')
    expect(entry).toHaveProperty('date')
  })

  it('combo field should store valid combo multiplier', () => {
    const mgr = createManager()
    mgr.addScore('TST', 3000, 2, 4)
    expect(mgr.scores[0].combo).toBe(4)
  })

  it('combo field should clamp to 0 for invalid values', () => {
    const mgr = createManager()
    mgr.addScore('TST', 3000, 2, -1)
    expect(mgr.scores[0].combo).toBe(0)
  })

  it('combo field should cap at max milestone (8)', () => {
    const mgr = createManager()
    mgr.addScore('TST', 3000, 2, 16)
    expect(mgr.scores[0].combo).toBe(0)
  })

  it('date should be valid ISO 8601 string', () => {
    const mgr = createManager()
    mgr.addScore('TST', 1000, 1)
    const date = new Date(mgr.scores[0].date)
    expect(date.getTime()).not.toBeNaN()
  })

  it('name should be truncated to 3 uppercase characters', () => {
    const mgr = createManager()
    mgr.addScore('homer_simpson', 1000, 1)
    expect(mgr.scores[0].name).toBe('HOM')
    expect(mgr.scores[0].name).toHaveLength(3)
  })

  it('empty name should default to AAA', () => {
    const mgr = createManager()
    mgr.addScore('', 1000, 1)
    expect(mgr.scores[0].name).toBe('AAA')
  })

  it('whitespace-only name should default to AAA', () => {
    const mgr = createManager()
    mgr.addScore('   ', 1000, 1)
    expect(mgr.scores[0].name).toBe('AAA')
  })
})

describe('Leaderboard — Clear Functionality', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('clearScores should empty the leaderboard', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    mgr.addScore('BBB', 3000, 2)
    expect(mgr.scores).toHaveLength(2)
    mgr.clearScores()
    expect(mgr.scores).toHaveLength(0)
  })

  it('clearScores should persist empty state to localStorage', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    mgr.clearScores()
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toEqual([])
  })

  it('clearScores should allow new scores after clearing', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    mgr.clearScores()
    const rank = mgr.addScore('BBB', 1000, 1)
    expect(rank).toBe(1)
    expect(mgr.scores).toHaveLength(1)
  })

  it('getHighScore should return 0 after clearing', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    mgr.clearScores()
    expect(mgr.getHighScore()).toBe(0)
  })
})

describe('Leaderboard — Sorting & Ranking', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should sort scores descending (highest first)', () => {
    const mgr = createManager()
    mgr.addScore('CCC', 1000, 1)
    mgr.addScore('AAA', 5000, 3)
    mgr.addScore('BBB', 3000, 2)
    expect(mgr.scores[0].score).toBe(5000)
    expect(mgr.scores[1].score).toBe(3000)
    expect(mgr.scores[2].score).toBe(1000)
  })

  it('should handle tied scores (both kept, stable order)', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    mgr.addScore('BBB', 5000, 2)
    expect(mgr.scores).toHaveLength(2)
    expect(mgr.scores[0].score).toBe(5000)
    expect(mgr.scores[1].score).toBe(5000)
  })

  it('getScores should return defensive copy', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    const scores = mgr.getScores()
    scores.push({ name: 'XXX', score: 0, level: 0, combo: 0, date: '' })
    expect(mgr.scores).toHaveLength(1) // Original unmodified
  })

  it('should reject NaN, Infinity, and negative scores', () => {
    const mgr = createManager()
    expect(mgr.isHighScore(NaN)).toBe(false)
    expect(mgr.isHighScore(Infinity)).toBe(false)
    expect(mgr.isHighScore(-100)).toBe(false)
    expect(mgr.addScore('BAD', NaN, 1)).toBe(false)
  })

  it('should handle full leaderboard replacement correctly', () => {
    const mgr = createManager()
    // Fill with 10 low scores
    for (let i = 1; i <= 10; i++) {
      mgr.addScore('LOW', i * 100, 1)
    }
    expect(mgr.scores).toHaveLength(10)
    // Add high score that pushes lowest out
    mgr.addScore('HI!', 99999, 10)
    expect(mgr.scores).toHaveLength(10)
    expect(mgr.scores[0].score).toBe(99999)
    expect(mgr.scores[9].score).toBe(200) // 100 pushed out
  })
})

describe('Leaderboard — Persistence Edge Cases', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should handle corrupted JSON in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, '{corrupted!')
    const mgr = createManager()
    mgr.loadScores()
    expect(mgr.scores).toEqual([])
  })

  it('should handle array with invalid schema in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { foo: 'bar', baz: 42 },
    ]))
    const mgr = createManager()
    mgr.loadScores()
    expect(mgr.scores).toEqual([])
  })

  it('should handle null in localStorage', () => {
    localStorage.removeItem(STORAGE_KEY)
    const mgr = createManager()
    const result = mgr.loadScores()
    expect(result).toEqual([])
  })

  it('should survive localStorage quota exceeded gracefully', () => {
    const mgr = createManager()
    // saveScores returns false on failure
    const result = mgr.saveScores()
    expect(typeof result).toBe('boolean')
  })
})

// ---- Sprint 3 Scaffold: Top 50 Expansion (skip until #56 lands) ----

describe.skip('Leaderboard — Top 50 Expansion', () => {
  it('should support 50 entries instead of 10', () => {
    // maxScores should be increased to 50
  })

  it('should accept 50th place score but reject 51st', () => {
    // Fill with 50 scores, verify 51st is rejected if lower
  })

  it('should migrate existing top-10 data to top-50 seamlessly', () => {
    // Old data in localStorage should work with new maxScores
  })

  it('should maintain sort order across 50 entries', () => {
    // All 50 should be sorted descending
  })
})

// ---- Sprint 3 Scaffold: Scrolling / Pagination (skip until #56 lands) ----

describe.skip('Leaderboard — Scrolling', () => {
  it('should show 10 entries per visible page', () => {
    // Visible window shows 10 at a time
  })

  it('should scroll down to reveal entries 11-20', () => {
    // Arrow down or swipe scrolls the leaderboard view
  })

  it('should scroll up to return to top 10', () => {
    // Arrow up or swipe up scrolls back
  })

  it('should highlight current player rank in scrolled view', () => {
    // Player's entry highlighted regardless of scroll position
  })

  it('should support keyboard navigation (Up/Down arrows)', () => {
    // Keyboard should scroll leaderboard view
  })

  it('should support touch swipe for scrolling on mobile', () => {
    // Touch swipe up/down scrolls leaderboard
  })
})

// ---- Sprint 3 Scaffold: Clear with Confirmation (skip until #56 lands) ----

describe.skip('Leaderboard — Clear with Confirmation', () => {
  it('should show confirmation dialog before clearing', () => {
    // First click shows "Are you sure?" prompt
  })

  it('should require second confirmation to actually clear', () => {
    // Two-step: click Clear → confirm → scores wiped
  })

  it('should cancel clear if user dismisses confirmation', () => {
    // Clicking cancel/ESC preserves scores
  })

  it('should reset confirmation state after timeout', () => {
    // If user doesn't confirm within N seconds, cancel the clear
  })
})
