import { TileType } from '../dungeon/Tile.js';

/**
 * Pixel Art HTML5 Canvas Dungeon Renderer
 * Renders authentic pixel art tiles, entities, dynamic lighting, and retro floating text.
 */
export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {Object} camera 
     */
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = camera;
        this.tileSize = 32;

        this.floatingTexts = [];
        this.torchFlicker = 0;
        this.sprites = {};
        this._loadSprites();

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    _loadSprites() {
        const spriteList = {
            // Player
            player_down: 'assets/images/player/player_down.png',
            player_up: 'assets/images/player/player_up.png',
            player_left: 'assets/images/player/player_left.png',
            player_right: 'assets/images/player/player_right.png',
            player_attack: 'assets/images/player/player_attack.png',
            player_death: 'assets/images/player/player_death.png',

            // Enemies
            goblin: 'assets/images/enemies/goblin.png',
            skeleton: 'assets/images/enemies/skeleton.png',
            slime: 'assets/images/enemies/slime.png',
            boss: 'assets/images/bosses/boss.png',

            // Tiles
            floor: 'assets/images/tiles/floor.png',
            floor_moss: 'assets/images/tiles/floor_moss.png',
            wall: 'assets/images/tiles/wall.png',
            wall_torch: 'assets/images/tiles/wall_torch.png',
            stairs: 'assets/images/tiles/stairs.png',
            chest: 'assets/images/tiles/chest.png',

            // Items
            sword: 'assets/images/items/sword.png',
            dagger: 'assets/images/items/dagger.png',
            potion_health: 'assets/images/items/potion_health.png',
            potion_mana: 'assets/images/items/potion_mana.png',
            gold: 'assets/images/items/gold.png'
        };

        for (const [key, src] of Object.entries(spriteList)) {
            const img = new Image();
            img.src = src;
            this.sprites[key] = img;
        }
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.camera.resize(this.canvas.width, this.canvas.height);

        // Ensure crisp pixel art rendering across all displays
        this.ctx.imageSmoothingEnabled = false;
    }

    addFloatingText(text, gridX, gridY, color = '#ffffff') {
        this.floatingTexts.push({
            text,
            x: gridX * this.tileSize + this.tileSize / 2,
            y: gridY * this.tileSize,
            color,
            alpha: 1.0,
            vy: -1.2,
            lifetime: 1.2
        });
    }

    /**
     * Main Render Loop
     * @param {Object} dungeon 
     * @param {Object} player 
     * @param {Object} particles 
     */
    render(dungeon, player, particles) {
        const ctx = this.ctx;

        // Force pixel art nearest-neighbor rendering
        ctx.imageSmoothingEnabled = false;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fill background with deep abyssal dark
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!dungeon) return;

        this.torchFlicker += 0.05;

        // 1. Render Visible & Explored Tiles
        this._renderTiles(dungeon, player);

        // 2. Render Items on Floor
        this._renderFloorItems(dungeon);

        // 3. Render Enemies
        this._renderEnemies(dungeon);

        // 4. Render Player
        if (player) {
            this._renderPlayer(player);
        }

        // 5. Render Particles
        if (particles) {
            particles.render(ctx, this.camera);
        }

        // 6. Render Floating Combat Text
        this._renderFloatingText();

        // 7. Ambient Lighting & Fog of War Overlay
        this._renderLightingVignette(player);
    }

    _renderTiles(dungeon, player) {
        const ctx = this.ctx;
        const cam = this.camera;
        const ts = this.tileSize;

        const minTileX = Math.max(0, Math.floor(cam.x / ts) - 1);
        const maxTileX = Math.min(dungeon.width - 1, Math.ceil((cam.x + cam.viewportWidth) / ts) + 1);
        const minTileY = Math.max(0, Math.floor(cam.y / ts) - 1);
        const maxTileY = Math.min(dungeon.height - 1, Math.ceil((cam.y + cam.viewportHeight) / ts) + 1);

        for (let y = minTileY; y <= maxTileY; y++) {
            for (let x = minTileX; x <= maxTileX; x++) {
                const tile = dungeon.getTile(x, y);
                if (!tile || !tile.explored) continue;

                const screen = cam.tileToScreen(x, y);

                ctx.save();
                // If explored but not currently visible, darken with fog
                if (!tile.visible) {
                    ctx.filter = 'brightness(26%) saturate(20%)';
                }

                switch (tile.type) {
                    case TileType.WALL:
                        if (tile.decoration === 'torch' && this.sprites.wall_torch?.complete) {
                            ctx.drawImage(this.sprites.wall_torch, screen.x, screen.y, ts, ts);
                        } else if (this.sprites.wall?.complete) {
                            ctx.drawImage(this.sprites.wall, screen.x, screen.y, ts, ts);
                        } else {
                            ctx.fillStyle = '#1e293b';
                            ctx.fillRect(screen.x, screen.y, ts, ts);
                        }
                        break;

                    case TileType.FLOOR:
                        if (tile.decoration === 'moss' && this.sprites.floor_moss?.complete) {
                            ctx.drawImage(this.sprites.floor_moss, screen.x, screen.y, ts, ts);
                        } else if (this.sprites.floor?.complete) {
                            ctx.drawImage(this.sprites.floor, screen.x, screen.y, ts, ts);
                        } else {
                            ctx.fillStyle = '#111827';
                            ctx.fillRect(screen.x, screen.y, ts, ts);
                        }
                        break;

                    case TileType.STAIRS_DOWN:
                        if (this.sprites.stairs?.complete) {
                            ctx.drawImage(this.sprites.stairs, screen.x, screen.y, ts, ts);
                        } else {
                            ctx.fillStyle = '#1e1b4b';
                            ctx.fillRect(screen.x, screen.y, ts, ts);
                        }
                        break;

                    case TileType.CHEST:
                        if (this.sprites.chest?.complete) {
                            ctx.drawImage(this.sprites.chest, screen.x, screen.y, ts, ts);
                        } else {
                            ctx.fillStyle = '#b45309';
                            ctx.fillRect(screen.x, screen.y, ts, ts);
                        }
                        break;
                }

                ctx.restore();
            }
        }
    }

    _renderFloorItems(dungeon) {
        const ctx = this.ctx;
        const cam = this.camera;
        const ts = this.tileSize;
        const now = Date.now();

        for (const entry of dungeon.itemsOnFloor) {
            const tile = dungeon.getTile(entry.x, entry.y);
            if (!tile || !tile.visible) continue;

            const screen = cam.worldToScreen(entry.x * ts, entry.y * ts);
            const bob = Math.sin(now * 0.005 + entry.x * 2) * 2.5;

            ctx.save();
            ctx.shadowColor = entry.item.getRarityColor();
            ctx.shadowBlur = 10;

            let sprite = null;
            if (entry.item.potionType === 'health') {
                sprite = this.sprites.potion_health;
            } else if (entry.item.potionType === 'mana') {
                sprite = this.sprites.potion_mana;
            } else if (entry.item.weaponType === 'dagger') {
                sprite = this.sprites.dagger;
            } else if (entry.item.type === 'weapon') {
                sprite = this.sprites.sword;
            } else if (entry.item.name?.toLowerCase().includes('gold')) {
                sprite = this.sprites.gold;
            }

            if (sprite && sprite.complete) {
                const itemSize = 24;
                const offsetX = screen.x + (ts - itemSize) / 2;
                const offsetY = screen.y + (ts - itemSize) / 2 + bob;
                ctx.drawImage(sprite, offsetX, offsetY, itemSize, itemSize);
            } else {
                ctx.font = '18px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(entry.item.icon || '📦', screen.x + ts / 2, screen.y + ts / 2 + bob);
            }

            ctx.restore();
        }
    }

    _renderEnemies(dungeon) {
        const ctx = this.ctx;
        const cam = this.camera;
        const ts = this.tileSize;
        const now = Date.now();

        for (const enemy of dungeon.enemies) {
            if (enemy.isDead) continue;

            const tile = dungeon.getTile(Math.round(enemy.x), Math.round(enemy.y));
            if (!tile || !tile.visible) continue;

            const screen = cam.worldToScreen(enemy.renderX * ts, enemy.renderY * ts);

            ctx.save();

            // Boss Rendering
            if (enemy.isBoss) {
                // Impressive dark aura
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#dc2626';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(screen.x + ts / 2, screen.y + ts / 2, 28, 0, Math.PI * 2);
                ctx.stroke();

                if (this.sprites.boss?.complete) {
                    const bossW = 54;
                    const bossH = 50;
                    ctx.drawImage(
                        this.sprites.boss,
                        screen.x + (ts - bossW) / 2,
                        screen.y + (ts - bossH) / 2 - 8,
                        bossW,
                        bossH
                    );
                } else {
                    ctx.font = '28px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(enemy.icon, screen.x + ts / 2, screen.y + ts / 2);
                }
            } else {
                // Standard Monsters (Goblin, Skeleton, Slime)
                let sprite = null;
                if (enemy.type === 'goblin') sprite = this.sprites.goblin;
                else if (enemy.type === 'skeleton') sprite = this.sprites.skeleton;
                else if (enemy.type === 'slime') sprite = this.sprites.slime;

                if (sprite && sprite.complete) {
                    const spriteW = 32;
                    let spriteH = 34;
                    let offsetY = screen.y - 4;

                    // Slime squish animation
                    if (enemy.type === 'slime') {
                        const squish = 1 + Math.sin(now * 0.007 + enemy.x) * 0.12;
                        spriteH = Math.round(30 * squish);
                        offsetY = screen.y + (ts - spriteH);
                    }

                    ctx.drawImage(
                        sprite,
                        screen.x + (ts - spriteW) / 2,
                        offsetY,
                        spriteW,
                        spriteH
                    );
                } else {
                    ctx.font = '20px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(enemy.icon, screen.x + ts / 2, screen.y + ts / 2);
                }
            }

            // Pixelated Health Bar Over Damaged Enemy
            if (enemy.stats.hp < enemy.stats.maxHp || enemy.isBoss) {
                const barWidth = enemy.isBoss ? 48 : 28;
                const barHeight = 4;
                const barX = screen.x + (ts - barWidth) / 2;
                const barY = screen.y - (enemy.isBoss ? 14 : 8);
                const hpRatio = Math.max(0, enemy.stats.hp / enemy.stats.maxHp);

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

                ctx.fillStyle = enemy.isBoss ? '#dc2626' : '#22c55e';
                ctx.fillRect(barX, barY, Math.round(barWidth * hpRatio), barHeight);
            }

            ctx.restore();
        }
    }

    _renderPlayer(player) {
        const ctx = this.ctx;
        const cam = this.camera;
        const ts = this.tileSize;
        const screen = cam.worldToScreen(player.renderX * ts, player.renderY * ts);

        ctx.save();

        // Player Aura / Torch radius glow under feet
        const gradient = ctx.createRadialGradient(
            screen.x + ts / 2, screen.y + ts / 2, 4,
            screen.x + ts / 2, screen.y + ts / 2, 28
        );
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x + ts / 2, screen.y + ts / 2, 28, 0, Math.PI * 2);
        ctx.fill();

        // Directional Sprite Selection
        let sprite = this.sprites.player_down;
        if (player.isDead) {
            sprite = this.sprites.player_death;
        } else if (player.facing === 'up') {
            sprite = this.sprites.player_up;
        } else if (player.facing === 'left') {
            sprite = this.sprites.player_right;  // sprite names swapped: left key -> player_right.png
        } else if (player.facing === 'right') {
            sprite = this.sprites.player_left;   // sprite names swapped: right key -> player_left.png
        }

        if (sprite && sprite.complete) {
            const playerW = player.isDead ? 42 : 32;
            const playerH = player.isDead ? 36 : 40;
            const offsetY = player.isDead ? screen.y : screen.y - 8;

            ctx.drawImage(
                sprite,
                screen.x + (ts - playerW) / 2,
                offsetY,
                playerW,
                playerH
            );
        } else {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🛡️', screen.x + ts / 2, screen.y + ts / 2);
        }

        ctx.restore();
    }

    _renderFloatingText() {
        const ctx = this.ctx;
        const cam = this.camera;

        ctx.save();
        ctx.font = 'bold 13px "Outfit", sans-serif';
        ctx.textAlign = 'center';

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= 0.02;

            const screen = cam.worldToScreen(ft.x, ft.y);

            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.fillStyle = ft.color;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, screen.x, screen.y);

            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
        ctx.restore();
    }

    _renderLightingVignette(player) {
        if (!player) return;
        const ctx = this.ctx;
        const cam = this.camera;
        const screen = cam.worldToScreen(player.renderX * this.tileSize + 16, player.renderY * this.tileSize + 16);

        ctx.save();
        const radius = player.visionRadius * this.tileSize;
        const vignette = ctx.createRadialGradient(
            screen.x, screen.y, radius * 0.35,
            screen.x, screen.y, radius
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.7, 'rgba(4, 7, 15, 0.45)');
        vignette.addColorStop(1, 'rgba(4, 7, 15, 0.96)');

        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
    }
}

export default Renderer;
