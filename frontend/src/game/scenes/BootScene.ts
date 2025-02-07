import { Scene } from 'phaser';
import { placeholderAssets } from '../../assets/placeholder';
import { audioAssets } from '../../assets/audio';

export class BootScene extends Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    this.createLoadingBar();

    // Loading progress events
    this.load.on('progress', (value: number) => {
      this.loadingBar.clear();
      this.loadingBar.fillStyle(0x2ecc71, 1);
      this.loadingBar.fillRect(
        this.cameras.main.centerX - 150,
        this.cameras.main.centerY - 15,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      this.loadingBar.destroy();
      this.loadingText.destroy();
    });

    // Load player spritesheet
    this.load.spritesheet('player', placeholderAssets.player, {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 5
    });

    // Load enemy spritesheet
    this.load.spritesheet('enemy', placeholderAssets.enemy, {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 3
    });

    // Load other placeholder assets
    Object.entries(placeholderAssets).forEach(([key, dataUrl]) => {
      if (key !== 'player' && key !== 'enemy') {  // Skip player and enemy since we loaded them as spritesheets
        // Load background layers with repeat enabled
        if (key.startsWith('bgLayer')) {
          this.load.image(key, dataUrl);
        } else {
          this.load.image(key, dataUrl);
        }
      }
    });

    // Load audio assets
    Object.entries(audioAssets).forEach(([key, dataUrl]) => {
      this.load.audio(key, dataUrl);
    });

    // Error handling for asset loading
    this.load.on('loaderror', (file: { key: string }) => {
      console.error(`Error loading asset: ${file.key}`);
      this.loadingText.setText(`Error loading ${file.key}...`);
    });
  }

  create(): void {
    // Initialize default volume settings if they don't exist
    if (typeof this.game.registry.get('musicVolume') !== 'number') {
      this.game.registry.set('musicVolume', 0.25);
    }
    if (typeof this.game.registry.get('sfxVolume') !== 'number') {
      this.game.registry.set('sfxVolume', 0.25);
    }

    // Start the menu scene
    this.scene.start('MenuScene');
  }

  private createLoadingBar(): void {
    // Create loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 0.8);
    this.loadingBar.fillRect(
      this.cameras.main.centerX - 150,
      this.cameras.main.centerY - 15,
      300,
      30
    );

    // Create loading text
    this.loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'Loading...',
      {
        color: '#ffffff',
        fontSize: '24px'
      }
    ).setOrigin(0.5);
  }
} 