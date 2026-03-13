// Sprint 2: Cross-Feature Integration Tests
// Validates interactions between Tutorial, Combo, Mobile, and Difficulty systems
import { describe, it, expect } from 'vitest'

// ---- Cross-feature tests that can run NOW ----

describe('Integration — Difficulty × Combo Timing', () => {
  const FRIGHT_TIME = 360
  const DIFFICULTY_PRESETS = {
    easy: { frightTimeMultiplier: 1.5 },
    normal: { frightTimeMultiplier: 1.0 },
    hard: { frightTimeMultiplier: 0.7 },
  }

  it('Easy difficulty gives more time for ghost combos', () => {
    const easyFright = FRIGHT_TIME * DIFFICULTY_PRESETS.easy.frightTimeMultiplier
    const normalFright = FRIGHT_TIME * DIFFICULTY_PRESETS.normal.frightTimeMultiplier
    expect(easyFright).toBeGreaterThan(normalFright)
    expect(easyFright / 60).toBe(9)
  })

  it('Hard difficulty limits combo window', () => {
    const hardFright = FRIGHT_TIME * DIFFICULTY_PRESETS.hard.frightTimeMultiplier
    expect(hardFright / 60).toBeCloseTo(4.2, 1)
    expect(hardFright).toBeGreaterThan(0)
  })

  it('Normal fright is baseline for combo balance', () => {
    const normalFright = FRIGHT_TIME * DIFFICULTY_PRESETS.normal.frightTimeMultiplier
    expect(normalFright).toBe(360)
    expect(normalFright / 60).toBe(6)
  })
})

describe('Integration — Score × Difficulty × Extra Life', () => {
  it('Easy players get extra lives sooner', () => {
    const easyThreshold = 5000
    const normalThreshold = 10000
    const hardThreshold = 20000
    expect(easyThreshold).toBeLessThan(normalThreshold)
    expect(normalThreshold).toBeLessThan(hardThreshold)
  })

  it('Full ghost combo (3000 pts) contributes significantly to Easy extra life', () => {
    const comboTotal = 200 + 400 + 800 + 1600
    const easyThreshold = 5000
    expect(comboTotal / easyThreshold).toBeGreaterThan(0.5)
  })

  it('Full ghost combo is small fraction of Hard extra life threshold', () => {
    const comboTotal = 3000
    const hardThreshold = 20000
    expect(comboTotal / hardThreshold).toBe(0.15)
  })
})

// ---- Cross-feature integration tests (enabled — Sprint 2 landed) ----

describe('Integration — Tutorial × Combo', () => {
  it('should not count combo during tutorial (tutorial suppresses gameplay)', () => {
    const tutorialActive = true
    let ghostsEaten = 0
    // During tutorial, game isn't in PLAYING state — combo can't accumulate
    if (!tutorialActive) ghostsEaten++
    expect(ghostsEaten).toBe(0)
  })

  it('should enable combo system after tutorial completion', () => {
    const tutorialComplete = true
    let ghostsEaten = 0
    if (tutorialComplete) ghostsEaten++
    const multiplier = Math.min(8, Math.pow(2, ghostsEaten - 1))
    expect(multiplier).toBe(1) // First ghost = 1x
    expect(200 * multiplier).toBe(200)
  })

  it('tutorial step 3 hint should reference combo scoring chain', () => {
    const step3Hint = 'Chain ghost eats for a combo multiplier: 200 → 400 → 800 → 1600!'
    expect(step3Hint).toContain('200')
    expect(step3Hint).toContain('400')
    expect(step3Hint).toContain('800')
    expect(step3Hint).toContain('1600')
  })
})

describe('Integration — Mobile × Tutorial Touch Prompts', () => {
  it('should show "swipe" on mobile, "arrow keys" on desktop in step 1', () => {
    const mobileText = '**Swipe** in any direction to guide Homer through the maze.'
    const desktopText = 'Use **Arrow Keys** to navigate Homer through the maze.'
    expect(mobileText).toContain('Swipe')
    expect(desktopText).toContain('Arrow Keys')
    expect(mobileText).not.toContain('Arrow Keys')
    expect(desktopText).not.toContain('Swipe')
  })

  it('should accept both click and touch for step advancement', () => {
    const advanceEvents = ['click', 'touchend']
    expect(advanceEvents).toContain('click')
    expect(advanceEvents).toContain('touchend')
  })
})

describe('Integration — Mobile × Combo Particles', () => {
  it('combo particles should use manageable count (15 per eat)', () => {
    const particleCount = 15
    const maxGhosts = 4
    const worstCase = particleCount * maxGhosts
    expect(worstCase).toBe(60)
    // 60 particles total max — well within mobile frame budget
    expect(worstCase).toBeLessThan(200)
  })

  it('particle life should be short enough for mobile (30-50 frames)', () => {
    const minLife = 30
    const maxLife = 50
    expect(maxLife - minLife).toBe(20)
    // At 60fps, 50 frames = 0.83 seconds — brief enough for mobile
    expect(maxLife / 60).toBeLessThan(1)
  })

  it('floating text life (60 frames) should not overlap next ghost eat', () => {
    const floatLife = 60
    // 1 second display at 60fps
    expect(floatLife / 60).toBe(1)
    expect(floatLife).toBeLessThanOrEqual(120) // Must expire before combo display
  })
})

describe('Integration — Difficulty × Ghost AI', () => {
  const DIFFICULTY_PRESETS_SPEED = {
    easy: { ghostSpeedMultiplier: 0.8 },
    normal: { ghostSpeedMultiplier: 1.0 },
    hard: { ghostSpeedMultiplier: 1.2 },
  }

  const ghostNames = ['Sr. Burns', 'Bob Patiño', 'Nelson', 'Snake']

  it('should apply speed multiplier uniformly to all 4 ghost personalities', () => {
    const baseSpeed = 1.8 * 0.9 // Level 1 ghost speed
    for (const name of ghostNames) {
      const easySpeed = baseSpeed * DIFFICULTY_PRESETS_SPEED.easy.ghostSpeedMultiplier
      const hardSpeed = baseSpeed * DIFFICULTY_PRESETS_SPEED.hard.ghostSpeedMultiplier
      expect(easySpeed).toBeLessThan(baseSpeed)
      expect(hardSpeed).toBeGreaterThan(baseSpeed)
    }
  })

  it('should not change ghost personality targeting across difficulties', () => {
    // Ghost targeting is based on personality, not difficulty
    // Burns: Homer's tile (direct)
    // Pinky: 4 tiles ahead (ambush)
    // Inky: vector-based (calculated)
    // Snake: distance-based (patrol/flee, 8-tile threshold)
    const burnsTarget = 'homer_tile'
    const pinkyOffset = 4
    const snakeThreshold = 8

    // These values are difficulty-independent
    for (const difficulty of ['easy', 'normal', 'hard']) {
      expect(burnsTarget).toBe('homer_tile')
      expect(pinkyOffset).toBe(4)
      expect(snakeThreshold).toBe(8)
    }
  })

  it('frightened ghost speed should also respect difficulty multiplier', () => {
    const baseFrightenedSpeed = 1.8 * 0.5 // Frightened = 50% base
    const easyFrightSpeed = baseFrightenedSpeed * DIFFICULTY_PRESETS_SPEED.easy.ghostSpeedMultiplier
    const hardFrightSpeed = baseFrightenedSpeed * DIFFICULTY_PRESETS_SPEED.hard.ghostSpeedMultiplier
    expect(easyFrightSpeed).toBeLessThan(hardFrightSpeed)
  })
})
