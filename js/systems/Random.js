/**
 * Random Utility System
 * Provides deterministic and pseudo-random helpers for procedural generation, combat, and loot.
 */
export class Random {
    /**
     * Returns a float between min (inclusive) and max (exclusive)
     */
    static range(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns an integer between min and max (inclusive)
     */
    static rangeInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Returns true with the given probability (0.0 to 1.0)
     */
    static chance(probability) {
        return Math.random() < probability;
    }

    /**
     * Returns a random element from an array
     */
    static choice(array) {
        if (!array || array.length === 0) return null;
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    /**
     * Chooses an item from an array of { item, weight } objects
     */
    static weightedChoice(weightedList) {
        if (!weightedList || weightedList.length === 0) return null;
        const totalWeight = weightedList.reduce((acc, entry) => acc + (entry.weight || 1), 0);
        let randomRoll = Math.random() * totalWeight;

        for (const entry of weightedList) {
            randomRoll -= (entry.weight || 1);
            if (randomRoll <= 0) {
                return entry.item;
            }
        }
        return weightedList[weightedList.length - 1].item;
    }

    /**
     * Shuffles an array in-place using Fisher-Yates algorithm and returns it
     */
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Generates a simple unique identifier
     */
    static uuid() {
        return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }
}

export default Random;
