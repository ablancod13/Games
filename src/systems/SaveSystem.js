const KEY = 'resistorun_v1';

const DEFAULTS = {
  coins: 0,
  highScore: 0,
  totalCoins: 0,
  runHistory: [],
  achievements: [],
  inventory: {
    bionic_legs: false,    // permanent upgrade
  },
  shopItems: {},           // { itemId: count }
  stats: {
    kpc_treated: 0,
    mbl_treated: 0,
    gold_caught: 0,
    total_runs: 0,
  },
  dailyChallenge: {
    date: '',
    challenges: [],
    progress: {},
  },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* quota exceeded – silent */ }
}

class SaveSystem {
  constructor() {
    this._data = load();
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
    save(this._data);
  }

  addCoins(amount) {
    this._data.coins = Math.max(0, (this._data.coins || 0) + amount);
    if (amount > 0) {
      this._data.totalCoins = (this._data.totalCoins || 0) + amount;
    }
    save(this._data);
    return this._data.coins;
  }

  spendCoins(amount) {
    if (this._data.coins < amount) return false;
    this._data.coins -= amount;
    save(this._data);
    return true;
  }

  updateHighScore(dist) {
    if (dist > (this._data.highScore || 0)) {
      this._data.highScore = dist;
      save(this._data);
      return true;
    }
    return false;
  }

  addRun(runData) {
    const history = this._data.runHistory || [];
    history.unshift(runData);
    this._data.runHistory = history.slice(0, 5);
    this._data.stats.total_runs = (this._data.stats.total_runs || 0) + 1;
    save(this._data);
  }

  unlockAchievement(id) {
    if (!this._data.achievements.includes(id)) {
      this._data.achievements.push(id);
      save(this._data);
      return true; // newly unlocked
    }
    return false;
  }

  hasAchievement(id) {
    return this._data.achievements.includes(id);
  }

  incrementStat(key, amount = 1) {
    this._data.stats[key] = (this._data.stats[key] || 0) + amount;
    save(this._data);
    return this._data.stats[key];
  }

  getStat(key) {
    return this._data.stats[key] || 0;
  }

  hasShopItem(id) {
    return !!(this._data.shopItems && this._data.shopItems[id]);
  }

  addShopItem(id, qty = 1) {
    if (!this._data.shopItems) this._data.shopItems = {};
    this._data.shopItems[id] = (this._data.shopItems[id] || 0) + qty;
    save(this._data);
  }

  consumeShopItem(id) {
    if (!this._data.shopItems || !this._data.shopItems[id]) return false;
    this._data.shopItems[id]--;
    if (this._data.shopItems[id] <= 0) delete this._data.shopItems[id];
    save(this._data);
    return true;
  }

  getShopItemCount(id) {
    return (this._data.shopItems && this._data.shopItems[id]) || 0;
  }

  getDailyChallenge() {
    const today = new Date().toISOString().slice(0, 10);
    if (this._data.dailyChallenge.date !== today) {
      this._data.dailyChallenge = { date: today, challenges: [], progress: {} };
      save(this._data);
    }
    return this._data.dailyChallenge;
  }

  updateDailyProgress(challengeId, value) {
    const dc = this.getDailyChallenge();
    dc.progress[challengeId] = value;
    this._data.dailyChallenge = dc;
    save(this._data);
  }
}

export const saveSystem = new SaveSystem();
