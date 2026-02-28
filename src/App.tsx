import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { audioManager } from './AudioManager';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  useEffect(() => {
    if (!gameStarted) return;
    if (audioEnabled) audioManager.startMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- GAME STATE ---
    const gravity = 0.5;
    const jumpStrength = -10;
    let moveSpeed = 5;
    const rollSpeed = 10;
    const groundY = canvas.height - 100;
    const worldWidth = 5000;

    // Screen Shake State
    let shakeTimer = 0;
    let shakeIntensity = 0;

    const startShake = (duration: number, intensity: number) => {
        shakeTimer = duration;
        shakeIntensity = intensity;
    };

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; color: string; size: number;
    }
    let particles: Particle[] = [];
    
    const createParticles = (x: number, y: number, color: string, count: number, speed: number = 2) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y, vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
          life: 1.0, maxLife: 0.02 + Math.random() * 0.05, color, size: 2 + Math.random() * 4
        });
      }
    };

    const clouds = Array.from({ length: 15 }, (_, i) => ({
      x: i * 400 + Math.random() * 200, y: 50 + Math.random() * 100, size: 30 + Math.random() * 40
    }));
    const mountains = Array.from({ length: 10 }, (_, i) => ({
      x: i * 800, y: groundY, w: 600 + Math.random() * 400, h: 200 + Math.random() * 200
    }));
    const grass = Array.from({ length: 50 }, () => ({
      x: Math.random() * worldWidth, y: groundY, size: 5 + Math.random() * 10
    }));

    let frameCount = 0;
    let cameraX = 0;
    const player = {
      x: 50, y: 100, width: 40, height: 60, vx: 0, vy: 0,
      isGrounded: false, isRolling: false, rollTimer: 0,
      invincibilityFrames: 0, speedBoostTimer: 0, facingRight: true
    };

    let enemies = [
        { id: 1, x: 800, y: groundY - 40, w: 40, h: 40, vx: 2, type: 'patrol', color: '#e74c3c', alive: true },
        { id: 2, x: 1600, y: groundY - 40, w: 40, h: 40, vx: 3, type: 'patrol', color: '#e74c3c', alive: true },
        { id: 3, x: 2400, y: groundY - 40, w: 60, h: 40, type: 'spikes', color: '#2c3e50', alive: true },
        { id: 4, x: 3200, y: groundY - 40, w: 40, h: 40, vx: 4, type: 'patrol', color: '#e74c3c', alive: true },
        { id: 5, x: 4000, y: groundY - 40, w: 40, h: 40, vx: 5, type: 'patrol', color: '#e74c3c', alive: true }
    ];

    const chests = [
        { x: 1200, y: groundY - 40, w: 40, h: 40, type: 'health', open: false },
        { x: 2800, y: groundY - 40, w: 40, h: 40, type: 'speed', open: false },
        { x: 4500, y: groundY - 40, w: 40, h: 40, type: 'health', open: false }
    ];

    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.code] = true;
        if (e.code === 'ArrowRight') player.facingRight = true;
        if (e.code === 'ArrowLeft') player.facingRight = false;
    };
    const handleKeyUp = (e: KeyboardEvent) => keys[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const checkCollision = (r1: any, r2: any) => (
        r1.x < r2.x + r2.w && r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.h && r1.y + (r1.isRolling ? 30 : 60) > r2.y
    );

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.fillStyle = '#e74c3c'; ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y, x + size / 4, y);
      ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
      ctx.quadraticCurveTo(x + size / 2, y, x + (size * 3) / 4, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
      ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size);
      ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4); ctx.fill();
    };

    const drawBoy = (ctx: CanvasRenderingContext2D, p: any) => {
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

    const drawEnemy = (ctx: CanvasRenderingContext2D, e: any) => {
        if (!e.alive) return;
        ctx.save(); ctx.translate(e.x, e.y);
        if (e.type === 'spikes') {
            ctx.fillStyle = '#2c3e50';
            for (let i = 0; i < e.w / 20; i++) {
                ctx.beginPath(); ctx.moveTo(i * 20, e.h); ctx.lineTo(i * 20 + 10, 0); ctx.lineTo(i * 20 + 20, e.h); ctx.fill();
            }
        } else {
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(0, 0, e.w, e.h);
            ctx.fillStyle = 'white'; ctx.fillRect(5, 10, 12, 12); ctx.fillRect(23, 10, 12, 12);
            ctx.fillStyle = 'black'; ctx.fillRect(10, 15, 4, 4); ctx.fillRect(28, 15, 4, 4);
            const step = Math.sin(frameCount * 0.2) * 5;
            ctx.fillStyle = '#c0392b'; ctx.fillRect(5, 35, 10, 5 + step); ctx.fillRect(25, 35, 10, 5 - step);
        }
        ctx.restore();
    };

    const drawBackground = (ctx: CanvasRenderingContext2D) => {
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

    const update = () => {
      frameCount++;
      if (shakeTimer > 0) shakeTimer--;
      if (player.invincibilityFrames > 0) player.invincibilityFrames--;
      if (player.speedBoostTimer > 0) { player.speedBoostTimer--; moveSpeed = 8; } else { moveSpeed = 5; }

      if (keys['ShiftLeft'] && player.isGrounded && !player.isRolling) {
        player.isRolling = true; player.rollTimer = 20; player.vx = player.facingRight ? rollSpeed : -rollSpeed;
        createParticles(player.x + 20, groundY, '#7d5c34', 10, 3);
      }

      if (player.isRolling) {
        player.rollTimer--; if (player.rollTimer <= 0) player.isRolling = false;
        if (frameCount % 2 === 0) createParticles(player.x + 20, groundY, '#7d5c34', 2, 1);
      } else {
        player.vx = 0;
        if (keys['ArrowLeft']) player.vx = -moveSpeed;
        if (keys['ArrowRight']) player.vx = moveSpeed;
        if (keys['Space'] && player.isGrounded) {
          player.vy = jumpStrength; player.isGrounded = false;
          createParticles(player.x + 20, groundY, '#7d5c34', 8, 2);
          if (audioEnabled) audioManager.playJump();
        }
      }

      player.vy += gravity; player.x += player.vx; player.y += player.vy;
      const currentHeight = player.isRolling ? 30 : 60;
      if (player.y + currentHeight > groundY) {
        if (!player.isGrounded) createParticles(player.x + 20, groundY, '#7d5c34', 5, 1);
        player.y = groundY - currentHeight; player.vy = 0; player.isGrounded = true;
      }

      chests.forEach(chest => {
          if (!chest.open && checkCollision(player, chest)) {
              chest.open = true; 
              scoreRef.current += 100;
              setScore(scoreRef.current);
              createParticles(chest.x + 20, chest.y + 20, '#f1c40f', 15, 4);
              startShake(10, 3); // Light shake for chest
              if (audioEnabled) audioManager.playChest();
              if (chest.type === 'health') { livesRef.current++; setLives(livesRef.current); }
              else if (chest.type === 'speed') player.speedBoostTimer = 300;
          }
      });

      enemies.forEach(enemy => {
          if (!enemy.alive) return;
          if (enemy.type === 'patrol') {
              enemy.x += enemy.vx;
              if (enemy.x > enemy.id * 800 + 400 || enemy.x < enemy.id * 800 - 400) enemy.vx *= -1;
          }
          if (checkCollision(player, enemy)) {
              if (player.vy > 0 && player.y < enemy.y && enemy.type !== 'spikes') {
                  enemy.alive = false; player.vy = -8; 
                  scoreRef.current += 50; setScore(scoreRef.current);
                  createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                  startShake(15, 5); // Medium shake for kill
                  if (audioEnabled) audioManager.playBop();
              } else if (player.isRolling && enemy.type !== 'spikes') {
                  enemy.alive = false; 
                  scoreRef.current += 50; setScore(scoreRef.current);
                  createParticles(enemy.x + 20, enemy.y + 20, '#e74c3c', 20, 5);
                  startShake(15, 5); // Medium shake for kill
                  if (audioEnabled) audioManager.playBop();
              } else if (player.invincibilityFrames === 0) {
                  livesRef.current--; setLives(livesRef.current);
                  player.invincibilityFrames = 60;
                  createParticles(player.x + 20, player.y + 20, '#3498db', 10, 3);
                  startShake(20, 10); // Big shake for damage
                  if (audioEnabled) audioManager.playDamage();
                  if (livesRef.current <= 0) {
                      livesRef.current = 3; setLives(3);
                      scoreRef.current = 0; setScore(0);
                      player.x = 50; player.y = 100; cameraX = 0;
                      enemies.forEach(e => e.alive = true);
                      chests.forEach(c => c.open = false);
                  }
              }
          }
      });

      particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= p.maxLife; });
      particles = particles.filter(p => p.life > 0);

      const centerX = canvas.width / 2;
      if (player.x > centerX) cameraX = player.x - centerX;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > worldWidth - canvas.width) cameraX = worldWidth - canvas.width;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply Screen Shake
      ctx.save();
      if (shakeTimer > 0) {
          const dx = (Math.random() - 0.5) * shakeIntensity;
          const dy = (Math.random() - 0.5) * shakeIntensity;
          ctx.translate(dx, dy);
      }

      drawBackground(ctx);
      ctx.save(); ctx.translate(-cameraX, 0);
      ctx.fillStyle = '#7d5c34'; ctx.fillRect(0, groundY, worldWidth, canvas.height - groundY);
      ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, groundY, worldWidth, 10);
      grass.forEach(g => { ctx.fillStyle = '#27ae60'; ctx.fillRect(g.x, g.y - g.size, 4, g.size); });
      ctx.fillStyle = '#2c3e50'; ctx.fillRect(worldWidth - 100, groundY - 150, 10, 150);
      ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(worldWidth - 100, groundY - 150);
      ctx.lineTo(worldWidth - 40, groundY - 120); ctx.lineTo(worldWidth - 100, groundY - 90); ctx.fill();
      particles.forEach(p => { ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, p.size, p.size); });
      ctx.globalAlpha = 1.0;
      chests.forEach(c => {
          ctx.fillStyle = c.open ? '#8B4513' : '#f1c40f'; ctx.fillRect(c.x, c.y, c.w, c.h);
          if (!c.open) { ctx.fillStyle = 'black'; ctx.font = 'bold 20px Arial'; ctx.fillText('?', c.x+15, c.y+25); }
      });
      enemies.forEach(e => drawEnemy(ctx, e));
      drawBoy(ctx, player);
      ctx.restore();
      
      // UI Hearts & Score
      for (let i = 0; i < livesRef.current; i++) drawHeart(ctx, 20 + i * 35, 20, 25);
      ctx.fillStyle = 'white'; ctx.font = 'bold 24px Arial'; 
      ctx.fillText(`Score: ${scoreRef.current}`, canvas.width - 150, 45);

      ctx.restore(); // End Screen Shake
    };

    const gameLoop = () => { update(); draw(); animationFrameId = requestAnimationFrame(gameLoop); };
    let animationFrameId = requestAnimationFrame(gameLoop);
    return () => { 
        cancelAnimationFrame(animationFrameId); 
        window.removeEventListener('keydown', handleKeyDown); 
        window.removeEventListener('keyup', handleKeyUp); 
        audioManager.stopMusic();
    };
  }, [gameStarted]);

  return (
    <div className="game-container">
      {!gameStarted && (
        <div className="start-overlay">
          <h1>NEON RUNNER</h1>
          <button className="start-btn" onClick={() => setGameStarted(true)}>START GAME</button>
          
          <div className="audio-toggle" onClick={() => setAudioEnabled(!audioEnabled)}>
            Audio: {audioEnabled ? '🔊 ON' : '🔇 OFF'}
          </div>

          <div className="controls-hint">
            <p>ARROWS to Move</p>
            <p>SPACE to Jump</p>
            <p>SHIFT to Roll</p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={800} height={600} />
      <div className="instructions">
        <h3>Game Juice: Synthwave Audio!</h3>
        <p>Added procedural synthwave music and sound effects using Web Audio API.</p>
        <p>Bop enemies, jump, and open chests to hear the feedback!</p>
      </div>
    </div>
  );
};

function App() { return ( <div className="App"> <GameCanvas /> </div> ); }
export default App;
