# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/PatchWorkShop/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/PatchWorkShop/PlayGround)

- 🎮 [Open the project](https://omgithub.com/PatchWorkShop/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=PatchWorkShop%2FPlayGround).
- 💻 [Explore the source](https://github.com/PatchWorkShop/PlayGround).
- 🛠️ [Check build runs](https://github.com/PatchWorkShop/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/PatchWorkShop/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/PatchWorkShop).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

## Hollowroot

A small, dependency-free, turn-based creature-collecting roguelite that runs in a modern browser. Start a local server from the project directory (for example, `python3 -m http.server 8000`) and open `http://localhost:8000`.

### How to play

- **Move:** WASD, arrow keys, or click an adjacent tile.
- **Attack:** Space, or click an enemy in range. Morrowisp can attack up to three tiles away.
- **Interact:** E, or click an adjacent wild companion, cache, or exit. Recruit wild companions by standing next to them; caches grant supplies and embers.
- **Choose a companion:** click its party card, press **1–4**, or use **Tab** to cycle through companions who still have an action.
- **End the crew turn:** Enter or the **End Crew Turn** button. Every living companion can move, attack, or interact once; then nearby enemies move or attack.
- **Escape:** Defeat every enemy and reach the green-lit root gate. You can also retreat, but you will bring back fewer embers.

The expedition begins with a Wayfarer and a sturdy Bramblet. Cindercub and Morrowisp can be recruited in the grotto. The party can hold up to four creatures. If the Wayfarer is knocked out, the crew returns to camp. Companions recover their health between descents, and gloam embers persist; spend them at camp on Rootwoven charms to permanently raise a companion's maximum health.

### Project structure

- `index.html` — hub, dungeon, HUD, and expedition result screens.
- `style.css` — responsive layout and pixel-game presentation.
- `game.js` — game state, turn resolution, combat, enemy behavior, recruitment, canvas rendering, and camp upgrades.

There is no build step or external runtime dependency. The game uses a single HTML canvas and draws its creatures and dungeon tiles directly in JavaScript.
