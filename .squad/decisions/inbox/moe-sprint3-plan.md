# Sprint 3 Planning Decision — "Deep Engagement" Pillar

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Sprint Planning ceremony for Sprint 3 (Issue #52)

## Decision: Execute Sprint 3 with Focus on Endless Mode, Audio Upgrade, and Leaderboard

**Strategic Frame:** Sprint 3 focuses on the **Deep Engagement** pillar — features that create mastery progression, sensory depth, and meta-progression. Sprint 2 hooked players in 60 seconds; Sprint 3 gives them reasons to stay for 60 sessions.

## What's IN

| # | Issue | Owner | Priority | Why Now |
|---|-------|-------|----------|---------|
| #54 | Progressive Difficulty & Endless Mode | Barney | P0 | Core retention mechanic. Current game ends at level 8 — endless mode creates infinite skill ceiling. "One more try" loop. |
| #55 | Audio Feedback & Juice Upgrade | Barney | P1 | Audio is 50% of arcade feel. Pitch variation, spatial sound, ducking transform functional audio into delightful audio. |
| #56 | Leaderboard & Stats Dashboard | Lenny | P1 | Meta-progression. Players need to SEE improvement. Top 50, lifetime stats, rank badges create goal-setting behavior. |
| #57 | Sprint 3 QA & Regression Testing | Nelson | P1 | Sprint 3 adds significant complexity. Must validate new features + guard Sprint 1-2 gains. Includes performance smoke tests. |

## What's OUT (deferred to Sprint 4+)

| Item | Reason |
|------|--------|
| Social Sharing (#5) | Need something worth sharing first — endless mode + leaderboard make sharing meaningful. Sprint 4 candidate. |
| Daily Challenges (#8) | Requires stable endless mode as foundation. Better after Sprint 3 proves the engagement loop. |
| Ghost Debug Mode (#7) | Nice-to-have for advanced players. Not engagement-critical. Sprint 4 or backlog. |
| Performance Optimization (#9) | No evidence of problems. Nelson includes perf smoke tests in QA — optimize only if data shows need. |

## Strategic Rationale

### Why These Three Features Together

Sprint 2 completed the **Immediate Fun** pillar — tutorial reduces bounce, combos add juice, mobile polish ensures primary platform works. The game now hooks players.

Sprint 3 creates the **engagement loop**:

```
Play → Improve (endless mode difficulty) → Feel (audio feedback) → Track (leaderboard) → Play Again
```

Each feature reinforces the others:
- **Endless mode** gives combos a stage where they matter more (higher difficulty = higher risk/reward)
- **Audio upgrades** make endless mode feel increasingly intense (spatial ghosts, tempo changes)
- **Leaderboard** gives endless mode a scorecard (highest level reached, best combos)

### Why Barney Gets Two Issues

Barney owns both gameplay systems (endless mode) and engine systems (audio). These are deeply coupled — endless mode needs audio cues for escalating tension, and audio pitch variation needs gameplay event data. Having one engineer own both reduces coordination overhead.

### Why Not Social Sharing Yet

Social sharing is highest-value when there's something worth sharing. After Sprint 3:
- "I reached level 47 in Endless Mode!" (impressive)
- "I'm a Master rank with 20k+ donuts!" (status)
- "My combo record is 8x!" (skill flex)

Without Sprint 3, sharing is just "I played a Pac-Man clone" — low viral potential.

## Dependencies

```
#54 (Endless Mode)  ──────┐
#55 (Audio Upgrade)  ─────┤──→ #57 (QA)
#56 (Leaderboard)    ─────┘
```

All three feature issues can develop in parallel. QA runs after all features land.

Cross-feature integration points:
- #56 needs #54's "highest level" data for leaderboard entries
- #55's audio intensity can respond to #54's difficulty level
- Nelson validates all cross-feature interactions in #57

## Success Criteria

Sprint 3 is successful if:
- Endless mode creates measurable increase in session length
- Audio upgrade makes the game feel noticeably more polished
- Leaderboard drives repeat play behavior
- Zero P0 regressions from Sprint 1-2
- Performance holds at 60fps on mobile

## Sprint 4 Preview

With "Immediate Fun" and "Deep Engagement" complete, Sprint 4 moves to **Social Virality**:
- Social Sharing (#5) — one-tap share with Web Share API
- Daily Challenges (#8) — habit formation via appointment mechanics
- Remaining polish from backlog

**Status:** Active — Sprint 3 begins now  
**Next Review:** End of Sprint 3 (Sprint Retrospective)
