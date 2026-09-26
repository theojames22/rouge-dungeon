// assets/js/AudioManager.js
export class AudioManager {
    constructor(audioUrl, initialVolume = 0.15) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = initialVolume;

        this.buffer = null;
        this.source = null;
        this.audioUrl = audioUrl;
        this.loadAudio(audioUrl);
    }

    async loadAudio(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (err) {
            console.error("Failed to load music:", err);
        }
    }

    play() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.buffer) return;

        // Stop existing source if already playing
        if (this.source) {
            this.source.stop();
        }

        this.source = this.ctx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = true;
        this.source.connect(this.gainNode);
        this.source.start(0);
    }

    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        }
    }

    fadeOut(duration = 1.5) {
        if (!this.gainNode) return;
        const currentTime = this.ctx.currentTime;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);

        setTimeout(() => {
            if (this.source) this.source.stop();
        }, duration * 1000);
    }
}