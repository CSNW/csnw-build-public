const { join, resolve } = require('path');
const { readdir } = require('fs-extra');

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const pkg = require('../package.json');
  const dependencies = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.optionalDependencies || {})
  ];

  const packages = await readdir(resolve(__dirname, '../packages'));
  const presets = await readdir(resolve(__dirname, '../presets'));

  const search = [
    ...packages.map(name => ({
      name: `packages/${name}`,
      path: `../packages/${name}/package.json`
    })),
    ...presets.map(name => ({
      name: `presets/${name}`,
      path: `../presets/${name}/package.json`
    }))
  ];
  const missing = new Set();
  const required = new Set(['fs-extra', 'semver', 'lerna']);

  for (const info of search) {
    const pkg = require(info.path);
    for (const dependency of Object.keys(pkg.dependencies)) {
      if (dependency.startsWith('@csnw-build')) continue;

      required.add(dependency);

      if (!dependencies.includes(dependency)) {
        missing.add({
          name: info.name,
          dependency,
          version: pkg.dependencies[dependency]
        });
      }
    }
  }

  const extra = new Set();
  for (const dependency of dependencies) {
    if (!required.has(dependency)) {
      extra.add({
        dependency
      });
    }
  }

  if (missing.size) {
    const hoist = [];
    for (const info of missing) {
      hoist.push(
        `- "${info.dependency}": "${info.version}" (from ${info.name})`
      );
    }

    const message = `Missing hoisted dependencies

The following dependencies need to be hoisted to the root package.json:

${hoist.join('\n')}`;

    throw new Error(message);
  } else if (extra.size) {
    const remove = [];
    for (const info of extra) {
      remove.push(`- ${info.dependency}`);
    }

    const message = `WARNING Extra hoisted dependencies
    
The following dependencies were not found in any packages/presets
and can most likely be removed from the root package.json:

${remove.join('\n')}`;

    console.log(message);
  } else {
    console.log('All dependencies hoisted.');
  }
}
