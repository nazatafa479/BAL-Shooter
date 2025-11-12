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
  
  let width = Math.min(window.innerWidth, maxWidth);
  let height = Math.min(window.innerHeight, maxHeight);
  
  // Maintain aspect ratio
  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }
  
  return { width: Math.floor(width), height: Math.floor(height) };
}

const size = getGameSize();

// Initialize Kaboom
const k = kaboom({
  width: size.width,
  height: size.height,
  canvas: document.querySelector("#game-container") ? undefined : undefined,
  background: [20, 20, 40],
  scale: 1,
  crisp: true,
  touchToMouse: true, // Enable touch controls
  global: false
});

// Hide loading screen
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
}, 500);

// Load custom character images (if they exist in /public folder)
// These will be used instead of geometric shapes
try {
  k.loadSprite("ncp", "/ncp.png");
} catch (e) {
  console.log("NCP sprite not found, using default");
}

try {
  k.loadSprite("bnp", "/bnp.png");
} catch (e) {
  console.log("BNP sprite not found, using default");
}

try {
  k.loadSprite("jamat", "/jamat.png");
} catch (e) {
  console.log("JAMAT sprite not found, using default");
}

try {
  k.loadSprite("bal-enemy", "/bal-enemy.png");
} catch (e) {
  console.log("BAL enemy sprite not found, using default");
}

// Register scenes
createSelectScene(k, gameState);
createGameScene(k, gameState);

// Handle window resize for mobile
window.addEventListener('resize', () => {
  const newSize = getGameSize();
  // Note: Kaboom doesn't support dynamic resize well, so we reload
  if (Math.abs(newSize.width - size.width) > 50 || Math.abs(newSize.height - size.height) > 50) {
    location.reload();
  }
});

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Start with character selection
k.go("select");

export default k;
