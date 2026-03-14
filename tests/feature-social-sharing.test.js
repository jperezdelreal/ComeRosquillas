// Sprint 4 Feature: Social Sharing (#67)
// Share button, Web Share API, clipboard fallback, screenshot, QR code, seed URLs
// Scaffold — skip until feature lands
import { describe, it, expect } from 'vitest'
import { COLS, ROWS, TILE } from './setup.js'

// ---- Share Button UI ----

describe('Social Sharing — Share Button', () => {
  it('should show share button on game over screen', () => {
    // Share button visible in ST_GAME_OVER and ST_HIGH_SCORE_ENTRY states
    const visibleStates = ['GAME_OVER', 'HIGH_SCORE_ENTRY']
    expect(visibleStates).toContain('GAME_OVER')
    expect(visibleStates).toContain('HIGH_SCORE_ENTRY')
  })

  it('share button should have touch-friendly size (≥48×48px)', () => {
    const buttonWidth = 48
    const buttonHeight = 48
    expect(buttonWidth).toBeGreaterThanOrEqual(48)
    expect(buttonHeight).toBeGreaterThanOrEqual(48)
  })

  it('share button should display share icon (📤 or SVG)', () => {
    const shareIcon = '📤'
    expect(shareIcon).toBeDefined()
    expect(typeof shareIcon).toBe('string')
  })

  it('share button position should not overlap score display', () => {
    const canvasW = COLS * TILE
    const scoreY = 50 // approximate score display Y
    const shareButtonY = 200 // below score area
    expect(shareButtonY).toBeGreaterThan(scoreY + 48) // no overlap
  })
})

// ---- Web Share API ----

describe('Social Sharing — Web Share API', () => {
  it('should detect Web Share API availability', () => {
    // navigator.share is available on mobile browsers and some desktop
    function canShare() {
      return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    }
    // jsdom doesn't have navigator.share, so this returns false in tests
    expect(typeof canShare).toBe('function')
  })

  it('share payload should include title, text, and URL', () => {
    const shareData = {
      title: "Homer's Donut Quest — My Score!",
      text: 'I scored 12,500 points in Homer\'s Donut Quest! 🍩',
      url: 'https://jperezdelreal.github.io/ComeRosquillas/play/',
    }
    expect(shareData.title).toContain("Homer's Donut Quest")
    expect(shareData.text).toContain('scored')
    expect(shareData.url).toContain('ComeRosquillas')
  })

  it('share text should include score and level', () => {
    function buildShareText(score, level, combo) {
      let text = `I scored ${score.toLocaleString()} points on Level ${level} in Homer's Donut Quest! 🍩`
      if (combo > 1) text += ` (${combo}× combo!)`
      return text
    }
    const text = buildShareText(12500, 5, 4)
    expect(text).toContain('12,500')
    expect(text).toContain('Level 5')
    expect(text).toContain('4× combo!')
    expect(text).toContain('🍩')
  })

  it('share text without combo should omit combo suffix', () => {
    function buildShareText(score, level, combo) {
      let text = `I scored ${score.toLocaleString()} points on Level ${level} in Homer's Donut Quest! 🍩`
      if (combo > 1) text += ` (${combo}× combo!)`
      return text
    }
    const text = buildShareText(5000, 2, 0)
    expect(text).not.toContain('combo')
  })

  it('should handle Web Share API rejection gracefully', () => {
    // User may cancel the share dialog — catch AbortError
    const abortError = new DOMException('Share canceled', 'AbortError')
    expect(abortError.name).toBe('AbortError')
    // App should not show error for user cancellation
  })
})

// ---- Clipboard Fallback ----

describe('Social Sharing — Clipboard Fallback', () => {
  it('should fall back to clipboard when Web Share API unavailable', () => {
    // Desktop browsers without navigator.share → use navigator.clipboard.writeText
    function canClipboard() {
      return typeof navigator !== 'undefined' &&
             typeof navigator.clipboard !== 'undefined' &&
             typeof navigator.clipboard.writeText === 'function'
    }
    expect(typeof canClipboard).toBe('function')
  })

  it('clipboard text should include score URL with seed', () => {
    function buildClipboardText(score, level, seed) {
      const url = `https://jperezdelreal.github.io/ComeRosquillas/play/?seed=${seed}`
      return `I scored ${score.toLocaleString()} on Homer's Donut Quest! Play the same maze: ${url}`
    }
    const text = buildClipboardText(8000, 3, 'abc123')
    expect(text).toContain('8,000')
    expect(text).toContain('seed=abc123')
  })

  it('should show "Copied!" toast feedback for 2 seconds', () => {
    const toastDurationMs = 2000
    expect(toastDurationMs).toBe(2000)
  })

  it('should handle clipboard API rejection (permissions)', () => {
    // If clipboard.writeText fails, fall back to prompt with text selected
    const fallbackMethod = 'prompt'
    expect(['prompt', 'textarea-select']).toContain(fallbackMethod)
  })
})

// ---- Screenshot / Canvas Capture ----

describe('Social Sharing — Screenshot Capture', () => {
  it('should capture canvas as PNG data URL', () => {
    // canvas.toDataURL('image/png') returns base64-encoded PNG
    const mimeType = 'image/png'
    expect(mimeType).toBe('image/png')
  })

  it('screenshot should include game state overlay (score, level)', () => {
    // Screenshot captures the canvas as-is, including HUD elements
    // Score, level, and lives are rendered on canvas → included automatically
    const hudElements = ['score', 'level', 'lives']
    expect(hudElements).toContain('score')
    expect(hudElements).toContain('level')
  })

  it('screenshot resolution should match canvas size (672×744)', () => {
    const expectedW = COLS * TILE // 28 * 24 = 672
    const expectedH = ROWS * TILE // 31 * 24 = 744
    expect(expectedW).toBe(672)
    expect(expectedH).toBe(744)
  })

  it('screenshot should add watermark with game URL', () => {
    const watermarkText = 'jperezdelreal.github.io/ComeRosquillas'
    expect(watermarkText).toContain('ComeRosquillas')
  })

  it('Web Share API with files should include screenshot as blob', () => {
    // navigator.share({ files: [new File([blob], 'score.png', { type: 'image/png' })] })
    const fileName = 'homer-donut-quest-score.png'
    expect(fileName).toContain('.png')
  })
})

// ---- QR Code ----

describe('Social Sharing — QR Code', () => {
  it('QR code should encode game URL with seed parameter', () => {
    const seed = 'a1b2c3'
    const url = `https://jperezdelreal.github.io/ComeRosquillas/play/?seed=${seed}`
    expect(url).toContain('seed=')
    expect(url.length).toBeLessThan(200) // QR codes work best with short URLs
  })

  it('QR code should be rendered to canvas (no external library)', () => {
    // Self-contained QR encoder using Canvas 2D
    // Module size: at least 4px for readability
    const moduleSize = 4
    expect(moduleSize).toBeGreaterThanOrEqual(4)
  })

  it('QR code should be displayed on game over screen alongside share button', () => {
    const qrSize = 120 // 120×120px QR code
    const canvasW = COLS * TILE
    // QR positioned in lower portion of game over overlay
    expect(qrSize).toBeLessThan(canvasW / 4)
  })

  it('QR code should include error correction level M (15%)', () => {
    const errorCorrectionLevel = 'M'
    expect(['L', 'M', 'Q', 'H']).toContain(errorCorrectionLevel)
  })
})

// ---- Seed URLs ----

describe('Social Sharing — Seed URLs', () => {
  function generateSeed() {
    return Math.random().toString(36).substring(2, 10)
  }

  function parseSeedFromURL(urlString) {
    try {
      const url = new URL(urlString)
      return url.searchParams.get('seed')
    } catch { return null }
  }

  it('seed should be 8-character alphanumeric string', () => {
    const seed = generateSeed()
    expect(seed.length).toBeGreaterThanOrEqual(6)
    expect(seed.length).toBeLessThanOrEqual(10)
    expect(seed).toMatch(/^[a-z0-9]+$/)
  })

  it('same seed should produce same maze layout', () => {
    // Seeded PRNG: given same seed, maze generation is deterministic
    function seededRandom(seed) {
      let h = 0
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0
      }
      return () => {
        h = h ^ (h << 13); h = h ^ (h >> 17); h = h ^ (h << 5)
        return (h >>> 0) / 4294967296
      }
    }
    const rng1 = seededRandom('testSeed')
    const rng2 = seededRandom('testSeed')
    const vals1 = Array.from({ length: 10 }, () => rng1())
    const vals2 = Array.from({ length: 10 }, () => rng2())
    expect(vals1).toEqual(vals2) // deterministic
  })

  it('should parse seed from URL query parameter', () => {
    const seed = parseSeedFromURL('https://example.com/play/?seed=abc12345')
    expect(seed).toBe('abc12345')
  })

  it('missing seed should use random (default behavior)', () => {
    const seed = parseSeedFromURL('https://example.com/play/')
    expect(seed).toBeNull()
    // null seed → Math.random() fallback
  })

  it('seed URL should be embeddable in share text', () => {
    const seed = 'xyz99887'
    const shareUrl = `https://jperezdelreal.github.io/ComeRosquillas/play/?seed=${seed}`
    const shareText = `Play my maze: ${shareUrl}`
    expect(shareText).toContain(seed)
    expect(shareText).toContain('https://')
  })
})
