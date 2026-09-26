/**
 * Main Menu Controller
 * Handles title screen, class selection, controls modal, and expedition initiation.
 */
export class Menu {
    /**
     * @param {Object} game 
     */
    constructor(game) {
        this.game = game;
        this.modal = document.getElementById('menu-modal');
        this.startBtn = document.getElementById('btn-start-game');
        this.resumeBtn = document.getElementById('btn-resume-game');
        this.controlsBtn = document.getElementById('btn-show-controls');
        this.controlsModal = document.getElementById('controls-modal');
        this.closeControlsBtn = document.getElementById('btn-close-controls');

        this.selectedClass = 'knight';
        this._setupListeners();
    }

    _setupListeners() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                this.close();
                this.game.startNewGame(this.selectedClass);
            });
        }

        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => {
                this.close();
                this.game.resume();
            });
        }

        if (this.controlsBtn && this.controlsModal) {
            this.controlsBtn.addEventListener('click', () => {
                this.controlsModal.classList.remove('hidden');
            });
        }

        if (this.closeControlsBtn && this.controlsModal) {
            this.closeControlsBtn.addEventListener('click', () => {
                this.controlsModal.classList.add('hidden');
            });
        }

        // Class selection cards
        const classCards = document.querySelectorAll('.class-card');
        classCards.forEach(card => {
            card.addEventListener('click', () => {
                classCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedClass = card.dataset.class;
            });
        });

        // ESC hotkey to toggle menu
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.controlsModal && !this.controlsModal.classList.contains('hidden')) {
                    this.controlsModal.classList.add('hidden');
                } else if (!this.game?.inventoryUI?.isOpen && !this.game?.gameOverUI?.isOpen) {
                    this.toggle();
                }
            }
        });
    }

    open(canResume = false) {
        if (!this.modal) return;
        this.modal.classList.remove('hidden');
        if (this.resumeBtn) {
            this.resumeBtn.style.display = canResume ? 'inline-block' : 'none';
        }
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
    }

    toggle() {
        if (this.modal.classList.contains('hidden')) {
            this.open(this.game.isGameRunning);
            this.game.pause();
        } else {
            this.close();
            if (this.game.isGameRunning) {
                this.game.resume();
            }
        }
    }
}

export default Menu;
