# Project Resume: Neon Runner

## Project Overview
A React-based 2D Action Platformer with procedural generation, retro synthwave aesthetics, and polished "game juice."

## Technical Stack
- **Framework:** React 19 + Vite + TypeScript.
- **Rendering:** High DPI HTML5 Canvas.
- **Modular Architecture:** Logic split into `physics.ts`, `renderer.ts`, `LevelGenerator.ts`, `AudioManager.ts`, and `types.ts`.

## Current State (as of 2026-02-27)

### Core Mechanics
- **Movement:** Standard walk, Double Jump (with cyan flash), Wall Slide & Wall Jump.
- **Swimming:** Reduced gravity and manual "flapping" mechanics in Level 2 (Water Level).
- **Flight:** Wing power-up enables 10s of flight with flapping animation.
- **Combat:** Bouncing fireballs (F key) with 3s cooldown and UI progress bar.
- **Giantic:** Burger power-up makes you massive (240x360), invincible, and able to walk through blocks.
- **Big Mode:** Bacon makes you big permanently until you take damage (acts as a shield).

### World & Hazards
- **ProcGen:** Infinite procedural levels that scale in length and difficulty.
- **Level 2:** Underwater theme with custom rendering (bubbles, surface, blue overlay).
- **Hazards:** Rotating Firebars (scaling length/speed), Flying Drones, Turrets, and Bosses (every 3rd level).
- **Secrets:** Neon purple doors lead to bonus rooms. Doors lock (turn grey with 'X') after one-use.

### Visuals & Juice
- **Ghost Trail:** Fading afterimages when rolling, flying, or moving at high speeds.
- **Glow:** Neon shadow blur on characters, enemies, and fireballs.
- **CRT Effect:** Scanline and vignette overlay for a retro feel.
- **Loading:** 5-second sequence featuring an accurate, spinning 3D N64 logo.

## Recent Changes & Fixes
- Implemented **Ghost Trail** effect.
- Fixed **Jumping Freeze** in water levels by correcting variable initialization order.
- Resolved **Warp Loop** by offsetting player position on bonus room exit.
- Fixed **Damage Logic** and **Hearts UI** sync (now uses `livesRef.current`).
- Cleaned up TypeScript errors and unified state management on the `Level` object.

## How to Resume
1.  Check `PLAN.md` for the next phases (Moving Platforms, ECS refactor, dash ability).
2.  All logic is stable and local build (`npm run build`) is passing.
3.  The Git repo is initialized and has all these features committed.
