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
const extractZipFile = require('../../util/extractZipFile');
const { dates } = require('shared');
const { readCommit, readDirectoryGitInfo } = require('./gitOperations');
const { parseTests } = require('./testParser');
const {
  gitCloneDirectory,
  builtTestsDirectory,
  testsDirectory,
  getZipCommitPath,
  getZipCommitTmpDirectory,
  PRE_BUILT_ZIP_COMMITS
} = require('./settings');
const { getAppUrl } = require('./utils');

/**
 * Builds tests and creates test plan versions for a given commit.
 * @param {string|null} commit - The git commit hash.
 * @param {Object} options - Options object.
 * @param {boolean} options.waitForCleanup - Wait for aria-at's cleanup command to run (may not be needed if removing the directory right after)
 * @param {import('sequelize').Transaction} options.transaction - The database transaction.
 * @returns {Promise<void>}
 */
const buildTestsAndCreateTestPlanVersions = async (
  commit,
  { waitForCleanup, transaction }
) => {
  let zipCommitTmpDirectory;
  let localBuiltTestsDirectory = builtTestsDirectory;

  // Always get commit info from the real repo
  const { gitCommitDate } = await readCommit(gitCloneDirectory, commit);

  // Always fetch ATs from the database
  const ats = await At.findAll({
    order: [['id', 'ASC']]
  });

  // If commit is pre-built, load content from local source
  if (PRE_BUILT_ZIP_COMMITS.includes(commit)) {
    // Unzip to a custom directory named after the commit
    zipCommitTmpDirectory = getZipCommitTmpDirectory(commit);
    if (!fse.existsSync(zipCommitTmpDirectory)) {
      fse.mkdirSync(zipCommitTmpDirectory, { recursive: true });
      try {
        await extractZipFile(getZipCommitPath(commit), zipCommitTmpDirectory);
      } catch (error) {
        console.error(
          `Failed to extract the zip directory for ${commit}:`,
          error
        );
      }
    }

    // Set directories to extracted locations
    localBuiltTestsDirectory = path.join(
      zipCommitTmpDirectory,
      'build',
      'tests'
    );

    console.log(
      `Extracted pre-built commit folder for ${commit}:\n${localBuiltTestsDirectory}`
    );
  } else {
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

    await updateAtsJson({ ats, supportAts: support.ats });
  }

  for (const directory of fse.readdirSync(localBuiltTestsDirectory)) {
    if (directory === 'resources') continue;

    const builtDirectoryPath = path.join(localBuiltTestsDirectory, directory);
    if (!fse.statSync(builtDirectoryPath).isDirectory()) continue;
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

    await processTestPlanVersion({
      directory,
      builtDirectoryPath,
      sourceDirectoryPath,
      useBuildInAppAppUrlPath,
      ats,
      transaction
    });
  }

  // To ensure build folder is clean when multiple commits are being processed
  // to prevent `EPERM` errors
  if (!PRE_BUILT_ZIP_COMMITS.includes(commit) && waitForCleanup) {
    console.log('Running `npm run cleanup` ...\n');
    const cleanupOutput = spawn.sync('npm', ['run', 'cleanup'], {
      cwd: gitCloneDirectory
    });
    console.log('`npm run cleanup` output', cleanupOutput.stdout.toString());
  }

  // Clean up the extracted zip commit directory after use
  if (fse.existsSync(zipCommitTmpDirectory)) {
    try {
      fse.removeSync(zipCommitTmpDirectory);
      console.log(
        `Cleaned up extracted commit directory: ${zipCommitTmpDirectory}\n`
      );
    } catch (error) {
      console.warn(
        `Failed to clean up extracted commit directory: ${zipCommitTmpDirectory}:\n`,
        error
      );
    }
  }
};

/**
 * Processes a test plan version for a given directory.
 * @param {Object} options - Options object.
 * @param {string} options.directory - The directory name.
 * @param {string} options.builtDirectoryPath - Path to the built directory.
 * @param {string} options.sourceDirectoryPath - Path to the source directory.
 * @param {boolean} options.useBuildInAppAppUrlPath - Whether to use build path in app URL.
 * @param {Array} options.ats - Array of AT objects.
 * @param {import('sequelize').Transaction} options.transaction - The database transaction.
 * @returns {Promise<void>}
 */
const processTestPlanVersion = async ({
  directory,
  builtDirectoryPath,
  sourceDirectoryPath,
  useBuildInAppAppUrlPath,
  ats,
  transaction
}) => {
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
  } = readDirectoryGitInfo(sourceDirectoryPath);

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
    return;
  }

  const { title, exampleUrl, designPatternUrl, testPageUrl } = readCsv({
    sourceDirectoryPath,
    isV2
  });

  const resolvedDirectoryPath = useBuildInAppAppUrlPath
    ? builtDirectoryPath
    : sourceDirectoryPath;

  if (!testPageUrl || !resolvedDirectoryPath) {
    throw new Error(
      `Missing testPageUrl or directoryPath for test plan version: directory=${directory}, commitSha=${gitSha}, testPageUrl=${testPageUrl}, directoryPath=${resolvedDirectoryPath}`
    );
  }

  const testPlanId = await getOrCreateTestPlan(directory, title, transaction);

  await deprecateOldTestPlanVersions(directory, updatedAt, transaction);

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
        directoryPath: resolvedDirectoryPath
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
};

/**
 * Imports the harness files from the test directory to the client resources.
 */
const importHarness = () => {
  const sourceFolder = path.resolve(`${testsDirectory}/resources`);
  const targetFolder = path.resolve(
    __dirname,
    '../../../',
    'client',
    'resources'
  );
  console.info(
    `Updating harness directory, copying from ${sourceFolder} to ${targetFolder} ...`
  );
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

/**
 * Reads CSV data from the source directory.
 * @param {Object} options - Options object.
 * @param {string} options.sourceDirectoryPath - Path to the source directory.
 * @param {boolean} options.isV2 - Whether it's version 2 format.
 * @returns {Object} An object containing title, exampleUrl, designPatternUrl, and testPageUrl.
 */
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

/**
 * Flattens a nested object.
 * @param {Object} obj - The object to flatten.
 * @param {string} [parentKey=''] - The parent key for nested objects.
 * @returns {Object} A flattened object.
 */
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

/**
 * Updates JSON files for commands and support.
 * @returns {Promise<Object>} An object containing the parsed support data.
 */
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
    JSON.stringify(commands, null, 2) + '\n'
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
      JSON.stringify(flattenObject(commandsV2Parsed), null, 2) + '\n'
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

/**
 * Updates the ATs JSON file.
 * @param {Object} options - Options object.
 * @param {Array} options.ats - Array of AT objects.
 * @param {Array} options.supportAts - Array of support AT objects.
 * @returns {Promise<void>}
 */
async function updateAtsJson({ ats, supportAts }) {
  const atsResult = ats.map(at => ({
    ...at.dataValues,
    ...supportAts.find(supportAt => supportAt.name === at.dataValues.name)
  }));

  await fse.writeFile(
    path.resolve(__dirname, '../../resources/ats.json'),
    JSON.stringify(atsResult, null, 2) + '\n'
  );
}

/**
 * Gets or creates a test plan for a given directory.
 * @param {string} directory - The directory name.
 * @param {string} title - The title of the test plan.
 * @param {import('sequelize').Transaction} transaction - The database transaction.
 * @returns {Promise<number>} The ID of the test plan.
 */
async function getOrCreateTestPlan(directory, title, transaction) {
  const associatedTestPlans = await getTestPlans({
    where: { directory },
    transaction
  });

  if (associatedTestPlans.length) {
    return associatedTestPlans[0].dataValues.id;
  } else {
    const newTestPlan = await createTestPlan({
      values: { title, directory },
      transaction
    });
    return newTestPlan.dataValues.id;
  }
}

/**
 * Deprecates old test plan versions for a given directory.
 * @param {string} directory - The directory name.
 * @param {Date} updatedAt - The update date.
 * @param {import('sequelize').Transaction} transaction - The database transaction.
 * @returns {Promise<void>}
 */
async function deprecateOldTestPlanVersions(directory, updatedAt, transaction) {
  // Check if any TestPlanVersions exist for the directory and is currently in RD, and set it
  // to DEPRECATED
  const testPlanVersionsToDeprecate = await getTestPlanVersions({
    where: { phase: 'RD', directory },
    transaction
  });
  if (testPlanVersionsToDeprecate.length) {
    for (const testPlanVersionToDeprecate of testPlanVersionsToDeprecate) {
      if (new Date(testPlanVersionToDeprecate.updatedAt) <= updatedAt) {
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
}

/**
 * Generates a version string for a test plan version.
 * @param {Object} options - Options object.
 * @param {string} options.directory - The directory name.
 * @param {Date} options.updatedAt - The update date.
 * @param {import('sequelize').Transaction} options.transaction - The database transaction.
 * @returns {Promise<string>} The generated version string.
 */
async function getVersionString({ directory, updatedAt, transaction }) {
  const versionStringBase = `V${dates.convertDateToString(
    updatedAt,
    'YY.MM.DD'
  )}`;
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

  const currentCount = versionString.match(/V\d\d\.\d\d\.\d\d-(\d+)/);
  let duplicateCount = currentCount ? Number(currentCount[1]) + 1 : 1;

  return `${versionStringBase}-${duplicateCount}`;
}

module.exports = {
  buildTestsAndCreateTestPlanVersions,
  importHarness,
  updateJsons
};
