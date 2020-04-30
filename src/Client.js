const { Client: BufferClient, Stream } = require('@geekberry/buffer-socket');
const LevelInterface = require('./LevelInterface');
const { CODE, toBuffer } = require('./util');

class Client extends LevelInterface {
  /**
   * @param options {object}
   * @param [options.asBuffer=false] {boolean}
   * @param [options.readOnly=false] {boolean}
   * @param options.host {string}
   * @param options.port {number}
   */
  constructor({ asBuffer = false, readOnly = false, ...options }) {
    super();

    this.asBuffer = asBuffer;
    this.readOnly = readOnly;
    this.bufferClient = new BufferClient(options);
  }

  _writeFilter(code, { reverse = false, limit = -1, gt, gte, lte, lt } = {}) {
    const stream = new Stream();

    stream.writeInt(code);
    stream.writeBool(reverse);
    stream.writeInt(limit);
    stream.writeBuffer(toBuffer(gt));
    stream.writeBuffer(toBuffer(gte));
    stream.writeBuffer(toBuffer(lte));
    stream.writeBuffer(toBuffer(lt));

    return stream;
  }

  checkReadOnly() {
    if (this.readOnly) {
      throw new Error('client is readOnly');
    }
  }

  // --------------------------------------------------------------------------
  async put(key, value) {
    this.checkReadOnly();

    const input = new Stream();
    input.writeInt(CODE.PUT);
    input.writeBuffer(toBuffer(key));
    input.writeBuffer(toBuffer(value));

    await this.bufferClient.request(input);
  }

  async del(key) {
    this.checkReadOnly();

    const input = new Stream();
    input.writeInt(CODE.DEL);
    input.writeBuffer(toBuffer(key));

    await this.bufferClient.request(input);
  }

  async batch(array) {
    this.checkReadOnly();

    const input = new Stream();
    input.writeInt(CODE.BATCH);
    input.writeInt(array.length);

    array.forEach(({ type, key, value }) => {
      switch (type) {
        case 'put':
          input.writeInt(CODE.PUT);
          input.writeBuffer(toBuffer(key));
          input.writeBuffer(toBuffer(value));
          break;

        case 'del':
          input.writeInt(CODE.DEL);
          input.writeBuffer(toBuffer(key));
          break;

        default:
          throw new Error(`unexpected type="${type}"`);
      }
    });

    await this.bufferClient.request(input);
  }

  async clear(filter) {
    this.checkReadOnly();

    const input = this._writeFilter(CODE.CLEAR, filter);
    await this.bufferClient.request(input);
  }

  // --------------------------------------------------------------------------
  async get(key) {
    const input = new Stream();
    input.writeInt(CODE.GET);
    input.writeBuffer(toBuffer(key));

    const output = await this.bufferClient.request(input);

    let value = output.length ? output.readBuffer() : undefined;
    if (!this.asBuffer) {
      value = (value === undefined) ? undefined : value.toString();
    }

    return value;
  }

  async list(filter = {}) {
    const input = this._writeFilter(CODE.LIST, filter);

    const output = await this.bufferClient.request(input);

    const length = output.readInt();
    const array = [];
    for (let i = 0; i < length; i += 1) {
      let key = output.readBuffer();
      let value = output.readBuffer();
      if (!this.asBuffer) {
        key = key.toString();
        value = value.toString();
      }

      array.push({ key, value });
    }
    return array;
  }

  async keys(filter = {}) {
    const input = this._writeFilter(CODE.KEYS, filter);

    const output = await this.bufferClient.request(input);

    const length = output.readInt();
    const array = [];
    for (let i = 0; i < length; i += 1) {
      let key = output.readBuffer();
      if (!this.asBuffer) {
        key = key.toString();
      }

      array.push(key);
    }
    return array;
  }

  async values(filter = {}) {
    const input = this._writeFilter(CODE.VALUES, filter);

    const output = await this.bufferClient.request(input);

    const length = output.readInt();
    const array = [];
    for (let i = 0; i < length; i += 1) {
      let value = output.readBuffer();
      if (!this.asBuffer) {
        value = value.toString();
      }

      array.push(value);
    }
    return array;
  }

  // --------------------------------------------------------------------------
  async close() {
    await this.bufferClient.close();
  }
}

module.exports = Client;
