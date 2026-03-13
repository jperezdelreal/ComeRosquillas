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

### Sprint 1 Code Review — PRs #27–#30 (2026-07-24)

**Reviewed 4 PRs, all approved:**

| PR | Feature | Author | Verdict |
|----|---------|--------|---------|
| #27 | Triage YAML sync (content-aware verdicts) | Nelson | ✅ Approved |
| #28 | Difficulty system (Easy/Normal/Hard) | Barney | ✅ Approved (with overlap notes) |
| #29 | Ghost AI (BFS + Pac-Man personalities) | Barney | ✅ Approved — strongest PR |
| #30 | Settings menu (audio, difficulty UI) | Lenny | ✅ Approved |

**Recommended merge order:** #27 → #29 → #28 → #30 (minimizes conflict surface)

**Cross-PR Overlap Found:**
- Nelson's history.md changes appear in PRs #27, #28, and #29 (identical content)
- BFS pathfinding code appears in both #28 and #29 (identical code)
- "S key" bottom bar hint appears in both #28 and #30
- All conflicts are trivially resolvable since the code is identical across PRs

**Architecture Observations:**
- BFS pathfinding kept in game-logic.js (not extracted to ai-pathfinding.js) — correct call for ~50 lines with single consumer
- js/ui/ directory established by Lenny — good pattern for future UI modules
- Settings menu couples to audio.js underscore-prefixed properties (_masterGain, _sfxBus, _musicBus) — fragile but acceptable. Consider adding setVolume() API to audio.js in Sprint 2
- Difficulty system API contract (getDifficultySettings/setDifficulty/getCurrentDifficulty) is clean and extensible

**Quality Notes:**
- No bugs found across all 4 PRs
- No XSS concerns (innerHTML uses only class defaults, not user input)
- Good defensive coding patterns: typeof guards, try/catch on localStorage, null checks on audio nodes
- Ghost personalities faithfully implement classic Pac-Man behaviors with Simpsons theme adaptation
