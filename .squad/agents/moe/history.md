# Project Context

- **Owner:** joperezd
- **Project:** ComeRosquillas — Homer's Donut Quest, a Pac-Man style web arcade game
- **Stack:** Vanilla HTML/JS/Canvas, no frameworks, Astro docs site
- **Upstream:** FirstFrameStudios (subsquad)
- **Created:** 2026-07-24

## Key Files

- `index.html` — game page with canvas, HUD, touch controls
- `js/config.js` — game configuration constants
- `js/engine/audio.js` — audio system
- `js/engine/renderer.js` — canvas rendering engine
- `js/engine/high-scores.js` — high score persistence
- `js/engine/touch-input.js` — touch/mobile controls
- `js/game-logic.js` — core game logic (movement, collisions, AI)
- `js/main.js` — entry point, game loop
- `docs/` — Astro documentation site

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### Sprint Planning Ceremony — Kickoff (2026-07-24)

**Sprint Breakdown (3 sprints, 4-6 weeks):**
- **Sprint 1:** Core Quality & Replayability (Ghost AI, Difficulty, Settings, Tests)
- **Sprint 2:** Content & Polish (New mazes, touch refinement, animations, tutorial)
- **Sprint 3:** Community & Launch Prep (Leaderboard, polish pass, optimization)

**Issues Created:**
- #22 — [ROADMAP] Full sprint overview (squad:moe, p2)
- #23 — Ghost AI Tuning (squad:barney, sprint:1, p1)
- #24 — Difficulty Settings (squad:barney, sprint:1, p1)
- #25 — Settings Menu (squad:lenny, sprint:1, p1)
- #26 — Test Infrastructure (squad:nelson, sprint:1, p2)

**Architecture Decisions:**
- Maintain vanilla JS/Canvas approach — no frameworks or build tools
- Modular design: settings-menu.js, ai-pathfinding.js as new modules
- Preserve procedural audio commitment (no external files)
- Test infrastructure with lightweight framework (browser-compatible)

**Sprint 1 Strategy:** Focus on gameplay quality improvements rather than new content. Ghost AI and difficulty settings add the most replayability value. Settings menu provides player control. Tests enable confident iteration going forward.
