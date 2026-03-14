// ===========================
// Come Rosquillas - Daily Challenge Mode
// ===========================

'use strict'

class DailyChallenge {
  constructor(game) {
    this._game = game
    this.overlay = null
    this.isOpen = false
    this._toastTimer = null
    this._activeChallenge = null
    this._timerInterval = null
    this._timeRemaining = 0

    this._createOverlay()
    this._setupEventHandlers()
  }

  // ==================== SEEDED PRNG ====================

  static _hashDate(dateStr) {
    let hash = 0x811c9dc5
    for (let i = 0; i < dateStr.length; i++) {
      hash ^= dateStr.charCodeAt(i)
      hash = Math.imul(hash, 0x01000193)
    }
    return hash >>> 0
  }

  static _seededRandom(seed) {
    let s = seed
    return () => {
      s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
      s = Math.imul(s ^ (s >>> 13), 0x45d9f3b)
      s = (s ^ (s >>> 16)) >>> 0
      return s / 0x100000000
    }
  }

  // ==================== DATE HELPERS ====================

  static _todayKey() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  static _yesterdayKey() {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  static _msUntilMidnight() {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return midnight - now
  }

  // ==================== CHALLENGE SELECTION ====================

  static getTodaysChallenge() {
    const dateKey = DailyChallenge._todayKey()
    const seed = DailyChallenge._hashDate(dateKey)
    const idx = seed % DAILY_CHALLENGE_TYPES.length
    const challenge = { ...DAILY_CHALLENGE_TYPES[idx] }
    challenge.dateKey = dateKey
    challenge.seed = seed
    challenge.mazeIndex = seed % MAZE_LAYOUTS.length
    return challenge
  }

  static getDailySeed() {
    return DailyChallenge._hashDate(DailyChallenge._todayKey())
  }

  // ==================== LEADERBOARD (localStorage) ====================

  _loadLeaderboard() {
    try {
      const data = JSON.parse(localStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY))
      if (data && typeof data === 'object') return data
    } catch (e) {}
    return {}
  }

  _saveLeaderboard(data) {
    try {
      localStorage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(data))
    } catch (e) {}
  }

  _getTodayScores() {
    const lb = this._loadLeaderboard()
    const key = DailyChallenge._todayKey()
    return Array.isArray(lb[key]) ? lb[key] : []
  }

  _getYesterdayScores() {
    const lb = this._loadLeaderboard()
    const key = DailyChallenge._yesterdayKey()
    return Array.isArray(lb[key]) ? lb[key] : []
  }

  submitScore(name, score, level, ghostsEaten, donutsEaten) {
    const lb = this._loadLeaderboard()
    const key = DailyChallenge._todayKey()
    if (!Array.isArray(lb[key])) lb[key] = []

    lb[key].push({
      name: (name || 'AAA').substring(0, 3).toUpperCase(),
      score,
      level,
      ghostsEaten: ghostsEaten || 0,
      donutsEaten: donutsEaten || 0,
      date: new Date().toISOString()
    })

    lb[key].sort((a, b) => b.score - a.score)
    lb[key] = lb[key].slice(0, 10)
    this._saveLeaderboard(lb)

    // Track in history for badge display
    this._recordCompletion(score)

    return lb[key].findIndex(s => s.score === score && s.name === name.substring(0, 3).toUpperCase()) + 1
  }

  // ==================== COMPLETION HISTORY ====================

  _loadHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(DAILY_CHALLENGE_HISTORY_KEY))
      if (data && typeof data === 'object') return data
    } catch (e) {}
    return { completedDates: [], totalChallenges: 0, bestRank: 99 }
  }

  _saveHistory(data) {
    try {
      localStorage.setItem(DAILY_CHALLENGE_HISTORY_KEY, JSON.stringify(data))
    } catch (e) {}
  }

  _recordCompletion(score) {
    const history = this._loadHistory()
    const today = DailyChallenge._todayKey()
    if (!history.completedDates.includes(today)) {
      history.completedDates.push(today)
    }
    history.totalChallenges = (history.totalChallenges || 0) + 1
    const rank = this._getTodayScores().findIndex(s => s.score === score) + 1
    if (rank > 0 && rank < (history.bestRank || 99)) {
      history.bestRank = rank
    }
    this._saveHistory(history)
  }

  hasCompletedToday() {
    const history = this._loadHistory()
    return history.completedDates.includes(DailyChallenge._todayKey())
  }

  getChallengeStreak() {
    const history = this._loadHistory()
    const dates = history.completedDates.sort().reverse()
    if (dates.length === 0) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today)
      expected.setDate(expected.getDate() - i)
      const expectedKey = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`
      if (dates.includes(expectedKey)) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  // ==================== CHALLENGE BADGE FOR HIGH SCORES ====================

  static getChallengeBadge() {
    try {
      const data = JSON.parse(localStorage.getItem(DAILY_CHALLENGE_HISTORY_KEY))
      if (!data) return null
      const total = data.totalChallenges || 0
      if (total >= 30) return { emoji: '🌟', name: 'Challenge Legend' }
      if (total >= 14) return { emoji: '⭐', name: 'Challenge Master' }
      if (total >= 7) return { emoji: '🎯', name: 'Challenge Regular' }
      if (total >= 1) return { emoji: '🆕', name: 'Challenger' }
    } catch (e) {}
    return null
  }

  // ==================== ACTIVE CHALLENGE STATE ====================

  startChallenge() {
    const challenge = DailyChallenge.getTodaysChallenge()
    this._activeChallenge = challenge
    this.close()

    const g = this._game
    g._dailyChallenge = challenge
    g.startNewGame()
  }

  isActive() {
    return this._activeChallenge !== null
  }

  getActiveChallenge() {
    return this._activeChallenge
  }

  endChallenge() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval)
      this._timerInterval = null
    }
    this._activeChallenge = null
    if (this._game) this._game._dailyChallenge = null
  }

  // Speed Run timer management
  startTimer(seconds) {
    this._timeRemaining = seconds
    if (this._timerInterval) clearInterval(this._timerInterval)
    this._timerInterval = setInterval(() => {
      this._timeRemaining--
      this._updateTimerDisplay()
      if (this._timeRemaining <= 0) {
        clearInterval(this._timerInterval)
        this._timerInterval = null
        if (this._game && this._game.state === ST_PLAYING) {
          this._game._dailyTimeUp = true
        }
      }
    }, 1000)
  }

  _updateTimerDisplay() {
    const el = document.getElementById('dailyTimerDisplay')
    if (!el) return
    const mins = Math.floor(this._timeRemaining / 60)
    const secs = this._timeRemaining % 60
    el.textContent = `${mins}:${String(secs).padStart(2, '0')}`
    el.style.display = this._timeRemaining > 0 ? '' : 'none'
    if (this._timeRemaining <= 10) {
      el.style.color = '#ff4444'
      el.style.animation = 'pulse 0.5s infinite'
    } else {
      el.style.color = '#ffd800'
      el.style.animation = ''
    }
  }

  // ==================== OVERLAY CREATION ====================

  _createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'daily-overlay'
    this.overlay.style.display = 'none'
    this.overlay.setAttribute('role', 'dialog')
    this.overlay.setAttribute('aria-label', t('daily.title'))

    this.overlay.innerHTML = `
      <div class="daily-modal">
        <div class="daily-header">
          <span class="daily-title">📅 Daily Challenge</span>
          <button class="daily-close" aria-label="Close">&times;</button>
        </div>
        <div class="daily-content">
          <div class="daily-countdown" id="dailyCountdown"></div>
          <div class="daily-card" id="dailyCard"></div>
          <div class="daily-yesterday" id="dailyYesterday"></div>
          <div class="daily-leaderboard" id="dailyLeaderboard"></div>
          <div class="daily-actions">
            <button class="daily-btn daily-btn-play" id="dailyPlayBtn">🎮 Play Today's Challenge</button>
            <button class="daily-btn daily-btn-share" id="dailyShareBtn" style="display:none">📤 Share Result</button>
          </div>
          <div class="daily-streak" id="dailyStreak"></div>
        </div>
      </div>`

    document.body.appendChild(this.overlay)
  }

  // ==================== EVENT HANDLERS ====================

  _setupEventHandlers() {
    this.overlay.querySelector('.daily-close').addEventListener('click', () => this.close())

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

    this.overlay.querySelector('#dailyPlayBtn').addEventListener('click', () => this.startChallenge())
    this.overlay.querySelector('#dailyShareBtn').addEventListener('click', () => this._shareResult())
  }

  // ==================== OPEN / CLOSE ====================

  open() {
    if (this.isOpen) return
    this.isOpen = true
    this._renderCard()
    this._renderYesterday()
    this._renderLeaderboard()
    this._renderCountdown()
    this._renderStreak()
    this._updateButtons()
    this.overlay.style.display = 'flex'
    setTimeout(() => {
      const closeBtn = this.overlay.querySelector('.daily-close')
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

  // ==================== RENDER: TODAY'S CHALLENGE CARD ====================

  _renderCard() {
    const challenge = DailyChallenge.getTodaysChallenge()
    const card = this.overlay.querySelector('#dailyCard')
    const completed = this.hasCompletedToday()
    const completedBadge = completed
      ? '<div class="daily-completed-badge">✅ Completed</div>'
      : ''

    let rulesHtml = ''
    const r = challenge.rules
    if (r.timeLimit) rulesHtml += `<span class="daily-rule">⏱️ ${r.timeLimit}s time limit</span>`
    if (r.ghostTarget) rulesHtml += `<span class="daily-rule">👻 Eat ${r.ghostTarget}+ ghosts</span>`
    if (r.perfectRun) rulesHtml += `<span class="daily-rule">✨ No deaths allowed</span>`
    if (!r.powerUpsEnabled) rulesHtml += `<span class="daily-rule">🚫 Power-ups disabled</span>`
    if (r.donutSpawnMultiplier > 1) rulesHtml += `<span class="daily-rule">🍩 ${r.donutSpawnMultiplier}x donut spawns</span>`
    if (r.scoreMultiplier > 1) rulesHtml += `<span class="daily-rule">🏆 ${r.scoreMultiplier}x score multiplier</span>`
    if (r.lives === 1) rulesHtml += `<span class="daily-rule">💀 1 life only</span>`
    if (r.ghostSpeedBonus > 0) rulesHtml += `<span class="daily-rule">👻 Ghosts ${Math.round(r.ghostSpeedBonus * 100)}% faster</span>`

    card.innerHTML = `
      <div class="daily-card-inner" style="border-color: ${challenge.color}">
        ${completedBadge}
        <div class="daily-card-emoji">${challenge.emoji}</div>
        <div class="daily-card-name" style="color: ${challenge.color}">${challenge.name}</div>
        <div class="daily-card-desc">${challenge.description}</div>
        <div class="daily-card-rules">${rulesHtml}</div>
        <div class="daily-card-maze">🗺️ ${MAZE_LAYOUTS[challenge.mazeIndex].name}</div>
      </div>`
  }

  // ==================== RENDER: YESTERDAY'S RESULTS ====================

  _renderYesterday() {
    const container = this.overlay.querySelector('#dailyYesterday')
    const scores = this._getYesterdayScores()
    if (scores.length === 0) {
      container.innerHTML = '<div class="daily-section-title">📊 Yesterday\'s Results</div><div class="daily-empty">No results from yesterday</div>'
      return
    }

    let html = '<div class="daily-section-title">📊 Yesterday\'s Results</div><div class="daily-scores-mini">'
    const medals = ['🥇', '🥈', '🥉']
    scores.slice(0, 5).forEach((s, i) => {
      const medal = medals[i] || `${i + 1}.`
      html += `<div class="daily-score-row">${medal} ${s.name} — ${s.score.toLocaleString()}</div>`
    })
    html += '</div>'
    container.innerHTML = html
  }

  // ==================== RENDER: TODAY'S LEADERBOARD ====================

  _renderLeaderboard() {
    const container = this.overlay.querySelector('#dailyLeaderboard')
    const scores = this._getTodayScores()
    if (scores.length === 0) {
      container.innerHTML = '<div class="daily-section-title">🏅 Today\'s Leaderboard</div><div class="daily-empty">Be the first to play!</div>'
      return
    }

    const medals = ['🥇', '🥈', '🥉']
    let html = '<div class="daily-section-title">🏅 Today\'s Leaderboard</div><table class="daily-table"><thead><tr><th>#</th><th>Name</th><th>Score</th><th>Lvl</th></tr></thead><tbody>'
    scores.forEach((s, i) => {
      const medal = medals[i] || `${i + 1}`
      html += `<tr><td>${medal}</td><td>${s.name}</td><td>${s.score.toLocaleString()}</td><td>${s.level || '-'}</td></tr>`
    })
    html += '</tbody></table>'
    container.innerHTML = html
  }

  // ==================== RENDER: COUNTDOWN ====================

  _renderCountdown() {
    const container = this.overlay.querySelector('#dailyCountdown')
    const ms = DailyChallenge._msUntilMidnight()
    const hours = Math.floor(ms / 3600000)
    const mins = Math.floor((ms % 3600000) / 60000)
    container.innerHTML = `<span class="daily-countdown-label">Next challenge in</span> <span class="daily-countdown-time">${hours}h ${mins}m</span>`
  }

  // ==================== RENDER: STREAK ====================

  _renderStreak() {
    const container = this.overlay.querySelector('#dailyStreak')
    const streak = this.getChallengeStreak()
    const badge = DailyChallenge.getChallengeBadge()
    let html = ''
    if (streak > 0) {
      html += `<span class="daily-streak-fire">🔥 ${streak} day streak!</span>`
    }
    if (badge) {
      html += `<span class="daily-streak-badge">${badge.emoji} ${badge.name}</span>`
    }
    container.innerHTML = html
  }

  // ==================== BUTTON STATE ====================

  _updateButtons() {
    const playBtn = this.overlay.querySelector('#dailyPlayBtn')
    const shareBtn = this.overlay.querySelector('#dailyShareBtn')
    const completed = this.hasCompletedToday()

    playBtn.textContent = completed ? '🔄 Play Again' : '🎮 Play Today\'s Challenge'
    shareBtn.style.display = completed ? '' : 'none'
  }

  // ==================== SHARE RESULT ====================

  async _shareResult() {
    const scores = this._getTodayScores()
    const challenge = DailyChallenge.getTodaysChallenge()
    const rank = scores.length > 0 ? 1 : 0
    const topScore = scores.length > 0 ? scores[0].score : 0

    let text = `${challenge.emoji} ComeRosquillas Daily Challenge: ${challenge.name}\n`
    if (rank === 1) {
      text += `🥇 I got 1st place on today's challenge!\n`
    }
    text += `🏆 Score: ${topScore.toLocaleString()}\n`
    text += `🔥 Streak: ${this.getChallengeStreak()} days\n`

    const base = window.location.origin + window.location.pathname
    const url = `${base}?ref=daily&date=${challenge.dateKey}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ComeRosquillas Daily Challenge', text, url })
        this._showToast('Shared! 🎉')
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
    } catch (e) {
      const ta = document.createElement('textarea')
      ta.value = `${text}\n${url}`
      ta.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    this._showToast('Result copied! 📋')
  }

  // ==================== TOAST ====================

  _showToast(message) {
    let toast = document.querySelector('.daily-toast-global')
    if (!toast) {
      toast = document.createElement('div')
      toast.className = 'share-toast daily-toast-global'
      document.body.appendChild(toast)
    }
    toast.textContent = message
    toast.classList.add('share-toast-visible')
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('share-toast-visible')
    }, 2500)
  }

  // ==================== CHALLENGE MODIFIER FUNCTIONS ====================

  static applyModifiers(game, challenge) {
    if (!challenge || !challenge.rules) return

    const r = challenge.rules

    // Apply lives
    if (typeof r.lives === 'number') {
      game.lives = r.lives
    }

    // Apply maze from daily seed
    if (typeof challenge.mazeIndex === 'number') {
      const layout = MAZE_LAYOUTS[challenge.mazeIndex]
      game.currentLayout = layout
      game.maze = layout.template.map(row => [...row])
    }

    // Speed Run: start countdown timer
    if (r.timeLimit && game.dailyChallenge) {
      game.dailyChallenge.startTimer(r.timeLimit)
    }

    // Donut Feast: double dot/power positions (add extra dots in empty spaces)
    if (r.donutSpawnMultiplier > 1) {
      const rng = DailyChallenge._seededRandom(challenge.seed + 42)
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (game.maze[row][col] === EMPTY && rng() < 0.3) {
            game.maze[row][col] = DOT
          }
        }
      }
      // Recount dots
      game.totalDots = 0
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (game.maze[r][c] === DOT || game.maze[r][c] === POWER) game.totalDots++
        }
      }
    }

    // No Power-Ups: remove all power pellets
    if (!r.powerUpsEnabled) {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (game.maze[row][col] === POWER) {
            game.maze[row][col] = DOT
          }
        }
      }
    }

    game.updateHUD()
  }

  static getScoreMultiplier(challenge) {
    if (!challenge || !challenge.rules) return 1
    return challenge.rules.scoreMultiplier || 1
  }

  static getGhostSpeedBonus(challenge) {
    if (!challenge || !challenge.rules) return 0
    return challenge.rules.ghostSpeedBonus || 0
  }

  // ==================== CHALLENGE BANNER HTML ====================

  static getBannerHtml(challenge) {
    if (!challenge) return ''
    return `<div style="background:linear-gradient(180deg,${challenge.color}44 0%,${challenge.color}22 100%);
      border:2px solid ${challenge.color};border-radius:10px;padding:8px 14px;margin:0 0 10px;
      color:#fff;font-size:15px;text-shadow:1px 1px 0 rgba(0,0,0,0.3);">
      ${challenge.emoji} Daily: ${challenge.name}</div>`
  }
}
