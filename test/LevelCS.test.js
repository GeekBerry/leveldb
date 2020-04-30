const LevelDB = require('../index');

const database = new LevelDB({ location: './DATA/LEVEL_CS', asBuffer: false });
const server = new LevelDB.Server({ host: '127.0.0.1', port: 6081, database });
const client = new LevelDB.Client({ host: '127.0.0.1', port: 6081, asBuffer: false });

// ----------------------------------------------------------------------------
beforeAll(async () => {
  await server.database.clear();
});

test('put get del', async () => {
  expect(await client.get('key')).toEqual(undefined);

  expect(await client.put('key', 'value')).toEqual(undefined);

  expect(await client.get('key')).toEqual('value');

  expect(await client.del('key')).toEqual(undefined);

  expect(await client.get('key')).toEqual(undefined);
});

test('batch list', async () => {
  let ret;

  ret = await client.batch([
    { type: 'put', key: Buffer.from('key1'), value: Buffer.from('value1') },
    { type: 'put', key: 'key2', value: 'value2' },
    { type: 'put', key: 'key3', value: 'value3' },
    { type: 'del', key: Buffer.from('key2') },
    { type: 'put', key: 'key4', value: 'value4' },
    { type: 'put', key: 'key5', value: 'value5' },
  ]);
  expect(ret).toEqual(undefined);

  ret = await client.list();
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key3', value: 'value3' },
    { key: 'key4', value: 'value4' },
    { key: 'key5', value: 'value5' },
  ]);

  ret = await client.list({ reverse: true });
  expect(ret).toEqual([
    { key: 'key5', value: 'value5' },
    { key: 'key4', value: 'value4' },
    { key: 'key3', value: 'value3' },
    { key: 'key1', value: 'value1' },
  ]);

  ret = await client.list({ limit: 2 });
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key3', value: 'value3' },
  ]);

  ret = await client.list({ gte: 'key1', lte: 'key4' });
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key3', value: 'value3' },
    { key: 'key4', value: 'value4' },
  ]);

  ret = await client.list({ gt: 'key1', lt: 'key4' });
  expect(ret).toEqual([
    { key: 'key3', value: 'value3' },
  ]);

  ret = await client.clear({ gt: 'key1', lt: 'key4' });
  expect(ret).toEqual(undefined);

  ret = await client.list();
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key4', value: 'value4' },
    { key: 'key5', value: 'value5' },
  ]);

  expect(await client.keys()).toEqual(['key1', 'key4', 'key5']);
  expect(await client.values()).toEqual(['value1', 'value4', 'value5']);
});

afterAll(async () => {
  await database.close();
  await server.close();
  await client.close();
});
