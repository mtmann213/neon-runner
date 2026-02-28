import type { Player, Enemy, Platform, Block, Prize, Fireball, EnemyProjectile, Level, Warp, Firebar, MovingPlatform, Laser, Switch, LaserGate, Spring } from './types';
import { audioManager } from './AudioManager';

export const updateLasers = (
    lasers: Laser[],
    enemies: Enemy[],
    player: Player,
    blocks: Block[],
    scoreRef: React.MutableRefObject<number>,
    setScore: (s: number) => void,
    createParticles: (x: number, y: number, color: string, count: number, speed?: number) => void,
    startShake: (d: number, i: number) => void,
    audioEnabled: boolean
) => {
    lasers.forEach(laser => {
        if (!laser.active) return;
        laser.life--;
        if (laser.life <= 0) laser.active = false;
        
        enemies.forEach(enemy => {
            if (enemy.alive && rectIntersect(laser, enemy)) {
                if (enemy.shielded && ((laser.facingRight && player.x < enemy.x) || (!laser.facingRight && player.x > enemy.x))) {
                    createParticles(laser.facingRight ? enemy.x : enemy.x + enemy.w, enemy.y + enemy.h/2, '#bdc3c7', 10, 2);
                    if (audioEnabled) audioManager.playBop();
                    return;
                }
                
                if (enemy.hp !== undefined) {
                    enemy.hp -= 3;
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                        scoreRef.current += enemy.type === 'boss' ? 1000 : 100;
                        setScore(scoreRef.current);
                    }
                    createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#00ffff', 15, 3);
                    startShake(5, 2);
                    if (audioEnabled) audioManager.playBossHit();
                } else {
                    enemy.alive = false;
                    player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                    scoreRef.current += 75;
                    setScore(scoreRef.current);
                    createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#00ffff', 10, 3);
                    startShake(5, 2);
                    if (audioEnabled) audioManager.playBop();
                }
            }
        });

        blocks.forEach(block => {
            if (block.destructible && !block.hit && rectIntersect(laser, block)) {
                block.hit = true;
                createParticles(block.x + block.w/2, block.y + block.h/2, '#bdc3c7', 15, 4);
                startShake(5, 2);
                if (audioEnabled) audioManager.playBop();
            }
        });
    });
};

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

export const updateMovingPlatforms = (platforms: MovingPlatform[], switches: Switch[], frameCount: number) => {
    platforms.forEach(p => {
        (p as any).prevX = p.x;
        (p as any).prevY = p.y;
        
        let isActive = true;
        if (p.requiresSwitchId) {
            const sw = switches.find(s => s.id === p.requiresSwitchId);
            if (sw && !sw.active) isActive = false;
        }

        if (isActive) {
            const t = (frameCount + p.timeOffset) * p.speed;
            p.x = p.startX + Math.sin(t) * p.rangeX;
            p.y = p.startY + Math.sin(t) * p.rangeY;
        }
    });
};

export const updateFireballs = (
    fireballs: Fireball[],
    enemies: Enemy[],
    player: Player,
    blocks: Block[],
    platforms: Platform[],
    movingPlatforms: MovingPlatform[],
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
        if (fb.y + fb.h > groundY + 500) { fb.active = false; return; } // Kill plane for projectiles

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
        movingPlatforms.forEach(plat => {
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
                if (block.destructible && !block.hit) {
                    block.hit = true;
                    createParticles(block.x + block.w/2, block.y + block.h/2, '#bdc3c7', 15, 4);
                    startShake(5, 2);
                    if (audioEnabled) audioManager.playBop();
                } else {
                    fb.active = false;
                    createParticles(fb.x, fb.y + fb.h/2, '#e67e22', 5, 2);
                }
            }
        });
        
        enemies.forEach(enemy => {
            if (fb.active && enemy.alive && rectIntersect(fb, enemy)) {
                if (enemy.shielded && ((fb.vx > 0 && player.x < enemy.x) || (fb.vx < 0 && player.x > enemy.x))) {
                    fb.active = false;
                    createParticles(fb.vx > 0 ? enemy.x : enemy.x + enemy.w, enemy.y + enemy.h/2, '#bdc3c7', 10, 2);
                    if (audioEnabled) audioManager.playBop();
                    return;
                }
                
                fb.active = false;
                createParticles(fb.x, fb.y + fb.h/2, '#e67e22', 15, 3);
                if (enemy.type === 'boss' && enemy.hp !== undefined) {
                    enemy.hp--;
                    startShake(10, 4);
                    if (audioEnabled) audioManager.playBossHit();
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                        scoreRef.current += 1000;
                        setScore(scoreRef.current);
                    }
                } else if (enemy.hp !== undefined) {
                    enemy.hp--;
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                        scoreRef.current += 100;
                        setScore(scoreRef.current);
                    }
                    startShake(5, 2);
                    if (audioEnabled) audioManager.playBossHit();
                } else {
                    enemy.alive = false;
                    player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
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
        
        if (p.homing) {
            const dx = (player.x + player.width/2) - p.x;
            const dy = (player.y + player.height/2) - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                p.vx += (dx / dist) * 0.2;
                p.vy += (dy / dist) * 0.2;
                const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
                if (speed > 4) {
                    p.vx = (p.vx / speed) * 4;
                    p.vy = (p.vy / speed) * 4;
                }
            }
        }
        
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
    createParticles: (x: number, y: number, color: string, count: number, speed?: number, bounce?: number) => void,
    scoreRef: React.MutableRefObject<number>,
    setScore: (s: number) => void,
    startShake: (d: number, i: number) => void,
    onPlayerDamage: () => void,
    onWarp: (warp: Warp) => void,
    frameCount: number
) => {
    const { platforms, blocks, enemies, switches, groundSegments, springs } = level;
    const prizes = level.prizes || [];

    if (player.invincibilityFrames > 0) player.invincibilityFrames--;
    if (player.speedBoostTimer > 0) player.speedBoostTimer--;
    if (player.jumpBoostTimer > 0) player.jumpBoostTimer--;
    if (player.giantTimer > 0) player.giantTimer--;
    if (player.fireballTimer > 0) player.fireballTimer--;
    if (player.laserTimer > 0) player.laserTimer--;
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.wingTimer > 0) player.wingTimer--;
    if (player.magnetTimer > 0) player.magnetTimer--;
    if (player.bopCooldown > 0) player.bopCooldown--;
    if (player.overdriveTimer > 0) player.overdriveTimer--;

    const isGiant = player.giantTimer > 0;
    const isOverdrive = player.overdriveTimer > 0;
    const isFlying = player.wingTimer > 0;
    
    // Capture old state for height adjustment
    const oldHeight = player.height;

    const effectiveMoveSpeed = (player.speedBoostTimer > 0 || isOverdrive) ? moveSpeed * (isOverdrive ? 2.0 : 1.6) : moveSpeed;
    const effectiveJumpStrength = (player.jumpBoostTimer > 0 || isOverdrive) ? jumpStrength * (isOverdrive ? 1.8 : 1.5) : jumpStrength;

    const inWater = level.waterLevel !== undefined && player.y + player.height/2 > level.waterLevel;
    
    if (level.lavaPools) {
        level.lavaPools.forEach(pool => {
            if (rectIntersect(player, pool)) {
                onPlayerDamage();
                player.vy = -10; 
            }
        });
    }

    if (switches) {
        switches.forEach(sw => {
            if (!sw.active && rectIntersect(player, sw)) {
                sw.active = true;
                if (audioEnabled) audioManager.playCoin();
                createParticles(sw.x + sw.w/2, sw.y + sw.h/2, '#2ecc71', 15, 3);
            }
        });
    }

    if (keys['KeyC'] && !player.grapple && !player.isGroundPounding) {
        let bestPoint = null;
        let bestDist = 400;
        
        blocks.forEach(b => {
            if (b.y < player.y) {
                const dist = Math.sqrt(Math.pow((b.x + b.w/2) - (player.x + player.width/2), 2) + Math.pow((b.y + b.h) - player.y, 2));
                if (dist < bestDist) { bestDist = dist; bestPoint = { x: b.x + b.w/2, y: b.y + b.h }; }
            }
        });
        enemies.forEach(e => {
            if (e.alive && e.y < player.y) {
                const dist = Math.sqrt(Math.pow((e.x + e.w/2) - (player.x + player.width/2), 2) + Math.pow((e.y + e.h) - player.y, 2));
                if (dist < bestDist) { bestDist = dist; bestPoint = { x: e.x + e.w/2, y: e.y + e.h }; }
            }
        });

        if (bestPoint) {
            player.grapple = { active: true, x: bestPoint.x, y: bestPoint.y, length: bestDist };
            if (audioEnabled) audioManager.playJump();
        }
    }

    if (!keys['KeyC'] && player.grapple) {
        player.grapple = null;
        player.vy -= 5;
    }

    if (keys['ArrowDown'] && !player.isGrounded && !player.isRolling && !inWater && !isFlying && !player.grapple && !player.isGroundPounding) {
        player.isGroundPounding = true;
        player.vy = 25;
        player.vx = 0;
        createParticles(player.x + player.width/2, player.y + player.height/2, '#f1c40f', 15, 4);
        if (audioEnabled) audioManager.playJump();
    }

    if (keys['ShiftLeft'] && player.dashCooldown <= 0 && !player.isRolling && !inWater && !isFlying && !player.isGroundPounding && !player.grapple) {
        player.isRolling = true;
        player.rollTimer = 20;
        player.dashCooldown = 60;
        if (!player.isGrounded) player.stats.dashesSinceGround++;
        player.vx = player.facingRight ? rollSpeed : -rollSpeed;
        if (!player.isGrounded) player.vy = 0; 
        createParticles(player.x + player.width/2, player.y + player.height/2, '#00ffff', 15, 4);
        if (audioEnabled) audioManager.playJump(); 
    }

    // Determine new height based on state
    const newHeight = player.isRolling ? 30 : (isGiant ? 360 : (player.bigTimer > 0 ? 100 : 60));
    const newWidth = isGiant ? 240 : (player.bigTimer > 0 ? 60 : 40);
    
    // ADJUST Y TO KEEP FEET STABLE
    if (newHeight !== oldHeight) {
        player.y += (oldHeight - newHeight);
    }
    player.height = newHeight;
    player.width = newWidth;

    if (player.isRolling || isFlying || player.speedBoostTimer > 0 || isGiant || player.isGroundPounding || isOverdrive) {
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

    if (player.grapple) {
        const dx = player.grapple.x - (player.x + player.width/2);
        const dy = player.grapple.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        player.vx += (dx / dist) * 1.5;
        player.vy += (dy / dist) * 1.5;
        player.vx *= 0.95;
        player.vy *= 0.95;
        
        if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
    } else if (!player.isRolling && !player.isGroundPounding) {
        const waterMoveReduction = inWater ? 0.6 : 1.0;
        const targetVx = keys['ArrowLeft'] ? -effectiveMoveSpeed * waterMoveReduction : (keys['ArrowRight'] ? effectiveMoveSpeed * waterMoveReduction : 0);
        
        const isTundra = level.friction !== undefined && level.friction > 0.9;
        const friction = level.friction !== undefined && player.isGrounded ? level.friction : 0.8;
        const acceleration = isTundra ? 0.4 : 0.2;
        
        if (targetVx !== 0) {
            player.vx += (targetVx - player.vx) * acceleration; 
        } else {
            player.vx *= friction; 
        }
        if (Math.abs(player.vx) < 0.1) player.vx = 0;

        if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
        
        if (player.isGrounded) {
            player.coyoteTimer = 6;
            player.airJumpsLeft = 1; 
            player.stats.dashesSinceGround = 0;
        } else if (player.coyoteTimer > 0) {
            player.coyoteTimer--;
        }

        let onWall = false;
        let wallDir = 0; 
        if (!player.isGrounded && !isGiant && !inWater && !isFlying) {
            blocks.forEach(b => {
                if (!b.hit && player.y + player.height > b.y && player.y < b.y + b.h) {
                    if (player.x + player.width + 2 > b.x && player.x + player.width < b.x + 10) { onWall = true; wallDir = 1; }
                    else if (player.x - 2 < b.x + b.w && player.x > b.x + b.w - 10) { onWall = true; wallDir = -1; }
                }
            });
        }
        player.isWallSliding = onWall && player.vy > 0;
        if (player.isWallSliding && frameCount % 5 === 0) {
            createParticles(player.x + (wallDir === 1 ? player.width : 0), player.y + player.height * 0.8, '#fff', 2, 1);
        }

        if (player.jumpBufferTimer > 0) {
            if (isFlying) {
                player.vy = -3.5; 
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + player.height, '#ffffff', 2, 1);
            }
            else if (inWater) {
                player.vy = -4;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + player.height/2, '#ffffff', 3, 1);
            }
            else if (player.coyoteTimer > 0) {
                player.vy = effectiveJumpStrength;
                player.isGrounded = false;
                player.coyoteTimer = 0;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + player.height, '#7d5c34', 8, 2);
                if (audioEnabled) audioManager.playJump();
            } 
            else if (player.isWallSliding) {
                player.vy = effectiveJumpStrength;
                player.vx = -wallDir * 8;
                player.facingRight = wallDir === -1;
                player.jumpBufferTimer = 0;
                player.airJumpsLeft = 1; 
                createParticles(player.x + (wallDir === 1 ? player.width : 0), player.y + player.height/2, '#00ffff', 10, 2);
                if (audioEnabled) audioManager.playJump();
            }
            else if (player.airJumpsLeft > 0) {
                player.vy = effectiveJumpStrength * 0.9;
                player.airJumpsLeft--;
                player.jumpBufferTimer = 0;
                createParticles(player.x + player.width/2, player.y + player.height, '#00ffff', 12, 3);
                if (audioEnabled) audioManager.playJump();
            }
        }
    } else if (player.isRolling) {
        player.rollTimer--;
        if (player.rollTimer <= 0) player.isRolling = false;
    }

    if (!player.grapple && !player.isGroundPounding) {
        const waterGravityReduction = inWater ? 0.3 : 1.0;
        const flightGravityReduction = isFlying ? 0.05 : 1.0; 
        
        let currentGravity = gravity;
        if (keys['Space'] && player.vy < 0 && !isFlying && !inWater) {
            currentGravity = gravity * 0.5;
        }

        player.vy += (player.isWallSliding ? gravity * 0.3 : currentGravity * waterGravityReduction * flightGravityReduction);
        
        if (isFlying) {
            if (player.vy < -4) player.vy = -4; 
            if (player.vy > 1.5) player.vy = 1.5; 
            player.vy *= 0.98; 
        }
        
        if (inWater && player.vy > 3) player.vy = 3;
    }

    // --- Horizontal Collisions ---
    player.x += player.vx;
    if (!isGiant && !player.grapple) {
        blocks.forEach(obj => {
            if (!obj.hit && player.x + player.width > obj.x && player.x < obj.x + obj.w &&
                player.y + player.height > obj.y && player.y < obj.y + obj.h) {
                if (player.vx > 0) player.x = obj.x - player.width;
                else if (player.vx < 0) player.x = obj.x + obj.w;
            }
        });
        
        if (groundSegments) {
            groundSegments.forEach(seg => {
                if (seg.destroyed) return;
                // If player is horizontally overlapping but vertically BELOW the top edge
                if (player.x + player.width > seg.x && player.x < seg.x + seg.w &&
                    player.y + player.height > seg.y + 10) {
                    if (player.vx > 0 && player.x < seg.x) player.x = seg.x - player.width;
                    else if (player.vx < 0 && player.x + player.width > seg.x + seg.w) player.x = seg.x + seg.w;
                }
            });
        }
    }

    const prevY = player.y;
    player.y += player.vy;
    if (player.y < -500) player.y = -500; 
    player.isGrounded = false;
    
    const landOnGround = () => {
        player.stats.combo = 0;
        createParticles(player.x + player.width/2, player.y + player.height, '#fff', 5, 1);
        if (player.isGroundPounding) {
            player.isGroundPounding = false;
            startShake(15, 8);
            if (audioEnabled) audioManager.playBossHit();
            createParticles(player.x + player.width/2, player.y + player.height, '#f1c40f', 30, 8, 0.5);
            
            // Smash cracked ground
            if (groundSegments) {
                groundSegments.forEach(seg => {
                    if (seg.cracked && !seg.destroyed && Math.abs((seg.x + seg.w/2) - (player.x + player.width/2)) < seg.w/2 + 50) {
                        seg.destroyed = true;
                        createParticles(seg.x + seg.w/2, seg.y, '#5c4033', 50, 10, 0.5);
                        if (audioEnabled) audioManager.playBossHit();
                        // Reveal shards
                        for(let i=0; i<5; i++) {
                            prizes.push({
                                x: seg.x + Math.random() * seg.w, y: seg.y - 50, w: 30, h: 30,
                                vx: (Math.random() - 0.5) * 10, vy: -15,
                                type: 'shard', collected: false
                            });
                        }
                    }
                });
            }

            enemies.forEach(e => {
                if (e.alive && Math.abs(e.x - player.x) < 150 && Math.abs(e.y - player.y) < 100) {
                    if (e.hp) e.hp -= 2;
                    else e.alive = false;
                    if (e.hp && e.hp <= 0) e.alive = false;
                    if (!e.alive) {
                        player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                    }
                }
            });
        }
    };

    // Varied Ground Segment Collisions
    if (groundSegments) {
        groundSegments.forEach(seg => {
            if (seg.destroyed) return;
            if (player.x + player.width > seg.x && player.x < seg.x + seg.w) {
                // Safety: If player is ALREADY inside ground, push them out
                if (prevY + oldHeight <= seg.y + 10 && player.y + player.height >= seg.y) {
                    player.y = seg.y - player.height;
                    if (player.vy > 0) landOnGround();
                    player.vy = 0;
                    player.isGrounded = true;
                }
            }
        });
    } else if (level.hasGround !== false && player.y + player.height > groundY) {
        player.y = groundY - player.height;
        if (player.vy > 0) landOnGround();
        player.vy = 0;
        player.isGrounded = true;
    }

    // Spring Collisions
    if (springs) {
        springs.forEach(s => {
            if (rectIntersect(player, s)) {
                player.vy = s.power;
                player.isGrounded = false;
                s.active = true;
                setTimeout(() => s.active = false, 500);
                if (audioEnabled) audioManager.playJump();
                createParticles(s.x + s.w/2, s.y, '#ffffff', 10, 2);
            }
        });
    }

    if (!isGiant) {
        blocks.forEach(obj => {
            if (player.x + player.width > obj.x && player.x < obj.x + obj.w &&
                player.y + player.height > obj.y && player.y < obj.y + obj.h) {
                
                if (player.isGroundPounding && obj.destructible && !obj.hit) {
                    obj.hit = true;
                    createParticles(obj.x + obj.w/2, obj.y + obj.h/2, '#bdc3c7', 20, 5);
                    if (audioEnabled) audioManager.playBop();
                    scoreRef.current += 100; setScore(scoreRef.current);
                } else if (!obj.hit) {
                    if (player.vy > 0) {
                        player.y = obj.y - player.height;
                        landOnGround();
                        player.vy = 0;
                        player.isGrounded = true;
                    } else if (player.vy < 0) {
                        const leftOverlap = (player.x + player.width) - obj.x;
                        const rightOverlap = (obj.x + obj.w) - player.x;
                        const cornerTolerance = 10;
                        
                        if (leftOverlap < cornerTolerance && keys['ArrowLeft']) {
                            player.x -= leftOverlap;
                        } else if (rightOverlap < cornerTolerance && keys['ArrowRight']) {
                            player.x += rightOverlap;
                        } else {
                            player.y = obj.y + obj.h;
                            player.vy = 0;
                            obj.hit = true;
                            scoreRef.current += 200; setScore(scoreRef.current);
                            createParticles(obj.x + obj.w/2, obj.y, '#f1c40f', 10, 2);
                            startShake(5, 2);
                            if (audioEnabled) audioManager.playCoin();
                            if (obj.prizeType) {
                                prizes.push({
                                    x: obj.x + (obj.w - 30)/2, y: obj.y - 30, w: 30, h: 30,
                                    vx: (Math.random() - 0.5) * 1, vy: -10,
                                    type: obj.prizeType, collected: false
                                });
                            }
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
                        x: obj.x + (obj.w - 30)/2, y: obj.y - 30, w: 30, h: 30,
                        vx: (Math.random() - 0.5) * 1, vy: -10,
                        type: obj.prizeType, collected: false
                    });
                }
            }
        });
    }

    platforms.forEach(obj => {
        let isActive = true;
        if ((obj as any).requiresSwitchId) {
            const sw = switches?.find(s => s.id === (obj as any).requiresSwitchId);
            if (sw && !sw.active) isActive = false;
        }

        if (isActive && player.x + player.width > obj.x && player.x < obj.x + obj.w) {
            if (player.vy >= 0 && prevY + oldHeight <= obj.y && player.y + player.height >= obj.y) {
                player.y = obj.y - player.height;
                landOnGround();
                player.vy = 0;
                player.isGrounded = true;
            }
        }
    });

    (level.movingPlatforms || []).forEach(obj => {
        let isActive = true;
        if (obj.requiresSwitchId) {
            const sw = switches?.find(s => s.id === obj.requiresSwitchId);
            if (sw && !sw.active) isActive = false;
        }

        if (isActive && player.x + player.width > obj.x && player.x < obj.x + obj.w) {
            if (player.vy >= 0 && prevY + oldHeight <= (obj as any).prevY && player.y + player.height >= obj.y) {
                const dx = obj.x - (obj as any).prevX;
                player.x += dx;
                player.y = obj.y - player.height;
                landOnGround();
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
        
        if (player.magnetTimer > 0 && prize.type === 'shard') {
            const dx = (player.x + player.width/2) - (prize.x + prize.w/2);
            const dy = (player.y + player.height/2) - (prize.y + prize.h/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 400) { 
                prize.vx += (dx / dist) * 1.5;
                prize.vy += (dy / dist) * 1.5;
                prize.vx *= 0.95; 
                prize.vy *= 0.95;
                prize.vy -= gravity; 
            }
        }
        
        prize.vy += gravity;
        prize.x += prize.vx;
        prize.y += prize.vy;
        if (prize.y + prize.h > groundY + 500) { prize.collected = true; return; } // Drop out of world
        
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
        if (enemy.state === undefined) enemy.state = 'patrol';
        if (enemy.stateTimer === undefined) enemy.stateTimer = 0;

        const distToPlayer = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));

        if (enemy.type === 'patrol' && enemy.vx !== undefined) {
            if (enemy.state === 'patrol') {
                enemy.x += enemy.vx;
                if (Math.abs(enemy.x - (enemy as any).startX) > 300) enemy.vx *= -1;
                if (distToPlayer < 250) { enemy.state = 'alert'; enemy.stateTimer = 30; }
            } else if (enemy.state === 'alert') {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) {
                    if (distToPlayer < 300) enemy.state = 'attack';
                    else enemy.state = 'patrol';
                }
            } else if (enemy.state === 'attack') {
                const chargeSpeed = Math.abs(enemy.vx) * 2;
                if (player.x < enemy.x) enemy.x -= chargeSpeed;
                else enemy.x += chargeSpeed;
                if (distToPlayer > 500) enemy.state = 'patrol';
            }
        } else if (enemy.type === 'brute' && enemy.vx !== undefined) {
            if (player.x < enemy.x) enemy.vx = -Math.abs(enemy.vx);
            else enemy.vx = Math.abs(enemy.vx);
            enemy.x += enemy.vx;
        } else if (enemy.type === 'sniper') {
            if (distToPlayer < 800) {
                if (enemy.state !== 'attack') {
                    enemy.state = 'attack';
                    enemy.stateTimer = 60;
                }
                enemy.targetX = player.x + player.width/2;
                enemy.targetY = player.y + player.height/2;

                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) {
                    const dx = enemy.targetX - (enemy.x + enemy.w/2);
                    const dy = enemy.targetY - (enemy.y + enemy.h/2);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    enemyProjectiles.push({
                        x: enemy.x + enemy.w/2, y: enemy.y + enemy.h/2,
                        vx: (dx / dist) * 15, vy: (dy / dist) * 15,
                        w: 15, h: 15, active: true, laserSight: true
                    });
                    enemy.stateTimer = 120;
                }
            } else {
                enemy.state = 'idle';
            }
        } else if (enemy.type === 'seeker') {
            if (distToPlayer < 600) {
                enemy.stateTimer--;
                if (enemy.stateTimer <= 0) {
                    const dx = player.x + player.width/2 - (enemy.x + enemy.w/2);
                    const dy = player.y + player.height/2 - (enemy.y + enemy.h/2);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    enemyProjectiles.push({
                        x: enemy.x + enemy.w/2, y: enemy.y + enemy.h/2,
                        vx: (dx / dist) * 2, vy: (dy / dist) * 2,
                        w: 12, h: 12, active: true, homing: true
                    });
                    enemy.stateTimer = 180;
                }
            }
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
            if (enemy.hp && enemy.maxHp && enemy.hp <= enemy.maxHp / 2 && !enemy.phase2) {
                enemy.phase2 = true;
                enemy.color = '#e74c3c';
                startShake(20, 10);
            }

            const speedMult = enemy.phase2 ? 1.5 : 1.0;
            if (player.x < enemy.x) enemy.vx = -Math.abs(enemy.vx) * speedMult;
            else enemy.vx = Math.abs(enemy.vx) * speedMult;
            
            enemy.x += enemy.vx;
            enemy.vy += gravity;
            enemy.y += enemy.vy;
            if (enemy.y + enemy.h > groundY + 500) enemy.y = groundY; // Reset boss if falls

            const jumpCD = enemy.phase2 ? 80 : 120;
            if (frameCount - (enemy.lastJump || 0) > jumpCD) {
                enemy.vy = enemy.phase2 ? -15 : -12;
                enemy.lastJump = frameCount;
                if (enemy.phase2) {
                    for(let i=-1; i<=1; i++) {
                        enemyProjectiles.push({
                            x: enemy.x + enemy.w/2, y: enemy.y + enemy.h/2,
                            vx: (player.x > enemy.x ? 8 : -8), vy: -5 + i*3,
                            w: 15, h: 15, active: true
                        });
                    }
                }
            }
        } else if (enemy.type === 'centipede' && enemy.vx !== undefined && enemy.vy !== undefined) {
            if (enemy.parentId === undefined) { 
                if (enemy.hp && enemy.maxHp && enemy.hp <= enemy.maxHp / 2 && !enemy.phase2) {
                    enemy.phase2 = true;
                    enemy.color = '#e74c3c';
                }
                const speedMult = enemy.phase2 ? 1.5 : 1.0;
                if (player.x < enemy.x) enemy.vx = -Math.abs(enemy.vx) * speedMult;
                else enemy.vx = Math.abs(enemy.vx) * speedMult;
                
                enemy.x += enemy.vx;
                enemy.vy += gravity;
                enemy.y += enemy.vy;
                if (enemy.y + enemy.h > groundY + 500) enemy.y = groundY;

                if (frameCount - (enemy.lastJump || 0) > (enemy.phase2 ? 50 : 80)) { 
                    enemy.vy = -12;
                    enemy.lastJump = frameCount;
                }
            } else { 
                const parent = enemies.find(e => e.id === enemy.parentId);
                if (parent && parent.alive) {
                    const dx = parent.x - enemy.x;
                    const dy = parent.y - enemy.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 35) { 
                        enemy.vx = (dx / dist) * 7;
                        enemy.vy = (dy / dist) * 7;
                        enemy.x += enemy.vx;
                        enemy.y += enemy.vy;
                    }
                } else {
                    enemy.parentId = undefined; 
                    enemy.segmentIndex = 0;
                    enemy.hp = 5; 
                    enemy.maxHp = 5;
                }
            }
        }
        
        if (rectIntersect(player, enemy)) {
            if (player.giantTimer > 0 || player.isGroundPounding || player.overdriveTimer > 0) {
                enemy.alive = false;
                player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                scoreRef.current += 100; setScore(scoreRef.current);
                createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, enemy.color || '#ff00ff', 30, 6);
                startShake(10, 5);
                if (audioEnabled) audioManager.playBop();
                return;
            }
            
            const bopThreshold = (enemy.type === 'boss' || enemy.type === 'centipede') ? enemy.h * 0.8 : enemy.h * 0.2; 
            const isFallingOnTop = (player.y + player.height) <= (enemy.y + bopThreshold + 25);
            
            if (isFallingOnTop && enemy.type !== 'spikes') {
                player.bopCooldown = 30;
                if (enemy.hp !== undefined) {
                    enemy.hp--;
                    player.vy = -12;
                    startShake(20, 8);
                    if (audioEnabled) audioManager.playBossHit();
                    createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#9b59b6', 20, 4);
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                        scoreRef.current += enemy.type === 'boss' ? 1000 : 200; setScore(scoreRef.current);
                    }
                } else {
                    enemy.alive = false; player.vy = -8; 
                    player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                    scoreRef.current += 50; setScore(scoreRef.current);
                    createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                    startShake(15, 5);
                    if (audioEnabled) audioManager.playBop();
                }
            } else if (player.bopCooldown > 0) {
                return;
            } else if (player.isRolling && enemy.type !== 'spikes' && enemy.type !== 'boss') {
                if (enemy.shielded && ((player.vx > 0 && player.x < enemy.x) || (player.vx < 0 && player.x > enemy.x))) {
                    player.vx *= -0.5;
                    createParticles(player.x, player.y + player.height/2, '#bdc3c7', 10, 2);
                    if (audioEnabled) audioManager.playBop();
                } else {
                    enemy.alive = false;
                    player.stats.enemiesDefeated++; player.stats.combo++; if(player.stats.combo > player.stats.maxCombo) player.stats.maxCombo = player.stats.combo;
                    scoreRef.current += 50; setScore(scoreRef.current);
                    createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                    startShake(15, 5);
                    if (audioEnabled) audioManager.playBop();
                }
            } else {
                onPlayerDamage();
            }
        }
    });
};
