# Settings Menu Architecture Decision

**Date:** 2026-07-24  
**Decided by:** Lenny (UI Dev)  
**Context:** Settings menu implementation for issue #25

## Decision: Modular UI Architecture with js/ui/ Directory

### Rationale
Created a dedicated `js/ui/` directory for UI-specific modules (starting with `settings-menu.js`). This establishes a clear separation between:
- Engine code (`js/engine/`) — core systems like audio, renderer, touch-input
- Game logic (`js/game-logic.js`) — game state and mechanics
- UI modules (`js/ui/`) — player-facing UI components like settings, menus, HUD overlays

### Implementation Details

**Settings persistence:**
- localStorage key: `comeRosquillasSettings`
- Saves on every change (no manual save step)
- Graceful degradation if localStorage unavailable

**Audio integration:**
- Direct manipulation of Web Audio API gain nodes (`_masterGain`, `_musicBus`, `_sfxBus`)
- Uses `setValueAtTime()` for smooth transitions
- Respects existing audio system architecture (no modifications to audio.js needed)

**Difficulty coordination:**
- Calls Barney's difficulty API (`setDifficulty`, `getCurrentDifficulty`) with graceful fallback
- Uses `typeof` checks to handle case where Barney's PR hasn't merged yet
- Settings menu owns the UI, difficulty system owns the data

**Keyboard accessibility:**
- Tab navigation through all focusable elements
- Escape to close
- S key shortcut from start/pause screens
- Enter to activate focused button

### Why This Matters

**For future UI work:**
- Clear pattern for adding new UI modules (tutorial overlay, achievements panel, etc.)
- Consistent styling approach (all CSS in index.html for now)
- Established localStorage persistence pattern

**For team coordination:**
- Settings menu can work independently of Barney's difficulty system (graceful degradation)
- Audio controls work without modifications to existing audio.js
- New modules can be added without touching game-logic.js core

### Success Metrics
- Settings persist across browser sessions ✓
- Audio volume controls work in real-time ✓
- Keyboard navigation fully functional ✓
- Mobile responsive design ✓
- Zero modifications to existing audio.js ✓

### Status
Implemented in PR #30 (squad/25-settings-menu)

### Next Steps
- Consider extracting CSS to separate file if UI modules grow beyond 2-3
- Add settings export/import for advanced users (future enhancement)
- Integrate with tutorial system when Nelson builds it (Sprint 2)
