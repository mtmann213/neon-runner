import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { audioManager } from './AudioManager';
import type { Player, Enemy, Chest, Platform, Block, Particle, Prize, Fireball, Laser, EnemyProjectile, Level, Warp, Switch, LaserGate, Spring } from './types';
import { generateLevel, generateBonusRoom, getRandomPrize } from './LevelGenerator';
import { updatePlayer, updateEnemies, updatePrizes, updateFireballs, updateEnemyProjectiles, updateFirebars, updateMovingPlatforms, updateLasers, rectIntersect } from './physics';
import * as Renderer from './renderer';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shards, setShards] = useState(() => Number(localStorage.getItem('neonRunnerShards')) || 0);
  const [upgrades, setUpgrades] = useState(() => {
      const saved = localStorage.getItem('neonRunnerUpgrades');
      return saved ? JSON.parse(saved) : { extraHearts: 0, cooldownReduc: 0, shardBonus: 0 };
  });
  const [lives, setLives] = useState(3 + upgrades.extraHearts);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => {
      const saved = localStorage.getItem('neonRunnerAudio');
      return saved === null ? true : saved === 'true';
  });
  const [masterVol, setMasterVol] = useState(() => Number(localStorage.getItem('neonRunnerMasterVol')) || 0.7);
  const [musicVol, setMusicVol] = useState(() => Number(localStorage.getItem('neonRunnerMusicVol')) || 0.5);
  const [sfxVol, setSfxVol] = useState(() => Number(localStorage.getItem('neonRunnerSfxVol')) || 0.8);

  const [gameState, setGameState] = useState<'playing' | 'won' | 'gameover' | 'gameclear' | 'boss_intro'>('playing');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(() => Number(localStorage.getItem('neonRunnerUnlockedLevel')) || 0);
  const [retryKey, setRetryKey] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('neonRunnerHighScore')) || 0);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [isAgentPlaying, setIsAgentPlaying] = useState(false);
  const [agentFeedback, setAgentFeedback] = useState<string[]>([]);
  
  const scoreRef = useRef(0);
  const livesRef = useRef(3 + upgrades.extraHearts);
  const shardsRef = useRef(shards);
  const gameStateRef = useRef<'playing' | 'won' | 'gameover' | 'gameclear' | 'boss_intro'>('playing');

  const [isBonusRoom, setIsBonusRoom] = useState(false);
  const savedMainLevelRef = useRef<Level | null>(null);
  const savedPlayerPosRef = useRef<{x: number, y: number} | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
      audioManager.setMasterVolume(audioEnabled ? masterVol : 0);
      audioManager.setMusicVolume(musicVol);
      audioManager.setSfxVolume(sfxVol);
  }, [audioEnabled, masterVol, musicVol, sfxVol]);

  useEffect(() => {
    if (!gameStarted) return;
    if (audioEnabled) audioManager.startMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    if (!(level as any).lasers) (level as any).lasers = [];

    const worldWidth = level.worldWidth;
    let enemies: Enemy[] = level.enemies;
    let chests: Chest[] = level.chests;
    let platforms: Platform[] = level.platforms;
    let blocks: Block[] = level.blocks;
    let prizes: Prize[] = level.prizes;
    let fireballs: Fireball[] = (level as any).fireballs;
    let enemyProjectiles: EnemyProjectile[] = (level as any).enemyProjectiles;
    let lasers: Laser[] = (level as any).lasers;
    let springs: Spring[] = level.springs || [];
    
    gameStateRef.current = 'playing';
    setGameState('playing');

    let shakeTimer = 0;
    let shakeIntensity = 0;
    let hitStopTimer = 0;
    const startShake = (duration: number, intensity: number) => {
        shakeTimer = duration;
        shakeIntensity = intensity;
        if (intensity >= 5) hitStopTimer = Math.min(5, Math.floor(intensity / 2));
    };

    let particles: Particle[] = [];
    const addFeedback = (msg: string) => {
        setAgentFeedback(prev => [msg, ...prev].slice(0, 5));
    };

    const autoPlayAI = (player: Player, level: Level, enemies: Enemy[], keys: any) => {
        // AI State for humanization
        if (!(player as any).aiState) (player as any).aiState = { reactionBuffer: [], lastActionFrame: 0 };
        const ai = (player as any).aiState;

        keys['ArrowRight'] = false; keys['ArrowLeft'] = false; 
        keys['ArrowDown'] = false; keys['Space'] = false; 
        keys['ShiftLeft'] = false; keys['KeyF'] = false; keys['KeyC'] = false;

        keys['ArrowRight'] = true;
        
        // --- 1. SENSING (Delayed) ---
        const aheadX = player.x + player.width + 120;
        const currentGround = level.groundSegments?.find(seg => player.x >= seg.x && player.x <= seg.x + seg.w);
        const aheadGround = level.groundSegments?.find(seg => aheadX >= seg.x && aheadX <= seg.x + seg.w);
        
        const groundAhead = aheadGround !== undefined;
        const lavaAhead = level.lavaPools?.some(pool => player.x + player.width + 250 > pool.x && player.x < pool.x + pool.w);
        const wallInFace = level.blocks.some(b => b.x > player.x && b.x - player.x < 50 && player.y + player.height > b.y && player.y < b.y + b.h);
        const springUnder = level.springs?.some(s => Math.abs(s.x - player.x) < 50 && Math.abs(s.y - (player.y + player.height)) < 20);

        if (springUnder) addFeedback("Spring jump boost!");
        
        const heightDifference = (aheadGround?.y ?? 1000) - (currentGround?.y ?? groundY);

        // --- 2. REACTION DELAY ---
        // Store current needs in a buffer to simulate 100ms (6 frame) reaction time
        const needsJump = !groundAhead || lavaAhead || wallInFace || heightDifference < -40;
        ai.reactionBuffer.push(needsJump);
        if (ai.reactionBuffer.length > 6) ai.reactionBuffer.shift();
        const delayedNeedsJump = ai.reactionBuffer[0];

        // --- 3. STYLISH NAVIGATION ---
        if (player.isWallSliding) {
            keys['Space'] = true; player.jumpBufferTimer = 5;
            if (frameCount % 30 === 0) addFeedback("Wall Kick executed");
        }

        const canGrapple = level.blocks.some(b => b.y < player.y - 80 && Math.abs(b.x - player.x) < 400) || 
                           enemies.some(e => e.alive && e.y < player.y - 80 && Math.abs(e.x - player.x) < 400);
        
        if (delayedNeedsJump) {
            if (canGrapple && player.vy >= -2 && !player.isGrounded) {
                keys['KeyC'] = true;
                if (frameCount % 20 === 0) addFeedback("Grapple Sling maneuver");
            } else {
                if (player.isGrounded) {
                    keys['Space'] = true; player.jumpBufferTimer = 5;
                    if (frameCount % 60 === 0) addFeedback("Climbing Jump");
                } else if (player.airJumpsLeft > 0 && player.vy > 0) {
                    keys['Space'] = true; player.jumpBufferTimer = 5;
                } else if (player.wingTimer > 0 && frameCount % 12 === 0) {
                    keys['Space'] = true;
                }
            }
        }

        // PANIC DOUBLE JUMP
        if (!player.isGrounded && player.vy > 5 && !groundAhead && player.airJumpsLeft > 0 && Math.random() > 0.95) {
            keys['Space'] = true; player.jumpBufferTimer = 5;
            addFeedback("Panic Recovery Jump!");
        }

        if (player.isGrounded && !wallInFace && player.dashCooldown <= 0 && player.vx > 2) {
            keys['ShiftLeft'] = true;
            if (frameCount % 60 === 0) addFeedback("Wavedash speed-boost");
        }

        const nearbyEnemy = enemies.find(e => e.alive && Math.abs(e.x - player.x) < 600);
        if (nearbyEnemy) {
            if (player.laserTimer > 0 || player.fireballTimer <= 0) keys['KeyF'] = true;
            if (!player.isGrounded && Math.abs(nearbyEnemy.x - player.x) < 100 && nearbyEnemy.y > player.y + 50) {
                if (player.dashCooldown <= 0 && Math.abs(nearbyEnemy.x - player.x) > 40) {
                    keys['ShiftLeft'] = true;
                } else {
                    keys['ArrowDown'] = true;
                    if (frameCount % 60 === 0) addFeedback("Ground Pound Elimination");
                }
            }
        }

        const dangerousProjectile = enemyProjectiles?.find(p => p.active && Math.abs(p.x - player.x) < 300 && Math.abs(p.y - player.y) < 200);
        if (dangerousProjectile && player.dashCooldown <= 0) {
            keys['ShiftLeft'] = true;
            if (frameCount % 60 === 0) addFeedback("Evasive Dash maneuver");
        }

        if (player.stats.combo >= 5 && !player.isGrounded && player.vy > 0 && !keys['KeyC'] && !keys['Space']) {
            keys['ArrowDown'] = true;
        }
    };

    const createParticles = (x: number, y: number, color: string, count: number, speed: number = 2, bounce: number = 0) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * speed * 2,
          vy: (Math.random() - 0.5) * speed * 2,
          life: 1.0, maxLife: 0.02 + Math.random() * 0.03,
          color, size: Math.random() * 4 + 2,
          bounce: bounce > 0 ? bounce + Math.random() * 0.2 : 0
        });
      }
    };

    const grass = Array.from({ length: 100 }, () => ({
      x: Math.random() * worldWidth, y: groundY, size: 5 + Math.random() * 10
    }));

    let frameCount = 0;
    let cameraX = 0;
    let cameraY = 0;
    let cameraScale = 1.0;
    let startX = 50;
    let startY = 100;
    if (isBonusRoom) {
        startX = 50; startY = 100;
    } else if (savedPlayerPosRef.current) {
        startX = savedPlayerPosRef.current.x;
        startY = savedPlayerPosRef.current.y;
    }

    const player: Player = playerRef.current ? {
      ...playerRef.current,
      x: startX, y: startY, vx: 0, vy: 0, isGrounded: false,
      stats: { ...playerRef.current.stats, combo: 0 }
    } : {
      x: startX, y: startY, 
      width: 40, height: 60, vx: 0, vy: 0,
      isGrounded: false, isRolling: false, isGroundPounding: false, grapple: null, rollTimer: 0,
      invincibilityFrames: 0, speedBoostTimer: 0, jumpBoostTimer: 0, bigTimer: 0,
      giantTimer: 0, fireballTimer: 0, laserTimer: 0, dashCooldown: 0, wingTimer: 0,
      magnetTimer: 0, bopCooldown: 0, overdriveTimer: 0, shieldActive: false, dashesSinceGround: 0,
      facingRight: true, coyoteTimer: 0, jumpBufferTimer: 0, airJumpsLeft: 1, 
      isWallSliding: false, trail: [],
      stats: { shardsCollected: 0, enemiesDefeated: 0, timeTaken: 0, combo: 0, maxCombo: 0 }
    };
    playerRef.current = player;

    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.code] = true;
        if (e.code === 'ArrowRight') player.facingRight = true;
        if (e.code === 'ArrowLeft') player.facingRight = false;
        if (e.code === 'Space') player.jumpBufferTimer = 10;
        if (e.code === 'KeyF' && gameStateRef.current === 'playing') {
            if (player.laserTimer > 0) {
                lasers.push({
                    x: player.facingRight ? player.x + player.width : player.x - 400,
                    y: player.y + player.height / 2 - 5,
                    w: 400, h: 10, active: true, facingRight: player.facingRight, life: 10
                });
                if (audioEnabled) audioManager.playShoot();
            } else if (player.fireballTimer <= 0) {
                fireballs.push({
                    x: player.x + (player.facingRight ? player.width : -20),
                    y: player.y + player.height / 2 - 10,
                    vx: player.facingRight ? 10 : -10,
                    vy: -2, w: 20, h: 20, active: true
                });
                player.fireballTimer = 180 - (upgrades.cooldownReduc * 30);
                if (audioEnabled) audioManager.playShoot();
            }
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
        if (player.invincibilityFrames > 0 || player.giantTimer > 0 || player.overdriveTimer > 0) return;
        if (player.shieldActive) {
            player.shieldActive = false; player.invincibilityFrames = 60;
            createParticles(player.x + player.width/2, player.y + player.height/2, '#bf5af2', 20, 5);
            startShake(10, 5); if (audioEnabled) audioManager.playPowerUp();
            return;
        }
        if (player.bigTimer > 0) {
            player.bigTimer = 0; player.invincibilityFrames = 60;
            createParticles(player.x + player.width/2, player.y + player.height/2, '#ff9999', 20, 4);
            startShake(15, 8); if (audioEnabled) audioManager.playDamage();
            return;
        }
        livesRef.current--; setLives(() => livesRef.current);
        player.invincibilityFrames = 60;
        createParticles(player.x + player.width/2, player.y + player.height/2, '#3498db', 10, 3);
        startShake(20, 10); if (audioEnabled) audioManager.playDamage();
        if (livesRef.current <= 0) {
            if (isBonusRoom) {
                const startLives = 3 + upgrades.extraHearts;
                livesRef.current = startLives; setLives(startLives);
                setIsBonusRoom(false);
                setAchievement('KICKED FROM BONUS ROOM!');
                setTimeout(() => setAchievement(null), 3000);
                return;
            }
            if (savedPlayerPosRef.current) {
                const startLives = 3 + upgrades.extraHearts;
                livesRef.current = startLives; setLives(startLives);
                player.x = savedPlayerPosRef.current.x; player.y = savedPlayerPosRef.current.y;
                player.vx = 0; player.vy = 0; player.invincibilityFrames = 120;
                setAchievement('RESPAWNED AT CHECKPOINT');
                setTimeout(() => setAchievement(null), 3000);
                return;
            }
            gameStateRef.current = 'gameover'; setGameState('gameover');
            if (scoreRef.current > highScore) { setHighScore(scoreRef.current); localStorage.setItem('neonRunnerHighScore', scoreRef.current.toString()); }
        } else if (isBonusRoom) {
            // Respawn at start of bonus room if fell off/died
            player.x = 50; player.y = 100; player.vx = 0; player.vy = 0;
        }
    };

    const update = () => {
      if (hitStopTimer > 0) { hitStopTimer--; return; }
      if (isAgentPlaying) autoPlayAI(player, level, enemies, keys);
      if (gameStateRef.current !== 'playing') return;
      frameCount++; player.stats.timeTaken++;
      if (shakeTimer > 0) shakeTimer--;

      const boss = enemies.find(e => e.type === 'boss' || (e.type === 'centipede' && e.segmentIndex === 0));
      if (boss && boss.x - player.x < 600 && !(boss as any).introDone) {
          (boss as any).introDone = true; 
          startShake(20, 10); 
      }

      if (!isBonusRoom && player.x > worldWidth - 120) {
        gameStateRef.current = 'won'; setGameState('won');
        if (audioEnabled) audioManager.playLevelClear();
        const nextLevel = currentLevel + 1;
        if (nextLevel > unlockedLevel) { setUnlockedLevel(nextLevel); localStorage.setItem('neonRunnerUnlockedLevel', nextLevel.toString()); }
        return;
      }

      if (player.y > groundY + 800) {
          onPlayerDamage();
          if (gameStateRef.current !== 'playing') return;
          player.y = savedPlayerPosRef.current ? savedPlayerPosRef.current.y : 100;
          player.x = savedPlayerPosRef.current ? savedPlayerPosRef.current.x : 50;
          player.vy = 0; player.vx = 0;
      }

      level.checkpoints?.forEach(cp => {
          if (Math.abs(player.x - cp.x) < 60 && Math.abs((player.y + player.height) - cp.y) < 100) {
              if (!cp.active) {
                  cp.active = true; savedPlayerPosRef.current = { x: cp.x, y: cp.y - 100 };
                  createParticles(cp.x, cp.y, '#00ffff', 30, 5); if (audioEnabled) audioManager.playPowerUp();
                  setAchievement('CHECKPOINT ACTIVATED!'); setTimeout(() => setAchievement(null), 3000);
              }
          }
      });

      if (player.stats.dashesSinceGround >= 3 && !localStorage.getItem('neonRunnerAch_Dash')) {
          localStorage.setItem('neonRunnerAch_Dash', 'true');
          setAchievement('🏆 ACHIEVEMENT: Air Dash Master!'); setTimeout(() => setAchievement(null), 4000);
      }
      if (player.stats.combo >= 8 && player.overdriveTimer <= 0) {
          player.stats.combo = 0; player.overdriveTimer = 300;
          setAchievement('🔥 OVERDRIVE MODE! 🔥'); setTimeout(() => setAchievement(null), 3000);
          if (audioEnabled) {
              audioManager.playPowerUp();
              audioManager.setOverdriveMode(true);
          }
      }
      
      if (player.overdriveTimer === 1) {
          if (audioEnabled) audioManager.setOverdriveMode(false);
      }

      updateMovingPlatforms(level.movingPlatforms || [], level.switches || [], frameCount);
      updateLasers(lasers, enemies, player, blocks, scoreRef, setScore, createParticles, startShake, audioEnabled);
      updatePlayer(player, keys, level, gravity, jumpStrength, moveSpeed, rollSpeed, groundY, audioEnabled, createParticles, scoreRef, setScore, startShake, onPlayerDamage, onWarp, frameCount);
      updateFireballs(fireballs, enemies, player, blocks, platforms, level.movingPlatforms || [], groundY, gravity, cameraX, canvas.width, audioEnabled, createParticles, scoreRef, setScore, startShake);
      updateFirebars(level.firebars || [], player, onPlayerDamage);
      updateEnemyProjectiles(enemyProjectiles, player, cameraX, canvas.width, onPlayerDamage);
      updatePrizes(prizes, player, groundY, gravity, (prize) => {
          scoreRef.current += 500; setScore(scoreRef.current);
          createParticles(prize.x + 15, prize.y + 15, '#f1c40f', 20, 4);
          if (audioEnabled) audioManager.playChest();
          if (audioEnabled) audioManager.playPowerUp();
          if (prize.type === 'bacon') player.bigTimer = 600;
          else if (prize.type === 'burger') { player.giantTimer = 600; startShake(20, 10); }
          else if (prize.type === 'wing') player.wingTimer = 600;
          else if (prize.type === 'carrot') { livesRef.current++; setLives(() => livesRef.current); }
          else if (prize.type === 'shoes') player.speedBoostTimer = 600;
          else if (prize.type === 'spring') player.jumpBoostTimer = 600;
          else if (prize.type === 'laser') player.laserTimer = 600;
          else if (prize.type === 'shield') player.shieldActive = true;
          else if (prize.type === 'magnet') player.magnetTimer = 600;
          else if (prize.type === 'shard') {
              const val = 10 * (1 + upgrades.shardBonus);
              shardsRef.current += val; player.stats.shardsCollected++;
              setShards(shardsRef.current); localStorage.setItem('neonRunnerShards', shardsRef.current.toString());
          }
      });

      if (player.isRolling && frameCount % 2 === 0) createParticles(player.x + player.width/2, groundY, '#7d5c34', 2, 1);
      updateEnemies(enemies, player, enemyProjectiles, groundY, gravity, frameCount, audioEnabled, createParticles, scoreRef, setScore, startShake, onPlayerDamage);

      chests.forEach(chest => {
          if (!chest.open && rectIntersect(player, chest)) {
              chest.open = true; scoreRef.current += 100; setScore(scoreRef.current);
              createParticles(chest.x + 20, chest.y + 20, '#f1c40f', 15, 4);
              startShake(10, 3); if (audioEnabled) audioManager.playChest();
              prizes.push({ x: chest.x + 5, y: chest.y - 20, w: 30, h: 30, vx: (Math.random() - 0.5) * 2, vy: -5, type: getRandomPrize(), collected: false });
              if (chest.type === 'health') { livesRef.current++; setLives(() => livesRef.current); }
              else if (chest.type === 'speed') player.speedBoostTimer = 300;
          }
      });

      if (level.laserGates && level.switches) {
          level.laserGates.forEach(gate => {
              const sw = level.switches!.find(s => s.id === `switch_${gate.id.split('_')[1]}`);
              if ((sw ? !sw.active : gate.active) && rectIntersect(player, gate)) { onPlayerDamage(); player.vy = 5; player.vx = player.x < gate.x ? -10 : 10; }
          });
      }

      particles.forEach(p => { 
          p.vy += 0.5; p.x += p.vx; p.y += p.vy; p.life -= p.maxLife; 
          if (p.y > groundY && p.bounce) { p.y = groundY; p.vy *= -p.bounce; p.vx *= 0.8; }
      });
      particles = particles.filter(p => p.life > 0);

      const lookAheadX = Math.max(-100, Math.min(player.vx * 15, 150));
      let targetCameraX = player.x + lookAheadX - GAME_WIDTH / 2;
      if (targetCameraX < 0) targetCameraX = 0;
      if (targetCameraX > worldWidth - GAME_WIDTH) targetCameraX = worldWidth - GAME_WIDTH;
      cameraX += (targetCameraX - cameraX) * 0.05;
      
      let targetCameraY = 0;
      if (player.y < GAME_HEIGHT * 0.3) targetCameraY = player.y - GAME_HEIGHT * 0.3;
      else if (player.y > GAME_HEIGHT * 0.7) targetCameraY = player.y - GAME_HEIGHT * 0.7;
      
      cameraY += (targetCameraY - cameraY) * 0.05;
      
      if (cameraY < -1000) cameraY = -1000;
      if (cameraY > 500) cameraY = 500;

      cameraScale += ((player.giantTimer > 0 ? 0.5 : 1.0) - cameraScale) * 0.05;
      if (frameCount % 10 === 0) setLives(() => livesRef.current);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save(); // Save 1: Shake
      if (shakeTimer > 0) ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
      ctx.save(); // Scale
      ctx.translate(GAME_WIDTH/2, GAME_HEIGHT/2); ctx.scale(cameraScale, cameraScale); ctx.translate(-GAME_WIDTH/2, -GAME_HEIGHT/2);

      const gridColors = ['#00ffff', '#00ff00', '#ff0000', '#ffffff', '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff', '#ff4500', '#00ced1', '#888888'];
      const pulse = 0.1 + Math.sin(frameCount * 0.05) * 0.05;
      Renderer.drawGrid(ctx, cameraX * 0.5, cameraY * 0.5, gridColors[currentLevel % 12]);
      ctx.save(); ctx.globalAlpha = pulse; ctx.globalCompositeOperation = 'screen';
      Renderer.drawGrid(ctx, cameraX * 0.5, cameraY * 0.5, '#fff');
      ctx.restore();

      Renderer.drawBackground(ctx, canvas, cameraX, groundY, level.bgLayers, level.waterLevel);

      ctx.save(); // Save 3: World Translation
      ctx.translate(-cameraX, -cameraY);

      if (level.groundSegments) {
          level.groundSegments.forEach(seg => {
              if (seg.destroyed) return;
              ctx.fillStyle = Renderer.getTexture(ctx, 'dirt') || '#5c4033'; ctx.fillRect(seg.x, seg.y, seg.w, seg.h + 1000);
              ctx.fillStyle = Renderer.getTexture(ctx, 'grass') || '#2ecc71'; ctx.fillRect(seg.x, seg.y, seg.w, 10);
              
              if (seg.cracked) {
                  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
                  ctx.beginPath();
                  for(let i=0; i<5; i++) {
                      ctx.moveTo(seg.x + Math.random()*seg.w, seg.y);
                      ctx.lineTo(seg.x + Math.random()*seg.w, seg.y + 20 + Math.random()*30);
                  }
                  ctx.stroke();
              }
          });
      }
      if (!isBonusRoom) grass.forEach(g => { 
          const currentSeg = level.groundSegments?.find(seg => g.x >= seg.x && g.x <= seg.x + seg.w);
          if (currentSeg) {
              ctx.fillStyle = '#27ae60'; ctx.fillRect(g.x, currentSeg.y - g.size, 4, g.size); 
          }
      });

      if (!isBonusRoom) {
          const poleGrad = ctx.createLinearGradient(worldWidth - 100, 0, worldWidth - 90, 0);
          poleGrad.addColorStop(0, '#7f8c8d'); poleGrad.addColorStop(0.5, '#bdc3c7'); poleGrad.addColorStop(1, '#2c3e50');
          ctx.fillStyle = poleGrad; ctx.fillRect(worldWidth - 100, groundY - 150, 10, 150);
          ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(worldWidth - 100, groundY - 150);
          ctx.lineTo(worldWidth - 40, groundY - 120); ctx.lineTo(worldWidth - 100, groundY - 90); ctx.fill();
      }

      Renderer.drawWarps(ctx, level.warps || []);
      if (level.checkpoints) Renderer.drawCheckpoints(ctx, level.checkpoints, frameCount);
      Renderer.drawSprings(ctx, springs);
      particles.forEach(p => { ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, p.size, p.size); });
      ctx.globalAlpha = 1.0;

      chests.forEach(c => {
          const chestGrad = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.h);
          chestGrad.addColorStop(0, c.open ? '#6b3e1b' : '#f1c40f'); chestGrad.addColorStop(1, c.open ? '#3e2009' : '#d35400');
          ctx.fillStyle = chestGrad; ctx.fillRect(c.x, c.y, c.w, c.h);
          ctx.strokeStyle = c.open ? '#2e1505' : '#f39c12'; ctx.lineWidth = 3; ctx.strokeRect(c.x, c.y, c.w, c.h);
      });

      platforms.forEach(p => { ctx.fillStyle = Renderer.getTexture(ctx, 'stone') || '#bdc3c7'; ctx.fillRect(p.x, p.y, p.w, p.h); });
      blocks.forEach(b => {
          ctx.fillStyle = b.hit ? (Renderer.getTexture(ctx, 'metal') || '#bdc3c7') : (Renderer.getTexture(ctx, 'stone') || '#f1c40f'); 
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeStyle = b.hit ? '#ecf0f1' : '#f39c12'; ctx.lineWidth = 3; ctx.strokeRect(b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3);
      });

      Renderer.drawPrizes(ctx, prizes);
      Renderer.drawSwitches(ctx, level.switches || []);
      Renderer.drawLaserGates(ctx, level.laserGates || [], level.switches || [], frameCount);
      Renderer.drawMovingPlatforms(ctx, level.movingPlatforms || [], isBonusRoom);
      Renderer.drawFireballs(ctx, fireballs);
      Renderer.drawLasers(ctx, lasers);
      Renderer.drawFirebars(ctx, level.firebars || []);
      Renderer.drawEnemyProjectiles(ctx, enemyProjectiles);
      enemies.forEach(e => Renderer.drawEnemy(ctx, e, frameCount));
      Renderer.drawBoy(ctx, player, frameCount, level.waterLevel !== undefined && player.y + player.height/2 > level.waterLevel);
      if (level.lavaPools) level.lavaPools.forEach(pool => Renderer.drawLavaPool(ctx, pool, frameCount));
      if (level.weather) Renderer.drawWeather(ctx, level.weather, frameCount);
      
      // Dynamic Lighting
      ctx.globalCompositeOperation = 'screen';
      const drawLight = (lx: number, ly: number, lr: number, lc: string, li: number) => {
          const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
          grad.addColorStop(0, lc); grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad; ctx.globalAlpha = li; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
      };
      drawLight(player.x + player.width/2, player.y + player.height/2, 150 + Math.sin(frameCount * 0.1) * 20, '#00ffff', 0.4);
      fireballs.forEach(fb => { if (fb.active) drawLight(fb.x + fb.w/2, fb.y + fb.h/2, 100, '#e67e22', 0.6); });
      lasers.forEach(l => { if (l.active) drawLight(l.x + l.w/2, l.y + l.h/2, 200, '#ff00ff', 0.4); });
      ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';

      ctx.restore(); ctx.restore(); ctx.restore();

      // UI Overlay
      ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // Progress Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fillRect(0, 0, GAME_WIDTH, 5);
      const progress = player.x / worldWidth;
      ctx.fillStyle = '#00ffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
      ctx.fillRect(0, 0, GAME_WIDTH * progress, 5);
      ctx.shadowBlur = 0;

      for (let i = 0; i < livesRef.current; i++) Renderer.drawHeart(ctx, 20 + i * 35, 20, 25);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(20, 60, 100, 10);
      if (player.fireballTimer <= 0) { ctx.fillStyle = '#e67e22'; ctx.shadowBlur = 10; ctx.shadowColor = '#e67e22'; ctx.fillRect(20, 60, 100, 10); }
      else { ctx.fillStyle = '#555'; ctx.fillRect(20, 60, 100 * (1 - player.fireballTimer / (180 - (upgrades.cooldownReduc * 30))), 10); }
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(20, 95, 100, 10);
      if (player.dashCooldown <= 0) { ctx.fillStyle = '#00ffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff'; ctx.fillRect(20, 95, 100, 10); }
      else { ctx.fillStyle = '#333'; ctx.fillRect(20, 95, 100 * (1 - player.dashCooldown / 60), 10); }
      
      if (player.overdriveTimer > 0) {
          ctx.fillStyle = '#ff00ff'; ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff'; ctx.font = 'bold 30px Arial';
          ctx.fillText('OVERDRIVE', 20, 160); ctx.fillRect(20, 175, 200 * (player.overdriveTimer / 300), 15);
          ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 10 + Math.sin(frameCount * 0.5) * 5; ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      } else if (player.stats.combo > 1) {
          ctx.fillStyle = player.stats.combo >= 5 ? '#ff00ff' : '#ff9999'; ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle;
          ctx.font = `bold ${20 + Math.min(player.stats.combo * 2, 20)}px Arial`; ctx.fillText(`${player.stats.combo}x COMBO!`, 20, 160);
      }
      ctx.shadowBlur = 0; ctx.fillStyle = 'white'; ctx.font = 'bold 24px Arial'; ctx.fillText(`Score: ${scoreRef.current}`, GAME_WIDTH - 150, 45);
      if (!isBonusRoom) ctx.fillText(`Level: ${currentLevel + 1}`, GAME_WIDTH - 150, 80);
      
      if (gameStateRef.current === 'boss_intro') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
          ctx.fillRect(0, GAME_HEIGHT / 2 - 50, GAME_WIDTH, 100); ctx.fillStyle = '#ff00ff'; ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
          ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText(bossName, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15);
          ctx.textAlign = 'left'; ctx.shadowBlur = 0;
      }
      ctx.restore();
    };

    const gameLoop = () => { update(); draw(); animationFrameId = requestAnimationFrame(gameLoop); };
    let animationFrameId = requestAnimationFrame(gameLoop);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); audioManager.stopMusic(); };
  }, [gameStarted, currentLevel, retryKey, isBonusRoom]);

  const resetGame = () => {
      const startLives = 3 + upgrades.extraHearts; livesRef.current = startLives; setLives(startLives);
      scoreRef.current = 0; setScore(0); setIsBonusRoom(false); savedMainLevelRef.current = null;
      setRetryKey(prev => prev + 1); setGameState('playing');
  };

  const nextLevel = () => { setCurrentLevel(prev => prev + 1); setIsBonusRoom(false); savedMainLevelRef.current = null; savedPlayerPosRef.current = null; setGameState('playing'); };

  return (
    <div className="game-container">
      {!gameStarted && (
        <div className="start-overlay">
          <h1>NEON RUNNER</h1>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="start-btn" onClick={() => { setIsAgentPlaying(false); setGameStarted(true); }}>START GAME</button>
              <button className="start-btn agent-btn" onClick={() => { setIsAgentPlaying(true); playerRef.current = null; setGameStarted(true); setAgentFeedback(["Initializing AI Core...", "Objective: Clear Level"]); }}>RUN TEST AGENT</button>
          </div>
          <div className="high-score">HIGH SCORE: {highScore}</div>
          <div className="level-select">
              <p>SELECT STARTING LEVEL</p>
              <div className="level-buttons">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <button key={i} className={`lvl-btn ${currentLevel === i ? 'active' : ''} ${i > unlockedLevel ? 'locked' : ''}`}
                          onClick={() => { if (i <= unlockedLevel) { setCurrentLevel(i); playerRef.current = null; } }} disabled={i > unlockedLevel}>
                          {i + 1} {i > unlockedLevel ? '🔒' : ''}
                      </button>
                  ))}
              </div>
          </div>
          <div className="audio-controls">
              <div className="audio-toggle" onClick={() => { const newState = !audioEnabled; setAudioEnabled(newState); localStorage.setItem('neonRunnerAudio', newState.toString()); }}>Audio: {audioEnabled ? '🔊 ON' : '🔇 OFF'}</div>
              <div className="volume-sliders">
                  {[['Master', masterVol, setMasterVol, 'neonRunnerMasterVol'], ['Music', musicVol, setMusicVol, 'neonRunnerMusicVol'], ['SFX', sfxVol, setSfxVol, 'neonRunnerSfxVol']].map(([label, val, setter, key]) => (
                      <div key={label as string} className="vol-slider"><span>{label as string}</span><input type="range" min="0" max="1" step="0.1" value={val as number} onChange={(e) => { const v = Number(e.target.value); (setter as any)(v); localStorage.setItem(key as string, v.toString()); }} /></div>
                  ))}
              </div>
          </div>
          <div className="upgrade-shop">
              <h3>NEON UPGRADES</h3>
              <div className="shards-count">SHARDS: {shards}</div>
              <div className="upgrade-items">
                  {[
                      ['Extra Heart', upgrades.extraHearts, 250, 'extraHearts'],
                      ['Cooldown', upgrades.cooldownReduc, 150, 'cooldownReduc'],
                      ['Shard Bonus', upgrades.shardBonus, 300, 'shardBonus']
                  ].map(([label, count, costBase, key]) => {
                      const cost = (Number(count) + 1) * Number(costBase);
                      return (
                          <div key={label as string} className="upgrade-item"><span>{label as string} ({count})</span>
                          <button onClick={() => {
                              if (shards >= cost) {
                                  const next = { ...upgrades, [key as string]: Number(count) + 1 };
                                  setUpgrades(next); setShards(shards - cost); shardsRef.current -= cost;
                                  localStorage.setItem('neonRunnerUpgrades', JSON.stringify(next)); localStorage.setItem('neonRunnerShards', (shards - cost).toString());
                                  if (key === 'extraHearts') { setLives(3 + next.extraHearts); livesRef.current = 3 + next.extraHearts; }
                              }
                          }} disabled={shards < cost || (key === 'cooldownReduc' && Number(count) >= 4)}>Cost: {cost}</button></div>
                      );
                  })}
              </div>
          </div>
          <div className="controls-hint"><p>ARROWS to Move/Pound | SPACE to Jump | SHIFT to Dash | F to SHOOT | C to GRAPPLE</p></div>
        </div>
      )}
      <canvas ref={canvasRef} width={800} height={600} />
      {isAgentPlaying && gameStarted && gameState === 'playing' && (
          <div className="agent-log"><div className="log-header">🤖 TEST AGENT LOG</div>{agentFeedback.map((msg, i) => <div key={i} className="log-entry" style={{ opacity: 1 - i * 0.2 }}>{msg}</div>)}</div>
      )}
      {achievement && (
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.8)', border: '2px solid #f1c40f', color: '#f1c40f', padding: '10px 20px', borderRadius: '10px', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 0 15px #f1c40f', zIndex: 100, animation: 'blink 1s infinite' }}>{achievement}</div>
      )}
      {gameState === 'won' && (
          <div className="state-overlay victory"><h1>LEVEL {currentLevel + 1} CLEAR!</h1><div className="final-stats"><div>Shards Collected: <span style={{color: '#00ffff'}}>{playerRef.current?.stats?.shardsCollected || 0}</span></div><div>Enemies Defeated: <span style={{color: '#ff00ff'}}>{playerRef.current?.stats?.enemiesDefeated || 0}</span></div><div>Time Taken: <span style={{color: '#f1c40f'}}>{((playerRef.current?.stats?.timeTaken || 0) / 60).toFixed(1)}s</span></div></div><p>Score: {score}</p><button className="start-btn" onClick={nextLevel}>NEXT LEVEL</button></div>
      )}
      {gameState === 'gameover' && (
          <div className="state-overlay gameover"><h1>GAME OVER</h1><p>Score: {score}</p><div className="high-score-mini">High Score: {highScore}</div><button className="start-btn" onClick={resetGame}>RETRY</button></div>
      )}
      {gameState === 'gameclear' && (
          <div className="state-overlay gameclear"><h1>NEON CHAMPION</h1><p>YOU CLEARED ALL LEVELS!</p><div className="final-stats"><div>Final Score: {score}</div><div>High Score: {highScore}</div></div><button className="start-btn" onClick={() => { resetGame(); setCurrentLevel(0); setRetryKey(prev => prev + 1); setGameState('playing'); }}>PLAY AGAIN</button></div>
      )}
      <div className="instructions"><h3>Controls Update!</h3><p>Ground Pound: Press DOWN in air | Grappling Hook: Hold C | Dash: SHIFT</p><p>Overdrive: Chain 10 hits without landing!</p></div>
    </div>
  );
};

function App() { return ( <div className="App"> <GameCanvas /> </div> ); }
export default App;
