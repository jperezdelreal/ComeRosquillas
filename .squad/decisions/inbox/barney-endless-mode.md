# Progressive Difficulty & Endless Mode Design

**Date:** 2026-03-14  
**Author:** Barney (Game Dev)  
**Context:** Issue #54 — Progressive Difficulty Curve & Endless Mode

## Decision: Compound Scaling with Effective Level Abstraction

**What:**
Implemented progressive difficulty using compound multipliers (`Math.pow`) and an `getEffectiveLevel()` abstraction that provides a unified difficulty calculation for both curated levels (1-8) and endless mode (9+).

**Why Compound Scaling:**
- Linear scaling (`+0.06 per level`) becomes too aggressive at high levels
- Compound scaling (`* 1.025^level`) provides a natural curve that's noticeable early but diminishes in impact at higher levels
- This matches classic arcade game difficulty curves (Pac-Man, Galaga)

**Why Effective Level:**
- Single abstraction point for all difficulty calculations
- Levels 1-8 map directly (no change in behavior)
- Level 9+: `effectiveLevel = 8 + (level - 8) * 0.5`
- This means level 20 in endless feels like level 14 in terms of difficulty
- Prevents difficulty from becoming unplayable while still providing challenge

**Speed Cap Decision:**
- Cap at 1.8x BASE_SPEED (3.24 px/frame)
- At this speed, Homer still has ~4 frames to react at tile boundaries
- Higher speeds cause ghosts to "skip" tiles and break collision detection

**Fright Time Floor:**
- Minimum 90 frames (1.5 seconds at 60fps)
- Below this, players can't reliably reach and eat a ghost
- This keeps power pellets always worth pursuing

**Integration with Difficulty Presets:**
- DIFFICULTY_PRESETS multiply ON TOP of the progressive curve
- Easy mode at level 8 ≈ Normal mode at level 5
- Hard mode at level 8 ≈ Normal mode at level 11
- This creates a clean difficulty matrix: preset × level

**Future Extensibility:**
- To add new curated levels: increase `DIFFICULTY_CURVE.curatedLevels`
- To adjust endless scaling: modify `ENDLESS_MODE.endlessScalingFactor`
- To add level-specific modifiers: can overlay on `getEffectiveLevel()`

**Status:** Implemented in PR #61 (squad/54-progressive-difficulty-endless)
