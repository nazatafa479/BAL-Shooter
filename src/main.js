import kaboom from "kaboom";
import { createSelectScene } from "./scenes/select.js";
import { createGameScene } from "./scenes/game.js";

console.log("Game initializing...");

// Global player configuration - set by character selection
export const gameState = {
  playerConfig: null
};

// Calculate responsive size
function getGameSize() {
  const maxWidth = 800;
  const maxHeight = 600;
  const aspectRatio = maxWidth / maxHeight;
  
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;
  
  let width = maxWidth;
  let height = maxHeight;
  
  // Scale down for smaller screens
  if (containerWidth < maxWidth || containerHeight < maxHeight) {
    width = Math.min(containerWidth, maxWidth);
    height = width / aspectRatio;
    
    // If height exceeds container, scale by height instead
    if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
    }
  }
  
  return { 
    width: Math.floor(width), 
    height: Math.floor(height),
    scale: Math.min(width / maxWidth, 1)
  };
}

const size = getGameSize();
console.log("Game size calculated:", size);

// Get or create the game container
const gameContainer = document.getElementById('game-container');
if (!gameContainer) {
  console.error("Game container not found!");
}

// Initialize Kaboom
const k = kaboom({
  width: 800,
  height: 600,
  background: [20, 20, 40],
  scale: size.scale,
  crisp: true,
  touchToMouse: true,
  global: false,
  canvas: gameContainer ? undefined : document.querySelector('canvas')
});

console.log("Kaboom initialized");

// Ensure canvas is in the container
if (gameContainer && k.canvas) {
  gameContainer.appendChild(k.canvas);
  console.log("Canvas added to container");
}

// Load custom character images with error handling
const imageSize = 64; // Standard size for all images

k.loadRoot("/");
console.log("Load root set to /");

// Load sprites with proper error handling
const loadSpriteWithFallback = (name, path) => {
  try {
    k.loadSprite(name, path);
    console.log(`Loading sprite: ${name} from ${path}`);
  } catch (e) {
    console.log(`${name} sprite not found, will use default shapes`);
  }
};

loadSpriteWithFallback("ncp", "/ncp.png");
loadSpriteWithFallback("bnp", "/bnp.png");
loadSpriteWithFallback("jamat", "/jamat.png");
loadSpriteWithFallback("bal-enemy", "/bal-enemy.png");

console.log("Sprites loaded");

// Register scenes
try {
  createSelectScene(k, gameState);
  createGameScene(k, gameState);
  console.log("Scenes registered");
} catch (error) {
  console.error("Error creating scenes:", error);
  // Hide loading screen even if there's an error
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `<div>Error loading game: ${error.message}</div>`;
  }
  throw error;
}

// Prevent default touch behaviors
if (typeof document !== 'undefined') {
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });
}

// Start with character selection
try {
  k.go("select");
  console.log("Game started - select scene");
} catch (error) {
  console.error("Error starting game:", error);
}

// Hide loading screen after game is ready
// Use both setTimeout and immediate check as fallback
const hideLoadingScreen = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
    console.log("Loading screen hidden");
  } else {
    console.warn("Loading element not found");
  }
};

// Try to hide immediately if DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(hideLoadingScreen, 500);
} else {
  // Otherwise wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(hideLoadingScreen, 500);
  });
}

// Failsafe: Always hide loading screen after 2 seconds
setTimeout(hideLoadingScreen, 2000);

export default k;
