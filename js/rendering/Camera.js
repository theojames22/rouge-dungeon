/**
 * 2D Dungeon Viewport Camera
 * Handles smooth target following, zoom, world-to-screen transforms, and screen shake.
 */
export class Camera {
    /**
     * @param {number} viewportWidth 
     * @param {number} viewportHeight 
     * @param {number} tileSize 
     */
    constructor(viewportWidth = 800, viewportHeight = 600, tileSize = 32) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.tileSize = tileSize;

        this.x = 0; // World pixel coordinates
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.lerpFactor = 0.12;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    resize(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    /**
     * Set camera target in world grid coordinates
     */
    follow(gridX, gridY) {
        this.targetX = gridX * this.tileSize - this.viewportWidth / 2 + this.tileSize / 2;
        this.targetY = gridY * this.tileSize - this.viewportHeight / 2 + this.tileSize / 2;
    }

    /**
     * Triggers screen shake
     * @param {number} intensity - pixel offset maximum
     * @param {number} duration - duration in milliseconds
     */
    shake(intensity = 8, duration = 300) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update(deltaTime = 16) {
        // Lerp camera toward target
        this.x += (this.targetX - this.x) * this.lerpFactor;
        this.y += (this.targetY - this.y) * this.lerpFactor;

        // Process screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            const factor = Math.max(0, this.shakeDuration / 300);
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * factor;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * factor;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    /**
     * Transforms world pixel coordinate to screen pixel coordinate
     */
    worldToScreen(worldX, worldY) {
        return {
            x: Math.round(worldX - this.x + this.shakeOffsetX),
            y: Math.round(worldY - this.y + this.shakeOffsetY)
        };
    }

    /**
     * Transforms grid tile coordinate to screen pixel coordinate
     */
    tileToScreen(tileX, tileY) {
        return this.worldToScreen(tileX * this.tileSize, tileY * this.tileSize);
    }
}

export default Camera;
