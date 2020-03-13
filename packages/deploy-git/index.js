const debug = require('debug')('csnw-build:deploy-git');
const assert = require('assert');
const { exists, copy } = require('fs-extra');
const git = require('simple-git/promise');

module.exports = (options = {}) => ({
  name: 'Deploy to Git',
  run: async function deployGit(config, args = {}, task) {
    const { cache = '.publish' } = options;
    const {
      origin = options.origin || 'origin',
      remote = options.remote || 'origin',
      branch = options.branch || 'gh-pages',
      message = `Deploy (${new Date().toISOString()})`,
      tag,
      cwd = process.cwd()
    } = args;
    const dry_run = !!args['dry-run'];
    const dry_run_message = dry_run ? ' (dry run)' : '';
    const dest = config.dest;

    console.log('\nDeploying project - 6 steps');

    if (!await exists(cache)) {
      // 1a. Clone origin into cache
      const remotes = await git(cwd).getRemotes(true);
      const url = getRemoteUrl(remotes, origin);

      console.log(`1. Cloning "${url}" into "${cache}"`);
      await git(cwd).clone(url, cache);
    } else {
      // 1b. Remove any changes in cache
      console.log(`1. Removing changes in "${cache}"`);
      await git(cache).reset('hard');
      await git(cache).clean('f', ['-d']);
    }

    // 2. Checkout deployment branch (and pull changes if needed)
    const branches = await git(cache).branch();
    if (
      !branches.all.includes(branch) &&
      !branches.all.includes(`remotes/${origin}/${branch}`)
    ) {
      // TODO Create bare branch
      throw new Error(
        `Branch "${branch}" not found in local or remote branches`
      );
    }

    console.log(`2. Checking out "${branch}" and pulling changes`);
    await git(cache).checkout(branch);
    await git(cache).pull(origin, branch);

    // 3. Clean out publish directory
    console.log(`3. Cleaning "${cache}"`);
    try {
      await git(cache)
        .silent()
        .raw(['rm', '.', '-f', '-r']);
    } catch (err) {
      if (err.message.indexOf(`pathspec '.' did not match any files`) >= 0) {
        // Ignore, result of an empty directory
      } else {
        throw err;
      }
    }

    // 4. Copy build directory and add all files
    console.log(`4. Copying ${dest} to ${cache}`);
    await copy(dest, cache);
    await git(cache).add('.');

    // 5. Commit and tag
    console.log(`5. Create commit "${message}"${dry_run_message}`);
    if (!dry_run) {
      await git(cache).commit(message);
    }
    if (tag) {
      console.log(`5b. Create tag "${tag}"${dry_run_message}`);

      if (!dry_run) {
        await git(cache).addTag(tag);
      }
    }

    // 6. Push commit to origin and remote
    console.log(`6. Pushing to "${origin}/${branch}"${dry_run_message}`);
    if (!dry_run) {
      await git(cache).push(origin, branch);
      if (tag) {
        await git(cache).pushTags(origin);
      }
    }

    console.log(
      `6b. Pulling from "${origin}/${branch}" to "${cwd}"${dry_run_message}`
    );
    if (!dry_run) {
      await git(cwd).fetch(origin, `${branch}:${branch}`);
    }

    if (remote !== origin) {
      console.log(
        `6c. Pushing to "${remote}/${branch}" from "${cwd}"${dry_run_message}`
      );
      if (!dry_run) {
        await git(cwd).push(remote, `${branch}:${branch}`);
        if (tag) {
          await git(cwd).pushTags(remote);
        }
      }
    }
  }
});

function getRemoteUrl(remotes, origin) {
  const remote = remotes.find(remote => remote.name === origin);
  if (!remote) {
    throw new Error(`origin "${origin}" not found in remotes`);
  }

  return remote.refs.fetch;
}
