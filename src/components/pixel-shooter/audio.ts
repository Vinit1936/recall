// Minimal 8-bit Retro Audio Synthesizer (Pure Black & White Arcade)
// Uses Web Audio API for classic square-wave laser blips and 8-bit noise explosions.

class RetroAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Classic 8-bit retro laser shot (Square wave pitch drop: 880Hz -> 220Hz)
  public playShoot() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // 8-bit pixel explosion / crumbling noise
  public playExplode() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.14;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // 8-bit quantized noise
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        if (i % 6 === 0) last = Math.random() * 2 - 1;
        data[i] = last * Math.exp(-i / (ctx.sampleRate * 0.04));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.14);
    } catch {}
  }

  // Hit tick on 404 damage
  public playHit() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(220, now + 0.02);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // Game over buzzer
  public playGameOver() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }
}

export const retroAudio = new RetroAudio();
