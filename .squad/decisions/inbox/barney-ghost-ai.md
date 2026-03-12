# Ghost AI Pathfinding & Personalities

**Date:** 2026-07-24  
**Decided by:** Barney (Game Dev)  
**Context:** Issue #23 — Ghost AI Tuning

## Decision: BFS Pathfinding with Classic Pac-Man Personalities

### What Changed
Replaced simple direct-line ghost targeting with BFS pathfinding and implemented distinct Pac-Man-style ghost personalities.

### Technical Implementation
- **Pathfinding:** BFS algorithm with 20-tile max search depth
  - Queue-based exploration with visited set
  - Parent map for backtracking to find first move
  - Fallback to Euclidean distance if BFS fails
  - Performance: No frame drops with 4 ghosts on 28x31 grid

- **Ghost Personalities (Pac-Man Style):**
  1. **Sr. Burns (Blinky):** Aggressive direct chaser — targets Homer's current tile
  2. **Bob Patiño (Pinky):** Ambush — targets 4 tiles ahead of Homer's direction
  3. **Nelson (Inky):** Calculated — uses vector from Burns to Homer (2 tiles ahead), doubled
  4. **Snake (Clyde):** Patrol/flee — chases when >8 tiles away, flees when close

### Why This Approach
- BFS is simpler than A* and sufficient for grid-based maze navigation
- 20-tile depth balances pathfinding quality with performance
- Classic Pac-Man behaviors are well-tested for arcade game feel
- Each ghost has distinct strategic value:
  - Burns is relentless pressure
  - Pinky creates ambushes and cuts off escape routes
  - Inky is unpredictable and creates flanking scenarios
  - Snake provides dynamic threat (scary when far, relief when close)

### Preserved Systems
- Existing scatter/chase/frightened/eaten mode system
- MODE_TIMERS array for scatter↔chase cycles
- Scatter targets from GHOST_CFG config
- Speed modifiers per ghost and difficulty ramp

### Alternative Considered
Could extract BFS to separate `js/ai-pathfinding.js` module, but kept in `game-logic.js` for simplicity (only ~50 lines, single use case).

### Status
Implemented in PR #29. Ready for testing and review.
