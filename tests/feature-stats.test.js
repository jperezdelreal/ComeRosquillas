// Sprint 3 Feature: Lifetime Stats & Rank Badges
// All scaffolded — skip until stats system is implemented
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

const STATS_STORAGE_KEY = 'comeRosquillas_lifetimeStats'

const RANK_BADGES = [
  { id: 'master',   name: 'Master',   emoji: '👑', minDonuts: 20000 },
  { id: 'expert',   name: 'Expert',   emoji: '🏆', minDonuts: 5000 },
  { id: 'regular',  name: 'Regular',  emoji: '🍕', minDonuts: 1000 },
  { id: 'beginner', name: 'Beginner', emoji: '🍩', minDonuts: 0 },
]

function defaultStats() {
  return {
    totalGames: 0,
    totalDonutsEaten: 0,
    totalGhostsEaten: 0,
    highestCombo: 0,
    highestLevel: 0,
    totalPlayTimeMs: 0,
    bestScoreByDifficulty: {},
  }
}

function loadLifetimeStats() {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...defaultStats(), ...parsed }
      }
    }
  } catch (e) {}
  return defaultStats()
}

function saveLifetimeStats(stats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
    return true
  } catch (e) { return false }
}

function recordGameEnd(stats, gameStats) {
  stats.totalGames++
  stats.totalDonutsEaten += gameStats.donutsEaten || 0
  stats.totalGhostsEaten += gameStats.ghostsEaten || 0
  stats.totalPlayTimeMs += gameStats.playTimeMs || 0
  if (gameStats.bestCombo > stats.highestCombo) stats.highestCombo = gameStats.bestCombo
  if (gameStats.level > stats.highestLevel) stats.highestLevel = gameStats.level
  const diff = gameStats.difficulty || 'normal'
  const prevBest = stats.bestScoreByDifficulty[diff] || 0
  if (gameStats.score > prevBest) stats.bestScoreByDifficulty[diff] = gameStats.score
  saveLifetimeStats(stats)
  return stats
}

function getRank(totalDonutsEaten) {
  for (const badge of RANK_BADGES) {
    if (totalDonutsEaten >= badge.minDonuts) return badge
  }
  return RANK_BADGES[RANK_BADGES.length - 1]
}

// ---- Stats — Lifetime Tracking ----

describe('Stats — Lifetime Tracking', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should track total games played', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 3, bestCombo: 2, donutsEaten: 50, ghostsEaten: 4, playTimeMs: 60000 })
    recordGameEnd(stats, { score: 2000, level: 5, bestCombo: 4, donutsEaten: 80, ghostsEaten: 8, playTimeMs: 90000 })
    expect(stats.totalGames).toBe(2)
  })

  it('should accumulate total donuts eaten across all games', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 1, bestCombo: 0, donutsEaten: 50, ghostsEaten: 0, playTimeMs: 30000 })
    recordGameEnd(stats, { score: 2000, level: 2, bestCombo: 0, donutsEaten: 75, ghostsEaten: 0, playTimeMs: 45000 })
    expect(stats.totalDonutsEaten).toBe(125)
  })

  it('should accumulate total ghosts eaten across all games', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 1, bestCombo: 2, donutsEaten: 10, ghostsEaten: 4, playTimeMs: 30000 })
    recordGameEnd(stats, { score: 2000, level: 2, bestCombo: 4, donutsEaten: 20, ghostsEaten: 8, playTimeMs: 45000 })
    expect(stats.totalGhostsEaten).toBe(12)
  })

  it('should track highest level ever reached (max, not sum)', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 3, bestCombo: 0, donutsEaten: 10, ghostsEaten: 0, playTimeMs: 30000 })
    recordGameEnd(stats, { score: 500, level: 1, bestCombo: 0, donutsEaten: 5, ghostsEaten: 0, playTimeMs: 15000 })
    expect(stats.highestLevel).toBe(3) // max, not last
  })

  it('should accumulate total play time in milliseconds', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 1, bestCombo: 0, donutsEaten: 10, ghostsEaten: 0, playTimeMs: 60000 })
    recordGameEnd(stats, { score: 2000, level: 2, bestCombo: 0, donutsEaten: 20, ghostsEaten: 0, playTimeMs: 90000 })
    expect(stats.totalPlayTimeMs).toBe(150000)
  })

  it('should track best combo ever achieved (max, not sum)', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 1, bestCombo: 4, donutsEaten: 10, ghostsEaten: 2, playTimeMs: 30000 })
    recordGameEnd(stats, { score: 2000, level: 2, bestCombo: 2, donutsEaten: 20, ghostsEaten: 1, playTimeMs: 45000 })
    expect(stats.highestCombo).toBe(4) // max, not last
  })

  it('should track best score by difficulty', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 5000, level: 5, bestCombo: 0, donutsEaten: 50, ghostsEaten: 0, playTimeMs: 60000, difficulty: 'easy' })
    recordGameEnd(stats, { score: 3000, level: 3, bestCombo: 0, donutsEaten: 30, ghostsEaten: 0, playTimeMs: 45000, difficulty: 'hard' })
    recordGameEnd(stats, { score: 7000, level: 7, bestCombo: 0, donutsEaten: 70, ghostsEaten: 0, playTimeMs: 90000, difficulty: 'easy' })
    expect(stats.bestScoreByDifficulty.easy).toBe(7000)
    expect(stats.bestScoreByDifficulty.hard).toBe(3000)
  })
})

// ---- Stats — Persistence ----

describe('Stats — Persistence', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should save stats to localStorage on game end', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 1000, level: 2, bestCombo: 2, donutsEaten: 50, ghostsEaten: 4, playTimeMs: 60000 })
    const stored = JSON.parse(localStorage.getItem(STATS_STORAGE_KEY))
    expect(stored.totalGames).toBe(1)
    expect(stored.totalDonutsEaten).toBe(50)
  })

  it('should load stats from localStorage on init', () => {
    const original = defaultStats()
    original.totalGames = 5
    original.totalDonutsEaten = 250
    saveLifetimeStats(original)
    const loaded = loadLifetimeStats()
    expect(loaded.totalGames).toBe(5)
    expect(loaded.totalDonutsEaten).toBe(250)
  })

  it('should handle missing localStorage gracefully (defaults)', () => {
    localStorage.removeItem(STATS_STORAGE_KEY)
    const loaded = loadLifetimeStats()
    expect(loaded.totalGames).toBe(0)
    expect(loaded.totalDonutsEaten).toBe(0)
    expect(loaded.highestLevel).toBe(0)
  })

  it('should handle corrupted stats JSON gracefully', () => {
    localStorage.setItem(STATS_STORAGE_KEY, '{corrupted!')
    const loaded = loadLifetimeStats()
    expect(loaded).toEqual(defaultStats())
  })

  it('should merge new game stats with existing lifetime stats', () => {
    const stats = defaultStats()
    stats.totalGames = 3
    stats.totalDonutsEaten = 100
    recordGameEnd(stats, { score: 2000, level: 4, bestCombo: 2, donutsEaten: 60, ghostsEaten: 3, playTimeMs: 45000 })
    expect(stats.totalGames).toBe(4)
    expect(stats.totalDonutsEaten).toBe(160)
  })

  it('should not overwrite higher records (highestLevel, highestCombo)', () => {
    const stats = defaultStats()
    stats.highestLevel = 10
    stats.highestCombo = 8
    recordGameEnd(stats, { score: 500, level: 2, bestCombo: 2, donutsEaten: 10, ghostsEaten: 1, playTimeMs: 20000 })
    expect(stats.highestLevel).toBe(10) // not overwritten
    expect(stats.highestCombo).toBe(8) // not overwritten
  })
})

// ---- Stats — Data Schema ----

describe('Stats — Data Schema', () => {
  it('should have correct schema with all required fields', () => {
    const stats = defaultStats()
    expect(stats).toHaveProperty('totalGames')
    expect(stats).toHaveProperty('totalDonutsEaten')
    expect(stats).toHaveProperty('totalGhostsEaten')
    expect(stats).toHaveProperty('highestCombo')
    expect(stats).toHaveProperty('highestLevel')
    expect(stats).toHaveProperty('totalPlayTimeMs')
    expect(stats).toHaveProperty('bestScoreByDifficulty')
  })

  it('all numeric fields should be non-negative', () => {
    const stats = defaultStats()
    expect(stats.totalGames).toBeGreaterThanOrEqual(0)
    expect(stats.totalDonutsEaten).toBeGreaterThanOrEqual(0)
    expect(stats.totalGhostsEaten).toBeGreaterThanOrEqual(0)
    expect(stats.highestCombo).toBeGreaterThanOrEqual(0)
    expect(stats.highestLevel).toBeGreaterThanOrEqual(0)
    expect(stats.totalPlayTimeMs).toBeGreaterThanOrEqual(0)
  })

  it('bestScoreByDifficulty should be an object keyed by difficulty name', () => {
    const stats = defaultStats()
    expect(typeof stats.bestScoreByDifficulty).toBe('object')
    recordGameEnd(stats, { score: 5000, level: 5, bestCombo: 0, donutsEaten: 50, ghostsEaten: 0, playTimeMs: 60000, difficulty: 'normal' })
    expect(stats.bestScoreByDifficulty).toHaveProperty('normal')
    expect(stats.bestScoreByDifficulty.normal).toBe(5000)
  })

  it('totalGames should always be a positive integer after games played', () => {
    const stats = defaultStats()
    recordGameEnd(stats, { score: 100, level: 1, bestCombo: 0, donutsEaten: 5, ghostsEaten: 0, playTimeMs: 10000 })
    expect(Number.isInteger(stats.totalGames)).toBe(true)
    expect(stats.totalGames).toBeGreaterThan(0)
  })
})

// ---- Stats — Rank Badges ----

describe('Stats — Rank Badges', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should award "Beginner" badge at 0 donuts', () => {
    expect(getRank(0).id).toBe('beginner')
    expect(getRank(0).emoji).toBe('🍩')
  })

  it('should award "Regular" badge at 1000+ donuts', () => {
    expect(getRank(999).id).toBe('beginner')
    expect(getRank(1000).id).toBe('regular')
    expect(getRank(1000).emoji).toBe('🍕')
  })

  it('should award "Expert" badge at 5000+ donuts', () => {
    expect(getRank(4999).id).toBe('regular')
    expect(getRank(5000).id).toBe('expert')
    expect(getRank(5000).emoji).toBe('🏆')
  })

  it('should award "Master" badge at 20000+ donuts', () => {
    expect(getRank(19999).id).toBe('expert')
    expect(getRank(20000).id).toBe('master')
    expect(getRank(20000).emoji).toBe('👑')
  })

  it('rank badges should be ordered from highest to lowest tier', () => {
    expect(RANK_BADGES[0].minDonuts).toBeGreaterThan(RANK_BADGES[1].minDonuts)
    expect(RANK_BADGES[1].minDonuts).toBeGreaterThan(RANK_BADGES[2].minDonuts)
    expect(RANK_BADGES[2].minDonuts).toBeGreaterThan(RANK_BADGES[3].minDonuts)
  })

  it('each badge should have id, name, emoji, and minDonuts', () => {
    for (const badge of RANK_BADGES) {
      expect(badge).toHaveProperty('id')
      expect(badge).toHaveProperty('name')
      expect(badge).toHaveProperty('emoji')
      expect(badge).toHaveProperty('minDonuts')
      expect(typeof badge.id).toBe('string')
      expect(typeof badge.emoji).toBe('string')
      expect(typeof badge.minDonuts).toBe('number')
    }
  })

  it('badges progress from Beginner → Regular → Expert → Master', () => {
    const ids = RANK_BADGES.map(b => b.id)
    expect(ids).toEqual(['master', 'expert', 'regular', 'beginner'])
  })

  it('rank should never decrease as donuts increase', () => {
    let prevRankIdx = RANK_BADGES.length - 1
    for (let donuts = 0; donuts <= 25000; donuts += 500) {
      const rank = getRank(donuts)
      const idx = RANK_BADGES.findIndex(b => b.id === rank.id)
      expect(idx).toBeLessThanOrEqual(prevRankIdx) // lower index = higher rank
      prevRankIdx = idx
    }
  })
})
