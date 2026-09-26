import { GameState, States } from './GameState.js';
import { GameLoop } from './GameLoop.js';
import { Dungeon } from '../dungeon/Dungeon.js';
import { Player } from '../player/Player.js';
import { Camera } from '../rendering/Camera.js';
import { Particles } from '../rendering/Particles.js';
import { Renderer } from '../rendering/Renderer.js';
import { Combat } from '../combat/Combat.js';
import { HUD } from '../ui/HUD.js';
import { InventoryUI } from '../ui/InventoryUI.js';
import { Menu } from '../ui/Menu.js';
import { GameOver } from '../ui/GameOver.js';
import { Goblin } from '../enemies/Goblin.js';
import { Skeleton } from '../enemies/Skeleton.js';
import { Slime } from '../enemies/Slime.js';
import { Boss } from '../enemies/Boss.js';
import { Random } from '../systems/Random.js';
import { Potion } from '../items/Potion.js';
import { WeaponItem } from '../items/WeaponItem.js';

/**
 * Main Game Coordinator
 * Orchestrates systems, game state, dungeon progression, and entity lifecycles.
 */
export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.camera = new Camera(800, 600, 32);
        this.particles = new Particles();
        this.renderer = new Renderer(this.canvas, this.camera);
        this.combat = new Combat(this);
        this.state = new GameState(States.MENU);

        this.dungeon = null;
        this.player = null;
        this.currentFloor = 1;
        this.maxFloors = 5;

        // UI instances
        this.hud = new HUD(this);
        this.inventoryUI = new InventoryUI(this);
        this.menuUI = new Menu(this);
        this.gameOverUI = new GameOver(this);

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        this._setupKeyboardShortcuts();
    }

    get isGameRunning() {
        return this.state.is(States.PLAYING);
    }

    _setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Space to descend stairs or interact
            if (e.code === 'Space') {
                if (this.state.is(States.PLAYING)) {
                    this.tryDescendFloor();
                }
            }
            // E for special ability
            if (e.code === 'KeyE') {
                if (this.state.is(States.PLAYING) && this.player) {
                    this.player.useSpecialAbility();
                }
            }
        });
    }

    init() {
        this.menuUI.open(false);
        this.loop.start();
    }

    /**
     * Start a fresh game run
     * @param {string} playerClass 
     */
    startNewGame(playerClass = 'knight') {
        this.currentFloor = 1;
        this.dungeon = new Dungeon(50, 38, 32);
        this.dungeon.loadFloor(this.currentFloor);

        this.player = new Player(this, this.dungeon.playerStart.x, this.dungeon.playerStart.y);

        // Apply class archetype bonuses
        if (playerClass === 'rogue') {
            this.player.name = 'Shadow Rogue';
            this.player.stats.critChance = 0.25;
            this.player.stats.evasion = 0.20;
            this.player.stats.baseAttack = 9;
            this.player.stats.maxHp = 80;
            this.player.stats.hp = 80;
        } else if (playerClass === 'mage') {
            this.player.name = 'Arcane Mage';
            this.player.stats.maxMp = 100;
            this.player.stats.mp = 100;
            this.player.stats.maxHp = 70;
            this.player.stats.hp = 70;
            this.player.stats.baseAttack = 11;
        }

        // Connect inventory callback to HUD
        this.player.inventory.onUpdate(() => {
            this.hud.update();
            if (this.inventoryUI.isOpen) {
                this.inventoryUI.render();
            }
        });

        // Populate entities
        this.populateDungeonEntities(this.currentFloor);

        // Initial camera & FOV
        this.camera.follow(this.player.x, this.player.y);
        this.dungeon.computeFOV(this.player.x, this.player.y, this.player.visionRadius);

        this.state.setState(States.PLAYING);
        this.combat.log(`Entered Dungeon Floor B${this.currentFloor}F. Steel your resolve!`);
        this.hud.update();
    }

    /**
     * Spawns monsters and treasures across dungeon rooms
     * @param {number} floorLevel 
     */
    populateDungeonEntities(floorLevel) {
        if (!this.dungeon) return;

        const isBossFloor = (floorLevel >= this.maxFloors);

        for (let i = 1; i < this.dungeon.rooms.length; i++) {
            const room = this.dungeon.rooms[i];

            // If it's the exit room on boss floor, spawn Boss!
            if (isBossFloor && room === this.dungeon.exitRoom) {
                const boss = new Boss(room.centerX, room.centerY, floorLevel);
                this.dungeon.enemies.push(boss);
                continue;
            }

            // Regular room monster spawns (1 to 3 monsters)
            const monsterCount = Random.rangeInt(1, Math.min(3, 1 + Math.floor(floorLevel / 2)));
            for (let m = 0; m < monsterCount; m++) {
                const pt = room.getRandomPoint(1);
                const enemyType = Random.choice(['goblin', 'skeleton', 'slime']);

                let enemy;
                if (enemyType === 'goblin') {
                    enemy = new Goblin(pt.x, pt.y, floorLevel);
                } else if (enemyType === 'skeleton') {
                    enemy = new Skeleton(pt.x, pt.y, floorLevel);
                } else {
                    enemy = new Slime(pt.x, pt.y, floorLevel);
                }

                this.dungeon.enemies.push(enemy);
            }

            // 40% chance for chest / floor loot
            if (Random.chance(0.40)) {
                const lootPos = room.getRandomPoint(1);
                if (Random.chance(0.6)) {
                    this.dungeon.addItem(Potion.createHealthPotion(30), lootPos.x, lootPos.y);
                } else {
                    this.dungeon.addItem(WeaponItem.createRandomWeapon(floorLevel), lootPos.x, lootPos.y);
                }
            }
        }
    }

    /**
     * Attempts to advance to next dungeon floor
     */
    tryDescendFloor() {
        if (!this.dungeon || !this.player) return;

        const playerTile = this.dungeon.getTile(Math.round(this.player.x), Math.round(this.player.y));
        if (!playerTile || !playerTile.isStairs()) {
            this.combat.log("You must stand on the staircase (▼) to descend.");
            return;
        }

        // Check if boss was defeated on final floor
        if (this.currentFloor >= this.maxFloors) {
            const bossAlive = this.dungeon.enemies.some(e => e.isBoss && !e.isDead);
            if (bossAlive) {
                this.combat.log("The seal remains locked! Slay the Overlord first!");
                return;
            }

            // Victory!
            this.state.setState(States.VICTORY);
            this.loop.pause();
            this.gameOverUI.show(true);
            return;
        }

        // Advance to next floor
        this.currentFloor++;
        this.dungeon.loadFloor(this.currentFloor);

        this.player.x = this.dungeon.playerStart.x;
        this.player.y = this.dungeon.playerStart.y;
        this.player.renderX = this.player.x;
        this.player.renderY = this.player.y;

        this.populateDungeonEntities(this.currentFloor);
        this.dungeon.computeFOV(this.player.x, this.player.y, this.player.visionRadius);
        this.camera.follow(this.player.x, this.player.y);

        this.combat.log(`Descended to Floor B${this.currentFloor}F! The air grows colder...`);
        this.renderer.addFloatingText(`FLOOR B${this.currentFloor}F`, this.player.x, this.player.y, '#38bdf8');
        this.hud.update();
    }

    onPlayerDied() {
        this.state.setState(States.GAME_OVER);
        this.loop.pause();
        this.gameOverUI.show(false);
    }

    pause() {
        this.loop.pause();
    }

    resume() {
        this.loop.resume();
    }

    update(deltaTime) {
        if (!this.state.is(States.PLAYING)) return;

        // Update player
        if (this.player && !this.player.isDead) {
            this.player.update(deltaTime, this.dungeon);
            this.camera.follow(this.player.renderX, this.player.renderY);
        }

        // Update enemies
        if (this.dungeon) {
            for (let i = this.dungeon.enemies.length - 1; i >= 0; i--) {
                const enemy = this.dungeon.enemies[i];
                if (enemy.isDead) {
                    enemy.dropLoot(this.dungeon);
                    this.dungeon.enemies.splice(i, 1);
                    continue;
                }
                enemy.update(deltaTime, this.dungeon, this.player);
            }
        }

        // Update particles
        this.particles.update(deltaTime / 1000);

        // Update camera
        this.camera.update(deltaTime);

        // Update HUD
        this.hud.update();
    }

    render() {
        this.renderer.render(this.dungeon, this.player, this.particles);
    }
}

export default Game;
