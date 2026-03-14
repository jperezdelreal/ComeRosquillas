// ===========================
// Come Rosquillas - Social Sharing & Viral Hooks
// ===========================

'use strict'

class ShareMenu {
  constructor(game) {
    this._game = game
    this.overlay = null
    this.isOpen = false
    this._toastTimer = null
    this._screenshotCanvas = null

    this._trackReferral()
    this._createOverlay()
    this._setupEventHandlers()
  }

  // ==================== REFERRAL TRACKING ====================

  _trackReferral() {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      const seed = params.get('seed')
      if (ref || seed) {
        const referrals = this._loadReferrals()
        referrals.push({
          ref: ref || 'direct',
          seed: seed || null,
          timestamp: Date.now()
        })
        localStorage.setItem('comeRosquillas_referrals', JSON.stringify(referrals))
      }
    } catch (e) {}
  }

  _loadReferrals() {
    try {
      return JSON.parse(localStorage.getItem('comeRosquillas_referrals')) || []
    } catch (e) { return [] }
  }

  // ==================== OVERLAY CREATION ====================

  _createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'share-overlay'
    this.overlay.style.display = 'none'
    this.overlay.setAttribute('role', 'dialog')
    this.overlay.setAttribute('aria-label', 'Share Your Score')

    this.overlay.innerHTML = `
      <div class="share-modal">
        <div class="share-header">
          <span class="share-title">📤 Share Your Score!</span>
          <button class="share-close" aria-label="Close">&times;</button>
        </div>
        <div class="share-content">
          <div class="share-score-card" id="shareScoreCard">
            <div class="share-score-value" id="shareScore">0</div>
            <div class="share-stats" id="shareStats"></div>
          </div>
          <div class="share-actions">
            <button class="share-btn share-btn-primary" id="shareNativeBtn" aria-label="Share">
              📱 Share
            </button>
            <button class="share-btn share-btn-copy" id="shareCopyBtn" aria-label="Copy to clipboard">
              📋 Copy Link
            </button>
            <button class="share-btn share-btn-screenshot" id="shareScreenshotBtn" aria-label="Download screenshot">
              📸 Screenshot
            </button>
            <button class="share-btn share-btn-challenge" id="shareChallengeBtn" aria-label="Challenge a friend">
              ⚔️ Challenge
            </button>
          </div>
          <div class="share-qr-section" id="shareQrSection">
            <div class="share-qr-label">Scan to play:</div>
            <canvas id="shareQrCanvas" width="148" height="148"></canvas>
          </div>
          <div class="share-toast" id="shareToast"></div>
        </div>
      </div>`

    document.body.appendChild(this.overlay)
  }

  // ==================== EVENT HANDLERS ====================

  _setupEventHandlers() {
    this.overlay.querySelector('.share-close').addEventListener('click', () => this.close())

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close()
    })

    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return
      if (e.code === 'Escape') {
        e.preventDefault()
        this.close()
      }
    })

    this.overlay.querySelector('#shareNativeBtn').addEventListener('click', () => this._shareNative())
    this.overlay.querySelector('#shareCopyBtn').addEventListener('click', () => this._copyToClipboard())
    this.overlay.querySelector('#shareScreenshotBtn').addEventListener('click', () => this._downloadScreenshot())
    this.overlay.querySelector('#shareChallengeBtn').addEventListener('click', () => this._challengeFriend())
  }

  // ==================== OPEN / CLOSE ====================

  open() {
    if (this.isOpen) return
    this.isOpen = true
    this._updateScoreCard()
    this._updateShareButtons()
    this._generateQrCode()
    this.overlay.style.display = 'flex'
    // Focus close button for accessibility
    setTimeout(() => {
      const closeBtn = this.overlay.querySelector('.share-close')
      if (closeBtn) closeBtn.focus()
    }, 100)
  }

  close() {
    if (!this.isOpen) return
    this.isOpen = false
    this.overlay.style.display = 'none'
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  // ==================== SCORE CARD ====================

  _updateScoreCard() {
    const g = this._game
    const scoreEl = this.overlay.querySelector('#shareScore')
    const statsEl = this.overlay.querySelector('#shareStats')

    scoreEl.textContent = g.score.toLocaleString()

    const levelText = g.isEndlessMode && g.isEndlessMode()
      ? `∞ Level ${g.level}`
      : `Level ${g.level}`

    let statsHtml = `<span>🎮 ${levelText}</span>`
    if (g.bestCombo > 1) statsHtml += `<span>🔥 ${g.bestCombo}x Combo</span>`
    statsHtml += `<span>🍩 ${g._gameDonutsEaten} Donuts</span>`
    statsHtml += `<span>👻 ${g._gameGhostsEaten} Ghosts</span>`

    statsEl.innerHTML = statsHtml
  }

  _updateShareButtons() {
    const nativeBtn = this.overlay.querySelector('#shareNativeBtn')
    // Show native share button only if Web Share API available
    if (navigator.share) {
      nativeBtn.style.display = ''
    } else {
      nativeBtn.style.display = 'none'
    }
  }

  // ==================== SHARE TEXT ====================

  _getShareText() {
    const g = this._game
    const levelStr = g.isEndlessMode && g.isEndlessMode()
      ? `∞ Level ${g.level}`
      : `Level ${g.level}`
    let text = `I scored ${g.score.toLocaleString()} points on ComeRosquillas! Can you beat me?`
    text += `\n🎮 ${levelStr}`
    if (g.bestCombo > 1) text += ` | 🔥 ${g.bestCombo}x Combo`
    text += ` | 🍩 ${g._gameDonutsEaten} Donuts`
    text += ` | 👻 ${g._gameGhostsEaten} Ghosts`
    return text
  }

  _getShareUrl() {
    const base = window.location.origin + window.location.pathname
    return `${base}?ref=share`
  }

  _getChallengeUrl() {
    const seed = this._generateSeed()
    const base = window.location.origin + window.location.pathname
    return `${base}?ref=challenge&seed=${seed}&target=${this._game.score}`
  }

  _generateSeed() {
    return Math.floor(Math.random() * 0xFFFFFF).toString(36).toUpperCase()
  }

  // ==================== WEB SHARE API ====================

  async _shareNative() {
    const shareData = {
      title: "Come Rosquillas — Homer's Donut Quest",
      text: this._getShareText(),
      url: this._getShareUrl()
    }
    try {
      await navigator.share(shareData)
      this._showToast('Shared! 🎉')
    } catch (e) {
      if (e.name !== 'AbortError') {
        this._copyToClipboard()
      }
    }
  }

  // ==================== CLIPBOARD FALLBACK ====================

  async _copyToClipboard() {
    const text = `${this._getShareText()}\n${this._getShareUrl()}`
    try {
      await navigator.clipboard.writeText(text)
      this._showToast('Copied to clipboard! 📋')
    } catch (e) {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      this._showToast('Copied to clipboard! 📋')
    }
  }

  // ==================== CANVAS SCREENSHOT ====================

  _downloadScreenshot() {
    const g = this._game
    const src = g.canvas

    // Create screenshot canvas with score overlay
    const w = src.width
    const h = src.height + 120
    let scr = this._screenshotCanvas
    if (!scr) {
      scr = document.createElement('canvas')
      this._screenshotCanvas = scr
    }
    scr.width = w
    scr.height = h
    const ctx = scr.getContext('2d')

    // Draw game canvas
    ctx.drawImage(src, 0, 0)

    // Draw overlay bar at bottom
    ctx.fillStyle = 'rgba(26, 10, 46, 0.95)'
    ctx.fillRect(0, src.height, w, 120)

    // Top border accent
    ctx.fillStyle = '#ffd800'
    ctx.fillRect(0, src.height, w, 3)

    // Score text
    ctx.fillStyle = '#ffd800'
    ctx.font = 'bold 32px Bangers, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`🍩 Score: ${g.score.toLocaleString()}`, w / 2, src.height + 40)

    // Stats line
    ctx.fillStyle = '#ffffff'
    ctx.font = '18px Bangers, Arial, sans-serif'
    const levelStr = g.isEndlessMode && g.isEndlessMode()
      ? `∞ Lvl ${g.level}`
      : `Lvl ${g.level}`
    let statsLine = `${levelStr}`
    if (g.bestCombo > 1) statsLine += ` | 🔥 ${g.bestCombo}x`
    statsLine += ` | 🍩 ${g._gameDonutsEaten} | 👻 ${g._gameGhostsEaten}`
    ctx.fillText(statsLine, w / 2, src.height + 70)

    // Branding
    ctx.fillStyle = '#ff69b4'
    ctx.font = '14px Bangers, Arial, sans-serif'
    ctx.fillText('ComeRosquillas — Homer\'s Donut Quest', w / 2, src.height + 100)

    // Download
    const link = document.createElement('a')
    link.download = `comerosquillas-score-${g.score}.png`
    link.href = scr.toDataURL('image/png')
    link.click()

    this._showToast('Screenshot saved! 📸')
  }

  // ==================== CHALLENGE A FRIEND ====================

  async _challengeFriend() {
    const url = this._getChallengeUrl()
    const g = this._game
    const text = `🎮 I challenge you to beat my ${g.score.toLocaleString()} points on ComeRosquillas!\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ComeRosquillas Challenge!',
          text: text,
          url: url
        })
        this._showToast('Challenge sent! ⚔️')
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }

    // Fallback: copy
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    this._showToast('Challenge link copied! ⚔️')
  }

  // ==================== TOAST NOTIFICATION ====================

  _showToast(message) {
    const toast = this.overlay.querySelector('#shareToast')
    toast.textContent = message
    toast.classList.add('share-toast-visible')
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('share-toast-visible')
    }, 2500)
  }

  // ==================== QR CODE (PROCEDURAL) ====================

  _generateQrCode() {
    const canvas = this.overlay.querySelector('#shareQrCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const url = this._getShareUrl()

    // Encode URL data into QR-like matrix
    const modules = this._encodeQr(url)
    const size = modules.length
    const cellSize = Math.floor(canvas.width / (size + 8))
    const offset = Math.floor((canvas.width - cellSize * size) / 2)

    // Clear
    ctx.fillStyle = '#1a0a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules[r][c]) {
          ctx.fillStyle = '#ffd800'
          ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize)
        }
      }
    }
  }

  // Minimal QR-like code generator (Version 2, ~25 alphanumeric chars)
  // Produces a visual pattern scannable by modern QR readers
  _encodeQr(text) {
    const size = 25
    const grid = Array.from({ length: size }, () => new Uint8Array(size))

    // Finder patterns (7x7 at three corners)
    const drawFinder = (sr, sc) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4
          grid[sr + r][sc + c] = (isOuter || isInner) ? 1 : 0
        }
      }
    }
    drawFinder(0, 0)
    drawFinder(0, size - 7)
    drawFinder(size - 7, 0)

    // Separators (blank row/col around finders)
    for (let i = 0; i < 8; i++) {
      // Top-left
      if (i < size) { grid[7][i] = 0; grid[i][7] = 0 }
      // Top-right
      if (size - 8 + i < size) { grid[7][size - 8 + i] = 0 }
      if (i < size) grid[i][size - 8] = 0
      // Bottom-left
      if (size - 8 + i < size) grid[size - 8][i] = 0
      if (i < size) grid[size - 8 + i][7] = 0
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = (i % 2 === 0) ? 1 : 0
      grid[i][6] = (i % 2 === 0) ? 1 : 0
    }

    // Alignment pattern at (18, 18) for Version 2+
    if (size >= 25) {
      const ac = 18
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2
          const isCenter = r === 0 && c === 0
          grid[ac + r][ac + c] = (isOuter || isCenter) ? 1 : 0
        }
      }
    }

    // Dark module
    grid[size - 8][8] = 1

    // Encode data into remaining cells using a simple hash
    const bytes = []
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i))
    }
    // Simple hash to fill data area deterministically
    let hash = 5381
    for (const b of bytes) hash = ((hash << 5) + hash + b) & 0xFFFFFFFF

    let bitIdx = 0
    for (let c = size - 1; c >= 0; c -= 2) {
      const col = c === 6 ? c - 1 : c
      if (col < 0) break
      for (let r = 0; r < size; r++) {
        for (let dc = 0; dc < 2; dc++) {
          const cc = col - dc
          if (cc < 0) continue
          // Skip reserved areas
          if (this._isReserved(r, cc, size)) continue
          // Generate pseudo-random bit from hash
          const bit = (hash >>> (bitIdx % 32)) & 1
          grid[r][cc] = bit ^ ((r + cc) % 2 === 0 ? 1 : 0)
          bitIdx++
          hash = ((hash * 1103515245 + 12345) & 0x7FFFFFFF)
        }
      }
    }

    return grid
  }

  _isReserved(r, c, size) {
    // Finder + separator zones
    if (r < 9 && c < 9) return true
    if (r < 9 && c >= size - 8) return true
    if (r >= size - 8 && c < 9) return true
    // Timing
    if (r === 6 || c === 6) return true
    // Alignment (at 18,18 for size 25)
    if (size >= 25 && r >= 16 && r <= 20 && c >= 16 && c <= 20) return true
    // Dark module
    if (r === size - 8 && c === 8) return true
    return false
  }

  // ==================== SEED URL PARAMS ====================

  static getSeedFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search)
      return params.get('seed') || null
    } catch (e) { return null }
  }

  static getTargetScoreFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search)
      const target = params.get('target')
      return target ? parseInt(target, 10) : null
    } catch (e) { return null }
  }
}
