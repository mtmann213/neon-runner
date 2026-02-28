import type { Player, Enemy, Prize, BackgroundLayer, Fireball, EnemyProjectile, Warp, Firebar, MovingPlatform, Laser, Switch, LaserGate, Spring } from './types';

const textures: { [key: string]: CanvasPattern | null } = {};

export const getTexture = (ctx: CanvasRenderingContext2D, type: string) => {
    if (textures[type] !== undefined) return textures[type];
    
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const tCtx = canvas.getContext('2d');
    if (!tCtx) return null;

    if (type === 'dirt') {
        tCtx.fillStyle = '#4a3b2c';
        tCtx.fillRect(0, 0, 128, 128);
        for(let i=0; i<1000; i++) {
            tCtx.fillStyle = Math.random() > 0.5 ? '#3a2b1c' : '#5a4b3c';
            tCtx.fillRect(Math.random()*128, Math.random()*128, 2, 2);
        }
    } else if (type === 'grass') {
        tCtx.fillStyle = '#2c7a2c';
        tCtx.fillRect(0, 0, 128, 128);
        for(let i=0; i<1000; i++) {
            tCtx.fillStyle = Math.random() > 0.5 ? '#1c6a1c' : '#3c8a3c';
            tCtx.fillRect(Math.random()*128, Math.random()*128, 2, 6);
        }
    } else if (type === 'stone') {
        tCtx.fillStyle = '#555';
        tCtx.fillRect(0, 0, 128, 128);
        for(let i=0; i<800; i++) {
            tCtx.fillStyle = Math.random() > 0.5 ? '#444' : '#666';
            tCtx.beginPath();
            tCtx.arc(Math.random()*128, Math.random()*128, Math.random()*4+1, 0, Math.PI*2);
            tCtx.fill();
        }
    } else if (type === 'metal') {
        const grad = tCtx.createLinearGradient(0, 0, 128, 128);
        grad.addColorStop(0, '#7f8c8d');
        grad.addColorStop(0.5, '#bdc3c7');
        grad.addColorStop(1, '#7f8c8d');
        tCtx.fillStyle = grad;
        tCtx.fillRect(0, 0, 128, 128);
        tCtx.strokeStyle = '#95a5a6';
        tCtx.lineWidth = 2;
        for (let i = 0; i < 128; i += 32) {
            tCtx.strokeRect(i, 0, 32, 128);
            tCtx.strokeRect(0, i, 128, 32);
            tCtx.fillStyle = '#2c3e50';
            tCtx.beginPath(); tCtx.arc(i + 4, 4, 3, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(i + 28, 4, 3, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(i + 4, 124, 3, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(i + 28, 124, 3, 0, Math.PI*2); tCtx.fill();
        }
    }
    
    textures[type] = ctx.createPattern(canvas, 'repeat');
    return textures[type];
};

export const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#e74c3c';
    ctx.fillStyle = '#e74c3c'; ctx.beginPath();
    ctx.moveTo(x + size / 2, y + size);
    ctx.bezierCurveTo(x, y + size / 2, x, y, x + size / 4, y);
    ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
    ctx.quadraticCurveTo(x + size / 2, y, x + 3 * size / 4, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
    ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size);
    ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4); ctx.fill();
    ctx.restore();
};

export const drawBoy = (ctx: CanvasRenderingContext2D, p: Player, frameCount: number, isSwimming: boolean) => {
    const walkCycle = Math.sin(frameCount * 0.2) * 10;
    const swimCycle = Math.sin(frameCount * 0.1) * 15;
    ctx.save();
    if (!p.facingRight) { ctx.translate(p.x + p.width, p.y); ctx.scale(-1, 1); } else { ctx.translate(p.x, p.y); }
    
    if (p.magnetTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#c0392b';
        const pulse = Math.sin(frameCount * 0.1) * 10;
        ctx.beginPath();
        ctx.arc(p.width / 2, p.height / 2, p.width + 10 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    if (p.shieldActive) {
        ctx.save();
        ctx.strokeStyle = '#bf5af2';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#bf5af2';
        ctx.fillStyle = 'rgba(191, 90, 242, 0.2)';
        ctx.beginPath();
        const r = p.width / 2 + 15;
        const cx = p.width / 2;
        const cy = p.height / 2;
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(cx + r * Math.cos(i * Math.PI / 3 + frameCount * 0.05), cy + r * Math.sin(i * Math.PI / 3 + frameCount * 0.05));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    ctx.shadowBlur = p.giantTimer > 0 ? 40 : 15;
    ctx.shadowColor = p.giantTimer > 0 ? '#f1c40f' : (p.speedBoostTimer > 0 ? '#f1c40f' : (p.jumpBoostTimer > 0 ? '#2ecc71' : '#00ced1'));

    // --- POWERUP VISUALS ---
    if (p.bigTimer > 0 || p.giantTimer > 0) {
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4 + Math.sin(frameCount * 0.2) * 2;
        ctx.strokeRect(p.width * 0.25, p.height * 0.33, p.width * 0.5, p.height * 0.5);
    }
    if (p.speedBoostTimer > 0) {
        ctx.fillStyle = '#f1c40f';
        for (let i = 0; i < 3; i++) {
            ctx.globalAlpha = (p.speedBoostTimer / 600) * (0.5 - i * 0.1);
            ctx.fillRect(p.width * 0.25 - (i + 1) * 10, p.height * 0.4 + i * 5, 10, 20);
        }
        ctx.globalAlpha = 1.0;
    }
    if (p.jumpBoostTimer > 0) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(p.width * 0.375, p.height * 0.9, 5, 0, Math.PI * 2);
        ctx.arc(p.width * 0.625, p.height * 0.9, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    if (p.laserTimer > 0) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.width * 0.75, p.height * 0.5);
        ctx.lineTo(p.width * 0.9, p.height * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.width * 0.9, p.height * 0.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
    }

    if (p.invincibilityFrames % 10 < 5) {
        if (p.isRolling) {
            const rollGrad = ctx.createRadialGradient(p.width/2, p.height/2, 5, p.width/2, p.height/2, p.width/2);
            rollGrad.addColorStop(0, '#ffffff');
            rollGrad.addColorStop(1, '#f1c40f');
            ctx.fillStyle = rollGrad; 
            ctx.beginPath(); 
            ctx.arc(p.width/2, p.height/2, p.width/2, 0, Math.PI * 2); 
            ctx.fill();
        } else if (p.isWallSliding) {
            const bodyGrad = ctx.createLinearGradient(p.width*0.1, p.height*0.2, p.width*0.7, p.height*0.8);
            bodyGrad.addColorStop(0, '#ffffff');
            bodyGrad.addColorStop(1, p.speedBoostTimer > 0 ? '#f39c12' : (p.jumpBoostTimer > 0 ? '#27ae60' : '#008b8b'));
            ctx.fillStyle = bodyGrad;
            ctx.fillRect(p.width*0.1, p.height*0.2, p.width*0.6, p.height*0.6);
            ctx.fillStyle = '#f3e5ab';
            ctx.fillRect(p.width*0.2, p.height*0.05, p.width*0.4, p.height*0.2);
            ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(p.width*0.7, p.height*0.3); ctx.lineTo(p.width*0.9, p.height*0.2); ctx.stroke();
        } else {
            const skinColor = p.giantTimer > 0 ? '#ffb6c1' : '#f1c27d'; 
            const shirtColor = p.speedBoostTimer > 0 ? '#f39c12' : (p.jumpBoostTimer > 0 ? '#27ae60' : '#2980b9');
            const pantsColor = p.giantTimer > 0 ? '#111' : '#2c3e50';

            const legOff = Math.abs(p.vx) > 0 ? (isSwimming ? swimCycle : walkCycle) : 0;
            const armOff = -legOff;

            // Back Arm
            ctx.strokeStyle = skinColor; ctx.lineWidth = p.width * 0.12; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(p.width*0.4, p.height*0.3); ctx.lineTo(p.width*0.4 + armOff, p.height*0.55); ctx.stroke();
            ctx.strokeStyle = shirtColor; ctx.lineWidth = p.width * 0.14;
            ctx.beginPath(); ctx.moveTo(p.width*0.4, p.height*0.3); ctx.lineTo(p.width*0.4 + armOff*0.5, p.height*0.4); ctx.stroke();

            // Back Leg
            ctx.strokeStyle = pantsColor; ctx.lineWidth = p.width * 0.15;
            ctx.beginPath(); ctx.moveTo(p.width*0.4, p.height*0.6); ctx.lineTo(p.width*0.4 + legOff, p.height*0.9); ctx.stroke();
            // Back Foot
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.arc(p.width*0.4 + legOff + 2, p.height*0.95, p.width*0.08, 0, Math.PI*2); ctx.fill();

            // Torso
            ctx.fillStyle = shirtColor;
            ctx.beginPath();
            (ctx as any).roundRect ? (ctx as any).roundRect(p.width*0.25, p.height*0.25, p.width*0.5, p.height*0.35, 5) : ctx.fillRect(p.width*0.25, p.height*0.25, p.width*0.5, p.height*0.35);
            ctx.fill();

            // Head & Neck
            ctx.fillStyle = skinColor;
            ctx.fillRect(p.width*0.45, p.height*0.2, p.width*0.1, p.height*0.1);
            ctx.beginPath();
            ctx.arc(p.width*0.5, p.height*0.15, p.width*0.2, 0, Math.PI*2);
            ctx.fill();
            // Hair
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.arc(p.width*0.5, p.height*0.13, p.width*0.22, Math.PI, 0);
            ctx.fill();
            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(p.width*0.6, p.height*0.13, p.width*0.04, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(p.width*0.62, p.height*0.13, p.width*0.02, 0, Math.PI*2); ctx.fill();

            // Front Leg
            ctx.strokeStyle = pantsColor; ctx.lineWidth = p.width * 0.15;
            ctx.beginPath(); ctx.moveTo(p.width*0.6, p.height*0.6); ctx.lineTo(p.width*0.6 - legOff, p.height*0.9); ctx.stroke();
            // Front Foot
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.arc(p.width*0.6 - legOff + 2, p.height*0.95, p.width*0.08, 0, Math.PI*2); ctx.fill();

            // Front Arm
            ctx.strokeStyle = skinColor; ctx.lineWidth = p.width * 0.12;
            ctx.beginPath(); ctx.moveTo(p.width*0.6, p.height*0.3); ctx.lineTo(p.width*0.6 - armOff, p.height*0.55); ctx.stroke();
            ctx.strokeStyle = shirtColor; ctx.lineWidth = p.width * 0.14;
            ctx.beginPath(); ctx.moveTo(p.width*0.6, p.height*0.3); ctx.lineTo(p.width*0.6 - armOff*0.5, p.height*0.4); ctx.stroke();

            if (isSwimming) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(p.width*0.5, p.height*0.15, p.width*0.3, 0, Math.PI*2); ctx.stroke(); // Helmet
            }

            if (p.wingTimer > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffff';
                const flap = Math.sin(frameCount * 0.3) * 15;
                ctx.beginPath();
                ctx.moveTo(p.width*0.25, p.height*0.3);
                ctx.quadraticCurveTo(-20, p.height*0.3 - 20 + flap, -10, p.height*0.3 + 20);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(p.width*0.75, p.height*0.3);
                ctx.quadraticCurveTo(p.width + 20, p.height*0.3 - 20 + flap, p.width + 10, p.height*0.3 + 20);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    if (p.grapple && p.grapple.active) {
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(p.width/2, p.height/2);
        ctx.lineTo(p.grapple.x - p.x, p.grapple.y - p.y);
        ctx.stroke();
        ctx.restore();
    }

    if (p.isGroundPounding) {
        ctx.save();
        ctx.translate(p.width/2, p.height);
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, -40); ctx.lineTo(20, -40); ctx.fill();
        ctx.restore();
    }

    p.trail.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        if (!t.facingRight) { ctx.translate(t.x + t.width, t.y); ctx.scale(-1, 1); } else { ctx.translate(t.x, t.y); }
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.fillRect(0, 0, t.width, t.height);
        ctx.restore();
    });

    ctx.restore();
};

export const drawLavaPool = (
    ctx: CanvasRenderingContext2D,
    pool: { x: number, y: number, w: number, h: number },
    frameCount: number
) => {
    ctx.save();
    const lavaGrad = ctx.createLinearGradient(pool.x, pool.y, pool.x, pool.y + pool.h);
    lavaGrad.addColorStop(0, '#ff4d00');
    lavaGrad.addColorStop(0.5, '#ff0000');
    lavaGrad.addColorStop(1, '#660000');
    ctx.fillStyle = lavaGrad;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff4d00';
    const surfaceOffset = Math.sin(frameCount * 0.05) * 5;
    ctx.beginPath();
    ctx.moveTo(pool.x, pool.y + surfaceOffset);
    for (let x = pool.x; x <= pool.x + pool.w; x += 40) {
        ctx.lineTo(x, pool.y + Math.sin(frameCount * 0.05 + x * 0.1) * 5);
    }
    ctx.lineTo(pool.x + pool.w, pool.y + pool.h);
    ctx.lineTo(pool.x, pool.y + pool.h);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < pool.w / 40; i++) {
        const bx = pool.x + ((i * 100 + frameCount) % pool.w);
        const by = pool.y + 20 + ((i * 30 + frameCount) % (pool.h - 20));
        const bSize = 2 + (i % 3);
        ctx.beginPath(); ctx.arc(bx, by, bSize, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
};

export const drawWeather = (ctx: CanvasRenderingContext2D, type: 'rain' | 'none' | 'snow', frameCount: number) => {
    if (type === 'none') return;
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    ctx.save();
    if (type === 'rain') {
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
        for (let i = 0; i < 50; i++) {
            const x = (i * 20 + frameCount * 5) % GAME_WIDTH;
            const y = (i * 40 + frameCount * 10) % GAME_HEIGHT;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 15); ctx.stroke();
        }
    } else if (type === 'snow') {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
            const x = (i * 40 + Math.sin(frameCount * 0.01 + i) * 20) % GAME_WIDTH;
            const y = (i * 60 + frameCount * 2) % GAME_HEIGHT;
            ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
            ctx.beginPath(); ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
};

export const drawBackground = (
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    cameraX: number,
    groundY: number,
    layers?: BackgroundLayer[],
    waterLevel?: number
) => {
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    ctx.fillStyle = '#000';
    ctx.fillRect(-GAME_WIDTH, -GAME_HEIGHT, GAME_WIDTH * 3, GAME_HEIGHT * 3);
    
    if (layers) {
        layers.forEach((layer, idx) => {
            const xOffset = -(cameraX * layer.speed) % 800;
            ctx.fillStyle = layer.color;
            
            // Atmospheric fog/gradient for distance
            const layerGrad = ctx.createLinearGradient(0, groundY - layer.height * 2, 0, groundY);
            layerGrad.addColorStop(0, layer.color);
            layerGrad.addColorStop(1, '#000');
            ctx.fillStyle = layerGrad;

            if (layer.isCityscape) {
                for (let i = -10; i < (GAME_WIDTH / 80) + 10; i++) {
                    const x = i * 120 + xOffset;
                    const h = layer.height + Math.sin(layer.seed + i) * 150;
                    const w = 80;
                    
                    // Main Building
                    ctx.fillRect(x, groundY - h, w, h);
                    
                    // Windows
                    if (idx < 2) { 
                        ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                        for(let wy=groundY-h+20; wy<groundY-20; wy+=25) {
                            for(let wx=x+10; wx<x+w-10; wx+=20) {
                                if ((i + wx + wy + Math.floor(Date.now()/500)) % 7 === 0) {
                                    ctx.save();
                                    ctx.shadowBlur = 10; ctx.shadowColor = '#f1c40f';
                                    ctx.fillStyle = '#f1c40f';
                                    ctx.fillRect(wx, wy, 8, 12);
                                    ctx.restore();
                                } else {
                                    ctx.fillRect(wx, wy, 8, 12);
                                }
                            }
                        }
                        ctx.fillStyle = layerGrad;
                    }
                    
                    // Rooftop details
                    ctx.fillRect(x + w/4, groundY - h - 20, w/2, 20);
                    ctx.fillRect(x + w/2 - 2, groundY - h - 50, 4, 30);
                }
            } else if (layer.isSpace) {
                ctx.fillStyle = layer.color;
                ctx.fillRect(-GAME_WIDTH, -GAME_HEIGHT, GAME_WIDTH * 3, GAME_HEIGHT * 3);
                
                // Nebula effect
                const neb = ctx.createRadialGradient(GAME_WIDTH/2, GAME_HEIGHT/2, 0, GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH);
                neb.addColorStop(0, 'rgba(191, 90, 242, 0.1)');
                neb.addColorStop(1, 'transparent');
                ctx.fillStyle = neb;
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

                ctx.fillStyle = '#fff';
                for(let i = 0; i < 200; i++) {
                    const starX = (((i * 137 + layer.seed) * 11) % (GAME_WIDTH * 3)) - GAME_WIDTH + xOffset * 0.2;
                    const starY = (((i * 73 + layer.seed) * 17) % (GAME_HEIGHT * 2)) - GAME_HEIGHT;
                    const size = (i % 2) + 0.5;
                    if ((i + layer.seed) % 10 === 0) {
                        ctx.save();
                        ctx.shadowBlur = 5; ctx.shadowColor = (i % 2 === 0) ? '#00ffff' : '#ff00ff';
                        ctx.fillStyle = ctx.shadowColor;
                        ctx.fillRect(starX, starY, size*2, size*2);
                        ctx.restore();
                    } else {
                        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
                        ctx.fillRect(starX, starY, size, size);
                    }
                }
                ctx.globalAlpha = 1.0;
            } else {
                // Jagged Mountains
                ctx.beginPath();
                ctx.moveTo(-100, groundY);
                for(let i = -2; i < (GAME_WIDTH / 100) + 2; i++) {
                    const x = i * 200 + xOffset;
                    const h = layer.height + Math.sin(layer.seed + i) * 50;
                    ctx.lineTo(x + 100, groundY - h);
                    ctx.lineTo(x + 200, groundY - (h * 0.2));
                }
                ctx.lineTo(GAME_WIDTH + 100, groundY);
                ctx.closePath();
                ctx.fill();
            }
        });
    }
    
    if (waterLevel !== undefined) {
        ctx.save();
        const waterGrad = ctx.createLinearGradient(0, waterLevel, 0, waterLevel + 400);
        waterGrad.addColorStop(0, 'rgba(0, 119, 190, 0.6)');
        waterGrad.addColorStop(1, 'rgba(0, 20, 40, 0.9)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(-GAME_WIDTH, waterLevel, GAME_WIDTH * 3, GAME_HEIGHT * 2);
        
        ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff'; ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-GAME_WIDTH, waterLevel); ctx.lineTo(GAME_WIDTH * 2, waterLevel); ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; ctx.shadowBlur = 0;
        for (let i = 0; i < 30; i++) {
            const bx = (Math.sin(Date.now() * 0.0005 + i) * 300 + i * 200) % (GAME_WIDTH * 2) - GAME_WIDTH/2;
            const by = waterLevel + 20 + (i * 15) % 300;
            ctx.beginPath(); ctx.ellipse(bx, by, 40, 2, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
};

export const drawPrizes = (ctx: CanvasRenderingContext2D, prizes: Prize[]) => {
    prizes.forEach(p => {
        if (p.collected) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
        if (p.type === 'bacon') {
            ctx.fillStyle = '#ff9999'; ctx.fillRect(0, 5, 30, 10); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 15, 30, 10);
        } else if (p.type === 'carrot') {
            ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(5, 5); ctx.lineTo(25, 5); ctx.fill();
            ctx.fillStyle = '#27ae60'; ctx.fillRect(12, 0, 6, 5);
        } else if (p.type === 'shoes') {
            ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, 15, 30, 15); ctx.fillStyle = '#fff'; ctx.fillRect(5, 10, 10, 10);
        } else if (p.type === 'spring') {
            ctx.strokeStyle = '#95a5a6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(5, 30); ctx.lineTo(25, 30);
            for(let i=0; i<3; i++) { ctx.lineTo(i%2===0?25:5, 30-i*10); } ctx.stroke();
        } else if (p.type === 'burger') {
            ctx.fillStyle = '#d35400'; ctx.beginPath(); ctx.arc(15, 10, 15, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, 10, 30, 5); ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, 15, 30, 5);
            ctx.fillStyle = '#d35400'; ctx.fillRect(0, 20, 30, 10);
        } else if (p.type === 'wing') {
            ctx.fillStyle = '#fff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.moveTo(0, 15); ctx.bezierCurveTo(0, 0, 30, 0, 30, 15); ctx.fill();
        } else if (p.type === 'laser') {
            ctx.fillStyle = '#00ffff'; ctx.fillRect(5, 10, 20, 10); ctx.fillStyle = '#fff'; ctx.fillRect(20, 12, 10, 6);
        } else if (p.type === 'shard') {
            ctx.fillStyle = '#00ffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(30, 15); ctx.lineTo(15, 30); ctx.lineTo(0, 15); ctx.fill();
        } else if (p.type === 'shield') {
            ctx.strokeStyle = '#bf5af2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(15, 15, 12, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = 'rgba(191, 90, 242, 0.4)'; ctx.fill();
            ctx.beginPath(); for (let i=0; i<6; i++) { ctx.lineTo(15 + 6 * Math.cos(i * Math.PI / 3), 15 + 6 * Math.sin(i * Math.PI / 3)); } ctx.closePath(); ctx.stroke();
        } else if (p.type === 'magnet') {
            ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(15, 15, 10, Math.PI, 0); ctx.lineTo(25, 25); ctx.lineTo(20, 25); ctx.lineTo(20, 15);
            ctx.arc(15, 15, 5, 0, Math.PI, true); ctx.lineTo(10, 25); ctx.lineTo(5, 25); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ecf0f1'; ctx.fillRect(5, 20, 5, 5); ctx.fillRect(20, 20, 5, 5);
        }
        ctx.restore();
    });
};

export const drawEnemy = (ctx: CanvasRenderingContext2D, e: Enemy, frameCount: number) => {
    if (!e.alive) return;
    ctx.save();
    if (e.glitched) {
        if (Math.random() > 0.8) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
    }
    ctx.translate(e.x, e.y);
    
    let baseColor = e.color || '#e74c3c';
    if (e.state === 'alert') baseColor = '#f1c40f';
    else if (e.state === 'attack' || e.phase2) baseColor = '#ff0000';
    
    ctx.shadowBlur = 10; ctx.shadowColor = baseColor;

    if (e.type === 'boss') {
        // Massive Mech Boss
        ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, 0, e.w, e.h);
        ctx.strokeStyle = baseColor; ctx.lineWidth = 4; ctx.strokeRect(5, 5, e.w-10, e.h-10);
        
        // Glowing Core
        const coreSize = 40 + Math.sin(frameCount * 0.1) * 10;
        const coreGrad = ctx.createRadialGradient(e.w/2, e.h/2, 0, e.w/2, e.h/2, coreSize);
        coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(1, baseColor);
        ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(e.w/2, e.h/2, coreSize, 0, Math.PI*2); ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff'; ctx.fillRect(20, 20, 20, 20); ctx.fillRect(e.w-40, 20, 20, 20);
        
        if (e.hp !== undefined && e.maxHp !== undefined) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, -30, e.w, 15);
            ctx.fillStyle = baseColor; ctx.fillRect(2, -28, (e.w-4) * (e.hp / e.maxHp), 11);
        }
    } else if (e.type === 'centipede') {
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(e.w/2, e.h/2, e.w/2, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 20; ctx.shadowColor = e.segmentIndex === 0 ? '#ff00ff' : '#00ffff';
        ctx.fillStyle = e.segmentIndex === 0 ? '#ff00ff' : '#00ffff';
        ctx.beginPath(); ctx.arc(e.w/2, e.h/2, e.w/4, 0, Math.PI*2); ctx.fill();
        // Spikes
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        for(let i=0; i<8; i++) {
            const ang = i * Math.PI / 4 + frameCount * 0.1;
            ctx.beginPath(); ctx.moveTo(e.w/2, e.h/2); ctx.lineTo(e.w/2 + Math.cos(ang)*e.w/2, e.h/2 + Math.sin(ang)*e.h/2); ctx.stroke();
        }
    } else if (e.type === 'brute') {
        // Heavy Armored Walker
        ctx.fillStyle = '#34495e'; ctx.fillRect(0, 10, e.w, e.h-10);
        ctx.fillStyle = baseColor; ctx.fillRect(10, 20, e.w-20, e.h-40);
        // Hydraulics
        ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 6;
        const legY = 10 + Math.sin(frameCount * 0.2) * 5;
        ctx.beginPath(); ctx.moveTo(10, e.h-10); ctx.lineTo(10, e.h+legY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(e.w-10, e.h-10); ctx.lineTo(e.w-10, e.h+legY); ctx.stroke();
        
        if (e.shielded) {
            ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'; ctx.strokeStyle = '#00ffff';
            const shieldX = (e.vx && e.vx > 0) ? e.w : -15;
            ctx.fillRect(shieldX, -10, 15, e.h+20); ctx.strokeRect(shieldX, -10, 15, e.h+20);
            ctx.restore();
        }
    } else if (e.type === 'sniper') {
        // Tripod Turret
        ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.moveTo(e.w/2, 0); ctx.lineTo(e.w, e.h); ctx.lineTo(0, e.h); ctx.fill();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(e.w/2, e.h/3, 8, 0, Math.PI*2); ctx.fill();
        // Barrel
        if (e.targetX !== undefined && e.targetY !== undefined) {
            const ang = Math.atan2(e.targetY - (e.y + e.h/3), e.targetX - (e.x + e.w/2));
            ctx.save(); ctx.translate(e.w/2, e.h/3); ctx.rotate(ang);
            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(0, -4, 30, 8);
            if (e.state === 'attack') {
                ctx.fillStyle = 'red'; ctx.globalAlpha = 0.5 + Math.sin(frameCount * 0.5) * 0.5;
                ctx.fillRect(30, -1, 500, 2);
            }
            ctx.restore();
        }
    } else if (e.type === 'seeker') {
        // Drone Seeker
        ctx.save();
        const hover = Math.sin(frameCount * 0.1) * 5;
        ctx.translate(0, hover);
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(e.w/2, e.h/2, e.w/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(e.w/2, e.h/2, e.w/4, 0, Math.PI*2); ctx.fill();
        // Rotors
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        const rotorAng = frameCount * 0.5;
        ctx.beginPath(); ctx.moveTo(e.w/2 + Math.cos(rotorAng)*20, e.h/2 + Math.sin(rotorAng)*20);
        ctx.lineTo(e.w/2 - Math.cos(rotorAng)*20, e.h/2 - Math.sin(rotorAng)*20); ctx.stroke();
        ctx.restore();
    } else if (e.type === 'flying') {
        // Jet Drone
        ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.moveTo(0, e.h/2); ctx.lineTo(e.w/2, 0); ctx.lineTo(e.w, e.h/2); ctx.lineTo(e.w/2, e.h); ctx.fill();
        // Engines
        ctx.fillStyle = '#e67e22'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff4500';
        const thrust = 10 + Math.random() * 10;
        ctx.fillRect(-thrust, e.h/2-5, thrust, 10);
        ctx.fillRect(e.w, e.h/2-5, thrust, 10);
    } else if (e.type === 'spikes') {
        ctx.fillStyle = '#7f8c8d';
        for(let i=0; i<e.w; i+=20) {
            ctx.beginPath(); ctx.moveTo(i, e.h); ctx.lineTo(i+10, 0); ctx.lineTo(i+20, e.h); ctx.fill();
        }
    } else {
        // Standard Patrol Bot
        ctx.fillStyle = '#333'; ctx.fillRect(5, 5, e.w-10, e.h-5);
        ctx.fillStyle = baseColor; ctx.fillRect(10, 10, e.w-20, 15); // Visor
        // Armored joints
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, e.h/2, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.w, e.h/2, 5, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
};

export const drawEnemyProjectiles = (ctx: CanvasRenderingContext2D, projectiles: EnemyProjectile[]) => {
    projectiles.forEach(p => {
        if (!p.active) return;
        ctx.save(); ctx.translate(p.x, p.y); 
        ctx.shadowBlur = 15; ctx.shadowColor = p.laserSight ? '#00ffff' : '#ff0000';
        const grad = ctx.createRadialGradient(p.w/2, p.h/2, 0, p.w/2, p.h/2, p.w/2);
        grad.addColorStop(0, '#fff'); grad.addColorStop(1, p.laserSight ? '#00ffff' : '#ff0000');
        ctx.fillStyle = grad; 
        ctx.beginPath(); ctx.arc(p.w/2, p.h/2, p.w/2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

export const drawGrid = (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, color: string) => {
    const spacing = 100;
    const GAME_WIDTH = 800; const GAME_HEIGHT = 600;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.15;
    const startX = -(cameraX % spacing); const startY = -(cameraY % spacing);
    ctx.beginPath();
    for (let x = startX; x < GAME_WIDTH; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT); }
    for (let y = startY; y < GAME_HEIGHT; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y); }
    ctx.stroke(); ctx.restore();
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: any[]) => {
    particles.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        ctx.fillRect(-p.size/2, -p.size/2, p.size + speed, p.size);
        ctx.restore();
    });
};

export const drawMovingPlatforms = (ctx: CanvasRenderingContext2D, platforms: MovingPlatform[], isBonusRoom: boolean) => {
    const metalPattern = getTexture(ctx, 'metal');
    platforms.forEach(p => {
        ctx.fillStyle = metalPattern || '#bdc3c7'; ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff'; ctx.strokeRect(p.x, p.y, p.w, p.h); ctx.restore();
    });
};

export const drawSwitches = (ctx: CanvasRenderingContext2D, switches: Switch[]) => {
    switches.forEach(sw => {
        ctx.save(); ctx.translate(sw.x, sw.y);
        ctx.fillStyle = '#333'; ctx.fillRect(0, 0, sw.w, sw.h);
        ctx.fillStyle = sw.active ? '#2ecc71' : '#e74c3c';
        ctx.shadowBlur = sw.active ? 15 : 0; ctx.shadowColor = sw.active ? '#2ecc71' : 'transparent';
        ctx.fillRect(5, sw.active ? 10 : -5, sw.w - 10, 15);
        ctx.restore();
    });
};

export const drawLaserGates = (ctx: CanvasRenderingContext2D, gates: LaserGate[], switches: Switch[], frameCount: number) => {
    gates.forEach(gate => {
        const sw = switches.find(s => s.id === `switch_${gate.id.split('_')[1]}`);
        const active = sw ? !sw.active : gate.active;
        if (!active) return;
        ctx.save(); ctx.translate(gate.x, gate.y); ctx.fillStyle = '#2c3e50';
        if (gate.orientation === 'v') {
            ctx.fillRect(0, 0, gate.w, 10); ctx.fillRect(0, gate.h - 10, gate.w, 10);
            ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff'; ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2 + Math.sin(frameCount * 0.5);
            ctx.beginPath(); ctx.moveTo(gate.w/2, 10); ctx.lineTo(gate.w/2, gate.h - 10); ctx.stroke();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    });
};

export const drawWarps = (ctx: CanvasRenderingContext2D, warps: Warp[]) => {
    warps.forEach(w => {
        ctx.save(); ctx.translate(w.x, w.y);
        if (w.used) { ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, w.w, w.h); }
        else {
            const warpGrad = ctx.createRadialGradient(w.w/2, w.h/2, 5, w.w/2, w.h/2, w.w/2);
            warpGrad.addColorStop(0, '#fff'); warpGrad.addColorStop(0.5, '#bf5af2'); warpGrad.addColorStop(1, '#000');
            ctx.fillStyle = warpGrad; ctx.fillRect(0, 0, w.w, w.h);
            ctx.shadowBlur = 20; ctx.shadowColor = '#bf5af2'; ctx.strokeStyle = '#fff'; ctx.strokeRect(0, 0, w.w, w.h);
        }
        ctx.restore();
    });
};

export const drawCheckpoints = (ctx: CanvasRenderingContext2D, checkpoints: { x: number, y: number, active: boolean }[], frameCount: number) => {
    checkpoints.forEach(cp => {
        ctx.save(); ctx.translate(cp.x, cp.y);
        ctx.fillStyle = cp.active ? '#00ffff' : '#555';
        ctx.shadowBlur = cp.active ? 20 : 0; ctx.shadowColor = cp.active ? '#00ffff' : 'transparent';
        ctx.fillRect(-10, -40, 20, 40);
        ctx.fillStyle = cp.active ? '#ffffff' : '#333';
        ctx.beginPath(); ctx.arc(0, -50 + Math.sin(frameCount * 0.1) * 5, 10, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

export const drawSprings = (ctx: CanvasRenderingContext2D, springs: Spring[]) => {
    springs.forEach(s => {
        ctx.save(); ctx.translate(s.x, s.y);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(0, s.active ? 10 : 0, s.w, s.h - (s.active ? 10 : 0));
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(0, s.active ? 10 : 0, s.w, s.h - (s.active ? 10 : 0));
        ctx.restore();
    });
};

export const drawFireballs = (ctx: CanvasRenderingContext2D, fireballs: Fireball[]) => {
    fireballs.forEach(fb => {
        if (!fb.active) return;
        ctx.save(); ctx.translate(fb.x, fb.y); ctx.shadowBlur = 15; ctx.shadowColor = '#e67e22';
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(fb.w/2, fb.h/2, fb.w/2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

export const drawLasers = (ctx: CanvasRenderingContext2D, lasers: Laser[]) => {
    lasers.forEach(laser => {
        if (!laser.active) return;
        ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff'; ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = laser.life; ctx.beginPath(); ctx.moveTo(laser.x, laser.y + laser.h / 2); ctx.lineTo(laser.x + laser.w, laser.y + laser.h / 2); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = laser.life / 2; ctx.beginPath(); ctx.moveTo(laser.x, laser.y + laser.h / 2); ctx.lineTo(laser.x + laser.w, laser.y + laser.h / 2); ctx.stroke();
        ctx.restore();
    });
};

export const drawFirebars = (ctx: CanvasRenderingContext2D, firebars: Firebar[]) => {
    firebars.forEach(bar => {
        for (let i = 1; i <= bar.length; i++) {
            const dist = i * 25;
            const fx = bar.x + Math.cos(bar.angle) * dist;
            const fy = bar.y + Math.sin(bar.angle) * dist;
            ctx.save(); ctx.translate(fx, fy); ctx.shadowBlur = 10; ctx.shadowColor = '#ff4d00';
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    });
};
