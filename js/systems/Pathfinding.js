/**
 * A* (A-Star) Pathfinding System for Dungeon Navigation
 */
export class Pathfinding {
    /**
     * Finds the shortest path between start and goal on the dungeon grid
     * @param {Object} dungeon 
     * @param {number} startX 
     * @param {number} startY 
     * @param {number} goalX 
     * @param {number} goalY 
     * @param {number} maxSteps - Limit search depth for performance
     * @returns {Array<{x: number, y: number}>} Array of path nodes excluding start
     */
    static findPath(dungeon, startX, startY, goalX, goalY, maxSteps = 40) {
        startX = Math.round(startX);
        startY = Math.round(startY);
        goalX = Math.round(goalX);
        goalY = Math.round(goalY);

        if (startX === goalX && startY === goalY) return [];

        const key = (x, y) => `${x},${y}`;

        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        const startKey = key(startX, startY);
        gScore.set(startKey, 0);
        fScore.set(startKey, this._heuristic(startX, startY, goalX, goalY));

        openSet.push({ x: startX, y: startY, f: fScore.get(startKey) });

        let stepsCount = 0;

        while (openSet.length > 0 && stepsCount < maxSteps * 8) {
            stepsCount++;

            // Find node with lowest fScore
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = key(current.x, current.y);

            // If reached goal
            if (current.x === goalX && current.y === goalY) {
                return this._reconstructPath(cameFrom, current);
            }

            closedSet.add(currentKey);

            // Check 4 cardinal neighbors
            const neighbors = [
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y }
            ];

            for (const neighbor of neighbors) {
                const neighborKey = key(neighbor.x, neighbor.y);
                if (closedSet.has(neighborKey)) continue;

                const tile = dungeon.getTile(neighbor.x, neighbor.y);
                if (!tile) continue;

                // Check walkability (unless it is the goal tile where player is standing)
                const isGoal = (neighbor.x === goalX && neighbor.y === goalY);
                if (!isGoal && !tile.walkable) {
                    continue;
                }

                const tentativeG = gScore.get(currentKey) + 1;

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeG);
                    const h = this._heuristic(neighbor.x, neighbor.y, goalX, goalY);
                    const f = tentativeG + h;
                    fScore.set(neighborKey, f);

                    if (!openSet.some(item => item.x === neighbor.x && item.y === neighbor.y)) {
                        openSet.push({ x: neighbor.x, y: neighbor.y, f });
                    }
                }
            }
        }

        // Return empty if no path found
        return [];
    }

    static _heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    static _reconstructPath(cameFrom, current) {
        const totalPath = [];
        let curr = current;
        const key = (x, y) => `${x},${y}`;

        while (cameFrom.has(key(curr.x, curr.y))) {
            totalPath.unshift({ x: curr.x, y: curr.y });
            curr = cameFrom.get(key(curr.x, curr.y));
        }

        return totalPath;
    }
}

export default Pathfinding;
