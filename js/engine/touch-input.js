// ===========================
// Come Rosquillas - Touch Input System
// ===========================

'use strict';

class TouchInput {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        
        // Swipe detection
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.minSwipeDistance = 30;
        this.maxSwipeTime = 300;
        
        // D-pad state
        this.dpadActive = null; // 'up', 'down', 'left', 'right', or null
        
        // Button elements
        this.dpadElement = null;
        this.pauseButton = null;
        this.muteButton = null;
        
        this.setupTouchElements();
        this.setupTouchHandlers();
    }

    setupTouchElements() {
        const container = document.getElementById('gameContainer');
        
        // Create D-pad overlay
        this.dpadElement = document.createElement('div');
        this.dpadElement.id = 'touchDpad';
        this.dpadElement.innerHTML = `
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="55" fill="rgba(255,255,255,0.08)" stroke="rgba(255,216,0,0.4)" stroke-width="2"/>
                <path id="dpad-up" d="M60,20 L75,45 L45,45 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5"/>
                <path id="dpad-down" d="M60,100 L45,75 L75,75 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5"/>
                <path id="dpad-left" d="M20,60 L45,45 L45,75 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5"/>
                <path id="dpad-right" d="M100,60 L75,75 L75,45 Z" fill="rgba(255,216,0,0.3)" stroke="rgba(255,216,0,0.6)" stroke-width="1.5"/>
            </svg>
        `;
        container.appendChild(this.dpadElement);
        
        // Create pause button
        this.pauseButton = document.createElement('button');
        this.pauseButton.id = 'touchPauseBtn';
        this.pauseButton.innerHTML = '⏸';
        this.pauseButton.setAttribute('aria-label', 'Pause');
        container.appendChild(this.pauseButton);
        
        // Create mute button
        this.muteButton = document.createElement('button');
        this.muteButton.id = 'touchMuteBtn';
        this.muteButton.innerHTML = '🔇';
        this.muteButton.setAttribute('aria-label', 'Mute');
        container.appendChild(this.muteButton);
    }

    setupTouchHandlers() {
        // Swipe detection on canvas
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // D-pad controls
        const dpadUp = this.dpadElement.querySelector('#dpad-up');
        const dpadDown = this.dpadElement.querySelector('#dpad-down');
        const dpadLeft = this.dpadElement.querySelector('#dpad-left');
        const dpadRight = this.dpadElement.querySelector('#dpad-right');
        
        this.setupDpadButton(dpadUp, 'ArrowUp', 'up');
        this.setupDpadButton(dpadDown, 'ArrowDown', 'down');
        this.setupDpadButton(dpadLeft, 'ArrowLeft', 'left');
        this.setupDpadButton(dpadRight, 'ArrowRight', 'right');
        
        // Pause button
        this.pauseButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.triggerKey('KeyP');
            this.pauseButton.style.transform = 'scale(0.9)';
        });
        this.pauseButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.pauseButton.style.transform = 'scale(1)';
        });
        
        // Mute button
        this.muteButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.triggerKey('KeyM');
            this.muteButton.style.transform = 'scale(0.9)';
        });
        this.muteButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.muteButton.style.transform = 'scale(1)';
        });
    }

    setupDpadButton(element, keyCode, direction) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dpadActive = direction;
            this.game.keys[keyCode] = true;
            element.setAttribute('fill', 'rgba(255,216,0,0.7)');
            
            // For high score entry, dispatch keyboard event
            if (this.game.state === ST_HIGH_SCORE_ENTRY) {
                this.triggerKey(keyCode);
            }
        });
        
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.dpadActive === direction) {
                this.dpadActive = null;
                this.game.keys[keyCode] = false;
                element.setAttribute('fill', 'rgba(255,216,0,0.3)');
            }
        });
        
        element.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (this.dpadActive === direction) {
                this.dpadActive = null;
                this.game.keys[keyCode] = false;
                element.setAttribute('fill', 'rgba(255,216,0,0.3)');
            }
        });
    }

    handleTouchStart(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();
        
        // Touch-to-start on title screen
        if (this.game.state === ST_START) {
            this.game.sound.resume();
            this.game.startNewGame();
        } else if (this.game.state === ST_HIGH_SCORE_ENTRY) {
            // Touch on canvas during high score entry = confirm (Enter)
            this.triggerKey('Enter');
        } else if (this.game.state === ST_GAME_OVER) {
            this.game.sound.resume();
            this.game.state = ST_START;
            this.game.maze = MAZE_TEMPLATE.map(row => [...row]);
            this.game.showStartScreen();
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Check if this is a swipe
        if (distance >= this.minSwipeDistance && deltaTime <= this.maxSwipeTime) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            
            // Determine swipe direction
            if (absX > absY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.triggerSwipe('ArrowRight');
                } else {
                    this.triggerSwipe('ArrowLeft');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.triggerSwipe('ArrowDown');
                } else {
                    this.triggerSwipe('ArrowUp');
                }
            }
        }
    }

    triggerSwipe(keyCode) {
        // Simulate keypress for swipe
        this.game.keys[keyCode] = true;
        setTimeout(() => {
            this.game.keys[keyCode] = false;
        }, 100);
    }

    triggerKey(keyCode) {
        // Simulate a full key press and release
        const event = new KeyboardEvent('keydown', { code: keyCode });
        document.dispatchEvent(event);
    }
}
