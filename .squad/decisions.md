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

### Settings Menu Architecture Decision

**Date:** 2026-07-24  
**Decided by:** Lenny (UI Dev)  
**Context:** Settings menu implementation for issue #25

#### Decision: Modular UI Architecture with js/ui/ Directory

**Rationale:**
Created a dedicated `js/ui/` directory for UI-specific modules (starting with `settings-menu.js`). This establishes a clear separation between:
- Engine code (`js/engine/`) — core systems like audio, renderer, touch-input
- Game logic (`js/game-logic.js`) — game state and mechanics
- UI modules (`js/ui/`) — player-facing UI components like settings, menus, HUD overlays

**Implementation Details:**

Settings persistence:
- localStorage key: `comeRosquillasSettings`
- Saves on every change (no manual save step)
- Graceful degradation if localStorage unavailable

Audio integration:
- Direct manipulation of Web Audio API gain nodes (`_masterGain`, `_musicBus`, `_sfxBus`)
- Uses `setValueAtTime()` for smooth transitions
- Respects existing audio system architecture (no modifications to audio.js needed)

Difficulty coordination:
- Calls Barney's difficulty API (`setDifficulty`, `getCurrentDifficulty`) with graceful fallback
- Uses `typeof` checks to handle case where Barney's PR hasn't merged yet
- Settings menu owns the UI, difficulty system owns the data

Keyboard accessibility:
- Tab navigation through all focusable elements
- Escape to close
- S key shortcut from start/pause screens
- Enter to activate focused button

**Why This Matters:**

For future UI work:
- Clear pattern for adding new UI modules (tutorial overlay, achievements panel, etc.)
- Consistent styling approach (all CSS in index.html for now)
- Established localStorage persistence pattern

For team coordination:
- Settings menu can work independently of Barney's difficulty system (graceful degradation)
- Audio controls work without modifications to existing audio.js
- New modules can be added without touching game-logic.js core

**Success Metrics:**
- Settings persist across browser sessions ✓
- Audio volume controls work in real-time ✓
- Keyboard navigation fully functional ✓
- Mobile responsive design ✓
- Zero modifications to existing audio.js ✓

**Status:** Implemented in PR #30 (squad/25-settings-menu)

**Next Steps:**
- Consider extracting CSS to separate file if UI modules grow beyond 2-3
- Add settings export/import for advanced users (future enhancement)
- Integrate with tutorial system when Nelson builds it (Sprint 2)
### Difficulty System Design

**Date:** 2026-07-24  
**Author:** Barney (Game Dev)  
**Context:** Issue #24 — Difficulty Settings

#### Decision: Config-Driven Difficulty Presets

**What:**
Implemented a three-tier difficulty system (Easy/Normal/Hard) as data-driven presets in `js/config.js` with localStorage persistence.

**Why:**
- **Clean separation:** Config owns the data, game logic consumes it
- **No UI coupling:** Lenny can build any UI that calls the provided API
- **Easy to extend:** New difficulty levels can be added without changing game logic
- **Testable:** Difficulty behavior is deterministic and inspectable

**Preset Design:**
Each preset includes:
- `ghostSpeedMultiplier` — affects ghost and frightened ghost speed
- `frightTimeMultiplier` — affects power pellet duration
- `extraLifeThreshold` — score required for extra life
- `name` and `description` — for UI display

**Normal Difficulty:**
Critically, Normal difficulty uses 1.0x multipliers for speed/fright and 10000pts for extra life, matching current gameplay exactly. This ensures **zero regression** for players who don't change settings.

**API Contract (for Lenny #25):**
```javascript
// Read-only exports
DIFFICULTY_PRESETS      // Object with 'easy', 'normal', 'hard' keys
getDifficultySettings() // Returns current active preset object
getCurrentDifficulty()  // Returns current level string ('easy'/'normal'/'hard')

// Mutator
setDifficulty(level)    // Saves level to localStorage, returns preset
```

**Implementation Impact:**
- `getSpeed()` multiplies ghost speeds by `difficulty.ghostSpeedMultiplier`
- `getLevelFrightTime()` multiplies fright duration by `difficulty.frightTimeMultiplier`
- `checkExtraLife()` uses `difficulty.extraLifeThreshold` instead of hardcoded 10000

**Future Extensibility:**
To add a new difficulty level (e.g., 'expert'):
1. Add preset to `DIFFICULTY_PRESETS` in config.js
2. Done. Game logic automatically supports it.

**Coordination:**
Lenny's Settings Menu will provide the UI for difficulty selection. The separation of concerns ensures both can work independently and integrate cleanly.

### Sprint 1 PR Merge Order

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Code review of Sprint 1 PRs #27–#30

#### Decision: Merge Order #27 → #29 → #28 → #30

**Rationale:**
All 4 PRs have cross-branch overlap (shared commits for Nelson history, BFS code, and "S key" UI hint). Merging in this order minimizes the conflict surface:

1. **#27 first** — Triage YAML fix. Clean, no dependencies. Establishes Nelson history baseline.
2. **#29 second** — Ghost AI. Brings in BFS pathfinding + personality overhaul. Nelson history conflict is trivial (identical content from #27).
3. **#28 third** — Difficulty system. BFS code conflict is trivial (identical to #29). Nelson history already resolved. Adds difficulty multipliers on top of the new ghost AI.
4. **#30 last** — Settings menu. "S key" hint conflict is trivial. Settings UI integrates with both difficulty API (from #28) and existing audio system.

**Why not a different order?**
- #28 before #29 would work, but #29 is the stronger PR and introduces the BFS that #28 also includes. Letting #29 establish BFS as "the ghost AI PR" is cleaner conceptually.
- #30 must be last because it depends on difficulty API from #28 (graceful fallback exists, but full integration is better).

**Action for team:** Resolve trivial merge conflicts by accepting either side (content is identical across PRs).

**Status:** Active — ready to execute

### Ghost AI Pathfinding & Personalities (Inbox Merge)

**Date:** 2026-07-24  
**Decided by:** Barney (Game Dev)  
**Context:** Issue #23 — Ghost AI Tuning

#### Decision: BFS Pathfinding with Classic Pac-Man Personalities

**What Changed**
Replaced simple direct-line ghost targeting with BFS pathfinding and implemented distinct Pac-Man-style ghost personalities.

**Technical Implementation**
- **Pathfinding:** BFS algorithm with 20-tile max search depth
  - Queue-based exploration with visited set
  - Parent map for backtracking to find first move
  - Fallback to Euclidean distance if BFS fails
  - Performance: No frame drops with 4 ghosts on 28x31 grid

- **Ghost Personalities (Pac-Man Style):**
  1. **Sr. Burns (Blinky):** Aggressive direct chaser — targets Homer's current tile
  2. **Bob Patiño (Pinky):** Ambush — targets 4 tiles ahead of Homer's direction
  3. **Nelson (Inky):** Calculated — uses vector from Burns to Homer (2 tiles ahead), doubled
  4. **Snake (Clyde):** Patrol/flee — chases when >8 tiles away, flees when close

**Why This Approach**
- BFS is simpler than A* and sufficient for grid-based maze navigation
- 20-tile depth balances pathfinding quality with performance
- Classic Pac-Man behaviors are well-tested for arcade game feel
- Each ghost has distinct strategic value:
  - Burns is relentless pressure
  - Pinky creates ambushes and cuts off escape routes
  - Inky is unpredictable and creates flanking scenarios
  - Snake provides dynamic threat (scary when far, relief when close)

**Preserved Systems**
- Existing scatter/chase/frightened/eaten mode system
- MODE_TIMERS array for scatter↔chase cycles
- Scatter targets from GHOST_CFG config
- Speed modifiers per ghost and difficulty ramp

**Alternative Considered**
Could extract BFS to separate `js/ai-pathfinding.js` module, but kept in `game-logic.js` for simplicity (only ~50 lines, single use case).

**Status:** Implemented in PR #29. Ready for testing and review.

### Cross-Repo Coordination Rule

**Date:** 2026-03-13T20:12Z  
**Decided by:** jperezdelreal (via SS Coordinator)  
**Tier:** T0 (Core Rule)  

**Decision: No Cross-Repo Direct Git Commits**

**What:** No repo may make direct git commits to another repo's branch. ALL cross-repo communication goes through GitHub Issues. Each repo's Squad session owns its git state exclusively.

**Why:** Prevents push conflicts when multiple Ralph Go sessions run concurrently across federated squads.

**API Contract:** Use `gh issue create`, `gh issue comment`, `gh pr review` — NEVER `gh api repos/.../contents -X PUT`.

**Status:** ✅ Active

### Ralph Refueling Behavior

**Date:** 2026-03-13T19:58Z  
**Decided by:** jperezdelreal (via SS Coordinator)  
**Tier:** T1 (System Behavior)

**Decision: Proactive Roadmap Issue Creation on Empty Board**

**What:** When Ralph detects an empty board (no open issues with squad labels, no open PRs), instead of idling:
1. Check if a "Define next roadmap" issue already exists
2. If none exists → create one with Lead assignment
3. If one exists → skip and report status

**Why:** Prevents the autonomous pipeline from fully stopping. Complements reactive workflow with proactive refueling.

**Implementation:** 
```bash
gh issue list --label roadmap --state open --limit 1
gh issue create --title "📋 Define next roadmap" --label roadmap --label "squad:{lead-name}"
```

**Status:** ✅ Active

### Strategic Direction Directive — 2026-03-13T20:44Z

**Date:** 2026-03-13T20:44Z  
**Captured by:** joperezd (via Copilot)  
**For:** Moe (Lead)

**Directive:** Lead should focus on strategic roadmap definition for issue #37. Prioritize vision and planning excellence.

**Status:** Active for sprint cycle

### User Directive — 2026-03-13T20:57Z

**Date:** 2026-03-13T20:57Z  
**Captured by:** joperezd (via Copilot)  
**For:** Team

**Directive:** Blanket merge approval for this session — the team has OK to merge all PRs without individual user approval.

**Status:** Active for session

### Roadmap Strategy Decision

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Issue #37 — Define next roadmap after Sprint 1 completion

#### Decision: Player Journey-Driven Roadmap

**Strategic Framework**

The new roadmap is organized around **three phases of player engagement**, not just feature lists:

1. **Immediate Fun (Items 1-3):** Hook players in first 60 seconds
2. **Deep Engagement (Items 4-6):** Create mastery progression loop
3. **Social Virality (Items 7-10):** Turn players into evangelists

This structure ensures every feature serves a clear purpose in the player journey from first-time visitor → engaged player → returning champion → viral advocate.

**Phase 1: Immediate Fun**

- **Item 1: Tutorial & Onboarding** — Without this, all other features are wasted. Non-patronizing, skippable, fast. Each step interactive and rewarding.
- **Item 2: Combo Multiplier** — Hook for skilled play. Risk-reward loop for ghost-chasing with visual/audio feedback.
- **Item 3: Mobile-First Polish** — 70%+ traffic is mobile. Haptic feedback, larger hit zones, full-screen mode, portrait warnings.

**Phase 2: Deep Engagement**

- **Item 4: Progressive Difficulty & Endless Mode** — Clear progression = player motivation. After level 8, shift to Endless Mode. "One more try" sweet spot.
- **Item 5: Social Sharing** — Web Share API on mobile = one tap. No login, no forms.
- **Item 6: Audio Upgrade** — Delightful audio is 50% of arcade feel. Pitch-varied chomps, spatial sounds, dynamic music tempo.

**Phase 3: Social Virality**

- **Item 7: Ghost AI Debug Mode** — Advanced players understand the system. Shows why ghosts caught them.
- **Item 8: Daily Challenge Mode** — Habit formation via appointment mechanics. Fixed seeds enable fair competition.
- **Item 9: Performance Optimization** — 60fps is foundation. Frame drops destroy arcade immersion.
- **Item 10: Leaderboard & Stats** — Endgame meta-progression. Even localStorage leaderboards create social competition.

**Team Assignment:**
- **Barney (Game Dev):** Combo (#2), Progressive Difficulty (#4), Daily Challenge logic (#8)
- **Lenny (UI Dev):** Tutorial (#1), Mobile polish (#3), Social sharing (#5), Stats dashboard (#10)
- **Nelson (Tester):** Performance (#9), cross-browser testing, metrics validation
- **Moe (Lead):** Audio upgrade (#6), AI debug mode (#7), code review

**Success Metrics:**
- Tutorial: 60%+ Level 1 completion rate
- Combo: 40%+ ghost-chasing increase
- Mobile: 30%+ session length increase
- Endless: 20%+ reach level 10+
- Sharing: 10%+ share rate
- AI Debug: 5%+ usage
- Daily: 25%+ weekly attempts
- Performance: 60fps on iPhone SE
- Leaderboard: 2+ checks per session

**Status:** Active — ready for team execution
**Next Review:** End of Sprint 2

### Sprint 2 Planning Decision — "Immediate Fun" Pillar

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Sprint Planning ceremony for Sprint 2 (Issue #39)

#### Decision: Execute Sprint 2 with Focus on Tutorial, Combo, Mobile, and QA

**Strategic Frame:** Sprint 2 focuses exclusively on the **Immediate Fun** pillar — features that make the game more engaging in the first 60 seconds and on the primary platform (mobile).

**What's IN:**
| # | Issue | Owner | Priority | Why Now |
|---|-------|-------|----------|---------|
| #42 | Tutorial & Onboarding | Lenny | P0 | Reduces bounce rate from ~60% to target ~40%. Prerequisite for everything. |
| #43 | Combo Multiplier System | Barney | P1 | Core "juice" mechanic. Makes ghost-chasing feel rewarding with visual/audio feedback. |
| #44 | Mobile-First Polish | Lenny | P1 | 70% of web arcade traffic is mobile. Larger touch zones, haptic feedback, fullscreen mode. |
| #45 | Sprint 2 QA & Regression | Nelson | P1 | Validate all Sprint 2 features + ensure Sprint 1 features haven't regressed. |

**What's OUT (deferred to Sprint 3+):**
- Progressive Difficulty & Endless Mode (#4)
- Social Sharing (#5)
- Audio Feedback Upgrade (#6)
- Ghost Debug Mode (#7)
- Daily Challenge (#8)
- Performance Optimization (#9)
- Leaderboard & Stats (#10)

**Dependencies:**
```
#42 (Tutorial) ──────┐
#43 (Combo)    ──────┤──→ #45 (QA)
#44 (Mobile)   ──────┘
```

All three feature issues can be developed in parallel. QA runs after features land.

**Success Criteria:**
- Tutorial reduces first-level bounce rate
- Combo system makes ghost-chasing feel rewarding
- Mobile controls feel responsive and satisfying
- Zero P0 regressions from Sprint 1
- All QA checklist items pass

**Status:** ✅ Complete — All Sprint 2 features merged and tested

### Sprint 3 Planning Decision — "Deep Engagement" Pillar

**Date:** 2026-07-24  
**Decided by:** Moe (Lead)  
**Context:** Sprint Planning ceremony for Sprint 3 (Issue #52)

#### Decision: Execute Sprint 3 with Focus on Endless Mode, Audio Upgrade, and Leaderboard

**Strategic Frame:** Sprint 3 focuses on the **Deep Engagement** pillar — features that create mastery progression, sensory depth, and meta-progression. Sprint 2 hooked players in 60 seconds; Sprint 3 gives them reasons to stay for 60 sessions.

**What's IN:**
| # | Issue | Owner | Priority | Why Now |
|---|-------|-------|----------|---------|
| #54 | Progressive Difficulty & Endless Mode | Barney | P0 | Core retention mechanic. Current game ends at level 8 — endless mode creates infinite skill ceiling. "One more try" loop. |
| #55 | Audio Feedback & Juice Upgrade | Barney | P1 | Audio is 50% of arcade feel. Pitch variation, spatial sound, ducking transform functional audio into delightful audio. |
| #56 | Leaderboard & Stats Dashboard | Lenny | P1 | Meta-progression. Players need to SEE improvement. Top 50, lifetime stats, rank badges create goal-setting behavior. |
| #57 | Sprint 3 QA & Regression Testing | Nelson | P1 | Sprint 3 adds significant complexity. Must validate new features + guard Sprint 1-2 gains. Includes performance smoke tests. |

**Success Criteria:**
- Endless mode creates measurable increase in session length
- Audio upgrade makes the game feel noticeably more polished
- Leaderboard drives repeat play behavior
- Zero P0 regressions from Sprint 1-2
- Performance holds at 60fps on mobile

**Status:** ✅ Complete — PRs #61, #62, #63 merged

### Progressive Difficulty & Endless Mode Design

**Date:** 2026-03-14  
**Author:** Barney (Game Dev)  
**Context:** Issue #54 — Progressive Difficulty Curve & Endless Mode (PR #61)

#### Decision: Compound Scaling with Effective Level Abstraction

**What:** Implemented progressive difficulty using compound multipliers (`Math.pow`) and an `getEffectiveLevel()` abstraction that provides a unified difficulty calculation for both curated levels (1-8) and endless mode (9+).

**Why Compound Scaling:** Compound scaling (`* 1.025^level`) provides a natural curve that's noticeable early but diminishes in impact at higher levels, matching classic arcade game difficulty curves (Pac-Man, Galaga).

**Implementation:** 
- Levels 1-8 map directly (no change in behavior)
- Level 9+: `effectiveLevel = 8 + (level - 8) * 0.5`
- Speed cap at 1.8x BASE_SPEED (3.24 px/frame)
- Fright time floor at 90 frames (1.5 seconds at 60fps)

**Status:** ✅ Implemented in PR #61 (closes #54)

### Audio Feedback & Juice Upgrade

**Date:** 2026-07-25  
**Author:** Barney (Game Dev)  
**Context:** Issue #55 — Audio Feedback & Juice Upgrade (PR #63)

#### Decision: Layered Audio Architecture with Config-Driven Tuning

**What:** Extended SoundManager with four new audio subsystems:
1. **Pitch variation** — chomp streak progression + random spread
2. **Spatial audio** — StereoPannerNode for ghost proximity directional hints
3. **Audio ducking** — GainNode automation to duck music during SFX
4. **Dynamic music** — tempo scaling per level + fright mode musical shift

**Why:** Separate buses allow independent control. Config-driven constants enable rapid iteration. GainNode automation provides smooth ducking without clicks/pops.

**Performance:** Spatial updates throttled to 10Hz. No audio nodes created per frame. 289/289 tests pass with zero regressions.

**Status:** ✅ Implemented in PR #63 (closes #55)

### Leaderboard & Stats Dashboard Design

**Date:** 2026-07-25  
**Author:** Lenny (UI Dev)  
**Context:** Issue #56 — Leaderboard & Stats Dashboard (PR #62)

#### Decision: localStorage-Based Leaderboard with Top 50 Tracking

**What:** Persistent leaderboard storing top 50 scores locally with:
- Player name entry
- Score, level reached, combo record per entry
- Lifetime stats dashboard (total games, average score, personal best)
- Rank badges (Master, Expert, Advanced, etc.)

**Why:** localStorage keeps everything on-device (no backend required). Top 50 prevents list bloat while maintaining competition. Badges provide goal-setting behavior.

**Performance:** Leaderboard queries optimized via efficient sorting. Stats calculations cached. No external API calls.

**Status:** ✅ Implemented in PR #62 (closes #56)

### Lead Pipeline Maintenance Directive

**Date:** 2026-03-13T22:55Z  
**Captured by:** joperezd (via Copilot)  
**For:** Moe (Lead)

**Directive:** Lead should ensure a well-maintained issue pipeline aligned with roadmap and vision, enabling Ralph to continue autonomous execution cycles.

**Context:** User request for pipeline health and strategic focus.

**Status:** Active for sprint cycle

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
