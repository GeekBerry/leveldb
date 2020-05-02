const LevelInterface = require('./LevelInterface');

/**
 * extend LevelInterface by level-up
 */
class LevelDB extends LevelInterface {
  constructor({
    LevelUp,
    location,
    ...options
  }) {
    super();
    const levelUp = new LevelUp(location, options);
    this.put = levelUp.put.bind(levelUp);
    this.del = levelUp.del.bind(levelUp);
    this.batch = levelUp.batch.bind(levelUp);
    this.clear = levelUp.clear.bind(levelUp);
    this.close = levelUp.close.bind(levelUp);
    this.levelUp = levelUp;
  }

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

  async keys(filter = {}) {
    return this.list({ ...filter, values: false });
  }

  async values(filter = {}) {
    return this.list({ ...filter, keys: false });
  }
}

module.exports = LevelDB;
