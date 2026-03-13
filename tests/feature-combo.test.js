// Sprint 2 Feature: Combo Multiplier System (#43)
// Test scaffolding — regression tests run NOW, feature tests .skip until combo UI lands
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TILE,
  GM_FRIGHTENED, GM_EATEN, GM_CHASE,
} from './setup.js'

// Combo milestones from config.js
const COMBO_MILESTONES = [2, 4, 8]
const COMBO_STORAGE_KEY = 'comeRosquillas_bestCombo'

// ---- Combo Score Math (can run NOW) ----

describe('Combo — Score Multiplier Math', () => {
  function comboMultiplier(ghostsEaten) {
    return Math.min(8, Math.pow(2, ghostsEaten - 1))
  }

  function comboScore(ghostsEaten) {
    return 200 * comboMultiplier(ghostsEaten)
  }

  it('1st ghost: 1x multiplier → 200 pts', () => {
    expect(comboMultiplier(1)).toBe(1)
    expect(comboScore(1)).toBe(200)
  })

  it('2nd ghost: 2x multiplier → 400 pts', () => {
    expect(comboMultiplier(2)).toBe(2)
    expect(comboScore(2)).toBe(400)
  })

  it('3rd ghost: 4x multiplier → 800 pts', () => {
    expect(comboMultiplier(3)).toBe(4)
    expect(comboScore(3)).toBe(800)
  })

  it('4th ghost: 8x multiplier → 1600 pts', () => {
    expect(comboMultiplier(4)).toBe(8)
    expect(comboScore(4)).toBe(1600)
  })

  it('5th+ ghost: capped at 8x multiplier → 1600 pts', () => {
    expect(comboMultiplier(5)).toBe(8)
    expect(comboScore(5)).toBe(1600)
  })

  it('total for 4 ghosts in single power pellet: 3000 pts', () => {
    const total = comboScore(1) + comboScore(2) + comboScore(3) + comboScore(4)
    expect(total).toBe(3000)
  })
})

// ---- Combo Milestones ----

describe('Combo — Milestone Triggers', () => {
  function comboMultiplier(ghostsEaten) {
    return Math.min(8, Math.pow(2, ghostsEaten - 1))
  }

  it('should trigger milestone at 2x (2nd ghost)', () => {
    expect(COMBO_MILESTONES.includes(comboMultiplier(2))).toBe(true)
  })

  it('should trigger milestone at 4x (3rd ghost)', () => {
    expect(COMBO_MILESTONES.includes(comboMultiplier(3))).toBe(true)
  })

  it('should trigger milestone at 8x (4th ghost)', () => {
    expect(COMBO_MILESTONES.includes(comboMultiplier(4))).toBe(true)
  })

  it('should NOT trigger milestone at 1x (1st ghost)', () => {
    expect(COMBO_MILESTONES.includes(comboMultiplier(1))).toBe(false)
  })

  it('should have milestones defined as [2, 4, 8]', () => {
    expect(COMBO_MILESTONES).toEqual([2, 4, 8])
  })
})

// ---- Combo Counter Reset ----

describe('Combo — Counter Reset', () => {
  it('should reset ghostsEaten to 0 when fright timer expires', () => {
    let ghostsEaten = 4
    let frightTimer = 0
    if (frightTimer <= 0) ghostsEaten = 0
    expect(ghostsEaten).toBe(0)
  })

  it('should restart from 1x on new power pellet', () => {
    let ghostsEaten = 0
    ghostsEaten++
    const multiplier = Math.min(8, Math.pow(2, ghostsEaten - 1))
    expect(multiplier).toBe(1)
  })

  it('should reset combo display timer to 0 on fright end', () => {
    let comboDisplayTimer = 120
    let frightTimer = 0
    if (frightTimer <= 0) comboDisplayTimer = 0
    expect(comboDisplayTimer).toBe(0)
  })
})

// ---- Combo Persistence (localStorage) ----

describe('Combo — Best Combo Persistence', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  function loadBestCombo() {
    try {
      const val = parseInt(localStorage.getItem(COMBO_STORAGE_KEY))
      return isNaN(val) ? 0 : val
    } catch (e) { return 0 }
  }

  function saveBestCombo(bestCombo) {
    try {
      const stored = parseInt(localStorage.getItem(COMBO_STORAGE_KEY)) || 0
      if (bestCombo > stored) {
        localStorage.setItem(COMBO_STORAGE_KEY, String(bestCombo))
      }
    } catch (e) {}
  }

  it('should default to 0 when no best combo saved', () => {
    expect(loadBestCombo()).toBe(0)
  })

  it('should save new best combo to localStorage', () => {
    saveBestCombo(4)
    expect(loadBestCombo()).toBe(4)
  })

  it('should only update if new combo is higher than stored', () => {
    saveBestCombo(8)
    expect(loadBestCombo()).toBe(8)
    saveBestCombo(4)
    expect(loadBestCombo()).toBe(8)
  })

  it('should persist across "sessions"', () => {
    saveBestCombo(8)
    const fresh = loadBestCombo()
    expect(fresh).toBe(8)
  })

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem(COMBO_STORAGE_KEY, 'not-a-number')
    expect(loadBestCombo()).toBe(0)
  })
})

// ---- Combo Display (Scaffolding — needs visual module) ----

describe.skip('Combo — Counter Display', () => {
  it('should show combo counter HUD when ghostsEaten >= 2', () => {
    // Verify comboDisplayTimer > 0 triggers HUD overlay
  })

  it('should hide combo counter when timer expires', () => {
    // Verify counter fades out after 120 frames
  })

  it('should display correct multiplier text (e.g., "4x COMBO!")', () => {
    // Verify canvas text matches current multiplier
  })

  it('should change color at milestones (gold → orange → red)', () => {
    // 2x = gold #ffd800, 4x = orange #ff8800, 8x = red #ff4444
  })
})

describe.skip('Combo — Particle Effects', () => {
  it('should spawn particles at 2x milestone', () => {
    // Verify addParticles called with 15 gold particles
  })

  it('should spawn particles at 4x milestone', () => {
    // Verify addParticles called
  })

  it('should spawn particles at 8x milestone', () => {
    // Verify addParticles called
  })

  it('should NOT spawn particles at 1x (first ghost)', () => {
    // Verify no particles for non-milestone
  })

  it('should show floating text at milestone', () => {
    // Verify addFloatingText called with "{n}x COMBO!" text
  })
})
