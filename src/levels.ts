import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    worldWidth: 5000,
    bgLayers: [
      { color: '#1a1a2e', speed: 0.05, height: 600, seed: 123 },
      { color: '#16213e', speed: 0.1, height: 400, seed: 456 },
      { color: '#0f3460', speed: 0.2, height: 200, seed: 789 },
    ],
    enemies: [
      { id: 1, x: 800, y: 500, w: 40, h: 40, vx: 2, type: 'patrol', color: '#ff00ff', alive: true },
      { id: 2, x: 1600, y: 500, w: 40, h: 40, vx: 3, type: 'patrol', color: '#ff00ff', alive: true },
      { id: 3, x: 2400, y: 500, w: 60, h: 40, type: 'spikes', color: '#00ffff', alive: true },
      { id: 4, x: 3200, y: 500, w: 40, h: 40, vx: 4, type: 'patrol', color: '#ff00ff', alive: true },
      { id: 5, x: 4000, y: 500, w: 40, h: 40, vx: 5, type: 'patrol', color: '#ff00ff', alive: true }
    ],
    chests: [
      { x: 1200, y: 0, w: 40, h: 40, type: 'health', open: false },
      { x: 2800, y: 0, w: 40, h: 40, type: 'speed', open: false },
      { x: 4500, y: 0, w: 40, h: 40, type: 'health', open: false }
    ],
    platforms: [
      { x: 600, y: 420, w: 150, h: 20 },
      { x: 900, y: 340, w: 150, h: 20 },
      { x: 1800, y: 420, w: 200, h: 20 },
      { x: 2100, y: 340, w: 200, h: 20 },
    ],
    blocks: [
      { x: 700, y: 300, w: 40, h: 40, hit: false, prizeType: 'bacon' },
      { x: 1000, y: 220, w: 40, h: 40, hit: false, prizeType: 'burger' },
      { x: 2200, y: 200, w: 40, h: 40, hit: false, prizeType: 'carrot' },
    ]
  },
  {
      worldWidth: 6000,
      bgLayers: [
        { color: '#240046', speed: 0.05, height: 600, seed: 111 },
        { color: '#3c096c', speed: 0.1, height: 450, seed: 222 },
        { color: '#5a189a', speed: 0.2, height: 300, seed: 333 },
      ],
      enemies: [
        { id: 6, x: 1000, y: 500, w: 40, h: 40, vx: 4, type: 'patrol', color: '#ff00ff', alive: true },
        { id: 7, x: 2000, y: 500, w: 80, h: 40, type: 'spikes', color: '#00ffff', alive: true },
        { id: 8, x: 3000, y: 500, w: 40, h: 40, vx: 6, type: 'patrol', color: '#ff00ff', alive: true },
        { id: 9, x: 4000, y: 500, w: 100, h: 40, type: 'spikes', color: '#00ffff', alive: true },
        { id: 10, x: 5000, y: 500, w: 40, h: 40, vx: 8, type: 'patrol', color: '#ff00ff', alive: true }
      ],
      chests: [
        { x: 1500, y: 0, w: 40, h: 40, type: 'speed', open: false },
        { x: 3500, y: 0, w: 40, h: 40, type: 'health', open: false },
        { x: 5500, y: 0, w: 40, h: 40, type: 'speed', open: false }
      ],
      platforms: [
          { x: 800, y: 420, w: 120, h: 20 },
          { x: 1100, y: 340, w: 120, h: 20 },
          { x: 1400, y: 260, w: 120, h: 20 },
      ],
      blocks: [
          { x: 1150, y: 240, w: 40, h: 40, hit: false, prizeType: 'spring' },
          { x: 1450, y: 160, w: 40, h: 40, hit: false, prizeType: 'bacon' },
      ]
    },
    {
      worldWidth: 8000,
      bgLayers: [
        { color: '#03071e', speed: 0.05, height: 600, seed: 999 },
        { color: '#370617', speed: 0.1, height: 500, seed: 888 },
        { color: '#6a040f', speed: 0.2, height: 400, seed: 777 },
      ],
      enemies: [
        { id: 11, x: 1000, y: 500, w: 40, h: 40, vx: 5, type: 'patrol', color: '#ff00ff', alive: true },
        { id: 12, x: 2000, y: 500, w: 60, h: 40, type: 'spikes', color: '#00ffff', alive: true },
        { id: 13, x: 3000, y: 500, w: 40, h: 40, vx: 6, type: 'patrol', color: '#ff00ff', alive: true },
        { id: 14, x: 4500, y: 500, w: 80, h: 40, type: 'spikes', color: '#00ffff', alive: true },
        { id: 100, x: 7000, y: 500, w: 100, h: 100, vx: 4, vy: 0, type: 'boss', hp: 3, maxHp: 3, color: '#ff00ff', alive: true, lastJump: 0 }
      ],
      chests: [
        { x: 1500, y: 0, w: 40, h: 40, type: 'speed', open: false },
        { x: 3500, y: 0, w: 40, h: 40, type: 'health', open: false },
        { x: 5500, y: 0, w: 40, h: 40, type: 'health', open: false },
        { x: 6500, y: 0, w: 40, h: 40, type: 'speed', open: false }
      ],
      platforms: [
          { x: 800, y: 420, w: 120, h: 20 },
          { x: 1100, y: 340, w: 120, h: 20 },
          { x: 1400, y: 260, w: 120, h: 20 },
          { x: 4000, y: 350, w: 300, h: 20 },
          { x: 4400, y: 250, w: 300, h: 20 },
      ],
      blocks: [
          { x: 1150, y: 240, w: 40, h: 40, hit: false, prizeType: 'carrot' },
          { x: 1450, y: 160, w: 40, h: 40, hit: false, prizeType: 'spring' },
          { x: 4150, y: 200, w: 40, h: 40, hit: false, prizeType: 'burger' },
          { x: 4550, y: 100, w: 40, h: 40, hit: false, prizeType: 'bacon' },
      ]
    }
];
