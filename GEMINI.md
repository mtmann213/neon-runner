# Project Resume: jgmann

## Project Overview
A React-based 2D platformer built with Canvas, focusing on "game juice" and polished mechanics.

## Current State (as of 2026-02-27)
- **Engine:** React + Vite + TypeScript.
- **Rendering:** HTML5 Canvas API.
- **Core Mechanics:**
  - Horizontal movement (Arrow keys).
  - Jumping (Space) with gravity.
  - Rolling (Shift) for speed and dodging.
  - Camera system (horizontal scrolling).
  - Enemy types: Patrol (walks back and forth) and Spikes (stationary damage).
  - Collectibles: Chests (Health/Speed boosts).
  - Combat: Bop enemies from above or roll into them to defeat.
- **Juice Features:**
  - Particle system (jump, land, roll, damage, death).
  - Screen Shake (on damage, kill, chest open).
  - Frame-based animations (simple walk cycle).
  - Parallax-lite background (mountains and clouds).
  - **NEW:** Procedural Synthwave Music and Sound Effects (Web Audio API).
  - **NEW:** Start Game overlay to handle audio context initialization.

## Recent Changes
- Initialized Git repository.
- Created `GEMINI.md` for session persistence.
- Refined initial project structure.
- Implemented `AudioManager.ts` for procedural sound.
- Integrated audio triggers (jump, bop, damage, chest) into `App.tsx`.
- Added `Start Game` overlay for audio activation.
- **FIX:** Added `gameStarted` to `useEffect` dependency array so the game loop actually starts.
- **FIX:** Added `audioManager.stopMusic()` to `useEffect` cleanup.
- **IMPROVEMENT:** Hardened `AudioManager.ts` with try-catch and null checks for environments without audio drivers.
- **IMPROVEMENT:** Added Audio ON/OFF toggle to the Start Overlay.
- **NEW:** Level Progression System.
  - Level data is now managed via a `LEVELS` configuration object.
  - Added Game States: `playing`, `won`, `gameover`.
  - Added Victory Screen for clearing a level.
  - Added Game Over screen with Retry functionality.
  - Reaching the red flag at the end of the world now triggers the level clear.
- **NEW:** Level 3 with Boss Fight.
  - Introduced a "Boss" enemy type with 3 HP and unique jumping AI.
  - Added Boss health bar and custom visuals.
  - Added "Boss Hit" sound effect.
  - Defeating the boss grants a massive score bonus (1000 pts).
- **FIX:** Added `retryKey` and `currentLevel` to `useEffect` dependency array so "Next Level" and "Retry" actually reload the game loop.
- **FIX:** Resolved TypeScript build errors that were causing a blank screen on start (missing `checkCollision`, unused `lives`, `undefined` check on `enemy.vx`).
- **FIX:** Resolved game freeze when jumping (ReferenceError: `currentHeight` used before initialization).
- **FIX:** Resolved white screen after refactor by fixing `import type` syntax and removing unused variables.

## Pending Tasks / Ideas
- [x] **Feel:** Implement Coyote Time and Jump Buffering.
- [x] **Architecture:** Refactor `App.tsx` into specialized modules (Physics, Rendering, State).
- [x] **Visuals:** Add Neon Glow (shadowBlur), Parallax background layers, and CRT Scanline overlay.
- [ ] **Content:** Add a "Double Jump" power-up.
- [ ] **Polish:** Add a Main Menu and a "Game Clear" final screen.
- [ ] **Persistence:** Save high scores to LocalStorage.

## Technical Debt / Known Issues
- All game logic is currently in one large `App.tsx` file.
- Needs better asset management (currently using primitives).
