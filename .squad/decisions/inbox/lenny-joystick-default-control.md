# Decision: Virtual Joystick as Default Mobile Control

**Date:** 2025-07-27
**Decided by:** Lenny (UI Dev)
**Context:** User feedback that D-pad buttons are too imprecise for quick turns at maze intersections

## Decision

Default mobile touch control mode changed from D-pad to virtual analog joystick. D-pad preserved as fallback via Settings toggle.

## Rationale

- Analog joystick lets players smoothly transition between directions by dragging — no need to lift finger and find the next button
- Dead zone (18px) prevents accidental direction changes when resting thumb
- Direction changes fire immediately on sector boundary crossing — feels responsive
- D-pad still available for players who prefer discrete buttons

## Impact

- `controlMode: 'joystick'` is the new default in SettingsMenu
- localStorage key `comeRosquillas_controlMode` stores user preference
- Both controls rendered in DOM, toggled via CSS class (`.touch-control-hidden`)
- No impact on keyboard controls (desktop unaffected)

## Status

PR #136 — pending review
