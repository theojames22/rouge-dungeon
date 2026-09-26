/**
 * Dungeon Room Representation
 */
export class Room {
    /**
     * @param {number} x - Top-left X coordinate in tiles
     * @param {number} y - Top-left Y coordinate in tiles
     * @param {number} width - Room width in tiles
     * @param {number} height - Room height in tiles
     */
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.centerX = Math.floor(x + width / 2);
        this.centerY = Math.floor(y + height / 2);
        this.doors = [];
        this.connectedRooms = [];
        this.isCleared = false;
        this.isSpawn = false;
        this.isBossRoom = false;
    }

    /**
     * Checks if this room overlaps with another room (with optional padding)
     * @param {Room} other 
     * @param {number} padding 
     * @returns {boolean}
     */
    intersects(other, padding = 1) {
        return (
            this.x - padding <= other.x + other.width &&
            this.x + this.width + padding >= other.x &&
            this.y - padding <= other.y + other.height &&
            this.y + this.height + padding >= other.y
        );
    }

    /**
     * Checks if a point lies inside the room's interior (excluding perimeter walls)
     * @param {number} px 
     * @param {number} py 
     * @returns {boolean}
     */
    contains(px, py) {
        return (
            px >= this.x &&
            px < this.x + this.width &&
            py >= this.y &&
            py < this.y + this.height
        );
    }

    /**
     * Returns a random point in the walkable interior of the room
     * @param {number} margin - inner margin away from walls
     * @returns {{x: number, y: number}}
     */
    getRandomPoint(margin = 1) {
        const minX = this.x + margin;
        const maxX = this.x + this.width - 1 - margin;
        const minY = this.y + margin;
        const maxY = this.y + this.height - 1 - margin;

        const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
        return { x, y };
    }
}

export default Room;
