/**
 * AudioManager.ts
 * Procedural Lush Synthwave & "Jungle Synth" Generator
 * Inspired by the rhythmic, atmospheric sounds of Donkey Kong Country (e.g., Kong-Fused Cliffs).
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isPlayingMusic: boolean = false;
  private musicInterval: any = null;

  private volumes = {
    master: 0.7,
    music: 0.5,
    sfx: 0.8
  };

  constructor() {}

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.volumes.master;

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.volumes.music;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.volumes.sfx;
    } catch (e) {
      console.error("Audio initialization failed:", e);
    }
  }

  public setMasterVolume(val: number) {
    this.volumes.master = val;
    if (this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
  }

  public setMusicVolume(val: number) {
    this.volumes.music = val;
    if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
  }

  public setSfxVolume(val: number) {
    this.volumes.sfx = val;
    if (this.sfxGain && this.ctx) this.sfxGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
  }

  // --- Drum / Percussion Synthesis (DKC Style) ---

  private playKick(time: number) {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      g.gain.setValueAtTime(0.2, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(time);
      osc.stop(time + 0.5);
  }

  private playWoodySnare(time: number) {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      g.gain.setValueAtTime(0.1, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      const noise = this.ctx!.createBufferSource();
      const buf = this.ctx!.createBuffer(1, this.ctx!.sampleRate * 0.1, this.ctx!.sampleRate);
      const data = buf.getChannelData(0);
      for(let i=0; i<buf.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const nf = this.ctx!.createBiquadFilter();
      nf.type = 'highpass';
      nf.frequency.value = 1000;
      noise.connect(nf);
      nf.connect(g);

      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(time); noise.start(time);
      osc.stop(time + 0.1);
  }

  // --- SFX ---

  public playJump() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
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
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.1); 
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playPowerUp() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.05);
        g.gain.setValueAtTime(0.1, this.ctx!.currentTime);
        g.gain.linearRampToValueAtTime(0.1, this.ctx!.currentTime + i * 0.05 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.05 + 0.3);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(this.ctx!.currentTime + i * 0.05);
        osc.stop(this.ctx!.currentTime + i * 0.05 + 0.3);
    });
  }

  public playLevelClear() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.1, this.ctx!.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.1 + 0.5);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(this.ctx!.currentTime + i * 0.1);
        osc.stop(this.ctx!.currentTime + i * 0.1 + 0.5);
    });
  }

  public playBossHit() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.3, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playShoot() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // --- Music Loop ---

  private isOverdrive: boolean = false;

  public setOverdriveMode(active: boolean) {
    this.isOverdrive = active;
    if (this.musicInterval) {
        this.stopMusic();
        this.startMusic();
    }
  }

  public startMusic() {
    this.init();
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;
    
    let step = 0;
    const bpm = this.isOverdrive ? 150 : 200; // Lower is faster because it's an interval
    const scales = [
        [110.00, 130.81, 146.83, 164.81], // A, C, D, E (Am)
        [130.81, 146.83, 164.81, 196.00], // C, D, E, G
    ];
    const fluteScale = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;

      // 1. Tribal Rhythm (Kick on 1 and 3, Snare on 2 and 4)
      if (step % 4 === 0) this.playKick(now);
      if (this.isOverdrive || step % 4 === 2) this.playWoodySnare(now);
      
      // Additional hi-hat in overdrive
      if (this.isOverdrive && step % 2 === 1) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(10000, now);
          g.gain.setValueAtTime(0.02, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(g); g.connect(this.musicGain);
          osc.start(now); osc.stop(now + 0.05);
      }
      
      // 2. Deep Pad (Atmospheric base)
      if (step % 16 === 0) {
          const scale = scales[Math.floor(step / 32) % scales.length];
          scale.forEach(f => {
              const osc = this.ctx!.createOscillator();
              const g = this.ctx!.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(f, now);
              g.gain.setValueAtTime(0, now);
              g.gain.linearRampToValueAtTime(0.03, now + 2.0);
              g.gain.linearRampToValueAtTime(0, now + 4.0);
              osc.connect(g);
              g.connect(this.musicGain!);
              osc.start(now); osc.stop(now + 4.0);
          });
      }

      // 3. Flute-like Lead (Melodic syncopation)
      if (Math.random() > 0.6 && step % 2 === 0) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fluteScale[Math.floor(Math.random() * fluteScale.length)], now);
          
          // Add vibrato
          const vibrato = this.ctx.createOscillator();
          vibrato.frequency.value = 5;
          const vGain = this.ctx.createGain();
          vGain.gain.value = 10;
          vibrato.connect(vGain);
          vGain.connect(osc.frequency);
          vibrato.start(now);

          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.04, now + 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
          
          osc.connect(g);
          g.connect(this.musicGain);
          osc.start(now); osc.stop(now + 1.5);
          vibrato.stop(now + 1.5);
      }

      step++;
    }, bpm); 
  }

  public stopMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);
    this.isPlayingMusic = false;
  }
}

export const audioManager = new AudioManager();
