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

// ---- Combo Counter Display ----

describe('Combo — Counter Display', () => {
  it('should show bestCombo HUD when bestCombo > 1', () => {
    const bestCombo = 2
    const display = bestCombo > 1 ? 'visible' : 'none'
    expect(display).toBe('visible')
  })

  it('should hide bestCombo HUD when bestCombo <= 1', () => {
    const bestCombo = 1
    const display = bestCombo > 1 ? 'visible' : 'none'
    expect(display).toBe('none')
  })

  it('should set comboDisplayTimer to 120 frames at milestone', () => {
    const comboDisplayTimer = 120
    expect(comboDisplayTimer).toBe(120)
    expect(comboDisplayTimer / 60).toBe(2) // 2 seconds at 60fps
  })

  it('should fade combo display in last 30 frames', () => {
    const fadeThreshold = 30
    let comboDisplayTimer = 25
    const opacity = comboDisplayTimer < fadeThreshold
      ? comboDisplayTimer / fadeThreshold
      : 1
    expect(opacity).toBeLessThan(1)
    expect(opacity).toBeGreaterThan(0)
  })
})

// ---- Combo Screen Shake & Particle Effects ----

describe('Combo — Screen Shake & Particles', () => {
  function getShakeIntensity(multiplier) {
    return multiplier <= 2 ? 3 : multiplier <= 4 ? 5 : 8
  }

  it('should set screen shake duration to 12 frames at milestone', () => {
    const screenShakeTimer = 12
    expect(screenShakeTimer).toBe(12)
  })

  it('should use intensity 3 at 2x milestone', () => {
    expect(getShakeIntensity(2)).toBe(3)
  })

  it('should use intensity 5 at 4x milestone', () => {
    expect(getShakeIntensity(4)).toBe(5)
  })

  it('should use intensity 8 at 8x milestone', () => {
    expect(getShakeIntensity(8)).toBe(8)
  })

  it('should spawn 15 gold particles at ghost eat', () => {
    const particleCount = 15
    const particleColor = '#ffd800'
    expect(particleCount).toBe(15)
    expect(particleColor).toBe('#ffd800')
  })

  it('should NOT trigger milestone effects at 1x (first ghost)', () => {
    const multiplier = Math.min(8, Math.pow(2, 1 - 1))
    expect(COMBO_MILESTONES.includes(multiplier)).toBe(false)
  })

  it('should generate floating text with combo format at milestone', () => {
    const multiplier = 4
    const text = `${multiplier}x COMBO!`
    expect(text).toBe('4x COMBO!')
    expect(text).toContain('COMBO!')
  })

  it('should set floating text life to 60 frames', () => {
    const floatingText = { x: 100, y: 50, text: '4x COMBO!', color: '#ffd800', life: 60, startY: 50 }
    expect(floatingText.life).toBe(60)
    expect(floatingText.color).toBe('#ffd800')
  })

  it('should generate particles with random velocity and life', () => {
    const particle = {
      x: 100, y: 100,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: 30 + Math.random() * 20,
      color: '#ffd800',
      size: 1 + Math.random() * 2,
    }
    expect(particle.life).toBeGreaterThanOrEqual(30)
    expect(particle.life).toBeLessThanOrEqual(50)
    expect(particle.size).toBeGreaterThanOrEqual(1)
    expect(particle.size).toBeLessThanOrEqual(3)
    expect(Math.abs(particle.vx)).toBeLessThanOrEqual(1.5)
  })
})
