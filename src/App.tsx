import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { audioManager } from './AudioManager';
import type { Player, Enemy, Chest, Platform, Block, Particle, Prize, Fireball, EnemyProjectile, Level, Warp } from './types';
import { generateLevel, generateBonusRoom, getRandomPrize } from './LevelGenerator';
import { updatePlayer, updateEnemies, updatePrizes, updateFireballs, updateEnemyProjectiles, updateFirebars, rectIntersect } from './physics';
import * as Renderer from './renderer';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => {
      const saved = localStorage.getItem('neonRunnerAudio');
      return saved === null ? true : saved === 'true';
  });
  const [gameState, setGameState] = useState<'playing' | 'won' | 'gameover' | 'gameclear'>('playing');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(() => Number(localStorage.getItem('neonRunnerUnlockedLevel')) || 0);
  const [retryKey, setRetryKey] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('neonRunnerHighScore')) || 0);
  
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const gameStateRef = useRef<'playing' | 'won' | 'gameover' | 'gameclear'>('playing');


  const [isBonusRoom, setIsBonusRoom] = useState(false);
  const savedMainLevelRef = useRef<Level | null>(null);
  const savedPlayerPosRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!gameStarted) return;
    if (audioEnabled) audioManager.startMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI HD Canvas Setup
    const dpr = window.devicePixelRatio || 1;
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    canvas.style.width = `${GAME_WIDTH}px`;
    canvas.style.height = `${GAME_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    const gravity = 0.5;
    const jumpStrength = -10;
    const moveSpeed = 5;
    const rollSpeed = 10;
    const groundY = GAME_HEIGHT - 100;

    let level: Level;
    if (isBonusRoom) {
        level = generateBonusRoom(groundY);
    } else {
        level = savedMainLevelRef.current || generateLevel(currentLevel, groundY);
    }
    
    if (!level.prizes) level.prizes = [];
    if (!(level as any).fireballs) (level as any).fireballs = [];
    if (!(level as any).enemyProjectiles) (level as any).enemyProjectiles = [];

    const worldWidth = level.worldWidth;
    let enemies: Enemy[] = level.enemies;
    let chests: Chest[] = level.chests;
    let platforms: Platform[] = level.platforms;
    let blocks: Block[] = level.blocks;
    let prizes: Prize[] = level.prizes;
    let fireballs: Fireball[] = (level as any).fireballs;
    let enemyProjectiles: EnemyProjectile[] = (level as any).enemyProjectiles;
    
    gameStateRef.current = 'playing';
    setGameState('playing');

    let shakeTimer = 0;
    let shakeIntensity = 0;
    const startShake = (duration: number, intensity: number) => {
        shakeTimer = duration;
        shakeIntensity = intensity;
    };

    let particles: Particle[] = [];
    const createParticles = (x: number, y: number, color: string, count: number, speed: number = 2) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y, vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
          life: 1.0, maxLife: 0.02 + Math.random() * 0.05, color, size: 2 + Math.random() * 4
        });
      }
    };

    const grass = Array.from({ length: 100 }, () => ({
      x: Math.random() * worldWidth, y: groundY, size: 5 + Math.random() * 10
    }));

    let frameCount = 0;
    let cameraX = 0;
    let startX = 50;
    let startY = 100;
    if (isBonusRoom) {
        startX = 50; startY = 100;
    } else if (savedPlayerPosRef.current) {
        startX = savedPlayerPosRef.current.x;
        startY = savedPlayerPosRef.current.y;
    }

    const player: Player = {
      x: startX, y: startY, 
      width: 40, height: 60, vx: 0, vy: 0,
      isGrounded: false, isRolling: false, rollTimer: 0,
      invincibilityFrames: 0, speedBoostTimer: 0, jumpBoostTimer: 0, bigTimer: 0,
      giantTimer: 0, fireballTimer: 0, wingTimer: 0,
      facingRight: true, coyoteTimer: 0, jumpBufferTimer: 0, airJumpsLeft: 1, 
      isWallSliding: false
    };

    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.code] = true;
        if (e.code === 'ArrowRight') player.facingRight = true;
        if (e.code === 'ArrowLeft') player.facingRight = false;
        if (e.code === 'Space') player.jumpBufferTimer = 10;
        if (e.code === 'KeyF' && gameStateRef.current === 'playing' && player.fireballTimer <= 0) {
            fireballs.push({
                x: player.x + (player.facingRight ? player.width : -20),
                y: player.y + player.height / 2 - 10,
                vx: player.facingRight ? 10 : -10,
                vy: -2, w: 20, h: 20, active: true
            });
            player.fireballTimer = 180;
            if (audioEnabled) audioManager.playShoot();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => keys[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const onWarp = (warp: Warp) => {
        if (warp.target === 'bonus') {
            warp.used = true;
            (level as any).prizes = prizes;
            (level as any).fireballs = fireballs;
            (level as any).enemyProjectiles = enemyProjectiles;
            savedMainLevelRef.current = level;
            savedPlayerPosRef.current = { x: player.x, y: player.y };
            setIsBonusRoom(true);
            setRetryKey(prev => prev + 1);
        } else {
            if (savedPlayerPosRef.current) savedPlayerPosRef.current.x -= 100;
            setIsBonusRoom(false);
            setRetryKey(prev => prev + 1);
        }
    };

    const onPlayerDamage = () => {
        if (player.invincibilityFrames > 0 || player.giantTimer > 0) return;

        if (player.bigTimer > 0) {
            // Lose Big state instead of a life
            player.bigTimer = 0;
            player.invincibilityFrames = 60;
            createParticles(player.x + player.width/2, player.y + player.height/2, '#ff9999', 20, 4);
            startShake(15, 8);
            if (audioEnabled) audioManager.playDamage();
            return;
        }

        livesRef.current--;
        setLivesState(livesRef.current);
        player.invincibilityFrames = 60;
        createParticles(player.x + player.width/2, player.y + player.height/2, '#3498db', 10, 3);
        startShake(20, 10);
        if (audioEnabled) audioManager.playDamage();
        if (livesRef.current <= 0) {

            gameStateRef.current = 'gameover';
            setGameState('gameover');
            if (scoreRef.current > highScore) {
                setHighScore(scoreRef.current);
                localStorage.setItem('neonRunnerHighScore', scoreRef.current.toString());
            }
        }
    };

    const update = () => {
      if (gameStateRef.current !== 'playing') return;
      frameCount++;
      if (shakeTimer > 0) shakeTimer--;

      if (!isBonusRoom && player.x > worldWidth - 120) {
        gameStateRef.current = 'won';
        setGameState('won');
        const nextLevel = currentLevel + 1;
        if (nextLevel > unlockedLevel) {
            setUnlockedLevel(nextLevel);
            localStorage.setItem('neonRunnerUnlockedLevel', nextLevel.toString());
        }
        return;
      }

      updatePlayer(player, keys, level, gravity, jumpStrength, moveSpeed, rollSpeed, groundY, audioEnabled, createParticles, scoreRef, setScore, startShake, onWarp);
      updateFireballs(fireballs, enemies, blocks, platforms, groundY, gravity, cameraX, canvas.width, audioEnabled, createParticles, scoreRef, setScore, startShake);
      updateFirebars(level.firebars || [], player, onPlayerDamage);
      updateEnemyProjectiles(enemyProjectiles, player, cameraX, canvas.width, onPlayerDamage);
      updatePrizes(prizes, player, groundY, gravity, (prize) => {
          scoreRef.current += 500; setScore(scoreRef.current);
          createParticles(prize.x + 15, prize.y + 15, '#f1c40f', 20, 4);
          if (audioEnabled) audioManager.playChest();
          if (prize.type === 'bacon') player.bigTimer = 600;
          else if (prize.type === 'burger') { player.giantTimer = 600; startShake(20, 10); }
          else if (prize.type === 'wing') player.wingTimer = 600;
          else if (prize.type === 'carrot') { livesRef.current++; }

          else if (prize.type === 'shoes') player.speedBoostTimer = 600;
          else if (prize.type === 'spring') player.jumpBoostTimer = 600;
      });

      if (player.isRolling && frameCount % 2 === 0) createParticles(player.x + player.width/2, groundY, '#7d5c34', 2, 1);
      updateEnemies(enemies, player, enemyProjectiles, groundY, gravity, frameCount, audioEnabled, createParticles, scoreRef, setScore, startShake, onPlayerDamage);

      chests.forEach(chest => {
          if (!chest.open && rectIntersect(player, chest)) {
              chest.open = true; 
              scoreRef.current += 100; setScore(scoreRef.current);
              createParticles(chest.x + 20, chest.y + 20, '#f1c40f', 15, 4);
              startShake(10, 3);
              if (audioEnabled) audioManager.playChest();
              prizes.push({
                  x: chest.x + 5, y: chest.y - 20,
                  w: 30, h: 30, vx: (Math.random() - 0.5) * 2, vy: -5,
                  type: getRandomPrize(), collected: false
              });
              if (chest.type === 'health') { livesRef.current++; }

              else if (chest.type === 'speed') player.speedBoostTimer = 300;
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
      ctx.save();
      if (shakeTimer > 0) ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
      Renderer.drawBackground(ctx, canvas, cameraX, groundY, level.bgLayers, level.waterLevel);
      ctx.save(); ctx.translate(-cameraX, 0);
      // HD Ground
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, GAME_HEIGHT);
      groundGrad.addColorStop(0, isBonusRoom ? '#1a252c' : '#5c4033');
      groundGrad.addColorStop(1, isBonusRoom ? '#0f171e' : '#3a2818');
      ctx.fillStyle = groundGrad; 
      ctx.fillRect(0, groundY, worldWidth, GAME_HEIGHT - groundY);

      const grassGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 10);
      grassGrad.addColorStop(0, isBonusRoom ? '#00e5e5' : '#2ecc71');
      grassGrad.addColorStop(1, isBonusRoom ? '#008b8b' : '#27ae60');
      ctx.fillStyle = grassGrad; 
      ctx.fillRect(0, groundY, worldWidth, 10);

      if (!isBonusRoom) grass.forEach(g => { 
          ctx.fillStyle = '#27ae60'; 
          ctx.fillRect(g.x, g.y - g.size, 4, g.size); 
      });

      if (!isBonusRoom) {
          // HD Flag
          const poleGrad = ctx.createLinearGradient(worldWidth - 100, 0, worldWidth - 90, 0);
          poleGrad.addColorStop(0, '#7f8c8d'); poleGrad.addColorStop(0.5, '#bdc3c7'); poleGrad.addColorStop(1, '#2c3e50');
          ctx.fillStyle = poleGrad; ctx.fillRect(worldWidth - 100, groundY - 150, 10, 150);

          ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(worldWidth - 100, groundY - 150);
          ctx.lineTo(worldWidth - 40, groundY - 120); ctx.lineTo(worldWidth - 100, groundY - 90); ctx.fill();
          ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2; ctx.stroke();
      }

      Renderer.drawWarps(ctx, level.warps || []);
      particles.forEach(p => { ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, p.size, p.size); });
      ctx.globalAlpha = 1.0;

      chests.forEach(c => {
          // HD Chest
          const chestGrad = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.h);
          chestGrad.addColorStop(0, c.open ? '#6b3e1b' : '#f1c40f');
          chestGrad.addColorStop(1, c.open ? '#3e2009' : '#d35400');
          ctx.fillStyle = chestGrad; 
          ctx.fillRect(c.x, c.y, c.w, c.h);

          ctx.strokeStyle = c.open ? '#2e1505' : '#f39c12';
          ctx.lineWidth = 3;
          ctx.strokeRect(c.x, c.y, c.w, c.h);

          if (!c.open) { 
              ctx.fillStyle = 'white'; 
              ctx.font = 'bold 20px Arial'; 
              ctx.shadowBlur = 5; ctx.shadowColor = 'black';
              ctx.fillText('?', c.x+15, c.y+25); 
              ctx.shadowBlur = 0;
          }
      });

      platforms.forEach(p => {
          // HD Platform
          const platGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
          platGrad.addColorStop(0, isBonusRoom ? '#00ffff' : '#bdc3c7');
          platGrad.addColorStop(1, isBonusRoom ? '#008b8b' : '#7f8c8d');
          ctx.fillStyle = platGrad; 
          ctx.fillRect(p.x, p.y, p.w, p.h);

          ctx.strokeStyle = isBonusRoom ? '#ffffff' : '#ecf0f1'; 
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          // Rivets
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath(); ctx.arc(p.x + 5, p.y + p.h/2, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(p.x + p.w - 5, p.y + p.h/2, 2, 0, Math.PI*2); ctx.fill();
      });

      blocks.forEach(b => {
          // HD Block
          const blockGrad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
          blockGrad.addColorStop(0, b.hit ? '#bdc3c7' : '#f1c40f');
          blockGrad.addColorStop(1, b.hit ? '#7f8c8d' : '#e67e22');
          ctx.fillStyle = blockGrad; 
          ctx.fillRect(b.x, b.y, b.w, b.h);

          // Bevel effect
          ctx.strokeStyle = b.hit ? '#ecf0f1' : '#f39c12'; 
          ctx.lineWidth = 3; 
          ctx.strokeRect(b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3);

          if (!b.hit) { 
              ctx.fillStyle = 'white'; 
              ctx.font = 'bold 30px Arial'; 
              ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0,0,0,0.5)';
              ctx.fillText('$', b.x+10, b.y+32); 
              ctx.shadowBlur = 0;
          }
      });

      Renderer.drawPrizes(ctx, prizes);
      Renderer.drawFireballs(ctx, fireballs);
      Renderer.drawFirebars(ctx, level.firebars || []);
      Renderer.drawEnemyProjectiles(ctx, enemyProjectiles);
      enemies.forEach(e => Renderer.drawEnemy(ctx, e, frameCount));
      Renderer.drawBoy(ctx, player, frameCount, level.waterLevel !== undefined && player.y + player.height/2 > level.waterLevel);
      ctx.restore();

      for (let i = 0; i < livesRef.current; i++) Renderer.drawHeart(ctx, 20 + i * 35, 20, 25);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(20, 60, 100, 10);
      if (player.fireballTimer <= 0) {
          ctx.fillStyle = '#e67e22'; ctx.shadowBlur = 10; ctx.shadowColor = '#e67e22';
          ctx.fillRect(20, 60, 100, 10);
          ctx.fillStyle = 'white'; ctx.font = 'bold 12px Arial'; ctx.fillText('FIREBALL READY (F)', 20, 85);
      } else {
          ctx.fillStyle = '#555';
          ctx.fillRect(20, 60, 100 * (1 - player.fireballTimer / 180), 10);
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white'; ctx.font = 'bold 24px Arial'; 
      ctx.fillText(`Score: ${scoreRef.current}`, GAME_WIDTH - 150, 45);
      if (!isBonusRoom) ctx.fillText(`Level: ${currentLevel + 1}`, GAME_WIDTH - 150, 80);
      else {
          ctx.fillStyle = '#bf5af2'; ctx.shadowBlur = 10; ctx.shadowColor = '#bf5af2';
          ctx.fillText('BONUS ROOM', GAME_WIDTH - 180, 80);
      }

      ctx.restore();
    };

    const gameLoop = () => { update(); draw(); animationFrameId = requestAnimationFrame(gameLoop); };
    let animationFrameId = requestAnimationFrame(gameLoop);
    return () => { 
        cancelAnimationFrame(animationFrameId); 
        window.removeEventListener('keydown', handleKeyDown); 
        window.removeEventListener('keyup', handleKeyUp); 
        audioManager.stopMusic();
    };
  }, [gameStarted, currentLevel, retryKey, isBonusRoom]);

  const resetGame = () => {
      livesRef.current = 3;
      scoreRef.current = 0; setScore(0);

      setIsBonusRoom(false);
      savedMainLevelRef.current = null;
      savedPlayerPosRef.current = null;
      setRetryKey(prev => prev + 1);
      setGameState('playing');
  };

  const nextLevel = () => {
      setCurrentLevel(prev => prev + 1);
      setIsBonusRoom(false);
      savedMainLevelRef.current = null;
      savedPlayerPosRef.current = null;
      setGameState('playing');
  };

  return (
    <div className="game-container">
      {!gameStarted && !isLoading && (
        <div className="start-overlay">
          <h1>NEON RUNNER</h1>
          <button className="start-btn" onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                  setIsLoading(false);
                  setGameStarted(true);
              }, 5000);
          }}>START GAME</button>
          <div className="high-score">HIGH SCORE: {highScore}</div>
          <div className="level-select">
              <p>SELECT STARTING LEVEL</p>
              <div className="level-buttons">
                  {[0, 1, 2, 3, 4].map((i) => (
                      <button key={i} className={`lvl-btn ${currentLevel === i ? 'active' : ''} ${i > unlockedLevel ? 'locked' : ''}`}
                          onClick={() => i <= unlockedLevel && setCurrentLevel(i)} disabled={i > unlockedLevel}>
                          {i + 1} {i > unlockedLevel ? '🔒' : ''}
                      </button>
                  ))}
              </div>
          </div>
          <div className="audio-toggle" onClick={() => {
              const newState = !audioEnabled; setAudioEnabled(newState);
              localStorage.setItem('neonRunnerAudio', newState.toString());
          }}>Audio: {audioEnabled ? '🔊 ON' : '🔇 OFF'}</div>
          <div className="controls-hint">
            <p>ARROWS to Move | SPACE to Jump | SHIFT to Roll | F to SHOOT</p>
          </div>
        </div>
      )}

      {isLoading && (
          <div className="loading-overlay">
              <div className="n64-container">
                  <div className="n64-logo-3d">
                      <div className="n-bar pillar p1">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar pillar p2">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar pillar p3">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar pillar p4">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar diag d1">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar diag d2">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar diag d3">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                      <div className="n-bar diag d4">
                          <div className="f top"></div><div className="f bottom"></div>
                          <div className="f front"></div><div className="f back"></div>
                          <div className="f side-left"></div><div className="f side-right"></div>
                      </div>
                  </div>
              </div>
              <div className="loading-text">POWERING UP...</div>
          </div>
      )}

      <canvas ref={canvasRef} width={800} height={600} />

      {gameState === 'won' && (
          <div className="state-overlay victory">
              <h1>LEVEL {currentLevel + 1} CLEAR!</h1>
              <p>Score: {score}</p>
              <button className="start-btn" onClick={nextLevel}>NEXT LEVEL</button>
          </div>
      )}

      {gameState === 'gameover' && (
          <div className="state-overlay gameover">
              <h1>GAME OVER</h1>
              <p>Score: {score}</p>
              <div className="high-score-mini">High Score: {highScore}</div>
              <button className="start-btn" onClick={resetGame}>RETRY</button>
          </div>
      )}

      {gameState === 'gameclear' && (
          <div className="state-overlay gameclear">
              <h1>NEON CHAMPION</h1>
              <p>YOU CLEARED ALL LEVELS!</p>
              <div className="final-stats">
                  <div>Final Score: {score}</div>
                  <div>High Score: {highScore}</div>
              </div>
              <button className="start-btn" onClick={() => {
                  livesRef.current = 3;
                  scoreRef.current = 0; setScore(0);

                  setCurrentLevel(0);
                  setRetryKey(prev => prev + 1);
                  setGameState('playing');
              }}>PLAY AGAIN</button>
          </div>
      )}

      <div className="instructions">
        <h3>Wings Added!</h3>
        <p>Find the Wing power-up to fly for 10 seconds. Press Jump to flap!</p>
        <p>Bacon: Get Big! | Burger: Giantic! | Carrot: Life!</p>
      </div>
    </div>
  );
};

function App() { return ( <div className="App"> <GameCanvas /> </div> ); }
export default App;
