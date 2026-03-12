# Difficulty System Design Decision

**Date:** 2026-07-24  
**Author:** Barney (Game Dev)  
**Context:** Issue #24 — Difficulty Settings

## Decision: Config-Driven Difficulty Presets

**What:**
Implemented a three-tier difficulty system (Easy/Normal/Hard) as data-driven presets in `js/config.js` with localStorage persistence.

**Why:**
- **Clean separation:** Config owns the data, game logic consumes it
- **No UI coupling:** Lenny can build any UI that calls the provided API
- **Easy to extend:** New difficulty levels can be added without changing game logic
- **Testable:** Difficulty behavior is deterministic and inspectable

**Preset Design:**
Each preset includes:
- `ghostSpeedMultiplier` — affects ghost and frightened ghost speed
- `frightTimeMultiplier` — affects power pellet duration
- `extraLifeThreshold` — score required for extra life
- `name` and `description` — for UI display

**Normal Difficulty:**
Critically, Normal difficulty uses 1.0x multipliers for speed/fright and 10000pts for extra life, matching current gameplay exactly. This ensures **zero regression** for players who don't change settings.

**API Contract (for Lenny #25):**
```javascript
// Read-only exports
DIFFICULTY_PRESETS      // Object with 'easy', 'normal', 'hard' keys
getDifficultySettings() // Returns current active preset object
getCurrentDifficulty()  // Returns current level string ('easy'/'normal'/'hard')

// Mutator
setDifficulty(level)    // Saves level to localStorage, returns preset
```

**Implementation Impact:**
- `getSpeed()` multiplies ghost speeds by `difficulty.ghostSpeedMultiplier`
- `getLevelFrightTime()` multiplies fright duration by `difficulty.frightTimeMultiplier`
- `checkExtraLife()` uses `difficulty.extraLifeThreshold` instead of hardcoded 10000

**Future Extensibility:**
To add a new difficulty level (e.g., 'expert'):
1. Add preset to `DIFFICULTY_PRESETS` in config.js
2. Done. Game logic automatically supports it.

**Coordination:**
Lenny's Settings Menu will provide the UI for difficulty selection. The separation of concerns ensures both can work independently and integrate cleanly.
