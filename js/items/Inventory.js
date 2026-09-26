import { WeaponItem } from './WeaponItem.js';

/**
 * Player Inventory System
 * Manages item storage, stacking, equipment slots, and currency.
 */
export class Inventory {
    /**
     * @param {number} capacity 
     */
    constructor(capacity = 16) {
        this.capacity = capacity;
        this.items = [];
        this.equippedWeapon = null;
        this.gold = 0;
        this.onChangeCallbacks = [];
    }

    onUpdate(callback) {
        this.onChangeCallbacks.push(callback);
    }

    _notify() {
        this.onChangeCallbacks.forEach(cb => cb(this));
    }

    /**
     * Adds an item to the inventory
     * @param {Item} item 
     * @returns {boolean} Success
     */
    addItem(item) {
        if (!item) return false;

        // Check if stackable
        if (item.stackable) {
            const existing = this.items.find(i => i.name === item.name);
            if (existing) {
                existing.quantity += (item.quantity || 1);
                this._notify();
                return true;
            }
        }

        // Check capacity
        if (this.items.length >= this.capacity) {
            return false; // Inventory full
        }

        this.items.push(item);
        this._notify();
        return true;
    }

    /**
     * Removes an item at a specific index
     * @param {number} index 
     * @returns {Item|null}
     */
    removeItem(index) {
        if (index < 0 || index >= this.items.length) return null;
        const removed = this.items.splice(index, 1)[0];
        this._notify();
        return removed;
    }

    /**
     * Uses item at index
     * @param {number} index 
     * @param {Object} user 
     */
    useItem(index, user) {
        const item = this.items[index];
        if (!item) return false;

        if (item.type === 'weapon') {
            this.equipWeapon(item);
            this._notify();
            return true;
        }

        const success = item.use(user);
        if (success) {
            if (item.stackable && item.quantity <= 0) {
                this.items.splice(index, 1);
            }
            this._notify();
        }
        return success;
    }

    /**
     * Equips a weapon, swapping out the previous equipped weapon
     * @param {WeaponItem} weapon 
     */
    equipWeapon(weapon) {
        if (this.equippedWeapon) {
            this.equippedWeapon.equipped = false;
        }

        this.equippedWeapon = weapon;
        if (weapon) {
            weapon.equipped = true;
        }
        this._notify();
    }

    /**
     * Unequips currently equipped weapon
     */
    unequipWeapon() {
        if (this.equippedWeapon) {
            this.equippedWeapon.equipped = false;
            this.equippedWeapon = null;
            this._notify();
        }
    }

    addGold(amount) {
        this.gold = Math.max(0, this.gold + amount);
        this._notify();
    }
}

export default Inventory;
