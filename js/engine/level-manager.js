// ===========================
// Come Rosquillas - LevelManager
// Extracted from game-logic.js (Issue #97)
// Handles: Level transitions, maze loading, difficulty curve, endless mode, cutscenes
// ===========================

'use strict';

Game.prototype.initLevel = function() {
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
    this._specialItemSpawned = false;
    this._specialItem = null;
    this._levelHitsTaken = 0;
    this._levelGhostsEatenCount = 0;
    this._levelDirectionChanges = 0;
    this._noPowerPelletFrames = 0;

    // Achievement: track level start time and theme
    this._levelStartTime = Date.now();
    this._levelGhostsEaten = 0;
    this._noPowerTimer = 0;
    if (this._themesVisitedSet) {
        const themeIdx = (this.level - 1) % MAZE_LAYOUTS.length;
        this._themesVisitedSet.add(themeIdx);
    }
    if (this.achievements) this.achievements.notify('level_start', this);
    if (typeof a11y !== 'undefined') a11y.onLevelStart(this.level);
};

Game.prototype.isEndlessMode = function() {
    return this.level >= ENDLESS_MODE.startLevel;
};

Game.prototype.getEffectiveLevel = function() {
    if (this.level <= DIFFICULTY_CURVE.curatedLevels) {
        return this.level;
    }
    const endlessLevels = this.level - DIFFICULTY_CURVE.curatedLevels;
    return DIFFICULTY_CURVE.curatedLevels + endlessLevels * ENDLESS_MODE.endlessScalingFactor;
};

Game.prototype.getDifficultyRamp = function() {
    return Math.min(1, (this.getEffectiveLevel() - 1) / 9);
};

Game.prototype.getLevelFrightTime = function() {
    const effectiveLevel = this.getEffectiveLevel();
    const reduction = Math.pow(1 - DIFFICULTY_CURVE.frightReductionPerLevel, effectiveLevel - 1);
    const difficulty = getDifficultySettings();
    const frightTime = Math.round(FRIGHT_TIME * reduction * difficulty.frightTimeMultiplier);
    return Math.max(ENDLESS_MODE.minFrightFrames, frightTime);
};

Game.prototype.getLevelModeTimers = function() {
    const effectiveLevel = this.getEffectiveLevel();
    const scatterReduction = Math.pow(1 - DIFFICULTY_CURVE.scatterReductionPerLevel, effectiveLevel - 1);
    const chaseGrowth = Math.pow(1 + DIFFICULTY_CURVE.chaseLengtheningPerLevel, effectiveLevel - 1);
    const scatterMod = this._aiTuning ? this._aiTuning.scatterMultiplier : 1.0;
    return MODE_TIMERS.map((t, i) => {
        if (t < 0) return t;
        if (i % 2 === 0) {
            return Math.max(ENDLESS_MODE.minScatterFrames, Math.round(t * scatterReduction * scatterMod));
        }
        return Math.round(t * chaseGrowth);
    });
};

Game.prototype.getSpeed = function(type, ghost) {
    const effectiveLevel = this.getEffectiveLevel();
    const ramp = this.getDifficultyRamp();
    const difficulty = getDifficultySettings();
    const speedCap = BASE_SPEED * ENDLESS_MODE.maxSpeedMultiplier;
    
    if (type === 'homer') {
        let speed = Math.min(speedCap, BASE_SPEED * (1 + (effectiveLevel - 1) * 0.05));
        if (this.hasPowerUp('speed_boost')) {
            const pu = this._activePowerUps.find(p => p.type.effect === 'speed_boost');
            if (pu) speed *= pu.type.effectValue;
        }
        return Math.min(speedCap * 2, speed);
    }
    if (type === 'ghost') {
        const levelMultiplier = Math.pow(1 + DIFFICULTY_CURVE.ghostSpeedPerLevel, effectiveLevel - 1);
        const aggressionMod = this._aiTuning ? this._aiTuning.aggression : 1.0;
        const dailyBonus = (typeof DailyChallenge !== 'undefined' && this._dailyChallenge)
            ? 1 + DailyChallenge.getGhostSpeedBonus(this._dailyChallenge) : 1;
        let base = BASE_SPEED * 0.9 * levelMultiplier * difficulty.ghostSpeedMultiplier * aggressionMod * dailyBonus;
        if (ghost) {
            // Personality speed modifiers
            if (ghost.isBoss && this._bossConfig) {
                base *= this._bossConfig.speedMultiplier;
            } else if (ghost.idx === 1 && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                base *= GHOST_PERSONALITY_VISUALS.bob.speedMultiplier;
            } else if (ghost.idx === 1) {
                base *= (1 + 0.05 * ramp);
            }
            if (ghost.idx === 3 && typeof GHOST_PERSONALITY_VISUALS !== 'undefined') {
                const variance = GHOST_PERSONALITY_VISUALS.snake.speedVariance;
                base *= (1 - variance + Math.random() * variance * 2);
            } else if (ghost.idx === 3) {
                base *= (0.95 + Math.random() * 0.1);
            }
        }
        if (this.hasPowerUp('slow_ghosts')) {
            const pu = this._activePowerUps.find(p => p.type.effect === 'slow_ghosts');
            if (pu) base *= pu.type.effectValue;
        }
        return Math.min(speedCap, base);
    }
    if (type === 'frightGhost') {
        return Math.min(speedCap * 0.6, BASE_SPEED * (0.5 + ramp * 0.15) * difficulty.ghostSpeedMultiplier);
    }
    if (type === 'eatenGhost') return BASE_SPEED * 2;
    return BASE_SPEED;
};

Game.prototype._levelTitle = function() {
    if (this.isEndlessMode()) {
        return `∞ ENDLESS - ${this.currentLayout.name} ${this.level}`;
    }
    return `${this.currentLayout.name} - Level ${this.level}`;
};

Game.prototype.startCutscene = function(cutsceneNum) {
    this.state = ST_CUTSCENE;
    this.cutsceneNum = cutsceneNum;
    this.cutsceneData = CUTSCENES[cutsceneNum];
    this.cutsceneFrame = 0;
    this.cutsceneActors = [];
    this.hideMessage();
    
    // Play cutscene jingle or keep music
    this.sound.play('levelComplete');
};

Game.prototype.updateCutscene = function() {
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
};

Game.prototype.processCutsceneEvent = function(event) {
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
};

Game.prototype.drawCutscene = function() {
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
};

Game.prototype.skipCutscene = function() {
    this.endCutscene();
};

Game.prototype.endCutscene = function() {
    this.cutsceneActors = [];
    this.level++;
    this.initLevel();
    this.sound.setLevelTempo(this.level);
    this.state = ST_READY;
    this.stateTimer = 150;
    // Show event announcement after cutscene if an event triggered
    let levelMsg = HOMER_WIN_QUOTES[Math.floor(Math.random() * HOMER_WIN_QUOTES.length)];
    if (typeof PROCEDURAL_EVENTS !== 'undefined' && this._activeEvent) {
        this.stateTimer = PROCEDURAL_EVENTS.announceDuration;
        const evt = this._activeEvent;
        levelMsg = `${evt.emoji} <b style="color:${evt.color}">${evt.name}</b><br>${evt.description}<br><br><i>"${evt.quote}"</i>`;
    }
    this.showMessage(this._levelTitle(), levelMsg);
    this.updateHUD();
};
