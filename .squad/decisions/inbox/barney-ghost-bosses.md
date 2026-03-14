# Boss Ghost Architecture Decision

**Date:** 2026-03-14  
**Author:** Barney (Game Dev)  
**Issue:** #96 — Ghost Personality Enhancements & Boss Ghosts  

## Decision: Boss Ghosts as Extended Ghost Entities

Boss ghosts are spawned as additional entries in the existing `ghosts[]` array rather than a separate entity system. This means:

- Boss uses the same `moveGhost()`, `checkCollisions()`, and `getChaseTarget()` code paths
- Boss-specific behavior is guarded by `g.isBoss` checks
- HP system adds `bossHp`/`bossMaxHp` properties to the ghost object
- Abilities run in a separate `updateBossAbilities()` method called from the main game loop

**Why not a separate system?**  
The ghost AI, collision detection, and rendering pipelines are well-tested and feature-rich (BFS pathfinding, spatial audio, debug overlays, combo system). Reusing them avoids duplicating ~200 lines of movement and collision code and ensures bosses automatically benefit from difficulty scaling, power-up interactions, and camera effects.

**Integration points for the team:**
- `GHOST_PERSONALITY_VISUALS` in config.js — Lenny can reference these for settings menu personality toggle
- `BOSS_CONFIG` in config.js — Nelson can write boss-specific test cases against these constants
- Boss audio (`bossIntro`, `bossDefeat`, `krustyLaugh`) — new play() types in SoundManager
- `getBossForLevel(level)` — returns boss config or null, useful for any level-aware system

**Status:** Implemented in PR #105
