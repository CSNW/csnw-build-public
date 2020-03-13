const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

process.env.CSNW_BUILD_TEST_A = 'aaa';
process.env.CSNW_BUILD_TEST_B = 'bb';
process.env.CSNW_BUILD_TEST_C = 'c';

const env = require('../')();
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await env.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.{js,html}', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
