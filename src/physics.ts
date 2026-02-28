import { Player, Enemy, Platform, Block, Chest, Particle } from './types';
import { audioManager } from './AudioManager';

export const rectIntersect = (r1: any, r2: any) => {
    const r1Height = (r1 as any).isRolling ? 30 : (r1.height || (r1 as any).h);
    const r2Height = (r2 as any).isRolling ? 30 : (r2.height || (r2 as any).h);
    return r1.x < r2.x + (r2.width || r2.w) &&
           r1.x + (r1.width || r1.w) > r2.x &&
           r1.y < r2.y + r2Height &&
           r1.y + r1Height > r2.y;
};

export const updatePlayer = (
    player: Player,
    keys: { [key: string]: boolean },
    platforms: Platform[],
    blocks: Block[],
    gravity: number,
    jumpStrength: number,
    moveSpeed: number,
    rollSpeed: number,
    groundY: number,
    audioEnabled: boolean,
    createParticles: (x: number, y: number, color: string, count: number, speed?: number) => void,
    scoreRef: React.MutableRefObject<number>,
    setScore: (s: number) => void,
    startShake: (d: number, i: number) => void
) => {
    const currentHeight = player.isRolling ? 30 : 60;

    if (keys['ShiftLeft'] && player.isGrounded && !player.isRolling) {
        player.isRolling = true;
        player.rollTimer = 20;
        player.vx = player.facingRight ? rollSpeed : -rollSpeed;
        createParticles(player.x + 20, groundY, '#7d5c34', 10, 3);
    }

    if (player.isRolling) {
        player.rollTimer--;
        if (player.rollTimer <= 0) player.isRolling = false;
        // Particle trail
        // if (frameCount % 2 === 0) ... (this needs frameCount)
    } else {
        player.vx = 0;
        if (keys['ArrowLeft']) player.vx = -moveSpeed;
        if (keys['ArrowRight']) player.vx = moveSpeed;

        // Jump Logic
        if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
        if (player.isGrounded) player.coyoteTimer = 6;
        else if (player.coyoteTimer > 0) player.coyoteTimer--;

        if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
            player.vy = jumpStrength;
            player.isGrounded = false;
            player.coyoteTimer = 0;
            player.jumpBufferTimer = 0;
            createParticles(player.x + 20, player.y + currentHeight, '#7d5c34', 8, 2);
            if (audioEnabled) audioManager.playJump();
        }
    }

    player.vy += gravity;

    // X Collision
    player.x += player.vx;
    blocks.forEach(obj => {
        if (player.x + player.width > obj.x && player.x < obj.x + obj.w &&
            player.y + currentHeight > obj.y && player.y < obj.y + obj.h) {
            if (player.vx > 0) player.x = obj.x - player.width;
            else if (player.vx < 0) player.x = obj.x + obj.w;
        }
    });

    // Y Collision
    const prevY = player.y;
    player.y += player.vy;
    player.isGrounded = false;

    if (player.y + currentHeight > groundY) {
        player.y = groundY - currentHeight;
        player.vy = 0;
        player.isGrounded = true;
    }

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
                    scoreRef.current += 200;
                    setScore(scoreRef.current);
                    createParticles(obj.x + 20, obj.y, '#f1c40f', 10, 2);
                    startShake(5, 2);
                    if (audioEnabled) audioManager.playCoin();
                }
            }
        }
    });

    platforms.forEach(obj => {
        if (player.x + player.width > obj.x && player.x < obj.x + obj.w) {
            if (player.vy >= 0 && prevY + currentHeight <= obj.y && player.y + currentHeight >= obj.y) {
                player.y = obj.y - currentHeight;
                player.vy = 0;
                player.isGrounded = true;
            }
        }
    });
};

export const updateEnemies = (
    enemies: Enemy[],
    player: Player,
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

        if (enemy.type === 'patrol' && enemy.vx !== undefined) {
            enemy.x += enemy.vx;
            // Simplified patrol bounds for refactor
            if (enemy.x > (enemy.id < 100 ? enemy.id * 800 + 400 : 8000) || 
                enemy.x < (enemy.id < 100 ? enemy.id * 800 - 400 : 0)) enemy.vx *= -1;
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
            if (player.vy > 0 && player.y < enemy.y && enemy.type !== 'spikes') {
                if (enemy.type === 'boss' && enemy.hp !== undefined) {
                    enemy.hp--;
                    player.vy = -12;
                    startShake(20, 8);
                    if (audioEnabled) audioManager.playBossHit();
                    createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#9b59b6', 20, 4);
                    if (enemy.hp <= 0) {
                        enemy.alive = false;
                        scoreRef.current += 1000;
                        setScore(scoreRef.current);
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
                scoreRef.current += 50;
                setScore(scoreRef.current);
                createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                startShake(15, 5);
                if (audioEnabled) audioManager.playBop();
            } else if (player.invincibilityFrames === 0) {
                onPlayerDamage();
            }
        }
    });
};
