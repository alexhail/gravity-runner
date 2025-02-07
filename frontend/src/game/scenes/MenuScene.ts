import { Scene } from 'phaser';

interface MenuButton extends Phaser.GameObjects.Rectangle {
  text: Phaser.GameObjects.Text;
  setScale(x: number, y: number): this;
}

interface MenuItem {
  text: string;
  scene: string;
  requiresAuth: boolean;
  isGuest?: boolean;
}

export class MenuScene extends Scene {
  private buttons: MenuButton[] = [];
  private selectedButton: number = 0;
  private background!: Phaser.GameObjects.Sprite;
  private statusText!: Phaser.GameObjects.Text;
  private menuItems: MenuItem[] = [
    { text: 'Play', scene: 'GameScene', requiresAuth: false },
    { text: 'Settings', scene: 'SettingsScene', requiresAuth: false },
    { text: 'Leaderboard', scene: 'LeaderboardScene', requiresAuth: false }
  ];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Check authentication status with better validation
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    let isLoggedIn = false;
    let parsedUser = null;

    if (token && userData) {
      try {
        parsedUser = JSON.parse(userData);
        isLoggedIn = !!parsedUser && !!parsedUser.username;
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        isLoggedIn = false;
      }
    }

    // Clear menu items and rebuild based on current state
    this.menuItems = [
      { text: 'Play', scene: 'GameScene', requiresAuth: false },
      { text: 'Settings', scene: 'SettingsScene', requiresAuth: false },
      { text: 'Leaderboard', scene: 'LeaderboardScene', requiresAuth: false }
    ];

    // Update menu items based on auth status
    if (!isLoggedIn) {
      this.menuItems.push(
        { text: 'Play as Guest', scene: 'GameScene', requiresAuth: false, isGuest: true },
        { text: 'Login / Register', scene: 'LoginScene', requiresAuth: false }
      );
    } else {
      this.menuItems.push(
        { text: 'Profile', scene: 'ProfileScene', requiresAuth: true }
      );
    }

    // Add a single full-screen background
    this.background = this.add.sprite(width / 2, height / 2, 'bgLayer1')
      .setOrigin(0.55, 0.4);
    
    // Scale the background to cover the entire screen
    const scaleX = (width / this.background.width) * 1.5;
    const scaleY = (height / this.background.height) * 1.5;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    // Create a semi-transparent overlay for better text readability
    this.add.rectangle(0, 0, width, height, 0x000000, 0.3)
      .setOrigin(0, 0);

    // Add auth button in top left with modern styling
    const authButtonWidth = 120;
    const authButtonHeight = 40;
    const buttonX = 20;
    const buttonY = 20;

    const authButton = this.add.container(buttonX, buttonY);
    
    // Create glass-like background with gradient
    const buttonBg = this.add.rectangle(0, 0, authButtonWidth, authButtonHeight, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x444444)
      .setInteractive({ useHandCursor: true });

    // Add glow effect
    const glow = this.add.rectangle(0, 0, authButtonWidth, authButtonHeight, 0xffffff, 0.1)
      .setOrigin(0, 0);

    // Create button text
    const buttonText = this.add.text(
      authButtonWidth / 2,
      authButtonHeight / 2,
      isLoggedIn ? 'LOGOUT' : 'LOGIN',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    )
    .setShadow(1, 1, '#000000', 3)
    .setOrigin(0.5);

    // Add hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setStrokeStyle(2, 0x00ff00);
      buttonText.setColor('#00ff00');
      glow.setAlpha(0.2);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setStrokeStyle(2, 0x444444);
      buttonText.setColor('#ffffff');
      glow.setAlpha(0.1);
    });

    buttonBg.on('pointerdown', () => {
      if (isLoggedIn) {
        // Handle logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('userLoggedOut'));
        this.scene.restart();
      } else {
        // Handle login
        this.scene.start('LoginScene', { returnScene: 'MenuScene' });
      }
    });

    authButton.add([buttonBg, glow, buttonText]);

    // Add title with animation
    const title = this.add.text(width / 2, height / 4, 'Gravity Runner', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    })
    .setShadow(2, 2, '#000000', 15, true)
    .setOrigin(0.5, 0.5)
    .setAlpha(0);

    // Add subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 60, 'A Gravity-Defying Adventure', {
      fontSize: '24px',
      color: '#cccccc',
      fontStyle: 'italic'
    })
    .setShadow(1, 1, '#000000', 5)
    .setOrigin(0.5, 0.5)
    .setAlpha(0);

    // Create or update status text
    this.statusText = this.add.text(width - 20, 20, '', {
      fontSize: '18px',
      align: 'right'
    })
    .setOrigin(1, 0)
    .setShadow(1, 1, '#000000', 2);
    this.updateStatusText();

    // Create menu container with adjusted positioning
    const menuContainer = this.add.container(width / 2, (height / 2) + 100);

    // --- UPDATED DIMENSIONS FOR SMALLER BUTTONS ---
    const buttonSpacing = 50; // Reduced spacing
    const buttonWidth = Math.min(250, width * 0.6); // Smaller button width
    const buttonHeight = 40; // Reduced button height

    // Calculate total menu height and vertical start offset
    const totalMenuHeight = this.menuItems.length * buttonSpacing;
    const startY = -totalMenuHeight / 2;

    this.menuItems.forEach((item, index) => {
      const yPos = startY + (index * buttonSpacing);
      
      // Create button container
      const buttonContainer = this.add.container(0, yPos);
      
      // Create button background with adjusted size
      const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x000000, 0.7)
        .setStrokeStyle(2, 0x666666)
        .setInteractive({ useHandCursor: true });

      // Create button text with adjusted size
      const buttonText = this.add.text(0, 0, item.text, {
        fontSize: '24px', // Slightly reduced font size
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      })
      .setShadow(1, 1, '#000000', 2)
      .setOrigin(0.5);

      // Add hover effects
      buttonBg.on('pointerover', () => {
        buttonBg.setStrokeStyle(2, 0x00ff00);
        buttonText.setColor('#00ff00');
        this.selectButton(index);
      });

      buttonBg.on('pointerout', () => {
        if (this.selectedButton !== index) {
          buttonBg.setStrokeStyle(2, 0x666666);
          buttonText.setColor('#ffffff');
        }
      });

      buttonBg.on('pointerdown', () => {
        this.handleButtonClick(index);
      });

      // Add to containers
      buttonContainer.add([buttonBg, buttonText]);
      menuContainer.add(buttonContainer);

      // Store button reference
      const menuButton = buttonBg as unknown as MenuButton;
      menuButton.text = buttonText;
      this.buttons.push(menuButton);
    });

    // Start background animation
    this.animateBackground();

    // Add version text
    this.add.text(10, height - 30, 'v1.0.0', {
      fontSize: '16px',
      color: '#666666'
    });

    // Add controls hint
    this.add.text(width - 10, height - 30, 'Use ↑↓ to navigate, ENTER to select', {
      fontSize: '16px',
      color: '#666666',
      align: 'right'
    }).setOrigin(1, 0);

    // Title animation
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      y: '+=30',
      duration: 1000,
      ease: 'Power2',
      delay: this.tweens.stagger(200, { from: 0 }),
      onComplete: () => {
        // Select first button after title animation completes
        this.selectButton(0);
      }
    });

    // Add fade-in effect
    this.cameras.main.fadeIn(500);

    // Add listener for login status changes
    window.addEventListener('userLoggedIn', this.handleLoginStatusChange.bind(this));
    window.addEventListener('userLoggedOut', this.handleLoginStatusChange.bind(this));
  }

  update(): void {
    // No background scrolling needed for static background
  }

  private selectButton(index: number): void {
    if (!this.scene.isActive()) return; // Don't update if scene is transitioning

    // Deselect all buttons
    this.buttons.forEach(button => {
      if (!button || !button.scene) return; // Skip if button was destroyed
      (button as unknown as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x666666);
      if (button.text && button.text.scene) {
        button.text.setColor('#ffffff');
      }
      this.tweens.killTweensOf(button);
      button.setScale(1, 1);
    });

    // Select new button
    const button = this.buttons[index];
    if (!button || !button.scene) return; // Skip if button was destroyed
    
    (button as unknown as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x00ff00);
    if (button.text && button.text.scene) {
      button.text.setColor('#00ff00');
    }
    
    // Pulse animation for selected button
    this.tweens.add({
      targets: [button],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.selectedButton = index;
  }

  private handleButtonClick(index: number): void {
    // Add button click effect with saved volume
    this.sound?.play('click', { volume: this.game.registry.get('sfxVolume') ?? 0.5 });

    const menuItem = this.menuItems[index];
    if (!menuItem) return;

    // Handle guest mode
    if (menuItem.isGuest) {
      this.game.registry.set('isGuestMode', true);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
      return;
    }

    // Handle auth-required scenes
    if (menuItem.requiresAuth && !localStorage.getItem('token')) {
      // If authentication is required and user is not logged in, redirect to login
      this.scene.start('LoginScene', { returnScene: menuItem.scene });
      return;
    }

    // Set guest mode to false for non-guest plays
    this.game.registry.set('isGuestMode', false);

    // Transition to the selected scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(menuItem.scene);
    });
  }

  private animateBackground(): void {
    // Create a subtle floating animation for the background
    this.tweens.add({
      targets: this.background,
      y: this.background.y + 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private handleLoginStatusChange(): void {
    this.updateStatusText();
  }

  private updateStatusText(): void {
    const userData = localStorage.getItem('user');
    let statusMessage = 'Not Logged In';
    let isLoggedIn = false;

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.username) {
          statusMessage = `Welcome, ${parsedUser.username}!`;
          isLoggedIn = true;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    this.statusText.setText(statusMessage);
    this.statusText.setColor(isLoggedIn ? '#00ff00' : '#ff0000');
  }
} 