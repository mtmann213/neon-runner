# Project Resume: jgmann

## Project Overview
A React-based 2D platformer built with Canvas, focusing on "game juice" and polished mechanics.

## Current State (as of 2026-02-27)
- **Engine:** React + Vite + TypeScript.
- **Rendering:** HTML5 Canvas API with modular Architecture.
- **Core Mechanics:**
  - Smooth horizontal movement and physics-based jumping.
  - **Feel:** Coyote Time and Jump Buffering for tight controls.
  - **Combat:** Fireball shooting (F key) with bouncing physics and 3s cooldown.
  - **Power-ups:** Bacon (Big), Gold Carrot (Life), Lightning Shoes (Speed), Spring (Jump), Giant Burger (Giantic + Invincible).
- **Juice Features:**
  - Particle system, Screen Shake, Neon Glow effects.
  - Parallax background layers and CRT/Scanline overlay.
- **Progression:**
  - 3 Levels including a multi-hit Boss fight in Level 3.
  - **Persistence:** High scores, level unlocks, and audio settings saved to LocalStorage.
  - **Level Select:** Choose starting level from the Main Menu.

## Recent Changes
- Implemented comprehensive persistence (Level unlocks + Audio settings).
- Added Level Select UI to the start screen.
- Fixed modular architecture and build errors.
- Added Fireball mechanic and various Power-ups.
- Enhanced visuals with Neon Glow and Parallax.

## Pending Tasks / Ideas
- [ ] **Content:** Add more enemy types (Flying drones, turrets).
- [ ] **Visuals:** Add a "Ghost Trail" effect when moving fast.
- [ ] **Architecture:** Implement an Entity Component System (ECS) for easier object management.
- [ ] **Polish:** Add sound volume sliders and keyboard rebinding.
- [ ] **World:** Add moving platforms or conveyor belts.

## Technical Debt / Known Issues
- Physics logic is getting complex; might need a dedicated physics engine approach or cleaner state management.
- Asset rendering is still procedural; could benefit from sprite sheet support.
