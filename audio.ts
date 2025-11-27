
export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(console.error);
    }
  }

  playMove() {
    if (this.isMuted || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Short, low "blip" for footsteps
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(t + 0.05);
  }

  playCollect(isRare: boolean) {
    if (this.isMuted || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    
    if (isRare) {
        // High pitched double-blip (Coin sound)
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(1760, t + 0.08);
    } else {
        // Standard coin sound
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.setValueAtTime(880, t + 0.08);
    }

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.setValueAtTime(0.05, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(t + 0.2);
  }

  playPowerup() {
    if (this.isMuted || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Rising slide
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.3);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(t + 0.3);
  }

  playGameOver() {
    if (this.isMuted || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Descending fail sound
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 1.0);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(t + 1.0);
  }

  playLevelUp() {
    if (this.isMuted || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    
    // Arpeggio C E G C
    osc.frequency.setValueAtTime(523.25, t);       // C5
    osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, t + 0.3); // C6

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.setValueAtTime(0.05, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(t + 0.8);
  }
}

export const soundManager = new SoundManager();
