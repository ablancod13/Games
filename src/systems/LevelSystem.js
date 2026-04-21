import { getLevelByDistance, LEVELS } from '../config/AntibioticsData.js';

export class LevelSystem {
  constructor(onLevelUp) {
    this._currentLevel = LEVELS[0];
    this._previousLevelNum = 1;
    this._onLevelUp = onLevelUp;
    this._speed = 260;
  }

  update(distance, baseSpeed) {
    const levelData = getLevelByDistance(distance);

    if (levelData.level !== this._previousLevelNum) {
      this._previousLevelNum = levelData.level;
      this._currentLevel = levelData;
      this._onLevelUp && this._onLevelUp(levelData);
    }

    // Speed ramps up continuously based on distance
    const speedRamp = distance * 0.06;
    this._speed = Math.min(700, baseSpeed + speedRamp);

    return this._speed;
  }

  get currentLevel() { return this._currentLevel; }
  get levelNum()     { return this._currentLevel.level; }
  get mechanisms()   { return this._currentLevel.mechanisms; }
  get levelName()    { return this._currentLevel.name; }
  get speed()        { return this._speed; }
}
