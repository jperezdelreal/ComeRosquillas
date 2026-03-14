// ===========================
// Come Rosquillas - EventSystem
// Procedural mini-events that inject surprise into levels
// Handles: Event selection, effects, HUD indicator, darkness, timer
// ===========================

'use strict';

// Select a random event for the upcoming level (or null if none triggers)
Game.prototype.selectEventForLevel = function(level) {
  if (level < PROCEDURAL_EVENTS.minLevel) return null

  const isEndless = level >= ENDLESS_MODE.startLevel
  const chance = (isEndless && level >= PROCEDURAL_EVENTS.endlessThreshold)
    ? PROCEDURAL_EVENTS.endlessChance
    : PROCEDURAL_EVENTS.normalChance

  if (Math.random() >= chance) return null

  const events = PROCEDURAL_EVENTS.events
  return { ...events[Math.floor(Math.random() * events.length)] }
}

// Score multiplier for the active event (Golden Hour = 2x)
Game.prototype._getEventScoreMultiplier = function() {
  if (!this._activeEvent) return 1
  return this._activeEvent.effects.scoreMultiplier || 1
}

// Fright time multiplier for the active event (Invincibility Rush = 3x)
Game.prototype._getEventFrightMultiplier = function() {
  if (!this._activeEvent) return 1
  return this._activeEvent.effects.frightMultiplier || 1
}

// Apply event effects after initLevel() has set up the maze and entities
Game.prototype.applyEventEffects = function() {
  const evt = this._activeEvent
  if (!evt) return

  const fx = evt.effects

  // No Power-Ups: convert POWER pellets to regular DOTs
  if (fx.noPower) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.maze[r][c] === POWER) {
          this.maze[r][c] = DOT
        }
      }
    }
  }

  // Bonus Stage: remove all ghosts
  if (fx.noGhosts) {
    this.ghosts = []
    this._bossGhost = null
    this._bossConfig = null
  }

  // Double Trouble: spawn extra ghosts from the ghost house
  if (fx.extraGhosts) {
    for (let i = 0; i < fx.extraGhosts; i++) {
      const srcIdx = i % GHOST_CFG.length
      const cfg = GHOST_CFG[srcIdx]
      const ghost = {
        x: cfg.startX * TILE,
        y: cfg.startY * TILE,
        dir: UP,
        mode: GM_SCATTER,
        color: cfg.color,
        name: cfg.name,
        personality: cfg.personality,
        scatterX: cfg.scatterX,
        scatterY: cfg.scatterY,
        homeX: cfg.homeX * TILE,
        homeY: cfg.homeY * TILE,
        inHouse: true,
        exitTimer: Math.round(cfg.exitDelay * 1.5 + (4 + i) * 60),
        idx: 4 + i,
        isBoss: false,
        _lastDecisionTile: -1,
      }
      ghost.speed = this.getSpeed('ghost', ghost)
      this.ghosts.push(ghost)
    }
  }

  // Ghost Frenzy: permanent chase mode (all timers set to infinite chase)
  if (fx.noScatter) {
    this.globalMode = GM_CHASE
    this._levelModeTimers = this._levelModeTimers.map((t, i) => {
      if (i % 2 === 0) return 0   // zero scatter
      return -1                    // infinite chase
    })
    this.modeTimer = this._levelModeTimers[1]
    this.modeIndex = 1
    for (const g of this.ghosts) {
      if (!g.inHouse) g.mode = GM_CHASE
    }
  }

  // Donut Feast: place extra dots in random empty walkable tiles
  if (fx.bonusDots) {
    const emptyCells = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.maze[r][c] === EMPTY) emptyCells.push({ r, c })
      }
    }
    // Fisher-Yates shuffle
    for (let i = emptyCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]]
    }
    const count = Math.min(fx.bonusDots, emptyCells.length)
    for (let i = 0; i < count; i++) {
      this.maze[emptyCells[i].r][emptyCells[i].c] = DOT
      this.totalDots++
    }
  }

  // Speed Run: initialize countdown timer
  if (fx.speedRunTimer) {
    this._eventTimer = fx.speedRunTimer
  }
}

// Per-frame event update (Speed Run countdown)
Game.prototype.updateEvent = function() {
  if (!this._activeEvent) return

  const fx = this._activeEvent.effects
  if (fx.speedRunTimer && this._eventTimer > 0) {
    this._eventTimer--
    if (this._eventTimer <= 0) {
      // Time's up — trigger death
      this.state = ST_DYING
      this.stateTimer = 90
      this.sound.play('die')
      this.addFloatingText(CANVAS_W / 2, CANVAS_H / 2, '⏱️ TIME UP!', '#ff4444')
    }
  }
}

// Award bonus for event completion (Bonus Stage, Speed Run)
Game.prototype._awardEventBonus = function() {
  if (!this._activeEvent) return

  const fx = this._activeEvent.effects

  // Bonus Stage: flat bonus for clearing all dots with no ghosts
  if (fx.bonusOnComplete) {
    this.score += fx.bonusOnComplete
    this.addFloatingText(CANVAS_W / 2, CANVAS_H / 3, `🎁 +${fx.bonusOnComplete}`, '#00ff88')
    this.addParticles(CANVAS_W / 2, CANVAS_H / 3, '#00ff88', 15)
  }

  // Speed Run: bonus if time remains
  if (fx.speedRunTimer && fx.speedRunBonus && this._eventTimer > 0) {
    this.score += fx.speedRunBonus
    const secsLeft = Math.ceil(this._eventTimer / 60)
    this.addFloatingText(CANVAS_W / 2, CANVAS_H / 3, `⏱️ +${fx.speedRunBonus} (${secsLeft}s left!)`, '#00ccff')
    this.addParticles(CANVAS_W / 2, CANVAS_H / 3, '#00ccff', 15)
  }
}

// Clear event state and increment events completed counter
Game.prototype.clearActiveEvent = function() {
  if (this._activeEvent) {
    this._eventsCompleted = (this._eventsCompleted || 0) + 1
  }
  this._activeEvent = null
  this._eventTimer = 0
}

// Draw event HUD badge during gameplay (top-left, below HUD bar)
Game.prototype._drawEventHUD = function(ctx) {
  if (!this._activeEvent || this.state !== ST_PLAYING) return

  const evt = this._activeEvent

  ctx.save()

  // Badge background pill
  const badgeText = `${evt.emoji} ${evt.name}`
  ctx.font = 'bold 11px "Bangers", Arial'
  ctx.textAlign = 'left'
  const textWidth = ctx.measureText(badgeText).width
  const badgeX = 4
  const badgeY = 4

  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  const pillW = textWidth + 14
  const pillH = 18
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, pillW, pillH, 4)
  ctx.fill()

  ctx.strokeStyle = evt.color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, pillW, pillH, 4)
  ctx.stroke()

  // Pulsing text
  const pulse = 0.85 + Math.sin(this.animFrame * 0.1) * 0.15
  ctx.globalAlpha = pulse
  ctx.fillStyle = evt.color
  ctx.fillText(badgeText, badgeX + 6, badgeY + 13)

  ctx.restore()

  // Speed Run timer display
  if (evt.effects.speedRunTimer && this._eventTimer > 0) {
    const secs = Math.ceil(this._eventTimer / 60)
    const pct = this._eventTimer / evt.effects.speedRunTimer
    ctx.save()
    ctx.font = 'bold 16px "Bangers", Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = pct < 0.25 ? '#ff4444' : pct < 0.5 ? '#ff8800' : '#ffd800'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.strokeText(`⏱️ ${secs}s`, CANVAS_W / 2, 58)
    ctx.fillText(`⏱️ ${secs}s`, CANVAS_W / 2, 58)
    ctx.restore()
  }
}

// Draw fog of war darkness effect (renders after all game entities)
Game.prototype._drawDarknessEffect = function(ctx) {
  if (!this._activeEvent || !this._activeEvent.effects.darkness) return
  if (this.state !== ST_PLAYING && this.state !== ST_READY) return

  const cx = this.homer.x + TILE / 2
  const cy = this.homer.y + TILE / 2
  const radius = TILE * PROCEDURAL_EVENTS.darknessRadius

  ctx.save()

  // Solid darkness with circular cutout
  ctx.fillStyle = 'rgba(0,0,0,0.92)'
  ctx.beginPath()
  ctx.rect(0, 0, CANVAS_W, CANVAS_H)
  ctx.arc(cx, cy, radius, 0, Math.PI * 2, true)
  ctx.fill('evenodd')

  // Soft gradient edge
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.85)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Check if controls should be reversed for the active event
Game.prototype._isControlsReversed = function() {
  return !!(this._activeEvent && this._activeEvent.effects.reverseControls)
}
