// Simple Web Audio API wrapper to generate tennis sounds procedurally
// This avoids the need for external assets and ensures instant loading.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    try {
      // Initialize on first user interaction usually, but we'll try here
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.enabled = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  private ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHit(isHard: boolean = false) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Racket hit sound (mix of noise and tone)
    osc.frequency.setValueAtTime(isHard ? 200 : 150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    gain.gain.setValueAtTime(isHard ? 0.8 : 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playBounce() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Thud sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playScore(isPositive: boolean) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    
    if (isPositive) {
        // High ping
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(1760, t + 0.1);
    } else {
        // Low buzz
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.3);
        osc.type = 'sawtooth';
    }

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.5);
  }
}

export const soundEngine = new SoundEngine();
