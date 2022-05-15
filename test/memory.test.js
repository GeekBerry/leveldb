const levelDB = require('../index');
const LevelDown = require('memdown');

const database = new levelDB({
  LevelDown,
  asBuffer: true,
});

beforeAll(async () => {
  await database.clear();
});

test('put get del', async () => {
  expect(await database.get('key')).toEqual(undefined);

  expect(await database.put('key', 'value')).toEqual(undefined);

  expect(await database.get('key')).toEqual(Buffer.from('value'));

  expect(await database.del(Buffer.from('key'))).toEqual(undefined);

  expect(await database.get('key')).toEqual(undefined);
});

afterAll(async () => {
  await database.close();
});
