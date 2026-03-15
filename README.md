<div align="center">

# 🍩 ComeRosquillas — Homer's Donut Quest

### A Simpsons-themed Pac-Man arcade game packed with donuts, ghosts, boss fights, and pure Springfield chaos.

**[▶️ Play Now](https://jperezdelreal.github.io/ComeRosquillas/play/)** · **[📖 Docs Site](https://jperezdelreal.github.io/ComeRosquillas/)** · **[🐛 Report Bug](https://github.com/jperezdelreal/ComeRosquillas/issues)**

![Mobile Experience](./Mobile%20Experience%20Screenshot.jpg)

</div>

---

## 🎮 What Is This?

Guide Homer Simpson through the streets of Springfield, gobbling donuts and outsmarting iconic villains. What started as a simple Pac-Man clone has grown into a feature-rich arcade game with boss fights, achievements, mini-events, multiple maze locations, 5 languages, and full accessibility support — all running on **zero dependencies** and **pure vanilla JavaScript**.

> **No build step. No frameworks. No audio files.** Just open `index.html` and play.

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 🍩 | **Classic Arcade Gameplay** | Pac-Man-style maze navigation with Simpsons flavor |
| 👻 | **4 Ghost Personalities** | Sr. Burns (chase), Bob Patiño (ambush), Nelson (patrol), Snake (random) — each with unique BFS-based AI |
| 🎮 | **Boss Ghosts** | Every 5 levels: Fat Tony, Krusty, Sideshow Bob, Mr. Burns Mega — with special mechanics |
| ⚡ | **5 Power-ups** | Duff Beer, Donut Box, Chili Pepper, Burns Token, Lard Lad — each with unique effects |
| 🏆 | **23 Achievements** | Unlock animations, persistent tracking, surprise rewards |
| 📊 | **Stats & Leaderboard** | Full stats dashboard, high score persistence via localStorage |
| 🎲 | **10 Mini-Events** | Double Trouble, Speed Run, Darkness, Ghost Frenzy, and more — triggered randomly each level |
| 🗺️ | **6 Themed Mazes** | Springfield Streets, Moe's Tavern, Kwik-E-Mart, Springfield Elementary, Nuclear Plant, Simpsons House |
| 🎬 | **Animated Sprites** | Homer walk cycles, ghost eye tracking, donut spin, death animations |
| 🌍 | **5 Languages** | English, Spanish, French, German, Portuguese (BR) |
| ♿ | **Full Accessibility** | Colorblind modes (Protanopia, Deuteranopia, Tritanopia), screen reader support, reduce motion |
| 📱 | **Mobile-First Controls** | Game Boy-style D-pad touch controls, responsive canvas |
| 🎵 | **Procedural Audio** | All SFX & music synthesized at runtime via Web Audio API — zero audio files |
| ✨ | **Screen Juice** | Camera shake, zoom effects, floating score text, level transitions |
| 🔧 | **Modular Engine** | 10 engine modules + 7 UI modules + i18n system — clean separation of concerns |
| 🧪 | **713+ Tests** | Vitest suite covering game logic, collisions, scoring, AI, config |
| ⚙️ | **Difficulty Modes** | Easy, Normal, Hard — with tuned ghost speed, fright duration, lives |
| 🎛️ | **Settings Menu** | Volume sliders (master/music/SFX), difficulty, language, accessibility toggles |

---

## 🕹️ How to Play

### Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| **Move** | Arrow Keys / `W A S D` | D-pad touch controls |
| **Start** | `ENTER` or `SPACE` | Tap Start button |
| **Pause** | `P` | Pause button |
| **Music** | `M` | Settings menu |

### Objective

1. 🍩 **Eat all donuts** to clear the level
2. 👻 **Dodge ghosts** — or grab a power-up and eat *them*
3. ⚡ **Collect power-ups** for temporary abilities
4. 🎮 **Survive boss fights** every 5 levels
5. 🏆 **Unlock achievements** and climb the leaderboard

---

## 🚀 Getting Started

### Play Online (Recommended)

**[▶️ https://jperezdelreal.github.io/ComeRosquillas/play/](https://jperezdelreal.github.io/ComeRosquillas/play/)**

### Run Locally

```bash
git clone https://github.com/jperezdelreal/ComeRosquillas.git
cd ComeRosquillas
```

Then just open `index.html` in your browser. That's it — no build step, no dependencies.

For a local dev server (optional):
```bash
npx http-server        # or: python -m http.server 8000
```

### Run Tests

```bash
npm install
npm test               # 713+ tests
npm run test:coverage  # Coverage report
npm run test:ui        # Interactive UI
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Vanilla JavaScript (ES6) |
| **Graphics** | HTML5 Canvas 2D API |
| **Audio** | Web Audio API (procedural synthesis) |
| **Tests** | Vitest + jsdom |
| **Docs** | Astro static site |
| **Build** | None — zero dependencies, zero bundlers |

### Project Structure

```
ComeRosquillas/
├── index.html              # Game entry point
├── js/
│   ├── config.js           # Constants, mazes, difficulty, achievements, events, bosses
│   ├── main.js             # Bootstrap & game loop
│   ├── game.js             # Legacy monolithic game implementation
│   ├── game-logic.js       # Core state machine, input, collisions, combo system
│   ├── engine/
│   │   ├── audio.js         # SoundManager — procedural synthesis via Web Audio API
│   │   ├── renderer.js      # Canvas 2D rendering pipeline
│   │   ├── high-scores.js   # Leaderboard & localStorage persistence
│   │   ├── touch-input.js   # Mobile D-pad controls
│   │   ├── ai-controller.js # Ghost AI personalities & BFS pathfinding
│   │   ├── collision-detector.js # Physics & collision detection
│   │   ├── entity-manager.js     # Ghost, power-up, and entity lifecycle
│   │   ├── event-system.js       # Game event bus & subscribers
│   │   ├── level-manager.js      # Maze rotation, level progression, boss spawns
│   │   └── scoring-system.js     # Points, combos, multipliers, floating text
│   ├── ui/
│   │   ├── accessibility.js      # Colorblind modes, screen reader, reduce motion
│   │   ├── achievements.js       # 23 unlockables with confetti & toasts
│   │   ├── daily-challenge.js    # Seeded daily challenges with leaderboard
│   │   ├── settings-menu.js      # Volume, difficulty, language, accessibility
│   │   ├── share-menu.js         # Social sharing with score cards
│   │   ├── stats-dashboard.js    # Lifetime stats & rank badges
│   │   └── tutorial.js           # Interactive first-time tutorial
│   └── i18n/
│       └── translations.js       # 5-language support (EN/ES/FR/DE/PT-BR)
├── tests/                   # 713+ Vitest specs
└── docs/                    # Astro docs site
```

---

## 🤝 Contributing

ComeRosquillas is built by the AI agent squad at **[First Frame Studios](https://jperezdelreal.github.io/FirstFrameStudios/)**. Contributions welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Commit your changes
4. Open a Pull Request

Please follow existing conventions: vanilla JS, no external dependencies, no build tools.

---

## 📄 License

**ISC** — [First Frame Studios](https://jperezdelreal.github.io/FirstFrameStudios/)

**Inspiration:** Pac-Man (Namco) · The Simpsons (Fox)

---

<div align="center">

**🍩 D'oh! Stop reading and go eat some donuts! 🍩**

**[▶️ Play Now](https://jperezdelreal.github.io/ComeRosquillas/play/)**

</div>
