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
    Fetch most recent aria-at tests to update database. By default, the latest commit on the default branch.
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
  const commits = args.commit
    ? args.commit
        .trim()
        .split(' ')
        .filter(el => !!el)
    : [];

  if (commits.length) {
    for (const commit of commits) {
      await buildTestsAndCreateTestPlanVersions(commit, { transaction });
    }
  } else await buildTestsAndCreateTestPlanVersions(null, { transaction });
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
