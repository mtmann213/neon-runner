import type { Player, Enemy, Prize, BackgroundLayer } from './types';

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

export const drawBoy = (ctx: CanvasRenderingContext2D, p: Player, frameCount: number) => {
    const walkCycle = Math.sin(frameCount * 0.2) * 10;
    ctx.save();
    if (!p.facingRight) { ctx.translate(p.x + p.width, p.y); ctx.scale(-1, 1); } else { ctx.translate(p.x, p.y); }
    
    // Neon Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = p.speedBoostTimer > 0 ? '#f1c40f' : (p.jumpBoostTimer > 0 ? '#2ecc71' : '#00ced1');

    if (p.invincibilityFrames % 10 < 5) {
        if (p.isRolling) {
            ctx.fillStyle = '#f1c40f'; 
            ctx.beginPath(); 
            ctx.arc(p.width/2, p.height/2, p.width/2, 0, Math.PI * 2); 
            ctx.fill();
        } else {
            // Body
            ctx.fillStyle = p.speedBoostTimer > 0 ? '#f1c40f' : (p.jumpBoostTimer > 0 ? '#2ecc71' : '#00ced1');
            ctx.fillRect(p.width*0.25, p.height*0.33, p.width*0.5, p.height*0.5);
            
            // Head
            ctx.fillStyle = '#f3e5ab';
            ctx.fillRect(p.width*0.3, p.height*0.08, p.width*0.4, p.height*0.26);
            
            // Eye
            ctx.fillStyle = 'black';
            ctx.fillRect(p.width*0.55, p.height*0.15, p.width*0.075, p.width*0.075);
            
            // Legs
            ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = p.width * 0.1;
            const legOff = Math.abs(p.vx) > 0 ? walkCycle : 0;
            ctx.beginPath(); ctx.moveTo(p.width*0.375, p.height*0.83); ctx.lineTo(p.width*0.375 + legOff, p.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(p.width*0.625, p.height*0.83); ctx.lineTo(p.width*0.625 - legOff, p.height); ctx.stroke();
        }
    }
    ctx.restore();
};

export const drawEnemy = (ctx: CanvasRenderingContext2D, e: Enemy, frameCount: number) => {
    if (!e.alive) return;
    ctx.save(); ctx.translate(e.x, e.y);
    
    // Neon Glow for enemies
    ctx.shadowBlur = 10;
    ctx.shadowColor = e.color || '#ff00ff';

    if (e.type === 'spikes') {
        ctx.fillStyle = e.color || '#2c3e50';
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
    layers?: BackgroundLayer[]
) => {
    // Background fill (base sky)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (layers) {
        layers.forEach(layer => {
            ctx.fillStyle = layer.color;
            const xOffset = -(cameraX * layer.speed) % 400;
            
            // Procedural shapes based on seed
            for (let i = -1; i < (canvas.width / 400) + 1; i++) {
                const x = i * 400 + xOffset;
                const h = layer.height;
                
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x + 200, groundY - h);
                ctx.lineTo(x + 400, groundY);
                ctx.fill();
            }
        });
    } else {
        // Fallback
        const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGrad.addColorStop(0, '#1a1a2e'); skyGrad.addColorStop(1, '#16213e');
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, groundY);
    }
};

export const drawPrizes = (ctx: CanvasRenderingContext2D, prizes: Prize[]) => {
    prizes.forEach(p => {
        if (p.collected) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f1c40f';
        
        if (p.type === 'bacon') {
            ctx.fillStyle = '#ff9999'; ctx.fillRect(0, 5, 30, 10);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 15, 30, 5);
            ctx.fillStyle = '#ff9999'; ctx.fillRect(0, 20, 30, 5);
        } else if (p.type === 'carrot') {
            ctx.fillStyle = '#f1c40f'; // Gold
            ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(5, 5); ctx.lineTo(25, 5); ctx.fill();
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(12, 0, 6, 5);
        } else if (p.type === 'shoes') {
            ctx.fillStyle = '#3498db'; ctx.fillRect(5, 15, 20, 10);
            ctx.fillRect(15, 5, 10, 15);
            ctx.fillStyle = '#f1c40f'; // Lightning
            ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(20, 10); ctx.lineTo(30, 10); ctx.lineTo(22, 25); ctx.stroke();
        } else if (p.type === 'spring') {
            ctx.strokeStyle = '#95a5a6'; ctx.lineWidth = 3;
            ctx.beginPath();
            for(let i=0; i<4; i++) {
                ctx.arc(15, 25 - i*6, 10, 0, Math.PI, false);
            }
            ctx.stroke();
        }
        ctx.restore();
    });
};
