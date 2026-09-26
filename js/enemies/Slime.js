import { Enemy } from './Enemy.js';
import { Random } from '../systems/Random.js';

/**
 * Slime Enemy
 * Gelatinous dungeon dweller with high vitality and corrosive secretions.
 */
export class Slime extends Enemy {
    constructor(x, y, floorLevel = 1) {
        super({
            name: 'Toxic Slime',
            type: 'slime',
            icon: '🟢',
            color: '#a855f7',
            x,
            y,
            maxHp: 32 + floorLevel * 8, // Very tanky HP pool
            baseAttack: 4 + floorLevel,
            baseDefense: 0,
            evasion: 0.02,
            critChance: 0.03,
            moveCooldown: 700, // Slower
            aggroRadius: 6,
            expReward: 22 + floorLevel * 5,
            goldReward: Random.rangeInt(2, 6)
        });
    }

    /**
     * Slime corrosive counterattack
     */
    takeDamage(amount) {
        super.takeDamage(amount);
        // Slime squish / acid effect could trigger here
    }
}

export default Slime;
