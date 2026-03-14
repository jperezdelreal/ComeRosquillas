// ===========================
// Come Rosquillas - AIController
// Extracted from game-logic.js (Issue #97)
// Handles: Ghost personalities, BFS pathfinding, mode switching, boss abilities
// ===========================

'use strict';

Game.prototype.updateGhostMode = function() {
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
            this.sound.setFrightMode(false);
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
};

Game.prototype.moveGhost = function(g) {
    // Nelson laugh pause: skip movement while laughing
    if (g.idx === 2 && g._laughTimer > 0) {
        g._laughTimer--;
        return;
    }

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

    // Burns uses smarter BFS — recalculates every frame instead of once per tile
    const burnsBfsEveryFrame = g.idx === 0 && typeof GHOST_PERSONALITY_VISUALS !== 'undefined'
        && GHOST_PERSONALITY_VISUALS.burns.bfsInterval === 1;
    // Only make a direction decision once per tile (except Burns in chase)
    if ((tileKey !== g._lastDecisionTile || (burnsBfsEveryFrame && g.mode === GM_CHASE)) && distToCenter < g.speed + 1) {
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

    // Track breadcrumbs for debug overlay
    if (this._debugOverlay && this.animFrame % 6 === 0) {
        const crumbs = this._ghostBreadcrumbs[g.idx];
        crumbs.push({ x: g.x + TILE / 2, y: g.y + TILE / 2 });
        if (crumbs.length > GHOST_DEBUG.maxBreadcrumbs) crumbs.shift();
    }
};

Game.prototype.bfsNextDirection = function(startCol, startRow, targetCol, targetRow, possibleDirs, canPassDoors) {
    // Cache lookup: invalidate every 3 frames
    if (this.animFrame - this._bfsCacheFrame >= PERF_CONFIG.bfsCacheTTL) {
        this._bfsCache.clear();
        this._bfsCacheFrame = this.animFrame;
    }
    const cacheKey = `${startCol},${startRow},${targetCol},${targetRow}`;
    if (this._bfsCache.has(cacheKey)) {
        const cached = this._bfsCache.get(cacheKey);
        if (possibleDirs.includes(cached)) return cached;
    }

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
                            this._bfsCache.set(cacheKey, d);
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
};

Game.prototype.getChaseTarget = function(g) {
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
            
            const fleeThreshold = this._aiTuning ? this._aiTuning.chaseDistance : 8;
            if (distToHomer < fleeThreshold) {
                return { x: g.scatterX, y: g.scatterY };
            }
            // Otherwise chase Homer
            return { x: hTile.col, y: hTile.row };
        }

        default:
            return { x: hTile.col, y: hTile.row };
    }
};

Game.prototype._getGhostTarget = function(g) {
    if (g.inHouse || g.mode === GM_FRIGHTENED) return null;
    if (g.mode === GM_EATEN) return { x: 14, y: 12 };
    if (g.mode === GM_SCATTER) return { x: g.scatterX, y: g.scatterY };
    return this.getChaseTarget(g);
};

Game.prototype.setAITuning = function(profile) {
    this._aiTuning = { ...AI_TUNING_DEFAULTS, ...profile };
    if (typeof saveAITuning === 'function') saveAITuning(this._aiTuning);
    // Recompute mode timers and ghost speeds immediately
    this._levelModeTimers = this.getLevelModeTimers();
    for (const g of this.ghosts) {
        if (g.mode !== GM_FRIGHTENED && g.mode !== GM_EATEN) {
            g.speed = this.getSpeed('ghost', g);
        }
    }
};

Game.prototype.updateBossAbilities = function() {
    const boss = this._bossGhost;
    if (!boss || boss.mode === GM_EATEN || !this._bossConfig) return;

    const bc = this._bossConfig;

    // Krusty: drop fake power pellets
    if (bc.ability === 'fake_pellets' && this.animFrame % 300 === 0 && this._fakePellets.length < (bc.fakePelletCount || 3)) {
        const tile = this.tileAt(boss.x + TILE / 2, boss.y + TILE / 2);
        if (tile.col >= 0 && tile.col < COLS && tile.row >= 0 && tile.row < ROWS) {
            this._fakePellets.push({ col: tile.col, row: tile.row, life: 600 });
        }
    }

    // Sideshow Bob: teleport to random corridor
    if (bc.ability === 'teleport') {
        boss._teleportTimer = (boss._teleportTimer || bc.teleportInterval) - 1;
        if (boss._teleportTimer <= 0) {
            boss._teleportTimer = bc.teleportInterval;
            // Find random walkable tile
            const walkable = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (this.maze[r][c] === EMPTY || this.maze[r][c] === DOT) walkable.push({ c, r });
                }
            }
            if (walkable.length > 0) {
                // Leave rake trap at old position
                const oldTile = this.tileAt(boss.x + TILE / 2, boss.y + TILE / 2);
                if (this._rakeTraps.length < (bc.rakeCount || 2)) {
                    this._rakeTraps.push({ col: oldTile.col, row: oldTile.row, life: 900 });
                }
                const dest = walkable[Math.floor(Math.random() * walkable.length)];
                boss.x = dest.c * TILE;
                boss.y = dest.r * TILE;
                boss._lastDecisionTile = -1;
                this.addParticles(boss.x + TILE / 2, boss.y + TILE / 2, '#cc2222', 12);
            }
        }
    }

    // Mr. Burns Mega: fire laser projectiles
    if (bc.ability === 'laser') {
        boss._laserTimer = (boss._laserTimer || bc.laserInterval) - 1;
        if (boss._laserTimer <= 0) {
            boss._laserTimer = bc.laserInterval;
            // Fire laser in current direction
            this._laserBeams.push({
                x: boss.x + TILE / 2,
                y: boss.y + TILE / 2,
                dir: boss.dir,
                life: bc.laserDuration || 30,
            });
        }
    }

    // Update fake pellet lifetimes
    for (let i = this._fakePellets.length - 1; i >= 0; i--) {
        this._fakePellets[i].life--;
        if (this._fakePellets[i].life <= 0) this._fakePellets.splice(i, 1);
    }

    // Update rake trap lifetimes
    for (let i = this._rakeTraps.length - 1; i >= 0; i--) {
        this._rakeTraps[i].life--;
        if (this._rakeTraps[i].life <= 0) this._rakeTraps.splice(i, 1);
    }

    // Update laser beam lifetimes
    for (let i = this._laserBeams.length - 1; i >= 0; i--) {
        const beam = this._laserBeams[i];
        beam.x += DX[beam.dir] * BASE_SPEED * 3;
        beam.y += DY[beam.dir] * BASE_SPEED * 3;
        beam.life--;
        if (beam.life <= 0 || beam.x < -TILE || beam.x > CANVAS_W + TILE || beam.y < -TILE || beam.y > CANVAS_H + TILE) {
            this._laserBeams.splice(i, 1);
        }
    }
};

Game.prototype.checkBossTraps = function() {
    const hx = this.homer.x + TILE / 2;
    const hy = this.homer.y + TILE / 2;
    const hTile = this.tileAt(hx, hy);

    // Fake pellet collection (looks like power pellet but does nothing)
    for (let i = this._fakePellets.length - 1; i >= 0; i--) {
        const fp = this._fakePellets[i];
        if (hTile.col === fp.col && hTile.row === fp.row) {
            this._fakePellets.splice(i, 1);
            this.addFloatingText(hx, hy - TILE, 'FAKE!', '#ff4444');
            this.sound.play('krustyLaugh');
        }
    }

    // Rake trap collision (stuns Homer briefly)
    for (let i = this._rakeTraps.length - 1; i >= 0; i--) {
        const rake = this._rakeTraps[i];
        if (hTile.col === rake.col && hTile.row === rake.row) {
            this._rakeTraps.splice(i, 1);
            this.addFloatingText(hx, hy - TILE, 'RAKE!', '#8b4513');
            this.addParticles(hx, hy, '#8b4513', 6);
            // Brief speed penalty
            this.homer.speed *= 0.3;
            setTimeout(() => { if (this.homer) this.homer.speed = this.getSpeed('homer'); }, 1000);
        }
    }

    // Laser beam collision
    for (const beam of this._laserBeams) {
        const dx = hx - beam.x;
        const dy = hy - beam.y;
        if (Math.sqrt(dx * dx + dy * dy) < TILE * 0.6) {
            if (this.hasPowerUp('invincibility')) continue;
            this.state = ST_DYING;
            this.stateTimer = 90;
            this.sound.stopMusic();
            this.sound.play('die');
            this.triggerShake('ghostCollision');
            return;
        }
    }
};

Game.prototype.updateNelsonLaugh = function() {
    if (typeof GHOST_PERSONALITY_VISUALS === 'undefined') return;
    const nelson = this.ghosts[2];
    if (!nelson || nelson.mode === GM_EATEN || nelson.mode === GM_FRIGHTENED || nelson.inHouse) return;
    if (!nelson._laughTimer) nelson._laughTimer = 0;
    if (nelson._laughTimer <= 0 && Math.random() < GHOST_PERSONALITY_VISUALS.nelson.laughPauseChance) {
        nelson._laughTimer = GHOST_PERSONALITY_VISUALS.nelson.laughPauseDuration;
        this.addFloatingText(nelson.x + TILE / 2, nelson.y - TILE, 'HA HA!', '#ff8c00');
    }
};
