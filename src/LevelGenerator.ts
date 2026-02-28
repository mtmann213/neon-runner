import type { Level, Enemy, Chest, Platform, Block, BackgroundLayer, Warp, Firebar, MovingPlatform, Switch, LaserGate, Spring } from './types';

const LOOT_TABLE: ('bacon' | 'carrot' | 'shoes' | 'spring' | 'burger' | 'wing' | 'laser' | 'shard' | 'shield' | 'magnet')[] = [
    'bacon', 'bacon', 'bacon',          // 20%
    'spring', 'spring', 'spring',       // 20%
    'shoes', 'shoes',                   // 13%
    'laser', 'laser',                   // 13%
    'shard', 'shard', 'shard',          // 20%
    'shield',                           // 6.6%
    'magnet',                           // 6.6%
    'carrot',                           // 0.6%
    'burger',                           // 0.1%
    'wing'                              // 0.1%
];

export const getRandomPrize = () => LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];

const BG_PALETTES = [
    { sky: '#1a1a2e', mountain: '#16213e', mid: '#0f3460' }, // Level 1 (City)
    { sky: '#002200', mountain: '#004400', mid: '#006600' }, // Level 2 (Toxic Sewers)
    { sky: '#2e0000', mountain: '#4a0000', mid: '#6a0000' }, // Level 3 (Magma Core)
    { sky: '#0a0a1a', mountain: '#1a1a2a', mid: '#2a2a3a' }, // Level 4 (Cyber Tundra)
    { sky: '#110022', mountain: '#330033', mid: '#550055' }, // Level 5 (Digital Void)
    { sky: '#001a33', mountain: '#003366', mid: '#004c99' }, // Level 6 (Sky Station)
    { sky: '#333300', mountain: '#666600', mid: '#999900' }, // Level 7 (The Hive)
    { sky: '#111111', mountain: '#222222', mid: '#ff0000' }, // Level 8 (Final Core)
    { sky: '#000033', mountain: '#000066', mid: '#0000ff' }, // Level 9 (Deep Sea)
    { sky: '#330000', mountain: '#660000', mid: '#990000' }, // Level 10 (Hell)
    { sky: '#003333', mountain: '#006666', mid: '#00ffff' }, // Level 11 (Glitch Labs)
    { sky: '#222222', mountain: '#444444', mid: '#888888' }, // Level 12 (Monochrome)
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
        { x: 700, y: 250, w: 200, h: 20 },
    ];
    const enemies: Enemy[] = [
        { id: 999, x: 400, y: groundY - 40, w: 200, h: 40, type: 'spikes', color: '#ff00ff', alive: true }
    ];
    const firebars: Firebar[] = [
        { x: 600, y: 300, angle: 0, length: 5, speed: 0.05 }
    ];
    const movingPlatforms: MovingPlatform[] = [
        { x: 400, y: 350, w: 150, h: 20, startX: 400, startY: 350, rangeX: 100, rangeY: 50, speed: 0.05, timeOffset: 0 },
        { x: 400, y: 150, w: 150, h: 20, startX: 400, startY: 150, rangeX: 150, rangeY: 0, speed: 0.03, timeOffset: 100 },
    ];
    const blocks: Block[] = [
        { x: 200, y: 350, w: 40, h: 40, hit: false, prizeType: getRandomPrize() },
        { x: 500, y: 250, w: 40, h: 40, hit: false, prizeType: getRandomPrize() },
        { x: 800, y: 150, w: 40, h: 40, hit: false, prizeType: getRandomPrize() },
        { x: 500, y: 50, w: 40, h: 40, hit: false, prizeType: getRandomPrize() },
        { x: 600, y: 50, w: 40, h: 40, hit: false, prizeType: 'shard' },
    ];
    const warps: Warp[] = [{ x: 1000, y: groundY - 80, w: 60, h: 80, target: 'main', id: 'exit' }];
    return { worldWidth, enemies, chests: [], platforms, movingPlatforms, blocks, bgLayers, warps, firebars, groundSegments: [{x: 0, y: groundY, w: 1200, h: 500}] };
};

export const generateLevel = (levelNumber: number, groundY: number): Level => {
    const seed = levelNumber * 12345;
    const worldWidth = 5000 + (levelNumber * 2000);
    const palette = BG_PALETTES[levelNumber % 12];
    
    const isCityLevel = levelNumber % 12 === 0;
    const isWaterLevel = levelNumber % 12 === 1 || levelNumber % 12 === 8; 
    const waterLevel = isWaterLevel ? groundY - 300 : undefined;
    
    const isLavaLevel = levelNumber % 12 === 2 || levelNumber % 12 === 9; 
    const lavaPools: { x: number, y: number, w: number, h: number }[] = [];
    
    const isTundraLevel = levelNumber % 12 === 3;
    const friction = isTundraLevel ? 0.98 : (levelNumber % 12 === 11 ? 0.99 : 0.8); 

    const isVoidLevel = levelNumber % 12 === 4;
    const isSkyLevel = levelNumber % 12 === 5;
    const isHiveLevel = levelNumber % 12 === 6;
    const isFinalLevel = levelNumber % 12 === 7;
    const isGlitchLevel = levelNumber % 12 === 10;

    let weather: 'none' | 'rain' | 'snow' = 'none';
    if (isTundraLevel || isVoidLevel || isGlitchLevel) weather = 'snow';
    else if ((isCityLevel || isWaterLevel || isHiveLevel) && Math.random() > 0.5) weather = 'rain';

    const bgLayers: BackgroundLayer[] = [
        { color: palette.sky, speed: 0.05, height: 600, seed: seed, isCityscape: isCityLevel || isSkyLevel, isSpace: isVoidLevel || isSkyLevel || isGlitchLevel },
        { color: palette.mountain, speed: 0.1, height: 400, seed: seed + 1, isCityscape: isCityLevel, isSpace: isVoidLevel },
        { color: palette.mid, speed: 0.2, height: 200, seed: seed + 2, isCityscape: isCityLevel || isFinalLevel },
    ];

    const enemies: Enemy[] = [];
    const chests: Chest[] = [];
    const platforms: Platform[] = [];
    const movingPlatforms: MovingPlatform[] = [];
    const blocks: Block[] = [];
    const warps: Warp[] = [];
    const firebars: Firebar[] = [];
    const switches: Switch[] = [];
    const laserGates: LaserGate[] = [];
    const springs: Spring[] = [];
    const checkpoints: { x: number, y: number, active: boolean }[] = [];
    const groundSegments: { x: number, y: number, w: number, h: number }[] = [];

    // Starting ground
    groundSegments.push({ x: 0, y: groundY, w: 800, h: 500 });

    let currentX = 800;
    let enemyId = 1;
    let switchIdCounter = 1;
    let warpSpawned = false;
    let checkpointSpawned = false;
    let currentGroundY = groundY;

    while (currentX < worldWidth - 1000) {
        const r = Math.random();
        
        // Terrain variability logic
        if (Math.random() > 0.6 && !isVoidLevel && !isSkyLevel) {
            const step = (Math.random() > 0.5 ? -1 : 1) * (60 + Math.random() * 80);
            currentGroundY += step;
            // Clamp groundY
            if (currentGroundY < 150) currentGroundY = 150;
            if (currentGroundY > groundY + 150) currentGroundY = groundY + 150;
        }

        if (Math.random() > 0.85 && !isLavaLevel && !isVoidLevel && !isSkyLevel) {
            // Natural Pit
            const gapW = 250 + Math.random() * 200;
            platforms.push({ x: currentX + gapW * 0.2, y: currentGroundY - 120, w: 100, h: 20 });
            if (gapW > 350) platforms.push({ x: currentX + gapW * 0.6, y: currentGroundY - 150, w: 100, h: 20 });
            
            // Safe checkpoint placement on platforms if in a pit zone
            if (!checkpointSpawned && currentX > worldWidth / 2) {
                checkpoints.push({ x: currentX + gapW * 0.2 + 20, y: currentGroundY - 180, active: false });
                checkpointSpawned = true;
            }

            currentX += gapW + 150;
            continue;
        }

        if (!warpSpawned && currentX > 2000 && Math.random() > 0.8) {
            warps.push({ x: currentX, y: currentGroundY - 80, w: 60, h: 80, target: 'bonus', id: 'secret' });
            warpSpawned = true;
            groundSegments.push({ x: currentX - 100, y: currentGroundY, w: 400, h: 500 });
            currentX += 300;
            continue;
        }

        if (isLavaLevel && Math.random() > 0.7) {
            const poolW = 350 + Math.random() * 350;
            lavaPools.push({ x: currentX, y: currentGroundY + 20, w: poolW, h: 200 });
            platforms.push({ x: currentX + poolW * 0.2, y: currentGroundY - 120, w: 120, h: 20 });
            if (poolW > 500) platforms.push({ x: currentX + poolW * 0.6, y: currentGroundY - 150, w: 120, h: 20 });
            
            if (!checkpointSpawned && currentX > worldWidth / 2) {
                checkpoints.push({ x: currentX + poolW * 0.2 + 20, y: currentGroundY - 180, active: false });
                checkpointSpawned = true;
            }

            currentX += poolW + 100;
        } else if (isVoidLevel || isSkyLevel) {
            // Very sparse ground
            if (Math.random() > 0.8) {
                const segmentW = 200 + Math.random() * 200;
                groundSegments.push({ x: currentX, y: currentGroundY, w: segmentW, h: 500 });
                if (!checkpointSpawned && currentX > worldWidth / 2) {
                    checkpoints.push({ x: currentX + 50, y: currentGroundY - 60, active: false });
                    checkpointSpawned = true;
                }
                currentX += segmentW + 400;
            } else {
                platforms.push({ x: currentX, y: currentGroundY - 100, w: 200, h: 20 });
                if (!checkpointSpawned && currentX > worldWidth / 2) {
                    checkpoints.push({ x: currentX + 50, y: currentGroundY - 160, active: false });
                    checkpointSpawned = true;
                }
                currentX += 600;
            }
        } else {
            const segmentW = 400 + Math.random() * 600;
            const cracked = Math.random() > 0.8 && currentX > 1000;
            groundSegments.push({ x: currentX, y: currentGroundY, w: segmentW, h: 500, cracked });

            if (!checkpointSpawned && currentX > worldWidth / 2) {
                checkpoints.push({ x: currentX + 50, y: currentGroundY - 60, active: false });
                checkpointSpawned = true;
            }

            // Randomly add a spring
            if (Math.random() > 0.8) {
                springs.push({ x: currentX + 100, y: currentGroundY - 20, w: 40, h: 20, power: -18, active: false });
            }

            if (r < 0.1) {
                const sid = `switch_${switchIdCounter++}`;
                switches.push({ id: sid, x: currentX + 50, y: currentGroundY - 20, w: 40, h: 20, active: false });
                if (Math.random() > 0.5) {
                    laserGates.push({ id: `gate_${sid}`, x: currentX + 300, y: currentGroundY - 150, w: 20, h: 150, active: true, orientation: 'v' });
                } else {
                    movingPlatforms.push({
                        x: currentX + 200, y: currentGroundY - 100, w: 100, h: 20,
                        startX: currentX + 200, startY: currentGroundY - 100,
                        rangeX: 0, rangeY: -200, speed: 0.05, timeOffset: 0, requiresSwitchId: sid
                    });
                }
            } else if (r < 0.3 + (levelNumber * 0.02)) {
                const count = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) {
                    const py = currentGroundY - 150 - (i * 120);
                    const px = currentX + (i * 200);
                    movingPlatforms.push({
                        x: px, y: py, w: 120, h: 20,
                        startX: px, startY: py,
                        rangeX: Math.random() > 0.5 ? 100 : 0,
                        rangeY: Math.random() > 0.5 ? 80 : 0,
                        speed: 0.02 + Math.random() * 0.03 + (levelNumber * 0.005),
                        timeOffset: Math.random() * 1000
                    });
                }
            } else if (r < 0.5 + (levelNumber * 0.05)) {
                const count = 1 + Math.floor(Math.random() * (2 + levelNumber));
                for (let i = 0; i < count; i++) {
                    const enemyTypeRnd = Math.random();
                    let type: Enemy['type'] = 'patrol';
                    if (isWaterLevel || enemyTypeRnd > 0.8) type = 'flying';
                    else if (enemyTypeRnd > 0.65) type = 'sniper';
                    else if (enemyTypeRnd > 0.5) type = 'seeker';
                    else if (enemyTypeRnd > 0.3) type = 'brute';
                    
                    enemies.push({
                        id: enemyId++, x: currentX + (i * 200), y: currentGroundY - 40, w: type === 'brute' ? 60 : 40, h: type === 'brute' ? 60 : 40,
                        vx: type === 'brute' ? 1 + (levelNumber * 0.2) : (type === 'sniper' || type === 'seeker' ? 0 : 2 + (levelNumber * 1.0)),
                        type, color: type === 'brute' ? '#e67e22' : (isTundraLevel ? '#ffffff' : (isWaterLevel ? '#00ffff' : '#ff00ff')),
                        alive: true, startY: currentGroundY - (isWaterLevel ? 250 : 150) - Math.random() * 100,
                        glitched: isTundraLevel && Math.random() > 0.5,
                        hp: type === 'brute' ? 3 : (type === 'seeker' ? 2 : 1), maxHp: type === 'brute' ? 3 : (type === 'seeker' ? 2 : 1), shielded: type === 'brute'
                    });
                }
            } else if (r < 0.6) {
                const platCount = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < platCount; i++) {
                    const py = currentGroundY - 100 - (i * 100);
                    const px = currentX + (i * 250);
                    platforms.push({ x: px, y: py, w: 150, h: 20 });
                    if (Math.random() > 0.5) {
                        blocks.push({ x: px + 55, y: py - 100, w: 40, h: 40, hit: false, prizeType: getRandomPrize(), destructible: Math.random() > 0.5 });
                    }
                }
            }
            currentX += segmentW;
        }
    }

    // Final ground
    groundSegments.push({ x: worldWidth - 1000, y: groundY, w: 1000, h: 500 });

    const isBossLevel = (levelNumber + 1) % 3 === 0;
    if (isBossLevel) {
        if (isLavaLevel) {
            platforms.push({ x: worldWidth - 1400, y: groundY - 100, w: 600, h: 20 });
        }
        if (levelNumber === 5) {
            const numSegments = 6;
            const startX = worldWidth - 1200;
            const bossId = 1000;
            for (let i = 0; i < numSegments; i++) {
                enemies.push({
                    id: bossId + i, x: startX + i * 40, y: groundY - 100, w: 40, h: 40,
                    vx: 5, vy: 0,
                    type: 'centipede', hp: i === 0 ? 5 : 2, maxHp: i === 0 ? 5 : 2, 
                    color: i === 0 ? '#ff00ff' : '#00ffff', alive: true,
                    parentId: i > 0 ? bossId + i - 1 : undefined,
                    segmentIndex: i
                });
            }
        } else {
            const bossHp = 3 + Math.floor(levelNumber / 3) * 2;
            enemies.push({
                id: 1000, x: worldWidth - 1200, y: groundY - 100, w: 100, h: 100,
                vx: 4 + (levelNumber * 0.2), vy: 0,
                type: 'boss', hp: bossHp, maxHp: bossHp, color: '#ff00ff', alive: true, lastJump: 0, phase2: false
            });
        }
    }

    return { worldWidth, enemies, chests, platforms, movingPlatforms, blocks, bgLayers, warps, waterLevel, lavaPools, firebars, weather, friction, switches, laserGates, groundSegments, checkpoints, springs };
};
