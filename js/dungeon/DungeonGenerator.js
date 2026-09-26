import { Tile, TileType } from './Tile.js';
import { Room } from './Room.js';
import { Random } from '../systems/Random.js';

/**
 * Procedural Dungeon Generator
 * Generates room networks, interconnecting corridors, doors, and dungeon features.
 */
export class DungeonGenerator {
    /**
     * @param {Object} options 
     */
    constructor(options = {}) {
        this.width = options.width || 60;
        this.height = options.height || 45;
        this.minRoomSize = options.minRoomSize || 6;
        this.maxRoomSize = options.maxRoomSize || 12;
        this.maxRooms = options.maxRooms || 14;
    }

    /**
     * Generates a new dungeon level
     * @param {number} levelIndex 
     * @returns {Object} dungeon data
     */
    generate(levelIndex = 1) {
        // Initialize all tiles as WALL
        const tiles = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(new Tile(x, y, TileType.WALL));
            }
            tiles.push(row);
        }

        const rooms = [];

        // Try placing rooms
        const attempts = this.maxRooms * 6;
        for (let i = 0; i < attempts && rooms.length < this.maxRooms; i++) {
            const w = Random.rangeInt(this.minRoomSize, this.maxRoomSize);
            const h = Random.rangeInt(this.minRoomSize, this.maxRoomSize);
            const x = Random.rangeInt(2, this.width - w - 2);
            const y = Random.rangeInt(2, this.height - h - 2);

            const newRoom = new Room(x, y, w, h);
            let overlaps = false;
            for (const other of rooms) {
                if (newRoom.intersects(other, 2)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                this._carveRoom(tiles, newRoom);
                rooms.push(newRoom);
            }
        }

        // Connect rooms with corridors
        for (let i = 0; i < rooms.length - 1; i++) {
            const roomA = rooms[i];
            const roomB = rooms[i + 1];

            // 50% chance horizontal then vertical, or vertical then horizontal
            if (Random.chance(0.5)) {
                this._carveHorizontalTunnel(tiles, roomA.centerX, roomB.centerX, roomA.centerY);
                this._carveVerticalTunnel(tiles, roomA.centerY, roomB.centerY, roomB.centerX);
            } else {
                this._carveVerticalTunnel(tiles, roomA.centerY, roomB.centerY, roomA.centerX);
                this._carveHorizontalTunnel(tiles, roomA.centerX, roomB.centerX, roomB.centerY);
            }
        }

        // Also connect first and last or a random pair to create loops and alternate paths
        if (rooms.length > 2) {
            const randA = rooms[0];
            const randB = rooms[rooms.length - 1];
            this._carveHorizontalTunnel(tiles, randA.centerX, randB.centerX, randB.centerY);
            this._carveVerticalTunnel(tiles, randA.centerY, randB.centerY, randA.centerX);
        }

        // Designate spawn room and exit room
        const spawnRoom = rooms[0];
        spawnRoom.isSpawn = true;

        const exitRoom = rooms[rooms.length - 1];
        if (levelIndex % 5 === 0) {
            exitRoom.isBossRoom = true;
        }

        // Place stairs in exit room
        const stairsPos = { x: exitRoom.centerX, y: exitRoom.centerY };
        tiles[stairsPos.y][stairsPos.x].setType(TileType.STAIRS_DOWN);

        // Decorate walls with torches and floors with details
        this._decorateDungeon(tiles, rooms);

        return {
            width: this.width,
            height: this.height,
            tiles,
            rooms,
            spawnRoom,
            exitRoom,
            stairsPos,
            playerStart: { x: spawnRoom.centerX, y: spawnRoom.centerY }
        };
    }

    _carveRoom(tiles, room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                tiles[y][x].setType(TileType.FLOOR);
            }
        }
    }

    _carveHorizontalTunnel(tiles, x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        for (let x = startX; x <= endX; x++) {
            if (tiles[y] && tiles[y][x]) {
                tiles[y][x].setType(TileType.FLOOR);
            }
        }
    }

    _carveVerticalTunnel(tiles, y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        for (let y = startY; y <= endY; y++) {
            if (tiles[y] && tiles[y][x]) {
                tiles[y][x].setType(TileType.FLOOR);
            }
        }
    }

    _decorateDungeon(tiles, rooms) {
        // Place torches on walls facing floors
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const current = tiles[y][x];
                const south = tiles[y + 1][x];

                // If current is wall and below is floor, torch opportunity
                if (current.isWall() && south.isFloor() && Random.chance(0.12)) {
                    current.decoration = 'torch';
                } else if (current.isFloor() && Random.chance(0.04)) {
                    const decorChoices = ['bones', 'cracks', 'moss', 'blood'];
                    current.decoration = Random.choice(decorChoices);
                }
            }
        }
    }
}

export default DungeonGenerator;
