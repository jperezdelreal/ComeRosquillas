// ===========================
// Come Rosquillas - EntityManager
// Extracted from game-logic.js (Issue #97)
// Handles: Entity spawn, update, lifecycle, power-ups
// ===========================

'use strict';

Game.prototype.initEntities = function() {
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
            personality: cfg.personality,
            scatterX: cfg.scatterX,
            scatterY: cfg.scatterY,
            homeX: cfg.homeX * TILE,
            homeY: cfg.homeY * TILE,
            inHouse: i > 0,
            exitTimer: Math.round(cfg.exitDelay * (1 - ramp * DIFFICULTY_CURVE.exitDelayReduction)),
            idx: i,
            isBoss: false,
            _lastDecisionTile: -1
        };
        ghost.speed = this.getSpeed('ghost', ghost);
        return ghost;
    });

    // Spawn boss ghost if applicable
    this._bossGhost = null;
    this._bossConfig = typeof getBossForLevel === 'function' ? getBossForLevel(this.level) : null;
    this._fakePellets = [];
    this._rakeTraps = [];
    this._laserBeams = [];
    this._nelsonLaughTimer = 0;
    if (this._bossConfig) {
        const bc = this._bossConfig;
        const boss = {
            x: 14 * TILE,
            y: 11 * TILE,
            dir: LEFT,
            mode: GM_CHASE,
            color: bc.color,
            name: bc.name,
            personality: 'boss',
            scatterX: 14,
            scatterY: 0,
            homeX: 14 * TILE,
            homeY: 14 * TILE,
            inHouse: false,
            exitTimer: 0,
            idx: this.ghosts.length,
            isBoss: true,
            bossId: bc.id,
            bossHp: bc.hp,
            bossMaxHp: bc.hp,
            _lastDecisionTile: -1,
            _teleportTimer: bc.teleportInterval || 0,
            _laserTimer: bc.laserInterval || 0,
            _laserActive: 0,
        };
        boss.speed = this.getSpeed('ghost', boss);
        this.ghosts.push(boss);
        this._bossGhost = boss;
        this._ghostBreadcrumbs.push([]);
    }
};

Game.prototype.moveHomer = function() {
    const h = this.homer;
    const reversed = this._isControlsReversed && this._isControlsReversed();
    if (this.keys['ArrowUp']) h.nextDir = reversed ? DOWN : UP;
    else if (this.keys['ArrowRight']) h.nextDir = reversed ? LEFT : RIGHT;
    else if (this.keys['ArrowDown']) h.nextDir = reversed ? UP : DOWN;
    else if (this.keys['ArrowLeft']) h.nextDir = reversed ? RIGHT : LEFT;

    const cx = h.x + TILE / 2;
    const cy = h.y + TILE / 2;
    const tile = this.tileAt(cx, cy);
    const center = this.centerOfTile(tile.col, tile.row);
    const distToCenter = Math.abs(cx - center.x) + Math.abs(cy - center.y);

    if (distToCenter < h.speed + 1) {
        const nextCol = tile.col + DX[h.nextDir];
        const nextRow = tile.row + DY[h.nextDir];
        if (this.isWalkable(nextCol, nextRow, false)) {
            if (h.dir !== h.nextDir) this._levelDirectionChanges++;
            h.dir = h.nextDir;
            if (h.dir === UP || h.dir === DOWN) h.x = center.x - TILE / 2;
            else h.y = center.y - TILE / 2;
            if (this.achievements && this._levelDirectionChanges >= 200) {
                this.achievements.notify('direction_change', this);
            }
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
};

Game.prototype.spawnBonus = function() {
    this.bonusActive = true;
    this.bonusTimer = 600; // 10 seconds
    this.bonusPos = { x: 14 * TILE, y: 17 * TILE };
};

Game.prototype.updateBonus = function() {
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
};

Game.prototype.updateSpecialItems = function() {
    if (typeof POWER_UP_TYPES === 'undefined') return;
    if (this._specialItemSpawned || this._specialItem) return;
    const threshold = Math.floor(this.totalDots * 0.4);
    if (this.dotsEaten >= threshold) {
        this.spawnSpecialItem();
    }
};

Game.prototype.spawnSpecialItem = function() {
    const candidates = [];
    const hTile = this.tileAt(this.homer.x + TILE / 2, this.homer.y + TILE / 2);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (this.maze[r][c] !== EMPTY) continue;
            if (r >= 11 && r <= 19 && c >= 10 && c <= 18) continue;
            if (r === 14 && (c < 6 || c > 21)) continue;
            const dist = Math.abs(hTile.col - c) + Math.abs(hTile.row - r);
            if (dist < 5) continue;
            candidates.push({ col: c, row: r });
        }
    }
    if (candidates.length === 0) return;
    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    const type = getRandomPowerUpType();
    this._specialItem = { type, col: pos.col, row: pos.row };
    this._specialItemSpawned = true;
    this.maze[pos.row][pos.col] = SPECIAL_ITEM;
};

Game.prototype.checkSpecialItemCollection = function() {
    if (!this._specialItem) return;
    const cx = this.homer.x + TILE / 2;
    const cy = this.homer.y + TILE / 2;
    const tile = this.tileAt(cx, cy);
    if (tile.col === this._specialItem.col && tile.row === this._specialItem.row) {
        this.collectSpecialItem(this._specialItem);
    }
};

Game.prototype.collectSpecialItem = function(item) {
    const type = item.type;
    const cx = item.col * TILE + TILE / 2;
    const cy = item.row * TILE + TILE / 2;
    this.maze[item.row][item.col] = EMPTY;
    this._specialItem = null;
    this._gameItemsCollected++;
    this._lastCollectedPowerUpId = type.id;
    this.sound.play('specialItem', type);
    const _dcMul = (typeof DailyChallenge !== 'undefined' && this._dailyChallenge)
        ? DailyChallenge.getScoreMultiplier(this._dailyChallenge) : 1;
    let comboMul = 1;
    if (type.effect === 'speed_boost' && this.frightTimer > 0) {
        comboMul = POWER_UP_COMBOS.duff_beer_power_pellet.scoreMultiplier;
        this._powerUpComboActive = true;
        this.addFloatingText(cx, cy - 20, POWER_UP_COMBOS.duff_beer_power_pellet.label, '#ffd800');
        this.addParticles(cx, cy, '#ffd800', 12);
        if (this.achievements) this.achievements.notify('power_up_combo', this);
    }
    switch (type.effect) {
        case 'speed_boost':
        case 'slow_ghosts':
        case 'invincibility': {
            const pts = Math.round(type.points * _dcMul * comboMul);
            this.score += pts;
            this.addFloatingText(cx, cy, `${type.emoji} ${pts}`, type.colors.primary);
            this.addParticles(cx, cy, type.colors.primary, 10);
            this._activePowerUps.push({ type, timer: type.duration, startTimer: type.duration });
            if (type.effect === 'speed_boost') this.homer.speed = this.getSpeed('homer');
            if (type.effect === 'slow_ghosts') {
                for (const g of this.ghosts) {
                    if (g.mode !== GM_EATEN) g.speed = this.getSpeed('ghost', g);
                }
            }
            break;
        }
        case 'bonus_points': {
            const [min, max] = type.effectValue;
            const bonus = Math.round((min + Math.random() * (max - min)) * _dcMul * comboMul);
            this.score += bonus;
            this.addFloatingText(cx, cy, `${type.emoji} ${bonus}!`, type.colors.secondary);
            this.addParticles(cx, cy, type.colors.primary, 15);
            this.screenShakeTimer = 10;
            this.screenShakeIntensity = 4;
            break;
        }
        case 'collect_token': {
            const pts = Math.round(type.points * _dcMul);
            this.score += pts;
            this._burnsTokens++;
            this.addFloatingText(cx, cy, `${type.emoji} ${this._burnsTokens}/${type.effectValue}`, type.colors.secondary);
            this.addParticles(cx, cy, type.colors.primary, 8);
            if (this._burnsTokens >= type.effectValue) {
                this._burnsTokens = 0;
                this.lives++;
                this.sound.play('extraLife');
                this.addFloatingText(cx, cy - 20, '💰 EXTRA LIFE!', '#ffd800');
                this.addParticles(cx, cy, '#ffd800', 20);
                this.screenShakeTimer = 15;
                this.screenShakeIntensity = 6;
            }
            break;
        }
    }
    this.addFloatingText(cx, cy - 10, type.quote, type.colors.secondary);
    if (this.touchInput) this.touchInput.vibrate([15, 10, 25]);
    this.checkExtraLife();
    this.updateHUD();
    if (this.achievements) {
        this.achievements.notify('power_up_collected', this);
        this.achievements.notify('score_update', this);
    }
};

Game.prototype.updateActivePowerUps = function() {
    if (!this._activePowerUps || this._activePowerUps.length === 0) return;
    const expired = [];
    for (let i = this._activePowerUps.length - 1; i >= 0; i--) {
        const pu = this._activePowerUps[i];
        pu.timer--;
        if (pu.timer === Math.floor(pu.startTimer * 0.25)) {
            this.sound.play('powerUpWarning');
        }
        if (pu.timer <= 0) {
            expired.push(pu);
            this._activePowerUps.splice(i, 1);
        }
    }
    for (const pu of expired) {
        this.addFloatingText(this.homer.x + TILE / 2, this.homer.y - 10, `${pu.type.emoji} expired`, '#888');
        if (pu.type.effect === 'speed_boost') this.homer.speed = this.getSpeed('homer');
        if (pu.type.effect === 'slow_ghosts') {
            for (const g of this.ghosts) {
                if (g.mode !== GM_EATEN && g.mode !== GM_FRIGHTENED) {
                    g.speed = this.getSpeed('ghost', g);
                }
            }
        }
        this._powerUpComboActive = false;
    }
};

Game.prototype.hasPowerUp = function(effectId) {
    return this._activePowerUps && this._activePowerUps.some(p => p.type.effect === effectId);
};
