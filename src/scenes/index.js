import { createSelectScene } from "./select.js";
import { createGameScene } from "./game.js";

export function registerScenes(k, gameState) {
  createSelectScene(k, gameState);
  createGameScene(k, gameState);
}
