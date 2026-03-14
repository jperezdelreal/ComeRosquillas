// ===========================
// Come Rosquillas - Touch Input System
// ===========================

'use strict';

class TouchInput {
    constructor(game) {
        this.game = game
        this.canvas = game.canvas

        // Swipe detection
        this.touchStartX = 0
        this.touchStartY = 0
        this.touchStartTime = 0
        this.minSwipeDistance = 30
        this.maxSwipeTime = 300

        // D-pad state
        this.dpadActive = null

        // Button elements
        this.dpadElement = null
        this.pauseButton = null
        this.muteButton = null
        this.fullscreenButton = null

        // Haptic feedback support
        this._hapticEnabled = this._loadHapticPref()

        this.setupTouchElements()
        this.setupTouchHandlers()
        this.setupOrientationWarning()
    }

    // --- Haptic Feedback ---

    _loadHapticPref() {
        try {
            const v = localStorage.getItem('comeRosquillas_haptic')
            return v === null ? true : v === 'true'
        } catch { return true }
    }

    setHapticEnabled(on) {
        this._hapticEnabled = on
        try { localStorage.setItem('comeRosquillas_haptic', String(on)) } catch {}
    }

    vibrate(pattern) {
        if (!this._hapticEnabled) return
        if (navigator.vibrate) navigator.vibrate(pattern)
    }

    // --- Touch Elements ---

    setupTouchElements() {
        const container = document.getElementById('gameContainer')

        // D-pad — 25%+ larger SVG touch targets (viewBox 160 vs old 120)
        this.dpadElement = document.createElement('div')
        this.dpadElement.id = 'touchDpad'
        this.dpadElement.innerHTML = `
            <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="80" r="75" fill="rgba(255,255,255,0.08)" stroke="rgba(255,216,0,0.4)" stroke-width="2"/>
                <path id="dpad-up" d="M80,15 L105,55 L55,55 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5" class="dpad-arrow"/>
                <path id="dpad-down" d="M80,145 L55,105 L105,105 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5" class="dpad-arrow"/>
                <path id="dpad-left" d="M15,80 L55,55 L55,105 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5" class="dpad-arrow"/>
                <path id="dpad-right" d="M145,80 L105,105 L105,55 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5" class="dpad-arrow"/>
            </svg>
        `
        container.appendChild(this.dpadElement)

        // Pause button — top-right for right-thumb access
        this.pauseButton = document.createElement('button')
        this.pauseButton.id = 'touchPauseBtn'
        this.pauseButton.innerHTML = '⏸'
        this.pauseButton.setAttribute('aria-label', 'Pause')
        container.appendChild(this.pauseButton)

        // Mute button
        this.muteButton = document.createElement('button')
        this.muteButton.id = 'touchMuteBtn'
        this.muteButton.innerHTML = '🔇'
        this.muteButton.setAttribute('aria-label', 'Mute')
        container.appendChild(this.muteButton)

        // Fullscreen toggle button
        this.fullscreenButton = document.createElement('button')
        this.fullscreenButton.id = 'touchFullscreenBtn'
        this.fullscreenButton.innerHTML = '⛶'
        this.fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen')
        container.appendChild(this.fullscreenButton)
    }

    // --- Event Handlers ---

    setupTouchHandlers() {
        // Swipe detection on canvas
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false })
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false })
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false })

        // D-pad controls
        const dpadUp = this.dpadElement.querySelector('#dpad-up')
        const dpadDown = this.dpadElement.querySelector('#dpad-down')
        const dpadLeft = this.dpadElement.querySelector('#dpad-left')
        const dpadRight = this.dpadElement.querySelector('#dpad-right')

        this.setupDpadButton(dpadUp, 'ArrowUp', 'up')
        this.setupDpadButton(dpadDown, 'ArrowDown', 'down')
        this.setupDpadButton(dpadLeft, 'ArrowLeft', 'left')
        this.setupDpadButton(dpadRight, 'ArrowRight', 'right')

        // Pause button
        this.pauseButton.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.triggerKey('KeyP')
            this.vibrate(10)
            this.pauseButton.classList.add('touch-btn-active')
        })
        this.pauseButton.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.pauseButton.classList.remove('touch-btn-active')
        })

        // Mute button
        this.muteButton.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.triggerKey('KeyM')
            this.vibrate(10)
            this.muteButton.classList.add('touch-btn-active')
        })
        this.muteButton.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.muteButton.classList.remove('touch-btn-active')
        })

        // Fullscreen toggle
        this.fullscreenButton.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.vibrate(10)
            this.fullscreenButton.classList.add('touch-btn-active')
            this.toggleFullscreen()
        })
        this.fullscreenButton.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.fullscreenButton.classList.remove('touch-btn-active')
        })

        // Update fullscreen icon on change
        document.addEventListener('fullscreenchange', () => this._updateFullscreenIcon())
        document.addEventListener('webkitfullscreenchange', () => this._updateFullscreenIcon())
    }

    setupDpadButton(element, keyCode, direction) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.dpadActive = direction
            this.game.keys[keyCode] = true
            element.classList.add('dpad-active')
            this.vibrate(8)

            if (this.game.state === ST_HIGH_SCORE_ENTRY) {
                this.triggerKey(keyCode)
            }
        })

        element.addEventListener('touchend', (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (this.dpadActive === direction) {
                this.dpadActive = null
                this.game.keys[keyCode] = false
                element.classList.remove('dpad-active')
            }
        })

        element.addEventListener('touchcancel', (e) => {
            e.preventDefault()
            if (this.dpadActive === direction) {
                this.dpadActive = null
                this.game.keys[keyCode] = false
                element.classList.remove('dpad-active')
            }
        })
    }

    handleTouchStart(e) {
        e.preventDefault()

        const touch = e.touches[0]
        this.touchStartX = touch.clientX
        this.touchStartY = touch.clientY
        this.touchStartTime = Date.now()

        if (this.game.state === ST_START) {
            this.game.sound.resume()
            this.game.startNewGame()
        } else if (this.game.state === ST_HIGH_SCORE_ENTRY) {
            this.triggerKey('Enter')
        } else if (this.game.state === ST_GAME_OVER) {
            this.game.sound.resume()
            this.game.state = ST_START
            this.game.maze = MAZE_TEMPLATE.map(row => [...row])
            this.game.showStartScreen()
        }
    }

    handleTouchMove(e) {
        e.preventDefault()
    }

    handleTouchEnd(e) {
        e.preventDefault()

        const touch = e.changedTouches[0]
        const deltaX = touch.clientX - this.touchStartX
        const deltaY = touch.clientY - this.touchStartY
        const deltaTime = Date.now() - this.touchStartTime

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distance >= this.minSwipeDistance && deltaTime <= this.maxSwipeTime) {
            const absX = Math.abs(deltaX)
            const absY = Math.abs(deltaY)

            if (absX > absY) {
                this.triggerSwipe(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft')
            } else {
                this.triggerSwipe(deltaY > 0 ? 'ArrowDown' : 'ArrowUp')
            }
            this.vibrate(8)
        }
    }

    triggerSwipe(keyCode) {
        this.game.keys[keyCode] = true
        setTimeout(() => { this.game.keys[keyCode] = false }, 100)
    }

    triggerKey(keyCode) {
        const event = new KeyboardEvent('keydown', { code: keyCode })
        document.dispatchEvent(event)
    }

    // --- Fullscreen ---

    toggleFullscreen() {
        const el = document.documentElement
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            const req = el.requestFullscreen || el.webkitRequestFullscreen
            if (req) req.call(el).catch(() => {})
        } else {
            const exit = document.exitFullscreen || document.webkitExitFullscreen
            if (exit) exit.call(document).catch(() => {})
        }
    }

    _updateFullscreenIcon() {
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement)
        this.fullscreenButton.innerHTML = isFS ? '⮌' : '⛶'
        this.fullscreenButton.setAttribute('aria-label', isFS ? 'Exit fullscreen' : 'Enter fullscreen')
    }

    // Orientation warning removed — portrait is the natural orientation for this vertical game
    setupOrientationWarning() {
        // No-op: portrait mode is preferred
    }
}
