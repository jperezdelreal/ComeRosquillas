// ===========================
// Come Rosquillas - Homer's Donut Quest
// A Pac-Man game deeply themed on The Simpsons
// ===========================
// Main entry point - orchestrates all modules

'use strict';

// Load all game modules via script tags in index.html
// This file serves as the thin orchestrator that initializes the game

// ==================== START ====================
window.addEventListener('load', () => { new Game(); });
