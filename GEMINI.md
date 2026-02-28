# Project Resume: jgmann

## Project Overview
A React-based 2D platformer built with Canvas, focusing on "game juice" and polished mechanics. Now features procedural generation for infinite replayability.

## Current State (as of 2026-02-27)
- **Engine:** React + Vite + TypeScript + Modular Architecture.
- **Level System:** Procedural Generation Engine (`LevelGenerator.ts`).
  - Levels scale in length and difficulty.
  - Chunk-based generation with randomized stitching.
  - Periodic Boss encounters (every 3rd level) with scaling HP.
- **Core Mechanics:**
  - **Feel:** Coyote Time, Jump Buffering, Double Jump.
  - **Combat:** Bouncing Fireballs (F key) with cooldown.
  - **Power-ups:** Weighted Loot Table (Bacon, Carrot, Shoes, Spring, Giant Burger).
- **Enemies:** 
  - Patrol, Spikes, Boss.
  - **NEW:** Flying Drones (Sine wave movement).
  - **NEW:** Ranged Turrets (Shoots projectiles at player).
- **Juice & Visuals:**
  - CRT/Scanline overlay, Parallax backgrounds, Neon Glow.
  - Dynamic particles and screen shake.
- **Progression:**
  - Level selection menu (for unlocked levels).
  - High Score persistence.

## Recent Changes
- Implemented Procedural Level Generation.
- Added Flying and Ranged (Turret) enemy types.
- Implemented weighted randomized loot system for blocks.
- Added enemy projectiles and corresponding physics/rendering.

## Pending Tasks / Ideas
- [x] **Secret:** Add hidden "warp pipes" or doors to secret bonus rooms.
- [ ] **Mechanics:** Add a wall-slide and wall-jump.
- [ ] **Visuals:** Add a "Ghost Trail" effect for high-speed movement.
- [ ] **Architecture:** Move player input handling to a dedicated manager.
- [ ] **Polish:** Add more specific sound effects for different power-ups.

## Technical Debt / Known Issues
- `physics.ts` contains a lot of manual collision logic; could be cleaner.
- Enemy patrol bounds are currently based on current position rather than spawn origin.
