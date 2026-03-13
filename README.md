# Come Rosquillas — Homer's Donut Quest

A Simpsons-themed Pac-Man arcade clone featuring Homer Simpson on a donut-hunting adventure through Springfield's maze.

![Screenshot Placeholder](./docs/screenshot.png)

---

## About the Game

**Come Rosquillas** is a fast-paced maze-navigation game inspired by classic arcade games like Pac-Man. Navigate Homer Simpson through the streets of Springfield, eating donuts while avoiding ghost enemies with distinct AI personalities. Power up with super donuts to temporarily turn the tables on your pursuers!

**Features:**
- **Ghost AI with Personality** — Each ghost has its own behavioral quirks and movement patterns
- **Procedural Audio** — All sound effects and background music generated via Web Audio API (no external audio files)
- **Multiple Maze Layouts** — Procedurally generated or hand-crafted maze variations
- **Score-Based Progression** — Advance through levels as you accumulate points
- **Lives System** — Start with 3 lives; earn extra lives at score milestones
- **Power Pellets** — Temporary invincibility to flip the hunter/hunted dynamic

---

## How to Play

### Controls
| Action | Key(s) |
|--------|--------|
| **Move** | Arrow Keys or `W/A/S/D` |
| **Start Game** | `ENTER` or `SPACE` |
| **Pause** | `P` |
| **Toggle Music** | `M` |

### Objective
1. **Eat all the donuts** on the maze to complete the level
2. **Avoid ghosts** — touching an enemy costs a life
3. **Collect power pellets** (larger donuts) for temporary invincibility — eat ghosts for bonus points
4. **Survive** as long as possible and rack up the highest score!

### Mechanics
- **Donuts** = 10 points each
- **Power Pellets** = 50 points + temporarily turns ghosts blue/edible
- **Eaten Ghosts** = 200–800 points (increases with each ghost eaten)
- **Extra Life** = Every 500 points

---

## Getting Started

### Quick Start (No Build Required)
1. Clone the repository:
   ```bash
   git clone https://github.com/jperezdelreal/ComeRosquillas.git
   cd ComeRosquillas
   ```
2. **Open `index.html` directly in your browser** — no build step, server, or dependencies needed!
   - Simply double-click `index.html` or drag it into your browser

### For Development (Optional)
If you prefer to use a local web server (recommended for consistency):
```bash
# Python 3
python -m http.server 8000

# Or Node.js (requires http-server package)
npx http-server
```
Then visit `http://localhost:8000` in your browser.

### Running Tests
The project includes a comprehensive test suite covering core game logic:
```bash
# Install dependencies
npm install

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Open interactive test UI
npm run test:ui
```

**Test Coverage:**
- ✅ Collision detection (donut collection, ghost encounters)
- ✅ Score calculation (dots, power pellets, ghost eating, extra lives)
- ✅ Game state transitions (start → playing → game over)
- ✅ Power-up system (fright mode, timer logic)
- ✅ Configuration validation (constants, maze layouts, directions)

Tests are written using [Vitest](https://vitest.dev/) and run in a jsdom environment to simulate browser APIs.

---

## Play Online
The game is live at the GitHub Pages URL:  
**[https://jperezdelreal.github.io/ComeRosquillas/play/](https://jperezdelreal.github.io/ComeRosquillas/play/)**

---

## Architecture

### Project Structure
```
ComeRosquillas/
├── index.html              # Main HTML entry point
├── js/
│   ├── config.js          # Game constants (canvas size, maze layout, game states)
│   ├── main.js            # Application bootstrap and game loop
│   ├── game-logic.js      # Core game state, game loop, input handling, level logic
│   ├── game.js            # (Legacy/backup) — see game-logic.js
│   ├── engine/
│   │   ├── audio.js       # SoundManager — procedural audio via Web Audio API
│   │   └── renderer.js    # Graphics rendering pipeline (mazes, sprites, UI)
│   └── ui/
│       └── [future UI modules]
└── docs/
    └── [documentation and assets]
```

### Core Modules

#### **js/config.js**
Centralized game configuration:
- Canvas dimensions (`CANVAS_W`, `CANVAS_H`)
- Maze template and spawn points
- Game state constants (`ST_START`, `ST_RUNNING`, `ST_LEVEL_COMPLETE`, `ST_GAME_OVER`)
- Entity speeds and behaviors

#### **js/game-logic.js**
Main game controller responsible for:
- Game state machine (start → running → level complete → game over)
- Input handling (keyboard controls)
- Entity updates (player, ghosts, floating text effects)
- Collision detection (donut collection, ghost collisions, power-up logic)
- Score tracking and level progression
- HUD updates

#### **js/engine/audio.js** — SoundManager
Procedural sound synthesis using Web Audio API:
- **Master compressor** to prevent clipping
- **Buses** for layered audio mixing
- **Sound effects**: donut chomp (3 variants), power-up, ghost eaten, level complete, game over
- **Background music**: looping Springfield theme synthesized from oscillators
- **Volume control** via master, music, and SFX buses
- No external audio files — everything is generated at runtime

#### **js/engine/renderer.js** — Graphics Pipeline
Canvas-based 2D rendering:
- **Maze rendering** — procedurally drawn from template
- **Sprite rendering** — Homer sprite, ghosts (Red, Pink, Blue, Orange), donuts, power pellets
- **Animations** — sprite sheet cycling, ghost "flee mode" colors, particle effects (floating scores)
- **UI overlays** — HUD (score, level, lives), start screen, level transitions, game-over screen
- **Viewport management** — camera tracking (if applicable)

### Design Philosophy

**Modular Structure:** Each module has a single responsibility:
- **Config** = Data
- **Game Logic** = State & Rules
- **Audio** = Sound
- **Renderer** = Visuals
- **Main** = Bootstrap & Integration

This separation makes the code easy to test, extend, and reuse across future projects.

**No Build Step Required:** The game is pure HTML/JavaScript/Canvas — no transpilation, bundlers, or dependencies. Just open `index.html` and play.

**Procedural Audio:** All audio is generated at runtime via the Web Audio API, eliminating file size bloat and licensing concerns. Perfect for arcade-style sound design.

---

## Development Roadmap

### Current Version
- ✅ Core maze navigation
- ✅ Ghost AI (basic chase behavior)
- ✅ Donut collection and scoring
- ✅ Power pellet system
- ✅ Procedural audio and background music
- ✅ Lives system with extra life bonuses
- ✅ Level progression

### Future Enhancements
- [ ] Leaderboard system
- [ ] Difficulty settings (Easy, Normal, Hard)
- [ ] Ghost AI tuning (smarter pathing, evasion)
- [ ] Additional maze layouts
- [ ] Mobile touch controls
- [ ] Settings menu (audio volume, controls rebinding)
- [ ] In-game tutorial
- [ ] Sprite sheet animations (more fluid movement)

---

## Technologies

- **Language:** Vanilla JavaScript (ES6)
- **Graphics:** HTML5 Canvas 2D API
- **Audio:** Web Audio API (procedural synthesis)
- **Compatibility:** All modern browsers (Chrome, Firefox, Safari, Edge)

---

## Credits & License

**Game Design & Development:** First Frame Studios (Squad AI)  
**Inspiration:** Pac-Man (Namco), The Simpsons (Fox)

**License:** ISC

---

## Contributing

This project was generated as a proof-of-concept for squad-based AI game development. To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add feature: your feature"`)
4. Push to your fork and open a Pull Request

---

## Support

For bug reports, feature requests, or feedback, please open an issue on [GitHub Issues](https://github.com/jperezdelreal/ComeRosquillas/issues).

---

**Happy donut hunting! 🍩**
