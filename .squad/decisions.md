# Squad Decisions

## Active Decisions

### Sprint Planning — Kickoff Decision

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** First sprint planning ceremony for ComeRosquillas

#### Decision: 3-Sprint Roadmap Strategy

**Rationale:**
- Game already has solid core mechanics (maze nav, ghost AI basics, scoring, audio, high scores)
- Remaining work is polish, features, and launch readiness
- 3 sprints (4-6 weeks) balances ambition with achievable scope

**Sprint Allocation:**
1. **Sprint 1: Core Quality** — Ghost AI, difficulty, settings, tests (foundational improvements)
2. **Sprint 2: Content & Polish** — New mazes, animations, tutorial (player-facing value)
3. **Sprint 3: Launch Prep** — Leaderboard, optimization, final polish (community-ready)

**Key Architectural Constraints:**
- **No frameworks, no build tools** — Keep vanilla JS commitment
- **Modular expansion** — New features as self-contained modules (settings-menu.js, ai-pathfinding.js)
- **Procedural audio only** — No external audio files (Web Audio API only)
- **Test coverage** — Establish tests in Sprint 1 to enable confident iteration

**Sprint 1 Prioritization:**

High Priority (P1):
- Ghost AI tuning (Barney) — Core gameplay quality
- Difficulty settings (Barney) — Replayability unlock
- Settings menu (Lenny) — Player control & polish

Medium Priority (P2):
- Test infrastructure (Nelson) — Quality enabler for future sprints

**Why This Order?**
- Ghost AI and difficulty are gameplay differentiators — they make the game more fun
- Settings menu unblocks player customization (volume, controls, difficulty selection)
- Tests are P2 because they enable future confidence but don't directly impact player experience yet

**Team Assignments:**
- **Barney (Game Dev):** Ghost AI, Difficulty — owns gameplay systems
- **Lenny (UI Dev):** Settings menu — owns player-facing UI
- **Nelson (Tester):** Test infrastructure — owns quality foundations
- **Moe (Lead):** Code review, architecture oversight, sprint coordination

**Success Metrics:**
Sprint 1 is successful if:
- Ghost AI has distinct personalities per ghost (Red, Pink, Blue, Orange)
- Difficulty settings work and persist across sessions
- Settings menu is functional and accessible
- Test coverage hits 60%+ on game-logic.js
- No regressions to existing core gameplay

**Status:** Active — Sprint 1 begins now  
**Next Review:** End of Sprint 1 (Sprint Retrospective)

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
