# Neon Runner: Procedural Action Platformer

A high-performance, retro-futuristic 2D platformer built with **React**, **TypeScript**, and the **HTML5 Canvas API**. Experience infinite procedural levels, weighted power-up drops, and a deep combat system wrapped in a synthwave aesthetic.

![Version](https://img.shields.io/badge/version-1.5.0-cyan)
![Tech](https://img.shields.io/badge/tech-React--Vite--TS-blue)

## 🕹 Features

- **Infinite Replayability:** A custom procedural generation engine stitches together randomized level chunks, scaling length and difficulty as you progress.
- **Advanced Platforming:** Tight controls with Coyote Time, Jump Buffering, Wall Jumping, and Swimming.
- **Deep Combat:** Shoot bouncing fireballs with physics-based arcs. Face diverse enemies including Flying Drones, Turrets, and massive scaling Bosses.
- **Dynamic Power-ups:** Collect randomized drops like the Giant Burger (become a screen-filling behemoth!) or Wings (limited-time flight).
- **Secret Areas:** Discover hidden neon doors leading to prize-filled bonus rooms.
- **Retro Visuals:** CRT Scanline overlay, HD gradients, and a 3D spinning N64-style loading sequence.

## ⌨️ Controls

| Action | Key |
| :--- | :--- |
| **Move** | Arrow Left / Right |
| **Jump** | Space (Double Jump available) |
| **Roll / Dash** | Left Shift |
| **Shoot Fireball** | F (3s Cooldown) |
| **Swim / Fly** | Space (Tap/Hold during active state) |

## 🛠 Architecture

The project is built with a modular structure to ensure maintainability and performance:

- **`src/LevelGenerator.ts`**: The procedural engine. Uses a chunk-based approach to generate infinite world data.
- **`src/physics.ts`**: Handles all AABB collisions, player states, AI behavior, and projectile movement.
- **`src/renderer.ts`**: Specialized drawing module using HD gradients and shadow effects for a neon glow.
- **`src/AudioManager.ts`**: Manages Web Audio API for procedural music and sound effects.
- **`src/types.ts`**: Centralized TypeScript definitions for game entities.

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run in development mode:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## 💾 Persistence

Game progress is automatically saved to `localStorage`, including:
- High Scores
- Level Unlocks
- Audio Preferences
