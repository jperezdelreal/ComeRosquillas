# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Game engine / rendering | Barney 🔧 | Canvas rendering, sprite animation, game loop, renderer.js |
| Game logic / physics | Barney 🔧 | Collision detection, ghost AI, movement, level design, game-logic.js |
| Audio system | Barney 🔧 | Sound effects, music, audio.js |
| Game config | Barney 🔧 | Tuning values, speeds, timers, config.js |
| HUD / menus | Lenny ⚛️ | Score display, lives, pause screen, game over screen |
| Touch controls | Lenny ⚛️ | D-pad, swipe input, touch-input.js, mobile UX |
| Responsive layout / CSS | Lenny ⚛️ | Mobile scaling, game container, visual styling in index.html |
| Documentation site | Lenny ⚛️ | Astro docs, dev guides, game docs in docs/ |
| Code review | Moe 🏗️ | Review PRs, check quality, suggest improvements |
| Architecture | Moe 🏗️ | System design, file structure, module boundaries |
| Game design decisions | Moe 🏗️ | Feature scope, gameplay mechanics, what ships |
| Scope & priorities | Moe 🏗️ | What to build next, trade-offs, decisions |
| Testing / QA | Nelson 🧪 | Write tests, find edge cases, verify fixes, cross-browser |
| Performance | Nelson 🧪 | Frame rate profiling, memory leaks, Canvas optimization checks |
| Bug reports | Nelson 🧪 | Reproduce bugs, document steps, verify fixes |
| Session logging | Scribe 📋 | Automatic — never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Moe 🏗️ |
| `squad:moe` | Architecture, design, review tasks | Moe 🏗️ |
| `squad:barney` | Game engine, logic, physics, audio work | Barney 🔧 |
| `squad:lenny` | UI, HUD, touch controls, docs site work | Lenny ⚛️ |
| `squad:nelson` | Testing, QA, performance, bug verification | Nelson 🧪 |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, **Moe** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Moe's review.

### Moe's Triage Guidance

When triaging, Moe should ask:

1. **Is it game engine?** Rendering, physics, game loop, audio → `squad:barney`
2. **Is it UI/UX?** HUD, menus, touch controls, layout, docs → `squad:lenny`
3. **Is it a bug report?** Nelson verifies, then routes fix to Barney or Lenny → `squad:nelson`
4. **Is it a feature request?** Moe scopes it, then assigns to the right agent
5. **Is it architecture?** Module boundaries, file structure, system design → `squad:moe`

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.
8. **@copilot routing** — when evaluating issues, check @copilot's capability profile in `team.md`. Route 🟢 good-fit tasks to `squad:copilot`. Flag 🟡 needs-review tasks for PR review. Keep 🔴 not-suitable tasks with squad members.
