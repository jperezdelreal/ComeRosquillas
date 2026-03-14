# Come Rosquillas — Architecture Guide

## Overview

The game is a Pac-Man clone themed around The Simpsons, built in vanilla JavaScript with no build system. Files are loaded via `<script>` tags in `index.html`.

## Module Structure

```
js/
├── config.js              # Constants, maze templates, difficulty settings
├── game-logic.js          # Game class — thin orchestrator (state machine, rendering, input)
├── main.js                # Entry point: new Game() on window load
├── engine/
│   ├── ai-controller.js   # Ghost AI: personalities, BFS pathfinding, mode switching, boss abilities
│   ├── audio.js           # SoundManager: Web Audio API, spatial audio, music
│   ├── collision-detector.js # Dot collection, ghost collisions, extra life checks
│   ├── entity-manager.js  # Entity spawn/update, Homer movement, power-ups, bonus items
│   ├── high-scores.js     # HighScoreManager: localStorage persistence, leaderboard
│   ├── level-manager.js   # Level transitions, difficulty curve, endless mode, cutscenes
│   ├── renderer.js        # Sprites: Homer, ghosts, dots, decorations, debug overlays
│   ├── scoring-system.js  # Score calc, combos, HUD, game stats, daily challenge integration
│   └── touch-input.js     # TouchInput: mobile swipe controls, haptic feedback
└── ui/
    ├── achievements.js    # Achievement system and badges
    ├── daily-challenge.js # Daily challenge mode
    ├── settings-menu.js   # Settings panel (difficulty, audio, debug)
    ├── share-menu.js      # Social sharing
    ├── stats-dashboard.js # Lifetime stats and leaderboard UI
    └── tutorial.js        # First-time player tutorial
```

## Load Order (index.html)

Script tags must be in this order — each file may depend on earlier ones:

1. `config.js` — constants and maze data (no dependencies)
2. `engine/audio.js` — SoundManager class
3. `ui/*` — UI components (settings, tutorial, stats, share, daily, achievements)
4. `engine/renderer.js` — Sprites class
5. `engine/high-scores.js` — HighScoreManager class
6. `engine/touch-input.js` — TouchInput class
7. `game-logic.js` — **Game class** (depends on all above)
8. `engine/entity-manager.js` — extends Game.prototype
9. `engine/collision-detector.js` — extends Game.prototype
10. `engine/scoring-system.js` — extends Game.prototype
11. `engine/level-manager.js` — extends Game.prototype
12. `engine/ai-controller.js` — extends Game.prototype
13. `main.js` — instantiates Game (must be last)

## How Modules Work

The 5 extracted modules (entity-manager, collision-detector, scoring-system, level-manager, ai-controller) use **prototype extension**:

```js
// In entity-manager.js:
Game.prototype.initEntities = function() {
    // 'this' refers to the Game instance — same as if defined inside the class
    this.homer = { ... };
    this.ghosts = GHOST_CFG.map(...);
};
```

This pattern:
- Preserves `this` context (no transformation needed)
- Methods are available on every Game instance
- Zero runtime overhead vs. inline class methods
- Modules can call any Game method via `this.methodName()`

## Module Responsibilities

### game-logic.js (Orchestrator)
- **State machine**: ST_START → ST_READY → ST_PLAYING → ST_DYING/ST_LEVEL_DONE → ST_GAME_OVER
- **Game loop**: `update()` → `draw()` → `drawDebugOverlay()` → `requestAnimationFrame`
- **Input handling**: keyboard, pause, mute, debug toggles
- **Rendering**: maze walls, dots, Homer sprite, ghost sprites, particles, floating text, camera effects
- **Utilities**: `isWalkable()`, `tileAt()`, `centerOfTile()`, `addFloatingText()`, `addParticles()`

### entity-manager.js
- `initEntities()` — create Homer + 4 ghosts (+ boss if applicable)
- `moveHomer()` — keyboard-driven movement with wall collision
- `spawnBonus()` / `updateBonus()` — mid-level bonus items
- `spawnSpecialItem()` / `collectSpecialItem()` — power-up system
- `updateActivePowerUps()` / `hasPowerUp()` — active effect management

### collision-detector.js
- `checkDots()` — dot/pellet collection, power pellet activation, level completion
- `checkCollisions()` — Homer-ghost proximity checks, ghost eating combo, death
- `checkExtraLife()` — score threshold extra life award

### scoring-system.js
- `_buildGameStats()` — session stats snapshot
- `_loadBestCombo()` / `_saveBestCombo()` — combo persistence
- `updateHUD()` — DOM updates for score, level, lives
- `_submitDailyScore()` / `_endDailyChallenge()` — daily challenge integration
- `_shareButtonHtml()` / `_challengeBannerHtml()` — UI HTML generators

### level-manager.js
- `initLevel()` — maze setup, dot counting, entity reset
- `isEndlessMode()` / `getEffectiveLevel()` / `getDifficultyRamp()` — difficulty scaling
- `getSpeed()` — per-entity speed calculation with personality modifiers
- `getLevelFrightTime()` / `getLevelModeTimers()` — timing parameters
- Cutscene system: `startCutscene()`, `updateCutscene()`, `drawCutscene()`, etc.

### ai-controller.js
- `updateGhostMode()` — scatter/chase timer, fright countdown
- `moveGhost()` — ghost pathfinding, house exit, tile-based decisions
- `bfsNextDirection()` — BFS pathfinding with cache
- `getChaseTarget()` — personality-based target selection (Burns=direct, Bob=ambush, Nelson=calculated, Snake=patrol)
- `updateBossAbilities()` / `checkBossTraps()` — boss ghost mechanics
- `setAITuning()` — runtime AI parameter adjustment

## Game States

| State | Value | Description |
|-------|-------|-------------|
| ST_START | 0 | Title screen |
| ST_READY | 1 | "Ready!" countdown |
| ST_PLAYING | 2 | Active gameplay |
| ST_DYING | 3 | Death animation |
| ST_LEVEL_DONE | 4 | Level complete animation |
| ST_GAME_OVER | 5 | Game over screen |
| ST_PAUSED | 6 | Paused |
| ST_CUTSCENE | 7 | Inter-level cutscene |
| ST_HIGH_SCORE_ENTRY | 8 | Name entry for high scores |

## Testing

```bash
npx vitest run          # Run all 597 tests
npx vitest run --watch  # Watch mode
```

Tests are in `tests/` and import constants from `tests/setup.js` (a standalone copy of config values). They test game formulas and logic in isolation — they do not instantiate the Game class.
