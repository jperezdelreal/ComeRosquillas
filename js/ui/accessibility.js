// ===========================
// Come Rosquillas - Accessibility Module
// ===========================

'use strict';

class AccessibilityManager {
    constructor() {
        this.settings = {
            colorblindMode: 'none',
            highContrast: false,
            reduceMotion: false,
            largeText: false,
            screenReaderAnnouncements: true,
            eventSubtitles: true,
            visualAudioIndicators: true,
        };

        // Ghost icon identifiers for colorblind mode
        this.ghostIcons = ['👔', '🔪', '😂', '🚬'];
        this.ghostLabels = ['Sr. Burns', 'Bob Patiño', 'Nelson', 'Snake'];

        // Colorblind-safe palettes
        this.palettes = {
            none: null,
            protanopia: {
                ghosts: ['#4477AA', '#EE6677', '#228833', '#CCBB44'],
                walls: { main: '#4477AA', dark: '#335588', light: '#6699CC', border: '#88BBEE' },
            },
            deuteranopia: {
                ghosts: ['#332288', '#CC6677', '#117733', '#DDCC77'],
                walls: { main: '#332288', dark: '#221166', light: '#5544AA', border: '#7766CC' },
            },
            tritanopia: {
                ghosts: ['#AA3377', '#0077BB', '#EE7733', '#009988'],
                walls: { main: '#AA3377', dark: '#882255', light: '#CC5599', border: '#EE77BB' },
            },
        };

        // High contrast palette
        this.highContrastColors = {
            wallMain: '#000000',
            wallDark: '#1a1a1a',
            wallLight: '#333333',
            wallBorder: '#ffffff',
            floor: '#ffffff',
            dot: '#000000',
            power: '#ff0000',
        };

        this._liveRegion = null;
        this._subtitleContainer = null;
        this._subtitleTimeout = null;
        this._proximityIndicator = null;

        this.loadSettings();
        this._respectOSPreferences();
        this._createLiveRegion();
        this._createSubtitleContainer();
        this._createProximityIndicator();
    }

    // ==================== ARIA LIVE REGION ====================
    _createLiveRegion() {
        this._liveRegion = document.createElement('div');
        this._liveRegion.id = 'a11y-live-region';
        this._liveRegion.setAttribute('role', 'status');
        this._liveRegion.setAttribute('aria-live', 'polite');
        this._liveRegion.setAttribute('aria-atomic', 'true');
        Object.assign(this._liveRegion.style, {
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: '0',
        });
        document.body.appendChild(this._liveRegion);
    }

    announce(message) {
        if (!this.settings.screenReaderAnnouncements || !this._liveRegion) return;
        // Clear and re-set to ensure screen readers pick up repeated messages
        this._liveRegion.textContent = '';
        requestAnimationFrame(() => {
            this._liveRegion.textContent = message;
        });
    }

    // ==================== EVENT SUBTITLES ====================
    _createSubtitleContainer() {
        this._subtitleContainer = document.createElement('div');
        this._subtitleContainer.id = 'a11y-subtitles';
        this._subtitleContainer.setAttribute('aria-hidden', 'true');
        Object.assign(this._subtitleContainer.style, {
            position: 'fixed',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#ffffff',
            fontFamily: "'Bangers', Arial, sans-serif",
            fontSize: '18px',
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 216, 0, 0.4)',
            zIndex: '500',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.3s',
            letterSpacing: '1px',
            textAlign: 'center',
            maxWidth: '90vw',
        });
        document.body.appendChild(this._subtitleContainer);
    }

    showSubtitle(text, duration = 2000) {
        if (!this.settings.eventSubtitles || !this._subtitleContainer) return;
        this._subtitleContainer.textContent = text;
        this._subtitleContainer.style.opacity = '1';
        clearTimeout(this._subtitleTimeout);
        this._subtitleTimeout = setTimeout(() => {
            this._subtitleContainer.style.opacity = '0';
        }, duration);
    }

    // ==================== PROXIMITY INDICATOR ====================
    _createProximityIndicator() {
        this._proximityIndicator = document.createElement('div');
        this._proximityIndicator.id = 'a11y-proximity';
        this._proximityIndicator.setAttribute('aria-hidden', 'true');
        Object.assign(this._proximityIndicator.style, {
            position: 'fixed',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            fontSize: '28px',
            zIndex: '500',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.3s',
            textShadow: '0 0 8px rgba(255,0,0,0.8)',
        });
        this._proximityIndicator.textContent = '⚠️';
        document.body.appendChild(this._proximityIndicator);
    }

    updateProximity(ghostsNearby) {
        if (!this.settings.visualAudioIndicators || !this._proximityIndicator) return;
        if (ghostsNearby) {
            this._proximityIndicator.style.opacity = '1';
        } else {
            this._proximityIndicator.style.opacity = '0';
        }
    }

    // ==================== COLORBLIND SUPPORT ====================
    getGhostColor(ghostIndex) {
        const mode = this.settings.colorblindMode;
        if (mode === 'none' || !this.palettes[mode]) return null;
        return this.palettes[mode].ghosts[ghostIndex] || null;
    }

    getWallColors() {
        if (this.settings.highContrast) {
            return {
                main: this.highContrastColors.wallMain,
                dark: this.highContrastColors.wallDark,
                light: this.highContrastColors.wallLight,
                border: this.highContrastColors.wallBorder,
            };
        }
        const mode = this.settings.colorblindMode;
        if (mode === 'none' || !this.palettes[mode]) return null;
        return this.palettes[mode].walls;
    }

    getFloorColor() {
        if (this.settings.highContrast) return this.highContrastColors.floor;
        return null;
    }

    shouldDrawGhostIcon() {
        return this.settings.colorblindMode !== 'none';
    }

    getGhostIcon(ghostIndex) {
        return this.ghostIcons[ghostIndex] || '👻';
    }

    // ==================== HIGH CONTRAST ====================
    getDotColor() {
        if (this.settings.highContrast) return this.highContrastColors.dot;
        return null;
    }

    getPowerColor() {
        if (this.settings.highContrast) return this.highContrastColors.power;
        return null;
    }

    // ==================== REDUCE MOTION ====================
    shouldReduceMotion() {
        return this.settings.reduceMotion;
    }

    // ==================== LARGE TEXT ====================
    applyLargeText() {
        const container = document.getElementById('gameContainer');
        if (!container) return;
        if (this.settings.largeText) {
            container.style.transform = 'scale(1.2)';
            container.style.transformOrigin = 'top center';
        } else {
            container.style.transform = '';
            container.style.transformOrigin = '';
        }
    }

    // ==================== PERSISTENCE ====================
    loadSettings() {
        try {
            const saved = localStorage.getItem('comeRosquillasA11y');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load accessibility settings:', e);
        }
    }

    _respectOSPreferences() {
        // Auto-enable reduce motion if OS prefers it and user hasn't explicitly set it
        try {
            const saved = localStorage.getItem('comeRosquillasA11y');
            if (!saved || !JSON.parse(saved).hasOwnProperty('reduceMotion')) {
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    this.settings.reduceMotion = true;
                }
            }
        } catch (e) { /* ignore */ }
    }

    saveSettings() {
        try {
            localStorage.setItem('comeRosquillasA11y', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save accessibility settings:', e);
        }
    }

    // ==================== GAME EVENT HOOKS ====================
    onGameStart() {
        this.announce('Game started. Use arrow keys to move Homer.');
        this.showSubtitle('[Game Started]');
    }

    onLevelStart(level) {
        this.announce(`Level ${level} started.`);
        this.showSubtitle(`[Level ${level}]`);
    }

    onScoreUpdate(score) {
        // Only announce milestone scores to avoid noise
        if (score > 0 && score % 1000 === 0) {
            this.announce(`Score: ${score}`);
        }
    }

    onGhostEaten(ghostName) {
        this.announce(`Ghost eaten: ${ghostName}`);
        this.showSubtitle(`[Ghost Eaten: ${ghostName}]`);
    }

    onPowerUp(name) {
        this.announce(`Power-up collected: ${name}`);
        this.showSubtitle(`[Power-Up: ${name}]`);
    }

    onDeath(livesRemaining) {
        this.announce(`Homer died. ${livesRemaining} lives remaining.`);
        this.showSubtitle(`[Homer Died — ${livesRemaining} Lives Left]`);
    }

    onGameOver(score) {
        this.announce(`Game over. Final score: ${score}`);
        this.showSubtitle(`[Game Over — Score: ${score}]`);
    }

    onPause() {
        this.announce('Game paused.');
        this.showSubtitle('[Paused]');
    }

    onResume() {
        this.announce('Game resumed.');
        this.showSubtitle('[Resumed]');
    }

    onCombo(multiplier) {
        if (multiplier >= 3) {
            this.announce(`Combo x${multiplier}!`);
            this.showSubtitle(`[Combo x${multiplier}!]`);
        }
    }

    onFrightened() {
        this.announce('Duff Beer collected! Ghosts are frightened.');
        this.showSubtitle('[Ghosts Frightened!]');
    }
}

// Global singleton
const a11y = new AccessibilityManager();
