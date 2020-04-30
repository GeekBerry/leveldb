const { Server: BufferServer } = require('@geekberry/buffer-socket');
const LevelInterface = require('./LevelInterface');
const { CODE, toBuffer } = require('./util');

class Server {
  /**
   * @param options {object}
   * @param options.database {object}
   * @param options.readOnly {boolean}
   * @param options.host {string}
   * @param options.port {number}
   */
  constructor({ database, readOnly, ...options }) {
    if (!(database instanceof LevelInterface)) {
      throw new Error('database must be instance of LevelInterface');
    }

    this.database = database;
    this.readOnly = readOnly;
    this.bufferServer = new BufferServer(options, this.middleware.bind(this));

    this.CODE_TO_METHOD = {
      [CODE.PUT]: this.onPut.bind(this),
      [CODE.DEL]: this.onDel.bind(this),
      [CODE.BATCH]: this.onBatch.bind(this),
      [CODE.CLEAR]: this.onClear.bind(this),
      [CODE.GET]: this.onGet.bind(this),
      [CODE.LIST]: this.onList.bind(this),
      [CODE.KEYS]: this.onKeys.bind(this),
      [CODE.VALUES]: this.onValues.bind(this),
    };
  }

  _readFilter(stream) {
    return {
      reverse: stream.readBool(),
      limit: stream.readInt(),
      gt: stream.readBuffer(),
      gte: stream.readBuffer(),
      lte: stream.readBuffer(),
      lt: stream.readBuffer(),
    };
  }

  checkReadOnly() {
    if (this.readOnly) {
      throw new Error('client is readOnly');
    }
  }

  // ==========================================================================
  async middleware(input, output) {
    const code = input.readInt();

    const method = this.CODE_TO_METHOD[code];
    if (!method) {
      throw new Error(`can not get method by code "${code}"`);
    }

    await method(input, output);
  }

  // --------------------------------------------------------------------------
  async onPut(input) {
    this.checkReadOnly();

    const key = input.readBuffer();
    const value = input.readBuffer();

    await this.database.put(key, value);
  }

  async onDel(input) {
    this.checkReadOnly();

    const key = input.readBuffer();

    await this.database.del(key);
  }

  async onBatch(input) {
    this.checkReadOnly();

    const array = [];

    const length = input.readInt();
    for (let i = 0; i < length; i += 1) {
      const code = input.readInt();
      switch (code) {
        case CODE.PUT:
          array.push({ type: 'put', key: input.readBuffer(), value: input.readBuffer() });
          break;

        case CODE.DEL:
          array.push({ type: 'del', key: input.readBuffer() });
          break;

        default:
          throw new Error(`unexpected code="${code}"`);
      }
    }

    await this.database.batch(array);
  }

  async onClear(input) {
    this.checkReadOnly();

    const filter = this._readFilter(input);
    await this.database.clear(filter);
  }

  // --------------------------------------------------------------------------
  async onGet(input, output) {
    const key = input.readBuffer();

    const value = await this.database.get(key);
    if (value !== undefined) {
      output.writeBuffer(toBuffer(value));
    }
  }

  async onList(input, output) {
    const filter = this._readFilter(input);
    const array = await this.database.list(filter);

    output.writeInt(array.length);
    array.forEach(({ key, value }) => {
      output.writeBuffer(toBuffer(key));
      output.writeBuffer(toBuffer(value));
    });
  }

  async onKeys(input, output) {
    const filter = this._readFilter(input);
    const keys = await this.database.keys(filter);

    output.writeInt(keys.length);
    keys.forEach(key => {
      output.writeBuffer(toBuffer(key));
    });
  }

  async onValues(input, output) {
    const filter = this._readFilter(input);
    const values = await this.database.values(filter);

    output.writeInt(values.length);
    values.forEach(value => {
      output.writeBuffer(toBuffer(value));
    });
  }

  // --------------------------------------------------------------------------
  async close() {
    await this.bufferServer.close();
  }
}

module.exports = Server;
