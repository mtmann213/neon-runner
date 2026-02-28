# Project Resume: Neon Runner

## Project Overview
A highly polished, React-based 2D Action Platformer focusing on "game juice," retro aesthetics, and deep procedural replayability. The game features infinite scaling levels, a robust combat system, and a variety of unique power-ups and environments.

## Technical Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript (Strict Typing)
- **Rendering:** HTML5 Canvas 2D API (High DPI Scaled)
- **Physics:** Custom Axis-Aligned Bounding Box (AABB) system with Axis Separation.
- **Architecture:** Modularized into specialized units:
  - `LevelGenerator.ts`: Chunk-based procedural generation.
  - `physics.ts`: Core movement, collision, and AI logic.
  - `renderer.ts`: HD gradient-based drawing and visual effects.
  - `AudioManager.ts`: Procedural synthwave music and SFX.

## Current State (as of 2026-02-27)

### 1. Movement & Controls
- **Feel:** Coyote Time (grace period), Jump Buffering (input memory).
- **Abilities:** 
  - Standard Walk/Run.
  - Double Jump (Mid-air boost with cyan particles).
  - Wall Slide & Wall Jump (Kick off blocks to gain height).
  - Swimming (Floaty physics and manual flapping in water).
  - Rolling (Shift to dash/dodge and kill normal enemies).

### 2. Combat & Hazards
- **Fireballs:** Press 'F' to shoot. Features gravity, ground/platform bouncing, and 3s cooldown with UI bar.
- **Firebars:** Classic rotating fire chains that scale in length and speed.
- **Enemies:**
  - **Patrol:** Ground-based walking enemies.
  - **Spikes:** Static ground hazards.
  - **Flying Drones:** Airy enemies with sine-wave flight paths.
  - **Turrets:** Stationary units that fire aimed projectiles at the player.
  - **Bosses:** Massive 100x100 units spawning every 3rd level with scaling HP and jumping AI.

### 3. Power-ups (Weighted Randomized Drops)
- **Bacon:** Makes player "Big" (100px height) for 10 seconds.
- **Giant Burger:** Makes player "Giantic" (360px height), invincible, and able to walk through blocks.
- **Wing:** Enables flight for 10 seconds (Hold Jump to flap).
- **Gold Carrot:** Grants an extra permanent life.
- **Lightning Shoes:** Increases move speed.
- **Spring:** Increases jump height.

### 4. World & Secrets
- **Procedural Levels:** Infinite generation using randomized chunks.
- **Bonus Rooms:** Glowing purple doors lead to secret prize rooms. Doors lock visually after one-time use.
- **Water Level:** Level 2 is a fully submerged environment with custom rendering (bubbles, surface lines).

### 5. Polish & UI
- **Visuals:** CRT/Scanline overlay, Vignette, Neon Glow (shadowBlur), HD Gradients.
- **Loading:** 5-second startup with a mathematically accurate 3D spinning N64 logo.
- **UI:** HUD with Heart icons, Fireball cooldown bar, Level Select menu, and High Score persistence.

## Recent Changes
- Overhauled static level system into an infinite Procedural Generator.
- Implemented modular architecture for better maintainability.
- Added 3D N64-style loading sequence.
- Implemented Water physics and specialized character animations (moving arms).
- Added secret bonus room logic with state persistence.
- Refined boss collision to make "bopping" more forgiving.

## Persistence
- **LocalStorage Keys:**
  - `neonRunnerHighScore`: Best score achieved.
  - `neonRunnerUnlockedLevel`: Progress through procedural milestones.
  - `neonRunnerAudio`: Sound preference toggle.
