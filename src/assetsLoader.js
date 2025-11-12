export async function preloadSprites(k) {
  // Serve from public/ root with absolute paths
  const loaders = [
    k.loadSprite("ncp", "/ncp.png").catch((e) => console.warn("ncp sprite missing:", e?.message || e)),
    k.loadSprite("bnp", "/bnp.png").catch((e) => console.warn("bnp sprite missing:", e?.message || e)),
    k.loadSprite("jamat", "/jamat.png").catch((e) => console.warn("jamat sprite missing:", e?.message || e)),
    k.loadSprite("bal-enemy", "/bal-enemy.png").catch((e) => console.warn("bal-enemy sprite missing:", e?.message || e)),
  ];

  await Promise.allSettled(loaders);
}
