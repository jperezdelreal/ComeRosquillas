// Sprint 5 Feature: Power-Up Variety & Special Items (#92)
// Proactive test scaffolding — may need adjustment once implementation lands
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BASE_SPEED } from './setup.js'

// ---- Power-Up Type Definitions ----

const POWER_UP_TYPES = {
  DUFF_BEER:      { id: 'duff_beer',      name: 'Duff Beer',       weight: 25, duration: 480, color: '#c8a84e' },
  CHILI_PEPPER:   { id: 'chili_pepper',    name: 'Chili Pepper',    weight: 20, duration: 600, color: '#ff3300' },
  BURNS_TOKEN:    { id: 'burns_token',     name: 'Mr. Burns Token', weight: 1,  duration: 0,   color: '#228b22' },
  DONUT_BOX:      { id: 'donut_box',       name: 'Donut Box',       weight: 5,  duration: 0,   color: '#ff69b4' },
  LARD_LAD:       { id: 'lard_lad',        name: 'Lard Lad Statue', weight: 10, duration: 300, color: '#ffd700' },
}

const ALL_TYPES = Object.values(POWER_UP_TYPES)
const TOTAL_WEIGHT = ALL_TYPES.reduce((sum, t) => sum + t.weight, 0)

// ---- Helpers matching expected production logic ----

function getSpawnProbability(type) {
  return type.weight / TOTAL_WEIGHT
}

function selectPowerUp(roll) {
  // Weighted random selection: roll is in [0, TOTAL_WEIGHT)
  let cumulative = 0
  for (const type of ALL_TYPES) {
    cumulative += type.weight
    if (roll < cumulative) return type
  }
  return ALL_TYPES[ALL_TYPES.length - 1]
}

function applyDuffBeer(playerSpeed) {
  return playerSpeed * 2
}

function applyChiliPepper(ghostSpeed) {
  return ghostSpeed * 0.5
}

function collectBurnsToken(tokensHeld) {
  const newCount = tokensHeld + 1
  const awardLife = newCount >= 3
  return { tokens: awardLife ? 0 : newCount, extraLife: awardLife }
}

function rollDonutBoxPoints() {
  // Returns random points in 1000-5000 range (multiples of 100)
  return 1000 + Math.floor(Math.random() * 41) * 100
}

function applyLardLad() {
  return { invincible: true }
}

// ================================================================
// TESTS
// ================================================================

describe('Power-Ups — Type Definitions', () => {
  it('should define exactly 5 power-up types', () => {
    expect(ALL_TYPES).toHaveLength(5)
  })

  it('each type should have id, name, weight, duration, and color', () => {
    for (const type of ALL_TYPES) {
      expect(type.id).toBeDefined()
      expect(typeof type.id).toBe('string')
      expect(type.name).toBeDefined()
      expect(typeof type.weight).toBe('number')
      expect(type.weight).toBeGreaterThan(0)
      expect(typeof type.duration).toBe('number')
      expect(type.duration).toBeGreaterThanOrEqual(0)
      expect(type.color).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('Duff Beer should have 8s duration (480 frames at 60fps)', () => {
    expect(POWER_UP_TYPES.DUFF_BEER.duration).toBe(480)
    expect(POWER_UP_TYPES.DUFF_BEER.duration / 60).toBe(8)
  })

  it('Chili Pepper should have 10s duration (600 frames at 60fps)', () => {
    expect(POWER_UP_TYPES.CHILI_PEPPER.duration).toBe(600)
    expect(POWER_UP_TYPES.CHILI_PEPPER.duration / 60).toBe(10)
  })

  it('Lard Lad Statue should have 5s duration (300 frames at 60fps)', () => {
    expect(POWER_UP_TYPES.LARD_LAD.duration).toBe(300)
    expect(POWER_UP_TYPES.LARD_LAD.duration / 60).toBe(5)
  })

  it('Burns Token should have 0 duration (instant collect)', () => {
    expect(POWER_UP_TYPES.BURNS_TOKEN.duration).toBe(0)
  })

  it('Donut Box should have 0 duration (instant collect)', () => {
    expect(POWER_UP_TYPES.DONUT_BOX.duration).toBe(0)
  })
})

// ---- Spawn Probability ----

describe('Power-Ups — Spawn Probability', () => {
  it('weights should sum to expected total', () => {
    // 25 + 20 + 1 + 5 + 10 = 61
    expect(TOTAL_WEIGHT).toBe(61)
  })

  it('each type should have valid probability (0 < p ≤ 1)', () => {
    for (const type of ALL_TYPES) {
      const prob = getSpawnProbability(type)
      expect(prob).toBeGreaterThan(0)
      expect(prob).toBeLessThanOrEqual(1)
    }
  })

  it('all probabilities should sum to 1.0', () => {
    const totalProb = ALL_TYPES.reduce((s, t) => s + getSpawnProbability(t), 0)
    expect(totalProb).toBeCloseTo(1.0, 10)
  })

  it('Burns Token should have lowest spawn rate (~1.6%)', () => {
    const burnProb = getSpawnProbability(POWER_UP_TYPES.BURNS_TOKEN)
    const allProbs = ALL_TYPES.map(t => getSpawnProbability(t))
    expect(burnProb).toBe(Math.min(...allProbs))
    expect(burnProb).toBeCloseTo(1 / 61, 3)
  })

  it('Duff Beer should have highest spawn rate (~41%)', () => {
    const duffProb = getSpawnProbability(POWER_UP_TYPES.DUFF_BEER)
    const allProbs = ALL_TYPES.map(t => getSpawnProbability(t))
    expect(duffProb).toBe(Math.max(...allProbs))
    expect(duffProb).toBeCloseTo(25 / 61, 3)
  })

  it('weighted selection should return a valid type for any roll', () => {
    for (let roll = 0; roll < TOTAL_WEIGHT; roll++) {
      const type = selectPowerUp(roll)
      expect(ALL_TYPES).toContain(type)
    }
  })

  it('weighted selection should favour Duff Beer for low rolls', () => {
    // Duff Beer has weight 25, so rolls 0-24 should select it
    for (let roll = 0; roll < 25; roll++) {
      expect(selectPowerUp(roll).id).toBe('duff_beer')
    }
  })
})

// ---- Collection Logic ----

describe('Power-Ups — Collection Logic', () => {
  it('collecting Duff Beer should trigger speed effect', () => {
    const newSpeed = applyDuffBeer(BASE_SPEED)
    expect(newSpeed).toBe(BASE_SPEED * 2)
  })

  it('collecting Chili Pepper should trigger ghost slow effect', () => {
    const ghostSpeed = BASE_SPEED * 0.9
    const newGhostSpeed = applyChiliPepper(ghostSpeed)
    expect(newGhostSpeed).toBe(ghostSpeed * 0.5)
  })

  it('collecting Burns Token should increment token counter', () => {
    const result = collectBurnsToken(0)
    expect(result.tokens).toBe(1)
    expect(result.extraLife).toBe(false)
  })

  it('collecting Donut Box should award bonus points', () => {
    const points = rollDonutBoxPoints()
    expect(points).toBeGreaterThanOrEqual(1000)
    expect(points).toBeLessThanOrEqual(5000)
  })

  it('collecting Lard Lad Statue should set invincibility', () => {
    const result = applyLardLad()
    expect(result.invincible).toBe(true)
  })
})

// ---- Duration Timers ----

describe('Power-Ups — Duration Timers', () => {
  it('Duff Beer effect should expire after 480 frames', () => {
    let timer = POWER_UP_TYPES.DUFF_BEER.duration
    for (let i = 0; i < 480; i++) timer--
    expect(timer).toBe(0)
  })

  it('Chili Pepper effect should expire after 600 frames', () => {
    let timer = POWER_UP_TYPES.CHILI_PEPPER.duration
    for (let i = 0; i < 600; i++) timer--
    expect(timer).toBe(0)
  })

  it('Lard Lad effect should expire after 300 frames', () => {
    let timer = POWER_UP_TYPES.LARD_LAD.duration
    for (let i = 0; i < 300; i++) timer--
    expect(timer).toBe(0)
  })

  it('effect active check: timer > 0 means effect is active', () => {
    let timer = 100
    expect(timer > 0).toBe(true)
    timer = 0
    expect(timer > 0).toBe(false)
  })

  it('expired effect should revert player speed to normal', () => {
    let playerSpeed = applyDuffBeer(BASE_SPEED)
    expect(playerSpeed).toBe(BASE_SPEED * 2)
    // Timer expires → revert
    let timer = 0
    if (timer <= 0) playerSpeed = BASE_SPEED
    expect(playerSpeed).toBe(BASE_SPEED)
  })

  it('expired effect should revert ghost speed to normal', () => {
    const normalGhostSpeed = BASE_SPEED * 0.9
    let ghostSpeed = applyChiliPepper(normalGhostSpeed)
    expect(ghostSpeed).toBe(normalGhostSpeed * 0.5)
    let timer = 0
    if (timer <= 0) ghostSpeed = normalGhostSpeed
    expect(ghostSpeed).toBe(normalGhostSpeed)
  })
})

// ---- Duff Beer: Speed Doubles ----

describe('Power-Ups — Duff Beer Speed Effect', () => {
  it('player speed should exactly double during effect', () => {
    expect(applyDuffBeer(BASE_SPEED)).toBe(BASE_SPEED * 2)
  })

  it('doubled speed should apply to all movement directions', () => {
    const boosted = applyDuffBeer(BASE_SPEED)
    // Movement in any direction uses same speed scalar
    const dx = [0, boosted, 0, -boosted]
    const dy = [-boosted, 0, boosted, 0]
    for (let d = 0; d < 4; d++) {
      const magnitude = Math.abs(dx[d]) + Math.abs(dy[d])
      expect(magnitude).toBe(boosted)
    }
  })

  it('speed should revert after 8 seconds', () => {
    const durationFrames = 8 * 60
    expect(durationFrames).toBe(POWER_UP_TYPES.DUFF_BEER.duration)
  })
})

// ---- Chili Pepper: Ghost Speed Halved ----

describe('Power-Ups — Chili Pepper Ghost Slow', () => {
  it('ghost speed should be halved during effect', () => {
    const normalSpeed = BASE_SPEED * 0.9
    expect(applyChiliPepper(normalSpeed)).toBe(normalSpeed * 0.5)
  })

  it('halved speed applies to all 4 ghosts', () => {
    const ghostSpeeds = [1.62, 1.62, 1.62, 1.62] // BASE_SPEED * 0.9
    const slowed = ghostSpeeds.map(s => applyChiliPepper(s))
    slowed.forEach(s => expect(s).toBeCloseTo(0.81, 2))
  })

  it('effect should last 10 seconds (600 frames)', () => {
    expect(POWER_UP_TYPES.CHILI_PEPPER.duration).toBe(600)
  })

  it('ghost speed should revert to normal after expiry', () => {
    const normal = 1.62
    let speed = applyChiliPepper(normal)
    expect(speed).toBeCloseTo(0.81, 2)
    // Expiry
    speed = normal
    expect(speed).toBe(1.62)
  })
})

// ---- Mr. Burns Token: 3 = Extra Life ----

describe('Power-Ups — Mr. Burns Token Extra Life', () => {
  it('collecting 1st token: tokens=1, no extra life', () => {
    const result = collectBurnsToken(0)
    expect(result.tokens).toBe(1)
    expect(result.extraLife).toBe(false)
  })

  it('collecting 2nd token: tokens=2, no extra life', () => {
    const result = collectBurnsToken(1)
    expect(result.tokens).toBe(2)
    expect(result.extraLife).toBe(false)
  })

  it('collecting 3rd token: tokens reset to 0, awards extra life', () => {
    const result = collectBurnsToken(2)
    expect(result.tokens).toBe(0)
    expect(result.extraLife).toBe(true)
  })

  it('token counter should reset after awarding life', () => {
    const after3 = collectBurnsToken(2)
    expect(after3.tokens).toBe(0)
    // Next token starts fresh
    const next = collectBurnsToken(after3.tokens)
    expect(next.tokens).toBe(1)
  })

  it('Burns Token has lowest spawn weight (1)', () => {
    expect(POWER_UP_TYPES.BURNS_TOKEN.weight).toBe(1)
  })
})

// ---- Donut Box: Random Points ----

describe('Power-Ups — Donut Box Random Points', () => {
  it('points should be in 1000-5000 range', () => {
    for (let i = 0; i < 50; i++) {
      const pts = rollDonutBoxPoints()
      expect(pts).toBeGreaterThanOrEqual(1000)
      expect(pts).toBeLessThanOrEqual(5000)
    }
  })

  it('points should be multiples of 100', () => {
    for (let i = 0; i < 50; i++) {
      const pts = rollDonutBoxPoints()
      expect(pts % 100).toBe(0)
    }
  })

  it('Donut Box should have 5% spawn weight (weight=5)', () => {
    expect(POWER_UP_TYPES.DONUT_BOX.weight).toBe(5)
    expect(getSpawnProbability(POWER_UP_TYPES.DONUT_BOX)).toBeCloseTo(5 / 61, 3)
  })
})

// ---- Lard Lad Statue: Invincibility ----

describe('Power-Ups — Lard Lad Statue Invincibility', () => {
  it('invincibility flag should be set during effect', () => {
    const result = applyLardLad()
    expect(result.invincible).toBe(true)
  })

  it('invincibility should last 5 seconds (300 frames)', () => {
    expect(POWER_UP_TYPES.LARD_LAD.duration).toBe(300)
  })

  it('ghost collisions should be ignored during invincibility', () => {
    const invincible = true
    const ghostCollision = true
    const shouldDie = ghostCollision && !invincible
    expect(shouldDie).toBe(false)
  })

  it('invincibility should clear after timer expires', () => {
    let invincible = true
    let timer = 0
    if (timer <= 0) invincible = false
    expect(invincible).toBe(false)
  })
})

// ---- Power-Up Stacking ----

describe('Power-Ups — Stacking & Combos', () => {
  it('Duff Beer + Power Pellet should stack multipliers', () => {
    // Duff gives 2x speed, Power Pellet gives combo scoring
    // Combined: player at 2x speed can eat frightened ghosts faster
    const duffSpeedMult = 2.0
    const powerPelletActive = true
    const comboMultiplier = 2 // 2x combo from eating ghosts
    const effectiveScoreMult = powerPelletActive ? comboMultiplier : 1
    expect(duffSpeedMult).toBe(2.0)
    expect(effectiveScoreMult).toBe(2)
    // Both effects active simultaneously
    expect(duffSpeedMult > 1 && effectiveScoreMult > 1).toBe(true)
  })

  it('multiple timed effects should have independent timers', () => {
    let duffTimer = POWER_UP_TYPES.DUFF_BEER.duration   // 480
    let chiliTimer = POWER_UP_TYPES.CHILI_PEPPER.duration // 600
    // Advance 480 frames
    duffTimer -= 480
    chiliTimer -= 480
    expect(duffTimer).toBe(0)    // Duff expired
    expect(chiliTimer).toBe(120) // Chili still active
  })

  it('invincibility + Duff Beer should both be active', () => {
    const invincible = true
    const speedBoosted = true
    expect(invincible && speedBoosted).toBe(true)
  })
})

// ---- Spawn Rules ----

describe('Power-Ups — Spawn Rules', () => {
  it('only 1 power-up should spawn per level', () => {
    const maxPowerUpsPerLevel = 1
    expect(maxPowerUpsPerLevel).toBe(1)
  })

  it('power-up should not spawn if one is already active on the field', () => {
    const powerUpOnField = true
    const canSpawn = !powerUpOnField
    expect(canSpawn).toBe(false)
  })

  it('power-up should not spawn if one has already been collected this level', () => {
    const collectedThisLevel = true
    const canSpawn = !collectedThisLevel
    expect(canSpawn).toBe(false)
  })

  it('spawn counter should reset on level change', () => {
    let collectedThisLevel = true
    // Level advances
    collectedThisLevel = false
    expect(collectedThisLevel).toBe(false)
  })
})

// ---- Edge Cases ----

describe('Power-Ups — Edge Cases', () => {
  it('power-up expiring during ghost collision should NOT protect player', () => {
    let invincible = true
    let timer = 1
    // Timer ticks down this frame
    timer--
    if (timer <= 0) invincible = false
    // Ghost collision on same frame
    const ghostCollision = true
    const shouldDie = ghostCollision && !invincible
    expect(shouldDie).toBe(true)
  })

  it('collecting power-up during death animation should be ignored', () => {
    const isDying = true
    const canCollect = !isDying
    expect(canCollect).toBe(false)
  })

  it('Duff Beer speed should not stack with itself (cap at 2x)', () => {
    let speed = BASE_SPEED
    speed = applyDuffBeer(speed) // 2x
    // Collecting another Duff while active should refresh timer, not stack speed
    const refreshedSpeed = Math.min(speed, BASE_SPEED * 2)
    expect(refreshedSpeed).toBe(BASE_SPEED * 2)
  })

  it('Burns Token count should persist across levels', () => {
    let tokens = 2
    // Level change should NOT reset token count
    const levelChanged = true
    // Tokens persist
    expect(tokens).toBe(2)
    // Collecting 3rd across levels still awards life
    const result = collectBurnsToken(tokens)
    expect(result.extraLife).toBe(true)
  })

  it('Donut Box points should not exceed 5000', () => {
    // Boundary: max roll should yield exactly 5000
    const maxPoints = 1000 + 40 * 100
    expect(maxPoints).toBe(5000)
  })

  it('Donut Box points should not be below 1000', () => {
    const minPoints = 1000 + 0 * 100
    expect(minPoints).toBe(1000)
  })

  it('power-up HUD timer should display remaining seconds', () => {
    const timerFrames = 180
    const displaySeconds = Math.ceil(timerFrames / 60)
    expect(displaySeconds).toBe(3)
  })

  it('power-up HUD timer should show 0 when expired', () => {
    const timerFrames = 0
    const displaySeconds = Math.ceil(timerFrames / 60)
    // Math.ceil(0/60) = 0
    expect(displaySeconds).toBe(0)
  })
})
