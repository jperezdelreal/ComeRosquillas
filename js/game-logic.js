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

            this.scoreEl = document.getElementById('scoreDisplay');
            this.levelEl = document.getElementById('levelDisplay');
            this.livesIconsEl = document.getElementById('livesIcons');
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

            // Pre-render some decorations
            this.cloudOffset = 0;

            this.currentLayout = getMazeLayout(this.level);
            this.maze = this.currentLayout.template.map(row => [...row]);

            this.setupInput();
            
            // Initialize touch input system
            if (typeof TouchInput !== 'undefined') {
                this.touchInput = new TouchInput(this);
            }
            
            this.showStartScreen();
            this.updateHUD();
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

        // ---- SCREENS ----
        showStartScreen() {
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
                </div>`;
            this.msgEl.style.display = 'block';
        }

        showMessage(title, subtitle) {
            this.msgEl.innerHTML = `<div class="title-large">${title}</div>${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}`;
            this.msgEl.style.display = 'block';
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
            this.initLevel();
            this.state = ST_READY;
            this.stateTimer = 150;
            this.sound.play('start');
            this.showMessage('&#127849; READY!', `${this.currentLayout.name} - Level ${this.level}`);
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
                    exitTimer: Math.round(cfg.exitDelay * (1 - ramp * 0.6)),
                    idx: i,
                    _lastDecisionTile: -1
                };
                ghost.speed = this.getSpeed('ghost', ghost);
                return ghost;
            });
        }

        // ---- DIFFICULTY CURVE ----
        // Returns 0..1 difficulty ramp (0 = level 1, ~1 = level 10+)
        getDifficultyRamp() {
            return Math.min(1, (this.level - 1) / 9);
        }

        // Fright time shrinks as levels increase (360 → 120 frames)
        getLevelFrightTime() {
            const ramp = this.getDifficultyRamp();
            return Math.round(FRIGHT_TIME * (1 - ramp * 0.67));
        }

        // Scatter durations shrink, chase durations grow per level
        getLevelModeTimers() {
            const ramp = this.getDifficultyRamp();
            return MODE_TIMERS.map((t, i) => {
                if (t < 0) return t; // infinite chase stays infinite
                // Even indices are scatter, odd are chase
                if (i % 2 === 0) return Math.round(t * (1 - ramp * 0.5)); // scatter shrinks
                return Math.round(t * (1 + ramp * 0.3)); // chase grows
            });
        }

        // Per-ghost speed with personality bonuses
        getSpeed(type, ghost) {
            const lvl = this.level;
            const ramp = this.getDifficultyRamp();
            if (type === 'homer') return BASE_SPEED * (1 + (lvl - 1) * 0.05);
            if (type === 'ghost') {
                let base = BASE_SPEED * (0.9 + (lvl - 1) * 0.06);
                if (ghost) {
                    // Bob Patiño is slightly faster (aggressive chaser)
                    if (ghost.idx === 1) base *= (1 + 0.05 * ramp);
                    // Snake is slightly erratic in speed
                    if (ghost.idx === 3) base *= (0.95 + Math.random() * 0.1);
                }
                return base;
            }
            if (type === 'frightGhost') return BASE_SPEED * (0.5 + ramp * 0.15);
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
                        this.state = ST_GAME_OVER;
                        this.sound.play('gameOver');
                        const quote = GAME_OVER_QUOTES[Math.floor(Math.random() * GAME_OVER_QUOTES.length)];
                        this.showMessage("D'OH!", `Game Over!<br>Score: ${this.score}<br><br>"${quote}"<br><br>Press ENTER to try again`);
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
                    this.level++;
                    this.initLevel();
                    this.state = ST_READY;
                    this.stateTimer = 150;
                    this.showMessage(`${this.currentLayout.name} - Level ${this.level}`, HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)]);
                    this.updateHUD();
                }
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
                this.frightTimer = this.getLevelFrightTime();
                this.sound.play('power');
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
                this.showMessage('WOOHOO!', `${quote}<br>${this.currentLayout.name} - Level ${this.level} Complete!`);
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
            if (!this.extraLifeGiven && this.score >= 10000) {
                this.extraLifeGiven = true;
                this.lives++;
                this.sound.play('extraLife');
                this.addFloatingText(this.homer.x + TILE / 2, this.homer.y - 10, 'EXTRA LIFE!', '#00ff00');
                this.updateHUD();
            }
        }

        // ---- GHOST AI ----
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
                    // Snake (idx 3) has a chance to ignore the target and pick randomly
                    if (g.idx === 3 && Math.random() < 0.3) {
                        g.dir = possible[Math.floor(Math.random() * possible.length)];
                    } else {
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

        // ---- GHOST PERSONALITY AI ----
        // Burns (idx 0): Strategic/Ambush — predicts Homer's path and cuts him off
        // Bob Patiño (idx 1): Aggressive — directly chases Homer, relentless
        // Nelson (idx 2): Patrol/Guard — patrols a zone, chases only when Homer is close
        // Snake (idx 3): Random/Erratic — unpredictable movements with occasional chase bursts
        getChaseTarget(g) {
            const hTile = this.tileAt(this.homer.x + TILE / 2, this.homer.y + TILE / 2);
            const ramp = this.getDifficultyRamp();

            switch (g.idx) {
                // Burns — Ambush: target well ahead of Homer to cut him off
                case 0: {
                    const lookAhead = 4 + Math.round(ramp * 4); // 4–8 tiles ahead
                    let tx = hTile.col + DX[this.homer.dir] * lookAhead;
                    let ty = hTile.row + DY[this.homer.dir] * lookAhead;
                    // Clamp to maze bounds
                    tx = Math.max(0, Math.min(COLS - 1, tx));
                    ty = Math.max(0, Math.min(ROWS - 1, ty));
                    return { x: tx, y: ty };
                }
                // Bob Patiño — Aggressive: always targets Homer's exact tile
                case 1:
                    return { x: hTile.col, y: hTile.row };

                // Nelson — Patrol: guards center zone, only chases when Homer is nearby
                case 2: {
                    const gTile = this.tileAt(g.x + TILE / 2, g.y + TILE / 2);
                    const distToHomer = Math.abs(gTile.col - hTile.col) + Math.abs(gTile.row - hTile.row);
                    const chaseRadius = 8 + Math.round(ramp * 6); // 8–14 tile radius
                    if (distToHomer <= chaseRadius) {
                        return { x: hTile.col, y: hTile.row };
                    }
                    // Patrol: cycle between zone waypoints near power pellets
                    const patrolPoints = [
                        { x: 1, y: 3 }, { x: 26, y: 3 },
                        { x: 1, y: 23 }, { x: 26, y: 23 }
                    ];
                    const cycleIdx = Math.floor(this.animFrame / 300) % patrolPoints.length;
                    return patrolPoints[cycleIdx];
                }
                // Snake — Erratic: random target with occasional bursts of chase
                case 3: {
                    // Higher levels = more frequent chase bursts
                    const chaseChance = 0.25 + ramp * 0.35; // 25%–60% chance
                    if (Math.random() < chaseChance) {
                        return { x: hTile.col, y: hTile.row };
                    }
                    // Random tile target for erratic movement
                    return {
                        x: Math.floor(Math.random() * COLS),
                        y: Math.floor(Math.random() * ROWS)
                    };
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
                        const pts = 200 * Math.pow(2, this.ghostsEaten - 1);
                        this.score += pts;
                        this.sound.play('eatGhost', this.ghostsEaten);
                        this.addFloatingText(g.x + TILE / 2, g.y, `${pts}`, '#00ffff');
                        this.addParticles(g.x + TILE / 2, g.y + TILE / 2, g.color, 6);
                        this.updateHUD();
                    } else if (g.mode !== GM_EATEN) {
                        this.state = ST_DYING;
                        this.stateTimer = 90;
                        this.sound.stopMusic();
                        this.sound.play('die');
                        return;
                    }
                }
            }
        }

        updateHUD() {
            this.scoreEl.textContent = this.score;
            this.levelEl.textContent = `${this.currentLayout.name} - ${this.level}`;
            // Render donut icons for lives
            let html = '';
            for (let i = 0; i < this.lives; i++) {
                html += '<span class="donut-icon"></span> ';
            }
            this.livesIconsEl.innerHTML = html;
        }

        // ==================== RENDERING ====================
        draw() {
            const ctx = this.ctx;
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

            // Lives mini-Homers at bottom
            for (let i = 0; i < this.lives - 1; i++) {
                Sprites.drawMiniHomer(ctx, 20 + i * 28, CANVAS_H - 16);
            }

            // Ghost names display (bottom right)
            if (this.state === ST_START || this.state === ST_READY) {
                this.drawGhostLegend(ctx);
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

        // ==================== GAME LOOP ====================
        loop() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.loop());
        }
    }
