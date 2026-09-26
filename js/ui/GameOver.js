/**
 * Game Over & Victory UI Modal
 * Displays run statistics, cause of defeat or conquest, and retry triggers.
 */
export class GameOver {
    /**
     * @param {Object} game 
     */
    constructor(game) {
        this.game = game;
        this.modal = document.getElementById('gameover-modal');
        this.title = document.getElementById('gameover-title');
        this.subtitle = document.getElementById('gameover-subtitle');
        this.statsContainer = document.getElementById('gameover-stats');
        this.restartBtn = document.getElementById('btn-restart-game');
        this.isOpen = false;

        this._setupListeners();
    }

    _setupListeners() {
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.close();
                this.game.startNewGame();
            });
        }
    }

    /**
     * Shows Game Over / Victory Modal
     * @param {boolean} isVictory 
     */
    show(isVictory = false) {
        if (!this.modal) return;
        this.isOpen = true;
        this.modal.classList.remove('hidden');

        if (isVictory) {
            this.title.textContent = 'DUNGEON CONQUERED!';
            this.title.style.color = '#38bdf8';
            this.subtitle.textContent = 'You have slain the Overlord and claimed the Abyssal Crown!';
        } else {
            this.title.textContent = 'YOU DIED';
            this.title.style.color = '#ef4444';
            this.subtitle.textContent = 'Your soul remains trapped in the dark catacombs.';
        }

        const player = this.game.player;
        const floor = this.game.dungeon?.currentFloor || 1;
        const kills = player?.kills || 0;
        const gold = player?.inventory?.gold || 0;
        const level = player?.levelSystem?.level || 1;

        if (this.statsContainer) {
            this.statsContainer.innerHTML = `
                <div class="stat-row"><span>Floor Reached:</span><strong>B${floor}F</strong></div>
                <div class="stat-row"><span>Character Level:</span><strong>Level ${level}</strong></div>
                <div class="stat-row"><span>Foes Slain:</span><strong>${kills}</strong></div>
                <div class="stat-row"><span>Gold Hoarded:</span><strong>${gold} Gold</strong></div>
            `;
        }
    }

    close() {
        if (!this.modal) return;
        this.isOpen = false;
        this.modal.classList.add('hidden');
    }
}

export default GameOver;
