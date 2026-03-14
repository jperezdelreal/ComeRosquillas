# Sprint 4 Plan — "Social Virality" + Launch Readiness

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Issue #65 — Define next roadmap (Sprint 3 complete)

## Decision: Final Sprint Covering All Remaining Roadmap Items

### Context

Sprint 3 "Deep Engagement" shipped successfully:
- #54 Progressive Difficulty & Endless Mode (Barney) ✅
- #55 Audio Feedback & Juice Upgrade (Barney) ✅
- #56 Leaderboard & Stats Dashboard (Lenny) ✅
- #57 Sprint 3 QA — 456 tests, 0 failures (Nelson) ✅

Four roadmap items remain (5, 7, 8, 9). Sprint 4 ships them all — this is the launch sprint.

### Sprint 4 Scope

| Issue | Feature | Owner | Priority | Roadmap # |
|-------|---------|-------|----------|-----------|
| #67 | Social Sharing & Viral Hooks | Lenny | P1 | 5 |
| #68 | Ghost Personality Visual Indicators (Debug Mode) | Barney | P2 | 7 |
| #69 | Daily Challenge Mode | Lenny | P1 | 8 |
| #70 | Performance Optimization & Polish | Barney | P0 | 9 |
| #71 | Sprint 4 QA & Regression Testing | Nelson | P1 | — |

### Strategic Rationale

**Why these assignments:**

- **Barney gets Performance (P0) + Ghost Debug (P2):** Performance is the highest priority — 60fps is the foundation everything else sits on. Ghost debug mode is natural for Barney since he built the ghost AI system in Sprint 1. These are engine-level concerns that match his domain.

- **Lenny gets Social Sharing (P1) + Daily Challenges (P1):** Both are UI-heavy features following the `js/ui/` pattern Lenny established. Social sharing needs polished game-over screen integration. Daily challenges need a challenge card UI and integration with the leaderboard Lenny just built in Sprint 3.

- **Nelson gets QA (P1):** Most comprehensive QA pass yet — validates 4 feature PRs, runs full regression across Sprints 1-3, and does performance profiling on target devices. Target: 500+ tests, 0 failures.

**Why Performance is P0:**
- 60fps on mobile is prerequisite for everything else
- Social sharing of a laggy game hurts more than helps
- Must be optimized before launch

**Why Ghost Debug is P2:**
- Nice-to-have for advanced players and development
- Not user-facing for most players
- Lower impact on launch readiness

### Dependency Graph

All 4 feature issues can proceed in parallel. QA (#71) starts after all feature PRs land.

```
#67 Social Sharing ──┐
#68 Ghost Debug ─────┤
#69 Daily Challenge ──┼──→ #71 Sprint 4 QA
#70 Performance ──────┘
```

### What Sprint 4 Completes

After Sprint 4, all 10 roadmap items are shipped:

| Sprint | Pillar | Items |
|--------|--------|-------|
| 1 | Core Quality | Ghost AI, Difficulty, Settings, Tests |
| 2 | Immediate Fun | Tutorial, Combo, Mobile Polish, QA |
| 3 | Deep Engagement | Endless Mode, Audio Upgrade, Leaderboard, QA |
| 4 | Social Virality | Social Sharing, Ghost Debug, Daily Challenges, Performance, QA |

**This is the launch sprint.** After Sprint 4 QA passes, the game is feature-complete per the strategic roadmap.

### Risks

1. **Lenny has 2 issues:** Social sharing and daily challenges are both substantial. If timeline pressure emerges, daily challenge share integration can be deferred (it depends on share-menu.js from #67).
2. **Performance unknowns:** We haven't profiled yet. If hot paths reveal deeper issues (e.g., renderer architecture), scope may expand. Barney should profile early and flag blockers.
3. **Cross-browser testing:** Web Share API has inconsistent support. Nelson needs to test fallback paths thoroughly.

### Post-Sprint 4

With all roadmap items complete, the project enters maintenance/iteration mode. Future work would be driven by:
- Player feedback and analytics
- Bug reports from broader testing
- New feature requests from joperezd

---

**Status:** Active — Sprint 4 in progress  
**Labels applied:** sprint:4, go:ready on all issues
