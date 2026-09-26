import { Random } from '../systems/Random.js';

/**
 * Damage Calculation Engine
 * Calculates mitigation, critical strikes, and damage variance.
 */
export class Damage {
    /**
     * Calculates the damage dealt from attacker to defender
     * @param {Object} attacker 
     * @param {Object} defender 
     * @param {Object} weapon 
     * @returns {{ finalDamage: number, isCrit: boolean, isDodge: boolean }}
     */
    static calculate(attacker, defender, weapon = null) {
        // Check for dodge / evasion
        const defenderEvasion = defender.stats?.evasion || 0.05;
        if (Random.chance(defenderEvasion)) {
            return {
                finalDamage: 0,
                isCrit: false,
                isDodge: true
            };
        }

        // Determine base damage roll
        let minDmg = 1;
        let maxDmg = 4;
        let critChance = 0.05;

        if (attacker.stats) {
            minDmg = attacker.stats.baseAttack || 2;
            maxDmg = minDmg + 3;
            critChance = attacker.stats.critChance || 0.05;
        }

        if (weapon) {
            minDmg += (weapon.damageMin || 2);
            maxDmg += (weapon.damageMax || 5);
            critChance += (weapon.critChanceBonus || 0);
        }

        let rawDamage = Random.rangeInt(minDmg, maxDmg);

        // Critical strike check
        const isCrit = Random.chance(critChance);
        if (isCrit) {
            rawDamage = Math.round(rawDamage * 1.75);
        }

        // Defense mitigation
        const defense = defender.stats ? (defender.stats.totalDefense || defender.stats.baseDefense || 0) : 0;
        const mitigation = 100 / (100 + defense * 4);
        let finalDamage = Math.max(1, Math.round(rawDamage * mitigation));

        return {
            finalDamage,
            isCrit,
            isDodge: false
        };
    }
}

export default Damage;
