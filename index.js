const LevelDown = require('./src/LevelDown');
const LevelUp = require('./src/LevelUp');

/**
 * @param options
 * @param options.location {string} - The dir of database
 * @param [options.LevelUp] - Create LevelDB from level-down class, such as `level`, `level-party`
 * @param [options.LevelDown=require('leveldown')] - Create LevelDB from level-down class, such as `leveldown`, `rocksdb`
 * @return {LevelDB}
 */
function LevelDB(options) {
  if (options.LevelUp) {
    return new LevelUp(options);
  } else {
    return new LevelDown(options);
  }
}

module.exports = LevelDB;
module.exports.Interface = require('./src/LevelInterface');
module.exports.Server = require('./src/Server');
module.exports.Client = require('./src/Client');
