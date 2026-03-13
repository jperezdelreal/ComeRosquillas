# Nelson: Test Patterns for ComeRosquillas

**Date:** 2026-03-13  
**Author:** Nelson (Tester)  
**Context:** Sprint 2 QA work (Issue #45)

## Pattern: Isolated Logic Testing Without DOM

Since the game uses Canvas 2D with no framework, we can't easily unit-test rendering. Instead, we extract and re-implement core math/logic in test files and validate against expected values.

**Examples:**
- Ghost personality targeting — re-implement `getChaseTarget` switch statement
- Combo multiplier math — `Math.min(8, Math.pow(2, ghostsEaten - 1))`
- Swipe direction — compare `|dx|` vs `|dy|`
- Screen scaling — `Math.min(screenW / CANVAS_W, screenH / CANVAS_H)`

**Why:** Avoids needing to mock Canvas/AudioContext/DOM. Tests run fast (< 200ms total).

**Tradeoff:** If the real implementation changes its formula, tests won't catch drift. Mitigate by keeping formulas in `config.js` constants when possible.

## Pattern: Scaffolded Feature Tests with `describe.skip()`

For features being built in parallel branches, write `describe.skip()` blocks with:
1. Test names matching acceptance criteria
2. Comments describing what to assert
3. Ready to unskip with minimal changes when the feature lands

This lets QA work happen proactively instead of blocking on feature PRs.

## Pattern: localStorage Testing

Always:
- `localStorage.clear()` in `beforeEach` and `afterEach`
- Test corrupted data (`'NOT_JSON!!!'`, `'not-a-number'`)
- Test the "reload" pattern (write → create new manager → read)
- Test fallback to defaults on missing/invalid keys

## Recommendation for Team

When adding new game mechanics:
1. Keep formulas as named constants in `config.js` (not magic numbers in game-logic.js)
2. This makes them testable without mocking the Game class
3. Example: `COMBO_MILESTONES = [2, 4, 8]` is easily testable vs inline `[2, 4, 8]`
