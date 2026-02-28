export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx?: number;
  vy?: number;
  type: 'patrol' | 'spikes' | 'boss' | 'flying' | 'turret';
  color?: string;
  alive: boolean;
  hp?: number;
  maxHp?: number;
  lastJump?: number;
  lastShot?: number;
  startY?: number;
}

export interface EnemyProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  active: boolean;
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
  prizeType?: 'bacon' | 'carrot' | 'shoes' | 'spring' | 'burger';
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

export interface Prize {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: 'bacon' | 'carrot' | 'shoes' | 'spring' | 'burger';
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

export interface BackgroundLayer {
  color: string;
  speed: number;
  height: number;
  seed: number;
}

export interface Level {
  worldWidth: number;
  enemies: Enemy[];
  chests: Chest[];
  platforms: Platform[];
  blocks: Block[];
  bgLayers: BackgroundLayer[];
  warps?: Warp[];
  prizes?: Prize[];
  waterLevel?: number;
  firebars?: Firebar[];
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
  rollTimer: number;
  invincibilityFrames: number;
  speedBoostTimer: number;
  jumpBoostTimer: number;
  bigTimer: number;
  giantTimer: number;
  fireballTimer: number;
  facingRight: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  airJumpsLeft: number;
  isWallSliding: boolean;
}
