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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
