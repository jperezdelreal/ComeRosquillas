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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
