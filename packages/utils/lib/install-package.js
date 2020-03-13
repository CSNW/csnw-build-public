// Inspired by Parcel
// https://github.com/parcel-bundler/parcel/blob/32c38e599161372cd47924f0f4cf2aae32eb5b83/src/utils/installPackage.js

const { dirname, basename, parse } = require('path');
const { promisify } = require('util');
const spawn = require('cross-spawn');
const resolve = promisify(require('resolve'));
const findUp = require('./find-up');
const toArray = require('./to-array');

let installing = Promise.resolve();

module.exports = async function installPackage(
  dir,
  modules,
  install_peers = true
) {
  modules = toArray(modules);
  const location = await findUp(dir, ['yarn.lock', 'package.json']);
  const cwd = location ? dirname(location) : dir;
  const yarn = location && basename(location) === 'yarn.lock';

  await Promise.all(
    modules.map(async module => {
      await install(module, { cwd, yarn });

      if (install_peers) {
        // TODO installPeerDependencies
      }
    })
  );
};

async function install(module, options = {}) {
  const { cwd = process.cwd(), yarn = false } = options;
  options = { cwd };

  // Only install one module at a time
  await (installing = installing.then(
    () =>
      new Promise((resolve, reject) => {
        console.log(
          `Installing ${module} in ${options.cwd} with ${yarn ? 'yarn' : 'npm'}`
        );

        let install;
        if (yarn) {
          install = spawn('yarn', ['add', module, '--dev'], options);
        } else {
          install = spawn('npm', ['install', module, '--save-dev'], options);
        }

        install.stdout.pipe(process.stdout);
        install.stderr.pipe(process.stderr);

        install.on('close', code => {
          if (code !== 0) {
            return reject(new Error(`Failed to install ${module}.`));
          }

          console.log(`\nDone installing ${module}.`);
          resolve();
        });
      })
  ));
}

async function installPeerDependencies() {
  // TODO
}
