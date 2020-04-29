function toBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value === undefined || value === null) {
    return Buffer.alloc(0);
  }

  return Buffer.from(value);
}

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

module.exports = {
  CODE: {
    // in order to check operate correct, hash code by string.
    PUT: Buffer.from('PUT ').readInt32LE(), // 542397776
    DEL: Buffer.from('DELE').readInt32LE(), // 1162626372
    BATCH: Buffer.from('BATC').readInt32LE(), // 1129595202
    CLEAR: Buffer.from('CLEA').readInt32LE(), // 1095060547

    GET: Buffer.from('GET ').readInt32LE(), // 542393671
    LIST: Buffer.from('LIST').readInt32LE(), // 1414744396
    KEYS: Buffer.from('KEYS').readInt32LE(), // 1398359371
    VALUES: Buffer.from('VALU').readInt32LE(), // 1431060822
  },

  toBuffer,
  promisifyResults,
};
