/**
 * Sound Manager - Synthesized Sound Effects
 * Generates retro game sounds programmatically using Web Audio API.
 * No external audio files needed.
 */
export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3;
        this.enabled = true;
    }

    /** Ensure audio context is resumed (required by browser autoplay policy) */
    _ensureRunning() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /** Play a synthesized tone */
    _playTone(freq, duration, type = 'square', volume = 0.15, sweep = null) {
        if (!this.enabled) return;
        this._ensureRunning();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        if (sweep) {
            osc.frequency.setValueAtTime(sweep.from, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(sweep.to, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /** Player basic attack (bump/spacing) - sharp sword swing */
    playPlayerAttack(isCrit = false) {
        if (isCrit) {
            // Critical hit - dual tone
            this._playTone(880, 0.08, 'square', 0.2);
            this._playTone(1320, 0.12, 'square', 0.15);
            this._playTone(660, 0.15, 'triangle', 0.1, { from: 880, to: 440 });
        } else {
            // Normal attack
            this._playTone(660, 0.06, 'square', 0.18);
            this._playTone(440, 0.1, 'triangle', 0.1, { from: 550, to: 330 });
        }
    }

    /** Player special ability (whirlwind) - magical whoosh */
    playSpecialAbility() {
        this._playTone(520, 0.15, 'sine', 0.15, { from: 300, to: 800 });
        this._playTone(780, 0.2, 'sine', 0.1, { from: 600, to: 1000 });
        this._playTone(220, 0.3, 'triangle', 0.08, { from: 180, to: 300 });
    }

    /** Enemy hit - grunt/impact */
    playEnemyHit() {
        this._playTone(200, 0.08, 'sawtooth', 0.15, { from: 300, to: 150 });
        this._playTone(120, 0.12, 'triangle', 0.1);
    }

    /** Enemy death - descending tone */
    playEnemyDeath() {
        this._playTone(300, 0.15, 'sine', 0.15, { from: 400, to: 100 });
        this._playTone(150, 0.25, 'triangle', 0.1, { from: 200, to: 80 });
    }

    /** Player hit - harsh buzz */
    playPlayerHit() {
        this._playTone(150, 0.1, 'sawtooth', 0.2, { from: 250, to: 100 });
        this._playTone(80, 0.15, 'square', 0.15);
    }

    /** Player death - sad descending */
    playPlayerDeath() {
        this._playTone(330, 0.2, 'sine', 0.15, { from: 440, to: 110 });
        this._playTone(220, 0.3, 'triangle', 0.1, { from: 300, to: 80 });
    }

    /** Level up - ascending chime */
    playLevelUp() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.25, 'sine', 0.15), i * 80);
        });
    }

    /** Pickup item - short blip */
    playPickup() {
        this._playTone(880, 0.05, 'square', 0.15);
        this._playTone(1320, 0.08, 'sine', 0.1, { from: 1000, to: 1500 });
    }

    /** Stairs descend - deep thrum */
    playDescend() {
        this._playTone(110, 0.3, 'sine', 0.2, { from: 160, to: 80 });
        this._playTone(55, 0.5, 'triangle', 0.1, { from: 80, to: 40 });
    }

    /** Menu navigation - tiny click */
    playMenuClick() {
        this._playTone(1000, 0.03, 'square', 0.08);
    }

    /** Toggle sound on/off */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /** Set master volume (0-1) */
    setVolume(vol) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
}

export default SoundManager;