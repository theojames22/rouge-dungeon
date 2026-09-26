import { Experience } from './Experience.js';

/**
 * Level System
 * Governs player level scaling, stat attribute distribution, and perks.
 */
export class LevelSystem {
    /**
     * @param {Object} player 
     */
    constructor(player = null) {
        this.player = player;
        this.experience = new Experience(100, 1.4);
        this.statPointsAvailable = 0;
        this.perks = [];
    }

    setPlayer(player) {
        this.player = player;
    }

    get level() {
        return this.experience.currentLevel;
    }

    get currentExp() {
        return this.experience.currentExp;
    }

    get expNeeded() {
        return this.experience.getExpForNextLevel();
    }

    /**
     * Awards experience points to player and triggers stat growth
     * @param {number} amount 
     */
    gainExp(amount) {
        const result = this.experience.addExp(amount);

        if (result.leveledUp && this.player) {
            for (let i = 0; i < result.levelsGained; i++) {
                this._applyLevelStatsGrowth();
            }
        }

        return result;
    }

    /**
     * Apply automatic attribute growth on level up
     */
    _applyLevelStatsGrowth() {
        if (!this.player || !this.player.stats) return;

        const stats = this.player.stats;
        const hpIncrease = 15;
        const mpIncrease = 10;
        const atkIncrease = 2;
        const defIncrease = 1;

        stats.maxHp += hpIncrease;
        stats.hp = Math.min(stats.hp + hpIncrease, stats.maxHp); // Heal bonus on level up

        stats.maxMp += mpIncrease;
        stats.mp = Math.min(stats.mp + mpIncrease, stats.maxMp);

        stats.baseAttack += atkIncrease;
        stats.baseDefense += defIncrease;

        this.statPointsAvailable += 2;
    }
}

export default LevelSystem;
