/// <reference types="phaser" />

declare module 'phaser' {
  export = Phaser;
  export as namespace Phaser;
}

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

export {};