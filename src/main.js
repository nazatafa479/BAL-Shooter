import { initKaboom } from "./engine/k.js";
import { registerScenes } from "./scenes/index.js";
import { preloadSprites } from "./assetsLoader.js";

console.log("Game initializing...");

// Global player configuration - set by character selection
export const gameState = { playerConfig: null };

// Initialize Kaboom with a dedicated canvas inside #game-container
const k = initKaboom();
console.log("Kaboom initialized");

// Move the canvas to our container
const container = document.getElementById("game-container");
if (container && k.canvas) {
  container.appendChild(k.canvas);
  console.log("Canvas moved to container");
}

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());

async function boot() {
  try {
    // Preload assets before creating scenes
    await preloadSprites(k);
    console.log("Sprite preloading finished");

    // Register both scenes
    registerScenes(k, gameState);
    console.log("Scenes registered");

    // Go to character selection
    k.go("select");
    console.log("Game started - select scene");
  } catch (error) {
    console.error("Boot error:", error);
    const loading = document.getElementById('loading');
    if (loading) loading.innerHTML = `<div>Error loading game: ${error?.message || error}</div>`;
  } finally {
    // Hide loading screen regardless
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
  }
}

// Try to hide loading eventually even if something stalls
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
}, 2000);

boot();

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
