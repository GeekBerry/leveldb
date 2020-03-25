/*
  [LevelUp Document](https://github.com/Level/levelup)
  [LevelDown Document](https://github.com/Level/leveldown)
 */

const { promisify } = require('util');
const fileSystem = require('fs');
const LevelUP = require('level-party');

class LevelDB {
  constructor({ location, ...options }) {
    this.location = location;
    this.levelUp = LevelUP(location, options);
  }

  async set(key, value) {
    return this.levelUp.put(key, value);
  }

  async del(key) {
    return this.levelUp.del(key);
  }

  async batch(options) {
    return this.levelUp.batch(options);
  }

  async clear(options) {
    return this.levelUp.clear(options);
  }

  // --------------------------------------------------------------------------
  async get(key) {
    try {
      return await this.levelUp.get(key);
    } catch (e) {
      if (e.notFound) {
        return undefined;
      }
      throw e;
    }
  }

  async list(options) {
    return new Promise(((resolve, reject) => {
      const array = [];
      this.levelUp.readStream(options)
        .on('data', data => {
          array.push(data);
        })
        .on('end', () => {
          resolve(array);
        })
        .on('error', reject);
    }));
  }

  async keys(options) {
    return this.list({ ...options, values: false });
  }

  async values(options) {
    return this.list({ ...options, keys: false });
  }

  // --------------------------------------------------------------------------
  async close() {
    return this.levelUp.close();
  }

  async destroy() {
    await this.close();
    await promisify(fileSystem.rmdir)(this.location, { recursive: true });
  }
}

module.exports = LevelDB;
