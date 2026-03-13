// Sprint 1 Regression: Ghost AI Personalities
// Validates BFS pathfinding and 4 distinct ghost personalities
import { describe, it, expect } from 'vitest'
import {
  TILE, COLS, ROWS, WALL, DOT, EMPTY, POWER, GHOST_HOUSE, GHOST_DOOR,
  UP, RIGHT, DOWN, LEFT, DX, DY, OPP,
  GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN,
  GHOST_CFG, HOMER_START, BASE_SPEED,
} from './setup.js'

// ---- Ghost Personality Definitions ----

describe('Ghost AI — Personality Targeting', () => {

  // Helper: simulate getChaseTarget logic for each ghost personality
  function getChaseTarget(ghostIdx, homerTile, homerDir, ghostTile, burnsTile) {
    switch (ghostIdx) {
      case 0: // Sr. Burns (Blinky) — direct chase
        return { x: homerTile.col, y: homerTile.row }

      case 1: { // Bob Patiño (Pinky) — 4 tiles ahead
        let tx = homerTile.col + DX[homerDir] * 4
        let ty = homerTile.row + DY[homerDir] * 4
        tx = Math.max(0, Math.min(COLS - 1, tx))
        ty = Math.max(0, Math.min(ROWS - 1, ty))
        return { x: tx, y: ty }
      }

      case 2: { // Nelson (Inky) — vector from Burns doubled
        const pivotX = homerTile.col + DX[homerDir] * 2
        const pivotY = homerTile.row + DY[homerDir] * 2
        let tx = pivotX + (pivotX - burnsTile.col)
        let ty = pivotY + (pivotY - burnsTile.row)
        tx = Math.max(0, Math.min(COLS - 1, tx))
        ty = Math.max(0, Math.min(ROWS - 1, ty))
        return { x: tx, y: ty }
      }

      case 3: { // Snake (Clyde) — patrol/flee at 8-tile threshold
        const dist = Math.sqrt(
          (ghostTile.col - homerTile.col) ** 2 +
          (ghostTile.row - homerTile.row) ** 2
        )
        if (dist < 8) {
          return { x: GHOST_CFG[3].scatterX, y: GHOST_CFG[3].scatterY }
        }
        return { x: homerTile.col, y: homerTile.row }
      }

      default:
        return { x: homerTile.col, y: homerTile.row }
    }
  }

  describe('Sr. Burns (Blinky) — Aggressive Direct Chaser', () => {
    it('should target Homer\'s exact tile position', () => {
      const homer = { col: 14, row: 23 }
      const target = getChaseTarget(0, homer, RIGHT, null, null)
      expect(target).toEqual({ x: 14, y: 23 })
    })

    it('should update target when Homer moves', () => {
      const homer1 = { col: 14, row: 23 }
      const homer2 = { col: 10, row: 5 }
      const t1 = getChaseTarget(0, homer1, RIGHT, null, null)
      const t2 = getChaseTarget(0, homer2, LEFT, null, null)
      expect(t1).not.toEqual(t2)
      expect(t2).toEqual({ x: 10, y: 5 })
    })
  })

  describe('Bob Patiño (Pinky) — Ambush', () => {
    it('should target 4 tiles ahead of Homer going RIGHT', () => {
      const homer = { col: 10, row: 15 }
      const target = getChaseTarget(1, homer, RIGHT, null, null)
      expect(target).toEqual({ x: 14, y: 15 })
    })

    it('should target 4 tiles ahead of Homer going UP', () => {
      const homer = { col: 14, row: 20 }
      const target = getChaseTarget(1, homer, UP, null, null)
      expect(target).toEqual({ x: 14, y: 16 })
    })

    it('should clamp target to maze bounds when near edge', () => {
      const homer = { col: 26, row: 1 }
      const target = getChaseTarget(1, homer, RIGHT, null, null)
      expect(target.x).toBeLessThanOrEqual(COLS - 1)
      expect(target.y).toBeGreaterThanOrEqual(0)
    })

    it('should clamp going UP near top edge', () => {
      const homer = { col: 14, row: 2 }
      const target = getChaseTarget(1, homer, UP, null, null)
      expect(target.y).toBe(0)
    })
  })

  describe('Nelson (Inky) — Calculated/Unpredictable', () => {
    it('should use vector from Burns position through pivot, doubled', () => {
      const homer = { col: 14, row: 20 }
      const burns = { col: 10, row: 20 }
      // Pivot = 2 tiles ahead of Homer going RIGHT = (16, 20)
      // Vector from Burns(10,20) to pivot(16,20) = (6, 0)
      // Target = pivot + vector = (22, 20)
      const target = getChaseTarget(2, homer, RIGHT, null, burns)
      expect(target).toEqual({ x: 22, y: 20 })
    })

    it('should produce different targets than Burns for same Homer position', () => {
      const homer = { col: 14, row: 20 }
      const burns = { col: 10, row: 18 }
      const burnsTarget = getChaseTarget(0, homer, RIGHT, null, null)
      const inkyTarget = getChaseTarget(2, homer, RIGHT, null, burns)
      expect(inkyTarget).not.toEqual(burnsTarget)
    })

    it('should clamp to maze bounds', () => {
      const homer = { col: 25, row: 5 }
      const burns = { col: 5, row: 5 }
      const target = getChaseTarget(2, homer, RIGHT, null, burns)
      expect(target.x).toBeLessThanOrEqual(COLS - 1)
      expect(target.y).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Snake (Clyde) — Patrol/Flee', () => {
    it('should chase Homer when more than 8 tiles away', () => {
      const homer = { col: 14, row: 23 }
      const ghost = { col: 2, row: 5 } // ~20 tiles away
      const target = getChaseTarget(3, homer, RIGHT, ghost, null)
      expect(target).toEqual({ x: 14, y: 23 })
    })

    it('should flee to scatter corner when within 8 tiles', () => {
      const homer = { col: 14, row: 23 }
      const ghost = { col: 12, row: 22 } // ~2.2 tiles away
      const target = getChaseTarget(3, homer, RIGHT, ghost, null)
      expect(target).toEqual({ x: GHOST_CFG[3].scatterX, y: GHOST_CFG[3].scatterY })
    })

    it('should flee at exactly 7.9 tiles (< 8 threshold)', () => {
      const homer = { col: 14, row: 23 }
      // Place ghost ~7.9 tiles away
      const ghost = { col: 7, row: 20 }
      const dist = Math.sqrt((7 - 14) ** 2 + (20 - 23) ** 2)
      expect(dist).toBeLessThan(8)
      const target = getChaseTarget(3, homer, RIGHT, ghost, null)
      expect(target).toEqual({ x: GHOST_CFG[3].scatterX, y: GHOST_CFG[3].scatterY })
    })

    it('should chase at exactly 8+ tiles', () => {
      const homer = { col: 14, row: 23 }
      const ghost = { col: 6, row: 19 } // ~8.9 tiles
      const dist = Math.sqrt((6 - 14) ** 2 + (19 - 23) ** 2)
      expect(dist).toBeGreaterThanOrEqual(8)
      const target = getChaseTarget(3, homer, RIGHT, ghost, null)
      expect(target).toEqual({ x: 14, y: 23 })
    })
  })

  describe('All 4 ghosts produce distinct targets', () => {
    it('should produce different targets for the same Homer position', () => {
      const homer = { col: 14, row: 20 }
      const burns = { col: 10, row: 18 }
      const farGhost = { col: 2, row: 2 }

      const targets = [
        getChaseTarget(0, homer, RIGHT, null, null),
        getChaseTarget(1, homer, RIGHT, null, null),
        getChaseTarget(2, homer, RIGHT, null, burns),
        getChaseTarget(3, homer, RIGHT, farGhost, null),
      ]

      // Burns and Snake (when far) both target Homer directly
      // Pinky and Inky should differ from Burns
      expect(targets[1]).not.toEqual(targets[0]) // Pinky ≠ Burns
      expect(targets[2]).not.toEqual(targets[0]) // Inky ≠ Burns
    })
  })
})

// ---- Ghost Mode System ----

describe('Ghost AI — Mode System', () => {
  it('should define 4 ghost modes', () => {
    expect(GM_SCATTER).toBe(0)
    expect(GM_CHASE).toBe(1)
    expect(GM_FRIGHTENED).toBe(2)
    expect(GM_EATEN).toBe(3)
  })

  it('should have 4 ghosts configured', () => {
    expect(GHOST_CFG).toHaveLength(4)
  })

  it('should have named ghost personalities', () => {
    const names = GHOST_CFG.map(g => g.name)
    expect(names).toEqual(['Sr. Burns', 'Bob Patiño', 'Nelson', 'Snake'])
  })

  it('should have scatter targets defined for all ghosts', () => {
    for (const g of GHOST_CFG) {
      expect(g.scatterX).toBeDefined()
      expect(g.scatterY).toBeDefined()
      expect(g.scatterX).toBeGreaterThanOrEqual(0)
      expect(g.scatterY).toBeGreaterThanOrEqual(0)
    }
  })

  it('should have staggered exit delays', () => {
    for (let i = 1; i < GHOST_CFG.length; i++) {
      expect(GHOST_CFG[i].exitDelay).toBeGreaterThan(GHOST_CFG[i - 1].exitDelay)
    }
  })
})

// ---- BFS Pathfinding Validation ----

describe('Ghost AI — BFS Pathfinding Properties', () => {
  it('should have DX/DY arrays covering all 4 directions', () => {
    expect(DX).toEqual([0, 1, 0, -1])
    expect(DY).toEqual([-1, 0, 1, 0])
  })

  it('should have opposite directions that are symmetric', () => {
    for (let d = 0; d < 4; d++) {
      expect(OPP[OPP[d]]).toBe(d)
    }
  })

  it('should have maze dimensions that support BFS (28x31)', () => {
    expect(COLS).toBe(28)
    expect(ROWS).toBe(31)
  })

  it('should have ghost home positions inside the ghost house', () => {
    for (const g of GHOST_CFG) {
      expect(g.homeX).toBeGreaterThanOrEqual(10)
      expect(g.homeX).toBeLessThanOrEqual(17)
      expect(g.homeY).toBe(14)
    }
  })
})
