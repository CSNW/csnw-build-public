const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const rollup = require('../')([
  {
    input: 'entry.js',
    output: [{ file: 'bundle.es.js', format: 'es' }]
  },
  {
    input: 'vendor.js',
    output: { name: 'vendor', file: 'vendor.js', format: 'iife' }
  }
]);
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await rollup.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
