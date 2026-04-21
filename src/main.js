import Phaser from 'phaser';
import { W, H } from './config/GameConfig.js';
import { BootScene }       from './scenes/BootScene.js';
import { MenuScene }       from './scenes/MenuScene.js';
import { GameScene }       from './scenes/GameScene.js';
import { AntibioticScene } from './scenes/AntibioticScene.js';
import { ShopScene }       from './scenes/ShopScene.js';
import { GameOverScene }   from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width:  W,
  height: H,
  backgroundColor: '#0A0A1A',
  parent: document.body,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene, AntibioticScene, ShopScene, GameOverScene],
  input: {
    activePointers: 2,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

new Phaser.Game(config);
