import { Scene } from 'phaser';

interface GameOverSceneData {
  score: number;
  isGuest: boolean;
}

export class GameOverScene extends Scene {
  private score: number = 0;
  private isGuest: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverSceneData): void {
    this.score = data.score;
    this.isGuest = data.isGuest;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Add game over text
    this.add.text(centerX, centerY - 100, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add final score
    this.add.text(centerX, centerY, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Add guest mode message if applicable
    if (this.isGuest) {
      this.add.text(centerX, centerY + 50, 'Playing as Guest - Score not saved', {
        fontSize: '20px',
        color: '#888888',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }

    // Create buttons
    const buttonStartY = this.isGuest ? centerY + 120 : centerY + 80;
    
    this.createButton(centerX, buttonStartY, 'Play Again', () => {
      // Reset game state and start new game
      this.game.registry.set('score', 0);
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });

    this.createButton(centerX, buttonStartY + 60, 'Main Menu', () => {
      this.scene.start('MenuScene');
    });

    // Add login button for guest players
    if (this.isGuest) {
      this.createButton(centerX, buttonStartY + 120, 'Login to Save Scores', () => {
        this.scene.start('LoginScene', { returnScene: 'MenuScene' });
      });
    }

    // Add fade-in effect
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): void {
    const button = this.add.container(x, y);

    // Create button background with increased width
    const bg = this.add.rectangle(0, 0, 300, 50, 0x666666)  // Increased width from 200 to 300, height from 40 to 50
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0x888888);
        buttonText.setColor('#ffffff');
      })
      .on('pointerout', () => {
        bg.setFillStyle(0x666666);
        buttonText.setColor('#eeeeee');
      })
      .on('pointerdown', () => {
        bg.setFillStyle(0x444444);
        buttonText.setColor('#cccccc');
      })
      .on('pointerup', () => {
        bg.setFillStyle(0x666666);
        buttonText.setColor('#eeeeee');
        onClick();
      });

    // Create button text with adjusted font size and padding
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',  // Increased from 24px
      color: '#eeeeee',
      padding: { x: 10, y: 5 }  // Added padding
    }).setOrigin(0.5);

    // Add background and text to container
    button.add([bg, buttonText]);
  }
} 