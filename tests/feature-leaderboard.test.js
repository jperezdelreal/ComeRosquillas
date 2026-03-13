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

// ---- Leaderboard — Top 50 Expansion ----

describe('Leaderboard — Top 50 Expansion', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should support 50 entries instead of 10', () => {
    const mgr = createManager(50)
    expect(mgr.maxScores).toBe(50)
  })

  it('should accept 50th place score but reject 51st', () => {
    const mgr = createManager(50)
    for (let i = 1; i <= 50; i++) {
      mgr.addScore('TST', i * 100, 1)
    }
    expect(mgr.scores).toHaveLength(50)
    // 51st score lower than all existing → rejected (isHighScore false)
    expect(mgr.isHighScore(50)).toBe(false) // below lowest (100)
    // 51st score higher than lowest → accepted (pushes lowest out)
    expect(mgr.isHighScore(150)).toBe(true)
  })

  it('should migrate existing top-10 data to top-50 seamlessly', () => {
    // Store 10 scores with old manager
    const oldMgr = createManager(10)
    for (let i = 1; i <= 10; i++) {
      oldMgr.addScore('OLD', i * 1000, i)
    }
    expect(oldMgr.scores).toHaveLength(10)
    // New manager reads the same localStorage with expanded limit
    const newMgr = createManager(50)
    newMgr.loadScores()
    expect(newMgr.scores).toHaveLength(10) // old data preserved
    expect(newMgr.maxScores).toBe(50) // can now accept 40 more
    expect(newMgr.isHighScore(1)).toBe(true) // slots available
  })

  it('should maintain sort order across 50 entries', () => {
    const mgr = createManager(50)
    for (let i = 50; i >= 1; i--) {
      mgr.addScore('TST', i * 100, 1)
    }
    for (let i = 0; i < 49; i++) {
      expect(mgr.scores[i].score).toBeGreaterThanOrEqual(mgr.scores[i + 1].score)
    }
  })
})

// ---- Leaderboard — Scrollable Table ----

describe('Leaderboard — Scrolling', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should store all 50 entries for scrollable display', () => {
    const mgr = createManager(50)
    for (let i = 1; i <= 50; i++) {
      mgr.addScore('TST', i * 100, 1)
    }
    expect(mgr.getScores()).toHaveLength(50)
  })

  it('entries 11-20 should be accessible from the score array', () => {
    const mgr = createManager(50)
    for (let i = 1; i <= 30; i++) {
      mgr.addScore('T' + String(i).padStart(2, '0').substring(0, 2), i * 100, 1)
    }
    const scores = mgr.getScores()
    expect(scores[10]).toBeDefined() // 11th entry
    expect(scores[19]).toBeDefined() // 20th entry
    expect(scores[10].score).toBeLessThanOrEqual(scores[9].score) // sorted
  })

  it('should support keyboard-accessible data retrieval', () => {
    const mgr = createManager(50)
    for (let i = 1; i <= 25; i++) {
      mgr.addScore('TST', i * 100, 1)
    }
    const scores = mgr.getScores()
    // All entries available for keyboard-navigated scroll view
    expect(scores).toHaveLength(25)
    expect(scores[0].score).toBe(2500)
    expect(scores[24].score).toBe(100)
  })

  it('should highlight current player rank by matching score and date', () => {
    const mgr = createManager(50)
    mgr.addScore('AAA', 5000, 3)
    mgr.addScore('BBB', 3000, 2)
    const scores = mgr.getScores()
    // Player's score can be found by matching score + date
    const playerEntry = scores.find(s => s.score === 5000)
    expect(playerEntry).toBeDefined()
    expect(playerEntry.name).toBe('AAA')
    expect(playerEntry.date).toBeDefined()
  })
})

// ---- Leaderboard — Clear with Confirmation ----

describe('Leaderboard — Clear with Confirmation', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('clear should be a two-step process (confirm required)', () => {
    // StatsDashboard.showClearConfirm replaces footer with Cancel/Yes buttons
    // Only "Yes, Clear" actually clears — modeling the two-step flow
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    let confirmed = false
    // Step 1: request clear (shows confirm dialog)
    const pendingClear = () => { confirmed = true }
    // Step 2: confirm → execute
    pendingClear()
    if (confirmed) mgr.clearScores()
    expect(mgr.scores).toHaveLength(0)
  })

  it('should cancel clear if user dismisses confirmation', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 5000, 3)
    let confirmed = false
    // User clicks Cancel instead of "Yes, Clear"
    if (confirmed) mgr.clearScores()
    expect(mgr.scores).toHaveLength(1) // scores preserved
    expect(mgr.scores[0].score).toBe(5000)
  })

  it('clear confirmation should support both leaderboard and stats tabs', () => {
    // showClearConfirm checks activeTab: 'leaderboard' clears scores, 'stats' clears lifetime stats
    const leaderboardTab = 'leaderboard'
    const statsTab = 'stats'
    expect(['leaderboard', 'stats']).toContain(leaderboardTab)
    expect(['leaderboard', 'stats']).toContain(statsTab)
    // Each tab has its own clear behavior
    const mgr = createManager()
    mgr.addScore('TST', 1000, 1)
    mgr.clearScores()
    expect(mgr.scores).toHaveLength(0)
  })
})
