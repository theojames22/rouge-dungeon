import { Enemy } from './Enemy.js';
import { Random } from '../systems/Random.js';
import { WeaponItem } from '../items/WeaponItem.js';
import { ItemRarity } from '../items/Item.js';
import { Potion } from '../items/Potion.js';

/**
 * Dungeon Boss Enemy
 * Powerful floor guardian with phase transitions, heavy attacks, and guaranteed legendary spoils.
 */
export class Boss extends Enemy {
    constructor(x, y, floorLevel = 5) {
        super({
            name: 'Overlord of the Abyss',
            type: 'boss',
            icon: '👹',
            color: '#dc2626',
            x,
            y,
            maxHp: 120 + floorLevel * 25,
            baseAttack: 12 + floorLevel * 3,
            baseDefense: 6 + floorLevel,
            evasion: 0.05,
            critChance: 0.15,
            moveCooldown: 500,
            aggroRadius: 14,
            expReward: 150 + floorLevel * 30,
            goldReward: Random.rangeInt(50, 100),
            isBoss: true
        });

        this.enraged = false;
        this.title = 'Lord of the Catacombs';
    }

    takeDamage(amount) {
        super.takeDamage(amount);

        // Enrage at 50% health
        if (!this.enraged && this.stats.hp <= this.stats.maxHp * 0.5) {
            this.enraged = true;
            this.stats.baseAttack += 5;
            this.stats.moveCooldown = 380;
            this.color = '#ef4444';
        }
    }

    dropLoot(dungeon) {
        if (!dungeon) return;

        // Guaranteed Legendary / Epic Weapon
        const weapon = WeaponItem.createRandomWeapon(dungeon.currentFloor + 2);
        weapon.rarity = ItemRarity.LEGENDARY;
        weapon.name = 'Abyssal Reaver';
        weapon.damageMin += 8;
        weapon.damageMax += 12;
        dungeon.addItem(weapon, this.x, this.y);

        // Guaranteed Potions
        dungeon.addItem(Potion.createHealthPotion(60), this.x + 1, this.y);
        dungeon.addItem(Potion.createManaPotion(40), this.x - 1, this.y);
    }
}

export default Boss;
