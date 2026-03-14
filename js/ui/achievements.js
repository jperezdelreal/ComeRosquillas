// ===========================
// Come Rosquillas - Achievement System
// Tracks, persists, and displays unlockable achievements
// ===========================

'use strict'

class AchievementManager {
  constructor(highScoreManager, soundManager) {
    this._highScores = highScoreManager
    this._sound = soundManager
    this._data = this._load()
    this._toastQueue = []
    this._toastActive = false
    this._confettiCanvas = null
    this._confettiParticles = []
    this._confettiRaf = null

    this._createToastContainer()
  }

  // ==================== PERSISTENCE ====================

  _load() {
    const defaults = { unlocked: {}, powerUpTypes: [], themes: [] }
    try {
      const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        return { ...defaults, ...parsed }
      }
    } catch (e) {
      console.warn('Could not load achievements:', e)
    }
    return defaults
  }

  _save() {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(this._data))
    } catch (e) {
      console.warn('Could not save achievements:', e)
    }
  }

  // ==================== CORE API ====================

  isUnlocked(id) {
    return !!this._data.unlocked[id]
  }

  getUnlockedCount() {
    return Object.keys(this._data.unlocked).length
  }

  getAll() {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: !!this._data.unlocked[a.id],
      unlockedAt: this._data.unlocked[a.id] || null,
      progress: this._getProgress(a)
    }))
  }

  _unlock(id) {
    if (this._data.unlocked[id]) return false
    this._data.unlocked[id] = new Date().toISOString()
    this._save()
    const ach = ACHIEVEMENTS.find(a => a.id === id)
    if (ach) this._queueToast(ach)
    return true
  }

  // ==================== PROGRESS HELPERS ====================

  _getProgress(achievement) {
    const id = achievement.id
    if (this._data.unlocked[id]) return achievement.target
    const stats = this._highScores ? this._highScores.getLifetimeStats() : {}
    switch (id) {
      case 'ghost_hunter': return stats.totalGhostsEaten || 0
      case 'donut_connoisseur':
      case 'donut_addict': return stats.totalDonutsEaten || 0
      case 'veteran': return stats.totalGames || 0
      case 'completionist': return (this._data.powerUpTypes || []).length
      case 'theme_tourist': return (this._data.themes || []).length
      default: return 0
    }
  }

  // ==================== EVENT NOTIFICATIONS ====================

  notify(event, game) {
    if (typeof ACHIEVEMENTS === 'undefined') return
    switch (event) {
      case 'ghost_eaten': this._onGhostEaten(game); break
      case 'level_complete': this._onLevelComplete(game); break
      case 'death': this._onDeath(game); break
      case 'game_over': this._onGameOver(game); break
      case 'score_update': this._onScoreUpdate(game); break
      case 'power_pellet': this._onPowerPellet(game); break
      case 'power_up_collected': this._onPowerUpCollected(game); break
      case 'power_up_combo': this._onPowerUpCombo(game); break
      case 'level_start': this._onLevelStart(game); break
      case 'daily_complete': this._onDailyComplete(game); break
      case 'direction_change': this._onDirectionChange(game); break
      case 'tick': this._onTick(game); break
    }
  }

  _onGhostEaten(game) {
    this._unlock('first_blood')
    const combo = Math.min(8, Math.pow(2, game.ghostsEaten - 1))
    if (combo >= 8) this._unlock('combo_master')
    if (game.ghostsEaten >= 4) this._unlock('ghost_streak')
  }

  _onLevelComplete(game) {
    if ((game._levelHitsTaken || 0) === 0) this._unlock('perfect_level')
    if (game._levelPlayStartTime) {
      const elapsed = (Date.now() - game._levelPlayStartTime) / 1000
      if (elapsed < 90) this._unlock('speed_demon')
    }
    if ((game._levelGhostsEatenCount || 0) === 0) this._unlock('pacifist')
    if (game.lives === 1) this._unlock('close_call')
    if (game.level >= 20) this._unlock('marathon')
    if (typeof ENDLESS_MODE !== 'undefined' && game.level >= ENDLESS_MODE.startLevel) {
      this._unlock('endless_explorer')
    }
    if (game.currentLayout && game.currentLayout.name) {
      const name = game.currentLayout.name
      if (!this._data.themes.includes(name)) {
        this._data.themes.push(name)
        this._save()
      }
      if (typeof MAZE_LAYOUTS !== 'undefined' && this._data.themes.length >= MAZE_LAYOUTS.length) {
        this._unlock('theme_tourist')
      }
    }
  }

  _onDeath(game) {
    if (game._levelPlayStartTime) {
      const elapsed = (Date.now() - game._levelPlayStartTime) / 1000
      if (elapsed < 5) this._unlock('doh_moment')
    }
    game._scoreAtLastDeath = game.score
  }

  _onGameOver(game) {
    const stats = this._highScores ? this._highScores.getLifetimeStats() : {}
    if ((stats.totalGhostsEaten || 0) >= 100) this._unlock('ghost_hunter')
    if ((stats.totalDonutsEaten || 0) >= 500) this._unlock('donut_connoisseur')
    if ((stats.totalDonutsEaten || 0) >= 1000) this._unlock('donut_addict')
    if ((stats.totalGames || 0) >= 50) this._unlock('veteran')
    if (typeof POWER_UP_TYPES !== 'undefined' && this._data.powerUpTypes.length >= POWER_UP_TYPES.length) {
      this._unlock('completionist')
    }
  }

  _onScoreUpdate(game) {
    if (game.score >= 100000) this._unlock('century_club')
    if (game.score >= 50000) this._unlock('rising_star')
    const scoreSinceDeath = game.score - (game._scoreAtLastDeath || 0)
    if (scoreSinceDeath >= 50000) this._unlock('untouchable')
  }

  _onPowerPellet(game) {
    game._noPowerPelletFrames = 0
  }

  _onPowerUpCollected(game) {
    if (game._lastCollectedPowerUpId) {
      const id = game._lastCollectedPowerUpId
      if (!this._data.powerUpTypes.includes(id)) {
        this._data.powerUpTypes.push(id)
        this._save()
      }
    }
  }

  _onPowerUpCombo() {
    this._unlock('combo_alchemist')
  }

  _onLevelStart(game) {
    if (game.currentLayout && game.currentLayout.name) {
      const name = game.currentLayout.name
      if (!this._data.themes.includes(name)) {
        this._data.themes.push(name)
        this._save()
      }
    }
  }

  _onDailyComplete() {
    this._unlock('daily_challenger')
  }

  _onDirectionChange(game) {
    if ((game._levelDirectionChanges || 0) >= 200) this._unlock('button_masher')
  }

  _onTick(game) {
    if ((game._noPowerPelletFrames || 0) >= 3600 && game.state === ST_PLAYING) {
      this._unlock('ghost_whisperer')
    }
  }

  // ==================== SHARE BADGES ====================

  getShareBadges() {
    const unlocked = this.getUnlockedCount()
    const total = ACHIEVEMENTS.length
    if (unlocked === 0) return ''
    const recent = this.getAll()
      .filter(a => a.unlocked)
      .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
      .slice(0, 3)
    const badgeIcons = recent.map(a => a.icon).join('')
    return badgeIcons + ' ' + unlocked + '/' + total + ' achievements'
  }

  // ==================== TOAST NOTIFICATIONS ====================

  _createToastContainer() {
    if (document.getElementById('achievementToastContainer')) return
    const container = document.createElement('div')
    container.id = 'achievementToastContainer'
    document.body.appendChild(container)
  }

  _queueToast(achievement) {
    this._toastQueue.push(achievement)
    if (!this._toastActive) this._showNextToast()
  }

  _showNextToast() {
    if (this._toastQueue.length === 0) {
      this._toastActive = false
      return
    }
    this._toastActive = true
    const ach = this._toastQueue.shift()

    if (this._sound) this._sound.play('achievement')
    this._spawnConfetti()

    const toast = document.createElement('div')
    toast.className = 'achievement-toast'
    toast.innerHTML =
      '<div class="achievement-toast-icon">' + ach.icon + '</div>' +
      '<div class="achievement-toast-body">' +
      '<div class="achievement-toast-label">' + t('achievements.toast_title') + '</div>' +
      '<div class="achievement-toast-title">' + ach.title + '</div>' +
      '<div class="achievement-toast-desc">' + ach.description + '</div>' +
      '</div>'

    const container = document.getElementById('achievementToastContainer')
    container.appendChild(toast)

    requestAnimationFrame(() => {
      toast.classList.add('achievement-toast-visible')
    })

    setTimeout(() => {
      toast.classList.remove('achievement-toast-visible')
      toast.classList.add('achievement-toast-exit')
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast)
        this._showNextToast()
      }, 400)
    }, 3000)
  }

  // ==================== CONFETTI ANIMATION ====================

  _spawnConfetti() {
    if (this._confettiRaf) cancelAnimationFrame(this._confettiRaf)

    if (!this._confettiCanvas) {
      this._confettiCanvas = document.createElement('canvas')
      this._confettiCanvas.id = 'achievementConfetti'
      this._confettiCanvas.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10001;'
      document.body.appendChild(this._confettiCanvas)
    }

    const canvas = this._confettiCanvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.display = 'block'

    const colors = ['#ffd800', '#ff69b4', '#00ff88', '#ff4444', '#44aaff', '#ff8800', '#aa44ff']
    this._confettiParticles = []
    for (let i = 0; i < 80; i++) {
      this._confettiParticles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6,
        y: -20 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        life: 1.0
      })
    }

    const ctx = canvas.getContext('2d')
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of this._confettiParticles) {
        if (p.life <= 0) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.rotation += p.rotSpeed
        p.life -= 0.008
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }
      if (alive) {
        this._confettiRaf = requestAnimationFrame(animate)
      } else {
        canvas.style.display = 'none'
        this._confettiRaf = null
      }
    }
    this._confettiRaf = requestAnimationFrame(animate)
  }

  // ==================== STATS DASHBOARD RENDERING ====================

  renderAchievementsPanel(container) {
    const all = this.getAll()
    const unlocked = all.filter(a => a.unlocked).length
    const total = all.length
    const pct = Math.round((unlocked / total) * 100)

    let html = '<div class="ach-summary">' +
      '<div class="ach-summary-count">' + unlocked + '/' + total + '</div>' +
      '<div class="ach-summary-label">' + t('achievements.progress', pct) + '</div>' +
      '<div class="ach-progress-bar"><div class="ach-progress-fill" style="width:' + pct + '%"></div></div>' +
      '</div>'

    for (const cat of ACHIEVEMENT_CATEGORIES) {
      const items = all.filter(a => a.category === cat.id)
      html += '<section class="ach-category"><h3>' + cat.emoji + ' ' + cat.name + '</h3><div class="ach-grid">'
      for (const a of items) {
        const earned = a.unlocked
        const showProgress = !earned && a.target > 1 && this._getProgress(a) > 0
        const progressPct = showProgress ? Math.min(100, (this._getProgress(a) / a.target) * 100) : 0
        const progressText = showProgress ? this._getProgress(a) + '/' + a.target : ''
        html += '<div class="ach-card ' + (earned ? 'ach-earned' : 'ach-locked') + '">'
        html += '<div class="ach-card-icon">' + (earned ? a.icon : '\u{1f512}') + '</div>'
        html += '<div class="ach-card-info">'
        html += '<div class="ach-card-title">' + a.title + '</div>'
        html += '<div class="ach-card-desc">' + a.description + '</div>'
        if (showProgress) {
          html += '<div class="ach-card-progress"><div class="ach-card-progress-fill" style="width:' + progressPct + '%"></div></div>'
          html += '<div class="ach-card-progress-text">' + progressText + '</div>'
        }
        if (earned) {
          html += '<div class="ach-card-date">' + t('achievements.unlocked_date', this._shortDate(a.unlockedAt)) + '</div>'
        }
        html += '</div></div>'
      }
      html += '</div></section>'
    }

    container.innerHTML = html
  }

  _shortDate(iso) {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
    } catch (e) { return '' }
  }

  clearAll() {
    this._data = { unlocked: {}, powerUpTypes: [], themes: [] }
    this._save()
  }
}
