import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    worldWidth: 5000,
    enemies: [
      { id: 1, x: 800, w: 40, h: 40, vx: 2, type: 'patrol', color: '#e74c3c' },
      { id: 2, x: 1600, w: 40, h: 40, vx: 3, type: 'patrol', color: '#e74c3c' },
      { id: 3, x: 2400, w: 60, h: 40, type: 'spikes', color: '#2c3e50' },
      { id: 4, x: 3200, w: 40, h: 40, vx: 4, type: 'patrol', color: '#e74c3c' },
      { id: 5, x: 4000, w: 40, h: 40, vx: 5, type: 'patrol', color: '#e74c3c' }
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
      { x: 700, y: 300, w: 40, h: 40, hit: false },
      { x: 1000, y: 220, w: 40, h: 40, hit: false },
      { x: 2200, y: 200, w: 40, h: 40, hit: false },
    ]
  },
  {
      worldWidth: 6000,
      enemies: [
        { id: 6, x: 1000, w: 40, h: 40, vx: 4, type: 'patrol', color: '#e74c3c' },
        { id: 7, x: 2000, w: 80, h: 40, type: 'spikes', color: '#2c3e50' },
        { id: 8, x: 3000, w: 40, h: 40, vx: 6, type: 'patrol', color: '#e74c3c' },
        { id: 9, x: 4000, w: 100, h: 40, type: 'spikes', color: '#2c3e50' },
        { id: 10, x: 5000, w: 40, h: 40, vx: 8, type: 'patrol', color: '#e74c3c' }
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
          { x: 1150, y: 240, w: 40, h: 40, hit: false },
          { x: 1450, y: 160, w: 40, h: 40, hit: false },
      ]
    },
    {
      worldWidth: 8000,
      enemies: [
        { id: 11, x: 1000, w: 40, h: 40, vx: 5, type: 'patrol', color: '#e74c3c' },
        { id: 12, x: 2000, w: 60, h: 40, type: 'spikes', color: '#2c3e50' },
        { id: 13, x: 3000, w: 40, h: 40, vx: 6, type: 'patrol', color: '#e74c3c' },
        { id: 14, x: 4500, w: 80, h: 40, type: 'spikes', color: '#2c3e50' },
        { id: 100, x: 7000, w: 100, h: 100, vx: 4, vy: 0, type: 'boss', hp: 3, maxHp: 3, color: '#9b59b6', lastJump: 0 }
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
          { x: 1150, y: 240, w: 40, h: 40, hit: false },
          { x: 1450, y: 160, w: 40, h: 40, hit: false },
          { x: 4150, y: 200, w: 40, h: 40, hit: false },
          { x: 4550, y: 100, w: 40, h: 40, hit: false },
      ]
    }
];
