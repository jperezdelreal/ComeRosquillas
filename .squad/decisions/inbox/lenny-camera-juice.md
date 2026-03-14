# Camera Juice System — Architecture Decision

**Date:** 2026-03-14
**Author:** Lenny (UI Dev)
**Issue:** #94 — Screen Shake & Camera Juice

## Decision

Camera effects extend the existing `screenShakeTimer`/`screenShakeIntensity` system via preset-based `triggerShake()` and `triggerZoom()` methods. All parameters centralized in `CAMERA_CONFIG` constant. Effects are toggleable in settings and auto-disable on low FPS (<45).

## Key Points

- **Backward compatible**: combo shakes still work via presets that map to same intensity values
- **Single transform pipeline**: zoom + follow + shake combined in one `ctx.save()/restore()` pair
- **Performance guard**: FPS monitored every 120 frames, effects disabled if sustained < 45 FPS
- **Settings persistence**: `cameraEffects` boolean stored in `comeRosquillasSettings` localStorage key
- **Cross-branch safe**: all `CAMERA_CONFIG` access guarded with `typeof !== 'undefined'`

## Impact on Other Agents

- **Barney**: new game events (boss defeat etc.) can call `this.triggerShake('ghostCollision')` for camera feedback
- **Nelson**: existing camera juice tests in `feature-camera-juice.test.js` validate math formulas independently
