# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

**Strategic Vision v2:** Phase 1 delivered a complete, polished arcade experience (Immediate Fun → Deep Engagement → Social Virality). Phase 2 focuses on **Depth & Variety** (content that keeps each session fresh), **Polish & Delight** (micro-interactions that create "wow" moments), and **Technical Foundation** (architecture that enables rapid iteration).

---

## 1. [ ] Power-Up Variety & Special Items

**Why this matters:** The current power pellet is the only special item. Adding variety creates decision-making ("should I grab the speed boost or save it?"), surprise moments (rare spawns), and replayability (different item combos each session).

**What it does:** Introduces 5+ new special items beyond the power pellet, each with unique strategic value.

Implementation:
- **Duff Beer (speed boost):** 2x Homer speed for 8 seconds, subtle motion blur effect, beer foam particle trail
- **Donut Box (bonus points):** Spawns rarely (5% chance), worth 1000-5000 points with spinning animation
- **Chili Pepper (slow ghosts):** Ghosts move at 50% speed for 10 seconds, adds steam/heat particle effects
- **Mr. Burns Token (extra life):** Very rare spawn (1% chance), collect 3 for bonus life, golden shimmer effect
- **Lard Lad Statue (invincibility):** 5-second full invulnerability (pass through walls), rainbow trail effect
- Item spawn system: 1 special item per level, weighted probability table in config.js
- Visual indicators: unique sprite per item, pulse/glow effect, collection sound unique to item type
- HUD display: show active power-up icon + timer countdown
- localStorage tracking: "Items Collected" stat in stats dashboard
- Special combos: eating ghosts during Duff+PowerPellet stacks multiplier (2x → 4x)

**Files affected:** `js/game-logic.js`, `js/config.js`, `js/engine/renderer.js`, `js/engine/audio.js`, `js/engine/high-scores.js`

**Success metric:** 80%+ of players collect at least 2 different special items in a session (observable in stats)

---

## 2. [ ] Multiple Maze Themes (Simpsons Locations)

**Why this matters:** 8 levels rotate through 4 mazes. Adding themed visual variations (Moe's Tavern, Kwik-E-Mart, Springfield Elementary) makes each level feel fresh without changing collision geometry.

**What it does:** Reskin existing mazes with Simpsons-themed tile sets and background details.

Implementation:
- 6 visual themes rotate across endless mode levels (every 2-3 levels):
  - **Springfield Streets** (current classic look — keep as default)
  - **Moe's Tavern** (wood paneling walls, beer tap obstacles, Duff neon signs)
  - **Kwik-E-Mart** (store shelves as walls, Squishee machines, magazine racks)
  - **Springfield Elementary** (chalkboard walls, desks, lockers, "Skinner's Office" ghost house)
  - **Nuclear Plant** (radioactive green glow, control panels, reactor core center)
  - **Simpsons House** (living room wallpaper, couch in center, family photos)
- Collision geometry unchanged — only visual tile rendering changes
- Theme determined by level number: `level % 6` selects theme
- Each theme has:
  - Wall tile sprite (repeating pattern)
  - Floor color/texture
    - Background ambient color tint
  - 2-3 decorative sprites (non-collision) placed in empty corners
- Add theme name to HUD: "Level 9 — Moe's Tavern"
- Particle effects match theme (beer foam in tavern, smoke in nuclear plant)

**Files affected:** `js/engine/renderer.js`, `js/config.js`, `icons/` (new theme sprites)

**Success metric:** 60%+ of players recognize at least 3 different themes (survey or feedback analysis)

---

## 3. [ ] Achievement System & Badges

**Why this matters:** Achievements create mini-goals beyond high scores. Completionists love checking boxes. Badges give players something to show off in stats/sharing.

**What it does:** 20+ unlockable achievements that track skill milestones and funny accomplishments.

Implementation:
- Achievement categories:
  - **Skill-based:** "Combo Master" (8x combo), "Perfect Level" (no hits), "Speed Demon" (level in <90sec)
  - **Milestone-based:** "Century Club" (100K points), "Marathon" (level 20), "Ghost Hunter" (100 ghosts eaten)
  - **Discovery-based:** "Completionist" (collect every item type), "Theme Tourist" (play each maze theme)
  - **Funny:** "D'oh Moment" (die within 5 seconds of spawning), "Ghost Whisperer" (survive 60sec without power-up), "Donut Addict" (eat 1000 donuts)
- Achievement data structure: { id, title, description, icon (emoji), unlocked: false, progress: 0, target: 100 }
- localStorage persistence: achievements array saved per-device
- Toast notification on unlock: slide-in banner with sound effect, auto-dismiss after 3sec
- Achievements page in stats dashboard: grid view, progress bars for incomplete, timestamps for unlocked
- Badge display in share text: "I hit 50K points and earned the Century Club badge! 🏆"
- Animated unlock sequence: confetti burst + zoom effect + fanfare audio

**Files affected:** `js/game-logic.js`, `js/engine/high-scores.js`, `js/ui/stats-dashboard.js`, `js/config.js`

**Success metric:** 40%+ of players unlock at least 5 achievements (shows sustained engagement)

---

## 4. [ ] Ghost Personality Enhancements & Boss Ghosts

**Why this matters:** Current ghosts have distinct AI personalities (Sr. Burns, Bob Patiño, Nelson, Snake) but lack visual differentiation beyond color. Boss ghosts add climactic moments.

**What it does:** Visual personality traits + occasional boss ghost encounters that require different tactics.

Implementation:
- **Visual personality indicators:**
  - Sr. Burns: crown icon above head, slower but smarter pathfinding (BFS recalculates every frame)
  - Bob Patiño: speed lines when moving, 20% faster than others
  - Nelson: zigzag wobble animation, occasionally stops to "laugh" (1sec pause)
  - Snake: cigarette smoke particle trail, speed varies randomly ±15%
- **Boss Ghosts (every 5 levels):**
  - Appears as 5th ghost during boss levels (5, 10, 15, 20...)
  - **Fat Tony (Level 5):** 2x HP (requires 2 power-pellet hits to defeat), slow but blocks corridors
  - **Krusty (Level 10):** Drops fake power pellets (blue, but don't work), maniacal laugh audio
  - **Sideshow Bob (Level 15):** Teleports every 10 seconds to random location, rake traps slow Homer
  - **Mr. Burns (Mega Form, Level 20+):** Shoots "productivity lasers" (avoidable projectiles), 3x HP
- Boss intro screen: "Boss Approaching!" with boss portrait + name
- Boss defeat gives 5000 bonus points + achievement unlock
- Boss ghost sprites are 1.5x larger than regular ghosts

**Files affected:** `js/game-logic.js`, `js/engine/renderer.js`, `js/config.js`, `icons/` (boss sprites)

**Success metric:** 70%+ of players who reach level 5 engage with boss mechanic (don't avoid it)

---

## 5. [ ] Procedural Event System (Random Mini-Events)

**Why this matters:** Predictability breeds boredom. Random events inject surprise and force tactical adaptation. "That run where the ghosts got lightning-fast" becomes a story.

**What it does:** 1 in 5 levels triggers a random mini-event that modifies rules for that level only.

Implementation:
- Event types (10+ possibilities, 1 selected randomly per event level):
  - **"Double Trouble":** 2x ghost spawn (8 ghosts instead of 4), more chaos
  - **"Speed Run":** 90-second timer, bonus points if completed in time
  - **"Ghost Frenzy":** All ghosts chase constantly (no scatter mode), intense pressure
  - **"Donut Feast":** 2x donut spawn rate, quicker level completion
  - **"Invincibility Rush":** Power pellets last 3x longer, go crazy
  - **"No Power-Ups":** Power pellets disabled, pure evasion challenge
  - **"Darkness":** Visibility radius around Homer (fog of war), spooky audio
  - **"Reverse Day":** Homer moves backward, controls inverted
  - **"Golden Hour":** All points worth 2x, high score opportunity
  - **"Bonus Stage":** No ghosts, collect all donuts for 10K bonus
- Event announcement: full-screen modal before level starts: "EVENT: Double Trouble! 🎲"
- Event indicator in HUD: icon + name displayed during level
- Events saved in stats: "Events Completed" counter
- Achievement unlocks for completing specific events: "Survived Double Trouble"
- Events more frequent in endless mode (1 in 3 levels after level 15)

**Files affected:** `js/game-logic.js`, `js/config.js`, `js/engine/renderer.js`, `js/engine/audio.js`

**Success metric:** Players mention events in feedback/shares (qualitative signal of memorable moments)

---

## 6. [ ] Screen Shake & Camera Juice

**Why this matters:** Pac-Man's camera is static. Modern arcade games use subtle camera movement to amplify impact. Screen shake on ghost collision, smooth follow on Homer movement — tiny details that make the game "feel" better.

**What it does:** Dynamic camera system that responds to game events with subtle movement and shake effects.

Implementation:
- **Screen shake events:**
  - Ghost collision: medium shake (5px amplitude, 0.3sec duration)
  - Combo milestone hit: escalating shake (2x = light, 4x = medium, 8x = heavy)
  - Boss ghost defeat: heavy shake (10px amplitude, 0.5sec)
  - Power pellet collection: light pulse (zoom 102% → 100% over 0.2sec)
- **Camera follow system:**
  - Smooth lerp camera to keep Homer in center (80% of viewport)
  - Lookahead: camera leads slightly in direction of movement (predictive positioning)
  - Edge padding: don't center if Homer is near maze edge (avoid showing empty space)
- **Zoom effects:**
  - Level start: zoom in from 150% → 100% over 1sec
  - Level complete: zoom out to 90% + fade to white
  - Death: slow-mo + zoom in to 120% on Homer's position
- **Toggleable in settings:** "Camera Effects" on/off for motion-sensitive players
- Performance-conscious: shake disabled on low-end devices (FPS < 45)

**Files affected:** `js/engine/renderer.js`, `js/game-logic.js`, `js/ui/settings-menu.js`, `js/config.js`

**Success metric:** 85%+ of players keep camera effects enabled (default on, measure opt-out rate)

---

## 7. [ ] Enhanced Animation System (Sprite Animations)

**Why this matters:** Current sprites are static. Adding walk cycles, ghost eye movement, and death animations brings characters to life. Players spend 100% of playtime watching these sprites — they should be delightful.

**What it does:** Frame-by-frame sprite animations for all entities.

Implementation:
- **Homer animations:**
  - 4-frame walk cycle (mouth open → closed) per direction (UP/RIGHT/DOWN/LEFT = 16 frames total)
  - Death sequence: 8-frame dissolve animation (Pac-Man style), rotates and shrinks
  - Power-up collection: 2-frame celebratory pose (arms up, smile)
  - Idle animation: subtle breathing (1px up/down) when not moving
- **Ghost animations:**
  - Eyes track Homer's position (pupils rotate toward player within ±45° cone)
  - Frightened mode: eyes become X's, mouth trembles (2-frame loop)
  - Eaten mode: just eyes floating back to ghost house, trailing particles
  - Body sway: subtle 2-frame wobble during movement (left/right 1px)
- **Environmental animations:**
  - Donuts rotate slowly (4-frame spin cycle, 0.5 rotations/sec)
  - Power pellets pulse (scale 90% → 110% → 90%, 1sec cycle)
  - Special items shimmer (2-frame glow effect)
- Animation frame tracking in game-logic.js: frameCounter increments each tick, sprites index frames via modulo
- Sprite sheet organization: single PNG with all frames, indexed via config.js offsets
- Performance: skip animation frames if FPS < 30 (show frame 0 only)

**Files affected:** `js/engine/renderer.js`, `js/game-logic.js`, `js/config.js`, `icons/` (sprite sheet)

**Success metric:** Qualitative feedback improvement — players describe game as "polished" or "smooth"

---

## 8. [ ] Accessibility Enhancements

**Why this matters:** Current game is not accessible to colorblind players (ghost colors), keyboard-only users (no focus indicators), or screen-reader users (no ARIA labels). Accessibility is both ethical and expands player base.

**What it does:** Comprehensive accessibility improvements across visual, input, and audio domains.

Implementation:
- **Colorblind modes (3 types):**
  - Protanopia (red-weak): adjust ghost color palette to blue/yellow/purple/orange spectrum
  - Deuteranopia (green-weak): similar adjustments
  - Tritanopia (blue-weak): warm spectrum palette
  - Setting: "Colorblind Mode" dropdown in settings menu
  - Ghosts also display persistent icon above head (Sr. Burns = 👔, Bob = 🔪, Nelson = 😂, Snake = 🚬)
- **Keyboard accessibility:**
  - Tab navigation through all UI elements (settings, leaderboard, share menu)
  - Visual focus indicators (2px blue outline on focused element)
  - Spacebar to pause/unpause
  - Enter to select focused button
  - Escape to close modals (already works, ensure consistency)
- **Screen reader support:**
  - ARIA labels on all buttons, links, inputs
  - Live region announces: "Level complete! Score: 12,450" (sr-only div)
  - Game state changes announced: "Powered up for 10 seconds", "Ghost eaten! 400 points"
  - Announce combo milestones: "Combo 4x! Multiplier active"
- **Visual clarity:**
  - High-contrast mode (Settings toggle): black walls, white bg, bright sprites
  - Reduce motion mode: disable particles, screen shake, smooth animations
  - Larger text option: 120% UI scale for HUD and menus
- **Audio accessibility:**
  - Visual indicators for audio cues (on-screen icon when ghost is near)
  - Subtitles for audio events: "[Ghost Eaten]", "[Power-Up Collected]"

**Files affected:** `js/engine/renderer.js`, `js/ui/settings-menu.js`, `index.html`, `js/config.js`, `styles.css` (new or inline)

**Success metric:** 0 critical accessibility issues detected by WAVE or axe DevTools

---

## 9. [ ] Code Architecture Refactor (Tech Debt Pass)

**Why this matters:** 85KB game-logic.js is becoming unwieldy. Adding features is slower because of tight coupling. Modular architecture enables faster iteration and easier testing.

**What it does:** Refactor monolithic game-logic.js into focused modules without changing external behavior.

Implementation:
- **Extract modules from game-logic.js:**
  - `js/engine/entity-manager.js` — entity spawn, update, lifecycle (Homer + ghosts)
  - `js/engine/collision-detector.js` — AABB collision, donut collection, ghost hits
  - `js/engine/scoring-system.js` — score calculation, combos, bonus points, lives
  - `js/engine/level-manager.js` — level transitions, maze loading, endless mode progression
  - `js/engine/ai-controller.js` — ghost personalities, BFS pathfinding, mode switching
- **Preserve game-logic.js as orchestrator:**
  - Thin integration layer that coordinates modules
  - Owns game state machine (ST_START, ST_PLAYING, ST_DYING, etc.)
  - Delegates entity updates, collision checks, scoring to modules
  - Public API unchanged — main.js and tests work without modification
- **Module interfaces:**
  - Each module exports class with clear constructor(config, dependencies)
  - Dependencies injected (renderer, audio, high-scores) — no global state
  - Each module testable in isolation
- **Migration strategy:**
  - Move 1 module at a time (commit per module)
  - Run full test suite after each move (504 tests must pass)
  - No feature changes during refactor — pure behavior-preserving extraction
- **Documentation:**
  - Add JSDoc comments to all public methods
  - Create `docs/architecture.md` explaining module relationships

**Files affected:** `js/game-logic.js` (shrinks 85KB → ~20KB), `js/engine/*.js` (5 new modules), `docs/architecture.md` (new)

**Success metric:** Test suite passes with 0 failures, game plays identically to pre-refactor

---

## 10. [ ] Localization Support (i18n)

**Why this matters:** Game is Simpsons-themed — universal appeal but English-only UI limits reach. Spanish localization doubles potential audience (Latin America loves Simpsons). French/German/Portuguese expand European reach.

**What it does:** Full UI localization system supporting 5 languages with runtime language switching.

Implementation:
- **Supported languages (launch with 2, expand to 5):**
  - English (default, already exists)
  - Spanish (es) — high priority (Latin America + Spain markets)
  - French (fr) — European reach
  - German (de) — European reach
  - Portuguese (pt-BR) — Brazil market
- **Localization architecture:**
  - `js/i18n/translations.js` — key-value dictionaries per language
  - All UI strings moved from hardcoded to translation keys: `t('game.level_complete')`
  - Settings menu: "Language" dropdown (flags + names)
  - Selected language saved to localStorage
  - Runtime language switch without page reload (re-render UI elements)
- **Scope of translation:**
  - All UI text: menus, buttons, HUD labels, tutorial steps, achievements
  - Game over messages: localized Homer quotes (D'oh! → ¡Ay, caramba! in Spanish)
  - Error messages, toast notifications
  - Tutorial overlays (step-by-step instructions)
  - Does NOT translate: sprite text (too complex), audio (procedural)
- **Fallback strategy:**
  - Missing translations fall back to English
  - Partial translations OK (show English for untranslated keys)
- **Translation file structure:**
  ```js
  const translations = {
    en: { 'game.level_complete': 'Level Complete!', ... },
    es: { 'game.level_complete': '¡Nivel Completado!', ... }
  }
  ```
- **Testing:**
  - Nelson validates all 5 languages render correctly (no overflow, character encoding)
  - Check mobile layout with longer German words

**Files affected:** `js/i18n/translations.js` (new), all `js/ui/*.js` files, `js/engine/renderer.js`, `js/game-logic.js`, `index.html`

**Success metric:** 15%+ of players switch from default English to another language
