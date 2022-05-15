const LevelDBLevelDown = require('leveldown');
const { promisify } = require('util');

function promisifyResults(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      func.call(this, ...args, (error, ...results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  };
}

class LevelDB {
  /**
   * @param options {object}
   * @param options.location {string}
   * @param [options.LevelDown=`require('leveldown')`] {object} - `require('leveldown')` or `require('rocksdb')`
   * @param [options.asBuffer=false] {string}
   * @param [options.cacheGet=true] {boolean}
   * @param [options.cacheIter=false] {boolean}
   * @param [options.syncPut=false] {boolean}
   * @param [options.syncDel=false] {boolean}
   * @param [options.syncBatch=false] {boolean}
   * @param [rest.errorIfExists=false] {boolean}
   * @param [rest.createIfMissing=true] {boolean}
   * @param [rest.compression=true] {boolean}
   * @param [rest.readOnly=false] {boolean}
   * @param [rest.cacheSize=8*1024*1024] {number}
   */
  constructor({
    LevelDown = LevelDBLevelDown,
    location,
    asBuffer = false,
    cacheGet = true,
    cacheIter = false,
    syncPut = false,
    syncDel = false,
    syncBatch = false,
    ...rest
  }) {
    const levelDown = new LevelDown(location);
    levelDown.open = promisify(levelDown.open);
    levelDown.get = promisify(levelDown.get);
    levelDown.batch = promisify(levelDown.batch);
    levelDown.put = promisify(levelDown.put);
    levelDown.del = promisify(levelDown.del);
    levelDown.clear = promisify(levelDown.clear);
    levelDown.close = promisify(levelDown.close);
    this.levelDown = levelDown.open(rest).then(() => levelDown);

    this.iterOptions = { fillCache: cacheIter, keyAsBuffer: asBuffer, valueAsBuffer: asBuffer };
    this.getOptions = { fillCache: cacheGet, asBuffer };
    this.putOptions = { sync: syncPut };
    this.delOptions = { sync: syncDel };
    this.batchOptions = { sync: syncBatch };
  }

  // --------------------------------------------------------------------------
  /**
   * @param key {string|Buffer}
   * @param value {string|Buffer}
   * @return {Promise<undefined>}
   */
  async put(key, value) {
    const levelDown = await this.levelDown;
    return levelDown.put(key, value, this.putOptions);
  }

  /**
   * @param key {string|Buffer}
   * @return {Promise<undefined>}
   */
  async del(key) {
    const levelDown = await this.levelDown;
    return levelDown.del(key, this.delOptions);
  }

  /**
   * @param array {[object]} - Operate array
   * @return {Promise<undefined>}
   */
  async batch(array) {
    const levelDown = await this.levelDown;

    return levelDown.batch(array, this.batchOptions);
  }

  /**
   * @param options {object} - Filter
   * @return {Promise<undefined>}
   */
  async clear(options) {
    const levelDown = await this.levelDown;
    return levelDown.clear(options);
  }

  // --------------------------------------------------------------------------
  /**
   * @param key {string|Buffer}
   * @return {Promise<string|Buffer>}
   */
  async get(key) {
    const levelDown = await this.levelDown;
    try {
      return await levelDown.get(key, this.getOptions);
    } catch (e) {
      if (e.message.startsWith('NotFound')) {
        return undefined;
      }
      throw e;
    }
  }

  /**
   * @see https://github.com/Level/leveldown#dbiteratoroptions
   *
   * @param options {object}
   * @param [options.gt] {string|Buffer}
   * @param [options.gte] {string|Buffer}
   * @param [options.lt] {string|Buffer}
   * @param [options.lte] {string|Buffer}
   * @param [options.limit=-1] {number}
   * @param [options.reverse=false] {boolean}
   * @param [options.keys=true] {boolean}
   * @param [options.values=true] {boolean}
   * @return {Promise<[object]>}
   */
  async list(options = {}) {
    const levelDown = await this.levelDown;

    const iter = levelDown.iterator({ ...this.iterOptions, ...options });
    iter.end = promisify(iter.end);
    iter.next = promisifyResults(iter.next);

    const array = [];
    for (let pair = await iter.next(); pair.length; pair = await iter.next()) {
      const [key, value] = pair;
      array.push({ key, value });
    }
    await iter.end();
    return array;
  }

  /**
   * @param options {object}
   * @param [options.gt] {string|Buffer}
   * @param [options.gte] {string|Buffer}
   * @param [options.lt] {string|Buffer}
   * @param [options.lte] {string|Buffer}
   * @param [options.limit=-1] {number}
   * @param [options.reverse=false] {boolean}
   * @return {Promise<[string|Buffer]>}
   */
  async keys(options = {}) {
    const array = await this.list({ ...options, values: false });
    return array.map(each => each.key);
  }

  /**
   * @param options {object}
   * @param [options.gt] {string|Buffer}
   * @param [options.gte] {string|Buffer}
   * @param [options.lt] {string|Buffer}
   * @param [options.lte] {string|Buffer}
   * @param [options.limit=-1] {number}
   * @param [options.reverse=false] {boolean}
   * @return {Promise<[string|Buffer]>}
   */
  async values(options = {}) {
    const array = await this.list({ ...options, keys: false });
    return array.map(each => each.value);
  }

  // --------------------------------------------------------------------------
  /**
   * @return {Promise<undefined>}
   */
  async close() {
    const levelDown = await this.levelDown;
    return levelDown.close();
  }
}

module.exports = LevelDB;
