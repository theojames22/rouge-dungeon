import { Enemy } from './Enemy.js';
import { Random } from '../systems/Random.js';

/**
 * Goblin Enemy
 * Quick-footed skirmisher with fast attacks and cunning movement.
 */
export class Goblin extends Enemy {
    constructor(x, y, floorLevel = 1) {
        super({
            name: 'Cave Goblin',
            type: 'goblin',
            icon: '👺',
            color: '#10b981',
            x,
            y,
            maxHp: 16 + floorLevel * 5,
            baseAttack: 3 + floorLevel * 2,
            baseDefense: 1 + Math.floor(floorLevel * 0.5),
            evasion: 0.15, // Nimble
            critChance: 0.10,
            moveCooldown: 450, // Faster than normal monsters
            aggroRadius: 8,
            expReward: 18 + floorLevel * 5,
            goldReward: Random.rangeInt(5, 12)
        });
    }
}

export default Goblin;
