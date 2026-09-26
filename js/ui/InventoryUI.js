/**
 * Inventory UI Overlay Controller
 * Renders slot grid, item inspection cards, and action buttons.
 */
export class InventoryUI {
    /**
     * @param {Object} game 
     */
    constructor(game) {
        this.game = game;
        this.modal = document.getElementById('inventory-modal');
        this.grid = document.getElementById('inventory-grid');
        this.detailsPanel = document.getElementById('inventory-details');
        this.closeBtn = document.getElementById('inventory-close');

        this.selectedIndex = null;
        this.isOpen = false;

        this._setupListeners();
    }

    _setupListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyI') {
                this.toggle();
            } else if (e.code === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.modal) return;
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        this.render();
    }

    close() {
        if (!this.modal) return;
        this.isOpen = false;
        this.modal.classList.add('hidden');
        this.selectedIndex = null;
    }

    render() {
        if (!this.grid || !this.game?.player) return;

        const inventory = this.game.player.inventory;
        this.grid.innerHTML = '';

        for (let i = 0; i < inventory.capacity; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            const item = inventory.items[i];

            if (item) {
                slot.classList.add(`rarity-${item.rarity}`);
                if (item.equipped) {
                    slot.classList.add('equipped');
                }

                if (item.sprite) {
                    const img = document.createElement('img');
                    img.src = item.sprite;
                    img.className = 'item-pixel-sprite';
                    img.alt = item.name;
                    slot.appendChild(img);
                } else {
                    const icon = document.createElement('span');
                    icon.className = 'item-icon';
                    icon.textContent = item.icon;
                    slot.appendChild(icon);
                }

                if (item.quantity && item.quantity > 1) {
                    const badge = document.createElement('span');
                    badge.className = 'item-badge';
                    badge.textContent = item.quantity;
                    slot.appendChild(badge);
                }

                if (item.equipped) {
                    const eqBadge = document.createElement('span');
                    eqBadge.className = 'equipped-badge';
                    eqBadge.textContent = 'E';
                    slot.appendChild(eqBadge);
                }

                slot.addEventListener('click', () => {
                    this.selectedIndex = i;
                    this.renderDetails(item, i);
                });
            } else {
                slot.classList.add('empty');
            }

            this.grid.appendChild(slot);
        }

        if (this.selectedIndex !== null && inventory.items[this.selectedIndex]) {
            this.renderDetails(inventory.items[this.selectedIndex], this.selectedIndex);
        } else {
            this.renderEmptyDetails();
        }
    }

    renderDetails(item, index) {
        if (!this.detailsPanel) return;

        const isEquipped = item.equipped;
        const actionLabel = item.type === 'weapon' ? (isEquipped ? 'Equipped' : 'Equip Weapon') : 'Use Item';

        const iconHtml = item.sprite
            ? `<img src="${item.sprite}" class="detail-pixel-sprite" alt="${item.name}">`
            : `<span class="detail-icon">${item.icon}</span>`;

        this.detailsPanel.innerHTML = `
            <div class="item-detail-header" style="color: ${item.getRarityColor()}">
                ${iconHtml}
                <div>
                    <h3 class="detail-name">${item.name}</h3>
                    <span class="detail-rarity">${item.rarity.toUpperCase()} ${item.type.toUpperCase()}</span>
                </div>
            </div>
            <p class="detail-desc">${item.description}</p>
            ${item.damageMin ? `<p class="detail-stat">Damage: <strong>${item.damageMin} - ${item.damageMax}</strong></p>` : ''}
            ${item.critChanceBonus ? `<p class="detail-stat">Crit Bonus: <strong>+${Math.round(item.critChanceBonus * 100)}%</strong></p>` : ''}
            ${item.restoreAmount ? `<p class="detail-stat">Restores: <strong>${item.restoreAmount} ${item.potionType === 'health' ? 'HP' : 'MP'}</strong></p>` : ''}
            <div class="detail-actions">
                <button id="btn-use-item" class="btn-primary" ${isEquipped ? 'disabled' : ''}>${actionLabel}</button>
                <button id="btn-drop-item" class="btn-danger">Drop</button>
            </div>
        `;

        const useBtn = document.getElementById('btn-use-item');
        if (useBtn && !isEquipped) {
            useBtn.addEventListener('click', () => {
                this.game.player.inventory.useItem(index, this.game.player);
                this.render();
            });
        }

        const dropBtn = document.getElementById('btn-drop-item');
        if (dropBtn) {
            dropBtn.addEventListener('click', () => {
                const dropped = this.game.player.inventory.removeItem(index);
                if (dropped) {
                    this.game.dungeon.addItem(dropped, this.game.player.x, this.game.player.y);
                    this.selectedIndex = null;
                    this.render();
                }
            });
        }
    }

    renderEmptyDetails() {
        if (!this.detailsPanel) return;
        this.detailsPanel.innerHTML = `
            <div class="empty-details">
                <p>Select an item from your backpack to inspect its lore, stats, or use it.</p>
            </div>
        `;
    }
}

export default InventoryUI;
