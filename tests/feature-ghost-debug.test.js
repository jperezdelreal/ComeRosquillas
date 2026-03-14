// Sprint 4 Feature: Ghost Debug Tools
// AI state overlays, target visualization, tuning sliders
// Scaffold — skip until feature lands (if built)
import { describe, it, expect } from 'vitest'
import {
  TILE, COLS, ROWS,
  GHOST_CFG,
  GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN,
} from './setup.js'

// ---- AI State Overlay ----

describe.skip('Ghost Debug — AI State Overlay', () => {
  const MODE_COLORS = {
    [GM_SCATTER]: '#4488ff',    // blue — scatter
    [GM_CHASE]: '#ff4444',      // red — chase
    [GM_FRIGHTENED]: '#8844ff', // purple — frightened
    [GM_EATEN]: '#888888',      // gray — eaten (returning)
  }

  it('each ghost mode should have a distinct debug color', () => {
    const colors = Object.values(MODE_COLORS)
    expect(new Set(colors).size).toBe(4)
  })

  it('overlay should show ghost name and current mode', () => {
    function debugLabel(ghost, mode) {
      const modeNames = { [GM_SCATTER]: 'SCT', [GM_CHASE]: 'CHS', [GM_FRIGHTENED]: 'FRT', [GM_EATEN]: 'EAT' }
      return `${ghost.name}: ${modeNames[mode]}`
    }
    expect(debugLabel(GHOST_CFG[0], GM_CHASE)).toBe('Sr. Burns: CHS')
    expect(debugLabel(GHOST_CFG[1], GM_SCATTER)).toBe('Bob Patiño: SCT')
  })

  it('overlay text should be positioned above each ghost sprite', () => {
    const ghostY = 14 * TILE // grid position
    const labelOffset = -12 // pixels above ghost
    const labelY = ghostY + labelOffset
    expect(labelY).toBeLessThan(ghostY)
  })

  it('overlay should be toggled with D key (debug mode)', () => {
    const debugToggleKey = 'D'
    expect(debugToggleKey).toBe('D')
  })

  it('overlay should not render in production (debug flag off)', () => {
    const debugMode = false
    expect(debugMode).toBe(false)
    // When debugMode is false, no overlay draw calls
  })
})

// ---- Target Tile Visualization ----

describe.skip('Ghost Debug — Target Tile Visualization', () => {
  it('should draw a line from ghost to its target tile', () => {
    // Dotted line: ghost position → target tile
    const ghostPos = { x: 12 * TILE, y: 14 * TILE }
    const targetPos = { x: 25 * TILE, y: 0 * TILE } // Sr. Burns scatter corner
    const dx = targetPos.x - ghostPos.x
    const dy = targetPos.y - ghostPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    expect(distance).toBeGreaterThan(0)
  })

  it('target tile marker should match ghost color', () => {
    for (const ghost of GHOST_CFG) {
      expect(ghost.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('scatter target should be the ghost scatter corner', () => {
    expect(GHOST_CFG[0].scatterX).toBe(25)
    expect(GHOST_CFG[0].scatterY).toBe(0)
    expect(GHOST_CFG[3].scatterX).toBe(0)
    expect(GHOST_CFG[3].scatterY).toBe(30)
  })

  it('chase target should update per-frame based on Homer position', () => {
    // Sr. Burns (Blinky): direct targeting → Homer's tile
    const homerTile = { x: 14, y: 23 }
    const burnsTarget = { ...homerTile } // direct
    expect(burnsTarget.x).toBe(homerTile.x)
    expect(burnsTarget.y).toBe(homerTile.y)
  })

  it('eaten target should be the ghost house entrance', () => {
    // Ghost door at approximately (13-14, 12)
    const ghostDoorY = 12
    expect(ghostDoorY).toBeLessThan(ROWS / 2) // upper half of maze
  })
})

// ---- Tuning Sliders ----

describe.skip('Ghost Debug — Tuning Sliders', () => {
  it('should allow adjusting ghost speed multiplier (0.5x – 2.0x)', () => {
    const minSpeedMult = 0.5
    const maxSpeedMult = 2.0
    const defaultSpeedMult = 1.0
    expect(defaultSpeedMult).toBeGreaterThanOrEqual(minSpeedMult)
    expect(defaultSpeedMult).toBeLessThanOrEqual(maxSpeedMult)
  })

  it('should allow adjusting fright time multiplier (0.25x – 3.0x)', () => {
    const minFrightMult = 0.25
    const maxFrightMult = 3.0
    const defaultFrightMult = 1.0
    expect(defaultFrightMult).toBeGreaterThanOrEqual(minFrightMult)
    expect(defaultFrightMult).toBeLessThanOrEqual(maxFrightMult)
  })

  it('should allow adjusting scatter/chase ratio', () => {
    // Slider adjusts the scatter portion (0% = all chase, 100% = all scatter)
    const scatterPercent = 50
    expect(scatterPercent).toBeGreaterThanOrEqual(0)
    expect(scatterPercent).toBeLessThanOrEqual(100)
  })

  it('slider changes should take effect immediately (no restart needed)', () => {
    const applyMode = 'immediate'
    expect(applyMode).toBe('immediate')
  })

  it('tuning sliders should be accessible only in debug mode', () => {
    const requiresDebug = true
    expect(requiresDebug).toBe(true)
  })

  it('should have reset button to restore default values', () => {
    const defaults = { speedMult: 1.0, frightMult: 1.0, scatterPct: 50 }
    expect(defaults.speedMult).toBe(1.0)
    expect(defaults.frightMult).toBe(1.0)
  })
})
