# Achievement System Architecture Decision

**Date:** 2026-03-14  
**Author:** Lenny (UI Dev)  
**Context:** Issue #98 — Achievement System & Badges

## Decision: Event-Driven Achievement Manager with DOM Toasts

**What:**
Implemented AchievementManager at `js/ui/achievements.js` using an event-driven `notify(event, game)` pattern. Game-logic.js calls `notify()` at 12 key game events; the manager checks unlock conditions internally.

**Why this pattern over stat-tracking:**
- Cleaner separation: game logic doesn't need to know achievement IDs or thresholds
- Single entry point: `notify('ghost_eaten', game)` vs multiple `maxStat()`/`incrementStat()` calls
- Idempotent: safe to call `_unlock()` repeatedly — checks before acting
- Self-contained: all condition checking lives in achievements.js, not scattered across game-logic.js

**Why DOM toasts over Canvas-drawn:**
- Toasts survive game state transitions (they're above the game canvas)
- CSS animations are smoother and don't interfere with game render loop
- Easier to style, responsive, and accessible
- Confetti uses a separate fixed-position canvas overlay (not the game canvas)

**Key data stored in localStorage:**
- `comeRosquillas_achievements`: `{ unlocked: {id: timestamp}, powerUpTypes: [ids], themes: [names] }`
- Lifetime stats (ghosts, donuts, games) read from HighScoreManager — no duplication

**Impact on other modules:**
- `ACHIEVEMENT_CATEGORIES` is an array (not object) — modules iterating over it should use `for...of`
- Stats dashboard now has 3 tabs: Leaderboard, Stats, Achievements
- Share text includes badge display when achievements are unlocked

**Status:** Implemented in PR #108
