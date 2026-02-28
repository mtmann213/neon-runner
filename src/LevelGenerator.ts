import type { Level, Enemy, Chest, Platform, Block, BackgroundLayer } from './types';

const LOOT_TABLE: ('bacon' | 'carrot' | 'shoes' | 'spring' | 'burger')[] = [
    'bacon', 'bacon', 'bacon', 'bacon', // 40%
    'spring', 'spring', 'spring',       // 30%
    'shoes', 'shoes',                   // 20%
    'carrot',                           // 8% (approx)
    'burger'                            // 2% (approx)
];

const getRandomPrize = () => LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];

const BG_PALETTES = [
    { sky: '#1a1a2e', mountain: '#16213e', mid: '#0f3460' },
    { sky: '#240046', mountain: '#3c096c', mid: '#5a189a' },
    { sky: '#03071e', mountain: '#370617', mid: '#6a040f' },
    { sky: '#001219', mountain: '#005f73', mid: '#0a9396' },
];

export const generateLevel = (levelNumber: number, groundY: number): Level => {
    const seed = levelNumber * 12345;
    const worldWidth = 5000 + (levelNumber * 2000); // Levels get longer
    const palette = BG_PALETTES[levelNumber % BG_PALETTES.length];

    const bgLayers: BackgroundLayer[] = [
        { color: palette.sky, speed: 0.05, height: 600, seed: seed },
        { color: palette.mountain, speed: 0.1, height: 400, seed: seed + 1 },
        { color: palette.mid, speed: 0.2, height: 200, seed: seed + 2 },
    ];

    const enemies: Enemy[] = [];
    const chests: Chest[] = [];
    const platforms: Platform[] = [];
    const blocks: Block[] = [];

    let currentX = 800; // Start spawning after some buffer
    let enemyId = 1;

    while (currentX < worldWidth - 1000) {
        const r = Math.random();
        
        if (r < 0.3) {
            // Flat area with enemies
            const count = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                enemies.push({
                    id: enemyId++,
                    x: currentX + (i * 300),
                    y: groundY - 40,
                    w: 40, h: 40,
                    vx: 2 + (levelNumber * 0.5),
                    type: Math.random() > 0.7 ? 'flying' : 'patrol',
                    color: '#ff00ff',
                    alive: true,
                    startY: groundY - 150 - Math.random() * 100
                });
            }
            currentX += 1000;
        } else if (r < 0.6) {
            // Platforming section
            const platCount = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < platCount; i++) {
                const py = groundY - 100 - (i * 100);
                const px = currentX + (i * 250);
                platforms.push({ x: px, y: py, w: 150, h: 20 });
                
                if (Math.random() > 0.5) {
                    blocks.push({
                        x: px + 55, y: py - 100,
                        w: 40, h: 40,
                        hit: false,
                        prizeType: getRandomPrize()
                    });
                }
            }
            currentX += platCount * 250 + 200;
        } else if (r < 0.8) {
            // Hazard section
            enemies.push({
                id: enemyId++,
                x: currentX, y: groundY - 40,
                w: 80 + Math.random() * 100, h: 40,
                type: 'spikes', color: '#00ffff',
                alive: true
            });
            // Maybe a turret on a platform above
            if (levelNumber > 0) {
                platforms.push({ x: currentX, y: groundY - 200, w: 100, h: 20 });
                enemies.push({
                    id: enemyId++,
                    x: currentX + 30, y: groundY - 240,
                    w: 40, h: 40,
                    type: 'turret', color: '#ff0000',
                    alive: true, lastShot: 0
                });
            }
            currentX += 600;
        } else {
            // Treasure cache
            chests.push({
                x: currentX, y: groundY - 40,
                w: 40, h: 40, type: Math.random() > 0.5 ? 'health' : 'speed',
                open: false
            });
            currentX += 400;
        }
    }

    // Boss spawning logic
    const isBossLevel = (levelNumber + 1) % 3 === 0;
    if (isBossLevel) {
        const bossHp = 3 + Math.floor(levelNumber / 3) * 2;
        enemies.push({
            id: 1000,
            x: worldWidth - 1200, y: groundY - 100,
            w: 100, h: 100,
            vx: 4 + (levelNumber * 0.2), vy: 0,
            type: 'boss', hp: bossHp, maxHp: bossHp,
            color: '#ff00ff', alive: true, lastJump: 0
        });
    }

    return {
        worldWidth,
        enemies,
        chests,
        platforms,
        blocks,
        bgLayers
    };
};
