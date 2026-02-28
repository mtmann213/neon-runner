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

export interface Level {
  worldWidth: number;
  enemies: Omit<Enemy, 'y' | 'alive'>[];
  chests: Chest[];
  platforms: Platform[];
  blocks: Block[];
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
  facingRight: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
}
