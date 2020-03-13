const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const typescript = require('../')();
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await typescript.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.{ts,tsx}', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
