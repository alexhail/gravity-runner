import 'phaser';
import { Game } from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { SettingsScene } from './game/scenes/SettingsScene';
import { LeaderboardScene } from './game/scenes/LeaderboardScene';
import { ProfileScene } from './game/scenes/ProfileScene';
import { LoginScene } from './game/scenes/LoginScene';
import { RegisterScene } from './game/scenes/RegisterScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: import.meta.env.DEV
    }
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    GameOverScene,
    SettingsScene,
    LeaderboardScene,
    ProfileScene,
    LoginScene,
    RegisterScene
  ]
};

const game = new Game(config);
window.game = game;

// Add window resize handler
window.addEventListener('resize', () => {
  if (window.game) {
    window.game.scale.resize(window.innerWidth, window.innerHeight);
  }
}); 