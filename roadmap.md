# Roadmap

Ordered work items for autonomous execution via perpetual-motion.yml.
Each item becomes a GitHub issue assigned to @copilot.

## 1. [ ] Combo Multiplier System

Add a combo multiplier system that rewards chaining ghost kills within a single power-pellet activation window.

- Track consecutive ghost eaten count within each power-pellet activation
- Display animated combo counter on screen showing current multiplier (1x → 2x → 4x → 8x)
- Calculate ghost scores with multiplier applied: basePoints * comboMultiplier
- Show particle burst effect on combo milestone hits (2x, 4x, 8x thresholds)
- Reset combo counter when power-pellet effect expires or level ends
- Add audio cues for combo milestones
- Update high-score system to track highest combo achieved
- Files: js/game-logic.js, js/engine/renderer.js, js/config.js

## 2. [ ] Daily Challenge Cards System

Implement rotating daily challenges with preset rules and seed-based reproducible gameplay.

- Create 5-7 challenge card presets: "Speed Run (3 min)", "No Power-Up Mode", "Ghost Hunter (eat 5+ ghosts)", "Perfect Run (no hits)", "Donut Feast (collect all)"
- Implement daily challenge rotation with fixed maze seed and rule set
- Add challenge selection screen accessible from main menu
- Display challenge objectives and progress in HUD overlay
- Award 1.5x score multiplier for completing daily challenge objectives
- Create separate challenge leaderboard (localStorage)
- Seed-based maze generation for reproducible layouts
- Add challenge completion indicators with particle effects
- Files: js/config.js, js/game-logic.js, js/engine/renderer.js, js/engine/high-scores.js, js/main.js

## 3. [ ] Ghost Personality Visual Indicators

Add visual feedback system showing ghost AI states and personality behaviors in real-time.

- Display thought bubbles above ghosts showing current AI state (pursuit, scatter, frightened icons)
- Add personality-specific visual cues:
  - Sr. Burns (red): Target reticle when chasing
  - Bob Patiño (pink): Speed lines when aggressive
  - Nelson (blue): Question mark when erratic
  - Snake (orange): Zigzag trail when speed variance active
- Implement animated transitions between AI states (fade-in/fade-out bubbles)
- Add debug overlay toggle (dev mode) showing pathfinding breadcrumbs and target coordinates
- Create settings panel for AI behavior tuning with real-time preview
- Add adjustable sliders for ghost aggression, chase distance, scatter behavior
- Save custom AI profiles to localStorage
- Files: js/engine/renderer.js, js/game-logic.js, js/config.js, js/engine/touch-input.js
