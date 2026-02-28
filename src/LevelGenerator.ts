import type { Level, Enemy, Chest, Platform, Block, BackgroundLayer, Warp, Firebar } from './types';

const LOOT_TABLE: ('bacon' | 'carrot' | 'shoes' | 'spring' | 'burger')[] = [
    'bacon', 'bacon', 'bacon', 'bacon', // 40%
    'spring', 'spring', 'spring',       // 30%
    'shoes', 'shoes',                   // 20%
    'carrot',                           // 8% (approx)
    'burger'                            // 2% (approx)
];

export const getRandomPrize = () => LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];

const BG_PALETTES = [
    { sky: '#1a1a2e', mountain: '#16213e', mid: '#0f3460' }, // Level 1
    { sky: '#0077be', mountain: '#005f73', mid: '#0a9396' }, // Level 2 (Water)
    { sky: '#03071e', mountain: '#370617', mid: '#6a040f' }, // Level 3
    { sky: '#001219', mountain: '#005f73', mid: '#0a9396' },
];

export const generateBonusRoom = (groundY: number): Level => {
    const worldWidth = 1200;
    const bgLayers: BackgroundLayer[] = [
        { color: '#000', speed: 0, height: 600, seed: 0 },
        { color: '#111', speed: 0, height: 400, seed: 0 },
        { color: '#222', speed: 0, height: 200, seed: 0 },
    ];
    const platforms: Platform[] = [
        { x: 100, y: 450, w: 200, h: 20 },
        { x: 400, y: 350, w: 200, h: 20 },
        { x: 700, y: 250, w: 200, h: 20 },
        { x: 400, y: 150, w: 200, h: 20 },
    ];
    const blocks: Block[] = [
        { x: 200, y: 350, w: 40, h: 40, hit: false, prizeType: 'burger' },
        { x: 500, y: 250, w: 40, h: 40, hit: false, prizeType: 'carrot' },
        { x: 800, y: 150, w: 40, h: 40, hit: false, prizeType: 'shoes' },
        { x: 500, y: 50, w: 40, h: 40, hit: false, prizeType: 'spring' },
    ];
    const warps: Warp[] = [{ x: 1000, y: groundY - 80, w: 60, h: 80, target: 'main', id: 'exit' }];
    return { worldWidth, enemies: [], chests: [], platforms, blocks, bgLayers, warps };
};

export const generateLevel = (levelNumber: number, groundY: number): Level => {
    const seed = levelNumber * 12345;
    const worldWidth = 5000 + (levelNumber * 2000);
    const palette = BG_PALETTES[levelNumber % BG_PALETTES.length];
    
    const isWaterLevel = levelNumber === 1;
    const waterLevel = isWaterLevel ? groundY - 300 : undefined;

    const bgLayers: BackgroundLayer[] = [
        { color: palette.sky, speed: 0.05, height: 600, seed: seed },
        { color: palette.mountain, speed: 0.1, height: 400, seed: seed + 1 },
        { color: palette.mid, speed: 0.2, height: 200, seed: seed + 2 },
    ];

    const enemies: Enemy[] = [];
    const chests: Chest[] = [];
    const platforms: Platform[] = [];
    const blocks: Block[] = [];
    const warps: Warp[] = [];
    const firebars: Firebar[] = [];

    let currentX = 800;
    let enemyId = 1;
    let warpSpawned = false;

    while (currentX < worldWidth - 1000) {
        const r = Math.random();
        if (!warpSpawned && currentX > 2000 && Math.random() > 0.8) {
            warps.push({ x: currentX, y: groundY - 80, w: 60, h: 80, target: 'bonus', id: 'secret' });
            warpSpawned = true;
            currentX += 200;
        }

        if (r < 0.2) {
            // Flat area with enemies
            const count = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                enemies.push({
                    id: enemyId++, x: currentX + (i * 300), y: groundY - 40, w: 40, h: 40,
                    vx: 2 + (levelNumber * 0.5),
                    type: (isWaterLevel || Math.random() > 0.7) ? 'flying' : 'patrol',
                    color: isWaterLevel ? '#00ffff' : '#ff00ff',
                    alive: true,
                    startY: groundY - (isWaterLevel ? 250 : 150) - Math.random() * 100
                });
            }
            currentX += 1000;
        } else if (r < 0.5) {
            // Platforming section
            const platCount = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < platCount; i++) {
                const py = groundY - 100 - (i * 100);
                const px = currentX + (i * 250);
                platforms.push({ x: px, y: py, w: 150, h: 20 });
                if (Math.random() > 0.5) {
                    blocks.push({ x: px + 55, y: py - 100, w: 40, h: 40, hit: false, prizeType: getRandomPrize() });
                }
            }
            currentX += platCount * 250 + 200;
        } else if (r < 0.7) {
            // Firebar section
            blocks.push({ x: currentX, y: groundY - 200, w: 40, h: 40, hit: false });
            firebars.push({
                x: currentX + 20, y: groundY - 180,
                angle: Math.random() * Math.PI * 2,
                length: 4 + Math.floor(levelNumber / 2),
                speed: 0.03 + (levelNumber * 0.01)
            });
            currentX += 600;
        } else if (r < 0.85) {
            // Hazard section
            enemies.push({
                id: enemyId++, x: currentX, y: groundY - 40, w: 80 + Math.random() * 100, h: 40,
                type: 'spikes', color: isWaterLevel ? '#48cae4' : '#00ffff', alive: true
            });
            if (levelNumber > 0) {
                platforms.push({ x: currentX, y: groundY - 200, w: 100, h: 20 });
                enemies.push({
                    id: enemyId++, x: currentX + 30, y: groundY - 240, w: 40, h: 40,
                    type: 'turret', color: '#ff0000', alive: true, lastShot: 0
                });
            }
            currentX += 600;
        } else {
            chests.push({ x: currentX, y: groundY - 40, w: 40, h: 40, type: Math.random() > 0.5 ? 'health' : 'speed', open: false });
            currentX += 400;
        }
    }

    const isBossLevel = (levelNumber + 1) % 3 === 0;
    if (isBossLevel) {
        const bossHp = 3 + Math.floor(levelNumber / 3) * 2;
        enemies.push({
            id: 1000, x: worldWidth - 1200, y: groundY - 100, w: 100, h: 100,
            vx: 4 + (levelNumber * 0.2), vy: 0,
            type: 'boss', hp: bossHp, maxHp: bossHp, color: '#ff00ff', alive: true, lastJump: 0
        });
    }

    return { worldWidth, enemies, chests, platforms, blocks, bgLayers, warps, waterLevel, firebars };
};
