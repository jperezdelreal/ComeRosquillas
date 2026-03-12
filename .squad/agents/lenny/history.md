# Project Context

- **Owner:** joperezd
- **Project:** ComeRosquillas — Homer's Donut Quest, a Pac-Man style web arcade game
- **Stack:** Vanilla HTML/JS/Canvas, no frameworks, Astro docs site
- **Upstream:** FirstFrameStudios (subsquad)
- **Created:** 2026-07-24

## Key Files

- `index.html` — game page with canvas, HUD, touch controls, CSS
- `js/engine/touch-input.js` — touch/mobile controls
- `js/engine/audio.js` — Web Audio API procedural sound system with master/music/sfx bus architecture
- `js/game-logic.js` — main game loop and state machine
- `js/ui/settings-menu.js` — settings overlay UI module
- `docs/` — Astro documentation site

## Learnings

### Settings Menu Implementation (Issue #25)

**Architecture decisions:**
- Created modular `js/ui/` directory for UI-specific modules (settings-menu.js)
- Settings overlay uses vanilla CSS modal pattern with backdrop-filter blur
- localStorage key: `comeRosquillasSettings` stores all user preferences
- Settings menu gracefully handles missing Barney APIs (difficulty system) with typeof checks

**Audio volume control integration:**
- Audio system uses three-tier bus architecture: `_masterGain` → `_sfxBus` / `_musicBus` → destination
- Master volume: controls `_masterGain.gain.value` (0-1 scale)
- Music volume: controls `_musicBus.gain.value` (base 0.07, scaled by percentage)
- SFX volume: controls `_sfxBus.gain.value` (base 0.8, scaled by percentage)
- Music toggle: uses `setValueAtTime()` for smooth transitions, with fallback to direct assignment

**UI patterns:**
- Settings button: fixed position top-left, yellow donut theme (#ffd800)
- Keyboard shortcuts: S key opens settings from start/pause screens, Escape closes, Tab navigation
- Responsive design: modal scales to 95% width on mobile, stacks controls vertically
- Accessibility: ARIA labels, keyboard navigation, focus management with setTimeout for modal mount

**Integration points:**
- Game class: initialize SettingsMenu in constructor after setupInput()
- Settings button: attach click listener to `#settingsBtn` element
- Difficulty coordination: calls `setDifficulty(level)` and `getCurrentDifficulty()` if Barney's API exists

**CSS organization:**
- All settings styles in index.html `<style>` block (no external CSS files)
- Follows game aesthetic: purple gradients (#2d1b69 → #1a0a2e), yellow accents (#ffd800)
- Custom slider styling: `-webkit-slider-thumb` and `-moz-range-thumb` for cross-browser support
- Custom toggle switches: checkbox with `::before` pseudo-element for sliding animation

**Key learnings for future work:**
- Always load settings-menu.js before game-logic.js in script order
- Settings overlay appends to `document.body`, not `#gameContainer` (z-index independence)
- localStorage persistence happens on every change (no manual save step needed)
- Audio bus values must be set via `setValueAtTime()` in AudioContext to avoid console warnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
