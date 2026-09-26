/**
 * Experience System
 * Handles experience points, progression thresholds, and leveling math.
 */
export class Experience {
    /**
     * @param {number} baseExp 
     * @param {number} growthFactor 
     */
    constructor(baseExp = 100, growthFactor = 1.35) {
        this.baseExp = baseExp;
        this.growthFactor = growthFactor;
        this.currentExp = 0;
        this.currentLevel = 1;
        this.totalExpGained = 0;
    }

    /**
     * Experience required to reach the next level from level N
     * @param {number} level 
     */
    getExpForNextLevel(level = this.currentLevel) {
        return Math.floor(this.baseExp * Math.pow(this.growthFactor, level - 1));
    }

    /**
     * Add experience and calculate level-ups
     * @param {number} amount 
     * @returns {{ leveledUp: boolean, levelsGained: number, newLevel: number }}
     */
    addExp(amount) {
        if (amount <= 0) return { leveledUp: false, levelsGained: 0, newLevel: this.currentLevel };

        this.currentExp += amount;
        this.totalExpGained += amount;

        let levelsGained = 0;
        let required = this.getExpForNextLevel(this.currentLevel);

        while (this.currentExp >= required) {
            this.currentExp -= required;
            this.currentLevel++;
            levelsGained++;
            required = this.getExpForNextLevel(this.currentLevel);
        }

        return {
            leveledUp: levelsGained > 0,
            levelsGained,
            newLevel: this.currentLevel,
            remainderExp: this.currentExp,
            expNeeded: required
        };
    }

    /**
     * Returns progress percentage towards next level (0.0 to 1.0)
     */
    getProgressRatio() {
        const required = this.getExpForNextLevel(this.currentLevel);
        return Math.min(1.0, Math.max(0.0, this.currentExp / required));
    }
}

export default Experience;
