import { Item, ItemRarity } from './Item.js';
import { Random } from '../systems/Random.js';

/**
 * Weapon Item representation
 */
export class WeaponItem extends Item {
    /**
     * @param {Object} config 
     */
    constructor(config = {}) {
        super({
            ...config,
            type: 'weapon',
            stackable: false
        });

        this.damageMin = config.damageMin || 3;
        this.damageMax = config.damageMax || 7;
        this.weaponType = config.weaponType || 'sword'; // 'sword', 'dagger', 'axe', 'staff'
        this.critChanceBonus = config.critChanceBonus || 0.05;
        this.range = config.range || 1;
        this.equipped = false;
    }

    /**
     * Equipping/Unequipping toggle
     */
    use(user) {
        if (!user || !user.inventory) return false;
        user.inventory.equipWeapon(this);
        return true;
    }

    /**
     * Generates a random weapon scaled to dungeon floor level
     * @param {number} floorLevel 
     */
    static createRandomWeapon(floorLevel = 1) {
        const weaponTypes = [
            { type: 'sword', name: 'Blade', icon: '⚔️', minScale: 1.0, maxScale: 1.2 },
            { type: 'dagger', name: 'Dagger', icon: '🗡️', minScale: 0.8, maxScale: 1.0, crit: 0.15 },
            { type: 'axe', name: 'Battleaxe', icon: '🪓', minScale: 1.2, maxScale: 1.5, crit: 0.02 },
            { type: 'staff', name: 'Arcane Staff', icon: '🪄', minScale: 0.9, maxScale: 1.3, crit: 0.08 }
        ];

        const rarities = [
            { item: ItemRarity.COMMON, weight: 60, mult: 1.0, prefix: 'Worn' },
            { item: ItemRarity.UNCOMMON, weight: 25, mult: 1.25, prefix: 'Reinforced' },
            { item: ItemRarity.RARE, weight: 10, mult: 1.6, prefix: 'Gilded' },
            { item: ItemRarity.EPIC, weight: 4, mult: 2.1, prefix: 'Runic' },
            { item: ItemRarity.LEGENDARY, weight: 1, mult: 2.8, prefix: 'Mythic' }
        ];

        const chosenRarity = Random.weightedChoice(rarities);
        const rarityMeta = rarities.find(r => r.item === chosenRarity);
        const baseType = Random.choice(weaponTypes);

        const baseDmg = 4 + floorLevel * 2;
        const minDmg = Math.round(baseDmg * baseType.minScale * rarityMeta.mult);
        const maxDmg = Math.round((baseDmg + 3) * baseType.maxScale * rarityMeta.mult);

        return new WeaponItem({
            name: `${rarityMeta.prefix} ${baseType.name}`,
            description: `A fine ${baseType.type} capable of dealing ${minDmg}-${maxDmg} physical damage.`,
            icon: baseType.icon,
            sprite: baseType.type === 'dagger' ? 'assets/images/items/dagger.png' : 'assets/images/items/sword.png',
            rarity: chosenRarity,
            weaponType: baseType.type,
            damageMin: minDmg,
            damageMax: maxDmg,
            critChanceBonus: baseType.crit || 0.05,
            value: Math.round(15 * floorLevel * rarityMeta.mult)
        });
    }
}

export default WeaponItem;
