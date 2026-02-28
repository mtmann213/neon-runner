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

## Pending Tasks / Ideas
- [ ] Add sound effects (Web Audio API).
- [ ] Implement Level 2 or more complex terrain.
- [ ] Add a Main Menu and Game Over screen.
- [ ] Improve player/enemy sprite details.
- [ ] Add vertical scrolling/platforms.

## Technical Debt / Known Issues
- All game logic is currently in one large `App.tsx` file.
- Needs better asset management (currently using primitives).
