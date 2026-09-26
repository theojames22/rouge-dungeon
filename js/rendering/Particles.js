/**
 * Particle System
 * Emits visual effects for combat strikes, level ups, blood, torches, and magic.
 */
export class Particles {
    constructor() {
        this.particles = [];
    }

    /**
     * Spawns blood burst
     */
    emitBlood(gridX, gridY, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 60 + 20;
            this.particles.push({
                x: gridX * 32 + 16,
                y: gridY * 32 + 16,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.3 ? '#dc2626' : '#991b1b',
                size: Math.random() * 3 + 2,
                alpha: 1,
                decay: Math.random() * 1.5 + 1.2,
                shape: 'circle'
            });
        }
    }

    /**
     * Spawns an expanding radial nova
     */
    emitNova(gridX, gridY, color = '#fbbf24', count = 24) {
        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count;
            const speed = Math.random() * 70 + 50;
            this.particles.push({
                x: gridX * 32 + 16,
                y: gridY * 32 + 16,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: Math.random() * 4 + 2,
                alpha: 1,
                decay: 1.0,
                shape: 'spark'
            });
        }
    }

    /**
     * Spawns rising ember particle
     */
    emitTorchEmber(pixelX, pixelY) {
        this.particles.push({
            x: pixelX + (Math.random() - 0.5) * 6,
            y: pixelY - 4,
            vx: (Math.random() - 0.5) * 15,
            vy: -Math.random() * 25 - 10,
            color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
            size: Math.random() * 2.5 + 1,
            alpha: 0.9,
            decay: 1.8,
            shape: 'circle'
        });
    }

    /**
     * Updates all active particles
     * @param {number} dt in seconds
     */
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.92; // Friction
            p.vy *= 0.92;
            p.alpha -= p.decay * dt;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Renders active particles relative to camera
     */
    render(ctx, camera) {
        ctx.save();
        for (const p of this.particles) {
            const screen = camera.worldToScreen(p.x, p.y);
            if (
                screen.x < -20 ||
                screen.x > camera.viewportWidth + 20 ||
                screen.y < -20 ||
                screen.y > camera.viewportHeight + 20
            ) {
                continue;
            }

            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;

            if (p.shape === 'spark') {
                ctx.fillRect(screen.x - p.size / 2, screen.y - p.size / 2, p.size, p.size);
            } else {
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

export default Particles;
