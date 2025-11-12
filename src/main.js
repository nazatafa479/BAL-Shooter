import kaboom from "kaboom";
import { createSelectScene } from "./scenes/select.js";
import { createGameScene } from "./scenes/game.js";

// Global player configuration - set by character selection
export const gameState = {
  playerConfig: null
};

// Initialize Kaboom
const k = kaboom({
  width: 800,
  height: 600,
  background: [20, 20, 40],
  scale: 1,
  crisp: true
});

// No assets to load - we use shapes!

// Register scenes
createSelectScene(k, gameState);
createGameScene(k, gameState);

// Start with character selection
k.go("select");

export default k;
