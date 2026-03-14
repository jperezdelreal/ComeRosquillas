// ===========================
// Come Rosquillas - Main Game Logic (Orchestrator)
// ===========================
// Thin orchestrator — delegates to 5 extracted modules.
// ===========================

'use strict';

    class Game {
        constructor() {
            window._game = this;
            this.canvas = document.getElementById('gameCanvas');
            this.canvas.width = CANVAS_W;
            this.canvas.height = CANVAS_H;
            this.ctx = this.canvas.getContext('2d');
            this.sound = new SoundManager();
            this.highScores = new HighScoreManager();

            this.scoreEl = document.getElementById('scoreDisplay');
            this.levelEl = document.getElementById('levelDisplay');
            this.highScoreEl = document.getElementById('highScoreDisplay');
            this.livesIconsEl = document.getElementById('livesIcons');
            this.bestComboEl = document.getElementById('bestComboDisplay');
            this.bestComboValueEl = document.getElementById('bestComboValue');
            this.msgEl = document.getElementById('message');

            this.keys = {};
            this.state = ST_START;
            this.score = 0;
            this.lives = 3;
            this.level = 1;
            this.ghostsEaten = 0;
            this.extraLifeGiven = false;
            this.animFrame = 0;
            this.stateTimer = 0;
            this.floatingTexts = [];
            this.particles = [];
            this.initialsEntry = { active: false, name: 'AAA', pos: 0 };

            // Combo multiplier state
            this.comboDisplayTimer = 0;
            this.bestCombo = 0;
            this._allTimeBestCombo = this._loadBestCombo();
            this.screenShakeTimer = 0;
            this.screenShakeIntensity = 0;
            this._shakeMaxDuration = 0;

            // Camera juice state
            this._cameraEffectsEnabled = true;
            this._cameraAutoDisabled = false;
            this._cameraFpsCheckFrame = 0;
            this._cameraZoom = 1.0;
            this._cameraZoomTarget = 1.0;
            this._cameraZoomTimer = 0;
            this._cameraZoomDuration = 0;
            this._cameraZoomStart = 1.0;
            this._cameraOffsetX = 0;
            this._cameraOffsetY = 0;

            // Per-game stats tracking
            this._gameDonutsEaten = 0;
            this._gameGhostsEaten = 0;
            this._gameStartTime = 0;
            this._gameItemsCollected = 0;

            // Achievement tracking state
            this._levelHitsTaken = 0;
            this._levelPlayStartTime = 0;
            this._levelStartTime = 0;
            this._levelGhostsEatenCount = 0;
            this._levelGhostsEaten = 0;
            this._levelDirectionChanges = 0;
            this._noPowerPelletFrames = 0;
            this._scoreAtLastDeath = 0;
            this._lastCollectedPowerUpId = null;
            this._consecutivePerfectLevels = 0;
            this._themesVisitedSet = new Set();
            this._powerUpTypesSet = new Set();
            this._noPowerTimer = 0;
            this._gameDuffBeersUsed = 0;

            // Power-up system state
            this._specialItem = null;
            this._activePowerUps = [];
            this._burnsTokens = 0;
            this._powerUpComboActive = false;

            // Boss hazard state
            this._rakeSlowTimer = 0;

            // BFS pathfinding cache: keyed on "startCol,startRow,targetCol,targetRow"
            this._bfsCache = new Map();
            this._bfsCacheFrame = 0;

            // Particle object pool (pre-allocate to avoid GC churn)
            this._particlePool = [];
            for (let i = 0; i < PERF_CONFIG.particlePoolSize; i++) {
                this._particlePool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '', size: 0, active: false });
            }

            // Ambient theme particles (separate from gameplay particles)
            this._ambientParticles = [];

            // FPS counter (ring buffer)
            this._fpsBuffer = new Float64Array(PERF_CONFIG.fpsBufferSize);
            this._fpsIndex = 0;
            this._fpsDisplay = 0;
            this._lastFrameTime = performance.now();
            this._frameSkipped = false;

            // Ghost debug overlay state
            this._debugOverlay = false;
            this._devConsole = false;
            this._collisionChecks = 0;
            this._ghostBreadcrumbs = [[], [], [], []];
            this._aiTuning = typeof loadAITuning === 'function' ? loadAITuning() : { ...AI_TUNING_DEFAULTS };

            // Level transition wipe
            this._wipeTimer = 0;
            this._wipeDirection = 1;

            // Boss ghost system state
            this._bossGhost = null;
            this._bossIntroTimer = 0;
            this._bossConfig = null;
            this._fakePellets = [];
            this._rakeTraps = [];
            this._laserBeams = [];
            this._nelsonLaughTimer = 0;

            // Pre-render some decorations
            this.cloudOffset = 0;

            this.currentLayout = getMazeLayout(this.level);
            this.maze = this.currentLayout.template.map(row => [...row]);

            this.setupInput();
            
            // Initialize settings menu
            if (typeof SettingsMenu !== 'undefined') {
                this.settingsMenu = new SettingsMenu(this.sound);
                this.settingsMenu._game = this;
                // Sync debug state from saved settings
                this._debugOverlay = this.settingsMenu.settings.debugOverlay || false;
                this._devConsole = this.settingsMenu.settings.devConsole || false;
                if (this.settingsMenu.settings.aiAggression !== undefined ||
                    this.settingsMenu.settings.aiChaseDistance !== undefined ||
                    this.settingsMenu.settings.aiScatterMult !== undefined) {
                    this._aiTuning = {
                        aggression: this.settingsMenu.settings.aiAggression || 1.0,
                        chaseDistance: this.settingsMenu.settings.aiChaseDistance || 8,
                        scatterMultiplier: this.settingsMenu.settings.aiScatterMult || 1.0,
                    };
                }
                // Sync camera effects from saved settings
                if (this.settingsMenu.settings.cameraEffects !== undefined) {
                    this._cameraEffectsEnabled = this.settingsMenu.settings.cameraEffects;
                }
                
                // Apply accessibility settings on startup
                if (typeof a11y !== 'undefined') {
                    a11y.applyLargeText();
                }
                
                // Hook up settings button
                const settingsBtn = document.getElementById('settingsBtn');
                if (settingsBtn) {
                    settingsBtn.addEventListener('click', () => {
                        this.settingsMenu.toggle();
                    });
                }
                
                // Allow 'S' key to open settings from start screen or pause menu
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'KeyS' && (this.state === ST_START || this.state === ST_PAUSED)) {
                        e.preventDefault();
                        this.settingsMenu.toggle();
                    }
                });
            }
            
            // Allow 'L' key to open leaderboard from start/pause/gameover screens
            document.addEventListener('keydown', (e) => {
                if (e.code === 'KeyL' && (this.state === ST_START || this.state === ST_PAUSED || this.state === ST_GAME_OVER)) {
                    e.preventDefault();
                    if (this.statsDashboard) this.statsDashboard.toggle('leaderboard');
                }
            });
            
            // Initialize touch input system
            if (typeof TouchInput !== 'undefined') {
                this.touchInput = new TouchInput(this);
            }
            
            // Initialize tutorial system
            if (typeof Tutorial !== 'undefined') {
                this.tutorial = new Tutorial(this);
            }
            
            // Initialize stats dashboard
            if (typeof StatsDashboard !== 'undefined') {
                this.statsDashboard = new StatsDashboard(this.highScores);
            }
            
            // Initialize share menu
            if (typeof ShareMenu !== 'undefined') {
                this.shareMenu = new ShareMenu(this);
            }
            
            // Initialize daily challenge system
            if (typeof DailyChallenge !== 'undefined') {
                this.dailyChallenge = new DailyChallenge(this);
            }
            this._dailyChallenge = null;
            this._dailyTimeUp = false;

            // Initialize achievement system
            if (typeof AchievementManager !== 'undefined') {
                this.achievements = new AchievementManager(this.highScores, this.sound);
            }
            
            // Allow 'H' key to open share menu from game-over/start screens
            document.addEventListener('keydown', (e) => {
                if (e.code === 'KeyH' && (this.state === ST_GAME_OVER || this.state === ST_START)) {
                    e.preventDefault();
                    if (this.shareMenu) this.shareMenu.toggle();
                }
            });
            
            // Allow 'D' key to open daily challenge from start/pause/gameover screens
            document.addEventListener('keydown', (e) => {
                if (e.code === 'KeyD' && (this.state === ST_START || this.state === ST_PAUSED || this.state === ST_GAME_OVER)) {
                    e.preventDefault();
                    if (this.dailyChallenge) this.dailyChallenge.toggle();
                }
            });

            // Allow 'A' key to open achievements from start/pause/gameover screens
            document.addEventListener('keydown', (e) => {
                if (e.code === 'KeyA' && (this.state === ST_START || this.state === ST_PAUSED || this.state === ST_GAME_OVER)) {
                    e.preventDefault();
                    if (this.statsDashboard) this.statsDashboard.toggle('achievements');
                }
            });
            
            this.showStartScreen();
            this.updateHUD();

            // Show tutorial for first-time players (after start screen renders)
            if (this.tutorial && this.tutorial.shouldShow()) {
                setTimeout(() => this.tutorial.start(), 300);
            }

            this.loop();
        }

        // ---- INPUT ----
        setupInput() {
            document.addEventListener('keydown', (e) => {
                this.keys[e.code] = true;
                this.sound.resume();

                if (this.state === ST_START && (e.code === 'Enter' || e.code === 'Space')) {
                    e.preventDefault();
                    this.startNewGame();
                } else if (this.state === ST_HIGH_SCORE_ENTRY) {
                    e.preventDefault();
                    this.handleHighScoreInput(e.code);
                } else if (this.state === ST_GAME_OVER && (e.code === 'Enter' || e.code === 'Space')) {
                    e.preventDefault();
                    // Clean up daily challenge state on return to start
                    if (this.dailyChallenge) this.dailyChallenge.endChallenge();
                    this._dailyChallenge = null;
                    this._dailyTimeUp = false;
                    this.state = ST_START;
                    this.level = 1;
                    this.currentLayout = getMazeLayout(this.level);
                    this.maze = this.currentLayout.template.map(row => [...row]);
                    this.showStartScreen();
                } else if (this.state === ST_PLAYING && (e.code === 'KeyP' || e.code === 'Space')) {
                    e.preventDefault();
                    this.state = ST_PAUSED;
                    this.sound.stopMusic();
                    this.showMessage('PAUSA', '¡Ay, caramba!<br>Press P or SPACE to continue');
                    if (typeof a11y !== 'undefined') a11y.onPause();
                } else if (this.state === ST_PAUSED && (e.code === 'KeyP' || e.code === 'Space')) {
                    e.preventDefault();
                    this.state = ST_PLAYING;
                    this.sound.startMusic();
                    this.hideMessage();
                    if (typeof a11y !== 'undefined') a11y.onResume();
                } else if (this.state === ST_CUTSCENE) {
                    // Skip cutscene on any key press
                    this.skipCutscene();
                } else if (e.code === 'KeyM') {
                    const muted = this.sound.toggleMute();
                    if (muted !== undefined) {
                        this.addFloatingText(CANVAS_W / 2, 40, muted ? '🔇 MUTED' : '🔊 MUSIC ON', '#ffd800');
                    }
                } else if (e.code === 'KeyD') {
                    this._debugOverlay = !this._debugOverlay;
                    this.addFloatingText(CANVAS_W / 2, 40, this._debugOverlay ? '🔍 DEBUG ON' : '🔍 DEBUG OFF', '#0f0');
                    if (this.settingsMenu) {
                        this.settingsMenu.settings.debugOverlay = this._debugOverlay;
                        this.settingsMenu.saveSettings();
                    }
                } else if (e.code === 'Backquote') {
                    this._devConsole = !this._devConsole;
                    if (this.settingsMenu) {
                        this.settingsMenu.settings.devConsole = this._devConsole;
                        this.settingsMenu.saveSettings();
                    }
                }

                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                    e.preventDefault();
                }
            });
            document.addEventListener('keyup', (e) => {
                this.keys[e.code] = false;
            });
        }
        
        handleHighScoreInput(code) {
            const chars = this.initialsEntry.name.split('');
            
            if (code === 'ArrowUp') {
                // Cycle character forward (A-Z, 0-9, space)
                const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
                const currentIdx = validChars.indexOf(chars[this.initialsEntry.pos]);
                const nextIdx = (currentIdx + 1) % validChars.length;
                chars[this.initialsEntry.pos] = validChars[nextIdx];
                this.initialsEntry.name = chars.join('');
                this.showHighScoreEntry();
            } else if (code === 'ArrowDown') {
                // Cycle character backward
                const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
                const currentIdx = validChars.indexOf(chars[this.initialsEntry.pos]);
                const nextIdx = (currentIdx - 1 + validChars.length) % validChars.length;
                chars[this.initialsEntry.pos] = validChars[nextIdx];
                this.initialsEntry.name = chars.join('');
                this.showHighScoreEntry();
            } else if (code === 'ArrowLeft') {
                this.initialsEntry.pos = Math.max(0, this.initialsEntry.pos - 1);
                this.showHighScoreEntry();
            } else if (code === 'ArrowRight') {
                this.initialsEntry.pos = Math.min(2, this.initialsEntry.pos + 1);
                this.showHighScoreEntry();
            } else if (code === 'Enter' || code === 'Space') {
                // Save the high score
                const gameStats = this._buildGameStats();
                const rank = this.highScores.addScore(this.initialsEntry.name, this.score, this.level, this.bestCombo, gameStats);
                this.highScores.recordGameEnd(gameStats);
                // Submit daily challenge score with player name
                if (this._dailyChallenge && this.dailyChallenge) {
                    this.dailyChallenge.submitScore(
                        this.initialsEntry.name, this.score, this.level,
                        this._gameGhostsEaten, this._gameDonutsEaten
                    );
                    this.dailyChallenge.endChallenge();
                }
                this.state = ST_GAME_OVER;
                this.sound.play('gameOver');
                if (typeof a11y !== 'undefined') a11y.onGameOver(this.score);
                const quote = GAME_OVER_QUOTES[Math.floor(Math.random() * GAME_OVER_QUOTES.length)];
                this.showMessage("D'OH!", `Game Over!<br>High Score #${rank}!<br>Score: ${this.score}<br><br>"${quote}"<br><br>${this._shareButtonHtml()}Press ENTER to try again`);
                if (this.achievements) this.achievements.notify('game_over', this);
            }
        }

        // ---- SCREENS ----
        showStartScreen() {
            const scores = this.highScores.getScores();
            const allTimeBest = this._allTimeBestCombo;
            const rank = this.highScores.getRank();
            let scoreTable = '';
            if (scores.length > 0) {
                scoreTable = '<br><div style="font-size: 16px; color: #ffd800; margin-top: 8px;">HIGH SCORES</div><div style="font-size: 14px; line-height: 1.6; color: #fff; margin-top: 4px;">';
                const topScores = scores.slice(0, 5);
                topScores.forEach((s, i) => {
                    const comboStr = s.combo > 1 ? ` | 🔥${s.combo}x` : '';
                    const lvlStr = (typeof ENDLESS_MODE !== 'undefined' && s.level >= ENDLESS_MODE.startLevel) ? `∞${s.level}` : `Lvl ${s.level}`;
                    scoreTable += `${i + 1}. ${s.name} - ${s.score} (${lvlStr}${comboStr})<br>`;
                });
                scoreTable += '</div>';
                if (allTimeBest > 1) {
                    scoreTable += `<div style="font-size: 13px; color: #ff69b4; margin-top: 4px;">Best Combo Ever: 🔥 ${allTimeBest}x</div>`;
                }
            }
            
            this.msgEl.innerHTML = `
                <div class="title-large">&#127849; Come Rosquillas!</div>
                <div class="catchphrase">"Mmm... donuts"</div>
                <div class="subtitle">
                    Homer's Donut Quest through Springfield<br><br>
                    &#127850; Eat all the donuts<br>
                    &#127866; Grab a Duff to chase the bad guys<br>
                    &#128123; Beware of Sr. Burns, Bob Patiño, Nelson & Snake!<br><br>
                    P = Pause &nbsp; M = Mute music &nbsp; L = Leaderboard &nbsp; A = Achievements &nbsp; H = Share &nbsp; D = Daily<br><br>
                    ${this._challengeBannerHtml()}${this._dailyChallengeBannerHtml()}Press ENTER or SPACE to start
                    ${scoreTable}
                </div>`;
            this.msgEl.style.display = 'block';
        }

        showMessage(title, subtitle) {
            this.msgEl.innerHTML = `<div class="title-large">${title}</div>${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}`;
            this.msgEl.style.display = 'block';
        }
        
        showHighScoreEntry() {
            const chars = this.initialsEntry.name.split('');
            const highlighted = chars.map((c, i) => 
                i === this.initialsEntry.pos 
                    ? `<span style="color: #ff69b4; text-decoration: underline; font-size: 42px;">${c}</span>` 
                    : `<span style="color: #ffd800; font-size: 36px;">${c}</span>`
            ).join(' ');
            
            this.msgEl.innerHTML = `
                <div class="title-large" style="color: #ff69b4; animation: pulse 1s infinite;">
                    &#11088; NEW HIGH SCORE! &#11088;
                </div>
                <div class="subtitle" style="margin-top: 20px;">
                    Score: ${this.score}<br>
                    Level: ${this.isEndlessMode() ? `∞ ${this.level}` : this.level}<br>
                    ${this.bestCombo > 1 ? `Best Combo: 🔥 ${this.bestCombo}x<br>` : ''}
                    <br>
                    Enter your initials:<br><br>
                    <div style="font-family: 'Permanent Marker', monospace; font-size: 36px; letter-spacing: 10px; margin: 16px 0;">
                        ${highlighted}
                    </div>
                    <br>
                    Use &#8593;&#8595; to change letter<br>
                    &#8592;&#8594; to move position<br>
                    ENTER to confirm
                </div>`;
            this.msgEl.style.display = 'block';
            
            // Add pulse animation if not already added
            if (!document.getElementById('pulseStyle')) {
                const style = document.createElement('style');
                style.id = 'pulseStyle';
                style.textContent = `
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        hideMessage() {
            this.msgEl.style.display = 'none';
        }

        // ---- GAME INIT ----
        startNewGame() {
            this.score = 0;
            this.lives = 3;
            this.level = 1;
            this.extraLifeGiven = false;
            this.floatingTexts = [];
            // Return all active particles to pool
            for (const p of this.particles) p.active = false;
            this.particles = [];
            this._ambientParticles = [];
            this.bestCombo = 0;
            this.comboDisplayTimer = 0;
            this._gameDonutsEaten = 0;
            this._gameGhostsEaten = 0;
            this._gameStartTime = Date.now();
            this._gameItemsCollected = 0;
            this._burnsTokens = 0;
            this._activePowerUps = [];
            this._powerUpComboActive = false;
            this._dailyTimeUp = false;

            // Reset per-game achievement tracking
            this._consecutivePerfectLevels = 0;
            this._themesVisitedSet = new Set();
            this._powerUpTypesSet = new Set();
            this._gameDuffBeersUsed = 0;
            this._levelHitsTaken = 0;
            this._levelPlayStartTime = 0;
            this._levelGhostsEatenCount = 0;
            this._levelDirectionChanges = 0;
            this._noPowerPelletFrames = 0;
            this._scoreAtLastDeath = 0;
            this._lastCollectedPowerUpId = null;
            this.initLevel();
            
            // Apply daily challenge modifiers after level init
            if (this._dailyChallenge && typeof DailyChallenge !== 'undefined') {
                DailyChallenge.applyModifiers(this, this._dailyChallenge);
            }
            
            this.state = ST_READY;
            this.stateTimer = 150;
            this.sound.play('start');
            this.sound.setLevelTempo(this.level);
            
            // Camera: zoom in from 150% on level start
            if (typeof CAMERA_CONFIG !== 'undefined') {
                this._cameraZoom = CAMERA_CONFIG.zoom.levelStartScale;
                this.triggerZoom(1.0, CAMERA_CONFIG.zoom.levelStartDuration);
            }
            
            const challengeBanner = this._dailyChallenge
                ? DailyChallenge.getBannerHtml(this._dailyChallenge)
                : '';
            this.showMessage('&#127849; READY!', challengeBanner + this._levelTitle());
            this.updateHUD();
            if (typeof a11y !== 'undefined') a11y.onGameStart();
        }

        // ---- MAZE HELPERS ----
        isWalkable(col, row, isGhost) {
            if (col < 0 || col >= COLS) return row === 14;
            if (row < 0 || row >= ROWS) return false;
            const cell = this.maze[row][col];
            if (cell === WALL) return false;
            if (cell === GHOST_DOOR || cell === GHOST_HOUSE) return !!isGhost;
            return true;
        }

        tileAt(px, py) {
            return { col: Math.floor(px / TILE), row: Math.floor(py / TILE) };
        }

        centerOfTile(col, row) {
            return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
        }

        // ---- FLOATING TEXT & PARTICLES ----
        addFloatingText(x, y, text, color) {
            this.floatingTexts.push({ x, y, text, color, life: 60, startY: y });
        }

        addParticles(x, y, color, count) {
            if (typeof a11y !== 'undefined' && a11y.shouldReduceMotion()) return;
            for (let i = 0; i < count; i++) {
                // Find inactive particle from pool
                let p = null;
                for (let j = 0; j < this._particlePool.length; j++) {
                    if (!this._particlePool[j].active) {
                        p = this._particlePool[j];
                        break;
                    }
                }
                if (!p) break; // pool exhausted
                p.x = x;
                p.y = y;
                p.vx = (Math.random() - 0.5) * 3;
                p.vy = (Math.random() - 0.5) * 3;
                p.life = 30 + Math.random() * 20;
                p.color = color;
                p.size = 1 + Math.random() * 2;
                p.active = true;
                this.particles.push(p);
            }
        }

        _updateAmbientParticles() {
            const pcfg = this.currentLayout.particles;
            if (!pcfg) return;

            // Cap ambient particles for performance
            const maxAmbient = 30;

            // Spawn new ambient particles
            if (this._ambientParticles.length < maxAmbient && Math.random() < pcfg.spawnRate) {
                const color = pcfg.colors[Math.floor(Math.random() * pcfg.colors.length)];
                const [minSize, maxSize] = pcfg.sizeRange;
                const [minSpd, maxSpd] = pcfg.speedRange;
                const [minLife, maxLife] = pcfg.lifeRange;
                const size = minSize + Math.random() * (maxSize - minSize);
                const speed = minSpd + Math.random() * (maxSpd - minSpd);
                const life = minLife + Math.random() * (maxLife - minLife);

                const ap = {
                    x: Math.random() * CANVAS_W,
                    y: pcfg.style === 'rise' ? CANVAS_H + 5 : Math.random() * CANVAS_H,
                    vx: (Math.random() - 0.5) * speed,
                    vy: pcfg.style === 'rise' ? -speed : (Math.random() - 0.5) * speed * 0.5,
                    life,
                    maxLife: life,
                    color,
                    size,
                    style: pcfg.style
                };
                this._ambientParticles.push(ap);
            }

            // Update existing ambient particles
            this._ambientParticles = this._ambientParticles.filter(ap => {
                ap.life--;
                ap.x += ap.vx;
                ap.y += ap.vy;

                if (ap.style === 'float') {
                    ap.x += Math.sin(ap.life * 0.05) * 0.15;
                } else if (ap.style === 'sparkle') {
                    ap.size = ap.size * (0.85 + Math.random() * 0.3);
                }

                return ap.life > 0 && ap.x > -10 && ap.x < CANVAS_W + 10 && ap.y > -10;
            });
        }

        _drawAmbientParticles(ctx) {
            for (const ap of this._ambientParticles) {
                const alpha = Math.min(1, ap.life / ap.maxLife) * 0.45;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = ap.color;

                if (ap.style === 'sparkle') {
                    // Diamond sparkle shape
                    const s = ap.size;
                    ctx.beginPath();
                    ctx.moveTo(ap.x, ap.y - s);
                    ctx.lineTo(ap.x + s * 0.6, ap.y);
                    ctx.lineTo(ap.x, ap.y + s);
                    ctx.lineTo(ap.x - s * 0.6, ap.y);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Soft circle for float and rise
                    ctx.beginPath();
                    ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        }

        // ---- CAMERA JUICE ----
        _isCameraEnabled() {
            return typeof CAMERA_CONFIG !== 'undefined' &&
                   this._cameraEffectsEnabled &&
                   !this._cameraAutoDisabled;
        }

        triggerShake(preset) {
            if (!this._isCameraEnabled()) return;
            if (typeof a11y !== 'undefined' && a11y.shouldReduceMotion()) return;
            const cfg = CAMERA_CONFIG.shake[preset];
            if (!cfg) return;
            this.screenShakeTimer = cfg.duration;
            this.screenShakeIntensity = cfg.intensity;
            this._shakeMaxDuration = cfg.duration;
        }
        triggerZoom(targetScale, duration) {
            if (!this._isCameraEnabled()) return;
            this._cameraZoomStart = this._cameraZoom;
            this._cameraZoomTarget = targetScale;
            this._cameraZoomDuration = duration;
            this._cameraZoomTimer = duration;
        }

        _updateCamera() {
            if (typeof CAMERA_CONFIG === 'undefined') return;
            if (this._cameraEffectsEnabled && !this._cameraAutoDisabled) {
                this._cameraFpsCheckFrame++;
                if (this._cameraFpsCheckFrame >= CAMERA_CONFIG.fpsCheckInterval) {
                    this._cameraFpsCheckFrame = 0;
                    if (this._fpsDisplay > 0 && this._fpsDisplay < CAMERA_CONFIG.fpsThreshold) {
                        this._cameraAutoDisabled = true;
                        this._cameraZoom = 1.0;
                        this._cameraOffsetX = 0;
                        this._cameraOffsetY = 0;
                    }
                }
            }
            if (!this._isCameraEnabled()) return;
            if (this._cameraZoomTimer > 0) {
                this._cameraZoomTimer--;
                const progress = 1 - (this._cameraZoomTimer / this._cameraZoomDuration);
                const ease = 1 - Math.pow(1 - progress, 3);
                this._cameraZoom = this._cameraZoomStart + (this._cameraZoomTarget - this._cameraZoomStart) * ease;
            } else if (Math.abs(this._cameraZoom - 1.0) > 0.001) {
                this._cameraZoom += (1.0 - this._cameraZoom) * 0.1;
            } else {
                this._cameraZoom = 1.0;
            }
            if (this.homer && (this.state === ST_PLAYING || this.state === ST_READY)) {
                const cfg = CAMERA_CONFIG.follow;
                const centerX = CANVAS_W / 2;
                const centerY = CANVAS_H / 2;
                const homerCX = this.homer.x + TILE / 2;
                const homerCY = this.homer.y + TILE / 2;
                const lookX = DX[this.homer.dir] * TILE * cfg.lookahead;
                const lookY = DY[this.homer.dir] * TILE * cfg.lookahead;
                let targetX = (centerX - homerCX - lookX) * (1 - cfg.viewportRatio);
                let targetY = (centerY - homerCY - lookY) * (1 - cfg.viewportRatio);
                const maxOff = cfg.edgePadding * TILE;
                targetX = Math.max(-maxOff, Math.min(maxOff, targetX));
                targetY = Math.max(-maxOff, Math.min(maxOff, targetY));
                this._cameraOffsetX += (targetX - this._cameraOffsetX) * cfg.lerpSpeed;
                this._cameraOffsetY += (targetY - this._cameraOffsetY) * cfg.lerpSpeed;
            }
        }

        // ---- UPDATE ----
        update() {
            this.animFrame++;
            this.cloudOffset += 0.3;

            // Update floating texts
            this.floatingTexts = this.floatingTexts.filter(t => {
                t.life--;
                t.y -= 0.8;
                return t.life > 0;
            });

            // Update particles (return dead ones to pool)
            const aliveParticles = [];
            for (const p of this.particles) {
                p.life--;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                if (p.life > 0) {
                    aliveParticles.push(p);
                } else {
                    p.active = false;
                }
            }
            this.particles = aliveParticles;

            // Spawn and update ambient theme particles
            this._updateAmbientParticles();
            if (this.comboDisplayTimer > 0) this.comboDisplayTimer--;

            // Update screen shake
            if (this.screenShakeTimer > 0) this.screenShakeTimer--;

            // Update camera juice (zoom, follow, FPS auto-disable)
            this._updateCamera();

            if (this.state === ST_READY) {
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = ST_PLAYING;
                    this._levelPlayStartTime = Date.now();
                    this.sound.startMusic();
                    this.hideMessage();
                }
                return;
            }

            if (this.state === ST_DYING) {
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.lives--;
                    this.updateHUD();
                    if (this.lives <= 0) {
                        // Submit daily challenge score if active
                        if (this._dailyChallenge && this.dailyChallenge) {
                            this._submitDailyScore();
                        }
                        // Check if score qualifies for high score table
                        if (this.highScores.isHighScore(this.score)) {
                            this.state = ST_HIGH_SCORE_ENTRY;
                            this.initialsEntry = { active: true, name: 'AAA', pos: 0 };
                            this.showHighScoreEntry();
                        } else {
                            this.highScores.recordGameEnd(this._buildGameStats());
                            if (this.achievements) {
                                this.achievements.notify('game_over', this);
                            }
                            this.state = ST_GAME_OVER;
                            this.sound.play('gameOver');
                            if (typeof a11y !== 'undefined') a11y.onGameOver(this.score);
                            const quote = GAME_OVER_QUOTES[Math.floor(Math.random() * GAME_OVER_QUOTES.length)];
                            this.showMessage("D'OH!", `Game Over!<br>Score: ${this.score}<br><br>"${quote}"<br><br>${this._shareButtonHtml()}Press ENTER to try again`);
                        }
                    } else {
                        this.initEntities();
                        this.state = ST_READY;
                        this.stateTimer = 120;
                        const quote = HOMER_DEATH_QUOTES[Math.floor(Math.random() * HOMER_DEATH_QUOTES.length)];
                        this.showMessage(quote, `Lives: ${this.lives}`);
                    }
                }
                return;
            }

            if (this.state === ST_LEVEL_DONE) {
                this.stateTimer--;
                // Trigger wipe effect as level ends
                if (this.stateTimer === PERF_CONFIG.levelTransitionWipeDuration) {
                    this._wipeTimer = PERF_CONFIG.levelTransitionWipeDuration;
                }
                if (this._wipeTimer > 0) this._wipeTimer--;
                if (this.stateTimer <= 0) {
                    // Check if this level should trigger a cutscene
                    const cutsceneIndex = CUTSCENE_LEVELS.indexOf(this.level);
                    if (cutsceneIndex !== -1) {
                        this.startCutscene(cutsceneIndex + 1);
                    } else {
                        this.level++;
                        this.initLevel();
                        this.sound.setLevelTempo(this.level);
                        // Camera: zoom in on new level
                        if (typeof CAMERA_CONFIG !== 'undefined') {
                            this._cameraZoom = CAMERA_CONFIG.zoom.levelStartScale;
                            this.triggerZoom(1.0, CAMERA_CONFIG.zoom.levelStartDuration);
                        }
                        // Boss intro screen
                        if (this._bossConfig) {
                            this._bossIntroTimer = BOSS_CONFIG.introScreenDuration;
                            this.sound.play('bossIntro');
                            this.state = ST_READY;
                            this.stateTimer = BOSS_CONFIG.introScreenDuration + 60;
                            this.showMessage(
                                `⚠️ BOSS APPROACHING!`,
                                `${this._bossConfig.emoji} <b>${this._bossConfig.name}</b><br>${this._bossConfig.description}<br><br>"${this._bossConfig.quote}"`
                            );
                        } else {
                            this.state = ST_READY;
                            this.stateTimer = 150;
                            this.showMessage(this._levelTitle(), HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)]);
                        }
                        this.updateHUD();
                    }
                }
                return;
            }

            if (this.state === ST_CUTSCENE) {
                this.updateCutscene();
                return;
            }

            if (this.state !== ST_PLAYING) return;

            // Daily challenge: speed run time-up
            if (this._dailyTimeUp && this._dailyChallenge) {
                this._endDailyChallenge();
                return;
            }

            this.updateGhostMode();
            this.moveHomer();
            this.checkDots();
            this.updateBonus();
            this.updateSpecialItems();
            this.updateActivePowerUps();
            for (const ghost of this.ghosts) this.moveGhost(ghost);
            this.updateBossAbilities();
            this.updateNelsonLaugh();
            this.checkCollisions();
            this.checkBossTraps();

            // Accessibility: ghost proximity visual indicator (throttled)
            if (typeof a11y !== 'undefined' && this.animFrame % 15 === 0) {
                const hx = this.homer.x + TILE / 2;
                const hy = this.homer.y + TILE / 2;
                const nearby = this.ghosts.some(g => {
                    if (g.mode === GM_EATEN || g.mode === GM_FRIGHTENED || g.inHouse) return false;
                    const dx = hx - (g.x + TILE / 2);
                    const dy = hy - (g.y + TILE / 2);
                    return Math.sqrt(dx * dx + dy * dy) < TILE * 5;
                });
                a11y.updateProximity(nearby);
            }

            // Rake slow timer: restore Homer's speed after penalty expires
            if (this._rakeSlowTimer > 0) {
                this._rakeSlowTimer--;
                if (this._rakeSlowTimer <= 0) {
                    this.homer.speed = this.getSpeed('homer');
                }
            }

            // Spatial audio update (throttled for performance)
            if (this.animFrame % AUDIO_JUICE.spatialUpdateInterval === 0) {
                this.sound.updateSpatial(this.homer.x, this.homer.y, this.ghosts);
            }

            // Achievement tick: ghost whisperer timer + periodic checks
            this._noPowerPelletFrames++;
            if (this.achievements && this.animFrame % 60 === 0) {
                this.achievements.notify('tick', this);
            }

            // Mouth animation
            if (this.animFrame % 4 === 0) {
                this.homer.mouthAngle += this.homer.mouthOpen ? 0.15 : -0.15;
                if (this.homer.mouthAngle >= 0.6) this.homer.mouthOpen = false;
                if (this.homer.mouthAngle <= 0) this.homer.mouthOpen = true;
            }
        }

        // ---- SPECIAL ITEMS (POWER-UP VARIETY) ----

        // ==================== RENDERING ====================
        draw() {
            // Handle cutscene rendering separately
            if (this.state === ST_CUTSCENE) {
                this.drawCutscene();
                return;
            }
            
            const ctx = this.ctx;

            // Camera transform: combine shake, zoom, and follow
            const hasShake = this.screenShakeTimer > 0;
            const hasZoom = this._isCameraEnabled() && Math.abs(this._cameraZoom - 1.0) > 0.001;
            const hasFollow = this._isCameraEnabled() &&
                (Math.abs(this._cameraOffsetX) > 0.1 || Math.abs(this._cameraOffsetY) > 0.1);
            const hasCameraTransform = hasShake || hasZoom || hasFollow;
            if (hasCameraTransform) {
                ctx.save();
                if (hasZoom) {
                    ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
                    ctx.scale(this._cameraZoom, this._cameraZoom);
                    ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);
                }
                if (hasFollow) ctx.translate(this._cameraOffsetX, this._cameraOffsetY);
                if (hasShake) {
                    const decay = this.screenShakeTimer / (this._shakeMaxDuration || 18);
                    const intensity = this.screenShakeIntensity * decay;
                    ctx.translate(Math.sin(this.animFrame * 1.1) * intensity, Math.cos(this.animFrame * 1.7) * intensity);
                }
            }
            if (hasZoom && this._cameraZoom < 1.0) {
                ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillStyle = COLORS.pathDark; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
                ctx.restore();
            }

            ctx.fillStyle = this.currentLayout.floorColor || COLORS.pathDark;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // Ambient color overlay for theme atmosphere
            if (this.currentLayout.ambientColor) {
                ctx.fillStyle = this.currentLayout.ambientColor;
                ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            }

            // Subtle starfield background for non-wall cells
            if (!this._stars) {
                this._stars = [];
                for (let i = 0; i < 50; i++) {
                    this._stars.push({ x: Math.random() * CANVAS_W, y: Math.random() * CANVAS_H, s: 0.5 + Math.random() * 1.5 });
                }
            }
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            for (const star of this._stars) {
                const twinkle = 0.5 + Math.sin(this.animFrame * 0.03 + star.x) * 0.5;
                ctx.globalAlpha = twinkle * 0.3;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            this.drawMaze(ctx);
            this.drawDots(ctx);

            // Ambient theme particles (behind entities)
            this._drawAmbientParticles(ctx);

            // Bonus item
            if (this.bonusActive && this.bonusPos) {
                Sprites.drawBonusItem(ctx, this.bonusPos.x + TILE / 2, this.bonusPos.y + TILE / 2, this.level, this.animFrame);
            }

            // Special power-up item
            if (this._specialItem) {
                const si = this._specialItem;
                const sx = si.col * TILE + TILE / 2;
                const sy = si.row * TILE + TILE / 2;
                const bob = Math.sin(this.animFrame * 0.1) * 3;
                const glow = 0.4 + Math.sin(this.animFrame * 0.08) * 0.2;
                
                ctx.save();
                ctx.globalAlpha = glow + 0.4;
                
                // Draw glow effect
                const gradient = ctx.createRadialGradient(sx, sy + bob, 0, sx, sy + bob, TILE);
                gradient.addColorStop(0, si.type.colors.glow);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(sx - TILE, sy + bob - TILE, TILE * 2, TILE * 2);
                
                // Draw item icon
                ctx.globalAlpha = 1;
                ctx.font = `${TILE * 1.2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(si.type.emoji, sx, sy + bob);
                
                ctx.restore();
            }

            // Homer
            if (this.state === ST_DYING) {
                Sprites.drawHomerDying(ctx, this.homer.x, this.homer.y, 1 - this.stateTimer / 90, TILE);
            } else if (this.state !== ST_GAME_OVER && this.state !== ST_START) {
                // Shadow under Homer
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(this.homer.x + TILE / 2, this.homer.y + TILE - 2, TILE / 3, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                // Power-up visual effects on Homer
                if (this._activePowerUps && this._activePowerUps.length > 0) {
                    for (const pu of this._activePowerUps) {
                        if (pu.type.effect === 'speed_boost') {
                            ctx.globalAlpha = 0.3;
                            ctx.fillStyle = pu.type.colors.primary;
                            const trailX = this.homer.x - DX[this.homer.dir] * 8;
                            const trailY = this.homer.y - DY[this.homer.dir] * 8;
                            ctx.beginPath();
                            ctx.arc(trailX + TILE / 2, trailY + TILE / 2, TILE / 3, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        } else if (pu.type.effect === 'invincibility') {
                            const hue = (this.animFrame * 5) % 360;
                            ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
                            ctx.lineWidth = 2;
                            ctx.globalAlpha = 0.6 + Math.sin(this.animFrame * 0.2) * 0.3;
                            ctx.beginPath();
                            ctx.arc(this.homer.x + TILE / 2, this.homer.y + TILE / 2, TILE * 0.7, 0, Math.PI * 2);
                            ctx.stroke();
                            ctx.globalAlpha = 1;
                        }
                    }
                }
                Sprites.drawHomer(ctx, this.homer.x, this.homer.y, this.homer.dir, this.homer.mouthAngle, TILE);
            }

            // Ghosts (skip offscreen)
            if (this.state === ST_PLAYING || this.state === ST_READY) {
                // Draw fake pellets (Krusty boss ability)
                for (const fp of this._fakePellets) {
                    const fpx = fp.col * TILE + TILE / 2;
                    const fpy = fp.row * TILE + TILE / 2;
                    const pulse = 0.7 + Math.sin(this.animFrame * 0.15) * 0.3;
                    ctx.save();
                    ctx.globalAlpha = pulse;
                    ctx.fillStyle = BOSS_CONFIG.fakePelletColor;
                    ctx.beginPath();
                    ctx.arc(fpx, fpy, TILE / 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                // Draw rake traps (Sideshow Bob boss ability)
                for (const rake of this._rakeTraps) {
                    ctx.save();
                    ctx.font = `${TILE}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🪤', rake.col * TILE + TILE / 2, rake.row * TILE + TILE / 2);
                    ctx.restore();
                }

                // Draw laser beams (Mr. Burns Mega boss ability)
                for (const beam of this._laserBeams) {
                    ctx.save();
                    ctx.strokeStyle = BOSS_CONFIG.laserColor;
                    ctx.lineWidth = BOSS_CONFIG.laserWidth;
                    ctx.globalAlpha = 0.8;
                    ctx.shadowColor = BOSS_CONFIG.laserColor;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(beam.x, beam.y);
                    ctx.lineTo(beam.x + DX[beam.dir] * TILE * 2, beam.y + DY[beam.dir] * TILE * 2);
                    ctx.stroke();
                    ctx.restore();
                }

                for (const g of this.ghosts) {
                    // Offscreen culling
                    if (g.x < -TILE * 2 || g.x > CANVAS_W + TILE || g.y < -TILE * 2 || g.y > CANVAS_H + TILE) continue;

                    const gcx = g.x + TILE / 2;
                    const gcy = g.y + TILE / 2;

                    // Personality visual: Nelson wobble
                    if (g.idx === 2 && g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                        const wobble = Math.sin(this.animFrame * GHOST_PERSONALITY_VISUALS.nelson.wobbleFrequency) * GHOST_PERSONALITY_VISUALS.nelson.wobbleAmplitude;
                        ctx.save();
                        ctx.translate(wobble, 0);
                    }

                    // Boss scale: render bosses 1.5x larger
                    const isBossSprite = g.isBoss && g.mode !== GM_EATEN;
                    if (isBossSprite) {
                        ctx.save();
                        ctx.translate(gcx, gcy);
                        ctx.scale(BOSS_CONFIG.spriteScale, BOSS_CONFIG.spriteScale);
                        ctx.translate(-gcx, -gcy);
                    }

                    // Ghost shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.25)';
                    ctx.beginPath();
                    ctx.ellipse(gcx, g.y + TILE - 1, TILE / 3, 2.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Ghost glow (subtle color aura)
                    if (g.mode !== GM_EATEN) {
                        const glowColor = g.mode === GM_FRIGHTENED ? 'rgba(80,80,255,0.15)' :
                            `rgba(${parseInt(g.color.slice(1,3),16)},${parseInt(g.color.slice(3,5),16)},${parseInt(g.color.slice(5,7),16)},0.15)`;
                        ctx.fillStyle = glowColor;
                        ctx.beginPath();
                        ctx.arc(gcx, gcy, TILE * 0.7, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    Sprites.drawGhost(ctx, g, this.animFrame, this.frightTimer, this.homer);

                    if (isBossSprite) ctx.restore();

                    // Personality visual: Burns crown
                    if (g.idx === 0 && g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                        Sprites.drawBurnsCrown(ctx, gcx, g.y - 4, GHOST_PERSONALITY_VISUALS.burns);
                    }

                    // Personality visual: Bob Patiño speed lines
                    if (g.idx === 1 && g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                        Sprites.drawPersonalitySpeedLines(ctx, g, this.animFrame, GHOST_PERSONALITY_VISUALS.bob);
                    }

                    // Personality visual: Nelson wobble restore + laugh indicator
                    if (g.idx === 2 && g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                        ctx.restore();
                        if (g._laughTimer > 0) {
                            ctx.save();
                            ctx.font = 'bold 10px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillStyle = '#ff8c00';
                            ctx.fillText('HA HA!', gcx, g.y - 8);
                            ctx.restore();
                        }
                    }

                    // Personality visual: Snake smoke trail
                    if (g.idx === 3 && g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                        Sprites.drawSnakeSmokeTrail(ctx, g, this.animFrame, GHOST_PERSONALITY_VISUALS.snake);
                    }

                    // Boss HP bar
                    if (g.isBoss && g.mode !== GM_EATEN && g.bossHp !== undefined) {
                        Sprites.drawBossHpBar(ctx, gcx, g.y + BOSS_CONFIG.hpBarOffsetY, g.bossHp, g.bossMaxHp);
                    }

                    // Chili pepper heat particles for slowed ghosts
                    if (this._activePowerUps && this._activePowerUps.some(p => p.type.effect === 'slow_ghosts') && g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED) {
                        ctx.globalAlpha = 0.6;
                        ctx.font = '8px Arial';
                        const floatY = Math.sin(this.animFrame * 0.15 + g.idx) * 4;
                        ctx.fillText('🌶️', gcx + 6, g.y - 2 + floatY);
                        ctx.globalAlpha = 1;
                    }
                }
            }

            // Boss intro overlay
            if (this._bossIntroTimer > 0) {
                this._bossIntroTimer--;
                const bc = this._bossConfig;
                if (bc) {
                    const progress = 1 - (this._bossIntroTimer / BOSS_CONFIG.introScreenDuration);
                    const alpha = progress < 0.2 ? progress * 5 : progress > 0.8 ? (1 - progress) * 5 : 1;
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.85;
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, CANVAS_H / 3, CANVAS_W, CANVAS_H / 3);
                    ctx.globalAlpha = alpha;
                    ctx.font = 'bold 28px "Bangers", Arial';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#ff4444';
                    ctx.fillText('⚠️ BOSS APPROACHING! ⚠️', CANVAS_W / 2, CANVAS_H / 2 - 20);
                    ctx.font = 'bold 20px "Bangers", Arial';
                    ctx.fillStyle = '#ffd800';
                    const pulse = 1 + Math.sin(this.animFrame * 0.15) * 0.1;
                    ctx.save();
                    ctx.translate(CANVAS_W / 2, CANVAS_H / 2 + 15);
                    ctx.scale(pulse, pulse);
                    ctx.fillText(`${bc.emoji} ${bc.name}`, 0, 0);
                    ctx.restore();
                    ctx.font = '14px "Bangers", Arial';
                    ctx.fillStyle = '#ccc';
                    ctx.fillText(bc.description, CANVAS_W / 2, CANVAS_H / 2 + 40);
                    ctx.restore();
                }
            }

            // Floating texts
            for (const t of this.floatingTexts) {
                const alpha = t.life / 60;
                const scale = 1 + (1 - alpha) * 0.3;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(t.x, t.y);
                ctx.scale(scale, scale);
                // Text shadow
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px "Bangers", Arial';
                ctx.textAlign = 'center';
                ctx.fillText(t.text, 1, 1);
                // Main text
                ctx.fillStyle = t.color;
                ctx.fillText(t.text, 0, 0);
                ctx.restore();
            }

            // Particles
            for (const p of this.particles) {
                ctx.globalAlpha = p.life / 50;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            ctx.globalAlpha = 1;

            // Combo counter overlay (shown once ≥ 2 ghosts eaten, i.e. first milestone of 2x)
            if (this.comboDisplayTimer > 0 && this.ghostsEaten >= 2) {
                const comboMult = Math.min(8, Math.pow(2, this.ghostsEaten - 1));
                const alpha = this.comboDisplayTimer < 30 ? this.comboDisplayTimer / 30 : 1;
                const pulse = 1 + Math.sin(this.animFrame * 0.25) * 0.08;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(CANVAS_W / 2, 36);
                ctx.scale(pulse, pulse);
                ctx.font = 'bold 22px "Bangers", Arial';
                ctx.textAlign = 'center';
                // Shadow
                ctx.fillStyle = '#000';
                ctx.fillText(`${comboMult}x COMBO!`, 1, 1);
                // Gradient fill color based on multiplier
                const comboColor = comboMult >= 8 ? '#ff4444' : comboMult >= 4 ? '#ff8800' : '#ffd800';
                ctx.fillStyle = comboColor;
                ctx.fillText(`${comboMult}x COMBO!`, 0, 0);
                ctx.restore();
            }

            // Endless mode badge(pulsing infinity symbol)
            if (this.isEndlessMode() && this.state === ST_PLAYING) {
                const pulse = 0.85 + Math.sin(this.animFrame * 0.08) * 0.15;
                ctx.save();
                ctx.globalAlpha = 0.9;
                ctx.translate(CANVAS_W - 50, 18);
                ctx.scale(pulse, pulse);
                ctx.font = 'bold 14px "Bangers", Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000';
                ctx.fillText('∞ ENDLESS', 1, 1);
                ctx.fillStyle = '#ff69b4';
                ctx.fillText('∞ ENDLESS', 0, 0);
                ctx.restore();
            }

            // Lives mini-Homers at bottom
            for (let i = 0; i < this.lives - 1; i++) {
                Sprites.drawMiniHomer(ctx, 20 + i * 28, CANVAS_H - 16);
            }

            // Active power-ups HUD timer (top-right corner)
            if (this._activePowerUps && this._activePowerUps.length > 0) {
                const hudX = CANVAS_W - 10;
                let hudY = 30;
                
                for (const pu of this._activePowerUps) {
                    const timeLeft = Math.ceil(pu.timer / 60);
                    const pct = pu.timer / pu.startTimer;
                    const barWidth = 80;
                    const barHeight = 16;
                    
                    ctx.save();
                    ctx.textAlign = 'right';
                    
                    // Background bar
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(hudX - barWidth, hudY, barWidth, barHeight);
                    
                    // Progress bar
                    const barColor = pct < 0.25 ? '#ff4444' : pct < 0.5 ? '#ff8800' : pu.type.colors.primary;
                    ctx.fillStyle = barColor;
                    ctx.fillRect(hudX - barWidth, hudY, barWidth * pct, barHeight);
                    
                    // Border
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(hudX - barWidth, hudY, barWidth, barHeight);
                    
                    // Icon and time
                    ctx.font = '12px Arial';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(`${pu.type.emoji} ${timeLeft}s`, hudX - 5, hudY + 12);
                    
                    ctx.restore();
                    hudY += 22;
                }
            }

            // Burns token indicator (bottom-left corner)
            if (this._burnsTokens > 0 && typeof POWER_UP_TYPES !== 'undefined') {
                const tokenType = POWER_UP_TYPES.find(t => t.effect === 'collect_token');
                if (tokenType) {
                    ctx.save();
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#000';
                    ctx.fillText(`${tokenType.emoji} ${this._burnsTokens}/${tokenType.effectValue}`, 11, CANVAS_H - 27);
                    ctx.fillStyle = '#ffd800';
                    ctx.fillText(`${tokenType.emoji} ${this._burnsTokens}/${tokenType.effectValue}`, 10, CANVAS_H - 28);
                    ctx.restore();
                }
            }

            // Ghost names display (bottom right)
            if (this.state === ST_START || this.state === ST_READY) {
                this.drawGhostLegend(ctx);
            }

            // Restore camera transforms
            if (hasCameraTransform) {
                ctx.restore();
            }

            // Level complete white flash overlay
            if (this.state === ST_LEVEL_DONE && this._isCameraEnabled() && typeof CAMERA_CONFIG !== 'undefined') {
                const flashProgress = 1 - (this.stateTimer / 150);
                if (flashProgress > 0.6) {
                    ctx.save();
                    ctx.globalAlpha = (flashProgress - 0.6) * 2.5;
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
                    ctx.restore();
                }
            }

            // Level transition wipe effect (circular iris wipe)
            if (this._wipeTimer > 0) {
                const progress = 1 - (this._wipeTimer / PERF_CONFIG.levelTransitionWipeDuration);
                const maxRadius = Math.sqrt(CANVAS_W * CANVAS_W + CANVAS_H * CANVAS_H) / 2;
                const radius = maxRadius * (1 - progress);
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.rect(0, 0, CANVAS_W, CANVAS_H);
                ctx.arc(CANVAS_W / 2, CANVAS_H / 2, radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
            }
        }

        drawMaze(ctx) {
            const flash = this.state === ST_LEVEL_DONE && this.stateTimer % 20 < 10;
            const wc = this.currentLayout.wallColors;

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = this.currentLayout.template[r][c];
                    if (cell === WALL) {
                        const wallColor1 = flash ? '#ffd800' : wc.main;
                        const wallColor2 = flash ? '#b8a000' : wc.dark;
                        const borderColor = flash ? '#ffd800' : wc.border;
                        const highlightColor = flash ? '#ffe866' : wc.light;

                        // Main wall fill
                        ctx.fillStyle = wallColor1;
                        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
                        // Inner darker area with slight gradient feel
                        ctx.fillStyle = wallColor2;
                        ctx.fillRect(c * TILE + 2, r * TILE + 2, TILE - 4, TILE - 4);
                        // Top-left highlight for 3D bevel effect
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.15;
                        ctx.fillRect(c * TILE, r * TILE, TILE, 2);
                        ctx.fillRect(c * TILE, r * TILE, 2, TILE);
                        ctx.globalAlpha = 1;

                        // Border lines on exposed edges
                        ctx.strokeStyle = borderColor;
                        ctx.lineWidth = 1;
                        const tpl = this.currentLayout.template;
                        const top = r > 0 && tpl[r - 1][c] !== WALL;
                        const bot = r < ROWS - 1 && tpl[r + 1][c] !== WALL;
                        const lft = c > 0 && tpl[r][c - 1] !== WALL;
                        const rgt = c < COLS - 1 && tpl[r][c + 1] !== WALL;

                        if (top) { ctx.beginPath(); ctx.moveTo(c * TILE, r * TILE + 1); ctx.lineTo((c + 1) * TILE, r * TILE + 1); ctx.stroke(); }
                        if (bot) { ctx.beginPath(); ctx.moveTo(c * TILE, (r + 1) * TILE - 1); ctx.lineTo((c + 1) * TILE, (r + 1) * TILE - 1); ctx.stroke(); }
                        if (lft) { ctx.beginPath(); ctx.moveTo(c * TILE + 1, r * TILE); ctx.lineTo(c * TILE + 1, (r + 1) * TILE); ctx.stroke(); }
                        if (rgt) { ctx.beginPath(); ctx.moveTo((c + 1) * TILE - 1, r * TILE); ctx.lineTo((c + 1) * TILE - 1, (r + 1) * TILE); ctx.stroke(); }

                    } else if (cell === GHOST_DOOR) {
                        // Nuclear Plant entrance door (animated green glow)
                        const glowIntensity = 0.5 + Math.sin(this.animFrame * 0.06) * 0.3;
                        ctx.fillStyle = `rgba(68, 255, 68, ${glowIntensity})`;
                        ctx.shadowColor = '#00ff00';
                        ctx.shadowBlur = 6 + Math.sin(this.animFrame * 0.06) * 3;
                        ctx.fillRect(c * TILE, r * TILE + TILE / 2 - 2, TILE, 4);
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // Ghost house label - "Planta Nuclear" sign with glow
            const signGlow = 0.25 + Math.sin(this.animFrame * 0.04) * 0.1;
            ctx.fillStyle = `rgba(0, 255, 0, ${signGlow})`;
            ctx.font = 'bold 7px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('☢ Planta Nuclear', 14 * TILE, 13 * TILE - 2);

            // Draw theme-specific decorations
            this.drawThemeDecorations(ctx);
        }

        drawThemeDecorations(ctx) {
            if (!this.currentLayout.decorations) return;

            const decorations = this.currentLayout.decorations;
            const themeName = this.currentLayout.name;

            // Draw 3-4 decorative elements per theme (strategic positions)
            const decorationPositions = [
                { r: 2, c: 2 }, { r: 2, c: 25 },
                { r: 28, c: 2 }, { r: 28, c: 25 }
            ];

            decorationPositions.forEach((pos, idx) => {
                const x = pos.c * TILE;
                const y = pos.r * TILE;
                const decType = decorations[idx % decorations.length];

                ctx.save();
                
                switch(decType) {
                    case 'street_sign':
                        // Springfield Streets - Street sign pole
                        ctx.fillStyle = '#555';
                        ctx.fillRect(x + 10, y + 8, 2, 12);
                        ctx.fillStyle = '#2244aa';
                        ctx.fillRect(x + 4, y + 5, 14, 6);
                        ctx.fillStyle = '#fff';
                        ctx.font = 'bold 4px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('MAIN', x + 11, y + 9);
                        break;
                        
                    case 'lamp_post':
                        // Springfield Streets - Lamp post with glow
                        ctx.fillStyle = '#444';
                        ctx.fillRect(x + 11, y + 6, 2, 14);
                        const lampGlow = 0.6 + Math.sin(this.animFrame * 0.05 + idx) * 0.2;
                        ctx.fillStyle = `rgba(255, 215, 0, ${lampGlow})`;
                        ctx.shadowColor = '#ffd700';
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        ctx.arc(x + 12, y + 8, 3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        break;
                        
                    case 'beer_mug':
                        // Moe's Tavern - Beer mug
                        ctx.fillStyle = '#cc9944';
                        ctx.fillRect(x + 7, y + 8, 8, 10);
                        ctx.fillStyle = '#f4d596';
                        ctx.fillRect(x + 7, y + 8, 8, 4);
                        ctx.fillStyle = '#fff';
                        ctx.globalAlpha = 0.5;
                        ctx.fillRect(x + 8, y + 10, 2, 6);
                        ctx.globalAlpha = 1;
                        // Foam on top
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(x + 7, y + 6, 8, 3);
                        break;
                        
                    case 'neon_duff':
                        // Moe's Tavern - Duff neon sign
                        const neonGlow = 0.5 + Math.sin(this.animFrame * 0.08 + idx) * 0.3;
                        ctx.shadowColor = '#cc0000';
                        ctx.shadowBlur = 6;
                        ctx.fillStyle = `rgba(204, 0, 0, ${neonGlow})`;
                        ctx.font = 'bold 8px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('DUFF', x + 12, y + 14);
                        ctx.shadowBlur = 0;
                        break;
                        
                    case 'squishee':
                        // Kwik-E-Mart - Squishee machine
                        ctx.fillStyle = '#dd4488';
                        ctx.fillRect(x + 6, y + 6, 10, 12);
                        ctx.fillStyle = '#ab3272';
                        ctx.fillRect(x + 7, y + 7, 8, 8);
                        // Liquid inside
                        const squisheeColor = idx % 2 === 0 ? '#00ccff' : '#ff00ff';
                        ctx.fillStyle = squisheeColor;
                        ctx.fillRect(x + 8, y + 9, 6, 4);
                        break;
                        
                    case 'shelf':
                        // Kwik-E-Mart - Store shelf
                        ctx.fillStyle = '#8b2252';
                        ctx.fillRect(x + 4, y + 8, 14, 2);
                        ctx.fillRect(x + 4, y + 14, 14, 2);
                        // Products on shelf
                        ctx.fillStyle = '#dd4488';
                        ctx.fillRect(x + 6, y + 5, 3, 3);
                        ctx.fillRect(x + 11, y + 5, 3, 3);
                        ctx.fillRect(x + 6, y + 11, 3, 3);
                        ctx.fillRect(x + 11, y + 11, 3, 3);
                        break;
                        
                    case 'chalkboard':
                        // Springfield Elementary - Chalkboard
                        ctx.fillStyle = '#2a2a2a';
                        ctx.fillRect(x + 4, y + 6, 14, 10);
                        ctx.strokeStyle = '#8a8a8a';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x + 4, y + 6, 14, 10);
                        // Chalk writing
                        ctx.strokeStyle = '#ccc';
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(x + 6, y + 9);
                        ctx.lineTo(x + 16, y + 9);
                        ctx.moveTo(x + 6, y + 12);
                        ctx.lineTo(x + 16, y + 12);
                        ctx.stroke();
                        break;
                        
                    case 'desk':
                        // Springfield Elementary - School desk
                        ctx.fillStyle = '#6a6a6a';
                        ctx.fillRect(x + 6, y + 10, 10, 6);
                        ctx.fillStyle = '#4a4a4a';
                        ctx.fillRect(x + 7, y + 16, 2, 4);
                        ctx.fillRect(x + 13, y + 16, 2, 4);
                        break;
                        
                    case 'radiation':
                        // Nuclear Plant - Radiation symbol
                        const radGlow = 0.5 + Math.sin(this.animFrame * 0.06 + idx) * 0.3;
                        ctx.fillStyle = `rgba(85, 204, 85, ${radGlow})`;
                        ctx.shadowColor = '#55cc55';
                        ctx.shadowBlur = 8;
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('☢', x + 12, y + 16);
                        ctx.shadowBlur = 0;
                        break;
                        
                    case 'control_panel':
                        // Nuclear Plant - Control panel
                        ctx.fillStyle = '#2d6b2d';
                        ctx.fillRect(x + 4, y + 8, 14, 10);
                        // Buttons and lights
                        const colors = ['#55cc55', '#ff0000', '#ffff00'];
                        for (let i = 0; i < 3; i++) {
                            const btnGlow = 0.6 + Math.sin(this.animFrame * 0.07 + idx + i) * 0.4;
                            ctx.fillStyle = colors[i];
                            ctx.globalAlpha = btnGlow;
                            ctx.beginPath();
                            ctx.arc(x + 7 + i * 4, y + 12, 1.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1;
                        break;
                        
                    case 'couch':
                        // Simpsons House - Orange couch
                        ctx.fillStyle = '#d4a373';
                        ctx.fillRect(x + 4, y + 10, 14, 8);
                        ctx.fillStyle = '#b4834f';
                        ctx.fillRect(x + 4, y + 10, 14, 2);
                        // Cushions
                        ctx.fillStyle = '#f4c393';
                        ctx.fillRect(x + 6, y + 11, 4, 3);
                        ctx.fillRect(x + 12, y + 11, 4, 3);
                        break;
                        
                    case 'photo_frame':
                        // Simpsons House - Family photo frame
                        ctx.fillStyle = '#ffddaa';
                        ctx.fillRect(x + 7, y + 8, 8, 10);
                        ctx.strokeStyle = '#d4a373';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(x + 7, y + 8, 8, 10);
                        // Simple photo (blue sky + yellow figure)
                        ctx.fillStyle = '#87ceeb';
                        ctx.fillRect(x + 8, y + 9, 6, 4);
                        ctx.fillStyle = '#ffd800';
                        ctx.beginPath();
                        ctx.arc(x + 11, y + 15, 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
                
                ctx.restore();
            });
        }

        drawDots(ctx) {
            // Collect dot positions, then batch draw (minimizes per-dot state changes)
            const dots = [];
            const powers = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = this.maze[r][c];
                    if (cell === DOT) {
                        dots.push(c * TILE + TILE / 2, r * TILE + TILE / 2);
                    } else if (cell === POWER) {
                        powers.push({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 });
                    }
                }
            }

            // Batch draw all donuts
            const frame = this.animFrame;
            for (let i = 0; i < dots.length; i += 2) {
                Sprites.drawDonut(ctx, dots[i], dots[i + 1], frame);
            }

            // Power pellets (fewer, drawn individually)
            for (const p of powers) {
                Sprites.drawDuff(ctx, p.x, p.y, frame);
            }
        }

        drawGhostLegend(ctx) {
            const x = CANVAS_W - 120;
            const y = CANVAS_H - 70;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - 5, y - 12, 120, 65);
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'left';
            GHOST_CFG.forEach((ghost, i) => {
                ctx.fillStyle = ghost.color;
                ctx.fillRect(x, y + i * 14, 8, 8);
                ctx.fillStyle = '#fff';
                ctx.fillText(ghost.name, x + 12, y + i * 14 + 7);
            });
        }

        // Debug overlay render pass (separate from main draw, zero cost when off)
        drawDebugOverlay() {
            if (!this._debugOverlay && !this._devConsole) return;
            if (this.state !== ST_PLAYING && this.state !== ST_READY) return;

            const ctx = this.ctx;
            const baseGhostSpeed = BASE_SPEED * 0.9;

            if (this._debugOverlay && this.ghosts) {
                for (const g of this.ghosts) {
                    if (g.x < -TILE * 2 || g.x > CANVAS_W + TILE) continue;

                    const target = this._getGhostTarget(g);

                    // Breadcrumbs
                    Sprites.drawBreadcrumbs(ctx, this._ghostBreadcrumbs[g.idx], g.color);

                    // Target line + tile outline
                    Sprites.drawTargetLine(ctx, g, target);
                    Sprites.drawTargetTile(ctx, target, g.color);

                    // Personality indicators
                    switch (g.idx) {
                        case 0: Sprites.drawBurnsCrosshair(ctx, target); break;
                        case 1: Sprites.drawBobSpeedLines(ctx, g, this.animFrame); break;
                        case 2: Sprites.drawNelsonZigzag(ctx, g, target); break;
                        case 3: Sprites.drawSnakeSpeedBadge(ctx, g, baseGhostSpeed); break;
                    }

                    // Mode icon + label
                    Sprites.drawGhostDebugLabel(ctx, g, this.animFrame);
                }
            }

            if (this._devConsole) {
                const ghostModes = this.ghosts
                    ? this.ghosts.map(g => GHOST_DEBUG.modeLabels[g.mode] || '?').join(' ')
                    : '';
                Sprites.drawDevConsole(ctx, {
                    fps: this._fpsDisplay,
                    entityCount: 1 + (this.ghosts ? this.ghosts.length : 0),
                    collisionChecks: this._collisionChecks,
                    ghostModes,
                }, this.animFrame);
            }
        }

        // ==================== GAME LOOP ====================
        loop() {
            const now = performance.now();
            const dt = now - this._lastFrameTime;
            this._lastFrameTime = now;

            // FPS ring buffer
            this._fpsBuffer[this._fpsIndex] = dt;
            this._fpsIndex = (this._fpsIndex + 1) % PERF_CONFIG.fpsBufferSize;
            // Update display FPS every 30 frames
            if (this.animFrame % 30 === 0) {
                let sum = 0;
                for (let i = 0; i < PERF_CONFIG.fpsBufferSize; i++) sum += this._fpsBuffer[i];
                const avg = sum / PERF_CONFIG.fpsBufferSize;
                this._fpsDisplay = avg > 0 ? Math.round(1000 / avg) : 0;
            }

            this.update();
            this.draw();
            this.drawDebugOverlay();

            // FPS counter overlay in dev mode
            if (PERF_CONFIG.devMode) {
                this.ctx.fillStyle = '#0f0';
                this.ctx.font = '10px monospace';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`${this._fpsDisplay} FPS`, 4, 12);
            }

            requestAnimationFrame(() => this.loop());
        }
    }
