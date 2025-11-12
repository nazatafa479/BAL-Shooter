export function addLogo({ k, spriteKey, x, y, maxW = 60, maxH = 60, z = 7, color = "#ffffff", fallbackId = null, anchor = "center", isDynamic = false }) {
  // Try to add the loaded sprite, scaled to fit maxW x maxH while preserving aspect ratio.
  const createdEntities = [];
  try {
    const spr = k.getSprite(spriteKey);
    if (spr) {
      // Attempt to derive size from possible kaboom sprite structures
      const w = spr.width ?? spr.w ?? spr.data?.width ?? spr.data?.w ?? spr.data?.frames?.[0]?.w ?? spr.data?.frames?.[0]?.width;
      const h = spr.height ?? spr.h ?? spr.data?.height ?? spr.data?.h ?? spr.data?.frames?.[0]?.h ?? spr.data?.frames?.[0]?.height;

      const logo = k.add([
        k.sprite(spriteKey),
        k.pos(x, y),
        k.anchor(anchor),
        k.z(z),
        `logo:${spriteKey}`,
        "logo",
      ]);

      // Scale the sprite to fit within maxW x maxH
      if (w && h && Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        const scale = Math.min(maxW / w, maxH / h);
        logo.scale = k.vec2(scale, scale);
      } else {
        // fallback to a safe default scale to avoid massive images
        const safeScale = Math.min(maxW / 128, maxH / 128);
        logo.scale = k.vec2(safeScale, safeScale);
      }

      createdEntities.push(logo);
      return createdEntities;
    }
  } catch (err) {
    // Gracefully fall back to shape
  }

  // If the sprite isn't available, draw a fallback shape based on fallbackId
  return addFallbackLogo({ k, id: fallbackId || spriteKey, x, y, maxW, maxH, z, color, anchor, isDynamic, createdEntities });
}

export function addFallbackLogo({ k, id, x, y, maxW = 60, maxH = 60, z = 7, color = "#ffffff", anchor = "center", isDynamic = false, createdEntities = [] }) {
  // We'll scale the base dimensions to fit maxW and maxH.
  const baseSize = 30; // all shapes are drawn roughly around 30x30
  const scaleFactor = Math.min(maxW / baseSize, maxH / baseSize);

  const addAtPos = (...components) => {
    // Support passing either an array of components or multiple args
    let comps = components;
    if (Array.isArray(components[0])) comps = components[0];
    const entity = k.add([
      ...comps,
      k.pos(x, y),
      k.anchor(anchor),
      k.z(z),
      "logo",
      `logo:${id}`,
    ]);
    return entity;
  };

  if (id === "ncp") {
    // Star-like polygon (original points around 15px, 12px): scale by scaleFactor
    const points = [
      k.vec2(0, -15), k.vec2(4, -5), k.vec2(15, -5),
      k.vec2(6, 2), k.vec2(10, 12), k.vec2(0, 6),
      k.vec2(-10, 12), k.vec2(-6, 2), k.vec2(-15, -5), k.vec2(-4, -5)
    ].map(p => p.scale(scaleFactor));

    const ent = addAtPos(k.polygon(points), k.color(255, 255, 255));
    createdEntities.push(ent);
    return createdEntities;
  }

  if (id === "bnp") {
    // Wheat-ish: rect and 2 small circles. If dynamic, only add main rect to keep it a single entity.
    const rectW = Math.max(4, 8 * scaleFactor);
    const rectH = Math.max(12, 30 * scaleFactor);
    if (isDynamic) {
      const e = addAtPos(k.rect(rectW, rectH), k.color(255, 255, 255));
      createdEntities.push(e);
      return createdEntities;
    }
    createdEntities.push(addAtPos(k.rect(rectW, rectH), k.color(255, 255, 255)));
    createdEntities.push(addAtPos(k.circle(Math.max(2, 6 * scaleFactor)).pos(-rectW - (2 * scaleFactor), -rectH / 3), k.color(255, 255, 255)));
    createdEntities.push(addAtPos(k.circle(Math.max(2, 6 * scaleFactor)).pos(rectW + (2 * scaleFactor), -rectH / 3), k.color(255, 255, 255)));
    return createdEntities;
  }

  // BAL enemy fallback: text label "BAL"
  if (id === "bal-enemy") {
    const t = addAtPos(k.text("BAL", { size: Math.round(maxH / 2) }), k.color(255, 255, 255));
    createdEntities.push(t);
    return createdEntities;
  }

  // Default / Jamat: crescent-like
  // Draw two circles: one white and a smaller colored one offset to create crescent.
  const bigR = Math.max(6, 12 * scaleFactor);
  const smallR = Math.max(5, 10 * scaleFactor);
  if (isDynamic) {
    const e = addAtPos(k.circle(bigR), k.color(255, 255, 255));
    createdEntities.push(e);
    return createdEntities;
  }
  createdEntities.push(addAtPos(k.circle(bigR), k.color(255, 255, 255)));
  createdEntities.push(addAtPos(k.circle(smallR).pos(3 * scaleFactor, 0), k.color(k.Color.fromHex(color))));
  return createdEntities;
}
