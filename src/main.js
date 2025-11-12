import kaboom from "kaboom";
import { createSelectScene } from "./scenes/select.js";
import { createGameScene } from "./scenes/game.js";

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

// Initialize Kaboom
const k = kaboom({
  width: 800,
  height: 600,
  background: [20, 20, 40],
  scale: size.scale,
  crisp: true,
  touchToMouse: true,
  global: false
});

// Hide loading screen
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) loading.classList.add('hidden');
    }, 100);
  });
}

// Load custom character images with error handling
const imageSize = 64; // Standard size for all images

k.loadRoot("/");

// Load sprites with proper error handling
const loadSpriteWithFallback = (name, path) => {
  try {
    k.loadSprite(name, path);
  } catch (e) {
    console.log(`${name} sprite not found, will use default shapes`);
  }
};

loadSpriteWithFallback("ncp", "/ncp.png");
loadSpriteWithFallback("bnp", "/bnp.png");
loadSpriteWithFallback("jamat", "/jamat.png");
loadSpriteWithFallback("bal-enemy", "/bal-enemy.png");

// Register scenes
createSelectScene(k, gameState);
createGameScene(k, gameState);

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
k.go("select");

export default k;
