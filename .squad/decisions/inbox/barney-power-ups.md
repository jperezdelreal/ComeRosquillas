# Decision: Power-Up Variety System Architecture

**Date:** 2026-07-25  
**Author:** Barney (Game Dev)  
**Issue:** #92  
**Status:** Implemented

## Decision

Power-ups are implemented as a **data-driven config array** (`POWER_UP_TYPES` in config.js) rather than hard-coded per-item logic. Each item type is a plain object with `id`, `effect`, `effectValue`, `duration`, `probability`, `colors`, etc. The game logic switches on `effect` type, not item `id`.

## Why This Pattern

1. **Adding new items requires only a config entry** — no game-logic changes needed for items that use existing effect types (speed_boost, slow_ghosts, invincibility, bonus_points, collect_token)
2. **Weighted probability** via cumulative roll — easy to tune spawn rates by changing `probability` values
3. **New cell type `SPECIAL_ITEM = 6`** — avoids conflicting with DOT/POWER/WALL/EMPTY semantics
4. **Active effects stored in array** — supports multiple simultaneous effects and per-effect timers

## Integration Points

- **Lenny:** HUD timer bars are canvas-rendered (draw() loop), not DOM. If Lenny wants to style them differently, coordinate on rendering approach.
- **Nelson:** Test coverage needed for spawn logic edge cases (no empty tiles, token accumulation, combo stacking)
- **Settings Menu:** Could add a "Power-Ups Enabled" toggle that checks `POWER_UP_TYPES` availability

## Key Constants

- `SPECIAL_ITEM = 6` — maze cell type
- `POWER_UP_TYPES` — item definitions array
- `POWER_UP_COMBOS` — cross-item synergy rules
- Spawn threshold: 40% dots eaten per level
