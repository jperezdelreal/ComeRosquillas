# Decision: Theme Particle Configuration Pattern

**Date:** 2026-03-14
**Decided by:** Lenny (UI Dev)
**Context:** Issue #99 — Multiple Maze Themes

## Decision

Theme-specific ambient particle configuration is stored directly in `MAZE_LAYOUTS` entries in `config.js`, using a `particles` property with the following schema:

```js
particles: {
    colors: ['#hex1', '#hex2', '#hex3'],  // 3 theme-specific colors
    style: 'float' | 'rise' | 'sparkle', // behavior type
    spawnRate: 0.02,                      // probability per frame
    sizeRange: [min, max],                // particle radius
    speedRange: [min, max],               // velocity magnitude
    lifeRange: [min, max]                 // lifetime in frames
}
```

## Rationale

- Keeps theme data centralized — one object per theme with all visual properties
- Game-logic.js particle system reads config at runtime; no duplication
- Easy to tweak per-theme feel without touching rendering code
- Graceful degradation: `if (!pcfg) return` means themes without particles still work

## Implications

- New themes must include a `particles` property
- Particle rendering uses 3 styles: float (sine-wave drift), rise (upward), sparkle (diamond shape with size flicker)
- Max 30 ambient particles at once (capped in `_updateAmbientParticles`)
