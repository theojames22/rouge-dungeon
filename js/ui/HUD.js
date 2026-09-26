/**
 * Heads-Up Display (HUD) Controller
 * Manages health bars, mana, exp, floor stats, minimap, and combat log.
 */
export class HUD {
    /**
     * @param {Object} game 
     */
    constructor(game) {
        this.game = game;

        this.hpFill = document.getElementById('hud-hp-fill');
        this.hpText = document.getElementById('hud-hp-text');
        this.mpFill = document.getElementById('hud-mp-fill');
        this.mpText = document.getElementById('hud-mp-text');
        this.expFill = document.getElementById('hud-exp-fill');
        this.levelText = document.getElementById('hud-level-text');
        this.floorText = document.getElementById('hud-floor-text');
        this.goldText = document.getElementById('hud-gold-text');
        this.weaponName = document.getElementById('hud-weapon-name');
        this.combatLogContainer = document.getElementById('hud-combat-log');
        this.minimapCanvas = document.getElementById('hud-minimap');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

        this._setupEvents();
    }

    _setupEvents() {
        const invBtn = document.getElementById('btn-open-inventory');
        if (invBtn) {
            invBtn.addEventListener('click', () => {
                this.game?.inventoryUI?.toggle();
            });
        }

        const abilityBtn = document.getElementById('btn-use-ability');
        if (abilityBtn) {
            abilityBtn.addEventListener('click', () => {
                this.game?.player?.useSpecialAbility();
            });
        }

        const descendBtn = document.getElementById('btn-descend-stairs');
        if (descendBtn) {
            descendBtn.addEventListener('click', () => {
                this.game?.tryDescendFloor();
            });
        }
    }

    /**
     * Updates all HUD readouts
     */
    update() {
        const player = this.game?.player;
        if (!player) return;

        // Health
        const hpPercent = Math.max(0, Math.min(100, (player.stats.hp / player.stats.maxHp) * 100));
        if (this.hpFill) this.hpFill.style.width = `${hpPercent}%`;
        if (this.hpText) this.hpText.textContent = `${Math.ceil(player.stats.hp)} / ${player.stats.maxHp}`;

        // Mana
        const mpPercent = Math.max(0, Math.min(100, (player.stats.mp / player.stats.maxMp) * 100));
        if (this.mpFill) this.mpFill.style.width = `${mpPercent}%`;
        if (this.mpText) this.mpText.textContent = `${Math.ceil(player.stats.mp)} / ${player.stats.maxMp}`;

        // EXP
        const expRatio = player.levelSystem.experience.getProgressRatio() * 100;
        if (this.expFill) this.expFill.style.width = `${expRatio}%`;
        if (this.levelText) this.levelText.textContent = `LVL ${player.levelSystem.level}`;

        // Floor & Gold
        if (this.floorText) this.floorText.textContent = `B${this.game.dungeon?.currentFloor || 1}F`;
        if (this.goldText) this.goldText.textContent = `${player.inventory.gold} G`;

        // Weapon
        if (this.weaponName) {
            const weapon = player.inventory.equippedWeapon;
            this.weaponName.textContent = weapon ? `${weapon.icon} ${weapon.name} (${weapon.damageMin}-${weapon.damageMax})` : 'Fists (2-4)';
        }

        // Minimap
        this.renderMinimap();
    }

    updateCombatLog(message) {
        if (!this.combatLogContainer) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `• ${message}`;
        this.combatLogContainer.appendChild(entry);

        while (this.combatLogContainer.children.length > 5) {
            this.combatLogContainer.removeChild(this.combatLogContainer.firstChild);
        }
        this.combatLogContainer.scrollTop = this.combatLogContainer.scrollHeight;
    }

    renderMinimap() {
        if (!this.minimapCtx || !this.game.dungeon) return;

        const ctx = this.minimapCtx;
        const dungeon = this.game.dungeon;
        const player = this.game.player;

        ctx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

        const scaleX = this.minimapCanvas.width / dungeon.width;
        const scaleY = this.minimapCanvas.height / dungeon.height;

        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                const tile = dungeon.getTile(x, y);
                if (!tile || !tile.explored) continue;

                if (tile.isWall()) {
                    ctx.fillStyle = '#334155';
                } else if (tile.isStairs()) {
                    ctx.fillStyle = '#818cf8';
                } else {
                    ctx.fillStyle = '#1e293b';
                }
                ctx.fillRect(x * scaleX, y * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
            }
        }

        // Enemies on minimap (if visible in FOV)
        for (const enemy of dungeon.enemies) {
            if (enemy.isDead) continue;
            const tile = dungeon.getTile(Math.round(enemy.x), Math.round(enemy.y));
            if (tile && tile.visible) {
                ctx.fillStyle = enemy.isBoss ? '#ef4444' : '#f87171';
                ctx.fillRect(enemy.x * scaleX - 1, enemy.y * scaleY - 1, 3, 3);
            }
        }

        // Player marker
        if (player) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(player.x * scaleX, player.y * scaleY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

export default HUD;
