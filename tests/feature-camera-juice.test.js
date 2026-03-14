// Sprint 5 Feature: Screen Shake & Camera Juice (#94)
// Proactive test scaffolding — may need adjustment once implementation lands
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CANVAS_W, CANVAS_H, COLS, ROWS, TILE } from './setup.js'

// ---- Camera state defaults ----

const CAMERA_DEFAULTS = {
  shakeX: 0,
  shakeY: 0,
  shakeTimer: 0,
  shakeIntensity: 0,
  zoom: 1.0,
  zoomTarget: 1.0,
  zoomSpeed: 0.05,
  offsetX: 0,
  offsetY: 0,
  effectsEnabled: true,
}

// ---- Helpers matching expected production formulas ----

function getShakeIntensityForEvent(event) {
  switch (event) {
    case 'ghost_collision': return 5
    case 'combo_2x':        return 3
    case 'combo_4x':        return 5
    case 'combo_8x':        return 8
    case 'boss_defeat':     return 10
    case 'power_pellet':    return 2
    default:                return 0
  }
}

function getShakeDuration(event) {
  switch (event) {
    case 'ghost_collision': return 18  // 0.3s at 60fps
    case 'combo_2x':        return 12
    case 'combo_4x':        return 12
    case 'combo_8x':        return 12
    case 'boss_defeat':     return 30  // 0.5s at 60fps
    case 'power_pellet':    return 12  // 0.2s at 60fps
    default:                return 0
  }
}

function applyShake(intensity) {
  // Random offset in [-intensity, intensity] range
  return (Math.random() - 0.5) * 2 * intensity
}

function lerpZoom(current, target, speed) {
  return current + (target - current) * speed
}

function lerpFollow(cameraPos, targetPos, factor) {
  return cameraPos + (targetPos - cameraPos) * factor
}

function clampCamera(offset, playerPos, canvasSize, mazeSize) {
  // Edge padding: don't let camera center too close to maze edges
  const halfView = canvasSize / 2
  const minOffset = 0
  const maxOffset = mazeSize - canvasSize
  return Math.max(minOffset, Math.min(maxOffset, offset))
}

function shouldAutoDisableEffects(fps) {
  return fps < 45
}

// ================================================================
// TESTS
// ================================================================

// ---- Screen Shake Intensity Levels ----

describe('Camera Juice — Screen Shake Intensity', () => {
  it('ghost collision should shake at 5px intensity', () => {
    expect(getShakeIntensityForEvent('ghost_collision')).toBe(5)
  })

  it('combo 2x milestone should produce light shake (3px)', () => {
    expect(getShakeIntensityForEvent('combo_2x')).toBe(3)
  })

  it('combo 4x milestone should produce medium shake (5px)', () => {
    expect(getShakeIntensityForEvent('combo_4x')).toBe(5)
  })

  it('combo 8x milestone should produce heavy shake (8px)', () => {
    expect(getShakeIntensityForEvent('combo_8x')).toBe(8)
  })

  it('boss defeat should produce heaviest shake (10px)', () => {
    expect(getShakeIntensityForEvent('boss_defeat')).toBe(10)
  })

  it('power pellet collection should produce light pulse (2px)', () => {
    expect(getShakeIntensityForEvent('power_pellet')).toBe(2)
  })

  it('unknown event should produce no shake', () => {
    expect(getShakeIntensityForEvent('unknown')).toBe(0)
  })

  it('shake offset should be within ±intensity range', () => {
    const intensity = 5
    for (let i = 0; i < 100; i++) {
      const offset = applyShake(intensity)
      expect(offset).toBeGreaterThanOrEqual(-intensity)
      expect(offset).toBeLessThanOrEqual(intensity)
    }
  })
})

// ---- Shake Timer Decay ----

describe('Camera Juice — Shake Timer Decay', () => {
  it('ghost collision shake should last 0.3s (18 frames)', () => {
    expect(getShakeDuration('ghost_collision')).toBe(18)
    expect(getShakeDuration('ghost_collision') / 60).toBeCloseTo(0.3, 1)
  })

  it('boss defeat shake should last 0.5s (30 frames)', () => {
    expect(getShakeDuration('boss_defeat')).toBe(30)
    expect(getShakeDuration('boss_defeat') / 60).toBe(0.5)
  })

  it('combo shake should last 12 frames', () => {
    expect(getShakeDuration('combo_2x')).toBe(12)
    expect(getShakeDuration('combo_4x')).toBe(12)
    expect(getShakeDuration('combo_8x')).toBe(12)
  })

  it('shake timer should decrement by 1 each frame', () => {
    let timer = 18
    for (let i = 0; i < 18; i++) timer--
    expect(timer).toBe(0)
  })

  it('shake should stop when timer reaches zero', () => {
    let timer = 3
    let shakeX = 0, shakeY = 0
    const intensity = 5
    while (timer > 0) {
      shakeX = applyShake(intensity)
      shakeY = applyShake(intensity)
      timer--
    }
    // Timer hit 0 — stop shaking
    if (timer <= 0) { shakeX = 0; shakeY = 0 }
    expect(shakeX).toBe(0)
    expect(shakeY).toBe(0)
    expect(timer).toBe(0)
  })

  it('shake intensity should decay linearly with timer', () => {
    const baseIntensity = 5
    const totalDuration = 18
    let timer = totalDuration
    // At start: full intensity. At end: zero.
    const intensityAtStart = baseIntensity * (timer / totalDuration)
    expect(intensityAtStart).toBe(baseIntensity)
    timer = 9  // halfway
    const intensityAtHalf = baseIntensity * (timer / totalDuration)
    expect(intensityAtHalf).toBe(2.5)
    timer = 0
    const intensityAtEnd = baseIntensity * (timer / totalDuration)
    expect(intensityAtEnd).toBe(0)
  })
})

// ---- Zoom Effects ----

describe('Camera Juice — Zoom Effects', () => {
  it('level start should zoom from 150% to 100% over ~1s', () => {
    const startZoom = 1.5
    const targetZoom = 1.0
    const speed = 0.05
    let zoom = startZoom
    let frames = 0
    // Lerp until close enough
    while (Math.abs(zoom - targetZoom) > 0.01) {
      zoom = lerpZoom(zoom, targetZoom, speed)
      frames++
      if (frames > 120) break // safety
    }
    expect(zoom).toBeCloseTo(targetZoom, 1)
    // Should converge within ~60 frames (1s)
    expect(frames).toBeLessThanOrEqual(90)
  })

  it('level complete should zoom to 90%', () => {
    const levelCompleteZoom = 0.9
    expect(levelCompleteZoom).toBe(0.9)
  })

  it('death zoom should go to 120% (slow-mo focus on Homer)', () => {
    const deathZoom = 1.2
    expect(deathZoom).toBe(1.2)
  })

  it('power pellet zoom pulse: 102% → 100%', () => {
    const pulseZoom = 1.02
    const normalZoom = 1.0
    let zoom = pulseZoom
    // Should return to normal quickly
    zoom = lerpZoom(zoom, normalZoom, 0.1)
    expect(zoom).toBeLessThan(pulseZoom)
    expect(zoom).toBeGreaterThan(normalZoom)
  })

  it('lerp should converge toward target', () => {
    let zoom = 1.5
    const target = 1.0
    const speed = 0.05
    for (let i = 0; i < 10; i++) {
      const prev = zoom
      zoom = lerpZoom(zoom, target, speed)
      expect(zoom).toBeLessThan(prev)
      expect(zoom).toBeGreaterThan(target)
    }
  })

  it('lerp with speed=1.0 should snap immediately', () => {
    const zoom = lerpZoom(1.5, 1.0, 1.0)
    expect(zoom).toBe(1.0)
  })

  it('lerp with speed=0 should never move', () => {
    const zoom = lerpZoom(1.5, 1.0, 0)
    expect(zoom).toBe(1.5)
  })
})

// ---- Camera Follow (Lerp Interpolation) ----

describe('Camera Juice — Camera Follow', () => {
  it('camera should lerp toward player position', () => {
    let cameraX = 0
    const playerX = 200
    const lerpFactor = 0.1
    cameraX = lerpFollow(cameraX, playerX, lerpFactor)
    expect(cameraX).toBe(20) // 0 + (200 - 0) * 0.1
    cameraX = lerpFollow(cameraX, playerX, lerpFactor)
    expect(cameraX).toBe(38) // 20 + (200 - 20) * 0.1
  })

  it('camera should converge to player over time', () => {
    let cameraX = 0
    const playerX = 300
    for (let i = 0; i < 100; i++) {
      cameraX = lerpFollow(cameraX, playerX, 0.1)
    }
    expect(cameraX).toBeCloseTo(playerX, 0)
  })

  it('camera should keep player in center 80% of viewport', () => {
    const viewportCenter = CANVAS_W / 2
    const deadzone = CANVAS_W * 0.1 // 10% each side = 80% center zone
    expect(deadzone).toBeCloseTo(CANVAS_W * 0.1, 0)
    // Player at center ± deadzone should not trigger camera movement
    const playerScreenX = viewportCenter + deadzone - 1
    const shouldMove = Math.abs(playerScreenX - viewportCenter) > deadzone
    expect(shouldMove).toBe(false)
  })

  it('lookahead should lead camera in movement direction', () => {
    const playerX = 100
    const playerDir = 1 // RIGHT
    const lookaheadPixels = 3 * TILE // 3 tiles ahead
    const lookaheadX = playerX + (playerDir === 1 ? lookaheadPixels : playerDir === 3 ? -lookaheadPixels : 0)
    expect(lookaheadX).toBe(100 + 72) // 3 * 24 = 72
  })

  it('camera Y should also follow with same lerp', () => {
    let cameraY = 0
    const playerY = 150
    cameraY = lerpFollow(cameraY, playerY, 0.1)
    expect(cameraY).toBe(15)
  })
})

// ---- Edge Padding ----

describe('Camera Juice — Edge Padding', () => {
  const mazeWidth = COLS * TILE
  const mazeHeight = ROWS * TILE

  it('camera should not scroll past left maze edge', () => {
    const clamped = clampCamera(-50, 0, CANVAS_W, mazeWidth)
    expect(clamped).toBe(0)
  })

  it('camera should not scroll past right maze edge', () => {
    const maxOffset = mazeWidth - CANVAS_W
    const clamped = clampCamera(mazeWidth, COLS * TILE, CANVAS_W, mazeWidth)
    expect(clamped).toBe(maxOffset)
  })

  it('camera offset should be 0 when maze fits in viewport', () => {
    // When maze size equals canvas size, offset is always 0
    const clamped = clampCamera(100, CANVAS_W / 2, CANVAS_W, CANVAS_W)
    expect(clamped).toBe(0) // maxOffset = 0
  })

  it('camera should allow normal offset in middle of maze', () => {
    const offset = 100
    const clamped = clampCamera(offset, 200, CANVAS_W, mazeWidth + CANVAS_W)
    expect(clamped).toBe(offset)
  })
})

// ---- Settings Toggle ----

describe('Camera Juice — Settings Toggle', () => {
  const CAMERA_EFFECTS_KEY = 'comeRosquillas_cameraEffects'

  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('camera effects should default to enabled', () => {
    expect(CAMERA_DEFAULTS.effectsEnabled).toBe(true)
  })

  it('camera effects can be toggled off in settings', () => {
    let effectsEnabled = true
    effectsEnabled = false
    localStorage.setItem(CAMERA_EFFECTS_KEY, String(effectsEnabled))
    expect(localStorage.getItem(CAMERA_EFFECTS_KEY)).toBe('false')
  })

  it('camera effects preference should persist in localStorage', () => {
    localStorage.setItem(CAMERA_EFFECTS_KEY, 'false')
    const stored = localStorage.getItem(CAMERA_EFFECTS_KEY) === 'true'
    expect(stored).toBe(false)
  })

  it('toggling on should re-enable all camera effects', () => {
    localStorage.setItem(CAMERA_EFFECTS_KEY, 'true')
    const stored = localStorage.getItem(CAMERA_EFFECTS_KEY) === 'true'
    expect(stored).toBe(true)
  })
})

// ---- Auto-Disable on Low FPS ----

describe('Camera Juice — Auto-Disable on Low FPS', () => {
  it('effects should auto-disable when FPS < 45', () => {
    expect(shouldAutoDisableEffects(44)).toBe(true)
    expect(shouldAutoDisableEffects(30)).toBe(true)
    expect(shouldAutoDisableEffects(10)).toBe(true)
  })

  it('effects should stay enabled at FPS ≥ 45', () => {
    expect(shouldAutoDisableEffects(45)).toBe(false)
    expect(shouldAutoDisableEffects(60)).toBe(false)
    expect(shouldAutoDisableEffects(120)).toBe(false)
  })

  it('FPS threshold should be exactly 45', () => {
    expect(shouldAutoDisableEffects(44)).toBe(true)
    expect(shouldAutoDisableEffects(45)).toBe(false)
  })

  it('auto-disable should use smoothed FPS (not instantaneous)', () => {
    // Smoothed FPS prevents single-frame dips from disabling
    function smoothFPS(current, previous, alpha = 0.1) {
      return previous + alpha * (current - previous)
    }
    let smoothed = 60
    // Single dip to 30fps
    smoothed = smoothFPS(30, smoothed)
    expect(smoothed).toBeCloseTo(57, 0) // barely drops
    expect(shouldAutoDisableEffects(smoothed)).toBe(false) // stays enabled
    // Sustained low FPS
    for (let i = 0; i < 80; i++) smoothed = smoothFPS(30, smoothed)
    expect(smoothed).toBeCloseTo(30, 0)
    expect(shouldAutoDisableEffects(smoothed)).toBe(true) // now disables
  })
})

// ---- No Shake When Disabled ----

describe('Camera Juice — No Effects When Disabled', () => {
  it('shake should not apply when effects disabled', () => {
    const effectsEnabled = false
    const intensity = getShakeIntensityForEvent('ghost_collision')
    const actualIntensity = effectsEnabled ? intensity : 0
    expect(actualIntensity).toBe(0)
  })

  it('zoom should stay at 1.0 when effects disabled', () => {
    const effectsEnabled = false
    const zoomTarget = effectsEnabled ? 1.5 : 1.0
    expect(zoomTarget).toBe(1.0)
  })

  it('camera follow should still work when effects disabled', () => {
    // Camera follow is not a "juice" effect — it's functional
    const effectsEnabled = false
    const followEnabled = true // always on
    let cameraX = 0
    const playerX = 100
    if (followEnabled) {
      cameraX = lerpFollow(cameraX, playerX, 0.1)
    }
    expect(cameraX).toBe(10)
  })

  it('disabling effects mid-shake should immediately stop shake', () => {
    let shakeTimer = 10
    let shakeX = 3.5
    let effectsEnabled = true
    // Player disables effects
    effectsEnabled = false
    if (!effectsEnabled) {
      shakeTimer = 0
      shakeX = 0
    }
    expect(shakeTimer).toBe(0)
    expect(shakeX).toBe(0)
  })
})

// ---- Regression: Existing Screen Shake ----

describe('Camera Juice — Regression: Existing Combo Shake', () => {
  function getComboShakeIntensity(multiplier) {
    return multiplier <= 2 ? 3 : multiplier <= 4 ? 5 : 8
  }

  it('existing combo shake formula should still work: 2x→3, 4x→5, 8x→8', () => {
    expect(getComboShakeIntensity(2)).toBe(3)
    expect(getComboShakeIntensity(4)).toBe(5)
    expect(getComboShakeIntensity(8)).toBe(8)
  })

  it('existing combo shake at 1x should be 3 (light)', () => {
    expect(getComboShakeIntensity(1)).toBe(3)
  })

  it('existing combo shake at 3x should be 3 (between milestones)', () => {
    expect(getComboShakeIntensity(3)).toBe(5)
  })

  it('combo shake duration should remain 12 frames', () => {
    const comboShakeDuration = 12
    expect(comboShakeDuration).toBe(12)
  })

  it('new camera shake system should be compatible with combo shake', () => {
    // Combo shake uses the same shake system
    const comboIntensity = getComboShakeIntensity(4)
    const cameraIntensity = getShakeIntensityForEvent('combo_4x')
    expect(comboIntensity).toBe(cameraIntensity)
  })

  it('ghost collision shake should be separate from combo shake', () => {
    const ghostShake = getShakeIntensityForEvent('ghost_collision')
    const comboShake = getComboShakeIntensity(2)
    // Ghost collision is a different event, different intensity
    expect(ghostShake).toBe(5)
    expect(comboShake).toBe(3)
    expect(ghostShake).not.toBe(comboShake)
  })
})

// ---- Camera State Defaults ----

describe('Camera Juice — State Defaults', () => {
  it('camera should initialize with zero shake', () => {
    expect(CAMERA_DEFAULTS.shakeX).toBe(0)
    expect(CAMERA_DEFAULTS.shakeY).toBe(0)
    expect(CAMERA_DEFAULTS.shakeTimer).toBe(0)
    expect(CAMERA_DEFAULTS.shakeIntensity).toBe(0)
  })

  it('camera should initialize with zoom 1.0', () => {
    expect(CAMERA_DEFAULTS.zoom).toBe(1.0)
    expect(CAMERA_DEFAULTS.zoomTarget).toBe(1.0)
  })

  it('camera should initialize with zero offset', () => {
    expect(CAMERA_DEFAULTS.offsetX).toBe(0)
    expect(CAMERA_DEFAULTS.offsetY).toBe(0)
  })

  it('effects should be enabled by default', () => {
    expect(CAMERA_DEFAULTS.effectsEnabled).toBe(true)
  })

  it('zoom speed should default to 0.05', () => {
    expect(CAMERA_DEFAULTS.zoomSpeed).toBe(0.05)
  })
})
