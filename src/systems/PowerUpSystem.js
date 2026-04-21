import { saveSystem } from './SaveSystem.js';

export const SHOP_ITEMS = [
  {
    id: 'rocket_boost',
    name: 'Cohete Boost',
    description: 'Invencible + velocidad 3x durante 5s',
    icon: '🚀',
    cost: 150,
    consumable: true,
  },
  {
    id: 'immuno_shield',
    name: 'Inmunoescudo',
    description: 'Absorbe 1 obstáculo sin perder la carrera',
    icon: '🛡️',
    cost: 100,
    consumable: true,
  },
  {
    id: 'bionic_legs',
    name: 'Piernas Biónicas',
    description: 'Desbloquea el doble salto permanente',
    icon: '⚡',
    cost: 200,
    consumable: false,
    permanent: true,
  },
  {
    id: 'steth_radar',
    name: 'Radar Esteto',
    description: 'Muestra el tipo del próximo obstáculo',
    icon: '🔭',
    cost: 120,
    consumable: true,
  },
  {
    id: 'ab_guide',
    name: 'Guía ATB',
    description: 'Muestra qué antibióticos son correctos en la fase',
    icon: '📋',
    cost: 80,
    consumable: true,
  },
  {
    id: 'white_blood_cell',
    name: 'Leucocito',
    description: 'Auto-destruye 3 antibióticos incorrectos en la fase',
    icon: '⚪',
    cost: 250,
    consumable: true,
  },
  {
    id: 'bacteriophage',
    name: 'Bacteriófago',
    description: 'Duplica los puntos de toda la fase antibiótica',
    icon: '🦠',
    cost: 300,
    consumable: true,
  },
];

export class PowerUpSystem {
  constructor(scene) {
    this._scene = scene;
    this._active = {};       // { id: { endTime, ... } }
    this._runInventory = {}; // copies of inventory for this run

    // Load what the player has
    SHOP_ITEMS.forEach(item => {
      if (item.permanent) {
        this._runInventory[item.id] = saveSystem.hasShopItem(item.id) ? 1 : 0;
      } else {
        this._runInventory[item.id] = saveSystem.getShopItemCount(item.id);
      }
    });
  }

  has(id) {
    return (this._runInventory[id] || 0) > 0;
  }

  activate(id, duration = 0) {
    if (!this.has(id)) return false;

    if (SHOP_ITEMS.find(i => i.id === id)?.consumable) {
      this._runInventory[id]--;
      saveSystem.consumeShopItem(id);
    }

    if (duration > 0) {
      this._active[id] = {
        endTime: this._scene.time.now + duration,
      };
    } else {
      this._active[id] = { permanent: true };
    }
    return true;
  }

  isActive(id) {
    const entry = this._active[id];
    if (!entry) return false;
    if (entry.permanent) return true;
    return this._scene.time.now < entry.endTime;
  }

  getRemainingMs(id) {
    const entry = this._active[id];
    if (!entry || entry.permanent) return 0;
    return Math.max(0, entry.endTime - this._scene.time.now);
  }

  update() {
    // Clean up expired
    Object.keys(this._active).forEach(id => {
      const e = this._active[id];
      if (!e.permanent && this._scene.time.now >= e.endTime) {
        delete this._active[id];
      }
    });
  }

  // Called from GameScene when rocket is used
  activateRocket(doctor) {
    if (!this.activate('rocket_boost', 5000)) return false;
    doctor.setInvincible(true);
    this._scene.time.delayedCall(5000, () => doctor.setInvincible(false));
    return true;
  }

  // Returns true if shield absorbs the hit
  tryAbsorbHit() {
    if (!this.isActive('immuno_shield')) {
      if (!this.has('immuno_shield')) return false;
      this.activate('immuno_shield', 1);
    }
    // Shield is single-use
    delete this._active['immuno_shield'];
    this._scene.cameras.main.flash(300, 0, 180, 255);
    return true;
  }

  hasBionicLegs() {
    return this.isActive('bionic_legs') || saveSystem.hasShopItem('bionic_legs');
  }

  hasAbGuide() {
    return this.has('ab_guide');
  }

  consumeAbGuide() {
    if (this.has('ab_guide')) {
      this._runInventory['ab_guide']--;
      saveSystem.consumeShopItem('ab_guide');
      return true;
    }
    return false;
  }

  hasWhiteBloodCell() { return this.has('white_blood_cell'); }
  consumeWbc() {
    if (this.has('white_blood_cell')) {
      this._runInventory['white_blood_cell']--;
      saveSystem.consumeShopItem('white_blood_cell');
      return true;
    }
    return false;
  }

  hasBacteriophage() { return this.has('bacteriophage'); }
  consumeBacteriophage() {
    if (this.has('bacteriophage')) {
      this._runInventory['bacteriophage']--;
      saveSystem.consumeShopItem('bacteriophage');
      return true;
    }
    return false;
  }
}
