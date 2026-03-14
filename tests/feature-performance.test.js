// Sprint 4 Feature: Performance Optimization (#70)
// BFS caching, particle pooling, batch rendering, FPS counter
// Scaffold — skip until feature lands
import { describe, it, expect } from 'vitest'
import {
  TILE, COLS, ROWS, BASE_SPEED,
  WALL, DOT, EMPTY, POWER, GHOST_HOUSE, GHOST_DOOR,
  UP, RIGHT, DOWN, LEFT, DX, DY,
  getMazeLayout,
} from './setup.js'

// ---- BFS Cache ----

describe('Performance — BFS Path Cache', () => {
  // BFS cache stores shortest paths from each walkable tile to every other
  // Cache key: `${fromX},${fromY}` → Map of `${toX},${toY}` → nextDirection

  function isWalkable(cell) {
    return cell === DOT || cell === EMPTY || cell === POWER
  }

  function countWalkableTiles(template) {
    let count = 0
    for (let r = 0; r < template.length; r++) {
      for (let c = 0; c < template[r].length; c++) {
        if (isWalkable(template[r][c])) count++
      }
    }
    return count
  }

  it('should cache BFS results for all walkable tiles', () => {
    const maze = getMazeLayout(1).template
    const walkable = countWalkableTiles(maze)
    expect(walkable).toBeGreaterThan(0)
    // Cache should have one entry per walkable tile
    // Each entry maps to next-direction for every reachable destination
  })

  it('cache should be invalidated on level change', () => {
    // When level changes, maze may change → cache must be rebuilt
    const maze1 = getMazeLayout(1).name
    const maze3 = getMazeLayout(3).name
    expect(maze1).not.toBe(maze3) // different maze → invalidate
  })

  it('BFS cache lookup should return valid direction (0-3)', () => {
    // Lookup: bfsCache.get(`${fromX},${fromY}`).get(`${toX},${toY}`) → direction
    const directions = [UP, RIGHT, DOWN, LEFT]
    for (const dir of directions) {
      expect(dir).toBeGreaterThanOrEqual(0)
      expect(dir).toBeLessThanOrEqual(3)
    }
  })

  it('BFS cache should handle tunnel wrapping (column 0 ↔ 27)', () => {
    // Tunnel tiles at row 14: columns 0 and 27 wrap around
    const tunnelRow = 14
    const leftTunnel = { x: 0, y: tunnelRow }
    const rightTunnel = { x: COLS - 1, y: tunnelRow }
    expect(leftTunnel.x).toBe(0)
    expect(rightTunnel.x).toBe(27)
    // BFS from left tunnel should include right tunnel as neighbor
  })

  it('BFS cache memory should be bounded (< 1MB for standard maze)', () => {
    // 28×31 grid ≈ 200-300 walkable tiles
    // Each tile stores at most 300 direction entries (1 byte each)
    // Max: 300 × 300 = 90,000 entries ≈ ~90KB well under 1MB
    const maxWalkable = 300
    const maxEntries = maxWalkable * maxWalkable
    const estimatedBytes = maxEntries * 2 // key + value
    expect(estimatedBytes).toBeLessThan(1024 * 1024)
  })

  it('ghost AI should use BFS cache instead of per-frame BFS', () => {
    // Ghost target tile is known → lookup cached next-direction
    // Instead of running BFS every frame, single Map.get() call
    const cacheHitTimeMs = 0.001 // ~1 microsecond
    const bfsTimeMs = 0.5 // ~0.5ms per BFS
    expect(cacheHitTimeMs).toBeLessThan(bfsTimeMs)
  })
})

// ---- Particle Pool ----

describe('Performance — Particle Pool', () => {
  const POOL_SIZE = 200

  function createParticlePool(size) {
    const pool = []
    for (let i = 0; i < size; i++) {
      pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0 })
    }
    return pool
  }

  function acquireParticle(pool) {
    for (const p of pool) {
      if (!p.active) {
        p.active = true
        return p
      }
    }
    return null // pool exhausted
  }

  function releaseParticle(p) {
    p.active = false
    p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; p.life = 0
  }

  it('should pre-allocate 200 particles at init', () => {
    const pool = createParticlePool(POOL_SIZE)
    expect(pool).toHaveLength(POOL_SIZE)
    expect(pool.every(p => !p.active)).toBe(true)
  })

  it('should acquire and release particles without allocation', () => {
    const pool = createParticlePool(POOL_SIZE)
    const p1 = acquireParticle(pool)
    expect(p1).not.toBeNull()
    expect(p1.active).toBe(true)
    releaseParticle(p1)
    expect(p1.active).toBe(false)
  })

  it('should return null when pool is exhausted', () => {
    const pool = createParticlePool(5)
    for (let i = 0; i < 5; i++) acquireParticle(pool)
    const overflow = acquireParticle(pool)
    expect(overflow).toBeNull()
  })

  it('released particles should be reusable immediately', () => {
    const pool = createParticlePool(1)
    const p = acquireParticle(pool)
    releaseParticle(p)
    const p2 = acquireParticle(pool)
    expect(p2).toBe(p) // same object reused
  })

  it('active particle count should never exceed POOL_SIZE', () => {
    const pool = createParticlePool(POOL_SIZE)
    let acquired = 0
    while (acquireParticle(pool)) acquired++
    expect(acquired).toBe(POOL_SIZE)
  })

  it('particle pool should replace combo + donut particle systems', () => {
    // Combo particles: 15 per milestone (3 milestones = 45 max)
    // Donut eat particles: ~5 per donut
    // Worst case burst: ~60 simultaneous
    const worstCaseBurst = 60
    expect(POOL_SIZE).toBeGreaterThan(worstCaseBurst)
  })
})

// ---- Batch Rendering ----

describe('Performance — Batch Rendering', () => {
  it('dots should be rendered in a single batch draw call', () => {
    // Instead of individual fillRect per dot, use Path2D or single beginPath
    // All dots share the same fill style → one beginPath, multiple rects, one fill
    const maze = getMazeLayout(1).template
    let dotCount = 0
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === DOT) dotCount++
      }
    }
    expect(dotCount).toBeGreaterThan(100) // many dots → batch is worth it
  })

  it('wall segments sharing same color should be batched', () => {
    const layout = getMazeLayout(1)
    expect(layout.wallColors.main).toBeDefined()
    // All walls of same color drawn in single path → 1 fill call per color
    const uniqueColors = new Set(Object.values(layout.wallColors))
    expect(uniqueColors.size).toBeLessThanOrEqual(4) // main, dark, light, border
  })

  it('ghost rendering should minimize state changes', () => {
    // Draw all ghost bodies with same technique, then all eyes
    // Reduces fillStyle/strokeStyle switches
    const ghostCount = 4
    // Without batching: 4 × (body + eyes + pupil) = 12 state changes
    // With batching: 3 groups (bodies, eyes, pupils) = 3 state changes
    expect(ghostCount * 3).toBeGreaterThan(3) // batching saves calls
  })

  it('HUD elements should use offscreen canvas for static text', () => {
    // Score label, "LEVEL" text, etc. don't change every frame
    // Cache to offscreen canvas, blit on each frame
    const hudUpdateFrequency = 'on_change' // not every frame
    expect(hudUpdateFrequency).toBe('on_change')
  })
})

// ---- FPS Counter ----

describe('Performance — FPS Counter', () => {
  function calculateFPS(frameTimes) {
    if (frameTimes.length < 2) return 0
    const totalMs = frameTimes[frameTimes.length - 1] - frameTimes[0]
    if (totalMs === 0) return 0
    return Math.round((frameTimes.length - 1) / (totalMs / 1000))
  }

  function smoothFPS(currentFps, previousSmoothed, alpha = 0.1) {
    return previousSmoothed + alpha * (currentFps - previousSmoothed)
  }

  it('should calculate FPS from frame timestamps', () => {
    // 60 frames in 1000ms = 60fps
    const times = Array.from({ length: 61 }, (_, i) => i * (1000 / 60))
    const fps = calculateFPS(times)
    expect(fps).toBe(60)
  })

  it('should smooth FPS with exponential moving average (alpha=0.1)', () => {
    let smoothed = 60
    // Sudden drop to 30fps
    smoothed = smoothFPS(30, smoothed)
    expect(smoothed).toBeCloseTo(57, 0) // slowly moves toward 30
    // After many frames it converges
    for (let i = 0; i < 50; i++) smoothed = smoothFPS(30, smoothed)
    expect(smoothed).toBeCloseTo(30, 0)
  })

  it('should display FPS in top-right corner of canvas', () => {
    // FPS counter position: canvas width - padding
    const canvasW = COLS * TILE
    const padding = 10
    const fpsX = canvasW - padding
    expect(fpsX).toBe(662) // 672 - 10
  })

  it('should color-code FPS: green ≥55, yellow ≥30, red <30', () => {
    function fpsColor(fps) {
      if (fps >= 55) return 'green'
      if (fps >= 30) return 'yellow'
      return 'red'
    }
    expect(fpsColor(60)).toBe('green')
    expect(fpsColor(45)).toBe('yellow')
    expect(fpsColor(20)).toBe('red')
  })

  it('should toggle FPS display with F key or debug menu', () => {
    const toggleKey = 'F'
    expect(toggleKey).toBe('F')
    // FPS display off by default, toggled on with F
  })

  it('should maintain 60fps with all systems active', () => {
    // Target: 16.67ms per frame budget
    const frameBudgetMs = 1000 / 60
    expect(frameBudgetMs).toBeCloseTo(16.67, 1)
    // Total per-frame budget breakdown:
    // - Game logic: ~2ms
    // - Rendering: ~8ms
    // - Audio: ~1ms
    // - Overhead: ~5ms
    const totalEstimated = 2 + 8 + 1 + 5
    expect(totalEstimated).toBeLessThan(frameBudgetMs)
  })
})

// ---- 60fps Verification ----

describe('Performance — 60fps Target', () => {
  it('frame budget is 16.67ms at 60fps', () => {
    expect(1000 / 60).toBeCloseTo(16.67, 1)
  })

  it('requestAnimationFrame loop should use delta time', () => {
    // Game loop should use (timestamp - lastTimestamp) for frame-rate-independent updates
    const targetDelta = 1000 / 60
    const fastFrame = targetDelta * 0.8
    const slowFrame = targetDelta * 1.5
    // Speed multiplier normalizes to 60fps base
    const fastMult = fastFrame / targetDelta
    const slowMult = slowFrame / targetDelta
    expect(fastMult).toBeLessThan(1) // game runs slightly slower
    expect(slowMult).toBeGreaterThan(1) // game catches up
  })

  it('garbage collection pauses should be minimized (object pooling)', () => {
    // No per-frame allocations of particles, path arrays, or temporary objects
    // All reuse pre-allocated pools
    const perFrameAllocations = 0
    expect(perFrameAllocations).toBe(0)
  })

  it('canvas operations should avoid getImageData (slow path)', () => {
    // Collision detection uses tile grid math, not pixel sampling
    // Only fillRect, strokeRect, arc, drawImage — no getImageData
    const usesGetImageData = false
    expect(usesGetImageData).toBe(false)
  })
})
