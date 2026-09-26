import { PlayerStats } from './PlayerStats.js';
import { PlayerMovement } from './PlayerMovement.js';
import { Inventory } from '../items/Inventory.js';
import { LevelSystem } from '../systems/LevelSystem.js';
import { WeaponItem } from '../items/WeaponItem.js';
import { Potion } from '../items/Potion.js';

/**
 * Player Entity
 */
export class Player {
    /**
     * @param {Object} game 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(game, x = 0, y = 0) {
        this.game = game;
        this.name = 'Knight Hero';
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.visionRadius = 9;
        this.kills = 0;

        this.stats = new PlayerStats();
        this.movement = new PlayerMovement(this);
        this.inventory = new Inventory(16);
        this.levelSystem = new LevelSystem(this);

        // Equip a starter weapon and give a starter potion
        const starterSword = WeaponItem.createRandomWeapon(1);
        starterSword.name = 'Iron Shortsword';
        starterSword.damageMin = 5;
        starterSword.damageMax = 8;
        this.inventory.addItem(starterSword);
        this.inventory.equipWeapon(starterSword);

        const starterPotion = Potion.createHealthPotion(35);
        starterPotion.quantity = 2;
        this.inventory.addItem(starterPotion);
    }

    get isDead() {
        return this.stats.isDead;
    }

    get facing() {
        return this.movement.facing;
    }

    /**
     * Update player logic
     */
    update(deltaTime, dungeon) {
        if (this.isDead) return;

        // Smooth visual interpolation
        this.renderX += (this.x - this.renderX) * 0.35;
        this.renderY += (this.y - this.renderY) * 0.35;

        this.movement.update(deltaTime, dungeon);
    }

    /**
     * Attack an enemy
     */
    attack(target) {
        if (!this.game?.combat) return;
        this.game.combat.resolveAttack(this, target);
    }

    /**
     * Whirlwind / Area Attack ability using Mana
     */
    useSpecialAbility() {
        const manaCost = 15;
        if (!this.stats.useMp(manaCost)) {
            this.game?.combat?.log("Not enough mana for Whirlwind!");
            return false;
        }

        this.game?.combat?.log("Whirlwind attack unleashed!");
        this.game?.particles?.emitNova(this.x, this.y, '#38bdf8', 24);
        this.game?.combat?.resolveAreaAttack(this, 1.8);
        return true;
    }

    /**
     * Take damage from an enemy
     */
    takeDamage(amount) {
        const dead = this.stats.takeDamage(amount);
        this.game?.camera?.shake(6, 250);

        if (dead) {
            this.game?.onPlayerDied?.();
        }
    }

    /**
     * Callback when defeating an enemy
     */
    onKillTarget(enemy) {
        this.kills++;
        const expGained = enemy.expReward || 25;
        const result = this.levelSystem.gainExp(expGained);

        this.game?.combat?.log(`Gained ${expGained} EXP!`);

        if (result.leveledUp) {
            this.game?.combat?.log(`LEVEL UP! Now Level ${result.newLevel}!`);
            this.game?.particles?.emitNova(this.x, this.y, '#fbbf24', 30);
            this.game?.renderer?.addFloatingText(`LEVEL UP!`, this.x, this.y - 0.5, '#fbbf24');
        }

        // Add enemy gold
        if (enemy.goldReward > 0) {
            this.inventory.addGold(enemy.goldReward);
            this.game?.combat?.log(`Found ${enemy.goldReward} gold!`);
        }
    }

    /**
     * Callback on moving to a new tile
     */
    onMoved(newX, newY) {
        const dungeon = this.game.dungeon;
        if (!dungeon) return;

        // Recompute FOV
        dungeon.computeFOV(newX, newY, this.visionRadius);

        // Check if stepped on items
        const items = dungeon.getItemsAt(newX, newY);
        for (const entry of items) {
            if (this.inventory.addItem(entry.item)) {
                dungeon.removeItem(entry.item);
                this.game?.combat?.log(`Picked up ${entry.item.name}!`);
                this.game?.renderer?.addFloatingText(`+${entry.item.name}`, newX, newY, '#34d399');
            }
        }

        // Check stairs down
        const tile = dungeon.getTile(newX, newY);
        if (tile && tile.isStairs()) {
            this.game?.combat?.log(`You see a staircase leading deeper into the dungeon (Press [SPACE] or Click Descend)`);
        }
    }
}

export default Player;
