# Screen Shake Pattern for Game Effects

**Date:** 2026-07-24  
**Author:** Barney (Game Dev)  
**Context:** Issue #43 — Combo Multiplier System

## Decision: Canvas-Level Screen Shake via save/restore

**What:** Screen shake is implemented using `ctx.save()` + `ctx.translate(random offset)` at the start of `draw()`, with `ctx.restore()` at the end. Two state variables control it: `screenShakeTimer` (frames remaining) and `screenShakeIntensity` (max pixel offset).

**Why:**
- No DOM manipulation needed — pure canvas approach
- Decays naturally using timer-based intensity scaling
- Safe with nested save/restore (combo overlay already uses its own)
- Easy to reuse: any game event can trigger shake by setting the two variables

**Reuse Pattern:**
```javascript
this.screenShakeTimer = 12;        // frames of shake
this.screenShakeIntensity = 5;     // max pixel offset
```

**For Lenny:** If UI overlays need to avoid shaking (e.g., HUD), they should be rendered outside the save/restore block or use HTML DOM (which is unaffected).

**Status:** Implemented in PR #46
