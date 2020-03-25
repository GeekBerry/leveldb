const DataBase = require('../');

const database = new DataBase({
  location: './DATA',
  asBuffer: false,
});

// ----------------------------------------------------------------------------
beforeAll(async () => {
  await database.clear();
});

test('set get del', async () => {
  expect(await database.get('key')).toEqual(undefined);

  expect(await database.set('key', 'value')).toEqual(undefined);

  expect(await database.get('key')).toEqual('value');

  expect(await database.del('key')).toEqual(undefined);

  expect(await database.get('key')).toEqual(undefined);
});

test('batch list', async () => {
  let ret;

  ret = await database.batch([
    { type: 'put', key: Buffer.from('key1'), value: Buffer.from('value1') },
    { type: 'put', key: 'key2', value: 'value2' },
    { type: 'put', key: 'key3', value: 'value3' },
    { type: 'del', key: Buffer.from('key2') },
    { type: 'put', key: 'key4', value: 'value4' },
    { type: 'put', key: 'key5', value: 'value5' },
  ]);
  expect(ret).toEqual(undefined);

  ret = await database.list();
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key3', value: 'value3' },
    { key: 'key4', value: 'value4' },
    { key: 'key5', value: 'value5' },
  ]);

  ret = await database.list({ reverse: true });
  expect(ret).toEqual([
    { key: 'key5', value: 'value5' },
    { key: 'key4', value: 'value4' },
    { key: 'key3', value: 'value3' },
    { key: 'key1', value: 'value1' },
  ]);

  ret = await database.list({ limit: 2 });
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key3', value: 'value3' },
  ]);

  ret = await database.list({ gte: 'key1', lte: 'key4' });
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key3', value: 'value3' },
    { key: 'key4', value: 'value4' },
  ]);

  ret = await database.list({ gt: 'key1', lt: 'key4' });
  expect(ret).toEqual([
    { key: 'key3', value: 'value3' },
  ]);

  ret = await database.clear({ gt: 'key1', lt: 'key4' });
  expect(ret).toEqual(undefined);

  ret = await database.list();
  expect(ret).toEqual([
    { key: 'key1', value: 'value1' },
    { key: 'key4', value: 'value4' },
    { key: 'key5', value: 'value5' },
  ]);

  expect(await database.keys()).toEqual(['key1', 'key4', 'key5']);
  expect(await database.values()).toEqual(['value1', 'value4', 'value5']);
});

afterAll(async () => {
  // await database.destroy();
});
