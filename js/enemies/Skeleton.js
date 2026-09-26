import { Enemy } from './Enemy.js';
import { Random } from '../systems/Random.js';

/**
 * Skeleton Warrior
 * Undead soldier with high armor and disciplined combat behavior.
 */
export class Skeleton extends Enemy {
    constructor(x, y, floorLevel = 1) {
        super({
            name: 'Skeleton Guard',
            type: 'skeleton',
            icon: '💀',
            color: '#e2e8f0',
            x,
            y,
            maxHp: 24 + floorLevel * 6,
            baseAttack: 5 + floorLevel * 2,
            baseDefense: 3 + floorLevel, // High armor
            evasion: 0.04,
            critChance: 0.08,
            moveCooldown: 600,
            aggroRadius: 7,
            expReward: 25 + floorLevel * 6,
            goldReward: Random.rangeInt(3, 10)
        });
    }
}

export default Skeleton;
