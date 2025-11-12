export function createGameScene(k, gameState) {
  k.scene("game", () => {
    const config = gameState.playerConfig;
    
    // Game state
    let score = 0;
    let paused = false;
    let enemySpawnInterval = 1.5;
    let difficultyTimer = 0;
    let wave = 1;

    // Starfield background
    for (let i = 0; i < 50; i++) {
      const star = k.add([
        k.circle(k.rand(1, 2)),
        k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
        k.color(200, 200, 255),
        k.opacity(k.rand(0.3, 0.8)),
        k.z(-1),
        { speed: k.rand(20, 50) }
      ]);
      
      star.onUpdate(() => {
        star.pos.y += star.speed * k.dt();
        if (star.pos.y > k.height()) {
          star.pos.y = 0;
          star.pos.x = k.rand(0, k.width());
        }
      });
    }

    // Player setup with visual representation - positioned at BOTTOM
    const playerShape = k.add([
      k.rect(35, 35, { radius: 5 }),
      k.pos(k.width() / 2, k.height() - 80),
      k.area(),
      k.anchor("center"),
      k.color(k.Color.fromHex(config.color)),
      k.z(10),
      "player",
      {
        speed: config.speed,
        health: config.health,
        maxHealth: config.health,
        fireRate: config.fireRate,
        fireCooldown: 0,
        facingAngle: -90 // Facing upward
      }
    ]);

    // Player party logo
    let playerDetail;
    if (config.id === "ncp") {
      playerDetail = k.add([
        k.polygon([
          k.vec2(0, -10), k.vec2(3, -3), k.vec2(10, -3),
          k.vec2(4, 1), k.vec2(7, 8), k.vec2(0, 4),
          k.vec2(-7, 8), k.vec2(-4, 1), k.vec2(-10, -3), k.vec2(-3, -3)
        ]),
        k.pos(k.width() / 2, k.height() - 80),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(11),
        "playerDetail"
      ]);
    } else if (config.id === "bnp") {
      playerDetail = k.add([
        k.rect(6, 20),
        k.pos(k.width() / 2, k.height() - 80),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(11),
        "playerDetail"
      ]);
    } else {
      playerDetail = k.add([
        k.circle(8),
        k.pos(k.width() / 2 + 2, k.height() - 80),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(11),
        "playerDetail"
      ]);
    }

    const player = playerShape;

    // Engine trail effect
    let trailTimer = 0;

    // UI Panel background
    k.add([
      k.rect(k.width(), 60),
      k.pos(0, 0),
      k.color(15, 15, 30),
      k.opacity(0.9),
      k.z(99),
      "ui"
    ]);

    // Score
    const scoreText = k.add([
      k.text(`SCORE: ${score}`, { size: 20 }),
      k.pos(20, 20),
      k.color(255, 255, 100),
      k.z(100),
      "ui"
    ]);

    // Wave indicator
    const waveText = k.add([
      k.text(`WAVE: ${wave}`, { size: 18 }),
      k.pos(20, 45),
      k.color(150, 200, 255),
      k.z(100),
      "ui"
    ]);

    // Health bar background
    k.add([
      k.rect(220, 25, { radius: 4 }),
      k.pos(k.width() - 240, 15),
      k.color(50, 50, 50),
      k.z(99),
      "ui"
    ]);

    const healthBar = k.add([
      k.rect(210, 15, { radius: 3 }),
      k.pos(k.width() - 235, 20),
      k.color(80, 220, 120),
      k.z(100),
      "ui",
      { maxWidth: 210 }
    ]);

    const healthText = k.add([
      k.text(`HP: ${player.health}/${player.maxHealth}`, { size: 14 }),
      k.pos(k.width() / 2 + 180, 28),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(101),
      "ui"
    ]);

    // Character name badge
    k.add([
      k.text(config.name.toUpperCase(), { size: 16 }),
      k.pos(k.width() / 2, 25),
      k.anchor("center"),
      k.color(k.Color.fromHex(config.color)),
      k.z(100),
      "ui"
    ]);

    // FIRE BUTTON - visible on screen
    const fireButton = k.add([
      k.circle(40),
      k.pos(k.width() - 80, k.height() - 80),
      k.anchor("center"),
      k.color(255, 80, 80),
      k.area(),
      k.outline(4, k.rgb(255, 150, 150)),
      k.z(100),
      "fireButton"
    ]);

    k.add([
      k.text("FIRE", { size: 16 }),
      k.pos(k.width() - 80, k.height() - 80),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(101),
      "ui"
    ]);

    // Fire button interaction
    fireButton.onClick(() => {
      if (!paused) shoot();
    });

    fireButton.onHoverUpdate(() => {
      fireButton.color = k.rgb(255, 120, 120);
      k.setCursor("pointer");
    });

    fireButton.onHoverEnd(() => {
      fireButton.color = k.rgb(255, 80, 80);
      k.setCursor("default");
    });

    // SLIDER CONTROL - for moving character left/right
    const sliderWidth = 300;
    const sliderHeight = 12;
    const sliderY = k.height() - 35;
    const sliderX = 80;

    // Slider track
    const sliderTrack = k.add([
      k.rect(sliderWidth, sliderHeight, { radius: 6 }),
      k.pos(sliderX, sliderY),
      k.anchor("left"),
      k.color(60, 60, 80),
      k.outline(2, k.rgb(100, 100, 120)),
      k.z(100),
      "ui"
    ]);

    // Slider handle
    const sliderHandle = k.add([
      k.circle(18),
      k.pos(sliderX + sliderWidth / 2, sliderY + sliderHeight / 2),
      k.anchor("center"),
      k.color(k.Color.fromHex(config.color)),
      k.area(),
      k.outline(3, k.rgb(255, 255, 255)),
      k.z(101),
      "sliderHandle",
      { isDragging: false }
    ]);

    // Slider label
    k.add([
      k.text("MOVE", { size: 10 }),
      k.pos(sliderX + sliderWidth / 2, sliderY - 15),
      k.anchor("center"),
      k.color(180, 180, 200),
      k.z(100),
      "ui"
    ]);

    // Slider interaction
    sliderHandle.onHoverUpdate(() => {
      k.setCursor("pointer");
    });

    sliderHandle.onHoverEnd(() => {
      if (!sliderHandle.isDragging) {
        k.setCursor("default");
      }
    });

    sliderHandle.onUpdate(() => {
      // Update slider based on mouse if dragging
      if (sliderHandle.isDragging && k.isMouseDown()) {
        const mouseX = k.mousePos().x;
        const minX = sliderX;
        const maxX = sliderX + sliderWidth;
        const clampedX = Math.max(minX, Math.min(maxX, mouseX));
        sliderHandle.pos.x = clampedX;

        // Update player position based on slider
        const sliderPercent = (clampedX - minX) / sliderWidth;
        const margin = 30;
        player.pos.x = margin + sliderPercent * (k.width() - margin * 2);
      }

      // Stop dragging when mouse released
      if (!k.isMouseDown() && sliderHandle.isDragging) {
        sliderHandle.isDragging = false;
        k.setCursor("default");
      }

      // Sync slider with keyboard movement
      if (!sliderHandle.isDragging) {
        const margin = 30;
        const playerPercent = (player.pos.x - margin) / (k.width() - margin * 2);
        sliderHandle.pos.x = sliderX + playerPercent * sliderWidth;
      }
    });

    sliderHandle.onMousePress(() => {
      sliderHandle.isDragging = true;
    });

    // Click on track to move slider
    sliderTrack.onClick(() => {
      const mouseX = k.mousePos().x;
      const minX = sliderX;
      const maxX = sliderX + sliderWidth;
      const clampedX = Math.max(minX, Math.min(maxX, mouseX));
      sliderHandle.pos.x = clampedX;

      // Update player position
      const sliderPercent = (clampedX - minX) / sliderWidth;
      const margin = 30;
      player.pos.x = margin + sliderPercent * (k.width() - margin * 2);
    });

    // Movement and player update - HORIZONTAL ONLY (bottom shooter)
    k.onUpdate(() => {
      if (paused) return;

      const moveDir = k.vec2(0, 0);

      // Only left-right movement
      if (k.isKeyDown("left") || k.isKeyDown("a")) moveDir.x -= 1;
      if (k.isKeyDown("right") || k.isKeyDown("d")) moveDir.x += 1;

      if (moveDir.len() > 0) {
        player.move(moveDir.unit().scale(player.speed));

        // Create trail
        trailTimer += k.dt();
        if (trailTimer > 0.05) {
          const trail = k.add([
            k.circle(6),
            k.pos(player.pos),
            k.color(k.Color.fromHex(config.color)),
            k.opacity(0.3),
            k.z(5),
            { life: 0.3 }
          ]);
          
          trail.onUpdate(() => {
            trail.life -= k.dt();
            trail.opacity = trail.life;
            if (trail.life <= 0) k.destroy(trail);
          });
          
          trailTimer = 0;
        }
      }

      // Keep player in bounds - BOTTOM AREA ONLY
      const margin = 30;
      if (player.pos.x < margin) player.pos.x = margin;
      if (player.pos.x > k.width() - margin) player.pos.x = k.width() - margin;
      // Lock to bottom area
      player.pos.y = k.height() - 80;

      // Update player detail position
      playerDetail.pos = player.pos;

      // Update fire cooldown
      if (player.fireCooldown > 0) {
        player.fireCooldown -= k.dt();
      }
    });

    // Shooting with spacebar
    k.onKeyPress("space", () => {
      if (!paused) shoot();
    });

    // Shooting with mouse (removed - using fire button instead)
    // Auto-shoot upward mode
    k.onKeyPress("space", () => {
      if (!paused) shoot();
    });

    function shoot(direction) {
      if (player.fireCooldown > 0) return;

      // Always shoot upward
      const dir = k.vec2(0, -1);
      
      // Muzzle flash
      const flash = k.add([
        k.circle(15),
        k.pos(player.pos.add(dir.scale(25))),
        k.color(255, 255, 100),
        k.opacity(0.8),
        k.z(12),
        { life: 0.1 }
      ]);
      
      flash.onUpdate(() => {
        flash.life -= k.dt();
        flash.opacity = flash.life * 8;
        if (flash.life <= 0) k.destroy(flash);
      });

      // Bullet
      const bullet = k.add([
        k.circle(5),
        k.pos(player.pos),
        k.area(),
        k.anchor("center"),
        k.color(255, 255, 50),
        k.z(9),
        k.move(dir, 500),
        k.offscreen({ destroy: true }),
        "bullet",
        { damage: 20 }
      ]);

      // Bullet trail
      bullet.onUpdate(() => {
        k.add([
          k.circle(3),
          k.pos(bullet.pos),
          k.color(255, 200, 50),
          k.opacity(0.5),
          k.z(8),
          { life: 0.2 }
        ]).onUpdate(function() {
          this.life -= k.dt();
          this.opacity = this.life * 2.5;
          if (this.life <= 0) k.destroy(this);
        });
      });

      player.fireCooldown = player.fireRate;
    }

    // Enemy spawning
    let spawnTimer = 0;
    k.onUpdate(() => {
      if (paused) return;

      spawnTimer += k.dt();
      difficultyTimer += k.dt();

      // Increase difficulty
      if (difficultyTimer > 15) {
        enemySpawnInterval = Math.max(0.4, enemySpawnInterval - 0.15);
        difficultyTimer = 0;
        wave++;
        waveText.text = `WAVE: ${wave}`;
        
        // Wave announcement
        const announce = k.add([
          k.text(`WAVE ${wave}`, { size: 48 }),
          k.pos(k.width() / 2, k.height() / 2),
          k.anchor("center"),
          k.color(255, 100, 100),
          k.opacity(1),
          k.z(200),
          { life: 2 }
        ]);
        
        announce.onUpdate(() => {
          announce.life -= k.dt();
          announce.opacity = announce.life / 2;
          announce.pos.y -= k.dt() * 20;
          if (announce.life <= 0) k.destroy(announce);
        });
      }

      if (spawnTimer > enemySpawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
      }
    });

    function spawnEnemy() {
      // BAL enemies spawn from TOP only
      const pos = k.vec2(k.rand(50, k.width() - 50), -30);

      const enemyHealth = 30 + (wave * 10);
      const enemySpeed = 60 + (wave * 5);

      // BAL enemy body (red boat shape)
      const enemy = k.add([
        k.rect(40, 40, { radius: 5 }),
        k.pos(pos),
        k.area(),
        k.anchor("center"),
        k.color(200, 20, 20),
        k.z(8),
        "enemy",
        { 
          health: enemyHealth,
          maxHealth: enemyHealth,
          speed: enemySpeed,
          damage: 20
        }
      ]);

      // BAL text on enemy
      const enemyLabel = k.add([
        k.text("BAL", { size: 12 }),
        k.pos(pos),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(9)
      ]);

      enemyLabel.onUpdate(() => {
        if (enemy.exists()) {
          enemyLabel.pos = enemy.pos;
        } else {
          k.destroy(enemyLabel);
        }
      });

      // Enemy health bar
      const enemyHealthBg = k.add([
        k.rect(40, 4),
        k.pos(pos.x, pos.y - 28),
        k.anchor("center"),
        k.color(40, 40, 40),
        k.z(10)
      ]);

      const enemyHealthBar = k.add([
        k.rect(40, 4),
        k.pos(pos.x, pos.y - 28),
        k.anchor("left"),
        k.color(255, 80, 80),
        k.z(11),
        { maxWidth: 40 }
      ]);

      // Enemy AI - Move DOWN toward player
      enemy.onUpdate(() => {
        if (paused) return;
        
        // Move downward
        enemy.move(k.vec2(0, 1).scale(enemy.speed));

        // Update label position
        if (enemyLabel.exists()) {
          enemyLabel.pos = enemy.pos;
        }

        // Update health bar
        if (enemyHealthBg.exists() && enemyHealthBar.exists()) {
          enemyHealthBg.pos = k.vec2(enemy.pos.x, enemy.pos.y - 28);
          enemyHealthBar.pos = k.vec2(enemy.pos.x - 20, enemy.pos.y - 28);
          const healthPercent = enemy.health / enemy.maxHealth;
          enemyHealthBar.width = 40 * healthPercent;
        }

        // Destroy if reaches bottom
        if (enemy.pos.y > k.height() + 50) {
          k.destroy(enemy);
        }
      });

      // Cleanup when enemy is destroyed
      enemy.onDestroy(() => {
        if (enemyLabel.exists()) k.destroy(enemyLabel);
        if (enemyHealthBg.exists()) k.destroy(enemyHealthBg);
        if (enemyHealthBar.exists()) k.destroy(enemyHealthBar);
      });

      // Enemy collision with player
      enemy.onCollide("player", () => {
        damagePlayer(enemy.damage);
        k.destroy(enemy);
        spawnExplosion(enemy.pos, k.rgb(220, 50, 50));
      });
    }

    // Bullet collision
    k.onCollide("bullet", "enemy", (bullet, enemy) => {
      enemy.health -= bullet.damage;
      k.destroy(bullet);
      
      // Hit flash
      k.add([
        k.circle(12),
        k.pos(bullet.pos),
        k.color(255, 255, 150),
        k.opacity(0.8),
        k.z(15),
        { life: 0.1 }
      ]).onUpdate(function() {
        this.life -= k.dt();
        this.opacity = this.life * 8;
        if (this.life <= 0) k.destroy(this);
      });

      if (enemy.health <= 0) {
        k.destroy(enemy);
        spawnExplosion(enemy.pos, k.rgb(255, 150, 50));
        score += 10 * wave;
        scoreText.text = `SCORE: ${score}`;
      }
    });

    // Damage player
    function damagePlayer(damage) {
      player.health = Math.max(0, player.health - damage);
      updateHealthBar();

      // Screen shake
      k.shake(5);

      // Damage flash
      playerShape.color = k.rgb(255, 100, 100);
      k.wait(0.1, () => {
        if (playerShape.exists()) {
          playerShape.color = k.Color.fromHex(config.color);
        }
      });

      if (player.health <= 0) {
        gameOver();
      }
    }

    // Update health bar
    function updateHealthBar() {
      const healthPercent = player.health / player.maxHealth;
      healthBar.width = healthBar.maxWidth * healthPercent;
      healthText.text = `HP: ${Math.ceil(player.health)}/${player.maxHealth}`;

      if (healthPercent > 0.5) {
        healthBar.color = k.rgb(80, 220, 120);
      } else if (healthPercent > 0.25) {
        healthBar.color = k.rgb(255, 200, 80);
      } else {
        healthBar.color = k.rgb(255, 80, 80);
      }
    }

    // Explosion effect
    function spawnExplosion(pos, color) {
      // Main explosion
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const particle = k.add([
          k.circle(4),
          k.pos(pos),
          k.color(color || k.rgb(255, 150, 0)),
          k.z(20),
          k.opacity(1),
          {
            vel: k.Vec2.fromAngle(angle).scale(k.rand(100, 200)),
            life: k.rand(0.3, 0.6)
          }
        ]);

        particle.onUpdate(() => {
          particle.pos = particle.pos.add(particle.vel.scale(k.dt()));
          particle.vel = particle.vel.scale(0.95);
          particle.life -= k.dt();
          particle.opacity = particle.life * 2;
          particle.radius = 4 * particle.life * 2;
          
          if (particle.life <= 0) k.destroy(particle);
        });
      }

      // Center flash
      const flash = k.add([
        k.circle(20),
        k.pos(pos),
        k.color(255, 255, 200),
        k.opacity(1),
        k.z(21),
        { life: 0.2 }
      ]);

      flash.onUpdate(() => {
        flash.life -= k.dt();
        flash.radius += k.dt() * 100;
        flash.opacity = flash.life * 5;
        if (flash.life <= 0) k.destroy(flash);
      });
    }

    // Pause
    k.onKeyPress("p", () => {
      paused = !paused;
      if (paused) {
        k.add([
          k.rect(k.width(), k.height()),
          k.pos(0, 0),
          k.color(0, 0, 0),
          k.opacity(0.6),
          k.z(250),
          "pauseOverlay"
        ]);

        k.add([
          k.text("PAUSED", { size: 56 }),
          k.pos(k.width() / 2, k.height() / 2 - 30),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.z(251),
          "pauseText"
        ]);

        k.add([
          k.text("Press P to resume", { size: 20 }),
          k.pos(k.width() / 2, k.height() / 2 + 30),
          k.anchor("center"),
          k.color(200, 200, 200),
          k.z(251),
          "pauseText"
        ]);
      } else {
        k.destroyAll("pauseText");
        k.destroyAll("pauseOverlay");
      }
    });

    // Game over
    function gameOver() {
      paused = true;
      
      // Destroy player
      k.destroy(player);
      k.destroy(playerDetail);
      spawnExplosion(player.pos, k.Color.fromHex(config.color));

      k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(0.8),
        k.z(300),
        "gameOver"
      ]);

      k.add([
        k.text("GAME OVER", { size: 56 }),
        k.pos(k.width() / 2, k.height() / 2 - 100),
        k.anchor("center"),
        k.color(255, 80, 80),
        k.z(301),
        "gameOver"
      ]);

      k.add([
        k.text(`Final Score: ${score}`, { size: 36 }),
        k.pos(k.width() / 2, k.height() / 2 - 20),
        k.anchor("center"),
        k.color(255, 255, 100),
        k.z(301),
        "gameOver"
      ]);

      k.add([
        k.text(`Survived ${wave} waves`, { size: 24 }),
        k.pos(k.width() / 2, k.height() / 2 + 30),
        k.anchor("center"),
        k.color(150, 200, 255),
        k.z(301),
        "gameOver"
      ]);

      k.add([
        k.text("Press R to return to character selection", { size: 20 }),
        k.pos(k.width() / 2, k.height() / 2 + 80),
        k.anchor("center"),
        k.color(200, 200, 200),
        k.z(301),
        "gameOver"
      ]);

      k.onKeyPress("r", () => {
        k.go("select");
      });
    }
  });
}
