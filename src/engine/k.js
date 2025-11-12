// We load Kaboom dynamically and ensure the global enum object used in
// the library is present before Kaboom executes. Minified builds of
// Kaboom may try to assign to an undeclared variable (e.g. `Ko = {}`)
// which fails in strict mode. Defining `window.Ko` before import avoids
// the ReferenceError in production builds.
export async function initKaboom() {
  if (typeof window !== "undefined") {
    // Kaboom minified builds sometimes write to a short global var like
    // Ko, Bo, etc. When those builds run in ESM/strict contexts a plain
    // assignment to an undeclared identifier throws ReferenceError.
    // Create a small set of likely global names beforehand so the
    // library can assign to them without crashing.
    const shimNames = ["Ko", "Bo", "Zo", "Ao", "Po", "Ro"];
    const shimRefs = Object.create(null);
    for (const name of shimNames) {
      if (typeof window[name] === "undefined") {
        const stub = {};
        Object.defineProperty(window, name, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: stub,
        });
        shimRefs[name] = stub;
      } else {
        // Already defined — keep a reference for comparison
        shimRefs[name] = window[name];
      }
    }
  }

  // Dynamic import so we control when Kaboom executes in relation to
  // our global shims above.
  const kaboomModule = await import("kaboom");
  const kaboom = kaboomModule.default ?? kaboomModule;

  // Simple, standard Kaboom initialization
  const k = kaboom({
    width: 800,
    height: 600,
    background: [20, 20, 40],
    touchToMouse: true,
    global: false,
  });

  // Development-time debug: detect if Kaboom replaced any of our shim
  // globals. This helps us diagnose which minified name the library
  // uses (e.g. `Bo` or `Ko`). Only log in dev to avoid noisy prod logs.
  if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
    try {
      const used = shimNames.filter(n => window[n] !== shimRefs[n]);
      if (used.length) console.info('Kaboom used global shims:', used);
    } catch (err) {
      // noop; do not crash init if debug check fails
    }
  }

  return k;
}

// Log which shim names were replaced by the library (dev only).
// Use a micro-check since assigning to an undeclared variable
// results in ReferenceError — but if Kaboom assigns to one of
// our prepared global names, we may detect it via `initKaboom()`'s
// shimRefs above. This helps debugging unusual minified builds.
// (no global shim logging outside initKaboom)
