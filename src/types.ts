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
  type: string;
  color?: string;
  alive: boolean;
  hp?: number;
  maxHp?: number;
  lastJump?: number;
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
  prizeType?: 'bacon' | 'carrot' | 'shoes' | 'spring';
}

export interface Prize {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: 'bacon' | 'carrot' | 'shoes' | 'spring';
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
  enemies: Omit<Enemy, 'y' | 'alive'>[];
  chests: Chest[];
  platforms: Platform[];
  blocks: Block[];
  bgLayers?: BackgroundLayer[];
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
  fireballTimer: number;
  facingRight: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  canDoubleJump: boolean;
}
