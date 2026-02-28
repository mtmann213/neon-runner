import type { Player, Enemy, Prize, BackgroundLayer, Fireball, EnemyProjectile, Warp, Firebar } from './types';

export const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#e74c3c';
    ctx.fillStyle = '#e74c3c'; ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.quadraticCurveTo(x, y, x + size / 4, y);
    ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
    ctx.quadraticCurveTo(x + size / 2, y, x + (size * 3) / 4, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
    ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size);
    ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4); ctx.fill();
    ctx.restore();
};

export const drawBoy = (ctx: CanvasRenderingContext2D, p: Player, frameCount: number, isSwimming: boolean = false) => {
    // --- GHOST TRAIL DRAWING ---
    p.trail.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        if (!t.facingRight) { ctx.translate(t.x + t.width, t.y); ctx.scale(-1, 1); } else { ctx.translate(t.x, t.y); }
        
        // Simpler silhouette for trail
        ctx.fillStyle = p.giantTimer > 0 ? '#f1c40f' : (p.speedBoostTimer > 0 ? '#f1c40f' : '#00ced1');
        ctx.fillRect(t.width*0.25, t.height*0.33, t.width*0.5, t.height*0.5);
        ctx.fillRect(t.width*0.3, t.height*0.08, t.width*0.4, t.height*0.26);
        ctx.restore();
    });

    const walkCycle = Math.sin(frameCount * 0.2) * 10;
    const swimCycle = Math.sin(frameCount * 0.1) * 15;
    ctx.save();
    if (!p.facingRight) { ctx.translate(p.x + p.width, p.y); ctx.scale(-1, 1); } else { ctx.translate(p.x, p.y); }
    
    ctx.shadowBlur = p.giantTimer > 0 ? 40 : 15;
    ctx.shadowColor = p.giantTimer > 0 ? '#f1c40f' : (p.speedBoostTimer > 0 ? '#f1c40f' : (p.jumpBoostTimer > 0 ? '#2ecc71' : '#00ced1'));

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
            if (p.giantTimer > 0) {
                ctx.fillStyle = `hsl(${frameCount * 5 % 360}, 70%, 50%)`;
            } else {
                const bodyGrad = ctx.createLinearGradient(p.width*0.25, p.height*0.33, p.width*0.75, p.height*0.83);
                bodyGrad.addColorStop(0, '#ffffff');
                bodyGrad.addColorStop(1, p.speedBoostTimer > 0 ? '#f39c12' : (p.jumpBoostTimer > 0 ? '#27ae60' : '#008b8b'));
                ctx.fillStyle = bodyGrad;
            }
            ctx.fillRect(p.width*0.25, p.height*0.33, p.width*0.5, p.height*0.5);
            
            if (isSwimming) {
                ctx.strokeStyle = '#f3e5ab'; ctx.lineWidth = p.width * 0.15;
                ctx.beginPath(); ctx.moveTo(p.width*0.25, p.height*0.4); 
                ctx.lineTo(p.width*0.05, p.height*0.4 + swimCycle); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(p.width*0.75, p.height*0.4); 
                ctx.lineTo(p.width*0.95, p.height*0.4 - swimCycle); ctx.stroke();
            }

            if (p.wingTimer > 0) {
                ctx.fillStyle = 'white';
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

            const headGrad = ctx.createRadialGradient(p.width*0.5, p.height*0.21, p.width*0.1, p.width*0.5, p.height*0.21, p.width*0.3);
            headGrad.addColorStop(0, '#ffffff');
            headGrad.addColorStop(1, '#f3e5ab');
            ctx.fillStyle = headGrad;
            ctx.fillRect(p.width*0.3, p.height*0.08, p.width*0.4, p.height*0.26);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(p.width*0.55, p.height*0.15, p.width*0.075, p.width*0.075);
            
            ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = p.width * 0.1;
            ctx.lineCap = 'round';
            const legOff = Math.abs(p.vx) > 0 ? (isSwimming ? swimCycle : walkCycle) : 0;
            ctx.beginPath(); ctx.moveTo(p.width*0.375, p.height*0.83); ctx.lineTo(p.width*0.375 + legOff, p.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(p.width*0.625, p.height*0.83); ctx.lineTo(p.width*0.625 - legOff, p.height); ctx.stroke();
        }
    }
    ctx.restore();
};

export const drawEnemy = (ctx: CanvasRenderingContext2D, e: Enemy, frameCount: number) => {
    if (!e.alive) return;
    ctx.save(); ctx.translate(e.x, e.y);
    ctx.shadowBlur = 10;
    ctx.shadowColor = e.color || '#ff00ff';
    if (e.type === 'spikes') {
        const spikeGrad = ctx.createLinearGradient(0, 0, 0, e.h);
        spikeGrad.addColorStop(0, '#ecf0f1');
        spikeGrad.addColorStop(1, e.color || '#2c3e50');
        ctx.fillStyle = spikeGrad;
        for (let i = 0; i < e.w / 20; i++) {
            ctx.beginPath(); ctx.moveTo(i * 20, e.h); ctx.lineTo(i * 20 + 10, 0); ctx.lineTo(i * 20 + 20, e.h); ctx.fill();
        }
    } else {
        const bodyGrad = ctx.createLinearGradient(0, 0, e.w, e.h);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(1, e.color || '#e74c3c');
        ctx.fillStyle = bodyGrad; 
        ctx.fillRect(0, 0, e.w, e.h);

        if (e.type === 'boss') {
            ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(10, 20, 30, 30); ctx.fillRect(60, 20, 30, 30);
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(20, 30, 10, 10); ctx.fillRect(70, 30, 10, 10);
            ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(20, 70, 60, 10);
            if (e.hp !== undefined && e.maxHp !== undefined) {
                ctx.fillStyle = '#c0392b'; ctx.fillRect(0, -20, e.w, 10);
                ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, -20, e.w * (e.hp / e.maxHp), 10);
            }
        } else if (e.type === 'flying') {
            ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(5, 5, 30, 15);
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(15, 10, 10, 10);
        } else if (e.type === 'turret') {
            ctx.fillStyle = '#333'; ctx.fillRect(0, 20, 40, 20);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(10, 0, 20, 20);
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(20, 10, 5, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(5, 10, 12, 12); ctx.fillRect(23, 10, 12, 12);
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(10, 15, 4, 4); ctx.fillRect(28, 15, 4, 4);
            const step = Math.sin(frameCount * 0.2) * 5;
            ctx.fillStyle = '#c0392b'; ctx.fillRect(5, 35, 10, 5 + step); ctx.fillRect(25, 35, 10, 5 - step);
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
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (layers) {
        layers.forEach(layer => {
            ctx.fillStyle = layer.color;
            const xOffset = -(cameraX * layer.speed) % 400;
            for (let i = -1; i < (GAME_WIDTH / 400) + 1; i++) {
                const x = i * 400 + xOffset;
                const h = layer.height;
                ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x + 200, groundY - h); ctx.lineTo(x + 400, groundY); ctx.fill();
            }
        });
    }
    if (waterLevel !== undefined) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 119, 190, 0.4)';
        ctx.fillRect(0, waterLevel, GAME_WIDTH, GAME_HEIGHT - waterLevel);
        ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff'; ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, waterLevel); ctx.lineTo(GAME_WIDTH, waterLevel); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.shadowBlur = 0;
        for (let i = 0; i < 20; i++) {
            const bx = (Math.sin(Date.now() * 0.001 + i) * 100 + i * 100) % GAME_WIDTH;
            const by = (waterLevel + 50 + i * 30 + Math.cos(Date.now() * 0.002 + i) * 50) % (GAME_HEIGHT - waterLevel) + waterLevel;
            ctx.beginPath(); ctx.arc(bx, by, 2 + (i % 4), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
};

export const drawPrizes = (ctx: CanvasRenderingContext2D, prizes: Prize[]) => {
    prizes.forEach(p => {
        if (p.collected) return;
        ctx.save(); ctx.translate(p.x, p.y); ctx.shadowBlur = 15; ctx.shadowColor = '#f1c40f';
        if (p.type === 'bacon') {
            ctx.fillStyle = '#ff9999'; ctx.fillRect(0, 5, 30, 10);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 15, 30, 5);
            ctx.fillStyle = '#ff9999'; ctx.fillRect(0, 20, 30, 5);
        } else if (p.type === 'carrot') {
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(5, 5); ctx.lineTo(25, 5); ctx.fill();
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(12, 0, 6, 5);
        } else if (p.type === 'shoes') {
            ctx.fillStyle = '#3498db'; ctx.fillRect(5, 15, 20, 10); ctx.fillRect(15, 5, 10, 15);
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(20, 10); ctx.lineTo(30, 10); ctx.lineTo(22, 25); ctx.stroke();
        } else if (p.type === 'spring') {
            ctx.strokeStyle = '#95a5a6'; ctx.lineWidth = 3; ctx.beginPath();
            for(let i=0; i<4; i++) ctx.arc(15, 25 - i*6, 10, 0, Math.PI, false);
            ctx.stroke();
        } else if (p.type === 'burger') {
            ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(15, 10, 15, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, 10, 30, 3);
            ctx.fillStyle = '#795548'; ctx.fillRect(0, 13, 30, 6);
            ctx.fillStyle = '#e67e22'; ctx.fillRect(0, 19, 30, 6);
        } else if (p.type === 'wing') {
            ctx.fillStyle = 'white';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(0, 15);
            ctx.bezierCurveTo(-10, 0, 30, 0, 20, 15);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(30, 15);
            ctx.bezierCurveTo(40, 0, 0, 0, 10, 15);
            ctx.fill();
        }
        ctx.restore();
    });
};

export const drawFireballs = (ctx: CanvasRenderingContext2D, fireballs: Fireball[]) => {
    fireballs.forEach(fb => {
        if (!fb.active) return;
        ctx.save(); ctx.translate(fb.x, fb.y); ctx.shadowBlur = 20; ctx.shadowColor = '#e67e22';
        ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(fb.w/2, fb.h/2, fb.w/2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e67e22'; ctx.globalAlpha = 0.5; ctx.beginPath();
        ctx.arc(fb.w/2, fb.h/2, fb.w/2 + Math.random() * 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

export const drawEnemyProjectiles = (ctx: CanvasRenderingContext2D, projectiles: EnemyProjectile[]) => {
    projectiles.forEach(p => {
        if (!p.active) return;
        ctx.save(); ctx.translate(p.x, p.y); ctx.shadowBlur = 10; ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(p.w/2, p.h/2, p.w/2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

export const drawWarps = (ctx: CanvasRenderingContext2D, warps: Warp[]) => {
    warps.forEach(w => {
        ctx.save(); ctx.translate(w.x, w.y);
        if (w.used) {
            ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, w.w, w.h);
            ctx.fillStyle = 'rgba(20, 20, 20, 0.9)'; ctx.fillRect(0, 0, w.w, w.h);
            ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(w.w-10, w.h-10); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w.w-10, 10); ctx.lineTo(10, w.h-10); ctx.stroke();
        } else {
            ctx.shadowBlur = 20; ctx.shadowColor = '#bf5af2';
            ctx.strokeStyle = '#bf5af2'; ctx.lineWidth = 4; ctx.strokeRect(0, 0, w.w, w.h);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(0, 0, w.w, w.h);
            ctx.fillStyle = '#bf5af2'; ctx.globalAlpha = 0.3; ctx.fillRect(w.w*0.2, w.h*0.2, w.w*0.6, w.h*0.6);
        }
        ctx.restore();
    });
};

export const drawFirebars = (ctx: CanvasRenderingContext2D, firebars: Firebar[]) => {
    firebars.forEach(bar => {
        for (let i = 1; i <= bar.length; i++) {
            const dist = i * 25;
            const fx = bar.x + Math.cos(bar.angle) * dist;
            const fy = bar.y + Math.sin(bar.angle) * dist;
            ctx.save(); ctx.translate(fx, fy); ctx.shadowBlur = 15; ctx.shadowColor = '#e67e22';
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    });
};
