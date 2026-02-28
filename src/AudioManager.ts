/**
 * AudioManager.ts
 * Procedural Synthwave Sound & SFX Generator using Web Audio API
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isPlayingMusic: boolean = false;
  private musicInterval: any = null;

  constructor() {
    // Context is created on first interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API not supported in this browser.");
        return;
      }
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0.3;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = 0.6;
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
      this.ctx = null;
    }
  }

  // --- Sound Effects ---

  public playJump() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playBop() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playDamage() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playChest() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.05);
        g.gain.setValueAtTime(0, this.ctx!.currentTime);
        g.gain.linearRampToValueAtTime(0.1, this.ctx!.currentTime + i * 0.05 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.05 + 0.2);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(this.ctx!.currentTime + i * 0.05);
        osc.stop(this.ctx!.currentTime + i * 0.05 + 0.2);
    });
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.1); // E6
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // --- Procedural Synthwave Music ---

  public startMusic() {
    this.init();
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;
    
    let step = 0;
    const scale = [55, 65.41, 73.42, 82.41, 98, 110]; // A1, C2, D2, E2, G2, A2
    const melodyScale = [220, 246.94, 261.63, 293.66, 329.63, 392, 440];

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain) return;

      // Bassline (Classic Synthwave pattern: Root-Root-Octave-Octave)
      const bassNote = scale[0]; 
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(step % 2 === 0 ? bassNote : bassNote * 2, this.ctx.currentTime);
      g.gain.setValueAtTime(0.05, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);

      // Simple Melody every few steps
      if (step % 4 === 0 && Math.random() > 0.3) {
        const mOsc = this.ctx.createOscillator();
        const mg = this.ctx.createGain();
        mOsc.type = 'triangle';
        mOsc.frequency.setValueAtTime(melodyScale[Math.floor(Math.random() * melodyScale.length)], this.ctx.currentTime);
        mg.gain.setValueAtTime(0.03, this.ctx.currentTime);
        mg.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        mOsc.connect(mg);
        mg.connect(this.musicGain);
        mOsc.start();
        mOsc.stop(this.ctx.currentTime + 0.5);
      }

      step++;
    }, 150); // 100 BPM approx
  }

  public stopMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);
    this.isPlayingMusic = false;
  }
}

export const audioManager = new AudioManager();
