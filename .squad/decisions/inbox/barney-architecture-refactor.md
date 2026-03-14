# Architecture Refactor Decision — Game Module Pattern

**Date:** 2026-03-14  
**Decided by:** Barney (Game Dev)  
**Context:** Issue #97 — Code Architecture Refactor

## Decision: Prototype Extension Pattern for Module Extraction

**Approach chosen:** `Game.prototype.method = function() {}` in separate files, loaded via `<script>` tags after `game-logic.js`.

**Why not ES6 classes with dependency injection (as originally spec'd):**
- Project uses no build tools, no ES modules — global script tags only
- Converting to separate classes would require passing all game state via constructor/method params
- Every `this.xyz` reference would need changing to `this.game.xyz` — high risk for a "no feature changes" refactor
- Prototype extension achieves the same organizational goal with zero transformation risk

**Impact on team:**
- **Lenny:** Rendering code still in game-logic.js (draw, drawMaze, etc.) — could be extracted to renderer in future
- **Nelson:** Tests pass unchanged — prototype methods are transparent to test harness
- **Moe:** New modules follow existing pattern (same as settings-menu.js, touch-input.js, etc.)

**Script load order matters:** Module files MUST load after `game-logic.js` and before `main.js`. Order within modules doesn't matter (they all extend the same prototype).

**Status:** Complete — PR #110 open
