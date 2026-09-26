/**
 * Weapon Combat Entity
 * Governs weapon attack speeds, ranges, swing animations, and behavior.
 */
export class Weapon {
    /**
     * @param {Object} options 
     */
    constructor(options = {}) {
        this.name = options.name || 'Fists';
        this.damageMin = options.damageMin || 2;
        this.damageMax = options.damageMax || 4;
        this.attackCooldown = options.attackCooldown || 400; // ms between attacks
        this.range = options.range || 1.2; // tiles
        this.weaponType = options.weaponType || 'melee'; // 'melee', 'staff', 'dagger', 'bow'
        this.critChanceBonus = options.critChanceBonus || 0.05;
        this.lastAttackTime = 0;
    }

    /**
     * Checks if weapon is off cooldown and ready to strike
     */
    isReady() {
        return Date.now() - this.lastAttackTime >= this.attackCooldown;
    }

    /**
     * Records an attack swing
     */
    triggerAttack() {
        this.lastAttackTime = Date.now();
    }
}

export default Weapon;
