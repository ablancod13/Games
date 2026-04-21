import { C } from '../config/GameConfig.js';
import { saveSystem } from './SaveSystem.js';

export class ScoreSystem {
  constructor() {
    this._coins      = 0;
    this._distance   = 0;
    this._streak     = 0;
    this._bestStreak = 0;
    this._correctCatches = 0;
    this._wrongCatches   = 0;
    this._patientsHealed = 0;
    this._coinsEarned    = 0;
    this._lastCoinMilestone = 0;
    this._multiplier     = 1;
  }

  addDistance(pixels) {
    const meters = pixels / C.PIXELS_PER_METER;
    this._distance += meters;

    // Distance-based coin reward
    const milestone = Math.floor(this._distance / 100);
    if (milestone > this._lastCoinMilestone) {
      this._lastCoinMilestone = milestone;
      this.addCoins(C.COINS_PER_100M, 'distance');
    }

    return meters;
  }

  addCoins(amount, source = 'pickup') {
    if (amount > 0) {
      const earned = amount * this._multiplier;
      this._coins += earned;
      this._coinsEarned += earned;
    } else {
      this._coins = Math.max(0, this._coins + amount); // no multiplier on penalties
    }
    return this._coins;
  }

  onAntibioticCatch(score) {
    if (score > 0) {
      this._streak++;
      if (this._streak > this._bestStreak) this._bestStreak = this._streak;
      this._correctCatches++;

      const mult = this._getStreakMultiplier();
      this.addCoins(score * mult);
      return { coins: score * mult, streak: this._streak, multiplier: mult };
    } else if (score < 0) {
      this._streak = 0;
      this._multiplier = 1;
      this._wrongCatches++;
      this.addCoins(score); // negative
      return { coins: score, streak: 0, multiplier: 1 };
    } else {
      return { coins: 0, streak: this._streak, multiplier: this._multiplier };
    }
  }

  _getStreakMultiplier() {
    const thresholds = C.STREAK_THRESHOLDS;
    const multipliers = C.STREAK_MULTIPLIERS;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (this._streak >= thresholds[i]) return multipliers[i];
    }
    return 1;
  }

  onPatientHealed() {
    this._patientsHealed++;
    this.addCoins(5);
  }

  pickupCoin() {
    this.addCoins(1, 'coin');
    return this._coins;
  }

  // Flush earned coins to persistent save at end of run
  commitToSave() {
    saveSystem.addCoins(this._coinsEarned);
    return this._coinsEarned;
  }

  get distance()       { return Math.floor(this._distance); }
  get coins()          { return this._coins; }
  get streak()         { return this._streak; }
  get bestStreak()     { return this._bestStreak; }
  get correctCatches() { return this._correctCatches; }
  get wrongCatches()   { return this._wrongCatches; }
  get patientsHealed() { return this._patientsHealed; }
  get totalCatches()   { return this._correctCatches + this._wrongCatches; }

  get accuracy() {
    return this.totalCatches > 0
      ? Math.round(this._correctCatches / this.totalCatches * 100)
      : 100;
  }

  get runSummary() {
    return {
      distance:      this.distance,
      coins:         this._coinsEarned,
      patientsHealed: this._patientsHealed,
      correctCatches: this._correctCatches,
      wrongCatches:   this._wrongCatches,
      accuracy:       this.accuracy,
      bestStreak:     this._bestStreak,
      date:           new Date().toLocaleDateString('es-ES'),
    };
  }
}
