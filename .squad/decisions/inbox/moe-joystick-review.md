# Decision: Merge Virtual Analog Joystick (PR #136)

**Date:** 2025-07-16
**Author:** Moe (Lead)
**Status:** ✅ Approved & Merged

## Context

PR #136 replaced the discrete D-pad with a virtual analog joystick as the default mobile touch control. User feedback indicated the D-pad made quick turns at intersections difficult.

## Decision

Approved and squash-merged. The implementation is clean and well-structured:

- **Joystick** — atan2 angle → cardinal direction mapping with 18px dead zone and 60px radius. Multi-touch safe via touch identifier tracking.
- **Keyboard** — Completely untouched. Joystick writes to the same `game.keys[]` interface as D-pad.
- **Settings toggle** — Checkbox in Controls section with localStorage persistence. Syncs to TouchInput via `_syncControlModeToGame()`.
- **D-pad fallback** — Preserved and accessible via settings toggle using `.touch-control-hidden` CSS class.
- **i18n** — All 5 languages (EN/ES/FR/DE/PT) covered.
- **Visuals** — Donut-themed thumb (pink frosting, center hole, golden ring). On brand.

## Impact

- Default mobile control is now joystick
- D-pad still available as fallback in Settings > Controls
- No desktop impact — keyboard controls unchanged
- 10 files changed, +815/-340 lines
