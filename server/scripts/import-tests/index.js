/* eslint no-console: 0 */

const path = require('path');
const fse = require('fs-extra');
const { pathToFileURL } = require('url');
const spawn = require('cross-spawn');
const { At, sequelize } = require('../../models');
const {
  createTestPlanVersion,
  getTestPlanVersions,
  updateTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const {
  getTestPlans,
  createTestPlan
} = require('../../models/services/TestPlanService');
const { hashTests } = require('../../util/aria');
const convertDateToString = require('../../util/convertDateToString');
const {
  cloneRepo,
  readCommit,
  readDirectoryGitInfo
} = require('./gitOperations');
const { parseTests } = require('./testParser');
const {
  gitCloneDirectory,
  builtTestsDirectory,
  testsDirectory
} = require('./settings');
const { getAppUrl } = require('./utils');

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

const buildTestsAndCreateTestPlanVersions = async (commit, { transaction }) => {
  const { gitCommitDate } = await readCommit(gitCloneDirectory, commit);

  console.log('Running `npm install` ...\n');
  const installOutput = spawn.sync('npm', ['install'], {
    cwd: gitCloneDirectory
  });

  if (installOutput.error) {
    console.info(`'npm install' failed with error ${installOutput.error}`);
    process.exit(1);
  }
  console.log('`npm install` output', installOutput.stdout.toString());

  console.log('Running `npm run build` ...\n');
  const buildOutput = spawn.sync('npm', ['run', 'build'], {
    cwd: gitCloneDirectory
  });

  if (buildOutput.error) {
    console.info(`'npm run build' failed with error ${buildOutput.error}`);
    process.exit(1);
  }

  console.log('`npm run build` output', buildOutput.stdout.toString());

  importHarness();

  const { support } = await updateJsons();

  const ats = await At.findAll();
  await updateAtsJson({ ats, supportAts: support.ats });

  for (const directory of fse.readdirSync(builtTestsDirectory)) {
    if (directory === 'resources') continue;

    const builtDirectoryPath = path.join(builtTestsDirectory, directory);
    const sourceDirectoryPath = path.join(testsDirectory, directory);

    // https://github.com/w3c/aria-at/commit/9d73d6bb274b3fe75b9a8825e020c0546a33a162
    // This is the date of the last commit before the build folder removal.
    // Meant to support backward compatability until the existing tests can
    // be updated to the current structure
    const buildRemovalDate = new Date('2022-03-10 18:08:36.000000 +00:00');
    const useBuildInAppAppUrlPath =
      gitCommitDate.getTime() <= buildRemovalDate.getTime();

    if (
      !(
        fse.existsSync(sourceDirectoryPath) &&
        fse.statSync(builtDirectoryPath).isDirectory()
      )
    ) {
      continue;
    }

    // Gets the next ID and increments the ID counter in Postgres
    // Needed to create the testIds - see LocationOfDataId.js for more info
    const [testPlanVersionIdResult] = await sequelize.query(
      `SELECT nextval(pg_get_serial_sequence('"TestPlanVersion"', 'id'))`,
      { transaction }
    );
    const testPlanVersionIdResultRow = testPlanVersionIdResult[0];
    const testPlanVersionId = testPlanVersionIdResultRow.nextval;

    // Get the currently set value to rollback the 'correct' nextval for
    // subsequent runs
    const [currentTestPlanVersionIdResult] = await sequelize.query(
      `SELECT currval(pg_get_serial_sequence('"TestPlanVersion"', 'id'))`,
      { transaction }
    );
    const currentTestPlanVersionId =
      currentTestPlanVersionIdResult[0].currval - 1;

    // Target the specific /tests/<pattern> directory to determine when a pattern's folder was
    // actually last changed
    const {
      gitSha,
      gitMessage,
      gitCommitDate: updatedAt
    } = await readDirectoryGitInfo(sourceDirectoryPath);

    // Use existence of assertions.csv to determine if v2 format files exist
    const assertionsCsvPath = path.join(
      sourceDirectoryPath,
      'data',
      'assertions.csv'
    );
    const isV2 = fse.existsSync(assertionsCsvPath);

    const tests = parseTests({
      builtDirectoryPath,
      testPlanVersionId,
      ats,
      gitSha,
      isV2
    });

    const hashedTests = hashTests(tests);

    const existing = await getTestPlanVersions({
      where: { hashedTests },
      transaction
    });

    if (existing.length) {
      // Rollback the sequence to avoid unintentional id jumps (potentially 35+)
      await sequelize.query(
        `SELECT setval(pg_get_serial_sequence('"TestPlanVersion"', 'id'), :currentTestPlanVersionId)`,
        {
          replacements: { currentTestPlanVersionId },
          transaction
        }
      );
      continue;
    }

    const { title, exampleUrl, designPatternUrl, testPageUrl } = readCsv({
      sourceDirectoryPath,
      isV2
    });

    let testPlanId = null;
    const associatedTestPlans = await getTestPlans({
      where: { directory },
      transaction
    });

    if (associatedTestPlans.length) {
      testPlanId = associatedTestPlans[0].dataValues.id;
    } else {
      const newTestPlan = await createTestPlan({
        values: { title, directory },
        transaction
      });
      testPlanId = newTestPlan.dataValues.id;
    }

    // Check if any TestPlanVersions exist for the directory and is currently in RD, and set it
    // to DEPRECATED
    const testPlanVersionsToDeprecate = await getTestPlanVersions({
      where: { phase: 'RD', directory },
      transaction
    });
    if (testPlanVersionsToDeprecate.length) {
      for (const testPlanVersionToDeprecate of testPlanVersionsToDeprecate) {
        if (new Date(testPlanVersionToDeprecate.updatedAt) < updatedAt) {
          // Set the deprecatedAt time to a couple seconds less than the updatedAt date.
          // Deprecations happen slightly before update during normal app operations.
          // This is to maintain correctness and any app sorts issues
          const deprecatedAt = new Date(updatedAt);
          deprecatedAt.setSeconds(deprecatedAt.getSeconds() - 120);
          await updateTestPlanVersionById({
            id: testPlanVersionToDeprecate.id,
            values: { phase: 'DEPRECATED', deprecatedAt },
            transaction
          });
        }
      }
    }

    const versionString = await getVersionString({
      updatedAt,
      directory,
      transaction
    });

    await createTestPlanVersion({
      values: {
        id: testPlanVersionId,
        title,
        directory,
        testPageUrl: getAppUrl(testPageUrl, {
          gitSha,
          directoryPath: useBuildInAppAppUrlPath
            ? builtDirectoryPath
            : sourceDirectoryPath
        }),
        gitSha,
        gitMessage,
        hashedTests,
        updatedAt,
        versionString,
        metadata: {
          designPatternUrl,
          exampleUrl,
          testFormatVersion: isV2 ? 2 : 1
        },
        tests,
        testPlanId
      },
      transaction
    });
  }

  // To ensure build folder is clean when multiple commits are being processed
  // to prevent `EPERM` errors
  console.log('Running `npm run cleanup` ...\n');
  const cleanupOutput = spawn.sync('npm', ['run', 'cleanup'], {
    cwd: gitCloneDirectory
  });
  console.log('`npm run cleanup` output', cleanupOutput.stdout.toString());
};

const importHarness = () => {
  const sourceFolder = path.resolve(`${testsDirectory}/resources`);
  const targetFolder = path.resolve('../', 'client/resources');
  console.info(`Updating harness directory, ${targetFolder} ...`);
  fse.rmSync(targetFolder, { recursive: true, force: true });

  // Copy source folder
  console.info('Importing latest harness files ...');
  fse.copySync(sourceFolder, targetFolder, {
    filter: src => {
      if (fse.lstatSync(src).isDirectory()) {
        return true;
      }
      if (!src.includes('.html')) {
        return true;
      }
    }
  });

  // Copy files
  const commandsJson = 'commands.json';
  const supportJson = 'support.json';
  if (fse.existsSync(`${testsDirectory}/${commandsJson}`)) {
    fse.copyFileSync(
      `${testsDirectory}/${commandsJson}`,
      `${targetFolder}/${commandsJson}`
    );
  }
  fse.copyFileSync(
    `${testsDirectory}/${supportJson}`,
    `${targetFolder}/${supportJson}`
  );
  console.info('Harness files update complete.');
};

const readCsv = ({ sourceDirectoryPath, isV2 }) => {
  // 'references.csv' only exists in <root>/tests/<directory>/data/references.csv
  // doesn't exist in <root>/build/tests/<directory>/data/references.csv
  const referencesCsvPath = path.join(
    sourceDirectoryPath,
    'data',
    'references.csv'
  );

  const referencesCsv = fse.readFileSync(referencesCsvPath, {
    encoding: 'utf-8'
  });

  const getCsvValue = refId => {
    const line = referencesCsv.split('\n').find(line => line.includes(refId));
    const columns = line?.split(',');
    return columns?.[isV2 ? 2 : 1];
  };

  return {
    title: getCsvValue('title'),
    exampleUrl: getCsvValue('example'),
    designPatternUrl: getCsvValue('designPattern'),
    testPageUrl: getCsvValue('reference')
  };
};

const flattenObject = (obj, parentKey = '') => {
  const flattened = {};

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const subObject = flattenObject(obj[key], parentKey + key + '.');
      Object.assign(flattened, subObject);
    } else {
      flattened[parentKey + key] = obj[key];
    }
  }

  return flattened;
};

const updateJsons = async () => {
  // Commands path info for v1 format
  const keysMjsPath = pathToFileURL(
    path.join(testsDirectory, 'resources', 'keys.mjs')
  );
  const commands = Object.entries(await import(keysMjsPath)).map(
    ([id, text]) => ({ id, text })
  );

  // Write commands for v1 format
  await fse.writeFile(
    path.resolve(__dirname, '../../resources/commandsV1.json'),
    JSON.stringify(commands, null, 4)
  );

  try {
    // Commands path info for v2 format
    const commandsV2Path = pathToFileURL(
      path.join(testsDirectory, 'commands.json')
    );
    const commandsV2PathString = fse.readFileSync(commandsV2Path, 'utf8');
    const commandsV2Parsed = JSON.parse(commandsV2PathString);

    // Write commands for v2 format
    await fse.writeFile(
      path.resolve(__dirname, '../../resources/commandsV2.json'),
      JSON.stringify(flattenObject(commandsV2Parsed), null, 4)
    );
  } catch (error) {
    console.error('commands.json for v2 test format may not exist');
  }

  // Path info for support.json
  const supportPath = pathToFileURL(path.join(testsDirectory, 'support.json'));
  const supportPathString = fse.readFileSync(supportPath, 'utf8');
  const supportParsed = JSON.parse(supportPathString);

  return { support: supportParsed };
};

const updateAtsJson = async ({ ats, supportAts }) => {
  const atsResult = ats.map(at => ({
    ...at.dataValues,
    ...supportAts.find(supportAt => supportAt.name === at.dataValues.name)
  }));

  await fse.writeFile(
    path.resolve(__dirname, '../../resources/ats.json'),
    JSON.stringify(atsResult, null, 4)
  );
};

const getVersionString = async ({ directory, updatedAt, transaction }) => {
  const versionStringBase = `V${convertDateToString(updatedAt, 'YY.MM.DD')}`;
  const result = await sequelize.query(
    `
            SELECT "versionString" FROM "TestPlanVersion"
            WHERE directory = ? AND "versionString" LIKE ?
            ORDER BY "versionString" DESC;
        `,
    { replacements: [directory, `${versionStringBase}%`], transaction }
  );

  let versionString = result[0][0]?.versionString;

  if (!versionString) return versionStringBase;

  const currentCount = versionString.match(/V\d\d\.\d\d\.\d\d-(\d+)/)?.[1] ?? 0;
  let duplicateCount = Number(currentCount) + 1;

  return `${versionStringBase}-${duplicateCount}`;
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
