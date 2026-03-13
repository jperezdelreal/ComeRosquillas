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
