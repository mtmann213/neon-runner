import type { Player, Enemy, Platform, Block, Prize, Fireball, EnemyProjectile, Level, Warp, Firebar } from './types';
import { audioManager } from './AudioManager';

export const rectIntersect = (r1: any, r2: any) => {
    const r1Width = r1.width || r1.w;
    const r1Height = (r1 as any).isRolling ? 30 : (r1.height || r1.h);
    const r2Width = r2.width || r2.w;
    const r2Height = (r2 as any).isRolling ? 30 : (r2.height || r2.h);
    return r1.x < r2.x + r2Width &&
           r1.x + r1Width > r2.x &&
           r1.y < r2.y + r2Height &&
           r1.y + r1Height > r2.y;
};

export const updateFireballs = (
    fireballs: Fireball[],
    enemies: Enemy[],
    blocks: Block[],
    platforms: Platform[],
    groundY: number,
    gravity: number,
    cameraX: number,
    canvasWidth: number,
    audioEnabled: boolean,
    createParticles: (x: number, y: number, color: string, count: number, speed?: number) => void,
    scoreRef: React.MutableRefObject<number>,
    setScore: (s: number) => void,
    startShake: (d: number, i: number) => void
) => {
    fireballs.forEach(fb => {
        if (!fb.active) return;
        fb.vy += gravity;
        fb.x += fb.vx;
        fb.y += fb.vy;
        if (fb.y + fb.h > groundY) {
            fb.y = groundY - fb.h;
            fb.vy = -Math.abs(fb.vy) * 0.8;
            if (Math.abs(fb.vy) < 1) fb.active = false;
        }
        platforms.forEach(plat => {
            if (fb.active && fb.x + fb.w > plat.x && fb.x < plat.x + plat.w && fb.y + fb.h > plat.y && fb.y < plat.y + plat.h) {
                if (fb.vy > 0 && fb.y + fb.h - fb.vy <= plat.y) {
                    fb.y = plat.y - fb.h;
                    fb.vy = -Math.abs(fb.vy) * 0.8;
                } else {
                    fb.active = false;
                    createParticles(fb.x, fb.y + fb.h/2, '#e67e22', 5, 2);
                }
            }
        });
        if (fb.x < cameraX - 100 || fb.x > cameraX + canvasWidth + 100) { fb.active = false; return; }
        blocks.forEach(block => {
            if (fb.active && rectIntersect(fb, block)) {
                fb.active = false;
                createParticles(fb.x, fb.y + fb.h/2, '#e67e22', 5, 2);
            }
        });
        enemies.forEach(enemy => {
            if (fb.active && enemy.alive && rectIntersect(fb, enemy)) {
                fb.active = false;
                createParticles(fb.x, fb.y + fb.h/2, '#e67e22', 15, 3);
                if (enemy.type === 'boss' && enemy.hp !== undefined) {
                    enemy.hp--;
                    startShake(10, 4);
                    if (audioEnabled) audioManager.playBossHit();
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        scoreRef.current += 1000;
                        setScore(scoreRef.current);
                    }
                } else {
                    enemy.alive = false;
                    scoreRef.current += 50;
                    setScore(scoreRef.current);
                    startShake(5, 2);
                    if (audioEnabled) audioManager.playBop();
                }
            }
        });
    });
};

export const updateFirebars = (
    firebars: Firebar[],
    player: Player,
    onPlayerDamage: () => void
) => {
    firebars.forEach(bar => {
        bar.angle += bar.speed;
        for (let i = 1; i <= bar.length; i++) {
            const dist = i * 25;
            const fx = bar.x + Math.cos(bar.angle) * dist;
            const fy = bar.y + Math.sin(bar.angle) * dist;
            const dx = (player.x + player.width/2) - fx;
            const dy = (player.y + player.height/2) - fy;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < (player.width/2 + 10)) {
                onPlayerDamage();
            }
        }
    });
};

export const updateEnemyProjectiles = (
    projectiles: EnemyProjectile[],
    player: Player,
    cameraX: number,
    canvasWidth: number,
    onPlayerDamage: () => void
) => {
    projectiles.forEach(p => {
        if (!p.active) return;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < cameraX - 100 || p.x > cameraX + canvasWidth + 100) { p.active = false; return; }
        if (rectIntersect(p, player)) {
            p.active = false;
            onPlayerDamage();
        }
    });
};

export const updatePlayer = (
    player: Player,
    keys: { [key: string]: boolean },
    level: Level,
    gravity: number,
    jumpStrength: number,
    moveSpeed: number,
    rollSpeed: number,
    groundY: number,
    audioEnabled: boolean,
    createParticles: (x: number, y: number, color: string, count: number, speed?: number) => void,
    scoreRef: React.MutableRefObject<number>,
    setScore: (s: number) => void,
    startShake: (d: number, i: number) => void,
    onWarp: (warp: Warp) => void,
    frameCount: number
) => {
    const { platforms, blocks } = level;
    const prizes = level.prizes || [];

    if (player.invincibilityFrames > 0) player.invincibilityFrames--;
    if (player.speedBoostTimer > 0) player.speedBoostTimer--;
    if (player.jumpBoostTimer > 0) player.jumpBoostTimer--;
    if (player.giantTimer > 0) player.giantTimer--;
    if (player.megaTimer > 0) player.megaTimer--;
    if (player.fireballTimer > 0) player.fireballTimer--;
    if (player.wingTimer > 0) player.wingTimer--;

    const isMega = player.megaTimer > 0;
    const isGiant = player.giantTimer > 0 || isMega;
    const isFlying = player.wingTimer > 0;
    
    // 20x Bigger than Big Burger (360x240 * 20 = 7200x4800)
    // Actually that might crash the browser, let's stick to screen-filling (GAME_HEIGHT * 2)
    const megaHeight = 1200;
    const megaWidth = 800;

    const currentHeight = player.isRolling ? 30 : (isMega ? megaHeight : (isGiant ? 360 : (player.bigTimer > 0 ? 100 : 60)));
    const currentWidth = isMega ? megaWidth : (isGiant ? 240 : (player.bigTimer > 0 ? 60 : 40));
    player.width = currentWidth;
    player.height = currentHeight;

    const effectiveMoveSpeed = player.speedBoostTimer > 0 ? moveSpeed * 1.6 : moveSpeed;
    const effectiveJumpStrength = player.jumpBoostTimer > 0 ? jumpStrength * 1.5 : jumpStrength;

    if (player.isRolling || isFlying || player.speedBoostTimer > 0 || isGiant) {
        if (frameCount % 2 === 0) {
            player.trail.push({
                x: player.x, y: player.y, 
                width: player.width, height: player.height, 
                facingRight: player.facingRight, alpha: 0.6
            });
        }
    }
    player.trail.forEach(t => t.alpha -= 0.05);
    player.trail = player.trail.filter(t => t.alpha > 0);

    const inWater = level.waterLevel !== undefined && player.y + currentHeight/2 > level.waterLevel;

    if (keys['ShiftLeft'] && player.isGrounded && !player.isRolling && !inWater && !isFlying) {
        player.isRolling = true;
        player.rollTimer = 20;
        player.vx = player.facingRight ? rollSpeed : -rollSpeed;
        createParticles(player.x + player.width/2, groundY, '#7d5c34', 10, 3);
    }

    if (!player.isRolling) {
        player.vx = 0;
        const waterMoveReduction = inWater ? 0.6 : 1.0;
        if (keys['ArrowLeft']) player.vx = -effectiveMoveSpeed * waterMoveReduction;
        if (keys['ArrowRight']) player.vx = effectiveMoveSpeed * waterMoveReduction;
        if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
        
        if (player.isGrounded) {
            player.coyoteTimer = 6;
            player.airJumpsLeft = 1; 
        } else if (player.coyoteTimer > 0) {
            player.coyoteTimer--;
        }

        let onWall = false;
        let wallDir = 0; 
        if (!player.isGrounded && !isGiant && !inWater && !isFlying) {
            blocks.forEach(b => {
                if (player.y + currentHeight > b.y && player.y < b.y + b.h) {
                    if (player.x + player.width + 2 > b.x && player.x + player.width < b.x + 10) { onWall = true; wallDir = 1; }
                    else if (player.x - 2 < b.x + b.w && player.x > b.x + b.w - 10) { onWall = true; wallDir = -1; }
                }
            });
        }
        player.isWallSliding = onWall && player.vy > 0;

        if (player.jumpBufferTimer > 0) {
            if (isFlying) {
                player.vy = -6;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + currentHeight, '#ffffff', 2, 1);
            }
            else if (inWater) {
                player.vy = -4;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + currentHeight/2, '#ffffff', 3, 1);
            }
            else if (player.coyoteTimer > 0) {
                player.vy = effectiveJumpStrength;
                player.isGrounded = false;
                player.coyoteTimer = 0;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + currentHeight, '#7d5c34', 8, 2);
                if (audioEnabled) audioManager.playJump();
            } 
            else if (player.isWallSliding) {
                player.vy = effectiveJumpStrength;
                player.vx = -wallDir * 8;
                player.facingRight = wallDir === -1;
                player.jumpBufferTimer = 0;
                player.airJumpsLeft = 1; 
                createParticles(player.x + (wallDir === 1 ? player.width : 0), player.y + currentHeight/2, '#00ffff', 10, 2);
                if (audioEnabled) audioManager.playJump();
            }
            else if (player.airJumpsLeft > 0) {
                player.vy = effectiveJumpStrength * 0.9;
                player.airJumpsLeft--;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + currentHeight, '#00ffff', 12, 3);
                if (audioEnabled) audioManager.playJump();
            }
        }
    } else {
        player.rollTimer--;
        if (player.rollTimer <= 0) player.isRolling = false;
    }

    const waterGravityReduction = inWater ? 0.3 : 1.0;
    const flightGravityReduction = isFlying ? 0.1 : 1.0;
    player.vy += (player.isWallSliding ? gravity * 0.3 : gravity * waterGravityReduction * flightGravityReduction);
    if (inWater && player.vy > 3) player.vy = 3;
    if (isFlying && player.vy > 2) player.vy = 2;

    player.x += player.vx;
    if (player.x < 0) player.x = 0;
    if (player.x > level.worldWidth - player.width) player.x = level.worldWidth - player.width;

    if (!isGiant) {
        blocks.forEach(obj => {
            if (player.x + player.width > obj.x && player.x < obj.x + obj.w &&
                player.y + currentHeight > obj.y && player.y < obj.y + obj.h) {
                if (player.vx > 0) player.x = obj.x - player.width;
                else if (player.vx < 0) player.x = obj.x + obj.w;
            }
        });
    }

    const prevY = player.y;
    player.y += player.vy;
    if (player.y < -500) { player.y = -500; player.vy = 0; }
    player.isGrounded = false;
    if (player.y + currentHeight > groundY) {
        player.y = groundY - currentHeight;
        player.vy = 0;
        player.isGrounded = true;
    }

    if (!isGiant) {
        blocks.forEach(obj => {
            if (player.x + player.width > obj.x && player.x < obj.x + obj.w &&
                player.y + currentHeight > obj.y && player.y < obj.y + obj.h) {
                if (player.vy > 0) {
                    player.y = obj.y - currentHeight;
                    player.vy = 0;
                    player.isGrounded = true;
                } else if (player.vy < 0) {
                    player.y = obj.y + obj.h;
                    player.vy = 0;
                    if (!obj.hit) {
                        obj.hit = true;
                        scoreRef.current += 200; setScore(scoreRef.current);
                        createParticles(obj.x + obj.w/2, obj.y, '#f1c40f', 10, 2);
                        startShake(5, 2);
                        if (audioEnabled) audioManager.playCoin();
                        if (obj.prizeType) {
                            prizes.push({
                                x: obj.x + (obj.w - 30)/2, y: obj.y, w: 30, h: 30,
                                vx: (Math.random() - 0.5) * 2, vy: -8,
                                type: obj.prizeType, collected: false
                            });
                        }
                    }
                }
            }
        });
    } else {
        blocks.forEach(obj => {
            if (!obj.hit && rectIntersect(player, obj)) {
                obj.hit = true;
                scoreRef.current += 200; setScore(scoreRef.current);
                createParticles(obj.x + obj.w/2, obj.y, '#f1c40f', 10, 2);
                startShake(8, 4);
                if (audioEnabled) audioManager.playCoin();
                if (obj.prizeType) {
                    prizes.push({
                        x: obj.x + (obj.w - 30)/2, y: obj.y, w: 30, h: 30,
                        vx: (Math.random() - 0.5) * 2, vy: -8,
                        type: obj.prizeType, collected: false
                    });
                }
            }
        });
    }

    platforms.forEach(obj => {
        if (player.x + player.width > obj.x && player.x < obj.x + obj.w) {
            if (player.vy >= 0 && prevY + currentHeight <= obj.y && player.y + currentHeight >= obj.y) {
                player.y = obj.y - currentHeight;
                player.vy = 0;
                player.isGrounded = true;
            }
        }
    });

    (level.warps || []).forEach(warp => {
        if (!warp.used && rectIntersect(player, warp)) onWarp(warp);
    });
};

export const updatePrizes = (
    prizes: Prize[],
    player: Player,
    groundY: number,
    gravity: number,
    onCollect: (prize: Prize) => void
) => {
    prizes.forEach(prize => {
        if (prize.collected) return;
        prize.vy += gravity;
        prize.x += prize.vx;
        prize.y += prize.vy;
        if (prize.y + prize.h > groundY) {
            prize.y = groundY - prize.h;
            prize.vy = 0;
            prize.vx *= 0.9;
        }
        if (rectIntersect(player, prize)) {
            prize.collected = true;
            onCollect(prize);
        }
    });
};

export const updateEnemies = (
    enemies: Enemy[],
    player: Player,
    enemyProjectiles: EnemyProjectile[],
    groundY: number,
    gravity: number,
    frameCount: number,
    audioEnabled: boolean,
    createParticles: (x: number, y: number, color: string, count: number, speed?: number) => void,
    scoreRef: React.MutableRefObject<number>,
    setScore: (s: number) => void,
    startShake: (d: number, i: number) => void,
    onPlayerDamage: () => void
) => {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        if ((enemy as any).startX === undefined) (enemy as any).startX = enemy.x;
        if (enemy.type === 'patrol' && enemy.vx !== undefined) {
            enemy.x += enemy.vx;
            if (Math.abs(enemy.x - (enemy as any).startX) > 300) enemy.vx *= -1;
        } else if (enemy.type === 'flying' && enemy.vx !== undefined) {
            enemy.x += enemy.vx;
            if (enemy.startY !== undefined) {
                enemy.y = enemy.startY + Math.sin(frameCount * 0.05) * 50;
            }
            if (Math.abs(enemy.x - (enemy as any).startX) > 600) enemy.vx *= -1;
        } else if (enemy.type === 'turret') {
            if (frameCount - (enemy.lastShot || 0) > 120) {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 600) {
                    enemyProjectiles.push({
                        x: enemy.x + enemy.w/2, y: enemy.y + enemy.h/2,
                        vx: (dx / dist) * 5, vy: (dy / dist) * 5,
                        w: 10, h: 10, active: true
                    });
                    enemy.lastShot = frameCount;
                }
            }
        } else if (enemy.type === 'boss' && enemy.vx !== undefined && enemy.vy !== undefined) {
            if (player.x < enemy.x) enemy.vx = -Math.abs(enemy.vx);
            else enemy.vx = Math.abs(enemy.vx);
            enemy.x += enemy.vx;
            enemy.vy += gravity;
            enemy.y += enemy.vy;
            if (enemy.y + enemy.h > groundY) {
                enemy.y = groundY - enemy.h;
                enemy.vy = 0;
                if (frameCount - (enemy.lastJump || 0) > 120) {
                    enemy.vy = -12;
                    enemy.lastJump = frameCount;
                }
            }
        }
        if (rectIntersect(player, enemy)) {
            if (player.giantTimer > 0 || player.megaTimer > 0) {
                enemy.alive = false;
                scoreRef.current += 100; setScore(scoreRef.current);
                createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, enemy.color || '#ff00ff', 30, 6);
                startShake(10, 5);
                if (audioEnabled) audioManager.playBop();
                return;
            }
            const bopThreshold = enemy.type === 'boss' ? enemy.h * 0.4 : 0; 
            const isFallingOnTop = player.vy > 0 && (player.y + player.height - player.vy) <= (enemy.y + bopThreshold);
            if (isFallingOnTop && enemy.type !== 'spikes') {
                if (enemy.type === 'boss' && enemy.hp !== undefined) {
                    enemy.hp--;
                    player.vy = -12;
                    startShake(20, 8);
                    if (audioEnabled) audioManager.playBossHit();
                    createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#9b59b6', 20, 4);
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        scoreRef.current += 1000; setScore(scoreRef.current);
                    }
                } else {
                    enemy.alive = false;
                    player.vy = -8;
                    scoreRef.current += 50;
                    setScore(scoreRef.current);
                    createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                    startShake(15, 5);
                    if (audioEnabled) audioManager.playBop();
                }
            } else if (player.isRolling && enemy.type !== 'spikes' && enemy.type !== 'boss') {
                enemy.alive = false;
                scoreRef.current += 50; setScore(scoreRef.current);
                createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                startShake(15, 5);
                if (audioEnabled) audioManager.playBop();
            } else {
                onPlayerDamage();
            }
        }
    });
};
