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
