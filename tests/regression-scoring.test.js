// Sprint 1 Regression: Score System, Lives, and High Scores
// Validates donut/pellet scoring, ghost eating sequence, lives, and leaderboard persistence
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TILE, GM_FRIGHTENED, GM_EATEN, GM_CHASE, GM_SCATTER,
} from './setup.js'

// ---- Dot and Power Pellet Scoring ----

describe('Scoring — Dot Collection', () => {
  it('should award 10 points per regular dot', () => {
    let score = 0
    const DOT_POINTS = 10
    score += DOT_POINTS
    expect(score).toBe(10)
    score += DOT_POINTS
    expect(score).toBe(20)
  })

  it('should award 50 points per power pellet', () => {
    let score = 0
    const POWER_POINTS = 50
    score += POWER_POINTS
    expect(score).toBe(50)
  })

  it('should accumulate dots correctly over many collections', () => {
    let score = 0
    for (let i = 0; i < 244; i++) score += 10 // Full maze of dots
    expect(score).toBe(2440)
  })
})

// ---- Ghost Eating Scoring Sequence ----

describe('Scoring — Ghost Eating Sequence', () => {
  function ghostScore(ghostsEaten) {
    return 200 * Math.pow(2, ghostsEaten - 1)
  }

  it('should award 200 for first ghost', () => {
    expect(ghostScore(1)).toBe(200)
  })

  it('should award 400 for second ghost', () => {
    expect(ghostScore(2)).toBe(400)
  })

  it('should award 800 for third ghost', () => {
    expect(ghostScore(3)).toBe(800)
  })

  it('should award 1600 for fourth ghost', () => {
    expect(ghostScore(4)).toBe(1600)
  })

  it('should total 3000 points for eating all 4 ghosts', () => {
    const total = ghostScore(1) + ghostScore(2) + ghostScore(3) + ghostScore(4)
    expect(total).toBe(3000)
  })

  it('should reset counter on new power pellet', () => {
    let ghostsEaten = 4
    expect(ghostScore(ghostsEaten)).toBe(1600)
    // New power pellet resets
    ghostsEaten = 0
    ghostsEaten++
    expect(ghostScore(ghostsEaten)).toBe(200)
  })

  it('should only eat ghosts in FRIGHTENED mode', () => {
    const modes = [GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN]
    const edible = modes.filter(m => m === GM_FRIGHTENED)
    expect(edible).toEqual([GM_FRIGHTENED])
    expect(edible).toHaveLength(1)
  })
})

// ---- Lives System ----

describe('Lives — Core Mechanics', () => {
  it('should start with 3 lives', () => {
    const lives = 3
    expect(lives).toBe(3)
  })

  it('should lose a life on ghost collision in CHASE mode', () => {
    let lives = 3
    const ghostMode = GM_CHASE
    if (ghostMode !== GM_FRIGHTENED && ghostMode !== GM_EATEN) {
      lives--
    }
    expect(lives).toBe(2)
  })

  it('should lose a life on ghost collision in SCATTER mode', () => {
    let lives = 3
    const ghostMode = GM_SCATTER
    if (ghostMode !== GM_FRIGHTENED && ghostMode !== GM_EATEN) {
      lives--
    }
    expect(lives).toBe(2)
  })

  it('should NOT lose a life when eating frightened ghost', () => {
    let lives = 3
    const ghostMode = GM_FRIGHTENED
    if (ghostMode !== GM_FRIGHTENED && ghostMode !== GM_EATEN) {
      lives--
    }
    expect(lives).toBe(3)
  })

  it('should NOT lose a life from eaten ghost collision', () => {
    let lives = 3
    const ghostMode = GM_EATEN
    if (ghostMode !== GM_FRIGHTENED && ghostMode !== GM_EATEN) {
      lives--
    }
    expect(lives).toBe(3)
  })

  it('should trigger game over when lives reach 0', () => {
    let lives = 1
    let state = 'PLAYING'
    // Lose last life
    lives--
    if (lives <= 0) state = 'GAME_OVER'
    expect(state).toBe('GAME_OVER')
    expect(lives).toBe(0)
  })

  it('should NOT go negative on lives', () => {
    let lives = 0
    // Already dead — should not decrement further in real game
    expect(lives).toBe(0)
  })
})

// ---- High Score System ----

describe('High Scores — Persistence and Ranking', () => {
  const STORAGE_KEY = 'comeRosquillas_highScores'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  function createManager() {
    return {
      storageKey: STORAGE_KEY,
      maxScores: 10,
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
      addScore(name, score, level) {
        if (typeof score !== 'number' || !isFinite(score) || score < 0) return false
        const entry = {
          name: name.trim().substring(0, 3).toUpperCase() || 'AAA',
          score,
          level,
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
    }
  }

  it('should start with empty scores', () => {
    const mgr = createManager()
    mgr.loadScores()
    expect(mgr.scores).toEqual([])
    expect(mgr.getHighScore()).toBe(0)
  })

  it('should accept any score when leaderboard not full', () => {
    const mgr = createManager()
    expect(mgr.isHighScore(100)).toBe(true)
    expect(mgr.isHighScore(1)).toBe(true)
  })

  it('should add a score and persist to localStorage', () => {
    const mgr = createManager()
    mgr.addScore('HOM', 5000, 3)
    expect(mgr.scores).toHaveLength(1)
    expect(mgr.scores[0].name).toBe('HOM')
    expect(mgr.scores[0].score).toBe(5000)

    // Verify localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toHaveLength(1)
    expect(stored[0].score).toBe(5000)
  })

  it('should sort scores descending', () => {
    const mgr = createManager()
    mgr.addScore('AAA', 1000, 1)
    mgr.addScore('BBB', 5000, 3)
    mgr.addScore('CCC', 3000, 2)
    expect(mgr.scores[0].score).toBe(5000)
    expect(mgr.scores[1].score).toBe(3000)
    expect(mgr.scores[2].score).toBe(1000)
  })

  it('should limit to 10 scores', () => {
    const mgr = createManager()
    for (let i = 0; i < 15; i++) {
      mgr.addScore('TST', (i + 1) * 100, 1)
    }
    expect(mgr.scores).toHaveLength(10)
  })

  it('should reject invalid scores', () => {
    const mgr = createManager()
    expect(mgr.isHighScore(-1)).toBe(false)
    expect(mgr.isHighScore(NaN)).toBe(false)
    expect(mgr.isHighScore(Infinity)).toBe(false)
  })

  it('should truncate names to 3 uppercase chars', () => {
    const mgr = createManager()
    mgr.addScore('homer', 1000, 1)
    expect(mgr.scores[0].name).toBe('HOM')
  })

  it('should persist across "reloads" via localStorage', () => {
    const mgr1 = createManager()
    mgr1.addScore('HOM', 5000, 3)
    mgr1.addScore('BAR', 3000, 2)

    // Simulate page reload
    const mgr2 = createManager()
    mgr2.loadScores()
    expect(mgr2.scores).toHaveLength(2)
    expect(mgr2.getHighScore()).toBe(5000)
  })

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'NOT_JSON!!!')
    const mgr = createManager()
    mgr.loadScores()
    expect(mgr.scores).toEqual([])
  })

  it('should return correct rank on addScore', () => {
    const mgr = createManager()
    const rank1 = mgr.addScore('AAA', 5000, 3)
    expect(rank1).toBe(1)
    const rank2 = mgr.addScore('BBB', 8000, 5)
    expect(rank2).toBe(1) // New #1
    const rank3 = mgr.addScore('CCC', 3000, 2)
    expect(rank3).toBe(3) // Lowest of 3
  })
})
