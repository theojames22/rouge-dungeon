import { Damage } from './Damage.js';
import { Collision } from '../systems/Collision.js';

/**
 * Combat Coordinator
 * Manages attack resolutions, hit detection, damage application, and combat feedback.
 */
export class Combat {
    /**
     * @param {Object} game 
     */
    constructor(game = null) {
        this.game = game;
        this.combatLog = [];
    }

    setGame(game) {
        this.game = game;
    }

    /**
     * Attempts an attack from attacker against defender
     * @param {Object} attacker 
     * @param {Object} defender 
     * @returns {Object|null} Attack result
     */
    resolveAttack(attacker, defender) {
        if (!attacker || !defender || defender.isDead) return null;

        const weapon = attacker.inventory?.equippedWeapon || attacker.weapon || null;
        const result = Damage.calculate(attacker, defender, weapon);

        if (result.isDodge) {
            defender.onDodge?.();
            this.log(`${defender.name} dodged ${attacker.name}'s attack!`);
            this.game?.renderer?.addFloatingText('MISS', defender.x, defender.y, '#9ca3af');
            this.game?.sound?.playEnemyHit();
            return result;
        }

        // Apply damage
        defender.takeDamage(result.finalDamage);

        // Sound effects
        const isPlayerAttacking = attacker === this.game?.player;
        if (isPlayerAttacking) {
            this.game?.sound?.playPlayerAttack(result.isCrit);
        } else {
            this.game?.sound?.playEnemyHit();
        }

        // Feedback: Floating damage text & particles
        const color = result.isCrit ? '#ef4444' : '#f59e0b';
        const text = result.isCrit ? `${result.finalDamage} CRIT!` : `${result.finalDamage}`;
        this.game?.renderer?.addFloatingText(text, defender.x, defender.y, color);

        if (this.game?.particles) {
            this.game.particles.emitBlood(defender.x, defender.y, result.isCrit ? 16 : 8);
        }

        this.log(`${attacker.name} hit ${defender.name} for ${result.finalDamage} dmg!${result.isCrit ? ' (CRITICAL!)' : ''}`);

        // Death check
        if (defender.isDead) {
            this.log(`${defender.name} was defeated!`);
            if (isPlayerAttacking) {
                this.game?.sound?.playEnemyDeath();
            } else {
                this.game?.sound?.playPlayerDeath();
            }
            attacker.onKillTarget?.(defender);
        }

        return result;
    }

    /**
     * Attacks all enemies in radius around player (e.g. Cleave or AoE)
     */
    resolveAreaAttack(attacker, radius = 1.5) {
        if (!this.game || !this.game.dungeon) return [];

        const targets = this.game.dungeon.enemies.filter(enemy => {
            return !enemy.isDead && Collision.distance(attacker.x, attacker.y, enemy.x, enemy.y) <= radius;
        });

        const results = [];
        for (const target of targets) {
            results.push(this.resolveAttack(attacker, target));
        }
        return results;
    }

    log(message) {
        this.combatLog.push({ message, time: Date.now() });
        if (this.combatLog.length > 50) {
            this.combatLog.shift();
        }
        this.game?.hud?.updateCombatLog(message);
    }
}

export default Combat;
