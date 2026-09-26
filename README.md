# Roguelike Dungeon: Depths of the Abyss

A modular, browser-native 2D Roguelike Dungeon Crawler game crafted in pure ES6 JavaScript and HTML5 Canvas.

---

## 📁 Project Architecture & File Structure

```text
roguelike-dungeon/
│
├── index.html
│
├── css/
│   ├── style.css             # Design system tokens, glassmorphism, base buttons
│   ├── game.css              # Canvas container, HUD layout, minimap, inventory overlay
│   ├── menu.css              # Title screen, class selection cards, game over screen
│   └── animations.css        # Keyframes for pulse glows, floating combat text, warnings
│
├── js/
│   ├── main.js               # Application bootstrap and initialization
│   │
│   ├── game/
│   │   ├── Game.js           # Central coordinator connecting entities, floors, & UI
│   │   ├── GameState.js      # Finite state machine (Menu, Playing, Paused, GameOver)
│   │   └── GameLoop.js       # Fixed/variable RAF loop with lag clamping
│   │
│   ├── player/
│   │   ├── Player.js         # Player actor, ability casting, bump-attack triggers
│   │   ├── PlayerStats.js    # Health, mana, base attributes, mitigation, death check
│   │   └── PlayerMovement.js # Grid input handling, smooth interpolation, direction facing
│   │
│   ├── enemies/
│   │   ├── Enemy.js          # Base enemy class with A* chase AI & loot dropping
│   │   ├── Goblin.js         # Fast skirmisher with high evasion
│   │   ├── Skeleton.js       # Armored guardian with high physical defense
│   │   ├── Slime.js          # Resilient gelatinous foe with massive health pool
│   │   └── Boss.js           # Floor 5 Abyssal Overlord with enrage phase & mythic drops
│   │
│   ├── dungeon/
│   │   ├── Dungeon.js        # Floor manager, raycasting FOV, entity spatial queries
│   │   ├── Room.js           # Geometric room structure, bounds, overlap detection
│   │   ├── DungeonGenerator.js # Procedural room-and-corridor generator with stairs
│   │   └── Tile.js           # Tile types (Wall, Floor, Door, Stairs, Chest) & fog state
│   │
│   ├── combat/
│   │   ├── Combat.js         # Attack orchestrator, hit checks, combat logging
│   │   ├── Weapon.js         # Attack speeds, ranges, cooldown timers
│   │   └── Damage.js         # Mitigation curves, evasion rolls, critical strikes
│   │
│   ├── items/
│   │   ├── Item.js           # Base item class with rarity coloring
│   │   ├── WeaponItem.js     # Scaled procedural weapons (Swords, Daggers, Axes, Staffs)
│   │   ├── Potion.js         # Health, Mana, and Strength consumables
│   │   └── Inventory.js      # Slot-based bag, equipment slots, stacking, gold tracking
│   │
│   ├── systems/
│   │   ├── Collision.js      # AABB, distance calculations, Bresenham line-of-sight
│   │   ├── Pathfinding.js    # A* (A-Star) search for enemy navigation
│   │   ├── Experience.js     # Exponential level progression mathematical curves
│   │   ├── LevelSystem.js    # Attribute growth upon leveling up
│   │   └── Random.js         # Deterministic PRNG, weighted selections, array shuffles
│   │
│   ├── rendering/
│   │   ├── Renderer.js       # Canvas pipeline, dynamic lighting vignette, floating text
│   │   ├── Camera.js         # Smooth lerp target tracking and screen-shake FX
│   │   └── Particles.js      # Particle emitter for blood splatters, novas, and embers
│   │
│   └── ui/
│       ├── HUD.js            # Health/Mana/EXP bars, floor counter, minimap radar
│       ├── InventoryUI.js    # Modal slot grid, equipment cards, use/drop buttons
│       ├── Menu.js           # Start screen, archetype picker (Knight, Rogue, Mage)
│       └── GameOver.js       # Death and victory screens with run statistics
│
├── assets/
│   ├── images/
│   │   ├── player/
│   │   ├── enemies/
│   │   ├── bosses/
│   │   ├── items/
│   │   ├── tiles/
│   │   └── backgrounds/
│   ├── audio/
│   │   ├── music/
│   │   └── sounds/
│   └── fonts/
│
└── README.md
```

---

## 🎮 Game Controls

| Key | Action | Description |
|---|---|---|
| **W, A, S, D** or **Arrow Keys** | Move / Attack | Move one tile in that direction. Moving directly into a monster executes a **bump attack**. |
| **E** | Whirlwind | Unleashes a 360° whirlwind attack striking all adjacent foes (consumes 15 Mana). |
| **SPACE** | Descend | Descend through the staircase (`▼`) to progress deeper into the catacombs. |
| **I** | Inventory | Toggles the 16-slot adventurer's backpack. |
| **ESC** | Menu / Pause | Pauses the dungeon run and toggles the main options menu. |

---

## 🚀 How to Run Locally

Because the project utilizes native modern **ES6 Modules** (`import` / `export`), it must be served via any local HTTP server (browsers restrict ES modules when opened directly via `file://` protocol):

### Option 1: Python (Built-in)
```bash
# In the roguelike-dungeon/ folder:
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### Option 2: Node.js (npx serve or live-server)
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## ⚔️ Gameplay Features

1. **Procedural Dungeon Generation**:
   - Dynamic room-and-corridor generation algorithm with corridors, stairs, and environmental decor.
   - Fog-of-War raycasting system that reveals rooms as you explore.

2. **Hero Archetypes**:
   - **Knight**: Stout defense, high base health, balanced blade damage.
   - **Rogue**: Agile skirmisher with 25% base critical hit chance and 20% dodge rate.
   - **Mage**: Enormous mana pool capable of frequent whirlwind burst attacks.

3. **Intelligent Enemy AI**:
   - A* (A-Star) pathfinding that tracks players through corridors.
   - Distinct monster behaviors (Goblins, Skeletons, Slimes, and the Floor 5 Abyssal Overlord).

4. **Combat & Progression**:
   - Floating combat text with critical hit styling.
   - Full equipment system with procedurally scaled weapons across 5 rarity tiers (*Common*, *Uncommon*, *Rare*, *Epic*, *Legendary*).
   - Minimap radar with real-time monster tracking.
