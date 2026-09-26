import { Random } from '../systems/Random.js';

export const ItemRarity = Object.freeze({
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
});

export const RarityColors = Object.freeze({
    [ItemRarity.COMMON]: '#9ca3af',
    [ItemRarity.UNCOMMON]: '#34d399',
    [ItemRarity.RARE]: '#60a5fa',
    [ItemRarity.EPIC]: '#a78bfa',
    [ItemRarity.LEGENDARY]: '#f59e0b'
});

/**
 * Base Item Class
 */
export class Item {
    /**
     * @param {Object} config 
     */
    constructor(config = {}) {
        this.id = config.id || Random.uuid();
        this.name = config.name || 'Mysterious Artifact';
        this.description = config.description || 'An item found in the depths.';
        this.icon = config.icon || '📦';
        this.type = config.type || 'misc'; // 'weapon', 'potion', 'armor', 'scroll'
        this.rarity = config.rarity || ItemRarity.COMMON;
        this.value = config.value || 10;
        this.stackable = config.stackable || false;
        this.quantity = config.quantity || 1;
        this.sprite = config.sprite || 'assets/images/items/sword.png';
    }

    getRarityColor() {
        return RarityColors[this.rarity] || '#ffffff';
    }

    /**
     * Action when used from inventory
     * @param {Object} user 
     * @returns {boolean} Whether consumption/use succeeded
     */
    use(user) {
        return false;
    }
}

export default Item;
