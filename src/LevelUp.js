const { promisify } = require('util');
const LevelDBLevelDown = require('leveldown');
const LevelInterface = require('./LevelInterface');
const { promisifyResults } = require('./util');

class LevelUP extends LevelInterface {
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
    LevelDown,
    location,
    asBuffer = false,
    cacheGet = true,
    cacheIter = false,
    syncPut = false,
    syncDel = false,
    syncBatch = false,
    ...rest
  } = {}) {
    super();

    const levelDown = LevelDown === undefined ? new LevelDBLevelDown(location) : new LevelDown(location);
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

  async put(key, value) {
    const levelDown = await this.levelDown;
    return levelDown.put(key, value, this.putOptions);
  }

  async del(key) {
    const levelDown = await this.levelDown;
    return levelDown.del(key, this.delOptions);
  }

  async batch(array) {
    const levelDown = await this.levelDown;

    return levelDown.batch(array, this.batchOptions);
  }

  async clear(options) {
    const levelDown = await this.levelDown;
    return levelDown.clear(options);
  }

  // --------------------------------------------------------------------------
  async get(key) {
    const levelDown = await this.levelDown;
    try {
      return await levelDown.get(key, this.getOptions);
    } catch (e) {
      if (e.message.startsWith('NotFound:')) {
        return undefined;
      }
      throw e;
    }
  }

  async list(filter = {}) {
    const levelDown = await this.levelDown;

    const iter = levelDown.iterator({ ...this.iterOptions, ...filter });
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

  async keys(filter = {}) {
    const array = await this.list({ ...filter, values: false });
    return array.map(each => each.key);
  }

  async values(filter = {}) {
    const array = await this.list({ ...filter, keys: false });
    return array.map(each => each.value);
  }

  // --------------------------------------------------------------------------
  async close() {
    const levelDown = await this.levelDown;
    return levelDown.close();
  }
}

module.exports = LevelUP;
