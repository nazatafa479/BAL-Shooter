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
    for (const name of shimNames) {
      if (typeof window[name] === "undefined") {
        Object.defineProperty(window, name, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: {},
        });
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

  return k;
}
