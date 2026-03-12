# Copilot Instructions — ComeRosquillas

## Project Overview

**ComeRosquillas** (Homer's Donut Quest) is a Simpsons-themed Pac-Man arcade clone. Homer navigates through Springfield's maze eating donuts while avoiding ghosts. Pure HTML/JavaScript/Canvas 2D implementation — no frameworks, no build tools.

## Tech Stack

- **Language:** Vanilla JavaScript (ES6)
- **Graphics:** HTML5 Canvas 2D API
- **Audio:** Web Audio API (procedural synthesis — no audio files)
- **Build:** None — just open `index.html` in browser
- **No dependencies, no bundler, no transpilation**

## File Structure

```
ComeRosquillas/
├── index.html              # Main entry point
├── js/
│   ├── config.js          # Game constants (canvas size, maze layout, states)
│   ├── main.js            # Bootstrap and game loop
│   ├── game-logic.js      # Core game state, input, collision, scoring
│   └── engine/
│       ├── audio.js       # SoundManager — procedural audio via Web Audio API
│       ├── renderer.js    # Graphics pipeline (maze, sprites, UI)
│       ├── high-scores.js # Leaderboard logic
│       └── touch-input.js # Mobile controls
├── docs/                  # Documentation (Astro static site)
└── .squad/                # Squad AI workflow
```

## Core Modules

### js/config.js
Centralized configuration — canvas dimensions, maze template, spawn points, game state constants (`ST_START`, `ST_RUNNING`, `ST_LEVEL_COMPLETE`, `ST_GAME_OVER`), entity speeds.

### js/game-logic.js
Main game controller — state machine, input handling, entity updates, collision detection (donut collection, ghost collisions), score tracking, level progression, HUD updates.

### js/engine/audio.js (SoundManager)
Procedural sound synthesis using Web Audio API — master compressor, audio buses, SFX (donut chomp, power-up, ghost eaten, level complete, game over), looping background music. **No external audio files.**

### js/engine/renderer.js
Canvas 2D rendering — maze rendering from template, sprite rendering (Homer, ghosts, donuts, power pellets), animations, UI overlays (HUD, start screen, transitions, game-over screen).

### js/main.js
Application bootstrap — integrates config, game logic, audio, and renderer into game loop.

## Design Philosophy

**Modular separation:** Config = Data, Game Logic = State & Rules, Audio = Sound, Renderer = Visuals, Main = Integration. Each module has single responsibility.

**No build step:** Pure HTML/JS/Canvas. No transpilation, no bundlers. Open `index.html` and play.

**Procedural audio:** All audio generated at runtime via Web Audio API.

## Squad Workflow

### Issue Lifecycle
1. Issues start in Squad triage inbox (label: `squad`)
2. Lead assigns to member via `squad:{agent}` label (moe, barney, lenny, nelson)
3. Agent self-assigns and creates branch: `squad/{issue-number}-{slug}`
4. Agent opens PR with "Closes #{issue-number}" in body
5. PR reviewed and merged → issue auto-closes

### Team

| Agent   | Role        | Domain                       |
|---------|-------------|------------------------------|
| Moe     | Lead        | Architecture, planning       |
| Barney  | Game Dev    | Game logic, mechanics        |
| Lenny   | UI Dev      | Frontend, canvas, rendering  |
| Nelson  | Tester      | QA, testing, bug fixes       |
| Scribe  | Scribe      | Documentation                |
| Ralph   | Monitor     | Heartbeat automation         |

### Branch Naming
- Format: `squad/{issue-number}-{slug}`
- Example: `squad/42-ghost-ai-chase-behavior`

### PR Requirements
- Must include "Closes #{issue-number}" in body
- Must pass review by Lead or designated reviewer
- Code must follow existing patterns (modular, no external deps)

### Labels
- `squad` — triage inbox
- `squad:{agent}` — assigned to agent (moe, barney, lenny, nelson)
- `go:yes` / `go:no` / `go:needs-research` — triage verdict
- `type:feature` / `type:bug` / `type:spike` / `type:docs` / `type:chore` / `type:epic`
- `priority:P0` / `priority:P1` / `priority:P2` / `priority:P3`
- `release:v0.x.x` / `release:backlog`
- `blocked-by:{type}` — blockers
- `bug` / `feedback` — high-signal labels

## Coding Conventions

- Use ES6+ features (const/let, arrow functions, template strings, destructuring)
- No semicolons (optional)
- 2-space indentation
- Single responsibility per module
- Keep functions small and focused
- No external dependencies
- No build tools or transpilation
- Comments only where clarification needed (not obvious code)
- Descriptive variable names (`playerX`, `ghostSpeed`, not `x`, `s`)

## Testing

Manual testing via browser. No unit test framework (no build step philosophy). Test by running the game.

## Upstream

This is a subsquad under FirstFrameStudios (hub repo). Squad infrastructure (labels, workflows, team.md) synced from hub.

## References

- Inspiration: Pac-Man (Namco), The Simpsons (Fox)
- Play online: [GitHub Pages](https://jperezdelreal.github.io/ComeRosquillas/play/)
- Universe: The Simpsons
