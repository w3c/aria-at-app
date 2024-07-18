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
const { readCommit, readDirectoryGitInfo } = require('./gitOperations');
const { parseTests } = require('./testParser');
const {
  gitCloneDirectory,
  builtTestsDirectory,
  testsDirectory
} = require('./settings');
const { getAppUrl } = require('./utils');

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
      gitCommitDate,
      useBuildInAppAppUrlPath,
      ats,
      transaction
    });
  }

  console.log('Running `npm run cleanup` ...\n');
  const cleanupOutput = spawn.sync('npm', ['run', 'cleanup'], {
    cwd: gitCloneDirectory
  });
  console.log('`npm run cleanup` output', cleanupOutput.stdout.toString());
};

const processTestPlanVersion = async ({
  directory,
  builtDirectoryPath,
  sourceDirectoryPath,
  useBuildInAppAppUrlPath,
  ats,
  transaction
}) => {
  const [testPlanVersionIdResult] = await sequelize.query(
    `SELECT nextval(pg_get_serial_sequence('"TestPlanVersion"', 'id'))`,
    { transaction }
  );
  const testPlanVersionIdResultRow = testPlanVersionIdResult[0];
  const testPlanVersionId = testPlanVersionIdResultRow.nextval;

  const [currentTestPlanVersionIdResult] = await sequelize.query(
    `SELECT currval(pg_get_serial_sequence('"TestPlanVersion"', 'id'))`,
    { transaction }
  );
  const currentTestPlanVersionId =
    currentTestPlanVersionIdResult[0].currval - 1;

  const {
    gitSha,
    gitMessage,
    gitCommitDate: updatedAt
  } = readDirectoryGitInfo(sourceDirectoryPath);

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
};

const importHarness = () => {
  const sourceFolder = path.resolve(`${testsDirectory}/resources`);
  const targetFolder = path.resolve('../', 'client/resources');
  console.info(`Updating harness directory, ${targetFolder} ...`);
  fse.rmSync(targetFolder, { recursive: true, force: true });

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
  const keysMjsPath = pathToFileURL(
    path.join(testsDirectory, 'resources', 'keys.mjs')
  );
  const commands = Object.entries(await import(keysMjsPath)).map(
    ([id, text]) => ({ id, text })
  );

  await fse.writeFile(
    path.resolve(__dirname, '../../resources/commandsV1.json'),
    JSON.stringify(commands, null, 4)
  );

  try {
    const commandsV2Path = pathToFileURL(
      path.join(testsDirectory, 'commands.json')
    );
    const commandsV2PathString = fse.readFileSync(commandsV2Path, 'utf8');
    const commandsV2Parsed = JSON.parse(commandsV2PathString);

    await fse.writeFile(
      path.resolve(__dirname, '../../resources/commandsV2.json'),
      JSON.stringify(flattenObject(commandsV2Parsed), null, 4)
    );
  } catch (error) {
    console.error('commands.json for v2 test format may not exist');
  }

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

const getOrCreateTestPlan = async (directory, title, transaction) => {
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
};

const deprecateOldTestPlanVersions = async (
  directory,
  updatedAt,
  transaction
) => {
  const testPlanVersionsToDeprecate = await getTestPlanVersions({
    where: { phase: 'RD', directory },
    transaction
  });
  if (testPlanVersionsToDeprecate.length) {
    for (const testPlanVersionToDeprecate of testPlanVersionsToDeprecate) {
      if (new Date(testPlanVersionToDeprecate.updatedAt) < updatedAt) {
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

  const currentCount = versionString.match(/V\d\d\.\d\d\.\d\d-(\d+)/);
  let duplicateCount = currentCount ? Number(currentCount[1]) + 1 : 1;

  return `${versionStringBase}-${duplicateCount}`;
};

module.exports = {
  buildTestsAndCreateTestPlanVersions,
  importHarness,
  updateJsons,
  updateAtsJson,
  getVersionString
};
