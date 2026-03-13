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

<!-- Append new learnings below. Each entry is something lasting about the project. -->
