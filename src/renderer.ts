import type { Player, Enemy } from './types';

export const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = '#e74c3c'; ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.quadraticCurveTo(x, y, x + size / 4, y);
    ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
    ctx.quadraticCurveTo(x + size / 2, y, x + (size * 3) / 4, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
    ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size);
    ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4); ctx.fill();
};

export const drawBoy = (ctx: CanvasRenderingContext2D, p: Player, frameCount: number) => {
    const walkCycle = Math.sin(frameCount * 0.2) * 10;
    ctx.save();
    if (!p.facingRight) { ctx.translate(p.x + p.width, p.y); ctx.scale(-1, 1); } else { ctx.translate(p.x, p.y); }
    if (p.invincibilityFrames % 10 < 5) {
        if (p.isRolling) {
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(20, 15, 15, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = p.speedBoostTimer > 0 ? '#f1c40f' : '#2980b9'; ctx.fillRect(10, 20, 20, 30);
            ctx.fillStyle = '#f3e5ab'; ctx.fillRect(12, 5, 16, 16);
            ctx.fillStyle = 'black'; ctx.fillRect(22, 9, 3, 3);
            ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4;
            const legOff = Math.abs(p.vx) > 0 ? walkCycle : 0;
            ctx.beginPath(); ctx.moveTo(15, 50); ctx.lineTo(15 + legOff, 60); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(25, 50); ctx.lineTo(25 - legOff, 60); ctx.stroke();
        }
    }
    ctx.restore();
};

export const drawEnemy = (ctx: CanvasRenderingContext2D, e: Enemy, frameCount: number) => {
    if (!e.alive) return;
    ctx.save(); ctx.translate(e.x, e.y);
    if (e.type === 'spikes') {
        ctx.fillStyle = '#2c3e50';
        for (let i = 0; i < e.w / 20; i++) {
            ctx.beginPath(); ctx.moveTo(i * 20, e.h); ctx.lineTo(i * 20 + 10, 0); ctx.lineTo(i * 20 + 20, e.h); ctx.fill();
        }
    } else {
        ctx.fillStyle = e.color || '#e74c3c'; ctx.fillRect(0, 0, e.w, e.h);
        if (e.type === 'boss') {
            ctx.fillStyle = 'white'; ctx.fillRect(10, 20, 30, 30); ctx.fillRect(60, 20, 30, 30);
            ctx.fillStyle = 'black'; ctx.fillRect(20, 30, 10, 10); ctx.fillRect(70, 30, 10, 10);
            ctx.fillStyle = 'white'; ctx.fillRect(20, 70, 60, 10);
            if (e.hp !== undefined && e.maxHp !== undefined) {
                ctx.fillStyle = 'red'; ctx.fillRect(0, -20, e.w, 10);
                ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, -20, e.w * (e.hp / e.maxHp), 10);
            }
        } else {
            ctx.fillStyle = 'white'; ctx.fillRect(5, 10, 12, 12); ctx.fillRect(23, 10, 12, 12);
            ctx.fillStyle = 'black'; ctx.fillRect(10, 15, 4, 4); ctx.fillRect(28, 15, 4, 4);
            const step = Math.sin(frameCount * 0.2) * 5;
            ctx.fillStyle = '#c0392b'; ctx.fillRect(5, 35, 10, 5 + step); ctx.fillRect(25, 35, 10, 5 - step);
        }
    }
    ctx.restore();
};

export const drawBackground = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    cameraX: number,
    groundY: number,
    mountains: any[],
    clouds: any[]
) => {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#87CEEB'); skyGrad.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, groundY);
    ctx.fillStyle = '#95a5a6';
    mountains.forEach(m => {
        ctx.beginPath(); ctx.moveTo(m.x - cameraX * 0.2, groundY);
        ctx.lineTo(m.x + m.w/2 - cameraX * 0.2, groundY - m.h);
        ctx.lineTo(m.x + m.w - cameraX * 0.2, groundY); ctx.fill();
    });
    ctx.fillStyle = 'white';
    clouds.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x - cameraX * 0.1, c.y, c.size, 0, Math.PI * 2); ctx.fill();
    });
};
