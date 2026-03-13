# Audio Feedback & Juice Upgrade — Decision Log

**Date:** 2026-07-25  
**Author:** Barney (Game Dev)  
**Issue:** #55  
**PR:** #63  

## Decision: Layered Audio Architecture with Config-Driven Tuning

### What

Extended SoundManager with four new audio subsystems:
1. **Pitch variation** — chomp streak progression + random spread
2. **Spatial audio** — StereoPannerNode for ghost proximity directional hints
3. **Audio ducking** — GainNode automation to duck music during SFX
4. **Dynamic music** — tempo scaling per level + fright mode musical shift

### Why

- **Separate spatial bus** (`_spatialBus`) from SFX bus allows independent volume control and muting without affecting game SFX
- **StereoPannerNode** over full PannerNode: simpler API, broader browser support, sufficient for 2D game
- **Persistent oscillator nodes** for spatial ghosts: avoids audio context node churn on 60fps updates
- **Config-driven constants** (`AUDIO_JUICE` in config.js): enables rapid iteration without touching audio code
- **GainNode automation** for ducking: smoother than manual gain scheduling, avoids clicks/pops

### Alternative Considered

- Full 3D PannerNode — rejected, overkill for 2D tile-based game
- Creating/destroying oscillators per spatial update — rejected, would cause GC pressure and potential audio glitches
- Hardcoded ducking values in audio.js — rejected, all tuning belongs in config.js per project conventions

### Impact on Other Modules

- **Settings Menu (Lenny):** `toggleMute()` now also controls spatial bus — no changes needed in settings-menu.js since it calls `toggleMute()` through the existing API
- **Game Logic:** 3 new integration hooks added (`updateSpatial`, `setLevelTempo`, `setFrightMode`) — minimal, well-contained
- **Renderer:** No changes needed
- **Touch Input:** No changes needed

### Performance

- Spatial updates throttled to every 6 frames (10Hz at 60fps)
- No new audio nodes created per frame — all persistent
- Music loop duration scales with tempo (no extra oscillators)
- 289/289 tests pass with zero regressions

### Status

Implemented in PR #63. Ready for review.
