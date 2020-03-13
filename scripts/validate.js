const { resolve } = require('path');
const { readdir, exists } = require('fs-extra');
const { intersects } = require('semver');

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  // Ensure installed peer dependencies match those specified in packages
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

  const peers = new Map();
  for (const info of search) {
    const pkg = require(info.path);
    for (const [peer, range] of Object.entries(pkg._peerDependencies || {})) {
      peers.set(peer, range);
    }
  }

  let pkg_path = resolve(__dirname, '../../../package.json');

  if (!await exists(pkg_path)) {
    pkg_path = resolve(__dirname, '../package.json');
  }
  if (!await exists(pkg_path)) {
    console.log(
      '(could not find parent package.json to validate peer dependencies)'
    );
    return;
  }

  const pkg = require(pkg_path);

  for (const [name, range] of Object.entries(pkg.devDependencies)) {
    if (peers.has(name) && !intersects(range, peers.get(name))) {
      console.log(
        `WARNING "${name}" does not meet requirements of csnw-build, "${peers.get(
          name
        )}"`
      );
    }
  }
}
