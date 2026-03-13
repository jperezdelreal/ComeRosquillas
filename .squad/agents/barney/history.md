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
