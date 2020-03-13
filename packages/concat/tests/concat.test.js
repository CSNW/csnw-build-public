const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const concat = require('../')({
  'bundle.js': ['a.js', 'b.js', 'c.js']
});
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await concat.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.js', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
