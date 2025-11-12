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
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); canvas.focus && canvas.focus(); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); canvas.focus && canvas.focus(); }, { passive: false });

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

  // Make sure canvas is focusable
  try { canvas.setAttribute('tabindex', '0'); } catch (err) {}

      // For browsers using Pointer Events, forward touch pointers to
      // synthetic mouse events so Kaboom's touchToMouse handler will
      // work consistently across devices.
      const forwardMouse = (evt, type) => {
        try {
          const mouseEvt = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: evt.clientX,
            clientY: evt.clientY,
            button: 0,
          });
          canvas.dispatchEvent(mouseEvt);
        } catch (err) {
          // ignore; synthetic events may be blocked on some browsers
        }
      };

    if (window.PointerEvent) {
        canvas.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch') {
            e.preventDefault();
            canvas.focus && canvas.focus();
            forwardMouse(e, 'mousedown');
          }
        }, { passive: false });

        canvas.addEventListener('pointermove', (e) => {
          if (e.pointerType === 'touch') {
            forwardMouse(e, 'mousemove');
          }
        }, { passive: false });

        canvas.addEventListener('pointerup', (e) => {
          if (e.pointerType === 'touch') {
            forwardMouse(e, 'mouseup');
          }
        }, { passive: false });
      }
    }

    enableMobileTouchSupport(k.canvas);

    // A mobile-friendly tap-to-play overlay for Android/iOS that ensures
    // the first touch focuses the canvas and allows pointer capture.
    function addMobileStartOverlay(canvas) {
      if (!canvas) return;
      // Only show overlay on small screens (heuristic for mobile)
      if (window.innerWidth > 900) return;

      const overlay = document.createElement('div');
      overlay.id = 'mobile-start-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = overlay.style.left = '0';
      overlay.style.width = overlay.style.height = '100%';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '99999';
      overlay.style.background = 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25))';
      overlay.style.color = '#fff';
      overlay.style.fontSize = '18px';
      overlay.style.backdropFilter = 'blur(2px)';
      overlay.innerHTML = '<div style="text-align:center">Tap to Play</div>';

      // Prevent overlay from capturing pointer events after first touch
      function onStart(e) {
        e.preventDefault();
        // Focus the canvas to ensure it receives input
        try { canvas.focus && canvas.focus(); } catch (err) {}
        // Remove overlay
        overlay.remove();
        // Also make sure canvas has pointer capture if pointer event is available
        if (e.pointerId && canvas.setPointerCapture) {
          try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        }
      }

      overlay.addEventListener('touchstart', onStart, { passive: false });
      overlay.addEventListener('pointerdown', onStart, { passive: false });
      overlay.addEventListener('mousedown', onStart);
      document.body.appendChild(overlay);
    }

    addMobileStartOverlay(k.canvas);

    // Document-level touch handlers with passive:false capture phase so that
    // default gestures (scroll/pinch) are prevented, and the canvas always
    // receives the touch. This is aggressive but required for full-screen
    // web games and Android browsers.
    function registerDocTouchHandlers() {
      const handler = (e) => {
        // If the event target is a form control (e.g., inputs), do not block
        const tg = e.target;
        if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.contentEditable === 'true')) return;
        e.preventDefault();
      };

      // Use capture so we get first chance to handle touches
      document.addEventListener('touchstart', handler, { passive: false, capture: true });
      document.addEventListener('touchmove', handler, { passive: false, capture: true });
      document.addEventListener('touchend', handler, { passive: false, capture: true });
    }

    registerDocTouchHandlers();

    // Dev-only small overlay to debug touch/pointer events on mobile.
    function addDevTouchLogger(canvas) {
      const enabledByQuery = typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('touchDebug') === '1';
      if (!canvas || !(import.meta && import.meta.env && import.meta.env.DEV) && !enabledByQuery) return;
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.right = '8px';
      el.style.bottom = '8px';
      el.style.background = 'rgba(0,0,0,0.7)';
      el.style.color = 'white';
      el.style.padding = '6px 8px';
      el.style.fontSize = '12px';
      el.style.zIndex = '999999';
      el.style.borderRadius = '6px';
      el.id = 'dev-touch-logger';
  document.body.appendChild(el);

      const update = (msg) => { el.textContent = msg; console.info('[touch-logger]', msg); };

      const handler = (e) => {
        let type = e.type, x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0, y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
        update(`${type} @ ${Math.round(x)},${Math.round(y)}`);
      };

      ['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend','mousedown','mousemove','mouseup'].forEach(evt => canvas.addEventListener(evt, handler, { passive: false }));
    }

    addDevTouchLogger(k.canvas);

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
