const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const filter = require('../')('!b.js');
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await filter.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.{js,html}', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
