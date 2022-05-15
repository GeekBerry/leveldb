# LevelDB

LevelDB with promise. 

* usage

```javascript
const LevelDB = require('@geekberry/leveldb');

async function main() {
  const database = new LevelDB({
    location: './LevelDB',
  });

  await database.put('key', 'value');
  await database.get('key'); // 'value'
  await database.del('key');

  await database.batch([
    { type: 'put', key: 'key1', value: 'value1' },
    { type: 'put', key: 'key2', value: 'value2' },
    { type: 'put', key: 'key3', value: 'value3' },
    { type: 'del', key: 'key2' },
    { type: 'put', key: 'key4', value: 'value4' },
    { type: 'put', key: 'key5', value: 'value5' },
  ]);

  await database.list(); // {gte:'key1',lte:'key5',limit:5,reverse:true}
  // [
  //   { key: 'key1', value: 'value1' },
  //   { key: 'key3', value: 'value3' },
  //   { key: 'key4', value: 'value4' },
  //   { key: 'key5', value: 'value5' },
  // ]

  await database.keys();
  // ['key1', 'key3', 'key4', 'key5']

  await database.values();
  // ['value1', 'value3', 'value4', 'value5']

  await database.clear();
}

main();
```

* using RocksDB as leveldown

```javascript
const LevelDB = require('@geekberry/leveldb');
const RocksDBLevelDown = require('rocksdb');

async function main() {
  const database = new LevelDB({
    levelDown: RocksDBLevelDown,
    location: './RocksDB',
  });

  await database.put('key', 'value');
  await database.get('key'); // 'value'
  await database.del('key');
}

main();
```

* using memory as leveldown

```javascript
const LevelDB = require('@geekberry/leveldb');
const MemoryLevelDown = require('memdown');

async function main() {
  const database = new LevelDB({
    levelDown: MemoryLevelDown,
  });

  await database.put('key', 'value');
  await database.get('key'); // 'value'
  await database.del('key');
}

main();
```
