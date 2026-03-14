# Project Context

- **Owner:** joperezd
- **Project:** ComeRosquillas — Homer's Donut Quest, a Pac-Man style web arcade game
- **Stack:** Vanilla HTML/JS/Canvas, no frameworks, Astro docs site
- **Upstream:** FirstFrameStudios (subsquad)
- **Created:** 2026-07-24

## Key Files

- `index.html` — game page (full game runs here)
- `js/config.js` — game configuration constants
- `js/engine/` — engine modules (renderer, audio, touch, high-scores)
- `js/game-logic.js` — core game logic
- `js/main.js` — entry point, game loop

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-07-24: Squad Triage YAML Fix (Issue #21)

**Context:** Fixed `.github/workflows/squad-triage.yml` to use content-aware triage verdicts instead of unconditionally applying `go:needs-research` to all issues.

**What Changed:**
- **File:** `.github/workflows/squad-triage.yml` (lines 202-218)
- **Old behavior:** All issues got `go:needs-research` label automatically
- **New behavior:** Issues analyzed for quality signals:
  - Acceptance criteria section (`/acceptance\s+criteria/i`)
  - Checklist items (`/- \[ \]/`)
  - Structured markdown sections (`/^##\s+.+/m`)
  - Requirements section (`/requirements/i`)
  - Body length >= 100 characters
- **Logic:** If `bodyLength >= 100` AND any quality signal present → `go:ready`, else → `go:needs-research`

**Pattern for Future Workflow Fixes:**
1. The Hub's workflow files (`.github/workflows/`) are the source of truth
2. When workflows are updated at the Hub, downstream repos need manual sync
3. Always look for the comment block identifying the section (e.g., "Apply default triage verdict" → "Apply triage verdict based on issue quality")
4. Test by checking issue quality expectations match label outcomes

**Key Regex Patterns:**
- `/acceptance\s+criteria/i` — matches "Acceptance Criteria" variations
- `/- \[ \]/` — matches unchecked markdown checkboxes
- `/^##\s+.+/m` — matches markdown H2 sections (multiline mode)
- `/requirements/i` — matches "Requirements" section

### 2026-07-24: Sprint 2 QA Finalization (Issue #45, PR #48)

**Context:** Finalized Sprint 2 QA suite after all 3 feature PRs merged into main (#46 Combo, #47 Tutorial, #49 Mobile Polish). Merged main into `squad/45-sprint2-qa`, resolved conflicts, enabled all scaffold tests, and marked PR #48 ready for review.

**What Changed:**
- **Merge conflicts** in `regression-difficulty.test.js` and `regression-scoring.test.js` — trivial (main added inline comments + `vi` import). Resolved by accepting main's version.
- **feature-tutorial.test.js** — 6 `describe.skip` blocks → 6 active `describe` blocks (22 tests). Tests tutorial localStorage key (`comeRosquillas_tutorialComplete`), 3-step flow, skip/ESC logic, reset from settings, mobile vs desktop text variants.
- **feature-combo.test.js** — 2 `describe.skip` blocks → 2 active blocks (14 new tests). Tests HUD visibility (`bestCombo > 1`), display timer (120 frames), fade threshold (30 frames), screen shake intensity (3/5/8 per milestone), particle count (15), floating text format (`"{n}x COMBO!"`), particle velocity/life ranges.
- **feature-mobile.test.js** — 6 `describe.skip` blocks → 6 active blocks (22 new tests). Tests D-pad dimensions (160×160), touch button sizes (50px), swipe thresholds (30px/300ms), haptic localStorage key (`comeRosquillas_haptic`), vibration patterns (8ms/10ms), fullscreen icon toggle (⛶/⮌), orientation warning CSS query, button layout spacing (60px apart).
- **integration-cross-feature.test.js** — 4 `describe.skip` blocks → 4 active blocks (9 new tests). Tests tutorial×combo suppression, mobile×tutorial touch prompts (swipe vs arrow keys), particle count budget (60 max), difficulty×ghost AI (speed multiplier uniform, personality targeting unchanged).

**Final Results:** 289 tests passing, 0 skipped, 0 failures across 10 test files.

**Key localStorage Keys Tested:**
- `comeRosquillas_tutorialComplete` — Tutorial completion flag (`'1'`)
- `comeRosquillas_bestCombo` — Best combo multiplier (integer)
- `comeRosquillas_haptic` — Haptic feedback preference (`'true'`/`'false'`)
- `comeRosquillas_difficulty` — Difficulty level (Sprint 1)
- `comeRosquillasSettings` — Settings object (Sprint 1)
- `comeRosquillas_highScores` — High score array (Sprint 1)

**Test Pattern Notes:**
- Sprint 2 tests follow the same self-contained pattern as Sprint 1: re-implement small logic functions in-test rather than importing production modules (avoids Canvas/DOM/Audio dependencies in jsdom).
- Screen shake intensity formula: `multiplier <= 2 ? 3 : multiplier <= 4 ? 5 : 8`
- Combo milestones: `[2, 4, 8]` — triggers at 2×, 4×, 8× multipliers
- Tutorial mobile detection: `matchMedia('(hover: none) and (pointer: coarse)')`

### 2026-03-13: Sprint 2 QA Scaffolding (Issue #45, PR #48)

**Context:** Built Sprint 2 test suite — regression tests for Sprint 1 features + scaffolding for incoming Sprint 2 features (#42 Tutorial, #43 Combo, #44 Mobile).

**Test Architecture:**
- **Regression tests** (`regression-*.test.js`): Run NOW against existing code. Cover Ghost AI targeting, Difficulty presets/persistence, Scoring/Lives/HighScores, Settings state machine.
- **Feature scaffolding** (`feature-*.test.js`): `describe.skip()` blocks with test cases matching acceptance criteria. Ready to unskip when features land.
- **Integration tests** (`integration-cross-feature.test.js`): Cross-feature validation (Difficulty × Combo timing, Score × Extra Life). Skip blocks for Tutorial × Combo, Mobile × Tutorial.

**Testing Pattern:**
- Tests use `setup.js` constants (mirrored from `config.js`) for isolation — no DOM or Canvas dependency
- Game logic is tested by re-implementing core math (ghost targeting, combo multipliers, swipe direction) and asserting against expected values
- localStorage tests use `beforeEach/afterEach` with `localStorage.clear()`
- Sprint 2 feature tests are scaffolded with `describe.skip()` — unskip when the feature module is available

**Key Numbers:**
- 221 passing tests, 52 skipped (scaffolding)
- 10 test files total (3 existing + 7 new)
- Coverage config expanded to include `js/engine/high-scores.js`

**Useful for Future Testing:**
- Ghost personality targeting can be validated without instantiating the full Game class
- Combo multiplier math: `Math.min(8, Math.pow(2, ghostsEaten - 1))` — cap at 8x
- Swipe direction: compare `|dx|` vs `|dy|` with 30px minimum threshold
- Screen scaling: `Math.min(screenW / CANVAS_W, screenH / CANVAS_H)`

### 2026-07-24: Sprint 3 QA Scaffolding (Issue #57, PR #60)

**Context:** Built Sprint 3 QA suite proactively while Barney (#54 Endless Mode) and Lenny (#56 Leaderboard) are developing. Created 6 new test files with 94 running tests + 75 skipped scaffolds.

**What Changed:**
- **feature-progressive-difficulty.test.js** — 36 running tests. Validates ramp curve (0→1.0 over levels 1-10), ghost speed ramp (+6%/level), fright decay (360→119 frames), scatter shortening (50% reduction), chase growth (+30%), speed caps at level 10+.
- **feature-endless-mode.test.js** — 12 running + 12 skipped. Running: maze cycling beyond level 8, difficulty plateau. Skipped: HUD indicator, speed caps, fright floor (waiting for #54).
- **feature-leaderboard.test.js** — 21 running + 14 skipped. Running: data schema with combo field, clear, sorting. Skipped: top 50, scrolling, clear confirmation (waiting for #56).
- **feature-stats.test.js** — 28 skipped. Scaffold for lifetime stats and rank badges.
- **feature-audio-juice.test.js** — 8 running + 14 skipped. Running: pitch variation, bus architecture. Skipped: spatial audio, ducking (Sprint 3.5).
- **integration-sprint3.test.js** — 17 running + 7 skipped. Running: difficulty × combo timing, speed × level, maze × difficulty.

**Final Results:** 383 passing, 75 skipped, 0 failures across 16 test files.

**Key Formulas Tested:**
- `getDifficultyRamp(level)` = `Math.min(1, (level - 1) / 9)` — caps at level 10
- `getGhostSpeed(level)` = `BASE_SPEED * (0.9 + (level - 1) * 0.06)` — no cap (needs #54)
- `getLevelFrightTime(level)` = `FRIGHT_TIME * (1 - ramp * 0.67)` — floor 119 frames
- Ghost speed grows unbounded — endless mode (#54) should add caps.

### 2026-07-24: Sprint 4 QA Scaffolding (Issue #71, PR #75)

**Context:** Built Sprint 4 QA suite proactively while Barney (#70 Performance) and Lenny (#67 Social Sharing) are developing. Created 6 new test files with 48 running regression tests + 93 skipped scaffolds.

**What Changed:**
- **regression-sprint3.test.js** — 34 running tests. Comprehensive regression covering all Sprint 1-3 features: endless mode cycling, progressive difficulty ramp, combo scoring, leaderboard data integrity, stats dashboard, tutorial persistence, mobile touch controls, audio bus architecture, core constants.
- **feature-performance.test.js** — 26 skipped. Scaffold for BFS cache, particle pooling (200 pre-allocated), batch rendering, FPS counter (EMA smoothing α=0.1), 60fps target verification.
- **feature-social-sharing.test.js** — 27 skipped. Scaffold for share button, Web Share API payloads, clipboard fallback, canvas screenshot capture, QR code generation, seed URLs with deterministic PRNG.
- **feature-ghost-debug.test.js** — 16 skipped. Scaffold for AI state overlays (mode colors, debug labels), target tile visualization, tuning sliders (speed/fright/scatter multipliers).
- **feature-daily-challenges.test.js** — 15 skipped. Scaffold for daily rotation (UTC-based seed "daily-YYYYMMDD"), deterministic PRNG, challenge leaderboard (separate localStorage key).
- **integration-sprint4.test.js** — 14 running + 9 skipped. Running: performance × endless mode (O(1) computation validation), performance × ghost AI (tile coordinates, squared distance), performance × audio (pitch/pan formulas), performance × mobile (swipe/scale/hit-test). Skipped: social sharing × leaderboard, sharing × stats, daily challenges × leaderboard.

**Final Results:** 504 passing, 93 skipped, 0 failures across 22 test files.

**Key Patterns Introduced:**
- Performance scaffold tests validate computational complexity (O(1) formulas) and memory bounds
- Social sharing tests model Web Share API, clipboard API, and canvas capture flows
- Daily challenge tests use UTC date-based seed generation for deterministic PRNG
- All Sprint 4 feature tests use `describe.skip()` — ready to unskip when features land

### 2026-03-14: Sprint 4 QA Finalization (Issue #71, PR #75)

**Context:** Finalized Sprint 4 QA suite after all 4 feature PRs merged into main (#73 Social Sharing, #74 Performance, #76 Ghost Debug, #77 Daily Challenges). Merged main into `squad/71-sprint4-qa`, unskipped all 93 scaffold tests, and marked PR #75 ready for review.

**What Changed:**
- **feature-performance.test.js** — 5 `describe.skip` blocks → 5 active `describe` blocks (26 tests). Tests BFS cache (walkable tiles, invalidation, tunnel wrapping, memory bounds), particle pool (200 pre-allocated, acquire/release, exhaustion), batch rendering (dot/wall/ghost/HUD batching), FPS counter (EMA smoothing α=0.1, color-coding, F-key toggle), 60fps target (frame budget, delta time, object pooling, no getImageData).
- **feature-social-sharing.test.js** — 6 `describe.skip` blocks → 6 active blocks (27 tests). Tests share button (game-over visibility, 48×48 touch target, positioning), Web Share API (detection, payload, combo text, AbortError), clipboard fallback (writeText, seed URL, toast, permissions), screenshot capture (PNG dataURL, 672×744 resolution, watermark, blob sharing), QR code (seed encoding, 4px modules, error correction M), seed URLs (8-char alphanumeric, deterministic PRNG, URL parsing).
- **feature-ghost-debug.test.js** — 3 `describe.skip` blocks → 3 active blocks (16 tests). Tests AI state overlay (4 mode colors, debug labels, positioning, D-key toggle, production guard), target tile visualization (ghost-to-target lines, color matching, scatter corners, chase targeting, eaten target), tuning sliders (speed 0.5×–2.0×, fright 0.25×–3.0×, scatter%, immediate apply, debug-only, reset defaults).
- **feature-daily-challenges.test.js** — 3 `describe.skip` blocks → 3 active blocks (15 tests). Tests daily rotation (UTC seed, same-day consistency, format validation, midnight reset, HUD badge), deterministic PRNG (reproducibility, different seeds differ, [0,1) range, affected systems), challenge leaderboard (localStorage state, attempts tracking, best score, seed reset, HUD display, separate from main).
- **integration-sprint4.test.js** — 3 `describe.skip` blocks → 3 active blocks (9 tests). Tests social sharing × leaderboard (score data, seed matching, screenshot capture, QR URL), social sharing × stats (rank badge emoji, lifetime stats summary), daily challenges × leaderboard (separate keys, dual submission, seed in entry).

**Final Results:** 597 tests passing, 0 skipped, 0 failures across 22 test files.

**Sprint 4 Feature Coverage Summary:**
- Performance Optimization: BFS cache, particle pooling, batch rendering, FPS counter — 26 tests
- Social Sharing: Share button, Web Share API, clipboard, screenshot, QR code, seed URLs — 27 tests
- Ghost Debug Tools: AI state overlay, target visualization, tuning sliders — 16 tests
- Daily Challenges: Daily rotation, deterministic PRNG, challenge leaderboard — 15 tests
- Integration (Sprint 4 cross-feature): 9 tests

### 2026-03-14: Sprint 5 Proactive Test Scaffolding (PR #100)

**Context:** Built proactive tests for Sprint 5 features while Barney (#92 Power-Up Variety) and Lenny (#94 Screen Shake & Camera Juice) are implementing. Created 2 new test files with 112 running tests.

**What Changed:**
- **feature-power-ups.test.js** — 62 tests. Covers all 5 power-up types (Duff Beer, Chili Pepper, Mr. Burns Token, Donut Box, Lard Lad Statue), weighted spawn probability, collection logic, duration timers, speed/slow effects, extra life mechanic (3 tokens), random points (1000-5000), invincibility, stacking combos, spawn rules (1 per level), edge cases (expiry during collision, collection during death).
- **feature-camera-juice.test.js** — 50 tests. Covers screen shake intensity levels (ghost collision 5px, combo escalation 3/5/8, boss 10px), shake timer decay, zoom effects (level start 150%→100%, complete 90%, death 120%), camera follow lerp math, edge padding/clamping, settings toggle (localStorage), auto-disable on FPS < 45, no-effects guard, regression compatibility with existing combo shake.

**Final Results:** 709 tests passing, 0 skipped, 0 failures across 24 test files.

**Key Formulas Tested:**
- `applyDuffBeer(speed)` = `speed * 2` — doubles player speed
- `applyChiliPepper(ghostSpeed)` = `ghostSpeed * 0.5` — halves ghost speed
- `collectBurnsToken(held)` — 3 tokens = extra life, counter resets
- `rollDonutBoxPoints()` = `1000 + floor(random() * 41) * 100` — range [1000, 5000]
- `lerpZoom(current, target, speed)` = `current + (target - current) * speed`
- `lerpFollow(cam, target, factor)` = `cam + (target - cam) * factor`
- `shouldAutoDisableEffects(fps)` = `fps < 45`
- Spawn probability: weighted selection, total weight 61 (25+20+1+5+10)

**Notes:**
- Tests may need minor adjustment when implementations land (specific values, localStorage keys)
- Power-up spawn weights and durations are best guesses from issue spec — verify against implementation
- Camera follow tests assume lerp-based smooth follow, not hard snap
