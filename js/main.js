import { Game } from './game/Game.js';

/**
 * Application Entry Point
 */
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    // Attach to window for developer inspection / console access
    window.gameInstance = game;
    console.log("%c⚔️ Roguelike Dungeon initialized! ⚔️", "color: #38bdf8; font-weight: bold; font-size: 14px;");
});
