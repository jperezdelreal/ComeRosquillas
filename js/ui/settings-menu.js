// ===========================
// Come Rosquillas - Settings Menu
// ===========================

'use strict';

class SettingsMenu {
    constructor(soundManager) {
        this.sound = soundManager;
        this.overlay = null;
        this.isOpen = false;
        this.focusIndex = 0;
        this.focusableElements = [];
        
        // Default settings
        this.settings = {
            masterVolume: 100,
            musicVolume: 100,
            sfxVolume: 100,
            musicEnabled: true,
            difficulty: 'normal',
            debugOverlay: false,
            devConsole: false,
            aiAggression: 1.0,
            aiChaseDistance: 8,
            aiScatterMult: 1.0,
        };
        
        this.loadSettings();
        this.createOverlay();
        this.setupEventHandlers();
        this.applySettings();
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'settingsOverlay';
        this.overlay.className = 'settings-overlay';
        this.overlay.style.display = 'none';
        
        this.overlay.innerHTML = `
            <div class="settings-modal" role="dialog" aria-labelledby="settingsTitle">
                <div class="settings-header">
                    <h2 id="settingsTitle">⚙️ Settings</h2>
                    <button class="settings-close" aria-label="Close settings">✕</button>
                </div>
                
                <div class="settings-content">
                    <!-- Audio Controls -->
                    <section class="settings-section">
                        <h3>🔊 Audio</h3>
                        
                        <div class="setting-row">
                            <label for="masterVolume">Master Volume</label>
                            <div class="slider-container">
                                <input type="range" id="masterVolume" min="0" max="100" value="${this.settings.masterVolume}" />
                                <span class="slider-value">${this.settings.masterVolume}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="musicVolume">Music Volume</label>
                            <div class="slider-container">
                                <input type="range" id="musicVolume" min="0" max="100" value="${this.settings.musicVolume}" />
                                <span class="slider-value">${this.settings.musicVolume}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="sfxVolume">SFX Volume</label>
                            <div class="slider-container">
                                <input type="range" id="sfxVolume" min="0" max="100" value="${this.settings.sfxVolume}" />
                                <span class="slider-value">${this.settings.sfxVolume}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="musicToggle">Music Enabled</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="musicToggle" ${this.settings.musicEnabled ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.musicEnabled ? 'ON' : 'OFF'}</span>
                                <span class="key-hint">(M key)</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Difficulty Settings -->
                    <section class="settings-section">
                        <h3>🎮 Difficulty</h3>
                        
                        <div class="setting-row">
                            <div class="difficulty-options">
                                <label class="radio-option">
                                    <input type="radio" name="difficulty" value="easy" ${this.settings.difficulty === 'easy' ? 'checked' : ''} />
                                    <span class="radio-label">
                                        <strong>Easy</strong>
                                        <small>Slow ghosts, forgiving gameplay</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="difficulty" value="normal" ${this.settings.difficulty === 'normal' ? 'checked' : ''} />
                                    <span class="radio-label">
                                        <strong>Normal</strong>
                                        <small>Balanced challenge</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="difficulty" value="hard" ${this.settings.difficulty === 'hard' ? 'checked' : ''} />
                                    <span class="radio-label">
                                        <strong>Hard</strong>
                                        <small>Fast ghosts, intense gameplay</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Controls Display -->
                    <section class="settings-section">
                        <h3>🎹 Controls</h3>
                        
                        <div class="controls-display">
                            <div class="control-item">
                                <span class="control-key">↑ ↓ ← →</span>
                                <span class="control-action">Move Homer</span>
                            </div>
                            <div class="control-item">
                                <span class="control-key">P</span>
                                <span class="control-action">Pause Game</span>
                            </div>
                            <div class="control-item">
                                <span class="control-key">M</span>
                                <span class="control-action">Toggle Music</span>
                            </div>
                            <div class="control-item">
                                <span class="control-key">ENTER</span>
                                <span class="control-action">Start Game</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Tutorial -->
                    <section class="settings-section">
                        <h3>📖 Tutorial</h3>
                        <div class="setting-row">
                            <label>Learn the game basics</label>
                            <button class="settings-button settings-tutorial-btn" style="flex: 0; padding: 8px 16px; font-size: 16px;">
                                Show Tutorial
                            </button>
                        </div>
                    </section>
                    
                    <!-- Ghost AI Debug -->
                    <section class="settings-section">
                        <h3>🔍 Ghost AI Debug</h3>
                        
                        <div class="setting-row">
                            <label for="debugOverlay">Show Ghost AI Debug Info</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="debugOverlay" ${this.settings.debugOverlay ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.debugOverlay ? 'ON' : 'OFF'}</span>
                                <span class="key-hint">(D key)</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="devConsole">Dev Console</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="devConsole" ${this.settings.devConsole ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.devConsole ? 'ON' : 'OFF'}</span>
                                <span class="key-hint">(~ key)</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Advanced AI Tuning -->
                    <section class="settings-section settings-advanced" style="border-top: 1px solid rgba(255,216,0,0.2); padding-top: 12px;">
                        <h3>🧪 Advanced — AI Tuning</h3>
                        
                        <div class="setting-row">
                            <label for="aiAggression">Aggression</label>
                            <div class="slider-container">
                                <input type="range" id="aiAggression" min="50" max="200" value="${Math.round((this.settings.aiAggression || 1.0) * 100)}" />
                                <span class="slider-value">${Math.round((this.settings.aiAggression || 1.0) * 100)}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="aiChaseDistance">Chase Distance</label>
                            <div class="slider-container">
                                <input type="range" id="aiChaseDistance" min="4" max="16" value="${this.settings.aiChaseDistance || 8}" />
                                <span class="slider-value">${this.settings.aiChaseDistance || 8} tiles</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="aiScatterMult">Scatter Multiplier</label>
                            <div class="slider-container">
                                <input type="range" id="aiScatterMult" min="25" max="300" value="${Math.round((this.settings.aiScatterMult || 1.0) * 100)}" />
                                <span class="slider-value">${Math.round((this.settings.aiScatterMult || 1.0) * 100)}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label>AI Profile</label>
                            <button class="settings-button settings-ai-reset" style="flex: 0; padding: 6px 14px; font-size: 14px;">
                                Reset AI Defaults
                            </button>
                        </div>
                    </section>
                </div>
                
                <div class="settings-footer">
                    <button class="settings-button settings-reset">Reset to Defaults</button>
                    <button class="settings-button settings-save">Save & Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
    }
    
    setupEventHandlers() {
        // Close button
        const closeBtn = this.overlay.querySelector('.settings-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Save button
        const saveBtn = this.overlay.querySelector('.settings-save');
        saveBtn.addEventListener('click', () => this.close());
        
        // Reset button
        const resetBtn = this.overlay.querySelector('.settings-reset');
        resetBtn.addEventListener('click', () => this.resetToDefaults());
        
        // Show Tutorial button
        const tutorialBtn = this.overlay.querySelector('.settings-tutorial-btn');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                this.close();
                // Access tutorial via the global Game instance
                if (typeof Tutorial !== 'undefined') {
                    const game = this._game;
                    if (game && game.tutorial) {
                        game.tutorial.reset();
                    }
                }
            });
        }
        
        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        
        // Volume sliders
        const masterSlider = this.overlay.querySelector('#masterVolume');
        const musicSlider = this.overlay.querySelector('#musicVolume');
        const sfxSlider = this.overlay.querySelector('#sfxVolume');
        
        masterSlider.addEventListener('input', (e) => this.updateVolume('masterVolume', e.target.value));
        musicSlider.addEventListener('input', (e) => this.updateVolume('musicVolume', e.target.value));
        sfxSlider.addEventListener('input', (e) => this.updateVolume('sfxVolume', e.target.value));
        
        // Music toggle
        const musicToggle = this.overlay.querySelector('#musicToggle');
        musicToggle.addEventListener('change', (e) => this.toggleMusic(e.target.checked));
        
        // Difficulty radio buttons
        const difficultyRadios = this.overlay.querySelectorAll('input[name="difficulty"]');
        difficultyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        });
        
        // Debug overlay toggle
        const debugToggle = this.overlay.querySelector('#debugOverlay');
        if (debugToggle) {
            debugToggle.addEventListener('change', (e) => {
                this.settings.debugOverlay = e.target.checked;
                e.target.parentElement.querySelector('.toggle-label').textContent = e.target.checked ? 'ON' : 'OFF';
                this.saveSettings();
                this._syncDebugToGame();
            });
        }
        
        // Dev console toggle
        const devConsoleToggle = this.overlay.querySelector('#devConsole');
        if (devConsoleToggle) {
            devConsoleToggle.addEventListener('change', (e) => {
                this.settings.devConsole = e.target.checked;
                e.target.parentElement.querySelector('.toggle-label').textContent = e.target.checked ? 'ON' : 'OFF';
                this.saveSettings();
                this._syncDebugToGame();
            });
        }
        
        // AI tuning sliders
        const aggressionSlider = this.overlay.querySelector('#aiAggression');
        if (aggressionSlider) {
            aggressionSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) / 100;
                this.settings.aiAggression = val;
                e.target.parentElement.querySelector('.slider-value').textContent = `${parseInt(e.target.value)}%`;
                this.saveSettings();
                this._syncAITuning();
            });
        }
        
        const chaseSlider = this.overlay.querySelector('#aiChaseDistance');
        if (chaseSlider) {
            chaseSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                this.settings.aiChaseDistance = val;
                e.target.parentElement.querySelector('.slider-value').textContent = `${val} tiles`;
                this.saveSettings();
                this._syncAITuning();
            });
        }
        
        const scatterSlider = this.overlay.querySelector('#aiScatterMult');
        if (scatterSlider) {
            scatterSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) / 100;
                this.settings.aiScatterMult = val;
                e.target.parentElement.querySelector('.slider-value').textContent = `${parseInt(e.target.value)}%`;
                this.saveSettings();
                this._syncAITuning();
            });
        }
        
        // AI reset button
        const aiResetBtn = this.overlay.querySelector('.settings-ai-reset');
        if (aiResetBtn) {
            aiResetBtn.addEventListener('click', () => this.resetAIDefaults());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            if (e.code === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.code === 'Tab') {
                e.preventDefault();
                this.handleTabNavigation(e.shiftKey);
            } else if (e.code === 'Enter') {
                const focused = document.activeElement;
                if (focused && focused.classList.contains('settings-save')) {
                    this.close();
                } else if (focused && focused.classList.contains('settings-reset')) {
                    this.resetToDefaults();
                }
            }
        });
    }
    
    handleTabNavigation(reverse) {
        this.focusableElements = Array.from(this.overlay.querySelectorAll(
            'button, input, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
        
        if (this.focusableElements.length === 0) return;
        
        if (reverse) {
            this.focusIndex = (this.focusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        } else {
            this.focusIndex = (this.focusIndex + 1) % this.focusableElements.length;
        }
        
        this.focusableElements[this.focusIndex].focus();
    }
    
    updateVolume(type, value) {
        this.settings[type] = parseInt(value);
        const valueSpan = this.overlay.querySelector(`#${type}`).parentElement.querySelector('.slider-value');
        valueSpan.textContent = `${value}%`;
        this.saveSettings();
        this.applySettings();
    }
    
    toggleMusic(enabled) {
        this.settings.musicEnabled = enabled;
        const toggleLabel = this.overlay.querySelector('#musicToggle').parentElement.querySelector('.toggle-label');
        toggleLabel.textContent = enabled ? 'ON' : 'OFF';
        this.saveSettings();
        this.applySettings();
    }
    
    changeDifficulty(level) {
        this.settings.difficulty = level;
        this.saveSettings();
        
        // Call Barney's difficulty API if available (graceful fallback)
        if (typeof setDifficulty === 'function') {
            setDifficulty(level);
        }
    }
    
    applySettings() {
        if (!this.sound || !this.sound.ctx) return;
        
        // Apply master volume
        if (this.sound._masterGain) {
            const masterVol = this.settings.masterVolume / 100;
            this.sound._masterGain.gain.value = masterVol;
        }
        
        // Apply music volume (base is 0.07)
        if (this.sound._musicBus) {
            const musicVol = (this.settings.musicVolume / 100) * 0.07;
            const targetVol = this.settings.musicEnabled ? musicVol : 0;
            try {
                this.sound._musicBus.gain.setValueAtTime(targetVol, this.sound.ctx.currentTime);
            } catch (e) {
                this.sound._musicBus.gain.value = targetVol;
            }
        }
        
        // Apply SFX volume (base is 0.8)
        if (this.sound._sfxBus) {
            const sfxVol = (this.settings.sfxVolume / 100) * 0.8;
            this.sound._sfxBus.gain.value = sfxVol;
        }
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('comeRosquillasSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
                
                // Sync with Barney's difficulty API if available
                if (typeof getCurrentDifficulty === 'function') {
                    this.settings.difficulty = getCurrentDifficulty();
                }
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('comeRosquillasSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    resetToDefaults() {
        this.settings = {
            masterVolume: 100,
            musicVolume: 100,
            sfxVolume: 100,
            musicEnabled: true,
            difficulty: 'normal',
            debugOverlay: false,
            devConsole: false,
            aiAggression: 1.0,
            aiChaseDistance: 8,
            aiScatterMult: 1.0,
        };
        
        this.saveSettings();
        this.updateUI();
        this.applySettings();
        this._syncDebugToGame();
        this._syncAITuning();
        
        // Reset difficulty in Barney's system if available
        if (typeof setDifficulty === 'function') {
            setDifficulty('normal');
        }
    }
    
    updateUI() {
        // Update sliders
        this.overlay.querySelector('#masterVolume').value = this.settings.masterVolume;
        this.overlay.querySelector('#musicVolume').value = this.settings.musicVolume;
        this.overlay.querySelector('#sfxVolume').value = this.settings.sfxVolume;
        
        // Update slider value labels
        this.overlay.querySelector('#masterVolume').parentElement.querySelector('.slider-value').textContent = `${this.settings.masterVolume}%`;
        this.overlay.querySelector('#musicVolume').parentElement.querySelector('.slider-value').textContent = `${this.settings.musicVolume}%`;
        this.overlay.querySelector('#sfxVolume').parentElement.querySelector('.slider-value').textContent = `${this.settings.sfxVolume}%`;
        
        // Update music toggle
        this.overlay.querySelector('#musicToggle').checked = this.settings.musicEnabled;
        this.overlay.querySelector('#musicToggle').parentElement.querySelector('.toggle-label').textContent = this.settings.musicEnabled ? 'ON' : 'OFF';
        
        // Update difficulty radio
        const difficultyRadio = this.overlay.querySelector(`input[name="difficulty"][value="${this.settings.difficulty}"]`);
        if (difficultyRadio) difficultyRadio.checked = true;
        
        // Update debug toggles
        const debugEl = this.overlay.querySelector('#debugOverlay');
        if (debugEl) {
            debugEl.checked = this.settings.debugOverlay;
            debugEl.parentElement.querySelector('.toggle-label').textContent = this.settings.debugOverlay ? 'ON' : 'OFF';
        }
        const devEl = this.overlay.querySelector('#devConsole');
        if (devEl) {
            devEl.checked = this.settings.devConsole;
            devEl.parentElement.querySelector('.toggle-label').textContent = this.settings.devConsole ? 'ON' : 'OFF';
        }
        
        // Update AI tuning sliders
        const agEl = this.overlay.querySelector('#aiAggression');
        if (agEl) {
            agEl.value = Math.round((this.settings.aiAggression || 1.0) * 100);
            agEl.parentElement.querySelector('.slider-value').textContent = `${agEl.value}%`;
        }
        const cdEl = this.overlay.querySelector('#aiChaseDistance');
        if (cdEl) {
            cdEl.value = this.settings.aiChaseDistance || 8;
            cdEl.parentElement.querySelector('.slider-value').textContent = `${cdEl.value} tiles`;
        }
        const smEl = this.overlay.querySelector('#aiScatterMult');
        if (smEl) {
            smEl.value = Math.round((this.settings.aiScatterMult || 1.0) * 100);
            smEl.parentElement.querySelector('.slider-value').textContent = `${smEl.value}%`;
        }
    }
    
    open() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        this.focusIndex = 0;
        
        // Focus first focusable element
        setTimeout(() => {
            this.focusableElements = Array.from(this.overlay.querySelectorAll(
                'button, input, [tabindex]:not([tabindex="-1"])'
            )).filter(el => !el.disabled && el.offsetParent !== null);
            
            if (this.focusableElements.length > 0) {
                this.focusableElements[0].focus();
            }
        }, 50);
    }
    
    close() {
        this.isOpen = false;
        this.overlay.style.display = 'none';
        this.saveSettings();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // Sync debug overlay/devConsole state to the game instance
    _syncDebugToGame() {
        const game = this._game;
        if (!game) return;
        game._debugOverlay = this.settings.debugOverlay;
        game._devConsole = this.settings.devConsole;
    }
    
    // Push AI tuning values to game instance
    _syncAITuning() {
        const game = this._game;
        if (!game || typeof game.setAITuning !== 'function') return;
        game.setAITuning({
            aggression: this.settings.aiAggression,
            chaseDistance: this.settings.aiChaseDistance,
            scatterMultiplier: this.settings.aiScatterMult,
        });
    }
    
    // Reset AI tuning sliders to defaults
    resetAIDefaults() {
        this.settings.aiAggression = 1.0;
        this.settings.aiChaseDistance = 8;
        this.settings.aiScatterMult = 1.0;
        this.saveSettings();
        this.updateUI();
        this._syncAITuning();
    }
}
