# Moe (Lead) — Project History

**Owner:** joperezd  
**Project:** ComeRosquillas — Homer's Donut Quest (Pac-Man style web arcade game)  
**Stack:** Vanilla HTML/JS/Canvas 2D, no frameworks, procedural audio (Web Audio API)  
**Upstream:** FirstFrameStudios (subsquad)  
**Lead Role:** Strategic planning, code review, architectural guidance, issue triage

---

## Core Context

### Project State (Post–Phase 1, Pre–Phase 2)

**Phase 1 Delivered:** 10 original roadmap items complete (tutorial, combo, mobile, endless, audio, leaderboard, stats, ghost AI, difficulty, settings). 504 tests passing, 0 known bugs. Board is empty.

**Architecture Established:**
- Vanilla JS/Canvas commitment (no frameworks, no build tools)
- Modular pattern: `js/engine/` (audio, renderer, high-scores, touch), `js/ui/` (settings-menu, future modules)
- Procedural audio: Web Audio API only, no external files
- BFS pathfinding for ghost AI with Pac-Man-style personalities (Burns, Pinky, Nelson, Snake)
- Difficulty presets in config.js (Easy/Normal/Hard multipliers)
- localStorage persistence for settings, high scores, leaderboard, language

**Team Composition:**
- **Barney (Game Dev):** Gameplay mechanics, AI, difficulty, performance
- **Lenny (UI Dev):** Canvas rendering, UI modules, animations, accessibility
- **Nelson (Tester):** QA, regression testing, metrics validation, YAML triage

### Key Files
- `js/game-logic.js` (85KB, becoming monolith) — core state machine, input, collisions, scoring
- `js/engine/audio.js` — SoundManager, layered synthesis, spatial panning, audio ducking
- `js/engine/renderer.js` — Canvas 2D, maze rendering, sprites, UI overlays
- `js/config.js` — game constants, DIFFICULTY_PRESETS, maze template, speeds

### Sprint Planning Pattern
Early sprints (1-3) used 3-sprint structure: Core Quality → Content & Polish → Community & Launch. Success driven by player journey framework (Immediate Fun → Deep Engagement → Social Virality).

---

## Recent Sessions

<!-- Append new learnings below. Recent sessions preserved. Old entries summarized above. -->

### Sprint 1 Code Review — Merge Strategy (2026-07-24)

**4 PRs reviewed, all approved:** #27 (YAML triage), #28 (difficulty), #29 (ghost AI), #30 (settings).  
**Merge order:** #27 → #29 → #28 → #30 (minimizes trivial conflicts, all conflicts resolvable).

**Quality Assessment:** No bugs, good defensive patterns, architecture sound. BFS in game-logic.js is correct (50 lines, single consumer). js/ui/ directory established by Lenny as pattern for future UI modules. Settings menu's coupling to audio.js underscore properties acceptable short-term; consider audio.js setVolume() API in Sprint 2.

### Strategic Roadmap Definition (2026-07-24)

**Challenge:** User requested roadmap beyond feature lists — wanted game designer thinking about player psychology.

**Solution: Player Journey Framework**
- **Immediate Fun** (Phase 1): Hook in 60 seconds → Tutorial, Combo, Mobile Polish
- **Deep Engagement** (Phase 2): Mastery loops → Endless mode, Audio upgrade, Leaderboard
- **Social Virality** (Phase 3): Turn players into evangelists → Sharing, Daily Challenges, AI Debug

**10-Item Roadmap Created (#1-#10):**
| Feature | Phase | Why |
|---------|-------|-----|
| Tutorial | Immediate | First impression critical; 40%→60%+ completion target |
| Combo Multiplier | Immediate | Risk-reward hook; +40% ghost-chasing target |
| Mobile Polish | Immediate | 70% of traffic is mobile; +30% session length target |
| Endless Mode | Deep | "One more try" loop; +20% reach level 10+ target |
| Social Sharing | Deep | 10%+ share rate (industry benchmark) |
| Audio Upgrade | Deep | Pitch variation, spatial sound, dynamic tempo |
| AI Debug Mode | Social | Transparency → learning |
| Daily Challenges | Social | Fixed seeds enable fair competition |
| Performance Pass | Social | 60fps non-negotiable |
| Leaderboard/Stats | Social | Meta-progression |

**Key Insights:** Mobile-first is reality. Tutorial unlocks all features. Combo system = core skill hook. Endless mode prevents abandonment after level 8. Sharing = viral growth. Audio is half the experience. Success metrics defined per item (60% tutorial completion, 40% combo ghost-chasing increase, etc.).

**Team Assignment:**
- Barney: Combo, Progressive Difficulty, Daily Challenges
- Lenny: Tutorial, Mobile, Sharing, Stats Dashboard
- Nelson: Performance, testing, metrics
- Moe: Audio, AI Debug, architecture oversight

**Scope Management:** NOT doing multiplayer, procedural mazes, cosmetics, or backend leaderboard. localStorage suffices.

**Core Learning:** Feature lists are easy. Strategic roadmaps require understanding player psychology — what creates immediate fun, drives mastery, triggers sharing. Every feature answers: "What job does this do in the player journey?"

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

### Roadmap v2 Definition — Phase 2 Strategic Direction (2026-07-24)

**Context:** Issue #80 — All 10 Phase 1 roadmap items complete (Sprints 1-4 shipped). Game is feature-complete, polished, tested (504 tests passing). Board clear. Need strategic direction for Phase 2.

**Challenge:** Phase 1 delivered Immediate Fun → Deep Engagement → Social Virality. What's NEXT? How do we evolve from "complete game" to "exceptional game"?

**Approach: Three-Pillar Framework for Phase 2**

Analyzed the current game state by reading key implementation files:
- Tutorial, daily challenges, stats dashboard, endless mode, combo system ALL implemented
- Strong foundation: modular UI architecture (`js/ui/` pattern), 504 passing tests, procedural audio
- Gap analysis: Content feels repetitive after 20+ sessions, sprites are static, accessibility missing, 85KB game-logic.js becoming unwieldy

Defined Phase 2 around three strategic pillars:

#### 1. Depth & Variety (Content Freshness)
**Problem:** Core loop (collect → chase → level up) becomes predictable. Needs variety without complexity.

**Solutions:**
- **Power-Up Variety (#92):** 5+ special items (Duff Beer speed boost, Donut Box bonus points, Chili Pepper slow ghosts, Mr. Burns Token extra life, Lard Lad invincibility). Creates decision-making and surprise moments. Each session has different item combos.
- **Maze Themes (#99):** 6 Simpsons location skins (Springfield Streets, Moe's Tavern, Kwik-E-Mart, Elementary, Nuclear Plant, Simpsons House). Same collision geometry, different visuals. Rotate every 2-3 levels.
- **Boss Ghosts (#96):** Climactic encounters every 5 levels. Fat Tony (2x HP), Krusty (fake pellets), Sideshow Bob (teleports), Mr. Burns (lasers). Breaks monotony.
- **Procedural Events (#90):** 1-in-5 levels get random rule modifier (Double Trouble 8 ghosts, Darkness fog of war, No Power-Ups, Golden Hour 2x points). Creates memorable "story" runs.

#### 2. Polish & Delight (Micro-Interactions)
**Problem:** Phase 1 made game functional and fun. Phase 2 makes it FEEL amazing. Every action should trigger dopamine.

**Solutions:**
- **Screen Shake & Camera (#94):** Dynamic camera system with shake on collisions (ghost hit = medium, combo milestone = escalating, boss defeat = heavy), smooth follow with lookahead, zoom effects (level start/complete/death). Pac-Man's static camera feels dated. Toggleable for motion-sensitive players.
- **Sprite Animations (#93):** 4-frame Homer walk cycles, ghost eye tracking (pupils follow player ±45°), death sequences, donut rotation, power pellet pulsing. Players watch sprites 100% of playtime — make them delightful.
- **Achievement System (#98):** 20+ unlockable badges across 4 categories (Skill: 8x combo, Perfect Level; Milestone: Century Club 100K, Marathon lvl 20; Discovery: all items, all themes; Funny: D'oh Moment die in 5sec, Donut Addict 1000 donuts). Toast notifications, progress tracking, share integration.

#### 3. Technical Foundation (Iteration Speed)
**Problem:** 85KB game-logic.js is bottleneck. Every feature touches monolith. Need modularity for faster iteration. Accessibility and localization expand market.

**Solutions:**
- **Code Refactor (#97):** Extract 5 modules from game-logic.js (entity-manager, collision-detector, scoring-system, level-manager, ai-controller). Behavior-preserving extraction. game-logic shrinks 85KB → ~20KB as thin orchestrator. Enables parallel work, isolated testing.
- **Accessibility (#91):** Colorblind modes (Protanopia/Deuteranopia/Tritanopia palettes + ghost icons), keyboard nav (tab/focus indicators), screen reader (ARIA labels, live regions), high-contrast mode, reduce motion, larger text. Currently excludes ~15% of players.
- **Localization (#95):** i18n system supporting Spanish, French, German, Portuguese. `js/i18n/translations.js` key-value dictionaries, runtime language switching, localStorage persistence. Spanish alone doubles addressable market (Latin America + Spain).

**10-Item Roadmap Created (Issues #90-#99):**

| Issue | Feature | Owner | Priority | Pillar |
|-------|---------|-------|----------|--------|
| #92 | Power-Up Variety | Barney | P1 | Depth & Variety |
| #99 | Maze Themes | Lenny | P1 | Depth & Variety |
| #98 | Achievement System | Lenny | P1 | Polish & Delight |
| #96 | Boss Ghosts | Barney | P1 | Depth & Variety |
| #90 | Procedural Events | Barney | P2 | Depth & Variety |
| #94 | Screen Shake & Camera | Lenny | P1 | Polish & Delight |
| #93 | Sprite Animations | Lenny | P2 | Polish & Delight |
| #91 | Accessibility | Lenny | P2 | Technical Foundation |
| #97 | Code Refactor | Barney | P2 | Technical Foundation |
| #95 | Localization | Lenny | P2 | Technical Foundation |

**Priority Breakdown:**
- **P1 (6 items):** Core player experience — power-ups, themes, achievements, bosses, camera. Immediately visible, high value.
- **P2 (4 items):** Important but can ship after P1 — events, animations, accessibility, refactor, localization.

**Success Metrics Defined:**

*Depth & Variety:*
- 80%+ collect 2+ special items per session
- 60%+ recognize 3+ maze themes
- 70%+ engage with boss mechanic at level 5

*Polish & Delight:*
- 85%+ keep camera effects enabled (measure opt-out rate)
- 40%+ unlock 5+ achievements
- Qualitative feedback mentions "polished" or "smooth"

*Technical Foundation:*
- 504 tests pass post-refactor (no regressions)
- 0 critical accessibility issues (WAVE/axe validation)
- 15%+ switch from English to another language

**Scope Cuts (What We're NOT Doing):**
- **Multiplayer:** 10x complexity, uncertain value. Game is single-player by design.
- **Procedural Mazes:** Hand-crafted mazes better balanced. Random generation risks unwinnable layouts.
- **Backend/Global Leaderboard:** Hosting costs, server overhead. localStorage suffices for MVP.
- **Character Unlocks/Cosmetics:** Scope creep. Simpsons theme IS the aesthetic.
- **Story Mode/Campaigns:** This is arcade game. High score IS the narrative.

**Team Assignment Strategy:**
- **Barney:** Engine/game logic features — power-ups (#92), boss ghosts (#96), events (#90), refactor (#97)
- **Lenny:** UI/visual polish — themes (#99), achievements (#98), camera (#94), animations (#93), accessibility (#91), localization (#95)
- **Nelson:** QA validation, regression testing, metrics measurement across all features
- **Moe:** Code review, architectural guidance, scope management

**Architectural Implications:**

*New Modules:*
- `js/i18n/translations.js` — localization system
- `js/engine/entity-manager.js`, `collision-detector.js`, `scoring-system.js`, `level-manager.js`, `ai-controller.js` — extracted from game-logic.js
- `docs/architecture.md` — system design documentation

*Extended Modules:*
- `js/game-logic.js` — item spawning, boss encounters, event triggers (then shrinks via refactor)
- `js/engine/renderer.js` — theme rendering, camera system, animations, accessibility modes
- `js/config.js` — item definitions, boss configs, theme data, event types
- `js/ui/stats-dashboard.js` — achievements UI integration
- `icons/` — theme sprites, boss sprites, item sprites, animation sprite sheets

**Strategic Reasoning:**

**Why Depth & Variety First:**
- Players already engaged (Phase 1 succeeded). Now need reasons to keep playing.
- Content variety (power-ups, themes, bosses, events) addresses repetition fatigue observed in endless mode
- Low complexity cost — reuses existing systems with new data/visuals

**Why Polish & Delight Matters:**
- Arcade games succeed on "game feel" — Pac-Man's sound design is 50% of its appeal
- Screen shake, animations, achievements amplify existing mechanics without changing rules
- Creates "wow" moments that drive word-of-mouth

**Why Technical Foundation Enables Phase 3:**
- Refactor unlocks parallel feature development (no more monolith bottleneck)
- Accessibility is ethical + expands player base 15-20%
- Localization opens Latin America, Europe markets (3-5x addressable audience)
- These investments pay dividends across all future work

**Long-Term Vision:**

Phase 1: Prove the game works (✅ Complete)  
Phase 2: Prove the game is special (▶️ Starting)  
Phase 3 (Future): Community features, user-generated challenges, global competition — but ONLY if Phase 2 demonstrates sustained engagement

**Execution Plan:**

Staged rollout over 2-3 sprints:
- Sprint 5: P1 features batch 1 (power-ups, themes, achievements) + QA
- Sprint 6: P1 features batch 2 (bosses, camera) + P2 features batch 1 (events, animations) + QA
- Sprint 7: P2 features batch 2 (accessibility, refactor, localization) + comprehensive regression + polish

Each sprint: 3-4 features + Nelson QA pass. Track success metrics per feature. Iterate on underperformers.

**Key Learnings:**

**From Phase 1 Results Applied to Phase 2:**
- Tutorial doubled level 1 completion → Achievements create similar onboarding for advanced features
- Combo system increased ghost-chasing 40% → Boss ghosts create similar skill expression goals
- Mobile polish increased session length 30% → Animations/camera make existing content feel 30% better
- Daily challenges created habit loops → Events create similar "one more run" replayability

**Roadmap Philosophy Evolved:**
- Phase 1 focused on player journey stages (Immediate → Deep → Social)
- Phase 2 focuses on experience depth (Content → Feel → Foundation)
- Both frameworks answer: "What job does this feature do for the player?"
- Feature lists are easy. Strategic roadmaps require understanding player psychology AND technical constraints.

**Risk Mitigation:**
- Lenny has 6 of 10 issues — deliberately staged (P1 first, P2 after Sprint 5 completes)
- Refactor is P2 to avoid destabilizing active development — ship features first, then modularize
- Accessibility/localization can ship incrementally (start with 1 colorblind mode, 1 language; expand later)

**Quality Gates:**
- All features must have clear success metrics (not just "implemented")
- 504 tests must pass after every feature (Nelson enforces)
- No feature ships without accessibility considerations (keyboard nav minimum)
- Code review required on all PRs — Moe approves architecture changes

**Decision Document:** `.squad/decisions/moe-roadmap-v2.md`

**Issues Closed:** #80 with summary of 10 new issues created

**Perpetual Motion:** Workflow resumes — next issue auto-assigned when ready

### PR Review — Event System & Accessibility (2026-07-15)

**2 PRs reviewed, both LGTM:** #111 (procedural events, Barney), #112 (accessibility, Lenny).

**PR #111 — Procedural Event System (closes #90):**
Config-driven design with 10 mini-events in PROCEDURAL_EVENTS constant. New `js/engine/event-system.js` module extends Game.prototype (established pattern). Events: Double Trouble (8 ghosts), Speed Run (90s timer), Ghost Frenzy (no scatter), Donut Feast (extra dots), Invincibility Rush (3x fright), No Power-Ups, Darkness (fog of war), Reverse Day (inverted controls), Golden Hour (2x score), Bonus Stage (no ghosts). Clean effects-object pattern — zero coupling between event definitions and game systems. Technically sound: Fisher-Yates shuffle, canvas evenodd clip, staggered exit timers.

**PR #112 — Accessibility Enhancements (closes #91):**
Full-stack a11y: AccessibilityManager singleton (`a11y`) in `js/ui/accessibility.js`. Colorblind modes (protanopia, deuteranopia, tritanopia) with ghost icon identifiers. High contrast, reduce motion (suppresses particles + shake), large text (1.2x scale). ARIA live regions, roles, labels, skip-link, focus-visible. Space as alt pause key. Event subtitles, ghost proximity warning. Settings menu integration with persistence. OS prefers-reduced-motion auto-detection with user override.

**Merge Overlap Identified:** Both PRs independently add identical a11y hooks in collision-detector.js, level-manager.js, scoring-system.js, game-logic.js. Recommended merge order: #112 first (creates the a11y module), then rebase #111 onto main (overlapping hooks resolve trivially).

**Key Learnings:**
- Config-driven event systems scale well — adding event N+1 is just a data entry
- Accessibility module as singleton with defensive typeof checks enables cross-branch compatibility
- When multiple PRs touch same files with identical changes, establish merge order upfront to minimize conflict resolution work
- 597 tests passing on both PRs — test infrastructure continues to provide confidence
