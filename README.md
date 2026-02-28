# jgmann - 2D Action Platformer

A polished 2D platformer built with React, TypeScript, and the HTML5 Canvas API. This project focuses on implementing "game juice" (screen shake, particles, smooth feel) to create a satisfying gameplay experience.

## Features

- **Dynamic Gameplay:** Smooth movement, jumping, and rolling mechanics.
- **Game Juice:** 
  - Reactive screen shake on impactful events.
  - Versatile particle system for feedback.
  - Visual cues for invincibility and speed boosts.
- **Enemies & Hazards:** Diverse challenges including patrolling enemies and static spikes.
- **Progression:** Score system and collectible chests for power-ups and health.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Controls

- **Arrow Keys:** Move Left/Right
- **Space:** Jump
- **Left Shift:** Roll (while grounded)

## Architecture

The game is currently centered around a custom game loop using `requestAnimationFrame` within a React `useEffect` hook. Rendering is handled manually via the Canvas 2D context.

- **`src/App.tsx`**: Contains the core game loop, state management, and rendering logic.
- **`src/App.css`**: Styles for the game container and UI overlays.
