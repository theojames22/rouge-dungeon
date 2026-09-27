/**
 * Player Movement and Input Controller
 * Handles directional keyboard inputs, smooth interpolation, and bump interactions.
 */
export class PlayerMovement {
    /**
     * @param {Object} player 
     */
    constructor(player) {
        this.player = player;
        this.keys = {};
        this.moveCooldown = 160; // ms between grid steps
        this.lastMoveTime = 0;
        this.facing = 'down'; // 'up', 'down', 'left', 'right'

        this._setupListeners();
    }

    _setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    /**
     * Updates movement step based on held keys
     * @param {number} deltaTime - in ms
     * @param {Object} dungeon 
     */
    update(deltaTime, dungeon) {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveCooldown) {
            return;
        }

        let dx = 0;
        let dy = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            dy = -1;
            this.facing = 'up';
        } else if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            dy = 1;
            this.facing = 'down';
        } else if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            dx = -1;
            this.facing = 'left';
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            dx = 1;
            this.facing = 'right';
        }

        if (dx !== 0 || dy !== 0) {
            const targetX = Math.round(this.player.x + dx);
            const targetY = Math.round(this.player.y + dy);

            // Check if tile is walkable (enemies block movement)
            const enemy = dungeon.enemies.find(e => !e.isDead && Math.round(e.x) === targetX && Math.round(e.y) === targetY);
            if (enemy) {
                // Enemy blocks movement - don't attack, just face them
                this.lastMoveTime = now;
                return;
            }

            if (dungeon.isWalkable(targetX, targetY)) {
                this.player.x = targetX;
                this.player.y = targetY;
                this.lastMoveTime = now;
                this.player.onMoved(targetX, targetY);
            }
        }
    }
}

export default PlayerMovement;
