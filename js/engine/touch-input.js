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

        // Joystick state
        this._joystickTouchId = null
        this._joystickDirection = null
        this._joystickCenterX = 0
        this._joystickCenterY = 0
        this._joystickDeadZone = 18 // px — ignore tiny movements near center
        this._joystickRadius = 60   // px — max travel for the thumb indicator

        // Control mode: 'joystick' (default) or 'dpad'
        this._controlMode = this._loadControlModePref()

        // Button elements
        this.dpadElement = null
        this.joystickElement = null
        this.pauseButton = null
        this.muteButton = null
        this.fullscreenButton = null

        // Haptic feedback support
        this._hapticEnabled = this._loadHapticPref()

        this.setupTouchElements()
        this.setupTouchHandlers()
        this.setupOrientationWarning()

        // Apply initial control mode visibility
        this._applyControlMode()
    }

    // --- Control Mode ---

    _loadControlModePref() {
        try {
            const v = localStorage.getItem('comeRosquillas_controlMode')
            return v === 'dpad' ? 'dpad' : 'joystick'
        } catch { return 'joystick' }
    }

    setControlMode(mode) {
        this._controlMode = mode === 'dpad' ? 'dpad' : 'joystick'
        try { localStorage.setItem('comeRosquillas_controlMode', this._controlMode) } catch {}
        this._applyControlMode()
        // Clear any active direction when switching
        this._clearJoystickDirection()
        this.dpadActive = null
    }

    _applyControlMode() {
        if (!this.dpadElement || !this.joystickElement) return
        if (this._controlMode === 'joystick') {
            this.dpadElement.classList.add('touch-control-hidden')
            this.joystickElement.classList.remove('touch-control-hidden')
        } else {
            this.joystickElement.classList.add('touch-control-hidden')
            this.dpadElement.classList.remove('touch-control-hidden')
        }
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

        // Controls bar — Game Boy layout: D-pad left, buttons right
        this.controlsBar = document.createElement('div')
        this.controlsBar.id = 'touchControlsBar'

        // D-pad — classic cross/plus shape (Game Boy style)
        this.dpadElement = document.createElement('div')
        this.dpadElement.id = 'touchDpad'
        this.dpadElement.innerHTML = `
            <div class="dpad-cross">
                <div id="dpad-up" class="dpad-btn dpad-up">▲</div>
                <div id="dpad-left" class="dpad-btn dpad-left">◄</div>
                <div class="dpad-center"></div>
                <div id="dpad-right" class="dpad-btn dpad-right">►</div>
                <div id="dpad-down" class="dpad-btn dpad-down">▼</div>
            </div>
        `
        this.controlsBar.appendChild(this.dpadElement)

        // Virtual analog joystick — donut-themed circular touch zone
        this.joystickElement = document.createElement('div')
        this.joystickElement.id = 'touchJoystick'
        this.joystickElement.innerHTML = `
            <div class="joystick-base">
                <div class="joystick-ring"></div>
                <div class="joystick-thumb" id="joystickThumb"></div>
                <div class="joystick-center"></div>
            </div>
        `
        this.controlsBar.appendChild(this.joystickElement)

        // Button cluster — right side of controls bar
        const btnCluster = document.createElement('div')
        btnCluster.id = 'touchBtnCluster'

        // Settings button (mirrors #settingsBtn for portrait touch)
        this.settingsButton = document.createElement('button')
        this.settingsButton.id = 'touchSettingsBtn'
        this.settingsButton.className = 'touch-action-btn'
        this.settingsButton.innerHTML = '⚙️'
        this.settingsButton.setAttribute('aria-label', 'Settings')
        btnCluster.appendChild(this.settingsButton)

        // Pause button
        this.pauseButton = document.createElement('button')
        this.pauseButton.id = 'touchPauseBtn'
        this.pauseButton.className = 'touch-action-btn'
        this.pauseButton.innerHTML = '⏸'
        this.pauseButton.setAttribute('aria-label', 'Pause')
        btnCluster.appendChild(this.pauseButton)

        // Mute button — starts unmuted (audio plays by default)
        this.muteButton = document.createElement('button')
        this.muteButton.id = 'touchMuteBtn'
        this.muteButton.className = 'touch-action-btn'
        this.muteButton.innerHTML = '🔊'
        this.muteButton.setAttribute('aria-label', 'Toggle sound')
        btnCluster.appendChild(this.muteButton)

        // Fullscreen toggle button
        this.fullscreenButton = document.createElement('button')
        this.fullscreenButton.id = 'touchFullscreenBtn'
        this.fullscreenButton.className = 'touch-action-btn'
        this.fullscreenButton.innerHTML = '⛶'
        this.fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen')
        btnCluster.appendChild(this.fullscreenButton)

        this.controlsBar.appendChild(btnCluster)
        container.appendChild(this.controlsBar)
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

        // Joystick touch handlers
        this.joystickElement.addEventListener('touchstart', (e) => this._onJoystickStart(e), { passive: false })
        this.joystickElement.addEventListener('touchmove', (e) => this._onJoystickMove(e), { passive: false })
        this.joystickElement.addEventListener('touchend', (e) => this._onJoystickEnd(e), { passive: false })
        this.joystickElement.addEventListener('touchcancel', (e) => this._onJoystickEnd(e), { passive: false })

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
        // Click handler for desktop mouse support
        this.pauseButton.addEventListener('click', (e) => {
            e.preventDefault()
            this.triggerKey('KeyP')
        })

        // Mute button — resume AudioContext directly from real user gesture
        this.muteButton.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.game.sound.resume()
            this.triggerKey('KeyM')
            this._updateMuteButtonIcon()
            this.vibrate(10)
            this.muteButton.classList.add('touch-btn-active')
        })
        this.muteButton.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.muteButton.classList.remove('touch-btn-active')
        })
        // Click handler for desktop mouse support
        this.muteButton.addEventListener('click', (e) => {
            e.preventDefault()
            this.game.sound.resume()
            this.triggerKey('KeyM')
            this._updateMuteButtonIcon()
        })

        // Settings button — opens settings menu via #settingsBtn
        this.settingsButton.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.vibrate(10)
            this.settingsButton.classList.add('touch-btn-active')
            document.getElementById('settingsBtn')?.click()
        })
        this.settingsButton.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.settingsButton.classList.remove('touch-btn-active')
        })
        this.settingsButton.addEventListener('click', (e) => {
            e.preventDefault()
            document.getElementById('settingsBtn')?.click()
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
        // Click handler for desktop mouse support
        this.fullscreenButton.addEventListener('click', (e) => {
            e.preventDefault()
            this.toggleFullscreen()
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

    _updateMuteButtonIcon() {
        if (!this.muteButton || !this.game.sound) return
        const muted = this.game.sound.isMuted
        this.muteButton.innerHTML = muted ? '🔇' : '🔊'
        this.muteButton.setAttribute('aria-label', muted ? 'Unmute' : 'Mute')
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

    // --- Virtual Joystick ---

    _onJoystickStart(e) {
        e.preventDefault()
        e.stopPropagation()
        if (this._joystickTouchId !== null) return

        const touch = e.changedTouches[0]
        this._joystickTouchId = touch.identifier

        // Center = middle of the joystick element; radius adapts to rendered size
        const rect = this.joystickElement.getBoundingClientRect()
        this._joystickCenterX = rect.left + rect.width / 2
        this._joystickCenterY = rect.top + rect.height / 2
        this._joystickRadius = Math.min(rect.width, rect.height) * 0.375

        this._updateJoystick(touch.clientX, touch.clientY)
        this.vibrate(6)
    }

    _onJoystickMove(e) {
        e.preventDefault()
        e.stopPropagation()
        for (const touch of e.changedTouches) {
            if (touch.identifier === this._joystickTouchId) {
                this._updateJoystick(touch.clientX, touch.clientY)
                return
            }
        }
    }

    _onJoystickEnd(e) {
        e.preventDefault()
        e.stopPropagation()
        for (const touch of e.changedTouches) {
            if (touch.identifier === this._joystickTouchId) {
                this._joystickTouchId = null
                this._clearJoystickDirection()
                this._resetThumbPosition()
                return
            }
        }
    }

    _updateJoystick(touchX, touchY) {
        const dx = touchX - this._joystickCenterX
        const dy = touchY - this._joystickCenterY
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Update thumb visual position (clamped to radius)
        const clampedDist = Math.min(dist, this._joystickRadius)
        const angle = Math.atan2(dy, dx)
        const thumbX = clampedDist * Math.cos(angle)
        const thumbY = clampedDist * Math.sin(angle)
        const thumb = this.joystickElement.querySelector('#joystickThumb')
        if (thumb) {
            thumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`
        }

        // Dead zone — no direction
        if (dist < this._joystickDeadZone) {
            this._clearJoystickDirection()
            this._updateJoystickVisualFeedback(null)
            return
        }

        // Map angle to cardinal direction
        // atan2 returns angle in radians: right=0, down=π/2, left=±π, up=-π/2
        const angleDeg = angle * (180 / Math.PI)
        let newDirection = null

        if (angleDeg >= -45 && angleDeg < 45) {
            newDirection = 'right'
        } else if (angleDeg >= 45 && angleDeg < 135) {
            newDirection = 'down'
        } else if (angleDeg >= -135 && angleDeg < -45) {
            newDirection = 'up'
        } else {
            newDirection = 'left'
        }

        if (newDirection !== this._joystickDirection) {
            this._clearJoystickDirection()
            this._joystickDirection = newDirection

            const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
            this.game.keys[keyMap[newDirection]] = true

            // For high-score entry, also dispatch keydown event
            if (this.game.state === ST_HIGH_SCORE_ENTRY) {
                this.triggerKey(keyMap[newDirection])
            }

            this.vibrate(5)
        }

        this._updateJoystickVisualFeedback(newDirection)
    }

    _clearJoystickDirection() {
        if (this._joystickDirection) {
            const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
            this.game.keys[keyMap[this._joystickDirection]] = false
            this._joystickDirection = null
        }
    }

    _resetThumbPosition() {
        const thumb = this.joystickElement.querySelector('#joystickThumb')
        if (thumb) {
            thumb.style.transform = 'translate(0px, 0px)'
        }
        this._updateJoystickVisualFeedback(null)
    }

    _updateJoystickVisualFeedback(direction) {
        const base = this.joystickElement.querySelector('.joystick-base')
        if (!base) return
        base.classList.remove('joystick-dir-up', 'joystick-dir-down', 'joystick-dir-left', 'joystick-dir-right')
        if (direction) {
            base.classList.add(`joystick-dir-${direction}`)
        }
    }

    // Orientation warning removed — portrait is the natural orientation for this vertical game
    setupOrientationWarning() {
        // No-op: portrait mode is preferred
    }
}
