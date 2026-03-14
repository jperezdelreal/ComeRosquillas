// ===========================
// Come Rosquillas - Tutorial & Onboarding
// ===========================

'use strict';

class Tutorial {
  constructor(game) {
    this.game = game
    this.overlay = null
    this.isActive = false
    this.currentStep = 0
    this.animFrame = 0
    this.animId = null
    this.celebrationParticles = []
    this.isMobile = matchMedia('(hover: none) and (pointer: coarse)').matches

    this.steps = [
      {
        title: t('tutorial.step1_title'),
        icon: '🏃',
        desktop: t('tutorial.step1_desktop').replace('Arrow Keys', '<strong>Arrow Keys</strong>'),
        mobile: t('tutorial.step1_mobile').replace('Swipe', '<strong>Swipe</strong>'),
        hint: t('tutorial.step1_hint'),
        highlight: 'maze'
      },
      {
        title: t('tutorial.step2_title'),
        icon: '🍺',
        desktop: t('tutorial.step2_desktop').replace('Power Pellet', '<strong>Power Pellet</strong>'),
        mobile: t('tutorial.step2_mobile').replace('Power Pellet', '<strong>Power Pellet</strong>'),
        hint: t('tutorial.step2_hint'),
        highlight: 'power'
      },
      {
        title: t('tutorial.step3_title'),
        icon: '💥',
        desktop: t('tutorial.step3_desktop').replace('blue ghosts', '<strong>blue ghosts</strong>'),
        mobile: t('tutorial.step3_mobile').replace('blue ghosts', '<strong>blue ghosts</strong>'),
        hint: t('tutorial.step3_hint'),
        highlight: 'ghost'
      }
    ]

    this.createOverlay()
    this.setupEventHandlers()
  }

  // Check if tutorial should auto-show for first-time players
  shouldShow() {
    try {
      return !localStorage.getItem('comeRosquillas_tutorialComplete')
    } catch (e) {
      return false
    }
  }

  createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.id = 'tutorialOverlay'
    this.overlay.className = 'tutorial-overlay'
    this.overlay.style.display = 'none'
    this.overlay.setAttribute('role', 'dialog')
    this.overlay.setAttribute('aria-label', 'Game Tutorial')

    document.body.appendChild(this.overlay)
  }

  setupEventHandlers() {
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return

      if (e.code === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        this.skip()
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        e.stopPropagation()
        this.nextStep()
      }
    })
  }

  start() {
    this.isActive = true
    this.currentStep = 0
    this.overlay.style.display = 'flex'
    this.renderStep()
    this.startAnimation()
  }

  renderStep() {
    const step = this.steps[this.currentStep]
    const stepNum = this.currentStep + 1
    const totalSteps = this.steps.length
    const isLast = this.currentStep === this.steps.length - 1
    const text = this.isMobile ? step.mobile : step.desktop

    // Progress dots
    let dots = ''
    for (let i = 0; i < totalSteps; i++) {
      const active = i === this.currentStep ? 'tutorial-dot-active' : ''
      const done = i < this.currentStep ? 'tutorial-dot-done' : ''
      dots += `<span class="tutorial-dot ${active} ${done}"></span>`
    }

    this.overlay.innerHTML = `
      <div class="tutorial-backdrop"></div>
      <div class="tutorial-card">
        <div class="tutorial-progress">
          <span class="tutorial-step-label">${t('tutorial.step_counter', stepNum, totalSteps)}</span>
          <div class="tutorial-dots">${dots}</div>
        </div>

        <div class="tutorial-icon-container">
          <canvas id="tutorialCanvas" width="200" height="140"></canvas>
        </div>

        <h2 class="tutorial-title">${step.title}</h2>
        <p class="tutorial-text">${text}</p>
        <p class="tutorial-hint">${step.hint}</p>

        <div class="tutorial-actions">
          <button class="tutorial-btn tutorial-skip-btn" aria-label="${t('tutorial.skip_label')}">
            ${!this.isMobile ? t('tutorial.skip') : t('tutorial.skip_label')}
          </button>
          <button class="tutorial-btn tutorial-next-btn" aria-label="${isLast ? t('tutorial.start_playing') : 'Next Step'}">
            ${isLast ? t('tutorial.lets_play') : t('tutorial.next')}
          </button>
        </div>

        ${this.isMobile ? `<p class="tutorial-tap-hint">${t('tutorial.tap_continue')}</p>` : ''}
      </div>
    `

    // Bind button events
    const skipBtn = this.overlay.querySelector('.tutorial-skip-btn')
    const nextBtn = this.overlay.querySelector('.tutorial-next-btn')

    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.skip()
    })
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.nextStep()
    })

    // Mobile: tap backdrop to continue
    if (this.isMobile) {
      this.overlay.querySelector('.tutorial-backdrop').addEventListener('click', () => {
        this.nextStep()
      })
    }

    // Focus the next button for keyboard users
    setTimeout(() => nextBtn.focus(), 50)

    // Start step-specific animation
    this.drawStepIllustration()
  }

  startAnimation() {
    const animate = () => {
      if (!this.isActive) return
      this.animFrame++
      this.drawStepIllustration()
      this.animId = requestAnimationFrame(animate)
    }
    this.animId = requestAnimationFrame(animate)
  }

  stopAnimation() {
    if (this.animId) {
      cancelAnimationFrame(this.animId)
      this.animId = null
    }
  }

  drawStepIllustration() {
    const canvas = document.getElementById('tutorialCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    if (this.currentStep === 0) this.drawMoveIllustration(ctx, w, h)
    else if (this.currentStep === 1) this.drawPowerIllustration(ctx, w, h)
    else if (this.currentStep === 2) this.drawGhostEatIllustration(ctx, w, h)
  }

  drawMoveIllustration(ctx, w, h) {
    const t = this.animFrame
    const centerY = h / 2

    // Draw mini maze section
    ctx.fillStyle = '#1a3388'
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(i * 22 + 2, 8, 20, 16)
      ctx.fillRect(i * 22 + 2, h - 24, 20, 16)
    }

    // Draw path
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 24, w, h - 48)

    // Draw dots along the path
    ctx.fillStyle = '#ffd800'
    for (let i = 0; i < 9; i++) {
      const dotX = i * 22 + 12
      if (dotX < (t * 1.5) % (w + 40) - 20) continue
      ctx.beginPath()
      ctx.arc(dotX, centerY, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Animated Homer (moving right)
    const homerX = (t * 1.5) % (w + 40) - 20
    const mouthAngle = Math.abs(Math.sin(t * 0.15)) * 0.5
    this.drawMiniHomer(ctx, homerX, centerY - 10, 20, 1, mouthAngle)

    // Arrow keys / swipe indicator
    if (this.isMobile) {
      this.drawSwipeArrows(ctx, w / 2, centerY + 40, t)
    } else {
      this.drawArrowKeys(ctx, w / 2, centerY + 40, t)
    }
  }

  drawPowerIllustration(ctx, w, h) {
    const t = this.animFrame
    const centerY = h / 2 - 10

    // Draw path
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 10, w, h - 30)

    // Walls
    ctx.fillStyle = '#1a3388'
    ctx.fillRect(0, 0, w, 12)
    ctx.fillRect(0, h - 22, w, 22)

    // Power pellet (big flashing dot)
    const pelletX = w / 2
    const pelletPulse = 1 + Math.sin(t * 0.12) * 0.3
    const pelletAlpha = 0.6 + Math.sin(t * 0.12) * 0.4
    ctx.save()
    ctx.globalAlpha = pelletAlpha

    // Glow
    ctx.fillStyle = 'rgba(255, 216, 0, 0.3)'
    ctx.beginPath()
    ctx.arc(pelletX, centerY, 14 * pelletPulse, 0, Math.PI * 2)
    ctx.fill()

    // Pellet
    ctx.fillStyle = '#ffd800'
    ctx.beginPath()
    ctx.arc(pelletX, centerY, 7 * pelletPulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Animated arrow pointing at pellet
    const arrowBounce = Math.sin(t * 0.08) * 6
    this.drawPointerArrow(ctx, pelletX, centerY - 22 + arrowBounce, '#ffd800')

    // Homer approaching from left
    const homerX = Math.min(pelletX - 30, (t * 1.2) % (w + 40) - 20)
    const mouthAngle = Math.abs(Math.sin(t * 0.15)) * 0.5
    this.drawMiniHomer(ctx, homerX, centerY - 10, 20, 1, mouthAngle)

    // Ghost on the right (turns blue when Homer eats pellet)
    const ghostX = pelletX + 40
    const powered = homerX > pelletX - 20
    this.drawMiniGhost(ctx, ghostX, centerY - 10, 20, powered ? '#4444ff' : '#ff4444', t, powered)

    // Label
    ctx.fillStyle = '#ffd800'
    ctx.font = 'bold 11px "Bangers", Arial'
    ctx.textAlign = 'center'
    ctx.fillText(t('tutorial.power_pellet'), pelletX, h - 8)
  }

  drawGhostEatIllustration(ctx, w, h) {
    const t = this.animFrame
    const centerY = h / 2 - 10

    // Draw path
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 10, w, h - 30)

    // Walls
    ctx.fillStyle = '#1a3388'
    ctx.fillRect(0, 0, w, 12)
    ctx.fillRect(0, h - 22, w, 22)

    // Cycle: homer chases ghost, catches it, score pops up, reset
    const cycleLen = 180
    const phase = t % cycleLen

    const homerStartX = 20
    const ghostStartX = w - 40
    const meetX = w / 2 + 10

    if (phase < 80) {
      // Chase phase
      const progress = phase / 80
      const homerX = homerStartX + (meetX - 30 - homerStartX) * progress
      const ghostX = ghostStartX - (ghostStartX - meetX) * progress * 0.8

      this.drawMiniGhost(ctx, ghostX, centerY - 10, 20, '#4444ff', t, true)
      this.drawMiniHomer(ctx, homerX, centerY - 10, 20, 1, Math.abs(Math.sin(t * 0.2)) * 0.5)
    } else if (phase < 120) {
      // Score pop-up phase
      const popProgress = (phase - 80) / 40
      const scoreY = centerY - 20 * popProgress
      const alpha = 1 - popProgress * 0.5

      // Eyes (eaten ghost)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.ellipse(meetX + 4, centerY - 2, 4, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(meetX + 14, centerY - 2, 4, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0000ff'
      ctx.beginPath()
      ctx.arc(meetX + 5, centerY - 1, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(meetX + 15, centerY - 1, 2, 0, Math.PI * 2)
      ctx.fill()

      // Score popup
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#00ffff'
      ctx.font = 'bold 16px "Bangers", Arial'
      ctx.textAlign = 'center'
      ctx.fillText('200', meetX + 10, scoreY)
      ctx.restore()

      this.drawMiniHomer(ctx, meetX - 15, centerY - 10, 20, 1, 0.3)
    } else {
      // Celebration particles
      const partProgress = (phase - 120) / 60
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.05
        const dist = partProgress * 30
        const px = meetX + Math.cos(angle) * dist
        const py = centerY + Math.sin(angle) * dist
        const colors = ['#ffd800', '#ff69b4', '#00ffff', '#ff4444']
        ctx.fillStyle = colors[i % 4]
        ctx.globalAlpha = 1 - partProgress
        ctx.fillRect(px - 2, py - 2, 4, 4)
      }
      ctx.globalAlpha = 1
    }

    // Score labels
    ctx.fillStyle = '#00ffff'
    ctx.font = 'bold 10px "Bangers", Arial'
    ctx.textAlign = 'center'
    ctx.fillText('200 → 400 → 800 → 1600', w / 2, h - 6)
  }

  // Mini sprite helpers for illustrations
  drawMiniHomer(ctx, x, y, size, dir, mouthAngle) {
    const cx = x + size / 2
    const cy = y + size / 2
    const r = size / 2 - 1
    const angles = [Math.PI * 1.5, 0, Math.PI * 0.5, Math.PI]
    const a = angles[dir]

    ctx.fillStyle = '#ffd800'
    ctx.beginPath()
    ctx.arc(cx, cy, r, a + mouthAngle, a + Math.PI * 2 - mouthAngle)
    ctx.lineTo(cx, cy)
    ctx.closePath()
    ctx.fill()

    // Eye
    const eyeX = cx + Math.cos(a - 0.4) * r * 0.35
    const eyeY = cy + Math.sin(a - 0.4) * r * 0.35
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(eyeX + Math.cos(a) * 1, eyeY + Math.sin(a) * 1, 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  drawMiniGhost(ctx, x, y, size, color, frame, frightened) {
    const cx = x + size / 2
    const cy = y + size / 2
    const r = size / 2 - 1

    // Body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy - 2, r, Math.PI, 0)
    ctx.lineTo(cx + r, cy + r)
    // Wavy bottom
    for (let i = 0; i < 4; i++) {
      const waveX = cx + r - (i + 1) * (size / 4)
      const waveY = cy + r + Math.sin(frame * 0.15 + i) * 2
      ctx.lineTo(waveX, waveY)
    }
    ctx.closePath()
    ctx.fill()

    // Eyes
    if (frightened) {
      // Frightened face
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(cx - 3, cy - 3, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 3, cy - 3, 2, 0, Math.PI * 2)
      ctx.fill()
      // Wobbly mouth
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - 4, cy + 2)
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(cx - 4 + i * 2, cy + 2 + (i % 2 === 0 ? 0 : 2))
      }
      ctx.stroke()
    } else {
      // Normal eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(cx - 3, cy - 3, 3, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx + 3, cy - 3, 3, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#00f'
      ctx.beginPath()
      ctx.arc(cx - 2, cy - 2, 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 4, cy - 2, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawPointerArrow(ctx, x, y, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y + 8)
    ctx.lineTo(x - 6, y)
    ctx.lineTo(x + 6, y)
    ctx.closePath()
    ctx.fill()
  }

  drawArrowKeys(ctx, x, y, frame) {
    const highlight = Math.floor(frame / 30) % 4
    const keys = [
      { label: '↑', dx: 0, dy: -14 },
      { label: '→', dx: 14, dy: 0 },
      { label: '↓', dx: 0, dy: 14 },
      { label: '←', dx: -14, dy: 0 }
    ]

    keys.forEach((key, i) => {
      const active = i === highlight
      ctx.fillStyle = active ? 'rgba(255, 216, 0, 0.6)' : 'rgba(255, 255, 255, 0.15)'
      ctx.strokeStyle = active ? '#ffd800' : 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1

      const kx = x + key.dx - 6
      const ky = y + key.dy - 6
      ctx.fillRect(kx, ky, 12, 12)
      ctx.strokeRect(kx, ky, 12, 12)

      ctx.fillStyle = active ? '#000' : '#888'
      ctx.font = 'bold 9px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(key.label, x + key.dx, y + key.dy)
    })
    ctx.textBaseline = 'alphabetic'
  }

  drawSwipeArrows(ctx, x, y, frame) {
    const highlight = Math.floor(frame / 30) % 4
    const dirs = [
      { dx: 0, dy: -12, angle: -Math.PI / 2 },
      { dx: 12, dy: 0, angle: 0 },
      { dx: 0, dy: 12, angle: Math.PI / 2 },
      { dx: -12, dy: 0, angle: Math.PI }
    ]

    dirs.forEach((d, i) => {
      const active = i === highlight
      const alpha = active ? 1 : 0.3
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x + d.dx * 1.5, y + d.dy * 1.5)
      ctx.rotate(d.angle)
      ctx.fillStyle = active ? '#ffd800' : '#888'
      ctx.beginPath()
      ctx.moveTo(8, 0)
      ctx.lineTo(0, -5)
      ctx.lineTo(0, 5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    })
  }

  nextStep() {
    if (!this.isActive) return

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++
      this.renderStep()
    } else {
      this.complete()
    }
  }

  complete() {
    this.markComplete()
    this.stopAnimation()
    this.showCelebration()
  }

  skip() {
    this.markComplete()
    this.stopAnimation()
    this.close()
  }

  markComplete() {
    try {
      localStorage.setItem('comeRosquillas_tutorialComplete', '1')
    } catch (e) {
      // localStorage unavailable — that's fine
    }
  }

  showCelebration() {
    this.overlay.innerHTML = `
      <div class="tutorial-backdrop"></div>
      <div class="tutorial-card tutorial-celebration">
        <canvas id="tutorialCelebrationCanvas" width="260" height="160"></canvas>
        <h2 class="tutorial-title">${t('tutorial.celebration_title')}</h2>
        <p class="tutorial-text">${t('tutorial.celebration_msg')}</p>
        <p class="tutorial-hint">${t('tutorial.celebration_quote')}</p>
        <button class="tutorial-btn tutorial-next-btn tutorial-play-btn">${t('tutorial.celebration_btn')}</button>
      </div>
    `

    const playBtn = this.overlay.querySelector('.tutorial-play-btn')
    playBtn.addEventListener('click', () => this.close())
    this.overlay.querySelector('.tutorial-backdrop').addEventListener('click', () => this.close())
    setTimeout(() => playBtn.focus(), 50)

    // Spawn celebration particles on the game canvas
    if (this.game && this.game.addParticles) {
      const cx = CANVAS_W / 2
      const cy = CANVAS_H / 2
      const colors = ['#ffd800', '#ff69b4', '#00ffff', '#ff4444', '#44bb44', '#ff8800']
      for (const color of colors) {
        this.game.addParticles(cx + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 100, color, 12)
      }
    }

    // Run celebration canvas animation
    this.runCelebrationAnimation()

    // Auto-close after 4 seconds
    this._celebrationTimeout = setTimeout(() => {
      if (this.isActive) this.close()
    }, 4000)
  }

  runCelebrationAnimation() {
    const canvas = document.getElementById('tutorialCelebrationCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    // Generate burst particles
    const particles = []
    const colors = ['#ffd800', '#ff69b4', '#00ffff', '#ff4444', '#44bb44', '#ff8800', '#fff']
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2
      const speed = 1 + Math.random() * 3
      particles.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 50 + Math.random() * 40,
        maxLife: 90,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4
      })
    }

    const animate = () => {
      if (!this.isActive) return
      ctx.clearRect(0, 0, w, h)

      let alive = 0
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04
        p.life--
        if (p.life <= 0) continue
        alive++

        ctx.globalAlpha = p.life / p.maxLife
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      }
      ctx.globalAlpha = 1

      if (alive > 0) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }

  close() {
    this.isActive = false
    this.overlay.style.display = 'none'
    this.stopAnimation()
    if (this._celebrationTimeout) {
      clearTimeout(this._celebrationTimeout)
      this._celebrationTimeout = null
    }
  }

  // Called from settings menu "Show Tutorial" option
  reset() {
    try {
      localStorage.removeItem('comeRosquillas_tutorialComplete')
    } catch (e) {}
    this.start()
  }
}
