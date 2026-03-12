---
name: "project-conventions"
description: "Core conventions and patterns for the ComeRosquillas game codebase"
domain: "project-conventions"
confidence: "medium"
source: "observed"
---

## Context

ComeRosquillas is a Pac-Man style web arcade game using vanilla HTML/JS/Canvas 2D. No frameworks, no build tools, no bundler. The game runs directly from `index.html`. The docs site uses Astro.

## Patterns

### Vanilla Stack — No Frameworks

The game uses plain HTML, CSS, and JavaScript with Canvas 2D. No React, no Vue, no game libraries. All rendering goes through the Canvas API. Keep it simple.

### Module Organization

- `js/config.js` — All game constants (speeds, sizes, timers, colors)
- `js/engine/` — Engine-level systems (renderer, audio, touch-input, high-scores)
- `js/game-logic.js` — Core gameplay (movement, collisions, ghost AI, scoring)
- `js/main.js` — Entry point, game loop orchestration
- `index.html` — Single HTML file with inline CSS and Canvas element

### Game Loop

Uses `requestAnimationFrame` for the main loop. Target 60fps. Game state is managed via a state machine pattern (menu → playing → paused → game-over).

### Configuration

All tunable values (speeds, grid sizes, scoring values, timer durations) live in `js/config.js`. No magic numbers in game logic or rendering code.

### Error Handling

Console logging for development. No crash-on-error — the game should degrade gracefully (e.g., missing audio doesn't block gameplay).

### Code Style

- camelCase for variables and functions
- PascalCase for class names
- ES6+ features (const/let, arrow functions, template literals, modules)
- No TypeScript in game code (only in squad.config.ts and docs site)

### File Structure

```
index.html          — Game page (single HTML file)
js/config.js        — Game constants
js/engine/          — Engine modules
js/game-logic.js    — Gameplay logic
js/main.js          — Entry point
docs/               — Astro documentation site
.squad/             — Squad team state
```

## Examples

```javascript
// Config pattern — all values in config.js
export const GAME_CONFIG = {
  PLAYER_SPEED: 2,
  GHOST_SPEED: 1.5,
  TILE_SIZE: 24,
  POWER_UP_DURATION: 8000
};

// Import in game logic
import { GAME_CONFIG } from './config.js';
```

## Anti-Patterns

- **No framework dependencies** — Don't add React, Phaser, PixiJS, or any game/UI framework.
- **No build tools for the game** — The game must run without webpack, vite, or any bundler. Just open index.html.
- **No magic numbers** — Every tunable value belongs in config.js.
- **No inline styles for game elements** — CSS lives in the `<style>` block in index.html or external CSS files.
- **No TypeScript in game code** — Keep game files as plain .js with ES modules.
