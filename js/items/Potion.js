import { Item, ItemRarity } from './Item.js';

/**
 * Potion Consumable Item
 */
export class Potion extends Item {
    /**
     * @param {Object} config 
     */
    constructor(config = {}) {
        super({
            ...config,
            type: 'potion',
            stackable: true,
            quantity: config.quantity || 1
        });

        this.potionType = config.potionType || 'health'; // 'health', 'mana', 'strength'
        this.restoreAmount = config.restoreAmount || 25;
        this.duration = config.duration || 0; // 0 for instant
    }

    /**
     * Consumes potion and applies effects to user
     * @param {Object} user 
     */
    use(user) {
        if (!user || !user.stats) return false;

        let used = false;
        switch (this.potionType) {
            case 'health':
                if (user.stats.hp < user.stats.maxHp) {
                    user.stats.heal(this.restoreAmount);
                    used = true;
                }
                break;
            case 'mana':
                if (user.stats.mp < user.stats.maxMp) {
                    user.stats.restoreMp(this.restoreAmount);
                    used = true;
                }
                break;
            case 'strength':
                user.stats.baseAttack += 3;
                used = true;
                break;
        }

        if (used) {
            this.quantity--;
        }
        return used;
    }

    static createHealthPotion(amount = 30) {
        return new Potion({
            name: 'Healing Flask',
            description: `Restores ${amount} hit points instantly upon drinking.`,
            icon: '🧪',
            sprite: 'assets/images/items/potion_health.png',
            rarity: ItemRarity.COMMON,
            potionType: 'health',
            restoreAmount: amount,
            value: 12
        });
    }

    static createManaPotion(amount = 20) {
        return new Potion({
            name: 'Mana Elixir',
            description: `Restores ${amount} arcane mana for spellcasting and abilities.`,
            icon: '🍶',
            sprite: 'assets/images/items/potion_mana.png',
            rarity: ItemRarity.UNCOMMON,
            potionType: 'mana',
            restoreAmount: amount,
            value: 15
        });
    }
}

export default Potion;
