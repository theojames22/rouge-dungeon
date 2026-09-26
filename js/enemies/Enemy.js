import { Random } from '../systems/Random.js';
import { Collision } from '../systems/Collision.js';
import { Pathfinding } from '../systems/Pathfinding.js';
import { Potion } from '../items/Potion.js';
import { WeaponItem } from '../items/WeaponItem.js';

/**
 * Base Enemy Entity
 */
export class Enemy {
    /**
     * @param {Object} options 
     */
    constructor(options = {}) {
        this.id = Random.uuid();
        this.name = options.name || 'Dungeon Beast';
        this.type = options.type || 'generic';
        this.icon = options.icon || '👾';
        this.color = options.color || '#ef4444';

        this.x = options.x || 0;
        this.y = options.y || 0;
        this.renderX = this.x;
        this.renderY = this.y;

        this.stats = {
            maxHp: options.maxHp || 20,
            hp: options.maxHp || 20,
            baseAttack: options.baseAttack || 4,
            baseDefense: options.baseDefense || 1,
            evasion: options.evasion || 0.05,
            critChance: options.critChance || 0.05,
            moveCooldown: options.moveCooldown || 600, // ms between moves
            aggroRadius: options.aggroRadius || 7
        };

        this.lastMoveTime = Date.now() + Random.rangeInt(0, 300);
        this.expReward = options.expReward || 20;
        this.goldReward = options.goldReward || Random.rangeInt(2, 8);
        this.isDead = false;
        this.isBoss = options.isBoss || false;
    }

    /**
     * Updates enemy AI behavior
     */
    update(deltaTime, dungeon, player) {
        if (this.isDead || !player || player.isDead) return;

        // Visual interpolation
        this.renderX += (this.x - this.renderX) * 0.35;
        this.renderY += (this.y - this.renderY) * 0.35;

        const now = Date.now();
        if (now - this.lastMoveTime < this.stats.moveCooldown) {
            return;
        }

        const distToPlayer = Collision.distance(this.x, this.y, player.x, player.y);

        // Check if player is directly adjacent: Attack!
        if (Collision.manhattanDistance(this.x, this.y, player.x, player.y) === 1) {
            this.attack(player);
            this.lastMoveTime = now;
            return;
        }

        // Check if within aggro radius and visible to dungeon
        if (distToPlayer <= this.stats.aggroRadius) {
            const hasLOS = Collision.hasLineOfSight(dungeon, Math.round(this.x), Math.round(this.y), Math.round(player.x), Math.round(player.y));
            if (hasLOS || distToPlayer <= 3) {
                // Chase using pathfinding
                const path = Pathfinding.findPath(dungeon, this.x, this.y, player.x, player.y, 16);
                if (path && path.length > 0) {
                    const nextStep = path[0];
                    if (dungeon.isWalkable(nextStep.x, nextStep.y)) {
                        this.x = nextStep.x;
                        this.y = nextStep.y;
                        this.lastMoveTime = now;
                        return;
                    }
                }
            }
        }

        // Random idle wander (25% chance when not chasing)
        if (Random.chance(0.25)) {
            const dirs = [
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: -1, y: 0 }, { x: 1, y: 0 }
            ];
            const dir = Random.choice(dirs);
            const targetX = this.x + dir.x;
            const targetY = this.y + dir.y;

            if (dungeon.isWalkable(targetX, targetY)) {
                this.x = targetX;
                this.y = targetY;
            }
            this.lastMoveTime = now;
        }
    }

    attack(player) {
        if (!player || player.isDead) return;
        player.game?.combat?.resolveAttack(this, player);
    }

    takeDamage(amount) {
        this.stats.hp = Math.max(0, this.stats.hp - amount);
        if (this.stats.hp <= 0) {
            this.isDead = true;
        }
    }

    /**
     * Spawns loot on floor when defeated
     */
    dropLoot(dungeon) {
        if (!dungeon) return;

        // Chance to drop potion
        if (Random.chance(0.35)) {
            const potion = Random.chance(0.7) ? Potion.createHealthPotion(25) : Potion.createManaPotion(20);
            dungeon.addItem(potion, this.x, this.y);
        }

        // Chance to drop weapon
        if (Random.chance(0.18)) {
            const weapon = WeaponItem.createRandomWeapon(dungeon.currentFloor);
            dungeon.addItem(weapon, this.x, this.y);
        }
    }
}

export default Enemy;
