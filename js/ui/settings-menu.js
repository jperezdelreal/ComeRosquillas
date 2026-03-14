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
            cameraEffects: true,
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
                    <h2 id="settingsTitle">${t('settings.title')}</h2>
                    <button class="settings-close" aria-label="${t('settings.close')}">✕</button>
                </div>
                
                <div class="settings-content">
                    <!-- Audio Controls -->
                    <section class="settings-section">
                        <h3>${t('settings.audio')}</h3>
                        
                        <div class="setting-row">
                            <label for="masterVolume">${t('settings.master_volume')}</label>
                            <div class="slider-container">
                                <input type="range" id="masterVolume" min="0" max="100" value="${this.settings.masterVolume}" />
                                <span class="slider-value">${this.settings.masterVolume}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="musicVolume">${t('settings.music_volume')}</label>
                            <div class="slider-container">
                                <input type="range" id="musicVolume" min="0" max="100" value="${this.settings.musicVolume}" />
                                <span class="slider-value">${this.settings.musicVolume}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="sfxVolume">${t('settings.sfx_volume')}</label>
                            <div class="slider-container">
                                <input type="range" id="sfxVolume" min="0" max="100" value="${this.settings.sfxVolume}" />
                                <span class="slider-value">${this.settings.sfxVolume}%</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="musicToggle">${t('settings.music_enabled')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="musicToggle" ${this.settings.musicEnabled ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.musicEnabled ? t('settings.on') : t('settings.off')}</span>
                                <span class="key-hint">${t('settings.music_key_hint')}</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Difficulty Settings -->
                    <section class="settings-section">
                        <h3>${t('settings.difficulty')}</h3>
                        
                        <div class="setting-row">
                            <div class="difficulty-options">
                                <label class="radio-option">
                                    <input type="radio" name="difficulty" value="easy" ${this.settings.difficulty === 'easy' ? 'checked' : ''} />
                                    <span class="radio-label">
                                        <strong>${t('settings.easy')}</strong>
                                        <small>${t('settings.easy_desc')}</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="difficulty" value="normal" ${this.settings.difficulty === 'normal' ? 'checked' : ''} />
                                    <span class="radio-label">
                                        <strong>${t('settings.normal')}</strong>
                                        <small>${t('settings.normal_desc')}</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="difficulty" value="hard" ${this.settings.difficulty === 'hard' ? 'checked' : ''} />
                                    <span class="radio-label">
                                        <strong>${t('settings.hard')}</strong>
                                        <small>${t('settings.hard_desc')}</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Controls Display -->
                    <section class="settings-section">
                        <h3>${t('settings.controls')}</h3>
                        
                        <div class="controls-display">
                            <div class="control-item">
                                <span class="control-key">↑ ↓ ← →</span>
                                <span class="control-action">${t('settings.move_homer')}</span>
                            </div>
                            <div class="control-item">
                                <span class="control-key">P</span>
                                <span class="control-action">${t('settings.pause_game')}</span>
                            </div>
                            <div class="control-item">
                                <span class="control-key">M</span>
                                <span class="control-action">${t('settings.toggle_music')}</span>
                            </div>
                            <div class="control-item">
                                <span class="control-key">ENTER</span>
                                <span class="control-action">${t('settings.start_game')}</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Accessibility -->
                    <section class="settings-section">
                        <h3>${t('settings.accessibility')}</h3>
                        
                        <div class="setting-row">
                            <label for="colorblindMode">${t('settings.colorblind_mode')}</label>
                            <select id="colorblindMode" class="settings-select" aria-label="${t('settings.colorblind_mode')}">
                                <option value="none" ${typeof a11y !== 'undefined' && a11y.settings.colorblindMode === 'none' ? 'selected' : ''}>${t('settings.colorblind_none')}</option>
                                <option value="protanopia" ${typeof a11y !== 'undefined' && a11y.settings.colorblindMode === 'protanopia' ? 'selected' : ''}>${t('settings.colorblind_protanopia')}</option>
                                <option value="deuteranopia" ${typeof a11y !== 'undefined' && a11y.settings.colorblindMode === 'deuteranopia' ? 'selected' : ''}>${t('settings.colorblind_deuteranopia')}</option>
                                <option value="tritanopia" ${typeof a11y !== 'undefined' && a11y.settings.colorblindMode === 'tritanopia' ? 'selected' : ''}>${t('settings.colorblind_tritanopia')}</option>
                            </select>
                        </div>
                        
                        <div class="setting-row">
                            <label for="highContrast">${t('settings.high_contrast')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="highContrast" ${typeof a11y !== 'undefined' && a11y.settings.highContrast ? 'checked' : ''} />
                                <span class="toggle-label">${typeof a11y !== 'undefined' && a11y.settings.highContrast ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="reduceMotion">${t('settings.reduce_motion')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="reduceMotion" ${typeof a11y !== 'undefined' && a11y.settings.reduceMotion ? 'checked' : ''} />
                                <span class="toggle-label">${typeof a11y !== 'undefined' && a11y.settings.reduceMotion ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="largeText">${t('settings.large_text')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="largeText" ${typeof a11y !== 'undefined' && a11y.settings.largeText ? 'checked' : ''} />
                                <span class="toggle-label">${typeof a11y !== 'undefined' && a11y.settings.largeText ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="eventSubtitles">${t('settings.event_subtitles')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="eventSubtitles" ${typeof a11y !== 'undefined' && a11y.settings.eventSubtitles ? 'checked' : ''} />
                                <span class="toggle-label">${typeof a11y !== 'undefined' && a11y.settings.eventSubtitles ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="visualAudioIndicators">${t('settings.ghost_proximity')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="visualAudioIndicators" ${typeof a11y !== 'undefined' && a11y.settings.visualAudioIndicators ? 'checked' : ''} />
                                <span class="toggle-label">${typeof a11y !== 'undefined' && a11y.settings.visualAudioIndicators ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="screenReaderAnnouncements">${t('settings.screen_reader')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="screenReaderAnnouncements" ${typeof a11y !== 'undefined' && a11y.settings.screenReaderAnnouncements ? 'checked' : ''} />
                                <span class="toggle-label">${typeof a11y !== 'undefined' && a11y.settings.screenReaderAnnouncements ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Tutorial -->
                    <section class="settings-section">
                        <h3>${t('settings.tutorial_section')}</h3>
                        <div class="setting-row">
                            <label>${t('settings.tutorial_learn')}</label>
                            <button class="settings-button settings-tutorial-btn" style="flex: 0; padding: 8px 16px; font-size: 16px;">
                                ${t('settings.tutorial_show')}
                            </button>
                        </div>
                    </section>
                    
                    <!-- Camera Effects -->
                    <section class="settings-section">
                        <h3>${t('settings.camera_section')}</h3>
                        
                        <div class="setting-row">
                            <label for="cameraEffects">${t('settings.camera_shake')}</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="cameraEffects" ${this.settings.cameraEffects ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.cameraEffects ? t('settings.on') : t('settings.off')}</span>
                            </div>
                        </div>
                        <div class="setting-row" style="opacity: 0.7; font-size: 12px;">
                            <label>${t('settings.camera_auto_note')}</label>
                        </div>
                    </section>
                    

                    <!-- Language -->
                    <section class="settings-section">
                        <h3>${t('settings.language')}</h3>
                        <div class="setting-row">
                            <label for="languageSelect">${t('settings.language_label')}</label>
                            <select id="languageSelect" class="settings-select" aria-label="${t('settings.language_label')}">
                                ${this._buildLanguageOptions()}
                            </select>
                        </div>
                    </section>
                    <!-- Ghost AI Debug -->
                    <section class="settings-section">
                        <h3>🔍 Ghost AI Debug</h3>
                        
                        <div class="setting-row">
                            <label for="debugOverlay">Show Ghost AI Debug Info</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="debugOverlay" ${this.settings.debugOverlay ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.debugOverlay ? t('settings.on') : t('settings.off')}</span>
                                <span class="key-hint">(D key)</span>
                            </div>
                        </div>
                        
                        <div class="setting-row">
                            <label for="devConsole">Dev Console</label>
                            <div class="toggle-container">
                                <input type="checkbox" id="devConsole" ${this.settings.devConsole ? 'checked' : ''} />
                                <span class="toggle-label">${this.settings.devConsole ? t('settings.on') : t('settings.off')}</span>
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
                e.target.parentElement.querySelector('.toggle-label').textContent = e.target.checked ? t('settings.on') : t('settings.off');
                this.saveSettings();
                this._syncDebugToGame();
            });
        }
        
        // Camera effects toggle
        const cameraToggle = this.overlay.querySelector('#cameraEffects');
        if (cameraToggle) {
            cameraToggle.addEventListener('change', (e) => {
                this.settings.cameraEffects = e.target.checked;
                e.target.parentElement.querySelector('.toggle-label').textContent = e.target.checked ? t('settings.on') : t('settings.off');
                this.saveSettings();
                this._syncCameraToGame();
            });
        }
        
        const langSelect = this.overlay.querySelector('#languageSelect');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                if (typeof I18n !== 'undefined') {
                    I18n.setLanguage(e.target.value);
                    this._rebuildOverlay();
                }
            });
        }
        
        // Dev console toggle
        const devConsoleToggle = this.overlay.querySelector('#devConsole');
        if (devConsoleToggle) {
            devConsoleToggle.addEventListener('change', (e) => {
                this.settings.devConsole = e.target.checked;
                e.target.parentElement.querySelector('.toggle-label').textContent = e.target.checked ? t('settings.on') : t('settings.off');
                this.saveSettings();
                this._syncDebugToGame();
            });
        }
        
        // Accessibility controls
        this._setupA11yHandlers();
        
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
        toggleLabel.textContent = enabled ? t('settings.on') : t('settings.off');
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
            cameraEffects: true,
        };
        
        this.saveSettings();
        this.updateUI();
        this.applySettings();
        this._syncDebugToGame();
        this._syncAITuning();
        this._syncCameraToGame();
        
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
        this.overlay.querySelector('#musicToggle').parentElement.querySelector('.toggle-label').textContent = this.settings.musicEnabled ? t('settings.on') : t('settings.off');
        
        // Update difficulty radio
        const difficultyRadio = this.overlay.querySelector(`input[name="difficulty"][value="${this.settings.difficulty}"]`);
        if (difficultyRadio) difficultyRadio.checked = true;
        
        // Update debug toggles
        const debugEl = this.overlay.querySelector('#debugOverlay');
        if (debugEl) {
            debugEl.checked = this.settings.debugOverlay;
            debugEl.parentElement.querySelector('.toggle-label').textContent = this.settings.debugOverlay ? t('settings.on') : t('settings.off');
        }
        const devEl = this.overlay.querySelector('#devConsole');
        if (devEl) {
            devEl.checked = this.settings.devConsole;
            devEl.parentElement.querySelector('.toggle-label').textContent = this.settings.devConsole ? t('settings.on') : t('settings.off');
        }
        
        // Update camera effects toggle
        const camEl = this.overlay.querySelector('#cameraEffects');
        if (camEl) {
            camEl.checked = this.settings.cameraEffects;
            camEl.parentElement.querySelector('.toggle-label').textContent = this.settings.cameraEffects ? t('settings.on') : t('settings.off');
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
        
        const langEl = this.overlay.querySelector('#languageSelect');
        if (langEl && typeof I18n !== 'undefined') langEl.value = I18n.getLanguage();
        
        this._updateA11yUI();
    }
    
    open() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        this.focusIndex = 0;
        
        // Auto-pause the game when settings opens
        if (this._game && this._game.state === ST_PLAYING) {
            this._wasPlayingBeforeOpen = true;
            this._game.state = ST_PAUSED;
            this._game.sound.stopMusic();
        } else {
            this._wasPlayingBeforeOpen = false;
        }
        
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
        
        // Resume the game if it was playing before settings opened
        if (this._game && this._wasPlayingBeforeOpen && this._game.state === ST_PAUSED) {
            this._game.state = ST_PLAYING;
            this._game.sound.startMusic();
            this._game.hideMessage();
        }
        this._wasPlayingBeforeOpen = false;
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
    
    // Push camera effects preference to game instance
    _syncCameraToGame() {
        const game = this._game;
        if (!game) return;
        game._cameraEffectsEnabled = this.settings.cameraEffects;
    }
    
    _buildLanguageOptions() {
        if (typeof I18n === 'undefined') return '<option value="en">English</option>';
        const langs = I18n.getSupportedLanguages();
        const current = I18n.getLanguage();
        return Object.entries(langs).map(([code, info]) =>
            `<option value="${code}" ${code === current ? 'selected' : ''}>${info.flag} ${info.nativeName}</option>`
        ).join('');
    }
    
    _rebuildOverlay() {
        const wasOpen = this.isOpen;
        this.overlay.remove();
        this.createOverlay();
        this.setupEventHandlers();
        this.updateUI();
        if (wasOpen) this.open();
    }
    
    // Accessibility event handlers
    _setupA11yHandlers() {
        if (typeof a11y === 'undefined') return;
        
        const a11yToggleIds = [
            'highContrast', 'reduceMotion', 'largeText',
            'eventSubtitles', 'visualAudioIndicators', 'screenReaderAnnouncements'
        ];
        
        a11yToggleIds.forEach(id => {
            const el = this.overlay.querySelector(`#${id}`);
            if (el) {
                el.addEventListener('change', (e) => {
                    a11y.settings[id] = e.target.checked;
                    e.target.parentElement.querySelector('.toggle-label').textContent = e.target.checked ? t('settings.on') : t('settings.off');
                    a11y.saveSettings();
                    if (id === 'largeText') a11y.applyLargeText();
                });
            }
        });
        
        const cbSelect = this.overlay.querySelector('#colorblindMode');
        if (cbSelect) {
            cbSelect.addEventListener('change', (e) => {
                a11y.settings.colorblindMode = e.target.value;
                a11y.saveSettings();
            });
        }
    }
    
    // Update accessibility controls in the UI
    _updateA11yUI() {
        if (typeof a11y === 'undefined') return;
        
        const cbSelect = this.overlay.querySelector('#colorblindMode');
        if (cbSelect) cbSelect.value = a11y.settings.colorblindMode;
        
        const a11yToggleIds = [
            'highContrast', 'reduceMotion', 'largeText',
            'eventSubtitles', 'visualAudioIndicators', 'screenReaderAnnouncements'
        ];
        
        a11yToggleIds.forEach(id => {
            const el = this.overlay.querySelector(`#${id}`);
            if (el) {
                el.checked = a11y.settings[id];
                const label = el.parentElement.querySelector('.toggle-label');
                if (label) label.textContent = a11y.settings[id] ? t('settings.on') : t('settings.off');
            }
        });
    }
}
