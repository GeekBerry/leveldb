/* eslint-disable no-unused-vars */

class LevelInterface {
  /**
   * @param key {string|Buffer}
   * @param value {string|Buffer}
   * @return {Promise<undefined>}
   */
  async put(key, value) {
    throw new Error(`NotImplementError: ${this.constructor.name}.put not implement`);
  }

  /**
   * @param key {string|Buffer}
   * @return {Promise<undefined>}
   */
  async del(key) {
    throw new Error(`NotImplementError: ${this.constructor.name}.del not implement`);
  }

  /**
   * @param array {[object]} - Operate array
   * @return {Promise<undefined>}
   */
  async batch(array) {
    throw new Error(`NotImplementError: ${this.constructor.name}.batch not implement`);
  }

  /**
   * @param options {object} - Filter
   * @return {Promise<undefined>}
   */
  async clear(options) {
    throw new Error(`NotImplementError: ${this.constructor.name}.clear not implement`);
  }

  // --------------------------------------------------------------------------
  /**
   * @param key {string|Buffer}
   * @return {Promise<string|Buffer>}
   */
  async get(key) {
    throw new Error(`NotImplementError: ${this.constructor.name}.get not implement`);
  }

  /**
   * @see https://github.com/Level/leveldown#dbiteratoroptions
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
    throw new Error(`NotImplementError: ${this.constructor.name}.list not implement`);
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
    throw new Error(`NotImplementError: ${this.constructor.name}.keys not implement`);
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
    throw new Error(`NotImplementError: ${this.constructor.name}.values not implement`);
  }

  // --------------------------------------------------------------------------
  async close() {
    throw new Error(`NotImplementError: ${this.constructor.name}.close not implement`);
  }
}

module.exports = LevelInterface;
