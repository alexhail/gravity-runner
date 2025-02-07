// Audio asset imports
import jumpSound from './jump.mp3';
import collectSound from './collect.mp3';
import gameOverSound from './gameover.mp3';
import backgroundMusic from './music.mp3';

// Export audio assets
export const audioAssets = {
  // Button click sound - will use collect sound for now
  click: collectSound,
  
  // Game background music
  bgMusic: backgroundMusic,
  
  // Jump sound effect
  jump: jumpSound,
  
  // Collect item sound effect
  collect: collectSound,
  
  // Game over sound effect
  gameOver: gameOverSound,

  // Enemy defeat sound - will use collect sound for now
  enemyDefeat: collectSound,

  // Death sound - will use game over sound for now
  death: gameOverSound
}; 