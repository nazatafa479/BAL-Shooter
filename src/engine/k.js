import kaboom from "kaboom";

export function initKaboom() {
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
