# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

**Strategic Vision:** Transform ComeRosquillas from a solid Pac-Man clone into a viral mobile arcade experience. Focus on three pillars: **Immediate Fun** (smooth onboarding, juice), **Deep Engagement** (skill mastery, risk-reward gameplay), and **Social Virality** (sharing, competition, replayability).

---

## 1. [x] First-Time Player Tutorial & Onboarding Flow ✅ COMPLETED (Sprint 2)

**Why this matters:** Most players decide if they'll continue within 30 seconds. A smooth, engaging tutorial is critical for mobile web games where attention is fleeting.

**What it does:** Interactive overlay system that teaches core mechanics without feeling like a chore.

Implementation:
- Tap/click to continue tutorial overlay system (non-blocking)
- Step 1: Move Homer with arrow keys / swipe — show ghost approaching
- Step 2: Eat a power pellet — highlight effect and ghost turning blue
- Step 3: Eat a frightened ghost — show score pop-up
- Visual "tap to continue" indicator on mobile
- Skippable with ESC or "Skip Tutorial" button
- localStorage flag to show tutorial only once per device
- Optional "Show Tutorial" from settings menu
- Animated arrows pointing to UI elements (score, lives, difficulty)
- Celebration particle burst when tutorial completes

**Files affected:** `js/ui/tutorial.js` (new), `js/game-logic.js`, `js/engine/renderer.js`, `js/main.js`, `index.html`

**Success metric:** Players complete level 1 at 60%+ rate (up from current ~40% estimated)

---

## 2. [x] Combo Multiplier System ✅ COMPLETED (Sprint 2)

**Why this matters:** Risk-reward mechanics create skill expression. Chaining kills during power-pellet windows is the core "high-level play" that separates casual from skilled players.

**What it does:** Visual combo feedback that makes ghost-chasing feel rewarding and encourages aggressive play.

Implementation:
- Track consecutive ghosts eaten within single power-pellet window
- Display animated combo counter: 1x → 2x → 4x → 8x
- Apply multiplier to ghost base score: 200 → 400 → 800 → 1600
- Particle burst + screen shake on milestone hits (2x, 4x, 8x)
- Audio sting for each milestone (rising pitch progression)
- Reset combo when power effect expires or level ends
- Display "Best Combo: Nx" on HUD
- Persist all-time best combo to localStorage
- Add combo stat to high-score entry screen

**Files affected:** `js/game-logic.js`, `js/engine/renderer.js`, `js/config.js`, `js/engine/audio.js`

**Success metric:** Players chase ghosts 40% more often during power-pellets (observable in playtests)

---

## 3. [x] Mobile-First Polish Pass ✅ COMPLETED (Sprint 2 + Sprint 5)

**Why this matters:** 70%+ of web arcade game traffic is mobile. Touch controls need to feel as good as arcade joysticks.

**What it does:** UI/UX improvements specifically targeting mobile play experience.

Implementation:
- Larger touch zones for directional input (current zones are too small)
- Visual feedback on touch input (highlight active direction button)
- Haptic feedback on collisions, power-ups, ghost eaten (vibrate API)
- Full-screen mode toggle (hides browser chrome on Android/iOS)
- Portrait orientation warning overlay ("Rotate device for best experience")
- Pause button moved to top-right for thumb accessibility
- Simplified UI for small screens (reduce visual clutter)
- Performance optimization: reduce particle counts on low-end devices
- Test on Safari iOS (canvas rendering issues), Chrome Android
- Add PWA manifest.json for "Add to Home Screen" prompt

**Files affected:** `js/engine/touch-input.js`, `js/engine/renderer.js`, `index.html`, `manifest.json` (new)

**Success metric:** Mobile session length increases 30%+ (currently ~2 min average)

---

## 4. [x] Progressive Difficulty Curve & Endless Mode ✅ COMPLETED (Sprint 3)

**Why this matters:** Players need a clear sense of progression. Mastery should be rewarded with greater challenges, not just higher numbers.

**What it does:** Dynamic difficulty scaling that keeps players in "flow state" — always challenged but never overwhelmed.

Implementation:
- After level 8 (current maze rotation ends), introduce "Endless Mode"
- Endless Mode tweaks each level:
  - Ghost speed increases by 2% per level
  - Fright duration decreases by 3% per level (minimum 60 frames)
  - Extra life threshold increases by 1000pts per level
  - More aggressive AI: longer chase phases, shorter scatter
- Visual indicator: "Endless Mode — Level 9" with infinity symbol
- Track separate high score for Endless Mode
- Add "Level Reached" stat to leaderboard
- Display difficulty multipliers in pause menu ("Ghosts: +18% speed")
- Death shows how far you got: "You survived to Level 14!"

**Files affected:** `js/game-logic.js`, `js/config.js`, `js/engine/renderer.js`, `js/engine/high-scores.js`

**Success metric:** 20%+ of players reach level 10+ (showing long-term engagement)

---

## 5. [x] Social Sharing & Viral Hooks ✅ COMPLETED (Sprint 4)

**Why this matters:** Players become evangelists when they have something to brag about. Make sharing effortless and rewarding.

**What it does:** Share buttons and hooks that turn accomplishments into social content.

Implementation:
- "Share Your Score" button on game-over screen
- Generate shareable text: "I scored 47,850 points on ComeRosquillas! Can you beat me? 🍩" + URL
- Web Share API integration (native sharing on mobile)
- Fallback: copy-to-clipboard with toast notification
- Optional: Canvas screenshot with score overlay (downloadable image)
- Embed player stats in share: "Level 12, 8x Combo, 3 Lives Left!"
- QR code on desktop version pointing to mobile-friendly URL
- Add "Challenge a Friend" mode with seed-based URL parameters
- Track referral sources in localStorage (if player arrived via shared link)

**Files affected:** `js/ui/share-menu.js` (new), `js/game-logic.js`, `index.html`

**Success metric:** 10%+ share rate on game-over (industry benchmark for casual games)

---

## 6. [x] Audio Feedback & Juice Upgrade ✅ COMPLETED (Sprint 3)

**Why this matters:** Arcade games feel great because every action has satisfying feedback. Current audio is functional but not delightful.

**What it does:** More responsive audio that makes every donut, ghost, and power-up feel impactful.

Implementation:
- Donut collection: add pitch variation (random ±10%) so each donut sounds unique
- Ghost collision: ominous low bass hit + fade-to-silence
- Combo milestone sounds: escalating electronic riffs (synthesized)
- Level complete: triumphant fanfare with chord progression
- Frightened ghost chase: faster background music tempo during power mode
- Audio ducking: background music quieter when ghost is near
- Spatial audio: ghost sounds pan left/right based on screen position
- Settings: separate volume sliders for SFX, Music, Ambient
- Optional: "Classic Mode" toggle (original Pac-Man beeps)

**Files affected:** `js/engine/audio.js`, `js/game-logic.js`, `js/ui/settings-menu.js`

**Success metric:** Player-reported satisfaction increase (A/B test with audio on/off)

---

## 7. [x] Ghost Personality Visual Indicators (Debug Mode) ✅ COMPLETED (Sprint 4)

**Why this matters:** For developers and advanced players, understanding AI behavior enhances gameplay strategy. Also critical for balancing ghost difficulty.

**What it does:** Optional overlay showing AI state, target positions, and personality behaviors.

Implementation:
- Settings menu toggle: "Show Ghost AI Debug Info"
- When enabled, display above each ghost:
  - Current mode icon: 👁️ (chase) / 🏃 (scatter) / 😱 (frightened) / 💀 (eaten)
  - Target tile outline (red box on grid)
  - Pathfinding breadcrumb trail (fading dots)
  - Personality-specific indicator:
    - Sr. Burns: Crosshair on target
    - Bob Patiño: Speed boost effect lines
    - Nelson: Zigzag erratic path preview
    - Snake: Speed variance % displayed
- Dev Console: Press ~ to show FPS, entity count, collision checks per frame
- Personality tuning sliders (Settings → Advanced):
  - Ghost aggression (0-100%)
  - Chase distance threshold
  - Scatter duration multiplier
- Save custom AI profiles to localStorage

**Files affected:** `js/engine/renderer.js`, `js/game-logic.js`, `js/ui/settings-menu.js`, `js/config.js`

**Success metric:** Used by 5%+ of players (signals engaged player base)

---

## 8. [x] Daily Challenge Mode ✅ COMPLETED (Sprint 4)

**Why this matters:** Daily challenges create habit-forming return visits. Fixed seeds enable fair competition and social comparison.

**What it does:** Rotating daily challenges with unique rule modifiers and shared leaderboards.

Implementation:
- 7 challenge types rotate daily:
  - **Speed Run:** Complete level in 90 seconds
  - **Ghost Hunter:** Eat 6+ ghosts in one level
  - **Perfect Run:** No hits, all dots collected
  - **No Power-Ups:** Power pellets disabled (run away only)
  - **Donut Feast:** 2x donut spawn rate
  - **High Score Attack:** 1.5x all point values
  - **Survival:** 1 life, maximum level reached
- Daily seed generates identical maze/ghost behavior for all players
- Challenge card UI: shows today's challenge + yesterday's winner
- Separate daily leaderboard (top 10, localStorage synced via URL param)
- Share button: "I got 1st place on today's challenge!"
- Challenge completion badge shown on high-score board
- Timezone-aware: challenge resets at midnight local time

**Files affected:** `js/ui/daily-challenge.js` (new), `js/game-logic.js`, `js/config.js`, `js/engine/high-scores.js`, `js/engine/renderer.js`

**Success metric:** 25%+ of players attempt daily challenge at least once per week

---

## 9. [x] Performance Optimization & Polish ✅ COMPLETED (Sprint 4)

**Why this matters:** Frame drops kill arcade game feel. Smooth 60fps is non-negotiable for good player experience.

**What it does:** Profiling and optimization pass to hit 60fps on mid-tier mobile devices.

Implementation:
- Profile canvas rendering with Chrome DevTools Performance panel
- Optimize hot paths:
  - BFS pathfinding: cache results for 3 frames (ghosts don't need to recalculate every frame)
  - Particle system: object pooling (reuse particle objects)
  - Renderer: batch draw calls (draw all dots in one pass)
- Reduce overdraw: don't render offscreen entities
- Use requestAnimationFrame more efficiently (skip frames if >16ms)
- Add FPS counter (dev mode) to monitor performance
- Test on:
  - iPhone SE 2020 (low-end iOS)
  - Samsung Galaxy A52 (mid-tier Android)
  - Desktop Chrome, Firefox, Safari
- Visual polish:
  - Smooth camera shake on combo hits
  - Donut rotation animation (spinning donuts)
  - Ghost eye movement tracking Homer
  - Level transition wipe effect (curtain close/open)

**Files affected:** `js/engine/renderer.js`, `js/game-logic.js`, `js/main.js`

**Success metric:** 60fps maintained on iPhone SE 2020 at all times

---

## 10. [x] Leaderboard & Stats Dashboard ✅ COMPLETED (Sprint 3)

**Why this matters:** Competition drives engagement. Seeing your rank vs others creates motivation to improve.

**What it does:** Persistent leaderboard with detailed player statistics.

Implementation:
- localStorage-based leaderboard (top 50 entries)
- Stats tracked:
  - High score (with date/time achieved)
  - Highest level reached
  - Best combo multiplier
  - Total ghosts eaten (all-time)
  - Total donuts consumed
  - Play time (hours)
  - Win streak (consecutive level completions)
- Stats dashboard accessible from main menu
- Visual rank badges: 🥇🥈🥉 for top 3
- Personal bests highlighted in gold
- Export stats as JSON (for backup/sharing)
- Optional: Simple backend API for global leaderboard (if user requests)
- Clear data option with confirmation modal

**Files affected:** `js/engine/high-scores.js`, `js/ui/stats-dashboard.js` (new), `js/game-logic.js`, `index.html`

**Success metric:** Players check leaderboard 2+ times per session on average
