# Sprint 5 Batch 1 — Code Review Decisions

**Date:** 2025-07-25
**Author:** Moe (Lead)

## Decisions

### 1. PR #101 (Camera Juice): Fix shake decay before merge
- Shake decay must use the triggering shake's duration, not max across all presets
- One-property fix: store `_shakeMaxDuration` on trigger, use it in draw decay calc
- **Owner:** Lenny

### 2. PR #102 (Power-Ups): Three bugs + scope creep must be resolved
- **Speed/slow/invincibility effects broken:** getSpeed() and collision detection don't check active power-ups. Must be wired up.
- **_specialItemSpawned not reset between levels:** Only first level spawns items. Reset in initLevel().
- **Duplicate HUD timer bars:** Remove one of the two rendering blocks (center or top-right).
- **Boss ghost system must be removed from this PR.** Not in #92 scope, zero implementation, dead code. File a separate issue for boss ghosts.
- **Owner:** Barney

### 3. PR #100 (Tests): Hold until implementations land
- Tests are proactive scaffolding — good approach, wrong time to merge
- Must update values to match actual implementations and import production code
- **Owner:** Nelson (update after #101 and #102 merge)

### 4. Merge Order
#101 → #102 → #100

## Rationale
- Camera juice (#101) is a dependency for power-ups (#102) — both PRs add CAMERA_CONFIG
- Tests (#100) should validate the actual merged code, not local approximations
- Boss system scope creep sets a bad precedent: features land in the issue they're scoped to, or they get their own issue
