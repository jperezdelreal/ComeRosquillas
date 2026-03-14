# Project Context

- **Owner:** joperezd
- **Project:** ComeRosquillas — Homer's Donut Quest, a Pac-Man style web arcade game
- **Stack:** Vanilla HTML/JS/Canvas, no frameworks, Astro docs site
- **Upstream:** FirstFrameStudios (subsquad)
- **Created:** 2026-07-24

## Key Files

- `index.html` — game page with canvas, HUD, touch controls, CSS
- `js/engine/touch-input.js` — touch/mobile controls
- `js/engine/audio.js` — Web Audio API procedural sound system with master/music/sfx bus architecture
- `js/game-logic.js` — main game loop and state machine
- `js/ui/settings-menu.js` — settings overlay UI module
- `docs/` — Astro documentation site

## Learnings

### Settings Menu Implementation (Issue #25)

**Architecture decisions:**
- Created modular `js/ui/` directory for UI-specific modules (settings-menu.js)
- Settings overlay uses vanilla CSS modal pattern with backdrop-filter blur
- localStorage key: `comeRosquillasSettings` stores all user preferences
- Settings menu gracefully handles missing Barney APIs (difficulty system) with typeof checks

**Audio volume control integration:**
- Audio system uses three-tier bus architecture: `_masterGain` → `_sfxBus` / `_musicBus` → destination
- Master volume: controls `_masterGain.gain.value` (0-1 scale)
- Music volume: controls `_musicBus.gain.value` (base 0.07, scaled by percentage)
- SFX volume: controls `_sfxBus.gain.value` (base 0.8, scaled by percentage)
- Music toggle: uses `setValueAtTime()` for smooth transitions, with fallback to direct assignment

**UI patterns:**
- Settings button: fixed position top-left, yellow donut theme (#ffd800)
- Keyboard shortcuts: S key opens settings from start/pause screens, Escape closes, Tab navigation
- Responsive design: modal scales to 95% width on mobile, stacks controls vertically
- Accessibility: ARIA labels, keyboard navigation, focus management with setTimeout for modal mount

**Integration points:**
- Game class: initialize SettingsMenu in constructor after setupInput()
- Settings button: attach click listener to `#settingsBtn` element
- Difficulty coordination: calls `setDifficulty(level)` and `getCurrentDifficulty()` if Barney's API exists

**CSS organization:**
- All settings styles in index.html `<style>` block (no external CSS files)
- Follows game aesthetic: purple gradients (#2d1b69 → #1a0a2e), yellow accents (#ffd800)
- Custom slider styling: `-webkit-slider-thumb` and `-moz-range-thumb` for cross-browser support
- Custom toggle switches: checkbox with `::before` pseudo-element for sliding animation

**Key learnings for future work:**
- Always load settings-menu.js before game-logic.js in script order
- Settings overlay appends to `document.body`, not `#gameContainer` (z-index independence)
- localStorage persistence happens on every change (no manual save step needed)
- Audio bus values must be set via `setValueAtTime()` in AudioContext to avoid console warnings

### Tutorial & Onboarding System (Issue #42)

**Architecture decisions:**
- Created `js/ui/tutorial.js` following the established `js/ui/` modular pattern
- Tutorial overlay uses DOM elements (same as settings-menu.js), not Canvas rendering for text/buttons
- Canvas mini-illustrations embedded inside tutorial cards for animated step demonstrations
- localStorage key: `comeRosquillas_tutorialComplete` — simple boolean flag for first-visit detection

**Tutorial flow:**
- 3-step click-to-continue walkthrough: Movement → Power Pellets → Ghost Eating
- Each step has a mini Canvas animation illustrating the mechanic
- Desktop shows arrow key highlights, mobile shows swipe arrows
- "Skip Tutorial" always available (ESC on desktop, button on mobile)
- Celebration particle burst uses game's existing `addParticles()` system

**Integration points:**
- Game class: Tutorial initialized after settings menu, before `showStartScreen()`
- First-visit check: `setTimeout(() => this.tutorial.start(), 300)` gives start screen time to render
- Settings menu: `_game` reference set on SettingsMenu instance for "Show Tutorial" button access
- Tutorial.reset() clears localStorage flag and restarts the tutorial from settings menu

**CSS organization:**
- All tutorial styles added to index.html `<style>` block (following existing convention)
- Uses same color palette: purple gradients (#2d1b69), yellow accents (#ffd800), pink highlights (#ff69b4)
- Responsive breakpoint at 700px matches existing settings modal pattern
- `z-index: 2000` ensures tutorial renders above settings overlay (z-index: 1000)

**Key learnings for future work:**
- When concurrent agents share the same repo, git branch operations can race — always verify branch before committing
- Tutorial module is fully self-contained — can be loaded/unloaded without modifying core game logic
- Cross-module communication pattern: store parent reference (e.g., `_game`) rather than using globals
- Script load order: tutorial.js must load after settings-menu.js but before game-logic.js

### Mobile-First Polish Pass (Issue #44)

**Architecture decisions:**
- TouchInput class extended with haptic, fullscreen, and orientation subsystems — no new files needed
- Haptic feedback uses Vibration API with pattern arrays: `navigator.vibrate([ms, pause, ms])` for tactile differentiation
- Haptic preference stored in localStorage key: `comeRosquillas_haptic` (default: enabled)
- Fullscreen uses Fullscreen API with `webkitRequestFullscreen` fallback for iOS Safari compatibility
- Orientation warning is pure CSS: `@media (hover: none) and (pointer: coarse) and (orientation: portrait)`
- D-pad visual feedback via CSS class toggle (`.dpad-active`) instead of inline `setAttribute('fill')` for better performance

**Touch zone enlargement:**
- SVG viewBox increased from `0 0 120 120` to `0 0 160 160` (33% larger coordinate space)
- Arrow paths proportionally enlarged (e.g., up arrow `M60,20 L75,45` → `M80,15 L105,55`)
- Element CSS size increased from 120px to 160px
- On <480px screens, D-pad scales to 140px to fit smaller viewports

**Haptic feedback integration:**
- Three game events wired: ghost collision `[50,30,80]`, power pellet `[15,10,25]`, ghost eaten `[20,10,30]`
- Haptics called via `this.touchInput.vibrate()` in game-logic.js with null-check guard
- D-pad buttons and swipes also trigger micro-haptic (8ms) for tactile confirmation

**PWA manifest:**
- `manifest.json` with `display: fullscreen`, `orientation: landscape`
- SVG icons at 192x192 and 512x512 in `icons/` directory
- Meta tags: `theme-color`, `apple-mobile-web-app-capable`, `viewport-fit: cover`

**Key learnings for future work:**
- Bottom bar (keyboard hints) hidden on touch devices — desktop-only UI element
- Pause button at `right: 20px` is optimal thumb position (tested against 80px)
- CSS `@media (hover: none) and (pointer: coarse)` is the reliable touch device detector
- Small-screen (<480px) breakpoint needs separate treatment from mobile (<700px)
- Fullscreen API requires `catch(() => {})` on promise — some browsers reject silently

### Leaderboard & Stats Dashboard (Issue #56)

**Architecture decisions:**
- Created `js/ui/stats-dashboard.js` following established `js/ui/` modular pattern
- Stats dashboard uses DOM overlay (z-index: 1500, between settings 1000 and tutorial 2000)
- Two-tab layout: Leaderboard (scrollable top 50 table) and Stats (lifetime metrics + rank badges)
- Upgraded HighScoreManager from top 10 to top 50, with extended entry fields (difficulty, donutsEaten, ghostsEaten)
- Lifetime stats stored separately: localStorage key `comeRosquillas_lifetimeStats`

**Data schema design:**
- High score entries: name, score, level, combo, difficulty, donutsEaten, ghostsEaten, date
- Lifetime stats: totalGames, totalDonutsEaten, totalGhostsEaten, highestCombo, highestLevel, totalPlayTimeMs, bestScoreByDifficulty
- Schema designed for compatibility with Barney's Endless Mode (#54) - highestLevel field accommodates endless progression
- addScore() accepts optional gameStats parameter (backward compatible)

**Rank badge system:**
- Four tiers: Beginner (0+ donuts), Regular (1000+), Expert (5000+), Master (20000+)
- Defined as RANK_BADGES array in config.js (descending order for first-match lookup)
- Rank shown on start screen, leaderboard banner, and stats dashboard
- Progress bar toward next rank in stats view

**Key learnings for future work:**
- When concurrent branches modify the same files, use typeof guards for cross-branch compatibility
- Start screen shows top 5 only with "...and N more" link to avoid scroll overflow
- RANK_BADGES array is sorted highest-first for efficient first-match lookup
- Per-game stat tracking must reset in startNewGame() and capture in game-end handlers
- Script load order: stats-dashboard.js after tutorial.js, before renderer.js

### Social Sharing & Viral Hooks (Issue #67)

**Architecture decisions:**
- Created `js/ui/share-menu.js` following the established `js/ui/` modular pattern
- ShareMenu overlay uses z-index: 1600 (above stats dashboard at 1500, settings at 1000)
- Web Share API with graceful fallback to clipboard copy + toast notification
- Canvas screenshot via `toDataURL('image/png')` with score overlay bar appended to bottom
- QR code generated procedurally on Canvas 2D — no external library (Version 2-like pattern with finder/timing/alignment)
- Referral tracking stored in localStorage key: `comeRosquillas_referrals` (array of {ref, seed, timestamp})
- Challenge URLs use query params: `?ref=challenge&seed=X&target=Y`

**Share menu features:**
- Four action buttons: Native Share (mobile only), Copy Link, Screenshot, Challenge
- Score card displays current score with level, combo, donuts eaten, ghosts eaten
- QR code section visible on desktop, hidden on small screens (<480px)
- Toast notification system with slide-up animation and auto-dismiss
- Responsive: 2-column grid on desktop → single column on mobile

**Game-over integration:**
- "Share Your Score" button injected into game-over message HTML (both normal and high-score paths)
- Button uses inline onclick calling `window._game.shareMenu.open()` (game instance stored as `window._game`)
- H key shortcut opens share menu from game-over and start screens
- Challenge banner displayed on start screen when arriving via challenge URL (`?target=X`)

**Integration points:**
- Game class: ShareMenu initialized in constructor after StatsDashboard
- `window._game` reference set in Game constructor for inline onclick access
- `_shareButtonHtml()` and `_challengeBannerHtml()` helper methods on Game class
- Script load order: share-menu.js after stats-dashboard.js, before renderer.js
- Start screen includes H=Share in control hints

**CSS organization:**
- All share menu styles in index.html `<style>` block (following existing convention)
- Uses same color palette: purple gradients (#2d1b69), yellow accents (#ffd800), pink (#ff69b4)
- Action buttons use distinct gradient colors: green (share), blue (copy), orange (screenshot), pink (challenge)
- Responsive breakpoints at 700px and 480px matching existing patterns
- Slide-in animation (`shareSlideIn`) for modal appearance

**Key learnings for future work:**
- `window._game` global reference is now available for inline onclick handlers in message HTML
- Web Share API requires `navigator.share` feature check — not available on all desktop browsers
- Canvas `toDataURL()` captures current frame state — works even during game-over with maze visible
- QR code procedural generation uses finder patterns, timing patterns, and alignment patterns with deterministic hash fill
- Clipboard API requires `navigator.clipboard.writeText()` with textarea fallback for older browsers
- Share menu is fully self-contained — can be loaded/unloaded without modifying core game logic

### Daily Challenge Mode (Issue #69)

**Architecture decisions:**
- Created `js/ui/daily-challenge.js` following the established `js/ui/` modular pattern
- DailyChallenge overlay uses z-index: 1800 (above share menu at 1600, stats at 1500)
- 7 challenge types defined as `DAILY_CHALLENGE_TYPES` config array in `js/config.js`
- Seeded PRNG using FNV-1a hash of `YYYY-MM-DD` date string — deterministic across all players
- Separate daily leaderboard: localStorage key `comerosquillas-daily` (top 10 per day)
- Challenge history: localStorage key `comerosquillas-daily-history` (completion dates, streak, badge)
- Challenge rules implemented as modifier functions (`applyModifiers`, `getScoreMultiplier`, `getGhostSpeedBonus`)

**Challenge types and modifiers:**
- Speed Run: 90s timer via `setInterval` with HUD countdown display (`#dailyTimerDisplay`)
- Ghost Hunter: ghost target tracked via existing `_gameGhostsEaten` counter
- Perfect Run: lives set to 1, score multiplier 2x
- No Power-Ups: POWER cells converted to DOT in maze during `applyModifiers()`
- Donut Feast: extra DOT cells seeded into EMPTY spaces using seeded PRNG
- High Score Attack: 1.5x score multiplier applied to dot/ghost scoring
- Survival: 1 life, 2x score, 10% ghost speed bonus

**Integration points:**
- Game class: DailyChallenge initialized in constructor after ShareMenu
- `_dailyChallenge` property on Game stores active challenge reference
- `_dailyTimeUp` flag checked in game loop for Speed Run timeout
- `startNewGame()` calls `DailyChallenge.applyModifiers()` after `initLevel()`
- Score multiplier injected into `checkDots()` (dot/power scoring) and `checkCollisions()` (ghost eating)
- Ghost speed bonus applied in `getSpeed('ghost')` via `DailyChallenge.getGhostSpeedBonus()`
- Daily score submitted on game-over (both high-score-entry and non-high-score paths)
- D key shortcut opens daily challenge panel from start/pause/game-over screens
- Daily challenge banner with click-to-open on start screen (`_dailyChallengeBannerHtml()`)
- HUD shows challenge name/emoji instead of level name during active challenge

**Leaderboard badge integration:**
- `DailyChallenge.getChallengeBadge()` static method returns badge based on total challenges completed
- Badge shown on stats-dashboard leaderboard rank banner (stats-dashboard.js)
- Four badge tiers: Challenger (1+), Challenge Regular (7+), Challenge Master (14+), Challenge Legend (30+)

**CSS organization:**
- All daily challenge styles in index.html `<style>` block (following existing convention)
- Uses same color palette: purple gradients, yellow accents, pink highlights
- Challenge card border colored per challenge type (e.g., red for Speed Run, gold for Perfect Run)
- Responsive breakpoint at 700px matching existing patterns
- Reuses `shareSlideIn` animation for modal appearance

**Key learnings for future work:**
- Seeded PRNG pattern: `hashDate()` + `seededRandom()` can be reused for any deterministic game variation
- Challenge modifier pattern: modifier functions applied after `initLevel()` in `startNewGame()` — clean separation
- Timer management: `setInterval` with `_timerInterval` ref, cleared on challenge end and game-over
- D key is shared with debug toggle during gameplay — daily challenge D only fires from start/pause/gameover states
- Daily challenge state must be cleaned up on game-over return-to-start (Enter key handler)
- Script load order: daily-challenge.js after share-menu.js, before renderer.js

### Screen Shake & Camera Juice System (Issue #94)

**Architecture decisions:**
- Extended existing `screenShakeTimer`/`screenShakeIntensity` system — no replacement, backward-compatible
- `CAMERA_CONFIG` constant in config.js centralizes all camera parameters (shake, zoom, follow, FPS threshold)
- Camera juice methods (`triggerShake`, `triggerZoom`, `_updateCamera`, `_isCameraEnabled`) added to Game class
- All effects gated behind `_isCameraEnabled()` which checks: `CAMERA_CONFIG` exists, `_cameraEffectsEnabled`, `!_cameraAutoDisabled`
- `typeof CAMERA_CONFIG !== 'undefined'` guards at every call site for cross-branch compatibility

**Camera transform pipeline:**
- Single `ctx.save()/restore()` wrapping zoom + follow + shake transforms in `draw()`
- Zoom: translate to center → scale → translate back (zoom around canvas center)
- Follow: smooth lerp toward Homer with directional lookahead, clamped at maze edges
- Shake: sine-based oscillation with linear decay (same pattern as original)
- Zoom-out artifact prevention: full canvas clear via `setTransform(1,0,0,1,0,0)` when zoom < 1.0
- Level complete white flash overlay: separate from camera transform, applied after restore

**Zoom effects:**
- Level start: instant set to 1.5x, ease-out cubic to 1.0x over 60 frames
- Level complete: zoom to 0.9x over 40 frames
- Death: zoom to 1.2x over 45 frames
- Power pellet: subtle 1.02x pulse over 12 frames
- All zoom returns to 1.0 via smooth lerp when timer expires

**Settings integration:**
- `cameraEffects: true` added to SettingsMenu defaults (both constructor and resetToDefaults)
- Toggle in Camera Effects section (between Tutorial and Ghost AI Debug)
- `_syncCameraToGame()` pushes preference to `game._cameraEffectsEnabled`
- Auto-disable: FPS checked every 120 frames (~2s), disables all effects if < 45 FPS

**Key learnings for future work:**
- Python patch scripts reading from `git show main:file` are the reliable way to apply clean changes when multiple branches share files
- Combo shake presets ('comboLight', 'comboMedium', 'comboHeavy') replace hardcoded values for consistency
- Camera follow uses 20% of viewport offset (viewportRatio 0.8) — subtle enough not to disorient
- Edge padding of 3 tiles prevents camera from centering too close to maze borders

### Achievement System & Badges (Issue #98)

**Architecture decisions:**
- Created `js/ui/achievements.js` following the established `js/ui/` modular pattern (moved from engine/ to ui/)
- AchievementManager uses event-driven `notify(event, game)` pattern — game-logic.js calls notify at 12 key points
- Toast notifications are DOM-based (not Canvas), using z-index 10000 with CSS slide-in animation
- Confetti animation uses a dedicated fixed-position canvas overlay (z-index 10001), independent of game canvas
- localStorage key: `comeRosquillas_achievements` stores unlocked timestamps + discovery progress (power-up types, themes)
- Achievement progress for lifetime stats (ghosts, donuts, games) read directly from HighScoreManager.lifetimeStats — no duplication

**Achievement tracking integration points:**
- `notify('ghost_eaten', game)` — in checkCollisions after ghost eat (combo master, ghost streak, first blood)
- `notify('level_complete', game)` — in checkDots when all dots eaten (perfect level, speed demon, pacifist, marathon)
- `notify('death', game)` — in checkCollisions on ST_DYING transition (D'oh moment, scoreAtLastDeath reset)
- `notify('game_over', game)` — at all 3 game-over paths (lifetime milestone checks)
- `notify('score_update', game)` — after dot/power-up scoring (century club, rising star, untouchable)
- `notify('power_pellet', game)` — resets ghost whisperer timer
- `notify('power_up_collected', game)` — tracks power-up types for completionist
- `notify('power_up_combo', game)` — combo alchemist unlock
- `notify('tick', game)` — every 60 frames during ST_PLAYING (ghost whisperer: 3600 frames = 60s)
- `notify('direction_change', game)` — when direction actually changes in moveHomer (button masher)
- `notify('level_start', game)` — on ST_READY→ST_PLAYING transition (theme tracking)
- `notify('daily_complete', game)` — after daily challenge score submission

**Per-level tracking variables added to Game class:**
- `_levelHitsTaken` — reset in initLevel, incremented on death (for perfect level)
- `_levelPlayStartTime` — set when ST_READY→ST_PLAYING (for speed demon, D'oh moment)
- `_levelGhostsEatenCount` — per-level ghost count (for pacifist)
- `_levelDirectionChanges` — direction change count (for button masher)
- `_noPowerPelletFrames` — frames since last power pellet (for ghost whisperer)
- `_scoreAtLastDeath` — score when last died (for untouchable: 50K without dying)
- `_lastCollectedPowerUpId` — last collected power-up type ID (for completionist)

**Stats dashboard integration:**
- Third tab "Achievements" added to stats-dashboard.js (alongside Leaderboard and Stats)
- `renderAchievements()` method delegates to `AchievementManager.renderAchievementsPanel(container)`
- Clear achievements data supported via existing clear confirmation flow
- 'A' key shortcut opens achievements tab directly

**Audio integration:**
- `achievement` SFX case added to SoundManager.play() — rising arpeggio (C5-E5-G5-C6) with shimmer and chime
- Uses existing `_duckMusic()` for ducking during unlock fanfare

**Key learnings for future work:**
- When a branch already has partial implementation from a prior agent, always check HEAD for existing code before applying changes
- `ACHIEVEMENT_CATEGORIES` should be an array (not object) for iteration in renderAchievementsPanel
- `_unlock()` is idempotent — safe to call repeatedly without duplicate toasts or saves
- DOM-based toast approach is cleaner than Canvas-drawn toasts: no interference with game render loop, survives state transitions
- Script load order: achievements.js must load after high-scores.js but before game-logic.js

<!-- Append new learnings below. Each entry is something lasting about the project. -->
