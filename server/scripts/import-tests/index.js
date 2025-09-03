/* eslint no-console: 0 */

const fse = require('fs-extra');
const { sequelize } = require('../../models');
const { cloneRepo } = require('./gitOperations');

const {
  buildTestsAndCreateTestPlanVersions
} = require('./testPlanVersionOperations');
const { gitCloneDirectory } = require('./settings');

const args = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    c: 'commit'
  }
});

if (args.help) {
  console.log(`
Default use:
  No arguments:
    Import aria-at tests pinned by ARIA_AT_PINNED_SHA or config/aria-at.version
  Arguments:
    -h, --help
       Show this message.
    -c, --commit
       Import tests at the specified git commit

`);
  process.exit();
}

/**
 * Imports test plan versions from the specified git commit or the default branch.
 * @param {import('sequelize').Transaction} transaction - A Sequelize transaction object.
 */
const importTestPlanVersions = async transaction => {
  await cloneRepo(gitCloneDirectory);

  // Get list of commits when multiple passed in as
  // `<import_cmd> -c "commit1 commit2 commitN ..."`
  let commits = [];
  if (args.commit) {
    commits = args.commit
      .trim()
      .split(' ')
      .filter(el => !!el);
  } else {
    // Default to pinned commit if provided, otherwise fail fast
    const fseLocal = require('fs-extra');
    const path = require('path');
    const pinnedFromEnv =
      process.env.ARIA_AT_PINNED_SHA &&
      String(process.env.ARIA_AT_PINNED_SHA).trim();
    let pinnedFromFile = null;
    const versionPath = path.resolve(
      process.cwd(),
      'config',
      'aria-at.version'
    );
    if (fseLocal.existsSync(versionPath)) {
      pinnedFromFile = String(fseLocal.readFileSync(versionPath)).trim();
    }

    const pinned = pinnedFromEnv || pinnedFromFile;
    if (!pinned) {
      console.error(
        'No commit specified and no pinned SHA found. Provide -c <sha>, set ARIA_AT_PINNED_SHA, or add config/aria-at.version.'
      );
      process.exit(1);
    }
    commits = [pinned];
  }

  if (commits.length) {
    for (const [cIndex, commit] of commits.entries()) {
      await buildTestsAndCreateTestPlanVersions(commit, {
        // ignore the cleanup if on last commit in series; folder will be removed
        waitForCleanup: cIndex !== commits.length - 1,
        transaction
      });
    }
  } else
    await buildTestsAndCreateTestPlanVersions(null, {
      waitForCleanup: false,
      transaction
    });
};

sequelize
  .transaction(importTestPlanVersions)
  .then(
    () => console.log('Done, no errors'),
    err => {
      console.error(`Error found: ${err.stack}`);
      process.exitCode = 1;
    }
  )
  .finally(() => {
    // Delete temporary files
    fse.removeSync(gitCloneDirectory);
    process.exit();
  });
