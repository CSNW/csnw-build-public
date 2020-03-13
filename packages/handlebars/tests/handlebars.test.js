const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const handlebars = require('../')({
  partials: './src/partials'
});
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await handlebars.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('**/*', { cwd, baseDir: join(cwd, 'src') });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
