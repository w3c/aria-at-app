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

/**
 * @typedef Reference
 * @property {string} refId
 * @property {string} value
 * @property {string} type - Available in v2
 * @property {string} linkText - Available in v2
 */

/**
 * @typedef AtSetting
 * @property {string} screenText
 * @property {string[]} instructions
 */

/**
 * @typedef AssertionToken
 * @property {string} readingMode
 * @property {string} screenReader
 * @property {string} interactionMode
 */

/**
 * @typedef SetupScript
 * @property {string} name
 * @property {string} script
 * @property {string} source
 * @property {string} jsonpPath
 * @property {string} modulePath
 * @property {string} scriptDescription
 */

/**
 * @typedef Keypress
 * @property {string} id
 * @property {string} keystroke
 */

/**
 * @typedef AssertionException
 * @property {number} priority
 * @property {string} assertionId
 */

/**
 * @typedef Command
 * @property {string} id
 * @property {string} keystroke
 * @property {Keypress[]} keypresses
 * @property {string} settings - Available in v2
 * @property {number} presentationNumber - Available in v2
 * @property {AssertionException[]} assertionExceptions - Available in v2
 */

/**
 * @typedef Assertion
 * @property {number} priority
 * @property {string} expectation - Available in v1
 * @property {string} refIds - Available in v2
 * @property {string} assertionId - Available in v2
 * @property {string} assertionPhrase - Available in v2
 * @property {string} assertionStatement - Available in v2
 */

/**
 * @typedef Instructions
 * @property {string|Object<key, string[]>} instructions.mode - {string} in v1, {Object<key, string[]>} in v2
 * @property {string} instructions.raw - Available in v1
 * @property {string[]} instructions.user - Available in v2
 * @property {string} instructions.instructions - Available in v2 (should be same as {instructions.raw} in v1)
 */

/**
 * @typedef RenderableContent
 *
 * @property {Object} info
 * @property {string} info.task - Available in v1
 * @property {string} info.title
 * @property {number|string} info.testId - {number} in v1, {string} in v2
 * @property {Reference[]} info.references
 * @property {number} info.presentationNumber - Available in v2
 *
 * @property {Object} target
 * @property {Object} target.at
 * @property {string} target.at.key
 * @property {string} target.name
 * @property {string|Object} target.at.raw - {string} in v1, {Object} in v2
 * @property {string} target.settings - Available in v2
 * @property {string} target.at.raw.key - Available in v2
 * @property {string} target.at.raw.name - Available in v2
 * @property {Object<key, AtSetting>} target.at.raw.settings - Available in v2
 * @property {AssertionToken} target.at.raw.assertionTokens - Available in v2
 * @property {string} target.at.raw.defaultConfigurationInstructionsHTML - Available in v2
 * @property {SetupScript} target.setupScript
 * @property {string} target.referencePage
 *
 * @property {Command[]} commands
 *
 * @property {Assertion[]} assertions
 *
 * @property {Instructions} instructions
 */
