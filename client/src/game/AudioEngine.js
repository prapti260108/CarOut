/**
 * AudioEngine - Web Audio API Synthesizer
 * Provides procedural BGM groove and all sound effects matching the video reference
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = localStorage.getItem('car_out_sound') !== 'false';
    this.bgmEnabled = localStorage.getItem('car_out_bgm') === 'true'; // default off until user interacts
    this.bgmInterval = null;
    this.bgmStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('car_out_sound', this.soundEnabled);
    return this.soundEnabled;
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    localStorage.setItem('car_out_bgm', this.bgmEnabled);
    if (this.bgmEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.bgmEnabled;
  }

  isSoundOn() {
    return this.soundEnabled;
  }

  isBgmOn() {
    return this.bgmEnabled;
  }

  // --- Procedural BGM Loop (Catchy casual marimba/acoustic chord groove) ---
  startBgm() {
    if (!this.bgmEnabled) return;
    this.init();
    if (this.bgmInterval) clearInterval(this.bgmInterval);

    // Chords: Cmaj -> Gmaj -> Amin -> Fmaj
    const chordNotes = [
      [523.25, 659.25, 783.99], // C
      [392.00, 493.88, 587.33], // G
      [440.00, 523.25, 659.25], // Am
      [349.23, 440.00, 523.25], // F
    ];

    this.bgmStep = 0;
    this.bgmInterval = setInterval(() => {
      if (!this.bgmEnabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const chordIndex = Math.floor(this.bgmStep / 4) % chordNotes.length;
      const chord = chordNotes[chordIndex];
      const note = chord[this.bgmStep % chord.length];

      // Play soft marimba tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);

      // Bass note on downbeats
      if (this.bgmStep % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(chord[0] / 2, t);
        bassGain.gain.setValueAtTime(0.06, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.52);
      }

      this.bgmStep++;
    }, 280);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- Sound Effects ---

  // 1. Car Zoom / Engine Rev Launch
  playDriveOff() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.65);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(2000, t + 0.25);
    filter.frequency.linearRampToValueAtTime(500, t + 0.65);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.68);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  // 2. Double Car Horn ("Beep-Beep!")
  playHorn() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [400, 480].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Beep 1
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.setValueAtTime(0.14, t + 0.07);
      gain.gain.setValueAtTime(0.001, t + 0.08);

      // Beep 2
      gain.gain.setValueAtTime(0.14, t + 0.12);
      gain.gain.setValueAtTime(0.14, t + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.27);
    });
  }

  // 3. Collision / Bumper Thud
  playCrash() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 4. UI Click / Tap
  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 5. Star Pop / Coin Chime
  playStarPop(starNum = 1) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    const freq = freqs[starNum - 1] || 880;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.37);
  }

  // 6. Level Victory Celebration
  playVictory() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12, wait: 0 },
      { f: 659.25, d: 0.12, wait: 0.11 },
      { f: 783.99, d: 0.12, wait: 0.22 },
      { f: 1046.5, d: 0.38, wait: 0.33 },
    ];

    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + n.wait);
      gain.gain.setValueAtTime(0.18, t + n.wait);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.wait + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + n.wait);
      osc.stop(t + n.wait + n.d + 0.05);
    });
  }

  // 7. Liquid Pouring Sound (for SortPuz)
  playLiquidPour() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.25);
    osc.frequency.linearRampToValueAtTime(950, t + 0.5);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.55);
  }

  // 8. Cork Pop Sound (for SortPuz)
  playCorkPop() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.07);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 9. Drawer Slide Sound (for Fill Up Fridge)
  playDrawerSlide() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // 10. Grocery Item Clink Sound (for Fill Up Fridge)
  playItemClink() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 11. Hint Sound
  playHint() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const audio = new AudioEngine();
export default audio;
