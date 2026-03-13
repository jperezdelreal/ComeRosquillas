// ===========================
// Come Rosquillas - Main Game Logic
// ===========================

'use strict';

    class Game {
        constructor() {
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

            // Pre-render some decorations
            this.cloudOffset = 0;

            this.currentLayout = getMazeLayout(this.level);
            this.maze = this.currentLayout.template.map(row => [...row]);

            this.setupInput();
            
            // Initialize settings menu
            if (typeof SettingsMenu !== 'undefined') {
                this.settingsMenu = new SettingsMenu(this.sound);
                this.settingsMenu._game = this;
                
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
            
            // Initialize touch input system
            if (typeof TouchInput !== 'undefined') {
                this.touchInput = new TouchInput(this);
            }
            
            // Initialize tutorial system
            if (typeof Tutorial !== 'undefined') {
                this.tutorial = new Tutorial(this);
            }
            
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
                    this.state = ST_START;
                    this.level = 1;
                    this.currentLayout = getMazeLayout(this.level);
                    this.maze = this.currentLayout.template.map(row => [...row]);
                    this.showStartScreen();
                } else if (this.state === ST_PLAYING && e.code === 'KeyP') {
                    this.state = ST_PAUSED;
                    this.sound.stopMusic();
                    this.showMessage('PAUSA', '¡Ay, caramba!<br>Press P to continue');
                } else if (this.state === ST_PAUSED && e.code === 'KeyP') {
                    this.state = ST_PLAYING;
                    this.sound.startMusic();
                    this.hideMessage();
                } else if (this.state === ST_CUTSCENE) {
                    // Skip cutscene on any key press
                    this.skipCutscene();
                } else if (e.code === 'KeyM') {
                    const muted = this.sound.toggleMute();
                    if (muted !== undefined) {
                        this.addFloatingText(CANVAS_W / 2, 40, muted ? '🔇 MUTED' : '🔊 MUSIC ON', '#ffd800');
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
                const rank = this.highScores.addScore(this.initialsEntry.name, this.score, this.level, this.bestCombo);
                this.state = ST_GAME_OVER;
                this.sound.play('gameOver');
                const quote = GAME_OVER_QUOTES[Math.floor(Math.random() * GAME_OVER_QUOTES.length)];
                this.showMessage("D'OH!", `Game Over!<br>High Score #${rank}!<br>Score: ${this.score}<br><br>"${quote}"<br><br>Press ENTER to try again`);
            }
        }

        // ---- SCREENS ----
        showStartScreen() {
            const scores = this.highScores.getScores();
            const allTimeBest = this._allTimeBestCombo;
            let scoreTable = '';
            if (scores.length > 0) {
                scoreTable = '<br><div style="font-size: 16px; color: #ffd800; margin-top: 8px;">HIGH SCORES</div><div style="font-size: 14px; line-height: 1.6; color: #fff; margin-top: 4px;">';
                scores.forEach((s, i) => {
                    const comboStr = s.combo > 1 ? ` | 🔥${s.combo}x` : '';
                    const lvlStr = s.level >= ENDLESS_MODE.startLevel ? `∞${s.level}` : `Lvl ${s.level}`;
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
                    P = Pause &nbsp; M = Mute music<br><br>
                    Press ENTER or SPACE to start
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
            this.particles = [];
            this.bestCombo = 0;
            this.comboDisplayTimer = 0;
            this.initLevel();
            this.state = ST_READY;
            this.stateTimer = 150;
            this.sound.play('start');
            this.showMessage('&#127849; READY!', this._levelTitle());
            this.updateHUD();
        }

        initLevel() {
            this.currentLayout = getMazeLayout(this.level);
            this.maze = this.currentLayout.template.map(row => [...row]);
            this.totalDots = 0;
            this.dotsEaten = 0;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (this.maze[r][c] === DOT || this.maze[r][c] === POWER) this.totalDots++;
                }
            }
            this.initEntities();
            this.modeIndex = 0;
            this._levelModeTimers = this.getLevelModeTimers();
            this.modeTimer = this._levelModeTimers[0];
            this.globalMode = GM_SCATTER;
            this.frightTimer = 0;
            this.bonusActive = false;
            this.bonusTimer = 0;
            this.bonusPos = null;
            this.ghostsEaten = 0;
            this.comboDisplayTimer = 0;
        }

        initEntities() {
            this.homer = {
                x: HOMER_START.x * TILE,
                y: HOMER_START.y * TILE,
                dir: LEFT,
                nextDir: LEFT,
                mouthAngle: 0,
                mouthOpen: true,
                speed: this.getSpeed('homer')
            };
            const ramp = this.getDifficultyRamp();
            this.ghosts = GHOST_CFG.map((cfg, i) => {
                const ghost = {
                    x: cfg.startX * TILE,
                    y: cfg.startY * TILE,
                    dir: UP,
                    mode: GM_SCATTER,
                    color: cfg.color,
                    name: cfg.name,
                    scatterX: cfg.scatterX,
                    scatterY: cfg.scatterY,
                    homeX: cfg.homeX * TILE,
                    homeY: cfg.homeY * TILE,
                    inHouse: i > 0,
                    exitTimer: Math.round(cfg.exitDelay * (1 - ramp * DIFFICULTY_CURVE.exitDelayReduction)),
                    idx: i,
                    _lastDecisionTile: -1
                };
                ghost.speed = this.getSpeed('ghost', ghost);
                return ghost;
            });
        }

        // ---- DIFFICULTY CURVE ----
        // Returns true if current level is in endless mode (level 9+)
        isEndlessMode() {
            return this.level >= ENDLESS_MODE.startLevel;
        }

        // Levels 1-8: linear. Level 9+: continues scaling at reduced rate
        getEffectiveLevel() {
            if (this.level <= DIFFICULTY_CURVE.curatedLevels) {
                return this.level;
            }
            const endlessLevels = this.level - DIFFICULTY_CURVE.curatedLevels;
            return DIFFICULTY_CURVE.curatedLevels + endlessLevels * ENDLESS_MODE.endlessScalingFactor;
        }

        // Returns 0..1+ difficulty ramp based on effective level
        getDifficultyRamp() {
            return Math.min(1, (this.getEffectiveLevel() - 1) / 9);
        }

        // Fright time shrinks per level with minimum floor in endless
        getLevelFrightTime() {
            const effectiveLevel = this.getEffectiveLevel();
            const reduction = Math.pow(1 - DIFFICULTY_CURVE.frightReductionPerLevel, effectiveLevel - 1);
            const difficulty = getDifficultySettings();
            const frightTime = Math.round(FRIGHT_TIME * reduction * difficulty.frightTimeMultiplier);
            return Math.max(ENDLESS_MODE.minFrightFrames, frightTime);
        }

        // Scatter durations shrink, chase durations grow per level
        getLevelModeTimers() {
            const effectiveLevel = this.getEffectiveLevel();
            const scatterReduction = Math.pow(1 - DIFFICULTY_CURVE.scatterReductionPerLevel, effectiveLevel - 1);
            const chaseGrowth = Math.pow(1 + DIFFICULTY_CURVE.chaseLengtheningPerLevel, effectiveLevel - 1);
            return MODE_TIMERS.map((t, i) => {
                if (t < 0) return t;
                if (i % 2 === 0) {
                    return Math.max(ENDLESS_MODE.minScatterFrames, Math.round(t * scatterReduction));
                }
                return Math.round(t * chaseGrowth);
            });
        }

        // Per-ghost speed with personality bonuses and speed cap
        getSpeed(type, ghost) {
            const effectiveLevel = this.getEffectiveLevel();
            const ramp = this.getDifficultyRamp();
            const difficulty = getDifficultySettings();
            const speedCap = BASE_SPEED * ENDLESS_MODE.maxSpeedMultiplier;
            
            if (type === 'homer') {
                return Math.min(speedCap, BASE_SPEED * (1 + (effectiveLevel - 1) * 0.05));
            }
            if (type === 'ghost') {
                const levelMultiplier = Math.pow(1 + DIFFICULTY_CURVE.ghostSpeedPerLevel, effectiveLevel - 1);
                let base = BASE_SPEED * 0.9 * levelMultiplier * difficulty.ghostSpeedMultiplier;
                if (ghost) {
                    if (ghost.idx === 1) base *= (1 + 0.05 * ramp);
                    if (ghost.idx === 3) base *= (0.95 + Math.random() * 0.1);
                }
                return Math.min(speedCap, base);
            }
            if (type === 'frightGhost') {
                return Math.min(speedCap * 0.6, BASE_SPEED * (0.5 + ramp * 0.15) * difficulty.ghostSpeedMultiplier);
            }
            if (type === 'eatenGhost') return BASE_SPEED * 2;
            return BASE_SPEED;
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
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    life: 30 + Math.random() * 20,
                    color, size: 1 + Math.random() * 2
                });
            }
        }

        // ---- COMBO PERSISTENCE ----
        _loadBestCombo() {
            try {
                const val = parseInt(localStorage.getItem(COMBO_MILESTONE_STORAGE_KEY));
                return isNaN(val) ? 0 : val;
            } catch (e) { return 0; }
        }

        _saveBestCombo() {
            try {
                // Only update localStorage if current game best is a new all-time best
                const stored = parseInt(localStorage.getItem(COMBO_MILESTONE_STORAGE_KEY)) || 0;
                if (this.bestCombo > stored) {
                    localStorage.setItem(COMBO_MILESTONE_STORAGE_KEY, String(this.bestCombo));
                    this._allTimeBestCombo = this.bestCombo;
                }
            } catch (e) {}
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

            // Update particles
            this.particles = this.particles.filter(p => {
                p.life--;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                return p.life > 0;
            });

            // Update combo display timer
            if (this.comboDisplayTimer > 0) this.comboDisplayTimer--;

            // Update screen shake
            if (this.screenShakeTimer > 0) this.screenShakeTimer--;

            if (this.state === ST_READY) {
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = ST_PLAYING;
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
                        // Check if score qualifies for high score table
                        if (this.highScores.isHighScore(this.score)) {
                            this.state = ST_HIGH_SCORE_ENTRY;
                            this.initialsEntry = { active: true, name: 'AAA', pos: 0 };
                            this.showHighScoreEntry();
                        } else {
                            this.state = ST_GAME_OVER;
                            this.sound.play('gameOver');
                            const quote = GAME_OVER_QUOTES[Math.floor(Math.random() * GAME_OVER_QUOTES.length)];
                            this.showMessage("D'OH!", `Game Over!<br>Score: ${this.score}<br><br>"${quote}"<br><br>Press ENTER to try again`);
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
                if (this.stateTimer <= 0) {
                    // Check if this level should trigger a cutscene
                    const cutsceneIndex = CUTSCENE_LEVELS.indexOf(this.level);
                    if (cutsceneIndex !== -1) {
                        this.startCutscene(cutsceneIndex + 1);
                    } else {
                        this.level++;
                        this.initLevel();
                        this.state = ST_READY;
                        this.stateTimer = 150;
                        this.showMessage(this._levelTitle(), HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)]);
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

            this.updateGhostMode();
            this.moveHomer();
            this.checkDots();
            this.updateBonus();
            for (const ghost of this.ghosts) this.moveGhost(ghost);
            this.checkCollisions();

            // Mouth animation
            if (this.animFrame % 4 === 0) {
                this.homer.mouthAngle += this.homer.mouthOpen ? 0.15 : -0.15;
                if (this.homer.mouthAngle >= 0.6) this.homer.mouthOpen = false;
                if (this.homer.mouthAngle <= 0) this.homer.mouthOpen = true;
            }
        }

        updateGhostMode() {
            if (this.frightTimer > 0) {
                this.frightTimer--;
                if (this.frightTimer <= 0) {
                    for (const g of this.ghosts) {
                        if (g.mode === GM_FRIGHTENED) {
                            g.mode = this.globalMode;
                            g.speed = this.getSpeed('ghost', g);
                            g._lastDecisionTile = -1;
                        }
                    }
                    this.ghostsEaten = 0;
                    this.comboDisplayTimer = 0;
                }
                return;
            }
            const timers = this._levelModeTimers;
            if (this.modeIndex < timers.length) {
                this.modeTimer--;
                if (this.modeTimer <= 0) {
                    this.modeIndex++;
                    if (this.modeIndex < timers.length) {
                        this.modeTimer = timers[this.modeIndex];
                        this.globalMode = this.modeIndex % 2 === 0 ? GM_SCATTER : GM_CHASE;
                        for (const g of this.ghosts) {
                            if (g.mode !== GM_FRIGHTENED && g.mode !== GM_EATEN) {
                                g.dir = OPP[g.dir];
                                g.mode = this.globalMode;
                                g._lastDecisionTile = -1;
                            }
                        }
                    }
                }
            }
        }

        moveHomer() {
            const h = this.homer;
            if (this.keys['ArrowUp']) h.nextDir = UP;
            else if (this.keys['ArrowRight']) h.nextDir = RIGHT;
            else if (this.keys['ArrowDown']) h.nextDir = DOWN;
            else if (this.keys['ArrowLeft']) h.nextDir = LEFT;

            const cx = h.x + TILE / 2;
            const cy = h.y + TILE / 2;
            const tile = this.tileAt(cx, cy);
            const center = this.centerOfTile(tile.col, tile.row);
            const distToCenter = Math.abs(cx - center.x) + Math.abs(cy - center.y);

            if (distToCenter < h.speed + 1) {
                const nextCol = tile.col + DX[h.nextDir];
                const nextRow = tile.row + DY[h.nextDir];
                if (this.isWalkable(nextCol, nextRow, false)) {
                    h.dir = h.nextDir;
                    if (h.dir === UP || h.dir === DOWN) h.x = center.x - TILE / 2;
                    else h.y = center.y - TILE / 2;
                }
            }

            const aheadCol = tile.col + DX[h.dir];
            const aheadRow = tile.row + DY[h.dir];
            const canMove = this.isWalkable(aheadCol, aheadRow, false) || distToCenter > h.speed + 1;

            if (canMove) {
                h.x += DX[h.dir] * h.speed;
                h.y += DY[h.dir] * h.speed;
            } else {
                h.x = center.x - TILE / 2;
                h.y = center.y - TILE / 2;
            }

            if (h.x < -TILE) h.x = COLS * TILE;
            if (h.x > COLS * TILE) h.x = -TILE;
        }

        checkDots() {
            const cx = this.homer.x + TILE / 2;
            const cy = this.homer.y + TILE / 2;
            const tile = this.tileAt(cx, cy);
            if (tile.col < 0 || tile.col >= COLS || tile.row < 0 || tile.row >= ROWS) return;

            const cell = this.maze[tile.row][tile.col];
            if (cell === DOT) {
                this.maze[tile.row][tile.col] = EMPTY;
                this.score += 10;
                this.dotsEaten++;
                if (this.animFrame % 2 === 0) this.sound.play('chomp');
                this.addParticles(cx, cy, COLORS.donutPink, 3);
                this.checkExtraLife();
                this.updateHUD();
                // Spawn bonus at 70 and 170 dots
                if (this.dotsEaten === 70 || this.dotsEaten === 170) this.spawnBonus();
            } else if (cell === POWER) {
                this.maze[tile.row][tile.col] = EMPTY;
                this.score += 50;
                this.dotsEaten++;
                this.ghostsEaten = 0;
                this.comboDisplayTimer = 0;
                this.frightTimer = this.getLevelFrightTime();
                this.sound.play('power');
                // Haptic: double-pulse on power pellet pickup
                if (this.touchInput) this.touchInput.vibrate([15, 10, 25]);
                const quote = HOMER_POWER_QUOTES[Math.floor(Math.random() * HOMER_POWER_QUOTES.length)];
                this.addFloatingText(cx, cy - 10, quote, COLORS.duffGold);
                this.addParticles(cx, cy, COLORS.duffGold, 8);
                for (const g of this.ghosts) {
                    if (g.mode !== GM_EATEN) {
                        g.mode = GM_FRIGHTENED;
                        g.dir = OPP[g.dir];
                        g.speed = this.getSpeed('frightGhost');
                        g._lastDecisionTile = -1;
                    }
                }
                this.checkExtraLife();
                this.updateHUD();
            }

            if (this.dotsEaten >= this.totalDots) {
                this.state = ST_LEVEL_DONE;
                this.stateTimer = 150;
                this.sound.stopMusic();
                this.sound.play('levelComplete');
                const quote = HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)];
                const levelLabel = this.isEndlessMode()
                    ? `∞ ENDLESS ${this.currentLayout.name} ${this.level}`
                    : `${this.currentLayout.name} - Level ${this.level}`;
                this.showMessage('WOOHOO!', `${quote}<br>${levelLabel} Complete!`);
            }
        }

        spawnBonus() {
            this.bonusActive = true;
            this.bonusTimer = 600; // 10 seconds
            this.bonusPos = { x: 14 * TILE, y: 17 * TILE };
        }

        updateBonus() {
            if (this.bonusActive) {
                this.bonusTimer--;
                if (this.bonusTimer <= 0) {
                    this.bonusActive = false;
                    return;
                }
                const dx = (this.homer.x + TILE / 2) - (this.bonusPos.x + TILE / 2);
                const dy = (this.homer.y + TILE / 2) - (this.bonusPos.y + TILE / 2);
                if (Math.sqrt(dx * dx + dy * dy) < TILE * 0.8) {
                    const points = [100, 300, 500, 700, 1000][(this.level - 1) % 5];
                    this.score += points;
                    this.addFloatingText(this.bonusPos.x + TILE / 2, this.bonusPos.y, `${points}`, '#00ff00');
                    this.addParticles(this.bonusPos.x + TILE / 2, this.bonusPos.y + TILE / 2, '#ffd700', 10);
                    this.bonusActive = false;
                    this.updateHUD();
                }
            }
        }

        checkExtraLife() {
            const difficulty = getDifficultySettings();
            if (!this.extraLifeGiven && this.score >= difficulty.extraLifeThreshold) {
                this.extraLifeGiven = true;
                this.lives++;
                this.sound.play('extraLife');
                this.addFloatingText(this.homer.x + TILE / 2, this.homer.y - 10, 'EXTRA LIFE!', '#00ff00');
                this.updateHUD();
            }
        }

        // ---- GHOST AI WITH BFS PATHFINDING ----
        moveGhost(g) {
            if (g.inHouse) {
                g.exitTimer--;
                if (g.exitTimer <= 0) {
                    const doorX = 14 * TILE;
                    const doorY = 11 * TILE;
                    const dx = doorX - g.x;
                    const dy = doorY - g.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < g.speed + 2) {
                        g.x = doorX; g.y = doorY;
                        g.inHouse = false; g.dir = LEFT;
                    } else {
                        g.x += (dx / dist) * g.speed;
                        g.y += (dy / dist) * g.speed;
                    }
                }
                return;
            }

            const cx = g.x + TILE / 2;
            const cy = g.y + TILE / 2;
            const tile = this.tileAt(cx, cy);
            const tileKey = tile.col + tile.row * COLS;
            const center = this.centerOfTile(tile.col, tile.row);
            const distToCenter = Math.abs(cx - center.x) + Math.abs(cy - center.y);

            // Only make a direction decision once per tile
            if (tileKey !== g._lastDecisionTile && distToCenter < g.speed + 1) {
                g._lastDecisionTile = tileKey;
                // Snap to tile center
                g.x = center.x - TILE / 2;
                g.y = center.y - TILE / 2;

                let target;
                if (g.mode === GM_EATEN) {
                    target = { x: 14, y: 12 };
                    if (Math.abs(tile.col - target.x) + Math.abs(tile.row - target.y) <= 1) {
                        g.mode = this.frightTimer > 0 ? GM_FRIGHTENED : this.globalMode;
                        g.speed = g.mode === GM_FRIGHTENED ? this.getSpeed('frightGhost') : this.getSpeed('ghost', g);
                        g.inHouse = true;
                        g.exitTimer = 0;
                        g.x = 14 * TILE;
                        g.y = 14 * TILE;
                        g._lastDecisionTile = -1;
                        return;
                    }
                } else if (g.mode === GM_FRIGHTENED) {
                    target = null;
                } else if (g.mode === GM_SCATTER) {
                    target = { x: g.scatterX, y: g.scatterY };
                } else {
                    target = this.getChaseTarget(g);
                }

                const possible = [];
                for (let d = 0; d < 4; d++) {
                    if (d === OPP[g.dir]) continue;
                    const nc = tile.col + DX[d];
                    const nr = tile.row + DY[d];
                    if (this.isWalkable(nc, nr, g.mode === GM_EATEN)) {
                        possible.push(d);
                    }
                }

                if (possible.length === 0) {
                    g.dir = OPP[g.dir];
                } else if (possible.length === 1) {
                    g.dir = possible[0];
                } else if (g.mode === GM_FRIGHTENED) {
                    g.dir = possible[Math.floor(Math.random() * possible.length)];
                } else if (target) {
                    // Use BFS pathfinding to determine best direction
                    const nextDir = this.bfsNextDirection(tile.col, tile.row, target.x, target.y, possible, g.mode === GM_EATEN);
                    if (nextDir !== null) {
                        g.dir = nextDir;
                    } else {
                        // Fallback to direct targeting if BFS fails
                        let bestDist = Infinity, bestDir = possible[0];
                        for (const d of possible) {
                            const nc = tile.col + DX[d];
                            const nr = tile.row + DY[d];
                            const dist = (nc - target.x) ** 2 + (nr - target.y) ** 2;
                            if (dist < bestDist) { bestDist = dist; bestDir = d; }
                        }
                        g.dir = bestDir;
                    }
                } else {
                    g.dir = possible[0];
                }
            }

            g.x += DX[g.dir] * g.speed;
            g.y += DY[g.dir] * g.speed;
            if (g.x < -TILE) g.x = COLS * TILE;
            if (g.x > COLS * TILE) g.x = -TILE;
        }

        // BFS pathfinding to find optimal next direction
        bfsNextDirection(startCol, startRow, targetCol, targetRow, possibleDirs, canPassDoors) {
            // Limit search depth for performance
            const MAX_SEARCH_DEPTH = 20;
            const queue = [];
            const visited = new Set();
            const parent = new Map();

            const startKey = startCol + startRow * COLS;
            queue.push({ col: startCol, row: startRow, depth: 0 });
            visited.add(startKey);

            while (queue.length > 0) {
                const current = queue.shift();
                
                if (current.col === targetCol && current.row === targetRow) {
                    // Backtrack to find first move
                    let node = current.col + current.row * COLS;
                    while (parent.has(node)) {
                        const parentNode = parent.get(node);
                        if (parentNode === startKey) {
                            // Found the first step
                            const col = node % COLS;
                            const row = Math.floor(node / COLS);
                            for (const d of possibleDirs) {
                                if (startCol + DX[d] === col && startRow + DY[d] === row) {
                                    return d;
                                }
                            }
                        }
                        node = parentNode;
                    }
                    break;
                }

                if (current.depth >= MAX_SEARCH_DEPTH) continue;

                for (let d = 0; d < 4; d++) {
                    const nc = current.col + DX[d];
                    const nr = current.row + DY[d];
                    const key = nc + nr * COLS;
                    
                    if (!visited.has(key) && this.isWalkable(nc, nr, canPassDoors)) {
                        visited.add(key);
                        parent.set(key, current.col + current.row * COLS);
                        queue.push({ col: nc, row: nr, depth: current.depth + 1 });
                    }
                }
            }

            return null; // No path found
        }

        // ---- GHOST PERSONALITY AI (Pac-Man Style) ----
        // Sr. Burns (Blinky): Aggressive direct chaser — always targets Homer's current position
        // Bob Patiño (Pinky): Ambush — targets 4 tiles ahead of Homer's direction
        // Nelson (Inky): Calculated/unpredictable — uses vector math from Burns to Homer, doubled
        // Snake (Clyde): Patrol/flee — chases when far, flees to scatter corner when within 8 tiles
        getChaseTarget(g) {
            const hTile = this.tileAt(this.homer.x + TILE / 2, this.homer.y + TILE / 2);

            switch (g.idx) {
                // Sr. Burns (Blinky) — Direct aggressive chase
                case 0:
                    return { x: hTile.col, y: hTile.row };

                // Bob Patiño (Pinky) — Ambush: targets 4 tiles ahead of Homer
                case 1: {
                    let tx = hTile.col + DX[this.homer.dir] * 4;
                    let ty = hTile.row + DY[this.homer.dir] * 4;
                    // Clamp to maze bounds
                    tx = Math.max(0, Math.min(COLS - 1, tx));
                    ty = Math.max(0, Math.min(ROWS - 1, ty));
                    return { x: tx, y: ty };
                }

                // Nelson (Inky) — Calculated: vector from Burns to Homer, doubled
                case 2: {
                    const burns = this.ghosts[0]; // Blinky reference
                    const burnsTile = this.tileAt(burns.x + TILE / 2, burns.y + TILE / 2);
                    
                    // Get point 2 tiles ahead of Homer
                    const pivotX = hTile.col + DX[this.homer.dir] * 2;
                    const pivotY = hTile.row + DY[this.homer.dir] * 2;
                    
                    // Double the vector from Burns to pivot
                    let tx = pivotX + (pivotX - burnsTile.col);
                    let ty = pivotY + (pivotY - burnsTile.row);
                    
                    // Clamp to maze bounds
                    tx = Math.max(0, Math.min(COLS - 1, tx));
                    ty = Math.max(0, Math.min(ROWS - 1, ty));
                    return { x: tx, y: ty };
                }

                // Snake (Clyde) — Patrol/flee: chase when far, scatter when close
                case 3: {
                    const gTile = this.tileAt(g.x + TILE / 2, g.y + TILE / 2);
                    const distToHomer = Math.sqrt(
                        (gTile.col - hTile.col) ** 2 + (gTile.row - hTile.row) ** 2
                    );
                    
                    // If within 8 tiles, flee to scatter corner
                    if (distToHomer < 8) {
                        return { x: g.scatterX, y: g.scatterY };
                    }
                    // Otherwise chase Homer
                    return { x: hTile.col, y: hTile.row };
                }

                default:
                    return { x: hTile.col, y: hTile.row };
            }
        }

        checkCollisions() {
            for (const g of this.ghosts) {
                if (g.inHouse) continue;
                const dx = (this.homer.x + TILE / 2) - (g.x + TILE / 2);
                const dy = (this.homer.y + TILE / 2) - (g.y + TILE / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < TILE * 0.8) {
                    if (g.mode === GM_FRIGHTENED) {
                        g.mode = GM_EATEN;
                        g.speed = this.getSpeed('eatenGhost');
                        this.ghostsEaten++;
                        // Combo multiplier: 1x → 2x → 4x → 8x
                        const comboMultiplier = Math.min(8, Math.pow(2, this.ghostsEaten - 1));
                        const pts = 200 * comboMultiplier;
                        this.score += pts;

                        // Milestone: trigger burst, shake, and audio at 2x, 4x, 8x
                        if (COMBO_MILESTONES.includes(comboMultiplier)) {
                            this.sound.play('comboMilestone', comboMultiplier);
                            this.addParticles(g.x + TILE / 2, g.y + TILE / 2, '#ffd800', 15);
                            this.addFloatingText(g.x + TILE / 2, g.y - TILE, `${comboMultiplier}x COMBO!`, '#ffd800');
                            // Screen shake scales with milestone tier
                            this.screenShakeTimer = 12;
                            this.screenShakeIntensity = comboMultiplier <= 2 ? 3 : comboMultiplier <= 4 ? 5 : 8;
                        }
                        this.comboDisplayTimer = 120;

                        // Update best combo for this game (track multiplier value)
                        if (comboMultiplier > this.bestCombo) {
                            this.bestCombo = comboMultiplier;
                            this._saveBestCombo();
                        }

                        this.sound.play('eatGhost', this.ghostsEaten);
                        // Haptic: satisfying pulse on ghost eaten
                        if (this.touchInput) this.touchInput.vibrate([20, 10, 30]);
                        this.addFloatingText(g.x + TILE / 2, g.y, `${pts}`, '#00ffff');
                        this.addParticles(g.x + TILE / 2, g.y + TILE / 2, g.color, 6);
                        this.updateHUD();
                    } else if (g.mode !== GM_EATEN) {
                        this.state = ST_DYING;
                        this.stateTimer = 90;
                        this.sound.stopMusic();
                        this.sound.play('die');
                        // Haptic: strong buzz on ghost collision (death)
                        if (this.touchInput) this.touchInput.vibrate([50, 30, 80]);
                        return;
                    }
                }
            }
        }

        updateHUD() {
            this.scoreEl.textContent = this.score;
            if (this.isEndlessMode()) {
                this.levelEl.textContent = `∞ ENDLESS - ${this.currentLayout.name} ${this.level}`;
            } else {
                this.levelEl.textContent = `${this.currentLayout.name} - ${this.level}`;
            }
            this.highScoreEl.textContent = this.highScores.getHighScore();
            // Show best combo on HUD when player has achieved one
            if (this.bestComboEl) {
                if (this.bestCombo > 1) {
                    this.bestComboValueEl.textContent = this.bestCombo;
                    this.bestComboEl.style.display = '';
                } else {
                    this.bestComboEl.style.display = 'none';
                }
            }
            // Render donut icons for lives
            let html = '';
            for (let i = 0; i < this.lives; i++) {
                html += '<span class="donut-icon"></span> ';
            }
            this.livesIconsEl.innerHTML = html;
        }

        // ==================== RENDERING ====================
        draw() {
            // Handle cutscene rendering separately
            if (this.state === ST_CUTSCENE) {
                this.drawCutscene();
                return;
            }
            
            const ctx = this.ctx;

            // Screen shake offset
            if (this.screenShakeTimer > 0) {
                const intensity = this.screenShakeIntensity * (this.screenShakeTimer / 12);
                const sx = (Math.random() - 0.5) * 2 * intensity;
                const sy = (Math.random() - 0.5) * 2 * intensity;
                ctx.save();
                ctx.translate(sx, sy);
            }

            ctx.fillStyle = COLORS.pathDark;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

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

            // Bonus item
            if (this.bonusActive && this.bonusPos) {
                Sprites.drawBonusItem(ctx, this.bonusPos.x + TILE / 2, this.bonusPos.y + TILE / 2, this.level, this.animFrame);
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
                Sprites.drawHomer(ctx, this.homer.x, this.homer.y, this.homer.dir, this.homer.mouthAngle, TILE);
            }

            // Ghosts
            if (this.state === ST_PLAYING || this.state === ST_READY) {
                for (const g of this.ghosts) {
                    // Ghost shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.25)';
                    ctx.beginPath();
                    ctx.ellipse(g.x + TILE / 2, g.y + TILE - 1, TILE / 3, 2.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Ghost glow (subtle color aura)
                    if (g.mode !== GM_EATEN) {
                        const glowColor = g.mode === GM_FRIGHTENED ? 'rgba(80,80,255,0.15)' :
                            `rgba(${parseInt(g.color.slice(1,3),16)},${parseInt(g.color.slice(3,5),16)},${parseInt(g.color.slice(5,7),16)},0.15)`;
                        ctx.fillStyle = glowColor;
                        ctx.beginPath();
                        ctx.arc(g.x + TILE / 2, g.y + TILE / 2, TILE * 0.7, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    Sprites.drawGhost(ctx, g, this.animFrame, this.frightTimer);
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

            // Endless mode badge (pulsing infinity symbol)
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

            // Ghost names display (bottom right)
            if (this.state === ST_START || this.state === ST_READY) {
                this.drawGhostLegend(ctx);
            }

            // Restore screen shake transform
            if (this.screenShakeTimer > 0) {
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
        }

        drawDots(ctx) {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = this.maze[r][c];
                    const cx = c * TILE + TILE / 2;
                    const cy = r * TILE + TILE / 2;

                    if (cell === DOT) {
                        Sprites.drawDonut(ctx, cx, cy, this.animFrame);
                    } else if (cell === POWER) {
                        Sprites.drawDuff(ctx, cx, cy, this.animFrame);
                    }
                }
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

        // ==================== CUTSCENE SYSTEM ====================
        startCutscene(cutsceneNum) {
            this.state = ST_CUTSCENE;
            this.cutsceneNum = cutsceneNum;
            this.cutsceneData = CUTSCENES[cutsceneNum];
            this.cutsceneFrame = 0;
            this.cutsceneActors = [];
            this.hideMessage();
            
            // Play cutscene jingle or keep music
            this.sound.play('levelComplete');
        }

        updateCutscene() {
            this.cutsceneFrame++;
            
            // Process timeline events at current frame
            const events = this.cutsceneData.timeline.filter(e => e.frame === this.cutsceneFrame);
            for (const event of events) {
                this.processCutsceneEvent(event);
            }
            
            // Update all actors
            for (const actor of this.cutsceneActors) {
                if (actor.vx !== undefined) actor.x += actor.vx;
                if (actor.vy !== undefined) actor.y += actor.vy;
            }
            
            // Check if cutscene is complete
            if (this.cutsceneFrame >= this.cutsceneData.duration) {
                this.endCutscene();
            }
        }

        processCutsceneEvent(event) {
            const {action, params} = event;
            
            switch(action) {
                case 'homer':
                    this.cutsceneActors.push({
                        type: 'homer',
                        x: params.x,
                        y: params.y,
                        vx: params.vx || 0,
                        vy: params.vy || 0,
                        dir: params.dir !== undefined ? params.dir : RIGHT,
                        mouthAngle: 0.3
                    });
                    break;
                    
                case 'donut':
                    this.cutsceneActors.push({
                        type: 'donut',
                        x: params.x,
                        y: params.y,
                        vx: params.vx || 0,
                        vy: params.vy || 0
                    });
                    break;
                    
                case 'ghost':
                    this.cutsceneActors.push({
                        type: 'ghost',
                        idx: params.idx,
                        x: params.x,
                        y: params.y,
                        vx: params.vx || 0,
                        vy: params.vy || 0,
                        mode: GM_CHASE,
                        dir: LEFT
                    });
                    break;
                    
                case 'burns':
                    this.cutsceneActors.push({
                        type: 'burns',
                        x: params.x,
                        y: params.y,
                        vx: params.vx || 0,
                        vy: params.vy || 0,
                        dir: params.vx < 0 ? LEFT : RIGHT
                    });
                    break;
                    
                case 'nelson':
                    this.cutsceneActors.push({
                        type: 'nelson',
                        x: params.x,
                        y: params.y,
                        vx: 0,
                        vy: 0,
                        dir: LEFT
                    });
                    break;
                    
                case 'duff':
                    this.cutsceneActors.push({
                        type: 'duff',
                        x: params.x,
                        y: params.y
                    });
                    break;
                    
                case 'text':
                    this.cutsceneActors.push({
                        type: 'text',
                        text: params.text,
                        x: params.x,
                        y: params.y,
                        fontSize: params.fontSize || 16,
                        lifetime: 120
                    });
                    break;
                    
                case 'reverse':
                    // Reverse all actor velocities and directions
                    for (const actor of this.cutsceneActors) {
                        if (actor.vx) actor.vx = -actor.vx;
                        if (actor.vy) actor.vy = -actor.vy;
                        if (actor.dir !== undefined) {
                            actor.dir = OPP[actor.dir];
                        }
                    }
                    break;
                    
                case 'power':
                    // Add power effect to Homer
                    for (const actor of this.cutsceneActors) {
                        if (actor.type === 'homer') {
                            actor.powered = true;
                        }
                    }
                    this.sound.play('power');
                    break;
                    
                case 'scatter':
                    // Make all ghosts run away
                    for (const actor of this.cutsceneActors) {
                        if (actor.type === 'ghost') {
                            actor.mode = GM_FRIGHTENED;
                            actor.vx = -4;
                        }
                    }
                    break;
            }
        }

        drawCutscene() {
            const ctx = this.ctx;
            
            // Black background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            
            // Draw all actors
            for (const actor of this.cutsceneActors) {
                switch(actor.type) {
                    case 'homer':
                        Sprites.drawHomer(ctx, actor.x, actor.y, actor.dir, actor.mouthAngle, TILE);
                        // Power glow effect
                        if (actor.powered) {
                            ctx.strokeStyle = '#ffd800';
                            ctx.lineWidth = 3;
                            ctx.globalAlpha = 0.5 + Math.sin(this.cutsceneFrame * 0.2) * 0.3;
                            ctx.beginPath();
                            ctx.arc(actor.x + TILE/2, actor.y + TILE/2, TILE, 0, Math.PI * 2);
                            ctx.stroke();
                            ctx.globalAlpha = 1;
                        }
                        break;
                        
                    case 'donut':
                        Sprites.drawDonut(ctx, actor.x, actor.y, this.cutsceneFrame);
                        break;
                        
                    case 'ghost':
                        const ghost = {
                            idx: actor.idx,
                            x: actor.x,
                            y: actor.y,
                            dir: actor.dir,
                            mode: actor.mode
                        };
                        Sprites.drawGhost(ctx, ghost, this.cutsceneFrame, actor.mode === GM_FRIGHTENED ? 100 : 0);
                        break;
                        
                    case 'burns':
                        const r = TILE / 2 - 1;
                        Sprites._drawBurns(ctx, actor.x + TILE/2, actor.y + TILE/2, r, actor.dir, this.cutsceneFrame);
                        break;
                        
                    case 'nelson':
                        const rn = TILE / 2 - 1;
                        Sprites._drawNelson(ctx, actor.x + TILE/2, actor.y + TILE/2, rn, actor.dir, this.cutsceneFrame);
                        break;
                        
                    case 'duff':
                        Sprites.drawDuff(ctx, actor.x, actor.y, this.cutsceneFrame);
                        break;
                        
                    case 'text':
                        if (actor.lifetime > 0) {
                            ctx.font = `bold ${actor.fontSize}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.fillStyle = '#ffd800';
                            ctx.strokeStyle = '#000';
                            ctx.lineWidth = 3;
                            ctx.strokeText(actor.text, actor.x, actor.y);
                            ctx.fillText(actor.text, actor.x, actor.y);
                            actor.lifetime--;
                        }
                        break;
                }
            }
            
            // "Press any key to skip" hint
            if (this.cutsceneFrame > 30) {
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillText('Press any key to skip', CANVAS_W / 2, CANVAS_H - 20);
            }
        }

        skipCutscene() {
            this.endCutscene();
        }

        endCutscene() {
            this.cutsceneActors = [];
            this.level++;
            this.initLevel();
            this.state = ST_READY;
            this.stateTimer = 150;
            this.showMessage(this._levelTitle(), HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)]);
            this.updateHUD();
        }

        // Returns level title with endless mode indicator
        _levelTitle() {
            if (this.isEndlessMode()) {
                return `∞ ENDLESS - ${this.currentLayout.name} ${this.level}`;
            }
            return `${this.currentLayout.name} - Level ${this.level}`;
        }

        // ==================== GAME LOOP ====================
        loop() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.loop());
        }
    }
