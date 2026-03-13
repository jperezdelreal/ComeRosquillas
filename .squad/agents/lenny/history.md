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

### Tutorial & Onboarding System (Issue #42)

**Architecture decisions:**
- Created `js/ui/tutorial.js` following the established `js/ui/` modular pattern
- Tutorial overlay uses DOM elements (same as settings-menu.js), not Canvas rendering for text/buttons
- Canvas mini-illustrations embedded inside tutorial cards for animated step demonstrations
- localStorage key: `comeRosquillas_tutorialComplete` — simple boolean flag for first-visit detection

**Tutorial flow:**
- 3-step click-to-continue walkthrough: Movement → Power Pellets → Ghost Eating
- Each step has a mini Canvas animation illustrating the mechanic
- Desktop shows arrow key highlights, mobile shows swipe arrows
- "Skip Tutorial" always available (ESC on desktop, button on mobile)
- Celebration particle burst uses game's existing `addParticles()` system

**Integration points:**
- Game class: Tutorial initialized after settings menu, before `showStartScreen()`
- First-visit check: `setTimeout(() => this.tutorial.start(), 300)` gives start screen time to render
- Settings menu: `_game` reference set on SettingsMenu instance for "Show Tutorial" button access
- Tutorial.reset() clears localStorage flag and restarts the tutorial from settings menu

**CSS organization:**
- All tutorial styles added to index.html `<style>` block (following existing convention)
- Uses same color palette: purple gradients (#2d1b69), yellow accents (#ffd800), pink highlights (#ff69b4)
- Responsive breakpoint at 700px matches existing settings modal pattern
- `z-index: 2000` ensures tutorial renders above settings overlay (z-index: 1000)

**Key learnings for future work:**
- When concurrent agents share the same repo, git branch operations can race — always verify branch before committing
- Tutorial module is fully self-contained — can be loaded/unloaded without modifying core game logic
- Cross-module communication pattern: store parent reference (e.g., `_game`) rather than using globals
- Script load order: tutorial.js must load after settings-menu.js but before game-logic.js

<!-- Append new learnings below. Each entry is something lasting about the project. -->
