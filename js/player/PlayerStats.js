/**
 * Player Stats Management
 */
export class PlayerStats {
    /**
     * @param {Object} options 
     */
    constructor(options = {}) {
        this.maxHp = options.maxHp || 100;
        this.hp = this.maxHp;

        this.maxMp = options.maxMp || 50;
        this.mp = this.maxMp;

        this.baseAttack = options.baseAttack || 8;
        this.baseDefense = options.baseDefense || 3;

        this.critChance = options.critChance || 0.10; // 10% base crit
        this.evasion = options.evasion || 0.08;       // 8% base dodge
        this.moveSpeed = options.moveSpeed || 4;     // Tiles per second
    }

    get totalAttack() {
        return this.baseAttack;
    }

    get totalDefense() {
        return this.baseDefense;
    }

    get isDead() {
        return this.hp <= 0;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - Math.max(1, amount));
        return this.hp <= 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    useMp(amount) {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        return false;
    }

    restoreMp(amount) {
        this.mp = Math.min(this.maxMp, this.mp + amount);
    }

    reset() {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }
}

export default PlayerStats;
