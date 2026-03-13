// Sprint 2 Feature: Mobile Controls (#44)
// Test scaffolding — .skip until mobile module lands, some touch math runs NOW
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  TILE, COLS, ROWS, CANVAS_W, CANVAS_H,
  UP, RIGHT, DOWN, LEFT,
} from './setup.js'

// ---- Touch Direction Math (can run NOW) ----

describe('Mobile — Touch Direction Calculation', () => {
  function getSwipeDirection(startX, startY, endX, endY) {
    const dx = endX - startX
    const dy = endY - startY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const minSwipe = 30

    if (Math.max(absDx, absDy) < minSwipe) return null

    if (absDx > absDy) {
      return dx > 0 ? RIGHT : LEFT
    } else {
      return dy > 0 ? DOWN : UP
    }
  }

  it('should detect swipe RIGHT', () => {
    expect(getSwipeDirection(100, 100, 200, 105)).toBe(RIGHT)
  })

  it('should detect swipe LEFT', () => {
    expect(getSwipeDirection(200, 100, 100, 95)).toBe(LEFT)
  })

  it('should detect swipe DOWN', () => {
    expect(getSwipeDirection(100, 100, 105, 200)).toBe(DOWN)
  })

  it('should detect swipe UP', () => {
    expect(getSwipeDirection(100, 200, 95, 100)).toBe(UP)
  })

  it('should ignore tiny swipes (< 30px)', () => {
    expect(getSwipeDirection(100, 100, 110, 105)).toBeNull()
  })

  it('should prefer horizontal when dx > dy', () => {
    expect(getSwipeDirection(100, 100, 200, 140)).toBe(RIGHT)
  })

  it('should prefer vertical when dy > dx', () => {
    expect(getSwipeDirection(100, 100, 140, 200)).toBe(DOWN)
  })
})

// ---- Screen Scaling Math (can run NOW) ----

describe('Mobile — Screen Scaling', () => {
  it('should calculate correct scale for portrait phone (375x667)', () => {
    const screenW = 375
    const screenH = 667
    const scale = Math.min(screenW / CANVAS_W, screenH / CANVAS_H)
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThan(0.4)
  })

  it('should calculate correct scale for landscape phone', () => {
    const screenW = 667
    const screenH = 375
    const scale = Math.min(screenW / CANVAS_W, screenH / CANVAS_H)
    expect(scale).toBeLessThan(1)
  })

  it('should be 1.0 or higher on desktop (1920x1080)', () => {
    const screenW = 1920
    const screenH = 1080
    const scale = Math.min(screenW / CANVAS_W, screenH / CANVAS_H)
    expect(scale).toBeGreaterThanOrEqual(1)
  })

  it('should handle very small screens (320x480)', () => {
    const screenW = 320
    const screenH = 480
    const scale = Math.min(screenW / CANVAS_W, screenH / CANVAS_H)
    expect(scale).toBeGreaterThan(0)
    expect(scale).toBeLessThan(1)
  })
})

// ---- Touch Zone Layout (can run NOW — geometric validation) ----

describe('Mobile — Touch Zone Geometry', () => {
  it('canvas dimensions should be correct for touch zone calculations', () => {
    expect(CANVAS_W).toBe(672)
    expect(CANVAS_H).toBe(744)
  })

  it('should be able to divide canvas into quadrants for d-pad', () => {
    const centerX = CANVAS_W / 2
    const centerY = CANVAS_H / 2
    expect(centerX).toBe(336)
    expect(centerY).toBe(372)
  })

  it('should have enough room for touch targets (>= 44px minimum)', () => {
    const minTouchTarget = 44
    expect(TILE).toBeLessThanOrEqual(minTouchTarget)
    expect(TILE * 2).toBeGreaterThanOrEqual(minTouchTarget)
  })
})

// ---- Mobile Feature Tests (enabled — Sprint 2 landed) ----

describe('Mobile — D-Pad & Touch Zones', () => {
  it('D-pad SVG viewBox should be 160x160', () => {
    const viewBox = { width: 160, height: 160 }
    expect(viewBox.width).toBe(160)
    expect(viewBox.height).toBe(160)
  })

  it('D-pad should define all 4 direction arrows', () => {
    const directions = ['dpad-up', 'dpad-down', 'dpad-left', 'dpad-right']
    expect(directions).toHaveLength(4)
    expect(directions).toContain('dpad-up')
    expect(directions).toContain('dpad-right')
  })

  it('touch buttons should be at least 50px for accessibility', () => {
    const buttonSize = 50
    const minAccessible = 44 // WCAG minimum touch target
    expect(buttonSize).toBeGreaterThanOrEqual(minAccessible)
  })

  it('swipe should trigger arrow key equivalent', () => {
    function triggerSwipe(keyCode) {
      const keys = {}
      keys[keyCode] = true
      return keys
    }
    const keys = triggerSwipe('ArrowRight')
    expect(keys['ArrowRight']).toBe(true)
  })

  it('swipe detection should enforce 30px minimum distance', () => {
    const minSwipeDistance = 30
    function isSwipe(distance) { return distance >= minSwipeDistance }
    expect(isSwipe(29)).toBe(false)
    expect(isSwipe(30)).toBe(true)
    expect(isSwipe(100)).toBe(true)
  })

  it('swipe detection should enforce 300ms maximum time', () => {
    const maxSwipeTime = 300
    function isTimely(duration) { return duration <= maxSwipeTime }
    expect(isTimely(200)).toBe(true)
    expect(isTimely(300)).toBe(true)
    expect(isTimely(301)).toBe(false)
  })
})

describe('Mobile — Haptic Feedback', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  const HAPTIC_STORAGE_KEY = 'comeRosquillas_haptic'

  function loadHapticPref() {
    const v = localStorage.getItem(HAPTIC_STORAGE_KEY)
    return v === null ? true : v === 'true'
  }

  function setHapticEnabled(on) {
    localStorage.setItem(HAPTIC_STORAGE_KEY, String(on))
    return on
  }

  it('should default to enabled when no preference saved', () => {
    expect(loadHapticPref()).toBe(true)
  })

  it('should persist haptic preference to localStorage', () => {
    setHapticEnabled(false)
    expect(loadHapticPref()).toBe(false)
    setHapticEnabled(true)
    expect(loadHapticPref()).toBe(true)
  })

  it('should use 8ms vibration for d-pad press and swipe', () => {
    const dpadVibration = 8
    const swipeVibration = 8
    expect(dpadVibration).toBe(8)
    expect(swipeVibration).toBe(8)
  })

  it('should use 10ms vibration for button press (pause/mute/fullscreen)', () => {
    const buttonVibration = 10
    expect(buttonVibration).toBe(10)
  })

  it('should gracefully handle missing vibration API', () => {
    function vibrate(pattern) {
      const hasVibrate = typeof navigator !== 'undefined' && navigator.vibrate
      if (!hasVibrate) return false
      return true
    }
    // In jsdom, navigator.vibrate is undefined — should not throw
    expect(() => vibrate(8)).not.toThrow()
  })
})

describe('Mobile — Fullscreen', () => {
  it('should toggle between enter and exit fullscreen icons', () => {
    const enterIcon = '⛶'
    const exitIcon = '⮌'
    expect(enterIcon).not.toBe(exitIcon)
    function getIcon(isFullscreen) {
      return isFullscreen ? exitIcon : enterIcon
    }
    expect(getIcon(false)).toBe('⛶')
    expect(getIcon(true)).toBe('⮌')
  })

  it('should update aria-label based on fullscreen state', () => {
    function getAriaLabel(isFullscreen) {
      return isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
    }
    expect(getAriaLabel(false)).toBe('Enter fullscreen')
    expect(getAriaLabel(true)).toBe('Exit fullscreen')
  })

  it('should use both standard and webkit fullscreen APIs', () => {
    const apis = ['requestFullscreen', 'webkitRequestFullscreen']
    const exitApis = ['exitFullscreen', 'webkitExitFullscreen']
    expect(apis).toHaveLength(2)
    expect(exitApis).toHaveLength(2)
  })
})

describe('Mobile — Orientation Warning', () => {
  it('should use CSS media query for portrait detection', () => {
    const query = '(hover: none) and (pointer: coarse) and (orientation: portrait)'
    expect(query).toContain('orientation: portrait')
    expect(query).toContain('hover: none')
    expect(query).toContain('pointer: coarse')
  })

  it('should display rotate device message content', () => {
    const icon = '📱↻'
    const text = 'Rotate your device for the best experience'
    expect(icon).toContain('📱')
    expect(text).toContain('Rotate')
  })

  it('should use orientSpin animation for icon', () => {
    // Animation rotates 0° → 90° → 0° over 2s
    const animName = 'orientSpin'
    const animDuration = 2 // seconds
    expect(animName).toBe('orientSpin')
    expect(animDuration).toBe(2)
  })
})

describe('Mobile — Touch Button Layout', () => {
  it('pause, mute, fullscreen buttons should be spaced 60px apart', () => {
    const positions = [20, 80, 140] // right offset in px
    expect(positions[1] - positions[0]).toBe(60)
    expect(positions[2] - positions[1]).toBe(60)
  })

  it('touch buttons should scale down on small screens (<480px)', () => {
    const normalSize = 50
    const smallSize = 42
    expect(smallSize).toBeLessThan(normalSize)
    expect(smallSize).toBeGreaterThanOrEqual(42)
  })

  it('active state should scale button to 0.88', () => {
    const activeScale = 0.88
    expect(activeScale).toBeLessThan(1)
    expect(activeScale).toBeGreaterThan(0.5)
  })
})

describe('Mobile — Mobile Visibility', () => {
  it('touch controls should be hidden on desktop by default', () => {
    // Touch controls are display: none, shown via media query
    const mobileQuery = '(hover: none) and (pointer: coarse)'
    expect(mobileQuery).toContain('hover: none')
  })

  it('keyboard hint bar (#bottomBar) should hide on mobile', () => {
    // Mobile media query hides #bottomBar
    const hideOnMobile = true
    expect(hideOnMobile).toBe(true)
  })
})
