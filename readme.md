# LevelDB

LevelDB with promise. 

```javascript
const LevelDB = require('@geekberry/leveldb');

async function main() {
  const database = new LevelDB({
    location: './DATA',
    asBuffer: false,
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

  await database.list(); // {gte:'key1', lte:'key5',limit:5,reverse:true}
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
```
