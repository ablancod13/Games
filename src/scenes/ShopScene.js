import { ShopUI } from '../ui/ShopUI.js';

export class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    new ShopUI(this);
  }
}
