/**
 * Game Loop Controller
 * Provides fixed/variable delta time requestAnimationFrame loop with pause support.
 */
export class GameLoop {
    /**
     * @param {Function} updateFn - Called with deltaTime in ms
     * @param {Function} renderFn - Called every frame
     */
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;

        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.animationFrameId = null;

        this._loop = this._loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this._loop);
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        if (!this.isRunning) {
            this.start();
        } else {
            this.isPaused = false;
            this.lastTime = performance.now();
        }
    }

    _loop(currentTime) {
        if (!this.isRunning) return;

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clamp excessive lag spikes (e.g. when tab was switched)
        if (deltaTime > 100) {
            deltaTime = 100;
        }

        if (!this.isPaused) {
            this.updateFn(deltaTime);
        }

        this.renderFn();

        this.animationFrameId = requestAnimationFrame(this._loop);
    }
}

export default GameLoop;
