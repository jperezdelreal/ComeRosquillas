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

<!-- Append new learnings below. Each entry is something lasting about the project. -->
