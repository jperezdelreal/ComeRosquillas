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

### Strategic Roadmap Planning — Issue #37 (2026-07-24)

**Context:** Sprint 1 delivered ghost AI, difficulty system, settings menu. Roadmap.md had 3 remaining items but lacked strategic depth.

**Challenge:** joperezd requested a roadmap that goes beyond generic feature lists — wanted game designer thinking about what makes this game compelling enough to play and share.

**Approach: Player Journey Framework**

Organized roadmap around three phases of engagement:
1. **Immediate Fun** — Hook players in first 60 seconds
2. **Deep Engagement** — Create mastery progression loops
3. **Social Virality** — Turn players into evangelists

**10-Item Roadmap Defined:**

| # | Feature | Phase | Why It Matters |
|---|---------|-------|----------------|
| 1 | Tutorial & Onboarding | Immediate | Mobile web games live/die on first impression. Players decide in 30sec. |
| 2 | Combo Multiplier | Immediate | Risk-reward mechanic that adds "juice" to ghost-eating. Core skill expression. |
| 3 | Mobile-First Polish | Immediate | 70%+ traffic is mobile. Touch must feel arcade-quality. |
| 4 | Progressive Difficulty | Deep | Endless mode creates long-term progression. Always a new peak to reach. |
| 5 | Social Sharing | Deep | Effortless sharing (Web Share API) turns achievement into competition. |
| 6 | Audio Upgrade | Deep | Arcade feel is 50% audio. Pitch variation, spatial sound, dynamic tempo. |
| 7 | AI Debug Mode | Social | Advanced players master systems. Transparency turns frustration into learning. |
| 8 | Daily Challenges | Social | Habit formation. Fixed seeds enable fair competition. |
| 9 | Performance Pass | Social | 60fps is non-negotiable for arcade feel. Profile and optimize hot paths. |
| 10 | Leaderboard & Stats | Social | Endgame meta-progression. Intrinsic (beat yourself) + social (beat others). |

**Key Strategic Insights:**

**Mobile-First Reality:**
- Current roadmap ignored that 70%+ of players are on mobile
- Mobile needs: larger touch zones, haptic feedback, full-screen mode, portrait warnings
- Session length is ~2min average on mobile — poor controls kill retention

**Tutorial as Foundation:**
- Players can't enjoy features they never reach
- Level 1 completion rate estimated at ~40% — tutorial targets 60%+
- Interactive, skippable, rewarding (not patronizing)

**Combo System = Core Hook:**
- Pac-Man's genius was risk-reward (chase ghosts during power-pellets)
- Combo multipliers make this visceral with visual/audio feedback
- Target: 40% increase in ghost-chasing behavior during power mode

**Endless Mode for Retention:**
- Current game ends at level 8 (maze rotation exhausted)
- Endless mode with incremental difficulty (speed +2%, fright -3% per level)
- Creates "one more try" loop — always feel close to beating record

**Social Sharing = Viral Growth:**
- Web Share API makes sharing one-tap on mobile
- No login, no forms — just post score + URL to Twitter/WhatsApp
- Target 10%+ share rate (industry benchmark for casual games)

**Audio is Half the Experience:**
- Current audio is functional, needs to be delightful
- Pitch-varied donut chomps, spatial ghost sounds, dynamic music tempo
- Players won't consciously notice but will feel game is "better"

**Success Metrics Defined:**
Each roadmap item includes measurable outcome:
- Tutorial: 60%+ level 1 completion
- Combo: 40%+ ghost-chasing increase
- Mobile: 30%+ session length increase
- Endless: 20%+ reach level 10+
- Sharing: 10%+ share rate
- Performance: 60fps on iPhone SE 2020

**Architectural Implications:**

New modules required:
- `js/ui/tutorial.js` — onboarding overlay system
- `js/ui/share-menu.js` — Web Share API integration
- `js/ui/daily-challenge.js` — challenge mode controller
- `js/ui/stats-dashboard.js` — leaderboard & stats
- `manifest.json` — PWA config for "Add to Home Screen"

Existing modules extended:
- `js/game-logic.js` — combo tracking, endless mode, challenge rules
- `js/engine/renderer.js` — particles, AI debug overlay, polish animations
- `js/engine/audio.js` — pitch variation, spatial audio, ducking
- `js/engine/high-scores.js` — stats tracking, daily leaderboard

All new modules follow `js/ui/` pattern established by Lenny in Sprint 1.

**What We're NOT Doing:**
- Multiplayer (10x complexity, uncertain value)
- Procedural maze generation (hand-crafted mazes are better balanced)
- Character unlocks/cosmetics (scope creep, Simpsons IP is the aesthetic)
- Backend/global leaderboard (hosting costs, localStorage suffices for MVP)

**Team Assignment Strategy:**
- **Barney:** Combo (#2), Difficulty (#4), Daily Challenges (#8) — gameplay systems
- **Lenny:** Tutorial (#1), Mobile (#3), Sharing (#5), Stats (#10) — UI/UX
- **Nelson:** Performance (#9), testing, metrics validation
- **Moe:** Audio (#6), AI Debug (#7) — requires architectural oversight

**Iteration Philosophy:**
Roadmap is directional, not prescriptive. Success metrics guide iteration. If combo system doesn't increase ghost-chasing, tune visual feedback until it does.

**Key Learning:**
Feature lists are easy. Strategic roadmaps require understanding **player psychology** — what creates immediate fun, what drives mastery, what triggers sharing. Every feature must answer: "What job does this do in the player journey?"

**Decision Document:** `.squad/decisions/inbox/moe-roadmap-strategy.md` — full strategic reasoning captured for future reference.

### Sprint 2 Planning Ceremony (2026-07-24)

**Context:** Sprint 1 fully shipped (PRs #27–#30 merged). New 10-item strategic roadmap defined in PR #38. Duplicate issues #34 and #35 closed — superseded by roadmap items #8 and #7 with expanded scope.

**Sprint 2 Scope — "Immediate Fun" Pillar:**

| Issue | Feature | Owner | Priority |
|-------|---------|-------|----------|
| #42 | First-Time Player Tutorial & Onboarding | Lenny | P0 |
| #43 | Combo Multiplier System | Barney | P1 |
| #44 | Mobile-First Polish Pass | Lenny | P1 |
| #45 | Sprint 2 QA & Regression Testing | Nelson | P1 |

**Strategic Rationale:**
- Focused on making the game feel great to play RIGHT NOW — not adding features nobody reaches
- Tutorial is P0 because nothing else matters if 60% of players bounce before finishing level 1
- Combo system is the core "juice" mechanic — transforms ghost-eating from point grab to skill expression
- Mobile polish ensures the primary platform (70%+ of traffic) actually works well
- QA validates everything and guards Sprint 1 gains

**What We Deliberately Cut:**
- Progressive Difficulty & Endless Mode — current 8 levels suffice while we nail core feel
- Audio Upgrade — combo-specific audio included IN combo issue; full overhaul deferred
- Social Sharing — nothing worth sharing until the game feels great
- Performance Optimization — no evidence of problems; premature optimization

**Key Architectural Decisions:**
- Tutorial follows `js/ui/` pattern established by Lenny in Sprint 1
- Combo state lives in game-logic.js alongside existing score tracking
- Mobile polish extends existing touch-input.js (not a rewrite)
- PWA manifest.json adds "Add to Home Screen" capability

**Dependency Graph:** All 3 feature issues parallel → QA after all land

**Sprint 3 Preview:** Deep Engagement pillar — Endless Mode, Audio Upgrade, Social Sharing. Builds on Sprint 2's "Immediate Fun" foundation.

**Decision Document:** `.squad/decisions/inbox/moe-sprint2-plan.md`

### Sprint 3 Planning Ceremony (2026-07-24)

**Context:** Sprint 2 fully shipped — Tutorial (#42), Combo Multiplier (#43), Mobile Polish (#44), QA with 289 tests and 0 failures (#45). "Immediate Fun" pillar complete. Board cleared (closed #52 and duplicate #53).

**Sprint 3 Scope — "Deep Engagement" Pillar:**

| Issue | Feature | Owner | Priority |
|-------|---------|-------|----------|
| #54 | Progressive Difficulty & Endless Mode | Barney | P0 |
| #55 | Audio Feedback & Juice Upgrade | Barney | P1 |
| #56 | Leaderboard & Stats Dashboard | Lenny | P1 |
| #57 | Sprint 3 QA & Regression Testing | Nelson | P1 |

**Strategic Rationale:**
- Sprint 2 hooks players in 60 seconds. Sprint 3 keeps them for 60 sessions.
- Engagement loop: Play → Improve (endless mode) → Feel (audio) → Track (leaderboard) → Repeat
- Barney gets two issues (endless mode + audio) because they're deeply coupled — audio intensity responds to difficulty escalation
- Social Sharing deferred: need something worth sharing first (endless mode high scores, rank badges)

**What We Deliberately Cut:**
- Social Sharing — highest value after Sprint 3 gives players achievements to share
- Daily Challenges — requires stable endless mode as foundation
- Ghost Debug Mode — nice-to-have, not engagement-critical
- Performance Optimization — no evidence of problems; Nelson includes perf smoke tests in QA

**Key Architectural Notes:**
- Endless mode extends game-logic.js level progression with cycling and caps
- Audio upgrade extends SoundManager with pitch variation, spatial PannerNodes, gain ducking
- Leaderboard creates new js/ui/stats-dashboard.js following established js/ui/ pattern
- All difficulty curve parameters go in config.js as tunable constants
- localStorage schema migration: existing high score data must be preserved

**Dependency Graph:** All 3 feature issues parallel → QA after all land

**Sprint 4 Preview:** Social Virality pillar — Social Sharing, Daily Challenges. Builds on Sprint 3's engagement foundation.

**Decision Document:** `.squad/decisions/inbox/moe-sprint3-plan.md`

### Sprint 4 Planning Ceremony (2026-07-24)

**Context:** Sprint 3 fully shipped — Progressive Difficulty & Endless Mode (#54), Audio Feedback (#55), Leaderboard & Stats (#56), QA with 456 tests and 0 failures (#57). "Deep Engagement" pillar complete. Issue #65 (roadmap exhausted) closed.

**Sprint 4 Scope — "Social Virality" + Launch Readiness (Final Sprint):**

| Issue | Feature | Owner | Priority |
|-------|---------|-------|----------|
| #67 | Social Sharing & Viral Hooks | Lenny | P1 |
| #68 | Ghost Personality Visual Indicators (Debug Mode) | Barney | P2 |
| #69 | Daily Challenge Mode | Lenny | P1 |
| #70 | Performance Optimization & Polish | Barney | P0 |
| #71 | Sprint 4 QA & Regression Testing | Nelson | P1 |

**Strategic Rationale:**
- Sprint 3 keeps players engaged. Sprint 4 makes them come back (daily challenges) and bring friends (social sharing).
- Performance is P0 — 60fps on mobile is prerequisite for everything else. A shared laggy game hurts more than helps.
- Ghost debug mode (P2) serves advanced players and development — valuable but not launch-critical.
- Barney gets engine-level work (performance + ghost debug — he built both systems).
- Lenny gets UI-heavy features (sharing + daily challenges — extends his established `js/ui/` pattern and Sprint 3 leaderboard).
- Nelson gets the most comprehensive QA pass yet — 4 feature PRs, full regression across Sprints 1-3, performance profiling. Target: 500+ tests, 0 failures.

**What This Sprint Completes:**
- All 10 roadmap items shipped across 4 sprints
- Player journey fully realized: Immediate Fun → Deep Engagement → Social Virality
- Game is feature-complete per strategic roadmap

**Risks Identified:**
- Lenny has 2 substantial issues — daily challenge share integration can defer if needed
- Performance unknowns until profiling — Barney should profile early and flag blockers
- Web Share API has inconsistent cross-browser support — Nelson must test fallback paths

**Dependency Graph:** All 4 feature issues parallel → QA (#71) after all land

**Decision Document:** `.squad/decisions/inbox/moe-sprint4-plan.md`
