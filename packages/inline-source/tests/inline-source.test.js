const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

process.env.PUBLIC_URL = '/blog/';

const inlineSource = require('../')({});
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await inlineSource.pipeline({
    cwd,
    cache: false
  });
  const files = await Files.from('**/*', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
