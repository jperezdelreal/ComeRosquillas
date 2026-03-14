// ===========================
// Come Rosquillas - CollisionDetector
// Extracted from game-logic.js (Issue #97)
// Handles: Dot collection, ghost collisions, extra life
// ===========================

'use strict';

Game.prototype.checkDots = function() {
    const cx = this.homer.x + TILE / 2;
    const cy = this.homer.y + TILE / 2;
    const tile = this.tileAt(cx, cy);
    if (tile.col < 0 || tile.col >= COLS || tile.row < 0 || tile.row >= ROWS) return;

    const cell = this.maze[tile.row][tile.col];
    const _dailyMul = (typeof DailyChallenge !== 'undefined' && this._dailyChallenge)
        ? DailyChallenge.getScoreMultiplier(this._dailyChallenge) : 1;
    const _eventMul = (typeof PROCEDURAL_EVENTS !== 'undefined' && this._getEventScoreMultiplier)
        ? this._getEventScoreMultiplier() : 1;
    if (cell === DOT) {
        this.maze[tile.row][tile.col] = EMPTY;
        this.score += Math.round(10 * _dailyMul * _eventMul);
        this.dotsEaten++;
        this._gameDonutsEaten++;
        if (this.animFrame % 2 === 0) this.sound.play('chomp');
        this.addParticles(cx, cy, COLORS.donutPink, 3);
        this.checkExtraLife();
        this.updateHUD();
        if (this.achievements) this.achievements.notify('score_update', this);
        // Spawn bonus at 70 and 170 dots
        if (this.dotsEaten === 70 || this.dotsEaten === 170) this.spawnBonus();
    } else if (cell === POWER) {
        this.maze[tile.row][tile.col] = EMPTY;
        this.score += Math.round(50 * _dailyMul * _eventMul);
        this.dotsEaten++;
        this.ghostsEaten = 0;
        this.comboDisplayTimer = 0;
        // Apply event fright multiplier (Invincibility Rush = 3x)
        const eventFrightMul = (typeof PROCEDURAL_EVENTS !== 'undefined' && this._getEventFrightMultiplier)
            ? this._getEventFrightMultiplier() : 1;
        this.frightTimer = Math.round(this.getLevelFrightTime() * eventFrightMul);
        this.sound.play('power');
        this.sound.setFrightMode(true);
        // Camera: light pulse on power pellet
        this.triggerShake('powerPellet');
        if (typeof CAMERA_CONFIG !== 'undefined') {
            this.triggerZoom(CAMERA_CONFIG.zoom.powerPulseScale, CAMERA_CONFIG.zoom.powerPulseDuration);
        }
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
        this._noPowerPelletFrames = 0;
        if (this.achievements) this.achievements.notify('power_pellet', this);
    } else if (typeof SPECIAL_ITEM !== 'undefined' && cell === SPECIAL_ITEM) {
        this.checkSpecialItemCollection();
    }

    if (this.dotsEaten >= this.totalDots) {
        this.state = ST_LEVEL_DONE;
        this.stateTimer = 150;
        this.sound.stopMusic();
        this.sound.play('levelComplete');
        // Camera: zoom out on level complete
        if (typeof CAMERA_CONFIG !== 'undefined') {
            this.triggerZoom(CAMERA_CONFIG.zoom.levelCompleteScale, CAMERA_CONFIG.zoom.levelCompleteDuration);
        }
        const quote = HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)];
        const levelLabel = this.isEndlessMode()
            ? `Level ∞${this.level} — ${this.currentLayout.name}`
            : `Level ${this.level} — ${this.currentLayout.name}`;
        this.showMessage('WOOHOO!', `${quote}<br>${levelLabel} Complete!`);
        if (this.achievements) this.achievements.notify('level_complete', this);
    }
};

Game.prototype.checkCollisions = function() {
    this._collisionChecks = 0;
    for (const g of this.ghosts) {
        if (g.inHouse) continue;
        this._collisionChecks++;
        const dx = (this.homer.x + TILE / 2) - (g.x + TILE / 2);
        const dy = (this.homer.y + TILE / 2) - (g.y + TILE / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < TILE * 0.8) {
            if (g.mode === GM_FRIGHTENED) {
                // Boss HP system: bosses take multiple hits
                if (g.isBoss && g.bossHp > 1) {
                    g.bossHp--;
                    this.sound.play('eatGhost', 1);
                    this.addFloatingText(g.x + TILE / 2, g.y - TILE, `HP: ${g.bossHp}/${g.bossMaxHp}`, '#ff4444');
                    this.addParticles(g.x + TILE / 2, g.y + TILE / 2, g.color, 10);
                    this.triggerShake('comboMedium');
                    // Reset frightened — boss survives
                    g.mode = this.globalMode;
                    g.speed = this.getSpeed('ghost', g);
                    g._lastDecisionTile = -1;
                    continue;
                }
                g.mode = GM_EATEN;
                g.speed = this.getSpeed('eatenGhost');
                this.ghostsEaten++;
                this._gameGhostsEaten++;
                // Combo multiplier: 1x → 2x → 4x → 8x
                const comboMultiplier = Math.min(8, Math.pow(2, this.ghostsEaten - 1));
                const _dcMul = (typeof DailyChallenge !== 'undefined' && this._dailyChallenge)
                    ? DailyChallenge.getScoreMultiplier(this._dailyChallenge) : 1;
                const _evtMul = (typeof PROCEDURAL_EVENTS !== 'undefined' && this._getEventScoreMultiplier)
                    ? this._getEventScoreMultiplier() : 1;
                const pts = Math.round(200 * comboMultiplier * _dcMul * _evtMul);
                this.score += pts;

                // Milestone: trigger burst, shake, and audio at 2x, 4x, 8x
                if (COMBO_MILESTONES.includes(comboMultiplier)) {
                    this.sound.play('comboMilestone', comboMultiplier);
                    this.addParticles(g.x + TILE / 2, g.y + TILE / 2, '#ffd800', 15);
                    this.addFloatingText(g.x + TILE / 2, g.y - TILE, `${comboMultiplier}x COMBO!`, '#ffd800');
                    // Screen shake scales with milestone tier
                    const shakePreset = comboMultiplier <= 2 ? 'comboLight' : comboMultiplier <= 4 ? 'comboMedium' : 'comboHeavy';
                    this.triggerShake(shakePreset);
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
                this._levelGhostsEatenCount++;
                this._levelGhostsEaten++;

                // Achievement: ghost combo & kill tracking
                if (this.achievements) {
                    this.achievements.notify('ghost_eaten', this);
                }

                // Boss defeat bonus
                if (g.isBoss && this._bossConfig) {
                    const bossBonus = this._bossConfig.defeatPoints;
                    this.score += bossBonus;
                    this.addFloatingText(g.x + TILE / 2, g.y - TILE * 2, `BOSS DEFEATED! +${bossBonus}`, '#ffd800');
                    this.addParticles(g.x + TILE / 2, g.y + TILE / 2, '#ffd800', 25);
                    this.triggerShake('bossDefeat');
                    this.sound.play('bossDefeat');
                    this._bossGhost = null;
                    this._fakePellets = [];
                    this._rakeTraps = [];
                    this._laserBeams = [];
                }

                this.updateHUD();
            } else if (g.mode !== GM_EATEN) {
                if (this.hasPowerUp('invincibility')) continue;
                this.state = ST_DYING;
                this.stateTimer = 90;
                this.sound.stopMusic();
                this.sound.play('die');
                // Camera: medium shake + zoom on death
                this.triggerShake('ghostCollision');
                if (typeof CAMERA_CONFIG !== 'undefined') {
                    this.triggerZoom(CAMERA_CONFIG.zoom.deathScale, CAMERA_CONFIG.zoom.deathDuration);
                }
                // Haptic: strong buzz on ghost collision (death)
                if (this.touchInput) this.touchInput.vibrate([50, 30, 80]);
                this._levelHitsTaken++;
                this._consecutivePerfectLevels = 0;
                if (this.achievements) this.achievements.notify('death', this);
                return;
            }
        }
    }
};

Game.prototype.checkExtraLife = function() {
    const difficulty = getDifficultySettings();
    if (!this.extraLifeGiven && this.score >= difficulty.extraLifeThreshold) {
        this.extraLifeGiven = true;
        this.lives++;
        this.sound.play('extraLife');
        this.addFloatingText(this.homer.x + TILE / 2, this.homer.y - 10, 'EXTRA LIFE!', '#00ff00');
        this.updateHUD();
    }
};
