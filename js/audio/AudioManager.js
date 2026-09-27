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
        this._loadPromise = this.loadAudio(audioUrl);
        this._autoplayHandled = false;
    }

    async loadAudio(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
            console.log("Music loaded successfully");
        } catch (err) {
            console.error("Failed to load music:", err);
        }
    }

    /** Call this on first user interaction to enable autoplay */
    enableAutoplay() {
        if (this._autoplayHandled) return;
        this._autoplayHandled = true;

        const resumeAndPlay = async () => {
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
            await this._loadPromise;
            if (this.buffer && !this.source) {
                this.play();
            }
        };
        resumeAndPlay();

        // Remove listeners after first interaction
        window.removeEventListener('click', resumeAndPlay);
        window.removeEventListener('keydown', resumeAndPlay);
    }

    play() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.buffer) {
            console.warn("Music buffer not loaded yet");
            return;
        }

        // Stop existing source if already playing
        if (this.source) {
            try { this.source.stop(); } catch {}
        }

        this.source = this.ctx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = true;
        this.source.connect(this.gainNode);
        this.source.start(0);
        console.log("Music started playing");
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
            if (this.source) {
                try { this.source.stop(); } catch {}
            }
        }, duration * 1000);
    }
}