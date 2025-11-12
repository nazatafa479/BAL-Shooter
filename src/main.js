import { initKaboom } from "./engine/k.js";
import { registerScenes } from "./scenes/index.js";
import { preloadSprites } from "./assetsLoader.js";

console.log("Game initializing...");

// Global player configuration - set by character selection
export const gameState = { playerConfig: null };

// k will be initialized in boot(); other modules can import default
// and will get the assigned value after initialization.
export let k;

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());

async function boot() {
  try {
    // Initialize Kaboom after we've applied any global shims
    k = await initKaboom();
    console.log("Kaboom initialized");

    // Move the canvas to our container
    const container = document.getElementById("game-container");
    if (container && k.canvas) {
      container.appendChild(k.canvas);
      console.log("Canvas moved to container");
    }

    // On mobile devices, make the canvas capture touches and disable
    // browser gestures (scroll, pinch) that can prevent in-game touch
    // input from reaching the engine. Also hide any loading overlay so
    // it doesn't capture touches on top of the canvas.
    function enableMobileTouchSupport(canvas) {
      if (!canvas) return;
      // Prevent system gestures and selection
      canvas.style.touchAction = 'none';
      canvas.style.msTouchAction = 'none';
      canvas.style.webkitUserSelect = 'none';
      canvas.style.userSelect = 'none';
      canvas.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';

      // Some Android browsers require passive:false listeners to allow
      // preventDefault() to work on touch events.
      canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
      canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });

      // Also prevent document-level scroll on mobile, just while game is
      // active. This is a defensive fallback when canvas doesn't receive
      // the event (e.g. when zoom/gesture overlays are present).
      document.body.style.overflow = 'hidden';
      const loading = document.getElementById('loading');
      if (loading) {
        // Force hide so it doesn't intercept touches
        loading.style.pointerEvents = 'none';
        loading.style.display = 'none';
      }
    }

    enableMobileTouchSupport(k.canvas);

    // Prevent default touch behaviors
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());

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

// Note: Scene start is handled in boot() after Kaboom is initialized.

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
