import { Scene, GameObjects, Physics, Types } from 'phaser';

interface PlayerState {
  isGravityFlipped: boolean;
  speed: number;
  score: number;
  isInvulnerable: boolean;
  lastFlipTime: number;  // Track the last time player flipped gravity
  verticalVelocity: number;  // Track vertical velocity for momentum
}

interface GameStats {
  startTime: number;
  collectiblesCollected: number;
  maxDistance: number;
  finalScore: number;
}

export class GameScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private platforms!: Physics.Arcade.Group;
  private collectibles!: Physics.Arcade.Group;
  private enemies!: Physics.Arcade.Group;
  private playerState: PlayerState = {
    isGravityFlipped: false,
    speed: 400,
    score: 0,
    isInvulnerable: false,
    lastFlipTime: 0,
    verticalVelocity: 0
  };
  private gameStats: GameStats = {
    startTime: 0,
    collectiblesCollected: 0,
    maxDistance: 0,
    finalScore: 0
  };
  private scoreText!: GameObjects.Text;
  private gameSpeed: number = 400;
  private bgMusic!: Phaser.Sound.BaseSound;
  private lastPlatformX: number = 0;
  private readonly SEGMENT_WIDTH: number = 800;
  private readonly PLATFORM_BUFFER: number = 2;
  private debugText!: GameObjects.Text;
  private isDebugVisible: boolean = false;
  private isGameEnding: boolean = false;
  
  // Constants
  private readonly PLAYER_GRAVITY: number = 3000;
  private readonly PLAYER_SPEED: number = 650;
  private readonly PLAYER_SCALE: number = 1.4;
  private readonly ENEMY_SCALE: number = 1.6;
  private readonly PLATFORM_SIZE: number = 36;
  private pursuingEnemy!: Physics.Arcade.Sprite;
  private background!: Phaser.GameObjects.TileSprite;
  
  constructor() {
    super({ key: 'GameScene' });
  }

  private resetPlayerState(): void {
    this.playerState = {
      isGravityFlipped: false,
      speed: this.PLAYER_SPEED,
      score: 0,
      isInvulnerable: false,
      lastFlipTime: 0,
      verticalVelocity: 0
    };
    
    // Reset physics world gravity to default
    if (this.physics && this.physics.world) {
      this.physics.world.gravity.y = this.PLAYER_GRAVITY;
    }
  }

  create(): void {
    // Reset game state at the start
    this.resetPlayerState();
    
    // Ensure input is enabled and reset
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
      this.input.keyboard.clearCaptures();
    }
    
    // Initialize game stats
    this.gameStats = {
      startTime: Date.now(),
      collectiblesCollected: 0,
      maxDistance: 0,
      finalScore: 0
    };
    
    // Set world bounds for extended scrolling
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, this.scale.height);
    
    // Add parallax backgrounds
    this.createParallaxBackground();

    // Start background music
    this.bgMusic = this.sound.add('bgMusic', { 
      loop: true, 
      volume: this.game.registry.get('musicVolume') ?? 0.5 
    });
    this.bgMusic.play();

    // Create game objects
    this.createPlatforms();
    this.createEnemies();
    this.createPlayer();
    this.createCollectibles();
    
    // Setup camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
    this.cameras.main.setDeadzone(100, 200);
    
    // Setup collisions
    this.setupCollisions();
    
    // Setup UI
    this.createUI();
    
    // Setup input handling
    this.setupInputs();
    
    // Generate initial platforms
    this.generateInitialPlatforms();
    
    // Create debug text
    this.createDebugText();

    // Initially disable debug
    this.physics.world.drawDebug = false;
    if (this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.visible = false;
    }
  }

  update(): void {
    this.handlePlayerMovement();
    this.updateGameObjects();
    this.checkGameOver();
    this.updateEnemies();
    this.checkPlayerBounds();
    
    // Update background scroll based on camera position
    if (this.background && this.background instanceof Phaser.GameObjects.TileSprite) {
      this.background.tilePositionX = this.cameras.main.scrollX * 0.1;
    }
    
    // Update debug info if visible
    if (this.isDebugVisible) {
      this.updateDebugInfo();
    }
    
    // Generate new platforms if needed
    const cameraX = this.cameras.main.scrollX;
    if (this.lastPlatformX - cameraX < this.SEGMENT_WIDTH * this.PLATFORM_BUFFER) {
      this.generateLevelSegment();
    }
    
    // Clean up platforms that are far behind
    this.platforms.children.iterate((platform: GameObjects.GameObject) => {
      if (platform instanceof Physics.Arcade.Sprite && platform.x < cameraX - this.scale.width) {
        platform.destroy();
      }
      return true;
    });

    // Update max distance
    const currentDistance = Math.floor(this.player.x);
    this.gameStats.maxDistance = Math.max(this.gameStats.maxDistance, currentDistance);
  }

  private createParallaxBackground(): void {
    // Get the game dimensions
    const width = this.scale.width;
    const height = this.scale.height;

    // Create a tileSprite for infinite scrolling background
    this.background = this.add.tileSprite(0, 0, width, height, 'bgLayer1')
      .setOrigin(0, 0)
      .setScrollFactor(0);
    
    // Set the camera bounds to match the world bounds
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);
  }

  private generateInitialPlatforms(): void {
    // Clear any existing platforms first
    this.platforms.clear(true, true);
    
    // Reset platform tracking
    this.lastPlatformX = 0;
    
    // Create a proper starting platform that's guaranteed
    const startPlatformWidth = this.PLATFORM_SIZE * 4; // 4 blocks wide starting platform
    const startPlatformHeight = this.PLATFORM_SIZE * 3; // 3 blocks tall
    const startY = this.scale.height - startPlatformHeight;
    
    // Create the starting platform blocks
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 3; y++) {
        this.createPlatform(
          x * this.PLATFORM_SIZE,
          startY + (y * this.PLATFORM_SIZE),
          this.PLATFORM_SIZE
        );
      }
    }
    
    this.lastPlatformX = startPlatformWidth;
    
    // Generate first few segments
    for (let i = 0; i < this.PLATFORM_BUFFER; i++) {
      this.generateLevelSegment();
    }
  }

  private generateLevelSegment(): void {
    const segmentStart = this.lastPlatformX;
    const segmentEnd = segmentStart + this.SEGMENT_WIDTH;
    
    // Generate tunnel pattern
    const tunnelPattern = this.getTunnelPattern();
    
    // Create platforms based on tunnel pattern
    for (let x = 0; x < this.SEGMENT_WIDTH / this.PLATFORM_SIZE; x++) {
      for (let y = 0; y < tunnelPattern.length; y++) {
        if (tunnelPattern[y][x % tunnelPattern[0].length]) {
          const platformX = segmentStart + (x * this.PLATFORM_SIZE);
          const platformY = y * this.PLATFORM_SIZE; // Simply use y directly for proper screen space
          this.createPlatform(platformX, platformY, this.PLATFORM_SIZE);
        }
      }
    }
    
    this.lastPlatformX = segmentEnd;
    
    // Ensure pursuing enemy exists and follows player
    if (!this.pursuingEnemy || !this.pursuingEnemy.active) {
      this.createPursuingEnemy();
    }
  }

  private getTunnelPattern(): boolean[][] {
    const pattern: boolean[][] = [];
    const blocksInHeight = Math.floor(this.scale.height / this.PLATFORM_SIZE);
    const segmentWidth = 32;
    
    // Initialize with empty space
    for (let y = 0; y < blocksInHeight; y++) {
      pattern[y] = new Array(segmentWidth).fill(false);
    }

    // Create tunnel segments
    let currentY = Math.floor(blocksInHeight / 2);
    let lastTunnelHeight = 5;
    
    for (let x = 0; x < segmentWidth; x += 4) {
      // Smoothly vary tunnel height
      const heightVariation = Math.random() < 0.3 ? Math.random() < 0.5 ? 1 : -1 : 0;
      const tunnelHeight = Phaser.Math.Clamp(lastTunnelHeight + heightVariation, 4, 6);
      lastTunnelHeight = tunnelHeight;
      
      // More dynamic vertical movement
      if (x % 8 === 0) {
        const moveAmount = Math.floor(Math.random() * 3) + 1;
        currentY += (Math.random() < 0.5 ? -1 : 1) * moveAmount;
      }
      currentY = Phaser.Math.Clamp(currentY, tunnelHeight + 2, blocksInHeight - tunnelHeight - 2);

      // Create the tunnel walls for this segment
      for (let segX = x; segX < Math.min(x + 4, segmentWidth); segX++) {
        // Create main tunnel walls
        pattern[currentY - tunnelHeight][segX] = true;
        pattern[currentY + tunnelHeight][segX] = true;

        // Very occasionally add guide blocks to hint at path (further reduced frequency)
        if (segX === x && Math.random() < 0.1) { // Reduced from 0.15
          const isTop = Math.random() < 0.5;
          const guideY = isTop ? currentY - tunnelHeight + 3 : currentY + tunnelHeight - 3;
          if (guideY >= 0 && guideY < blocksInHeight) {
            pattern[guideY][segX] = true;
          }
        }

        // Add challenging obstacles with better spacing (even more reduced frequency)
        if (segX === x + 2 && Math.random() < 0.15) { // Reduced from 0.25
          const isTop = Math.random() < 0.5;
          // Place obstacles further from walls for better visibility
          const obstacleY = isTop ? 
            currentY - tunnelHeight + 3 : 
            currentY + tunnelHeight - 3;
          
          if (obstacleY >= 0 && obstacleY < blocksInHeight) {
            pattern[obstacleY][segX] = true;
            // Very rare chance of second obstacle
            if (Math.random() < 0.15) { // Reduced from 0.2
              const oppositeY = isTop ? 
                currentY + tunnelHeight - 3 : 
                currentY - tunnelHeight + 3;
              pattern[oppositeY][segX + 1] = true;
            }
          }
        }
      }
    }

    // Ensure starting area is clear
    for (let x = 0; x < 6; x++) { // Increased clear area from 5 to 6
      for (let y = 0; y < blocksInHeight; y++) {
        pattern[y][x] = false;
      }
    }

    return pattern;
  }

  private createPursuingEnemy(): void {
    // Create single pursuing enemy that follows the player
    this.pursuingEnemy = this.enemies.create(this.player.x - 300, this.player.y, 'enemy');
    this.pursuingEnemy
      .setCollideWorldBounds(true)
      .setBounce(0.2)
      .setScale(this.ENEMY_SCALE)
      .setTint(0xff0000); // Red tint to make it more menacing
    
    // Set up enemy animations
    if (!this.anims.exists('enemy-chase')) {
      this.anims.create({
        key: 'enemy-chase',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
        frameRate: 15,
        repeat: -1
      });
    }
    
    this.pursuingEnemy.anims.play('enemy-chase', true);
  }

  private createPlatform(x: number, y: number, size: number): Physics.Arcade.Sprite {
    const platform = this.platforms.create(x + size/2, y + size/2, 'platform');
    platform.setImmovable(true);
    platform.body.allowGravity = false;
    platform.displayWidth = size;
    platform.displayHeight = this.PLATFORM_SIZE; // Always use PLATFORM_SIZE for height
    platform.refreshBody();
    return platform;
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setScale(this.PLAYER_SCALE); // Set player scale
    
    // Add player animations
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10
    });

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'jump',
      frames: [
        { key: 'player', frame: 4 },
        { key: 'player', frame: 5 }
      ],
      frameRate: 10,
      repeat: 0
    });

    // Set initial animation
    this.player.anims.play('idle');
  }

  private createCollectibles(): void {
    this.collectibles = this.physics.add.group();
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group();
  }

  private setupCollisions(): void {
    // Player collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    
    // Player-enemy collision/overlap
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyCollision as Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    // Player-collectible overlap
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.handleCollectibleCollection as Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private createUI(): void {
    this.scoreText = this.add.text(16, 16, `Score: ${this.playerState.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    });
    
    // Fix UI to camera
    this.scoreText.setScrollFactor(0);
  }

  private setupInputs(): void {
    // Clear any existing keyboard listeners first
    this.input.keyboard?.removeAllListeners();
    
    // Set up new listeners
    this.input.keyboard?.on('keydown-SPACE', this.flipGravity, this);
    this.input.on('pointerdown', this.flipGravity, this);
    this.input.keyboard?.on('keydown-F1', this.toggleDebug, this);
  }

  private handlePlayerMovement(): void {
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = {
      left: this.input.keyboard?.addKey('A'),
      right: this.input.keyboard?.addKey('D'),
      up: this.input.keyboard?.addKey('W'),
      down: this.input.keyboard?.addKey('S')
    };
    const body = this.player.body as Physics.Arcade.Body;
    
    // Add air resistance when moving vertically
    const airResistance = 0.98;
    body.velocity.y *= airResistance;
    
    // Check for both arrow keys and WASD
    const isMovingLeft = cursors?.left.isDown || wasd.left?.isDown;
    const isMovingRight = cursors?.right.isDown || wasd.right?.isDown;
    
    if (isMovingLeft) {
      // Reduced horizontal speed in mid-air
      const speedMultiplier = (body.touching.down || body.touching.up) ? 1 : 0.8;
      this.player.setVelocityX(-this.playerState.speed * speedMultiplier);
      this.player.flipX = true;
      if (body.touching.down || body.touching.up) {
        this.player.anims.play('run', true);
      }
    } else if (isMovingRight) {
      // Reduced horizontal speed in mid-air
      const speedMultiplier = (body.touching.down || body.touching.up) ? 1 : 0.8;
      this.player.setVelocityX(this.playerState.speed * speedMultiplier);
      this.player.flipX = false;
      if (body.touching.down || body.touching.up) {
        this.player.anims.play('run', true);
      }
    } else {
      this.player.setVelocityX(0);
      if (body.touching.down || body.touching.up) {
        this.player.anims.play('idle');
      }
    }
    
    // Play jump animation when player is not touching ground
    if (!body.touching.down && !body.touching.up) {
      this.player.anims.play('jump', true);
    }
    
    // Update debug info if visible
    if (this.isDebugVisible) {
      this.updateDebugInfo();
    }
  }

  private updateGameObjects(): void {
    // Update score based on horizontal progress
    const newScore = Math.floor(this.player.x / 100); // Every 100 pixels = 1 point
    if (newScore > this.playerState.score) {
      this.playerState.score = newScore;
      this.scoreText.setText(`Score: ${this.playerState.score}`);
    }
    
    // Remove off-screen objects
    this.cleanupOffscreenObjects();
    
    // Increase game speed based on horizontal progress
    this.updateGameSpeed();
  }

  private checkGameOver(): void {
    if (this.playerState.score <= 0 && !this.isGameEnding) {
      this.handleGameOver();
    }
  }

  private async updateProfileStats(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash if present
      
      // If logged in, update profile stats
      if (token && !this.game.registry.get('isGuestMode')) {
        // Update profile stats
        const profileResponse = await fetch(`${baseUrl}/api/profiles/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            playTime: Math.floor((Date.now() - this.gameStats.startTime) / 1000),
            score: this.playerState.score,
            distance: this.gameStats.maxDistance,
            collectibles: this.gameStats.collectiblesCollected
          })
        });

        if (!profileResponse.ok) {
          console.error('Failed to update profile stats');
        }
      }

      // Get or generate guest ID for guest users
      let guestId = localStorage.getItem('guestId');
      if (!guestId) {
        // Generate a random 10-digit number
        guestId = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
        localStorage.setItem('guestId', guestId);
      }

      // Submit score to leaderboard (for both guests and logged-in users)
      const scoreResponse = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && !this.game.registry.get('isGuestMode') ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          score: this.playerState.score,
          gameTime: Math.floor((Date.now() - this.gameStats.startTime) / 1000),
          collectibles: this.gameStats.collectiblesCollected,
          distance: this.gameStats.maxDistance,
          ...(this.game.registry.get('isGuestMode') ? { guestId } : {})
        })
      });

      if (!scoreResponse.ok) {
        console.error('Failed to submit score to leaderboard');
        return;
      }

      const scoreResult = await scoreResponse.json();
      if (scoreResult.isHighScore) {
        // Play high score sound if available
        if (this.sound.get('highScore')) {
          this.sound.play('highScore', { volume: this.game.registry.get('sfxVolume') ?? 0.5 });
        }
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  private handleEnemyCollision(
    _player: Physics.Arcade.Sprite | Physics.Arcade.Body | Phaser.Tilemaps.Tile,
    enemy: Physics.Arcade.Sprite | Physics.Arcade.Body | Phaser.Tilemaps.Tile
  ): void {
    if (!this.playerState.isInvulnerable && enemy instanceof Physics.Arcade.Sprite) {
      const playerBody = this.player.body as Physics.Arcade.Body;
      const enemyBody = enemy.body as Physics.Arcade.Body;
      
      // Check if player is above the enemy (stomping)
      if (playerBody.velocity.y > 0 && 
          playerBody.y + playerBody.height * 0.8 <= enemyBody.y) {
        // Destroy enemy
        enemy.destroy();
        
        // Bounce player up
        this.player.setVelocityY(-400);
        
        // Add bonus score for defeating enemy
        this.playerState.score += 5; // Reduced bonus since main score is from progress
        this.scoreText.setText(`Score: ${this.playerState.score}`);
        
        // Play enemy defeat sound with settings volume
        this.sound.play('enemyDefeat', { volume: this.game.registry.get('sfxVolume') ?? 0.5 });
      } else {
        // Player takes damage
        this.handleObstacleCollision();
      }
    }
  }

  private handleObstacleCollision(): void {
    if (!this.playerState.isInvulnerable) {
      // Play death sound if available
      if (this.sound.get('deathSound')) {
        this.sound.play('deathSound', { volume: this.game.registry.get('sfxVolume') ?? 0.5 });
      }

      // Trigger game over immediately
      this.handleGameOver();
    }
  }

  private handleCollectibleCollection(_player: Physics.Arcade.Sprite | Physics.Arcade.Body | Phaser.Tilemaps.Tile, collectible: Physics.Arcade.Sprite | Physics.Arcade.Body | Phaser.Tilemaps.Tile): void {
    if (collectible instanceof Physics.Arcade.Sprite) {
      collectible.destroy();
      this.playerState.score += 2; // Reduced bonus since main score is from progress
      this.gameStats.collectiblesCollected++;
      this.scoreText.setText(`Score: ${this.playerState.score}`);
      
      // Play collectible sound with current volume setting
      this.sound.play('collectSound', { volume: this.game.registry.get('sfxVolume') ?? 0.5 });
    }
  }

  private cleanupOffscreenObjects(): void {
    const leftBound = -100;
    this.platforms.getChildren().forEach((platform: GameObjects.GameObject) => {
      if (platform instanceof Physics.Arcade.Sprite && platform.x < leftBound) {
        platform.destroy();
      }
    });
    
    this.collectibles.getChildren().forEach((collectible: GameObjects.GameObject) => {
      if (collectible instanceof Physics.Arcade.Sprite && collectible.x < leftBound) {
        collectible.destroy();
      }
    });

    this.enemies.getChildren().forEach((enemy: GameObjects.GameObject) => {
      if (enemy instanceof Physics.Arcade.Sprite && enemy.x < leftBound) {
        enemy.destroy();
      }
    });
  }

  private updateGameSpeed(): void {
    // Increase speed based on horizontal progress instead of score
    const progressBasedSpeed = Math.floor(this.player.x / 1000) * 50;
    this.gameSpeed = this.PLAYER_SPEED + progressBasedSpeed;
  }

  private flipGravity(): void {
    const playerBody = this.player.body as Physics.Arcade.Body;
    
    // Store current vertical velocity
    this.playerState.verticalVelocity = playerBody.velocity.y;
    
    // Calculate velocity impact based on current vertical speed
    const velocityImpact = Math.abs(this.playerState.verticalVelocity) > 400 ? 0.8 : 0.5;
    
    // Flip gravity and apply momentum-based velocity
    this.playerState.isGravityFlipped = !this.playerState.isGravityFlipped;
    const gravityY = this.playerState.isGravityFlipped ? -this.PLAYER_GRAVITY : this.PLAYER_GRAVITY;
    this.physics.world.gravity.y = gravityY;
    
    // Apply a reduced initial velocity in the opposite direction
    playerBody.setVelocityY(-this.playerState.verticalVelocity * velocityImpact);
    
    // Visual feedback
    this.player.setFlipY(this.playerState.isGravityFlipped);
    
    // Play jump sound with settings volume
    this.sound.play('jump', { volume: this.game.registry.get('sfxVolume') ?? 0.5 });
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
  }

  private updateEnemies(): void {
    if (this.pursuingEnemy && this.pursuingEnemy.active) {
      const directionX = this.player.x - this.pursuingEnemy.x;
      const directionY = this.player.y - this.pursuingEnemy.y;
      
      const length = Math.sqrt(directionX * directionX + directionY * directionY);
      const normalizedX = directionX / length;
      const normalizedY = directionY / length;
      
      // Base speed relative to player's current speed
      let enemySpeed = this.playerState.speed * 0.85;
      
      // More aggressive catch-up
      const catchupDistance = 450; // Reduced for more pressure
      if (length > catchupDistance) {
        const catchupFactor = Math.min(length / catchupDistance, 3.0); // Faster catch-up
        enemySpeed *= catchupFactor;
        
        if (length > 700) { // Reduced teleport distance
          const teleportDistance = 250;
          this.pursuingEnemy.setPosition(
            this.player.x - teleportDistance,
            this.player.y
          );
        }
      }
      
      // Smarter obstacle avoidance
      const enemyBody = this.pursuingEnemy.body as Physics.Arcade.Body;
      if (enemyBody.blocked.left || enemyBody.blocked.right || 
          enemyBody.blocked.up || enemyBody.blocked.down) {
        // More aggressive obstacle avoidance
        const avoidanceSpeed = enemySpeed * 2.5;
        if (enemyBody.blocked.left || enemyBody.blocked.right) {
          // Prioritize vertical movement when horizontally blocked
          this.pursuingEnemy.setVelocity(
            normalizedX * avoidanceSpeed * 0.5,
            normalizedY * avoidanceSpeed * 1.5
          );
        } else {
          // Prioritize horizontal movement when vertically blocked
          this.pursuingEnemy.setVelocity(
            normalizedX * avoidanceSpeed * 1.5,
            normalizedY * avoidanceSpeed * 0.5
          );
        }
      } else {
        this.pursuingEnemy.setVelocity(
          normalizedX * enemySpeed,
          normalizedY * enemySpeed
        );
      }
      
      this.pursuingEnemy.flipX = directionX < 0;
      
      // Closer minimum distance for more pressure
      const minDistance = 120;
      if (length < minDistance) {
        this.pursuingEnemy.setVelocity(
          normalizedX * enemySpeed * 0.4,
          normalizedY * enemySpeed * 0.4
        );
      }
    } else {
      this.createPursuingEnemy();
    }
  }

  private createDebugText(): void {
    this.debugText = this.add.text(16, this.scale.height - 40, 'Debug Mode: OFF (F1)', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);
    this.debugText.setVisible(false);
  }

  private toggleDebug(): void {
    this.isDebugVisible = !this.isDebugVisible;
    
    // Toggle physics debug
    this.physics.world.drawDebug = this.isDebugVisible;
    if (this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.visible = this.isDebugVisible;
    }

    // Update debug text
    this.debugText.setVisible(this.isDebugVisible);
    this.debugText.setText(`Debug Mode: ${this.isDebugVisible ? 'ON' : 'OFF'} (F1)\n` +
      `FPS: ${Math.round(this.game.loop.actualFps)}`);

    // Show additional debug info when enabled
    if (this.isDebugVisible) {
      this.updateDebugInfo();
    }
  }

  private updateDebugInfo(): void {
    if (this.isDebugVisible) {
      const playerBody = this.player.body as Physics.Arcade.Body;
      this.debugText.setText(
        `Debug Mode: ON (F1)\n` +
        `FPS: ${Math.round(this.game.loop.actualFps)}\n` +
        `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
        `Player Velocity: (${Math.round(playerBody.velocity.x)}, ${Math.round(playerBody.velocity.y)})\n` +
        `Game Speed: ${this.gameSpeed}\n` +
        `Active Platforms: ${this.platforms.countActive()}\n` +
        `Active Enemies: ${this.enemies.countActive()}\n` +
        `Active Collectibles: ${this.collectibles.countActive()}`
      );
    }
  }

  private checkPlayerBounds(): void {
    // Check if player has fallen off the map
    if (this.player.y > this.scale.height + 100 || this.player.y < -100) {
      // Disable player input temporarily
      if (this.input.keyboard) {
        this.input.keyboard.enabled = false;
      }
      
      // Trigger game over
      this.handleGameOver();
    }
  }

  private handleGameOver(): void {
    // Prevent multiple calls
    if (this.isGameEnding) return;
    this.isGameEnding = true;
    
    // Stop background music
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
    
    // Update final score in game stats
    this.gameStats.finalScore = this.playerState.score;
    
    // Save high score and update stats before transitioning
    this.updateProfileStats().finally(() => {
      // Transition to game over scene
      this.scene.start('GameOverScene', {
        score: this.playerState.score,
        distance: this.gameStats.maxDistance,
        collectibles: this.gameStats.collectiblesCollected
      });
    });
  }

  shutdown(): void {
    // Clean up input listeners when scene shuts down
    if (this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
      this.input.keyboard.enabled = true;
    }
    this.input.removeAllListeners();
    
    // Stop any ongoing sounds
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
    
    // Reset game state
    this.resetPlayerState();
  }
} 