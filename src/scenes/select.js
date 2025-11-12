import { CHARACTERS } from "../assets.js";
import { addLogo } from "../utils/logo.js";

export function createSelectScene(k, gameState) {
  k.scene("select", () => {
    let selectedIndex = 0;

    // Animated background particles
    for (let i = 0; i < 30; i++) {
      const particle = k.add([
        k.circle(k.rand(2, 5)),
        k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
        k.color(k.rand(100, 150), k.rand(100, 150), k.rand(150, 200)),
        k.opacity(k.rand(0.2, 0.5)),
        k.z(-1),
        { speed: k.rand(10, 30) }
      ]);
      
      particle.onUpdate(() => {
        particle.pos.y += particle.speed * k.dt();
        if (particle.pos.y > k.height()) particle.pos.y = -10;
      });
    }

    // Title with glow effect
    k.add([
      k.text("ATTACK ON BAL", { size: 42 }),
      k.pos(k.width() / 2, 50),
      k.anchor("center"),
      k.color(255, 50, 50),
      k.z(1)
    ]);

    k.add([
      k.text("ATTACK ON BAL", { size: 42 }),
      k.pos(k.width() / 2 + 2, 52),
      k.anchor("center"),
      k.color(30, 30, 60),
      k.opacity(0.5),
      k.z(0)
    ]);

    k.add([
      k.text("Select Your Fighter", { size: 20 }),
      k.pos(k.width() / 2, 95),
      k.anchor("center"),
      k.color(200, 200, 255),
      k.z(1)
    ]);

    // Instructions
    k.add([
      k.text("Use 1, 2, 3 or Click to select • Press ENTER or Click START", { size: 14 }),
      k.pos(k.width() / 2, k.height() - 40),
      k.anchor("center"),
      k.color(180, 180, 220)
    ]);

    // Character cards
    const cards = [];
    const cardWidth = 180;
    const cardHeight = 300;
    const spacing = 40;
    const startX = (k.width() - (cardWidth * 3 + spacing * 2)) / 2;
    const cardY = 150;

    CHARACTERS.forEach((char, i) => {
      const cardX = startX + i * (cardWidth + spacing);

      // Card background with gradient effect
      const cardBg = k.add([
        k.rect(cardWidth, cardHeight, { radius: 12 }),
        k.pos(cardX, cardY),
        k.color(40, 40, 70),
        k.outline(3, k.rgb(80, 80, 120)),
        k.area(),
        k.anchor("topleft"),
        k.z(5),
        "card",
        { index: i, char, originalY: cardY }
      ]);

      // Character visual representation (party symbol/flag or custom image)
      const charVisual = k.add([
        k.rect(60, 60, { radius: 8 }),
        k.pos(cardX + cardWidth / 2, cardY + 70),
        k.anchor("center"),
        k.color(k.Color.fromHex(char.color)),
        k.z(6),
        { pulseTime: 0 }
      ]);

      // Add logo (sprite or fallback) - make sure it fits within 60x60 box
      const logos = addLogo({
        k,
        spriteKey: char.id,
        x: cardX + cardWidth / 2,
        y: cardY + 70,
        maxW: 60,
        maxH: 60,
        z: 7,
        color: char.color,
        fallbackId: char.id,
        isDynamic: true,
      });

      // Pulse animation
      charVisual.onUpdate(() => {
        charVisual.pulseTime += k.dt() * 2;
        const pulse = Math.sin(charVisual.pulseTime) * 2;
        charVisual.width = 60 + pulse;
        charVisual.height = 60 + pulse;
        // Keep logo(s) positioned and sized to the rectangle
        logos?.forEach((logoEnt) => {
          if (!logoEnt) return;
          // Keep centered
          logoEnt.pos = charVisual.pos.clone();
          // Attempt to scale based on sprite size, fallback to baseSize (30)
          try {
            const spr = k.getSprite(char.id);
            const w = spr?.width ?? spr?.w ?? spr?.data?.width ?? spr?.data?.w ?? spr?.data?.frames?.[0]?.w ?? spr?.data?.frames?.[0]?.width;
            const h = spr?.height ?? spr?.h ?? spr?.data?.height ?? spr?.data?.h ?? spr?.data?.frames?.[0]?.h ?? spr?.data?.frames?.[0]?.height;
            if (w && h) {
              const scale = Math.min(charVisual.width / w, charVisual.height / h);
              logoEnt.scale = k.vec2(scale, scale);
            } else {
              // fallback scale, baseSize 30
              const scale = Math.min(charVisual.width / 30, charVisual.height / 30);
              logoEnt.scale = k.vec2(scale, scale);
            }
          } catch (err) {
            const scale = Math.min(charVisual.width / 30, charVisual.height / 30);
            logoEnt.scale = k.vec2(scale, scale);
          }
        });
      });

      // Character name
      k.add([
        k.text(char.name, { size: 24 }),
        k.pos(cardX + cardWidth / 2, cardY + 125),
        k.anchor("center"),
        k.color(k.Color.fromHex(char.color)),
        k.z(6)
      ]);

      // Description
      k.add([
        k.text(char.description, { size: 12 }),
        k.pos(cardX + cardWidth / 2, cardY + 150),
        k.anchor("center"),
        k.color(200, 200, 220),
        k.z(6)
      ]);

      // Stats with icons
      const statsY = cardY + 185;
      const statsData = [
        { label: "Speed", value: char.speed, icon: "→" },
        { label: "Health", value: char.health, icon: "♥" },
        { label: "Fire Rate", value: (1 / char.fireRate).toFixed(1) + "/s", icon: "◆" }
      ];

      statsData.forEach((stat, j) => {
        k.add([
          k.text(`${stat.icon} ${stat.label}`, { size: 11 }),
          k.pos(cardX + 20, statsY + j * 28),
          k.color(150, 150, 170),
          k.z(6)
        ]);
        
        k.add([
          k.text(stat.value.toString(), { size: 16 }),
          k.pos(cardX + cardWidth - 20, statsY + j * 28),
          k.anchor("right"),
          k.color(k.Color.fromHex(char.color)),
          k.z(6)
        ]);
      });

      cards.push(cardBg);

      // Click handler
      cardBg.onClick(() => {
        selectedIndex = i;
        updateSelection();
      });

      // Hover animation
      cardBg.onHoverUpdate(() => {
        k.setCursor("pointer");
        cardBg.pos.y = cardBg.originalY - 5;
      });

      cardBg.onHoverEnd(() => {
        k.setCursor("default");
        if (i !== selectedIndex) {
          cardBg.pos.y = cardBg.originalY;
        }
      });
    });

    // Start button
    const startBtn = k.add([
      k.rect(220, 55, { radius: 12 }),
      k.pos(k.width() / 2, k.height() - 90),
      k.anchor("center"),
      k.color(60, 180, 100),
      k.area(),
      k.outline(3, k.rgb(80, 220, 130)),
      k.z(5),
      "startBtn"
    ]);

    k.add([
      k.text("START GAME", { size: 22 }),
      k.pos(k.width() / 2, k.height() - 90),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(6)
    ]);

    startBtn.onClick(() => {
      startGame();
    });

    // Hover effect for start button
    startBtn.onHoverUpdate(() => {
      startBtn.color = k.rgb(80, 220, 130);
      startBtn.outline.width = 4;
      k.setCursor("pointer");
    });

    startBtn.onHoverEnd(() => {
      startBtn.color = k.rgb(60, 180, 100);
      startBtn.outline.width = 3;
      k.setCursor("default");
    });

    // Update selection highlight
    function updateSelection() {
      cards.forEach((card, i) => {
        if (i === selectedIndex) {
          card.color = k.rgb(70, 70, 120);
          card.outline.color = k.Color.fromHex(CHARACTERS[i].color);
          card.outline.width = 5;
          card.pos.y = card.originalY - 10;
        } else {
          card.color = k.rgb(40, 40, 70);
          card.outline.color = k.rgb(80, 80, 120);
          card.outline.width = 3;
          card.pos.y = card.originalY;
        }
      });
    }

    // Keyboard selection
    k.onKeyPress("1", () => { selectedIndex = 0; updateSelection(); });
    k.onKeyPress("2", () => { selectedIndex = 1; updateSelection(); });
    k.onKeyPress("3", () => { selectedIndex = 2; updateSelection(); });

    // Start game
    k.onKeyPress("enter", startGame);

    function startGame() {
      gameState.playerConfig = CHARACTERS[selectedIndex];
      k.go("game");
    }

    // Initialize selection
    updateSelection();
  });
}
