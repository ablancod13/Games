import { C } from '../config/GameConfig.js';

const OBSTACLE_TYPES = [
  { key: 'obs_bed',        w: 102, h: 76, bodyH: 76, bodyOffY: 0,  label: 'Cama'         },
  { key: 'obs_ivpole',     w: 34,  h: 126,bodyH: 126,bodyOffY: 0,  label: 'Gotero'       },
  { key: 'obs_wheelchair', w: 84,  h: 82, bodyH: 82, bodyOffY: 0,  label: 'Silla ruedas' },
  { key: 'obs_cart',       w: 72,  h: 90, bodyH: 90, bodyOffY: 0,  label: 'Carro med.'   },
  { key: 'obs_screen',     w: 72,  h: 110,bodyH: 110,bodyOffY: 0,  label: 'Biombo'       },
];

export class Obstacle extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, 0, 0, 'obs_bed');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.setActive(false).setVisible(false);
    this._type = null;
  }

  activate(x, speed) {
    const typeData = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    this._type = typeData;

    const groundedY = C.GROUND_Y - typeData.h + typeData.bodyH;

    this.setTexture(typeData.key);
    this.setOrigin(0, 1);
    this.setPosition(x, C.GROUND_Y);
    this.setActive(true).setVisible(true);
    this.setDepth(8);

    // Resize static body — pass parent y (GROUND_Y) so body.reset positions correctly with origin (0,1)
    this.body.setSize(typeData.w, typeData.bodyH);
    this.body.reset(x, C.GROUND_Y);

    return this;
  }

  deactivate() {
    this.setActive(false).setVisible(false);
  }

  update(speed, delta) {
    if (!this.active) return;
    const dx = speed * delta / 1000;
    this.x -= dx;
    this.body.reset(this.x, this.y); // this.y = GROUND_Y; body.y (top) is derived via getTopLeft with origin (0,1)

    if (this.x < -200) this.deactivate();
  }
}

export function createObstaclePool(scene, size = 10) {
  const group = scene.add.group({
    classType: Obstacle,
    runChildUpdate: false,
    maxSize: size,
  });
  // Pre-fill pool
  for (let i = 0; i < size; i++) {
    group.add(new Obstacle(scene), true);
  }
  return group;
}
