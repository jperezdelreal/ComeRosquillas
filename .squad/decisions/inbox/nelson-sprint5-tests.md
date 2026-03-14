# Decision: Sprint 5 Test-First Approach

**Date:** 2026-03-14
**Author:** Nelson (Tester)
**PR:** #100

## Decision

Write proactive test suites for #92 (Power-Up Variety) and #94 (Screen Shake & Camera Juice) *before* implementations land, using the same self-contained pattern as previous sprints.

## Rationale

- Establishes acceptance criteria as executable tests upfront
- Barney and Lenny can validate their implementations against these tests as they work
- Test formulas are re-implemented in-test (no production imports) — avoids Canvas/DOM/Audio deps
- Minor adjustments expected when implementations land (specific constant values, localStorage keys)

## Key Assumptions to Verify

- Power-up spawn weights: Duff 25, Chili 20, Burns 1, Donut 5, Lard Lad 10 (total 61)
- Durations: Duff 8s (480f), Chili 10s (600f), Lard Lad 5s (300f)
- Camera shake: ghost collision 5px/0.3s, combo escalation 3/5/8px, boss 10px/0.5s
- Zoom: level start 150%→100%, complete 90%, death 120%
- Auto-disable threshold: FPS < 45
- localStorage key: `comeRosquillas_cameraEffects`
