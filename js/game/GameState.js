/**
 * Game State Machine and Enum Definitions
 */
export const States = Object.freeze({
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    INVENTORY: 'INVENTORY',
    GAME_OVER: 'GAME_OVER',
    VICTORY: 'VICTORY'
});

export class GameState {
    constructor(initialState = States.MENU) {
        this.currentState = initialState;
        this.previousState = null;
        this.listeners = [];
        this.stateStartTime = Date.now();
    }

    /**
     * Changes current game state
     * @param {string} newState 
     * @param {Object} payload 
     */
    setState(newState, payload = {}) {
        if (this.currentState === newState) return;

        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateStartTime = Date.now();

        this.listeners.forEach(cb => cb(this.currentState, this.previousState, payload));
    }

    onStateChange(callback) {
        this.listeners.push(callback);
    }

    is(state) {
        return this.currentState === state;
    }

    isPlaying() {
        return this.currentState === States.PLAYING;
    }
}

export default GameState;
