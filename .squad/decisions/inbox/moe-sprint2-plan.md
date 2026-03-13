# Sprint 2 Plan — Immediate Fun

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Sprint Planning ceremony for Sprint 2 (Issue #39)

## What Shipped in Sprint 1

| PR | Feature | Owner |
|----|---------|-------|
| #27 | Triage YAML sync | Nelson |
| #28 | Difficulty system (Easy/Normal/Hard) | Barney |
| #29 | Ghost AI (BFS + Pac-Man personalities) | Barney |
| #30 | Settings menu (audio, difficulty UI) | Lenny |

Sprint 1 was a clean success — all 4 PRs shipped, no regressions, and the architecture is solid. The game now has intelligent ghost AI, player-configurable difficulty, and a polished settings menu.

## Project Health Assessment

**On track.** Sprint 1 delivered exactly what was planned. No scope creep. The codebase is well-structured with clear module boundaries (js/engine/, js/ui/, js/game-logic.js). Test infrastructure exists but coverage is light — acceptable for now.

**Technical debt:** Settings menu accesses audio.js underscore-prefixed properties (_masterGain, _sfxBus, _musicBus) directly. Not blocking but should get a proper setVolume() API eventually.

## Sprint 2 Scope Decision

### Strategic Frame: "Immediate Fun" Pillar

Sprint 2 focuses exclusively on the **Immediate Fun** pillar — features that make the game more engaging in the first 60 seconds and on the primary platform (mobile).

**The logic chain:**
1. Players can't enjoy features they never discover → **Tutorial**
2. The game needs a core "juice" mechanic to feel rewarding → **Combo System**
3. 70%+ of players are on mobile; bad controls = dead game → **Mobile Polish**
4. All features need validation before we ship → **QA**

### What's IN (and why)

| # | Issue | Owner | Priority | Why Now |
|---|-------|-------|----------|---------|
| #42 | Tutorial & Onboarding | Lenny | P0 | Prerequisite for everything. Reduces bounce rate from ~60% to target ~40%. No other feature matters if players leave in 30 seconds. |
| #43 | Combo Multiplier System | Barney | P1 | Core "juice" mechanic. Makes ghost-chasing feel rewarding with visual/audio feedback. Creates skill expression and risk-reward loop. |
| #44 | Mobile-First Polish | Lenny | P1 | 70% of web arcade traffic is mobile. Larger touch zones, haptic feedback, fullscreen mode, PWA manifest. Makes the tutorial and combo system actually playable on the primary platform. |
| #45 | Sprint 2 QA & Regression | Nelson | P1 | Validate all Sprint 2 features + ensure Sprint 1 ghost AI, difficulty, and settings haven't regressed. |

### What's OUT (and why)

| Roadmap Item | Why Deferred |
|-------------|-------------|
| Progressive Difficulty & Endless Mode (#4) | Good but not urgent. Current 8 levels provide sufficient content while we nail the core feel. Sprint 3 candidate. |
| Social Sharing (#5) | Needs combo system and mobile polish to exist first. Nothing worth sharing until the game feels great. Sprint 3. |
| Audio Feedback Upgrade (#6) | Combo-specific audio stings are included IN the combo issue (#43). Full audio overhaul (spatial, ducking, tempo) is Sprint 3. |
| Ghost Debug Mode (#7) | Niche feature for advanced players. Not "Immediate Fun." Sprint 3-4. |
| Daily Challenge (#8) | Requires more infrastructure. Sprint 3-4 after endless mode exists. |
| Performance Optimization (#9) | No evidence of performance problems yet. Premature optimization. Will address if QA surfaces issues. |
| Leaderboard & Stats (#10) | Needs stats from combo system first. Sprint 3. |

### Duplicate Issues Closed

- **#34** (Daily Challenge Cards) — Closed as duplicate. Superseded by roadmap item #8 with expanded scope.
- **#35** (Ghost Personality Visual Indicators) — Closed as duplicate. Superseded by roadmap item #7 with expanded scope.

## Team Loading

| Agent | Issues | Domain |
|-------|--------|--------|
| Lenny | #42 (P0), #44 (P1) | Tutorial overlay system + mobile UX improvements |
| Barney | #43 (P1) | Combo tracking, score multipliers, particle/audio effects |
| Nelson | #45 (P1) | QA for all Sprint 2 features + Sprint 1 regression testing |
| Moe | Code review | Architecture oversight, PR review gates |

Lenny has two issues but they're complementary — tutorial needs to work on mobile, and mobile polish improves the tutorial experience. Barney has one meaty issue (combo system) which is appropriately scoped for a single sprint.

## Dependencies

```
#42 (Tutorial) ──────┐
#43 (Combo)    ──────┤──→ #45 (QA)
#44 (Mobile)   ──────┘
```

All three feature issues can be developed in parallel. QA runs after features land.

## Success Criteria for Sprint 2

- Tutorial reduces first-level bounce rate
- Combo system makes ghost-chasing feel rewarding
- Mobile controls feel responsive and satisfying
- Zero P0 regressions from Sprint 1
- All QA checklist items pass

## Sprint 3 Preview

Based on what we defer here, Sprint 3 likely focuses on **Deep Engagement**: Progressive Difficulty & Endless Mode, Audio Upgrade, and Social Sharing. This builds on the "Immediate Fun" foundation from Sprint 2.

**Status:** Active — Sprint 2 begins now
