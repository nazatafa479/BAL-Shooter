import { addLogo } from "../utils/logo.js";

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
    const playerSize = 40;
    const playerShape = k.add([
      k.rect(playerSize, playerSize, { radius: 5 }),
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

    // Standardized player visual using addLogo helper
    const playerDetail = addLogo({
      k,
      spriteKey: config.id,
      x: k.width() / 2,
      y: k.height() - 80,
      maxW: playerSize,
      maxH: playerSize,
      z: 11,
      color: config.color,
      fallbackId: config.id
      ,
      isDynamic: true
    });
    const playerLogoEntities = playerDetail || [];
    // Keep any returned logo entities synchronized with the player shape size/position
    playerLogoEntities.forEach((ent) => {
      if (!ent) return;
      ent.pos = playerShape.pos.clone();
      ent.onUpdate(() => {
        ent.pos = playerShape.pos.clone();
        try {
          const spr = k.getSprite(config.id);
          const w = spr?.width ?? spr?.w ?? spr?.data?.width ?? spr?.data?.w ?? spr?.data?.frames?.[0]?.w ?? spr?.data?.frames?.[0]?.width;
          const h = spr?.height ?? spr?.h ?? spr?.data?.height ?? spr?.data?.h ?? spr?.data?.frames?.[0]?.h ?? spr?.data?.frames?.[0]?.height;
          if (w && h) {
            const scale = Math.min(playerShape.width / w, playerShape.height / h);
            ent.scale = k.vec2(scale, scale);
          } else {
            const scale = Math.min(playerShape.width / playerSize, playerShape.height / playerSize);
            ent.scale = k.vec2(scale, scale);
          }
        } catch (err) {
          const scale = Math.min(playerShape.width / playerSize, playerShape.height / playerSize);
          ent.scale = k.vec2(scale, scale);
        }
      });
    });
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

    // TOUCH CONTROLS - Slide to move, Tap to fire
    let touchStartX = null;
    let touchStartY = null;
    let isTouchMoving = false;
    let lastTouchPos = null;
    const touchMoveThreshold = 10; // pixels to distinguish tap from slide

    // Visual indicator for touch control zone (lower half of screen)
    const controlZone = k.add([
      k.rect(k.width(), k.height() / 2),
      k.pos(0, k.height() / 2),
      k.color(0, 0, 0),
      k.opacity(0.1),
      k.z(50),
      "controlZone"
    ]);

    // Touch control hint
    k.add([
      k.text("SLIDE TO MOVE | TAP TO FIRE", { size: k.width() < 600 ? 14 : 12 }),
      k.pos(k.width() / 2, k.height() - 20),
      k.anchor("center"),
      k.color(180, 180, 200),
      k.z(100),
      "ui"
    ]);

    // Touch event handlers
    k.onMousePress(() => {
      if (paused) return;
      touchStartX = k.mousePos().x;
      touchStartY = k.mousePos().y;
      lastTouchPos = k.mousePos();
      isTouchMoving = false;
    });

    k.onMouseRelease(() => {
      if (paused) return;
      
      // If didn't move much, it's a tap - FIRE!
      if (!isTouchMoving && touchStartX !== null && touchStartY !== null) {
        const dx = Math.abs(k.mousePos().x - touchStartX);
        const dy = Math.abs(k.mousePos().y - touchStartY);
        
        if (dx < touchMoveThreshold && dy < touchMoveThreshold) {
          shoot();
        }
      }
      
      touchStartX = null;
      touchStartY = null;
      lastTouchPos = null;
      isTouchMoving = false;
    });

    // Movement and player update - HORIZONTAL ONLY (bottom shooter)
    k.onUpdate(() => {
      if (paused) return;

      const moveDir = k.vec2(0, 0);

      // Touch sliding control
      if (k.isMouseDown() && lastTouchPos !== null) {
        const currentPos = k.mousePos();
        const dx = currentPos.x - lastTouchPos.x;
        
        // If moved more than threshold, it's sliding
        if (Math.abs(dx) > 2) {
          isTouchMoving = true;
          moveDir.x = dx * 0.5; // Smooth movement based on slide velocity
        }
        
        lastTouchPos = currentPos;
      }

      // Keyboard movement (still available)
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

      // Update player detail(s) position
      playerLogoEntities.forEach((ent) => {
        if (!ent) return;
        if (typeof ent.exists === 'function' ? ent.exists() : true) {
          ent.pos = player.pos;
        }
      });

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

      // Standardized enemy visual using addLogo helper
      const enemySprite = addLogo({
        k,
        spriteKey: "bal-enemy",
        x: pos.x,
        y: pos.y,
        maxW: 40,
        maxH: 40,
        z: 9,
        color: "#ffffff",
        fallbackId: "bal-enemy"
        ,
        isDynamic: true
      });

      const enemyLogoEntities = enemySprite || [];
      enemyLogoEntities.forEach((ent) => {
        if (!ent) return;
        ent.pos = enemy.pos.clone();
        ent.onUpdate(() => {
          if (enemy.exists()) {
            ent.pos = enemy.pos.clone();
          } else {
            k.destroy(ent);
          }
        });
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

          // Update label position for all logo entities
          enemyLogoEntities.forEach((ent) => {
            if (!ent) return;
            if (typeof ent.exists === 'function' ? ent.exists() : true) {
              ent.pos = enemy.pos;
            }
          });

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
        enemyLogoEntities.forEach((ent) => {
          if (!ent) return;
          if (typeof ent.exists === 'function' ? ent.exists() : true) k.destroy(ent);
        });
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
      
      // Destroy player and its logo entities
      k.destroy(player);
      playerLogoEntities.forEach((ent) => {
        if (!ent) return;
        if (typeof ent.exists === 'function' ? ent.exists() : true) k.destroy(ent);
      });
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
