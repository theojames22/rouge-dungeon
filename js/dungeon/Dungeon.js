import { DungeonGenerator } from './DungeonGenerator.js';
import { TileType } from './Tile.js';

/**
 * Dungeon Manager
 * Holds the current floor layout, spatial queries, FOV (Field of View) calculations, and entities.
 */
export class Dungeon {
    /**
     * @param {number} width 
     * @param {number} height 
     * @param {number} tileSize 
     */
    constructor(width = 60, height = 45, tileSize = 32) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.currentFloor = 1;
        this.tiles = [];
        this.rooms = [];
        this.spawnRoom = null;
        this.exitRoom = null;
        this.stairsPos = { x: 0, y: 0 };
        this.playerStart = { x: 0, y: 0 };
        this.enemies = [];
        this.itemsOnFloor = [];

        this.generator = new DungeonGenerator({
            width: this.width,
            height: this.height,
            minRoomSize: 6,
            maxRoomSize: 12,
            maxRooms: 12
        });
    }

    /**
     * Builds and initializes a new dungeon floor
     * @param {number} floorNumber 
     */
    loadFloor(floorNumber = 1) {
        this.currentFloor = floorNumber;
        this.enemies = [];
        this.itemsOnFloor = [];

        const dungeonData = this.generator.generate(floorNumber);
        this.tiles = dungeonData.tiles;
        this.rooms = dungeonData.rooms;
        this.spawnRoom = dungeonData.spawnRoom;
        this.exitRoom = dungeonData.exitRoom;
        this.stairsPos = dungeonData.stairsPos;
        this.playerStart = dungeonData.playerStart;

        return dungeonData;
    }

    /**
     * Returns tile at coordinate, or null if outside grid
     */
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[y][x];
    }

    /**
     * Check if grid coordinate is walkable
     */
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        if (!tile || !tile.walkable) return false;

        // Check if an enemy is blocking tile
        const hasEnemy = this.enemies.some(e => Math.round(e.x) === x && Math.round(e.y) === y && !e.isDead);
        if (hasEnemy) return false;

        return true;
    }

    /**
     * Check if tile allows light to pass
     */
    isTransparent(x, y) {
        const tile = this.getTile(x, y);
        return tile ? tile.transparent : false;
    }

    /**
     * Calculates Field of View (FOV) using Shadow Casting / Raymarch
     * @param {number} playerX 
     * @param {number} playerY 
     * @param {number} radius 
     */
    computeFOV(playerX, playerY, radius = 9) {
        // Reset visible state
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x].visible = false;
            }
        }

        // Always reveal player position
        const centerTile = this.getTile(playerX, playerY);
        if (centerTile) {
            centerTile.visible = true;
            centerTile.explored = true;
        }

        // Cast rays in 360 degrees
        const numRays = 180;
        for (let i = 0; i < numRays; i++) {
            const angle = (i * 2 * Math.PI) / numRays;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            let curX = playerX + 0.5;
            let curY = playerY + 0.5;

            for (let step = 0; step < radius; step++) {
                curX += dx * 0.5;
                curY += dy * 0.5;

                const tx = Math.floor(curX);
                const ty = Math.floor(curY);

                const tile = this.getTile(tx, ty);
                if (!tile) break;

                tile.visible = true;
                tile.explored = true;

                // If hit opaque wall, stop ray
                if (!tile.transparent) {
                    break;
                }
            }
        }
    }

    /**
     * Adds an item on the floor
     */
    addItem(item, x, y) {
        this.itemsOnFloor.push({ item, x, y });
    }

    /**
     * Removes an item from the floor
     */
    removeItem(item) {
        const index = this.itemsOnFloor.findIndex(entry => entry.item === item);
        if (index !== -1) {
            return this.itemsOnFloor.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * Finds items at grid coordinates
     */
    getItemsAt(x, y) {
        return this.itemsOnFloor.filter(entry => Math.round(entry.x) === x && Math.round(entry.y) === y);
    }
}

export default Dungeon;
