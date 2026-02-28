export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  bounce?: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx?: number;
  vy?: number;
  type: 'patrol' | 'spikes' | 'boss' | 'flying' | 'turret' | 'centipede' | 'sniper' | 'brute' | 'seeker';
  color?: string;
  alive: boolean;
  hp?: number;
  maxHp?: number;
  lastJump?: number;
  lastShot?: number;
  startY?: number;
  state?: 'idle' | 'patrol' | 'alert' | 'attack';
  stateTimer?: number;
  parentId?: number;
  segmentIndex?: number;
  glitched?: boolean;
  phase2?: boolean;
  shielded?: boolean;
  targetX?: number;
  targetY?: number;
}

export interface EnemyProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  active: boolean;
  laserSight?: boolean;
  homing?: boolean;
}

export interface Chest {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  open: boolean;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  hit: boolean;
  prizeType?: 'bacon' | 'carrot' | 'shoes' | 'spring' | 'burger' | 'wing' | 'laser' | 'shard' | 'shield' | 'magnet';
  destructible?: boolean;
}

export interface Warp {
  x: number;
  y: number;
  w: number;
  h: number;
  target: 'bonus' | 'main';
  id: string;
  used?: boolean;
}

export interface Firebar {
  x: number;
  y: number;
  angle: number;
  length: number;
  speed: number;
}

export interface Switch {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
}

export interface LaserGate {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  orientation: 'h' | 'v';
}

export interface Prize {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: 'bacon' | 'carrot' | 'shoes' | 'spring' | 'burger' | 'wing' | 'laser' | 'shard' | 'shield' | 'magnet';
  collected: boolean;
}

export interface Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  active: boolean;
}

export interface Laser {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  facingRight: boolean;
  life: number;
}

export interface BackgroundLayer {
  color: string;
  speed: number;
  height: number;
  seed: number;
  isCityscape?: boolean;
  isSpace?: boolean;
}

export interface MovingPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
  startX: number;
  startY: number;
  rangeX: number;
  rangeY: number;
  speed: number;
  timeOffset: number;
  requiresSwitchId?: string;
}

export interface Spring {
  x: number;
  y: number;
  w: number;
  h: number;
  power: number;
  active: boolean;
}

export interface Level {
  worldWidth: number;
  enemies: Enemy[];
  chests: Chest[];
  platforms: Platform[];
  movingPlatforms?: MovingPlatform[];
  blocks: Block[];
  bgLayers: BackgroundLayer[];
  warps?: Warp[];
  prizes?: Prize[];
  waterLevel?: number;
  lavaPools?: { x: number, y: number, w: number, h: number }[];
  firebars?: Firebar[];
  weather?: 'rain' | 'none' | 'snow';
  friction?: number;
  lasers?: Laser[];
  switches?: Switch[];
  laserGates?: LaserGate[];
  groundSegments?: { x: number, y: number, w: number, h: number, cracked?: boolean, destroyed?: boolean }[];
  checkpoints?: { x: number, y: number, active: boolean }[];
  springs?: Spring[];
}

export interface PlayerStats {
  shardsCollected: number;
  enemiesDefeated: number;
  timeTaken: number;
  combo: number;
  maxCombo: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isRolling: boolean;
  isGroundPounding: boolean;
  grapple: { active: boolean; x: number; y: number; length: number } | null;
  rollTimer: number;
  invincibilityFrames: number;
  speedBoostTimer: number;
  jumpBoostTimer: number;
  bigTimer: number;
  giantTimer: number;
  fireballTimer: number;
  laserTimer: number;
  dashCooldown: number;
  wingTimer: number;
  magnetTimer: number;
  bopCooldown: number;
  overdriveTimer: number;
  shieldActive: boolean;
  facingRight: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  airJumpsLeft: number;
  dashesSinceGround: number;
  isWallSliding: boolean;
  trail: { x: number, y: number, width: number, height: number, facingRight: boolean, alpha: number }[];
  stats: PlayerStats;
}
