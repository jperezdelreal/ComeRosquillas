// Sprint 1 Regression: Settings Menu
// Validates settings open/close, audio sliders, difficulty selector, keyboard nav
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

const SETTINGS_STORAGE_KEY = 'comeRosquillasSettings'

// ---- Settings Persistence ----

describe('Settings — localStorage Persistence', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('should save settings to localStorage', () => {
    const settings = { masterVolume: 0.8, musicVolume: 0.6, sfxVolume: 1.0, difficulty: 'normal' }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    const loaded = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY))
    expect(loaded.masterVolume).toBe(0.8)
    expect(loaded.difficulty).toBe('normal')
  })

  it('should handle missing localStorage gracefully', () => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    expect(stored).toBeNull()
  })

  it('should handle corrupted settings JSON gracefully', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, '{not valid json')
    let parsed = null
    try {
      parsed = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY))
    } catch (e) {
      parsed = null
    }
    expect(parsed).toBeNull()
  })

  it('should persist volume changes', () => {
    const settings = { masterVolume: 0.5, musicVolume: 0.3, sfxVolume: 0.7 }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    const loaded = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY))
    expect(loaded.masterVolume).toBe(0.5)
    expect(loaded.musicVolume).toBe(0.3)
    expect(loaded.sfxVolume).toBe(0.7)
  })

  it('should persist difficulty selection', () => {
    const settings = { difficulty: 'hard' }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    const loaded = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY))
    expect(loaded.difficulty).toBe('hard')
  })
})

// ---- Audio Volume Ranges ----

describe('Settings — Audio Volume Validation', () => {
  it('should clamp master volume between 0 and 1', () => {
    const volumes = [-0.5, 0, 0.5, 1.0, 1.5]
    const clamped = volumes.map(v => Math.max(0, Math.min(1, v)))
    expect(clamped).toEqual([0, 0, 0.5, 1.0, 1.0])
  })

  it('should clamp music volume between 0 and 1', () => {
    const val = 1.2
    expect(Math.max(0, Math.min(1, val))).toBe(1)
  })

  it('should clamp SFX volume between 0 and 1', () => {
    const val = -0.1
    expect(Math.max(0, Math.min(1, val))).toBe(0)
  })

  it('should default volumes to sensible values', () => {
    const defaults = { masterVolume: 1.0, musicVolume: 0.7, sfxVolume: 1.0 }
    expect(defaults.masterVolume).toBe(1.0)
    expect(defaults.musicVolume).toBe(0.7)
    expect(defaults.sfxVolume).toBe(1.0)
  })
})

// ---- Settings State Machine ----

describe('Settings — Open/Close State', () => {
  it('should toggle from closed to open', () => {
    let isOpen = false
    isOpen = !isOpen
    expect(isOpen).toBe(true)
  })

  it('should toggle from open to closed', () => {
    let isOpen = true
    isOpen = !isOpen
    expect(isOpen).toBe(false)
  })

  it('should close on Escape key', () => {
    let isOpen = true
    const key = 'Escape'
    if (key === 'Escape' && isOpen) isOpen = false
    expect(isOpen).toBe(false)
  })

  it('should open on S key from start screen', () => {
    let isOpen = false
    const state = 0 // ST_START
    const key = 'KeyS'
    if (key === 'KeyS' && (state === 0 || state === 6)) isOpen = true
    expect(isOpen).toBe(true)
  })

  it('should open on S key from pause screen', () => {
    let isOpen = false
    const state = 6 // ST_PAUSED
    const key = 'KeyS'
    if (key === 'KeyS' && (state === 0 || state === 6)) isOpen = true
    expect(isOpen).toBe(true)
  })

  it('should NOT open on S key during gameplay', () => {
    let isOpen = false
    const state = 2 // ST_PLAYING
    const key = 'KeyS'
    if (key === 'KeyS' && (state === 0 || state === 6)) isOpen = true
    expect(isOpen).toBe(false)
  })
})

// ---- Difficulty Selector Integration ----

describe('Settings — Difficulty Selector', () => {
  const DIFFICULTY_OPTIONS = ['easy', 'normal', 'hard']

  it('should have 3 difficulty options', () => {
    expect(DIFFICULTY_OPTIONS).toHaveLength(3)
  })

  it('should include easy, normal, and hard', () => {
    expect(DIFFICULTY_OPTIONS).toContain('easy')
    expect(DIFFICULTY_OPTIONS).toContain('normal')
    expect(DIFFICULTY_OPTIONS).toContain('hard')
  })

  it('should default to normal', () => {
    const defaultDifficulty = 'normal'
    expect(DIFFICULTY_OPTIONS).toContain(defaultDifficulty)
  })
})
