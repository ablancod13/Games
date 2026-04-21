import { C } from '../config/GameConfig.js';
import { createObstaclePool } from '../entities/Obstacle.js';
import { createPatientPool } from '../entities/Patient.js';
import { getRandomPatientForLevel } from '../config/PatientsData.js';

export class SpawnSystem {
  constructor(scene) {
    this._scene = scene;

    this._obstaclePool  = createObstaclePool(scene, 12);
    this._patientPool   = createPatientPool(scene, 3);

    this._nextObstacleX  = C.W + 300;
    this._nextPatientDist = Phaser.Math.Between(C.PATIENT_MIN_DIST, C.PATIENT_MAX_DIST);
    this._lastPatientDist = 0;

    this._coins = [];
    this._nextCoinX = C.W + 400;

    // Store active obstacles, patients, coins for external access
    this.obstacles = this._obstaclePool.getChildren();
    this.patients  = this._patientPool;
    this.coins     = this._coins;
  }

  update(speed, delta, currentDistance, currentLevel) {
    const dx = speed * delta / 1000;

    // Update active obstacles
    this._obstaclePool.getChildren().forEach(obs => obs.update(speed, delta));

    // Update active patients
    this._patientPool.forEach(p => p.update(speed, delta));

    // Update coins
    this._coins.forEach(c => {
      if (!c.active) return;
      c.x -= dx;
      if (c.x < -50) { c.setActive(false).setVisible(false); }
    });

    // Spawn obstacles
    this._nextObstacleX -= dx;
    if (this._nextObstacleX < C.W + 50) {
      this._spawnObstacle(speed, currentLevel);
    }

    // Spawn coins
    this._nextCoinX -= dx;
    if (this._nextCoinX < C.W + 50) {
      this._spawnCoinRow();
    }

    // Spawn patient
    const distSinceLast = currentDistance - this._lastPatientDist;
    if (distSinceLast >= this._nextPatientDist) {
      this._spawnPatient(currentDistance, currentLevel);
    }
  }

  _spawnObstacle(speed, currentLevel) {
    const obs = this._obstaclePool.getFirstDead();
    if (!obs) return;

    obs.activate(C.W + 80, speed);

    // Gap decreases with speed (harder levels)
    const speedRatio = Math.min(1, (speed - C.INITIAL_SPEED) / (C.MAX_SPEED - C.INITIAL_SPEED));
    const minGap = C.MIN_OBS_GAP - speedRatio * 80;
    const maxGap = C.MAX_OBS_GAP - speedRatio * 100;
    this._nextObstacleX = Phaser.Math.Between(minGap, maxGap);
  }

  _spawnCoinRow() {
    const height = Phaser.Math.RND.pick([
      C.GROUND_Y - 30,               // floor level
      C.GROUND_Y - 120,              // mid-air
      C.GROUND_Y - 220,              // high
    ]);
    const count = Phaser.Math.Between(3, 7);

    for (let i = 0; i < count; i++) {
      let coin = this._coins.find(c => !c.active);
      if (!coin) {
        coin = this._scene.add.image(0, 0, 'coin')
          .setOrigin(0.5).setDepth(7);
        this._coins.push(coin);
      }
      coin.setPosition(C.W + 60 + i * 44, height).setActive(true).setVisible(true).setScale(1);

      // Bobbing animation
      this._scene.tweens.add({
        targets: coin,
        y: coin.y - 12,
        duration: 600 + i * 50,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    this._nextCoinX = Phaser.Math.Between(C.COIN_SPACING, C.COIN_SPACING * 2);
  }

  _spawnPatient(currentDistance, currentLevel) {
    const patient = this._patientPool.find(p => !p.active);
    if (!patient) return;

    const data = getRandomPatientForLevel(currentLevel);
    patient.activate(data, C.W + 120);

    this._lastPatientDist  = currentDistance;
    this._nextPatientDist  = Phaser.Math.Between(C.PATIENT_MIN_DIST, C.PATIENT_MAX_DIST);
  }

  reset() {
    this._obstaclePool.getChildren().forEach(o => o.deactivate());
    this._patientPool.forEach(p => p.deactivate());
    this._coins.forEach(c => { c.setActive(false).setVisible(false); });
    this._nextObstacleX  = C.W + 300;
    this._nextPatientDist = Phaser.Math.Between(C.PATIENT_MIN_DIST, C.PATIENT_MAX_DIST);
    this._lastPatientDist = 0;
    this._nextCoinX = C.W + 400;
  }
}
