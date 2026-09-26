/**
 * Tile Types and Tile Representation in the Dungeon Grid
 */
export const TileType = Object.freeze({
    VOID: 0,
    WALL: 1,
    FLOOR: 2,
    DOOR: 3,
    STAIRS_DOWN: 4,
    CHEST: 5
});

export class Tile {
    /**
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @param {number} type - TileType enum value
     */
    constructor(x, y, type = TileType.WALL) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.walkable = type !== TileType.WALL && type !== TileType.VOID;
        this.transparent = type !== TileType.WALL && type !== TileType.VOID;
        this.explored = false; // Seen at least once (reveals in fog of war)
        this.visible = false;  // Currently in player's field of view
        this.variant = Math.floor(Math.random() * 4); // Texture variation
        this.decoration = null; // Optional: 'torch', 'moss', 'cracks', 'bones'
    }

    /**
     * Update tile type and derived walkability/transparency
     * @param {number} newType 
     */
    setType(newType) {
        this.type = newType;
        this.walkable = newType !== TileType.WALL && newType !== TileType.VOID;
        this.transparent = newType !== TileType.WALL && newType !== TileType.VOID;
    }

    isWall() {
        return this.type === TileType.WALL;
    }

    isFloor() {
        return this.type === TileType.FLOOR;
    }

    isDoor() {
        return this.type === TileType.DOOR;
    }

    isStairs() {
        return this.type === TileType.STAIRS_DOWN;
    }

    isChest() {
        return this.type === TileType.CHEST;
    }
}

export default Tile;
