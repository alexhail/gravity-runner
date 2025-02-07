import { Scene, GameObjects } from 'phaser';

interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
}

export class SettingsScene extends Scene {
  private settings: SettingsState;
  private buttons: GameObjects.Container[] = [];
  private selectedButton: number = 0;
  private background!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'SettingsScene' });
    this.settings = {
      musicVolume: 0.25,
      sfxVolume: 0.25
    };
  }

  create(): void {
    // Load saved settings from registry with proper fallbacks
    const savedMusicVolume = this.game.registry.get('musicVolume');
    const savedSfxVolume = this.game.registry.get('sfxVolume');

    this.settings = {
      musicVolume: typeof savedMusicVolume === 'number' ? savedMusicVolume : 0.25,
      sfxVolume: typeof savedSfxVolume === 'number' ? savedSfxVolume : 0.25
    };

    // Save initial settings to ensure they exist
    this.saveSettings();

    // Apply initial volume settings to any existing background music
    const bgMusic = this.sound.get('bgMusic') as Phaser.Sound.WebAudioSound;
    if (bgMusic) {
      bgMusic.volume = this.settings.musicVolume;
    }

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Add background with proper scaling
    this.background = this.add.sprite(width / 2, height / 2, 'bgLayer1')
      .setOrigin(0.5, 0.5);
    
    // Scale the background to cover the entire screen with extra padding
    const scaleX = (width + 100) / this.background.width;
    const scaleY = (height + 100) / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    // Add semi-transparent background overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0, 0);

    // Add title with animation
    this.add.text(this.cameras.main.centerX, 100, 'Settings', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Create settings container for better organization
    const settingsContainer = this.add.container(centerX, centerY);

    // Create settings controls with improved visuals and tighter spacing
    this.createVolumeControl(0, -60, 'Music Volume', 'musicVolume', settingsContainer);
    this.createVolumeControl(0, 60, 'SFX Volume', 'sfxVolume', settingsContainer);

    // Create back button with improved visuals
    this.createMenuButton(centerX, height * 0.85, 'Back to Menu');

    // Add fade-in effect
    this.cameras.main.fadeIn(500);

    // Add controls hint
    this.add.text(width - 10, height - 30, 'Use ↑↓ to navigate, ENTER to select, ESC for menu', {
      fontSize: '16px',
      color: '#666666',
      align: 'right'
    }).setOrigin(1, 0);

    // Setup keyboard input
    this.setupKeyboardInput();
  }

  private createVolumeControl(x: number, y: number, label: string, key: 'musicVolume' | 'sfxVolume', container: Phaser.GameObjects.Container): void {
    const controlContainer = this.add.container(x, y);
    const CONTROL_WIDTH = 340; // Match the width of difficulty buttons total width
    
    // Add label with improved styling
    const text = this.add.text(0, -30, label, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    })
    .setShadow(2, 2, '#000000', 5)
    .setOrigin(0.5, 0.5);

    // Create volume bar background with improved visuals
    const barBg = this.add.rectangle(0, 0, CONTROL_WIDTH, 20, 0x333333)
      .setStrokeStyle(2, 0x666666)
      .setOrigin(0.5, 0.5);
    
    // Create volume bar fill with gradient effect
    const barFill = this.add.rectangle(-CONTROL_WIDTH/2, 0, CONTROL_WIDTH, 20, 0x00ff00)
      .setOrigin(0, 0.5);
    barFill.setScale(this.settings[key], 1);

    // Create interactive area with visual feedback
    const hitArea = this.add.rectangle(0, 0, CONTROL_WIDTH, 40, 0x000000, 0)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    // Add hover effect
    hitArea.on('pointerover', () => {
      barBg.setStrokeStyle(2, 0x00ff00);
    });

    hitArea.on('pointerout', () => {
      barBg.setStrokeStyle(2, 0x666666);
    });

    // Handle click/drag with improved visual feedback
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.updateVolume(pointer, barBg, barFill, key);
    });

    hitArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.updateVolume(pointer, barBg, barFill, key);
      }
    });

    hitArea.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.updateVolume(pointer, barBg, barFill, key);
      // Play test sound only on mouse release
      if (key === 'sfxVolume') {
        this.sound.play('click', { volume: this.settings.sfxVolume });
      }
    });

    controlContainer.add([text, barBg, barFill, hitArea]);
    container.add(controlContainer);
    this.buttons.push(controlContainer);
  }

  private updateVolume(pointer: Phaser.Input.Pointer, barBg: GameObjects.Rectangle, barFill: GameObjects.Rectangle, key: 'musicVolume' | 'sfxVolume'): void {
    const bounds = barBg.getBounds();
    const volume = Phaser.Math.Clamp((pointer.x - bounds.left) / bounds.width, 0, 1);
    
    this.settings[key] = volume;
    barFill.setScale(volume, 1);

    // Save the volume setting immediately
    this.saveSettings();

    // Update game volume with smooth transition
    if (key === 'musicVolume') {
      // Update all music sounds
      this.sound.getAllPlaying().forEach(sound => {
        if (sound.key === 'bgMusic') {
          this.tweens.add({
            targets: sound,
            volume: volume,
            duration: 100
          });
        }
      });
    }
  }

  private createMenuButton(x: number, y: number, text: string): void {
    const buttonWidth = 300;
    const buttonHeight = 60;
    const button = this.add.container(x, y);
    
    // Create button background with larger size
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x000000, 0.5)
      .setStrokeStyle(2, 0x666666)
      .setInteractive({ useHandCursor: true });

    // Create button text with proper sizing
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    })
    .setShadow(1, 1, '#000000', 5)
    .setOrigin(0.5);

    // Add hover effects
    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0x00ff00);
      buttonText.setColor('#00ff00');
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x666666);
      buttonText.setColor('#ffffff');
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x333333);
      buttonText.setColor('#cccccc');
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x000000, 0.5);
      buttonText.setColor('#ffffff');
      this.transitionToMenu();
    });

    button.add([bg, buttonText]);
    this.buttons.push(button);
  }

  private setupKeyboardInput(): void {
    this.input.keyboard?.on('keydown-UP', () => {
      this.selectedButton = (this.selectedButton - 1 + this.buttons.length) % this.buttons.length;
      this.highlightButton(this.selectedButton);
      // Apply current sfx volume when playing sound
      this.sound?.play('click', { volume: this.settings.sfxVolume });
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      this.selectedButton = (this.selectedButton + 1) % this.buttons.length;
      this.highlightButton(this.selectedButton);
      // Apply current sfx volume when playing sound
      this.sound?.play('click', { volume: this.settings.sfxVolume });
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      const button = this.buttons[this.selectedButton];
      if (button) {
        const bg = button.list[0] as GameObjects.Rectangle;
        bg.emit('pointerdown');
        bg.emit('pointerup');
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.transitionToMenu();
    });
  }

  private highlightButton(index: number): void {
    this.buttons.forEach((button, i) => {
      const bg = button.list[0] as GameObjects.Rectangle;
      const text = button.list[1] as GameObjects.Text;
      if (bg && text) {
        if (i === index) {
          bg.setStrokeStyle(2, 0x00ff00);
          text.setColor('#00ff00');
        } else {
          bg.setStrokeStyle(2, 0x666666);
          text.setColor('#ffffff');
        }
      }
    });
  }

  private saveSettings(): void {
    // Save all settings to registry
    this.game.registry.set('musicVolume', this.settings.musicVolume);
    this.game.registry.set('sfxVolume', this.settings.sfxVolume);

    // Log settings to verify they're being saved
    console.log('Settings saved:', {
      musicVolume: this.game.registry.get('musicVolume'),
      sfxVolume: this.game.registry.get('sfxVolume')
    });
  }

  private cleanupScene(): void {
    // Clean up all tweens
    this.tweens.killAll();
    // Clear button references
    this.buttons = [];
    // Stop all sounds created in this scene
    this.sound.stopAll();
    // Remove all event listeners
    this.input.keyboard?.removeAllListeners();
    // Stop all animations
    this.anims.pauseAll();
  }

  private transitionToMenu(): void {
    // Apply current sfx volume when playing sound
    this.sound?.play('click', { volume: this.settings.sfxVolume });
    this.saveSettings();
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cleanupScene();
      this.scene.start('MenuScene');
    });
  }
} 