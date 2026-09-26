/**
 * Collision System
 * Handles spatial queries, distance calculations, and hit detection.
 */
export class Collision {
    /**
     * Checks if two bounding boxes intersect
     * @param {{x: number, y: number, width: number, height: number}} a 
     * @param {{x: number, y: number, width: number, height: number}} b 
     */
    static checkAABB(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    /**
     * Calculates Euclidean distance between two points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates Manhattan distance (grid distance)
     */
    static manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    /**
     * Checks if point is within a circle
     */
    static pointInCircle(px, py, cx, cy, radius) {
        return Collision.distance(px, py, cx, cy) <= radius;
    }

    /**
     * Checks if there is an unobstructed line of sight between two grid coordinates
     * @param {Object} dungeon 
     * @param {number} x0 
     * @param {number} y0 
     * @param {number} x1 
     * @param {number} y1 
     */
    static hasLineOfSight(dungeon, x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let curX = x0;
        let curY = y0;

        while (true) {
            if (curX === x1 && curY === y1) return true;

            const tile = dungeon.getTile(curX, curY);
            if (!tile || !tile.transparent) {
                // If not start point and opaque, blocked
                if (curX !== x0 || curY !== y0) return false;
            }

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                curX += sx;
            }
            if (e2 < dx) {
                err += dx;
                curY += sy;
            }
        }
    }
}

export default Collision;
