# Project Context

- **Owner:** joperezd
- **Project:** ComeRosquillas — Homer's Donut Quest, a Pac-Man style web arcade game
- **Stack:** Vanilla HTML/JS/Canvas, no frameworks, Astro docs site
- **Upstream:** FirstFrameStudios (subsquad)
- **Created:** 2026-07-24

## Key Files

- `index.html` — game page with canvas, HUD, touch controls
- `js/config.js` — game configuration constants
- `js/engine/audio.js` — audio system
- `js/engine/renderer.js` — canvas rendering engine
- `js/engine/high-scores.js` — high score persistence
- `js/engine/touch-input.js` — touch/mobile controls
- `js/game-logic.js` — core game logic (movement, collisions, AI)
- `js/main.js` — entry point, game loop

## Learnings

### Ghost AI Implementation (Issue #23)
**Date:** 2026-07-24  
**Context:** Improved ghost AI with BFS pathfinding and Pac-Man-style personalities

**Technical Decisions:**
- BFS pathfinding with 20-tile search depth for performance (28x31 grid = 868 tiles, BFS is O(n) and fast enough)
- Fallback to direct Euclidean distance targeting if BFS fails
- Classic Pac-Man ghost behaviors adapted to Simpsons theme:
  - Blinky (Sr. Burns): Direct aggressive chase of player's current position
  - Pinky (Bob Patiño): Ambush strategy targeting 4 tiles ahead of player's direction
  - Inky (Nelson): Calculated behavior using vector math from Blinky's position to player, doubled
  - Clyde (Snake): Patrol/flee behavior that chases when >8 tiles away, flees to scatter corner when close

**Key Files:**
- `js/game-logic.js` lines 617-832: Ghost AI, pathfinding, and personality behaviors
- `js/config.js` lines 232-236: Ghost configuration (scatter targets, start positions)

**Architecture Patterns:**
- Ghost mode system (GM_SCATTER, GM_CHASE, GM_FRIGHTENED, GM_EATEN) already existed and was preserved
- MODE_TIMERS array controls scatter/chase cycles — no changes needed
- Each ghost has scatterX/scatterY properties for scatter mode targeting
- BFS uses parent map for backtracking to find first move direction
- Personality behaviors calculate target tiles, then BFS finds optimal path to that target

**Performance Considerations:**
- BFS depth limited to 20 tiles to prevent frame drops
- Visited set prevents redundant exploration
- Ghost decisions only made once per tile center (not every frame)
- All 4 ghosts running BFS simultaneously causes no noticeable lag

**User Preferences:**
- Vanilla JS only — no frameworks, no build tools
- Self-contained modules preferred (could extract to ai-pathfinding.js if needed, but kept in game-logic.js for simplicity)
- Procedural audio only (Web Audio API)
### 2026-07-24 — Difficulty System Implementation (Issue #24)

**Architecture Pattern:**
- Difficulty system implemented as config-driven presets in `js/config.js`
- Clean API separation: config provides `DIFFICULTY_PRESETS`, `getDifficultySettings()`, `setDifficulty()`, `getCurrentDifficulty()`
- Game logic consumes difficulty settings via `getDifficultySettings()` at runtime
- Normal difficulty preserves exact current gameplay balance (no regressions)

**Key Implementation Details:**
- Ghost speed multipliers applied in `getSpeed()` method for both normal and frightened ghosts
- Fright time (power pellet duration) multiplier applied in `getLevelFrightTime()`
- Extra life threshold dynamically read from difficulty preset in `checkExtraLife()`
- Difficulty persists to localStorage with key `'comeRosquillas_difficulty'`

**Integration Point for Lenny (Settings Menu #25):**
- Lenny's UI will call `setDifficulty('easy'|'normal'|'hard')` to change difficulty
- Lenny's UI will call `getCurrentDifficulty()` to highlight active selection
- Lenny can read `DIFFICULTY_PRESETS` for display names and descriptions

**Key Files:**
- `js/config.js` — Difficulty presets, storage, getter/setter functions
- `js/game-logic.js` — Applies difficulty multipliers to speed, fright time, extra lives

### Combo Multiplier System (Issue #43)
**Date:** 2026-07-24  
**Context:** Completed combo multiplier system — most logic was already in place from prior work

**What Was Already Implemented:**
- Combo tracking (`ghostsEaten` counter, `comboDisplayTimer`, `bestCombo`, `_allTimeBestCombo`)
- Score multiplier: `200 * Math.pow(2, ghostsEaten - 1)` → 200, 400, 800, 1600
- Animated combo overlay at top-center with pulse animation
- Particle burst (15 particles) on milestone hits (2x, 4x, 8x)
- Audio sting via `SoundManager._comboMilestone()` with ascending chord arpeggios
- Combo reset on `frightTimer` expiry (line ~531)
- localStorage persistence via `COMBO_MILESTONE_STORAGE_KEY`
- Combo stat on game-over screen and high-score table

**What I Added:**
- Screen shake effect on milestones: `screenShakeTimer` + `screenShakeIntensity` with ctx.translate in draw()
- Intensity scales: 3px (2x), 5px (4x), 8px (8x), decays over 12 frames
- "Best Combo" HUD display: `#bestComboDisplay` span, shown when `bestCombo > 1`

**Key Architecture:**
- Screen shake uses save/restore pattern in draw() — safe with existing combo overlay's own save/restore
- HUD combo display uses HTML DOM (same pattern as score/level/lives), not canvas
- `HighScoreManager.addScore()` already accepts combo param (4th arg)

### Progressive Difficulty & Endless Mode (Issue #54)
**Date:** 2026-03-14  
**Context:** Implemented progressive difficulty curve for levels 1-8 and endless mode for level 9+

**Technical Decisions:**
- Compound multipliers (`Math.pow`) instead of linear scaling for smoother difficulty curves
- `getEffectiveLevel()` abstraction: levels 1-8 map directly, 9+ scale at 0.5x rate
- Speed cap at 1.8x BASE_SPEED prevents unplayable states in deep endless runs
- Fright time floor at 90 frames (~1.5s) keeps power pellets always useful
- Scatter duration floor at 60 frames (1s) maintains strategic breathing room

**Key Architecture:**
- All difficulty params in `config.js` as `DIFFICULTY_CURVE` and `ENDLESS_MODE` objects
- `isEndlessMode()` and `_levelTitle()` helpers centralize endless mode checks
- Existing `getDifficultyRamp()` now routes through `getEffectiveLevel()`
- `DIFFICULTY_PRESETS` (Easy/Normal/Hard) multiply on top of the progressive curve
- Maze rotation via `getMazeLayout()` already cycles — no changes needed for endless

**Integration Points:**
- HUD shows `∞ ENDLESS - {maze} {level}` when in endless mode
- Canvas badge renders pulsing `∞ ENDLESS` overlay during gameplay
- High score table marks endless entries with `∞` prefix
- Level transitions, cutscenes, and combo system all work beyond level 8

**Key Files:**
- `js/config.js` lines 244-264: DIFFICULTY_CURVE and ENDLESS_MODE constants
- `js/game-logic.js`: isEndlessMode(), getEffectiveLevel(), updated getDifficultyRamp(), getSpeed(), getLevelFrightTime(), getLevelModeTimers(), _levelTitle()

### Audio Feedback & Juice Upgrade (Issue #55)
**Date:** 2026-07-25  
**Context:** Full audio juice upgrade — pitch variation, spatial audio, ducking, dynamic music

**Technical Decisions:**
- Chomp pitch progression uses semitone-based scaling (`Math.pow(2, streak * 0.5 / 12)`) with streak decay after 600ms
- Spatial audio via `StereoPannerNode` (not full PannerNode) for simplicity and broad compatibility
- Ghost proximity uses persistent oscillator nodes (created lazily, never destroyed) — avoids rapid-fire node creation
- Audio ducking uses `GainNode` automation (`cancelScheduledValues` + `linearRampToValueAtTime`) for glitch-free transitions
- Fright mode music: entirely different melody patterns in A3 range, sawtooth timbre, -200 cents detune, heavier bass
- Music tempo scaling uses `loopDur = 4.0 / tempo` — compresses note timing, not pitch
- All tuning constants centralized in `AUDIO_JUICE` config object for easy iteration

**Architecture Patterns:**
- `_nominalMusicVol` tracks the "intended" music volume, separate from ducked/muted states
- `_baseLevelTempo` stores the level-derived tempo so fright mode can restore it on exit
- `_spatialBus` is a separate gain node from `_sfxBus` — can be muted independently
- `startPowerHum()`/`stopPowerHum()` manage a persistent LFO-modulated oscillator
- `setFrightMode(active)` coordinates tempo, power hum, and melody selection in one call

**Integration Points:**
- `updateSpatial()` called every 6 frames from game loop (throttled for performance)
- `setLevelTempo()` called on game start and each level advance
- `setFrightMode(true/false)` called on power pellet pickup and fright timer expiry
- `stopMusic()` automatically stops power hum and resets fright state
- `toggleMute()` now also mutes/unmutes spatial bus

**Key Files:**
- `js/config.js`: AUDIO_JUICE constants
- `js/engine/audio.js`: SoundManager — spatial, ducking, tempo, fright mode
- `js/game-logic.js`: Integration hooks (updateSpatial, setLevelTempo, setFrightMode)

### Performance Optimization & Visual Polish (Issue #70)
**Date:** 2026-03-14  
**Context:** Performance pass targeting 60fps on iPhone SE 2020 + visual polish

**Technical Decisions:**
- BFS pathfinding cache: `Map` keyed on `"startCol,startRow,targetCol,targetRow"`, invalidated every 3 frames (`PERF_CONFIG.bfsCacheTTL`). Prevents 4 ghosts redundantly BFS-ing the same paths each frame.
- Particle object pool: Pre-allocates 100 `{active: false}` particles. `addParticles()` finds inactive slots, `update()` marks dead particles `active: false` for reuse — zero GC churn.
- Batch dot rendering: Collects all DOT positions into flat array, all POWER positions into object array, then draws in two passes.
- Offscreen culling: Ghosts outside canvas bounds (`< -TILE*2` or `> CANVAS_W+TILE`) skip shadow, glow, and sprite rendering.
- FPS counter: `Float64Array` ring buffer of 60 frame deltas (`performance.now()`), averaged every 30 frames, rendered in dev mode.
- Smooth camera shake: Sine/cosine-based (`sin(frame*1.1)`, `cos(frame*1.7)`) with decay, replacing random jitter.
- Donut rotation: `ctx.rotate(animFrame * 0.015)` with save/restore. Coordinates shifted to origin-centered drawing.
- Ghost eye tracking: `_eyeDirToward()` computes unit vector from ghost center to Homer, returns `{lookX, lookY}` for smooth analog eye movement. `_eyeOffset()` adapter handles both int dir and tracking object.
- Level transition wipe: Circular iris wipe using `ctx.arc()` with `evenodd` fill rule, progress mapped from `_wipeTimer`.

**Architecture Patterns:**
- `PERF_CONFIG` in config.js centralizes all performance tuning constants
- `_eyeOffset()` static helper abstracts int direction vs eye-tracking object for backward compat
- Particle pool avoids `Array.filter()` — uses explicit loop with `aliveParticles` push pattern
- Game loop tracks `_lastFrameTime` and writes to FPS ring buffer each frame

**Key Files:**
- `js/config.js`: PERF_CONFIG constants
- `js/engine/renderer.js`: Donut rotation, ghost eye tracking (`_eyeDirToward`, `_eyeOffset`), drawGhost homer param
- `js/game-logic.js`: BFS cache, particle pool, batch dot rendering, smooth shake, FPS counter, iris wipe, offscreen culling

### Ghost Personality Debug Mode (Issue #68)
**Date:** 2026-03-14  
**Context:** Debug overlay system for ghost AI visualization and runtime tuning

**Technical Decisions:**
- Debug overlay as separate render pass (`drawDebugOverlay()`) called after `draw()` — zero perf cost when `_debugOverlay` is false
- Breadcrumb tracking throttled to every 6 frames, capped at 12 points (`GHOST_DEBUG.maxBreadcrumbs`)
- AI tuning applied at runtime via `setAITuning()` — recomputes mode timers and ghost speeds immediately
- Dev console uses ring buffer FPS display already computed by game loop
- Collision checks tracked per-frame via counter in `checkCollisions()`

**Architecture Patterns:**
- `GHOST_DEBUG` config in config.js centralizes mode colors, labels, icons, overlay alpha values
- `AI_TUNING_DEFAULTS` + `loadAITuning()`/`saveAITuning()` handle localStorage persistence
- Renderer: All debug drawing methods are static on `Sprites` class (personality indicators, labels, lines, breadcrumbs, dev console)
- Bidirectional sync: D key and ~ key toggle debug state AND update settings menu; settings menu toggles update game state
- `_getGhostTarget()` reuses `getChaseTarget()` for consistent target visualization

**Personality Indicators:**
- Burns (idx 0): Crosshair reticle at target tile — visualizes direct aggressive targeting
- Bob Patiño (idx 1): Speed lines trailing behind — shows ambush movement speed
- Nelson (idx 2): Zigzag path preview to target — illustrates calculated/unpredictable vectors
- Snake (idx 3): Speed variance % badge — displays runtime speed delta from baseline

**AI Tuning Sliders:**
- Aggression (0.5–2.0): Multiplier on ghost chase speed in `getSpeed('ghost')`
- Chase Distance (4–16): Snake flee threshold in `getChaseTarget()` case 3
- Scatter Multiplier (0.25–3.0): Scales scatter timer durations in `getLevelModeTimers()`

**Key Files:**
- `js/config.js`: GHOST_DEBUG, AI_TUNING_DEFAULTS, AI_TUNING_STORAGE_KEY, loadAITuning(), saveAITuning()
- `js/engine/renderer.js`: Sprites.drawGhostDebugLabel, drawTargetLine, drawTargetTile, drawBurnsCrosshair, drawBobSpeedLines, drawNelsonZigzag, drawSnakeSpeedBadge, drawBreadcrumbs, drawDevConsole
- `js/game-logic.js`: _debugOverlay, _devConsole, _ghostBreadcrumbs, _aiTuning, _getGhostTarget(), setAITuning(), drawDebugOverlay()
- `js/ui/settings-menu.js`: Debug toggle, dev console toggle, AI tuning sliders, _syncDebugToGame(), _syncAITuning(), resetAIDefaults()

### Power-Up Variety System (Issue #92)
**Date:** 2026-07-25  
**Context:** Full data-driven power-up system with 5 special item types

**Technical Decisions:**
- New cell type `SPECIAL_ITEM = 6` for maze grid placement (walkable, non-dot)
- `POWER_UP_TYPES` array in config.js is fully data-driven — add new items by adding entries
- Weighted probability system: `getRandomPowerUpType()` uses cumulative weight rolls
- One special item spawns per level at 40% dots eaten, placed on random EMPTY tile 5+ tiles from Homer
- Active power-ups stored in `_activePowerUps[]` array with timer countdown per frame
- Speed effects recalculate via existing `getSpeed()` method — no special-casing in movement code
- Invincibility handled in `checkCollisions()` — bounces ghosts instead of triggering death
- Burns Token uses counter pattern (`_burnsTokens`) — collect 3 for extra life, resets after reward

**Architecture Patterns:**
- Config-driven item definitions: type, duration, probability, points, colors, effect, effectValue
- Effect types map to switch cases in `collectSpecialItem()` — extensible pattern
- Timer bars rendered in canvas draw() loop, not DOM — consistent with existing HUD approach
- `hasPowerUp(effectId)` utility for checking active effects anywhere in game logic
- Combo stacking: `POWER_UP_COMBOS` object defines cross-item synergies
- Audio: `_specialItemSfx()` switches on effect type for unique sounds per item
- Visual effects: motion blur trail (speed), rainbow aura (invincibility), heat particles (slow)

**Key Files:**
- `js/config.js`: POWER_UP_TYPES, SPECIAL_ITEM, getRandomPowerUpType(), POWER_UP_COMBOS
- `js/game-logic.js`: updateSpecialItems, spawnSpecialItem, collectSpecialItem, updateActivePowerUps, hasPowerUp, draw() HUD timers + visual effects
- `js/engine/renderer.js`: Sprites.drawSpecialItem() with per-type canvas sprites
- `js/engine/audio.js`: _specialItemSfx(), _powerUpWarning()
- `js/engine/high-scores.js`: totalItemsCollected in lifetime stats

### PR #102 Review Fixes (Issue #92)
**Date:** 2026-07-25  
**Context:** Fixed 4 bugs flagged by Moe's code review on the power-up PR

**Fixes Applied:**
- `getSpeed()` now checks `_activePowerUps` and applies `effectValue` multipliers for speed_boost (2x Homer) and slow_ghosts (0.5x ghosts) — previously returned normal speed ignoring active power-ups
- `checkCollisions()` now has `hasPowerUp('invincibility')` guard before death — Lard Lad's invincibility was tracked but never checked
- `_specialItemSpawned` resets to `false` in `initLevel()` — was stuck `true` after first level, blocking all future spawns
- Removed center-screen duplicate power-up timer bars, kept top-right HUD version
- Removed all boss ghost dead code: `BOSS_GHOSTS`, `getBossForLevel()`, `ST_BOSS_INTRO`, `createBossGhost()`, and ghost personality props (`laughTimer`, `wobbleOffset`, `speedVariation`) — belongs in issue #96

**Key Lesson:** Power-up effects that modify speeds must be wired into the central `getSpeed()` method, not just tracked in arrays. Level-scoped flags like `_specialItemSpawned` need explicit resets in level init.

<!-- Append new learnings below. Each entry is something lasting about the project. -->
