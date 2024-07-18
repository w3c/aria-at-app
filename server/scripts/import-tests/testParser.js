const path = require('path');
const fse = require('fs-extra');
const {
  createTestId,
  createScenarioId,
  createAssertionId
} = require('../../services/PopulatedData/locationOfDataId');
const { convertAssertionPriority } = require('shared');
const { getAppUrl } = require('./utils');
const deepPickEqual = require('../../util/deepPickEqual');

/**
 * Parses test files and creates test objects
 * @param {Object} options
 * @param {string} options.builtDirectoryPath
 * @param {number} options.testPlanVersionId
 * @param {Array} options.ats
 * @param {string} options.gitSha
 * @param {boolean} options.isV2
 * @returns {Array} Array of test objects
 */
function parseTests({
  builtDirectoryPath,
  testPlanVersionId,
  ats,
  gitSha,
  isV2
}) {
  const tests = [];
  const renderedUrlsById = {};
  const allCollectedById = {};

  fse.readdirSync(builtDirectoryPath).forEach(filePath => {
    if (!filePath.endsWith('.collected.json')) return;
    const jsonPath = path.join(builtDirectoryPath, filePath);
    const jsonString = fse.readFileSync(jsonPath, 'utf8');
    const collected = JSON.parse(jsonString);
    const renderedUrl = filePath.replace(/\.json$/, '.html');

    const testId = collected.info.testId;
    if (!allCollectedById[testId]) {
      allCollectedById[testId] = [];
      renderedUrlsById[testId] = [];
    }

    // Use deepPickEqual to check if this collected object is already present
    const isDuplicate = allCollectedById[testId].some(existingCollected =>
      deepPickEqual(existingCollected, collected, [
        'info',
        'target',
        'commands',
        'assertions',
        'instructions'
      ])
    );

    if (!isDuplicate) {
      allCollectedById[testId].push(collected);
      renderedUrlsById[testId].push(renderedUrl);
    }
  });

  Object.entries(allCollectedById).forEach(([rawTestId, allCollected]) => {
    const renderedUrls = renderedUrlsById[rawTestId];
    createTestsForFormat({
      allCollected,
      rawTestId,
      renderedUrls,
      isV2,
      testPlanVersionId,
      ats,
      gitSha,
      builtDirectoryPath,
      tests
    });
  });

  return tests;
}

function createTestsForFormat({
  allCollected,
  rawTestId,
  renderedUrls,
  isV2,
  testPlanVersionId,
  ats,
  gitSha,
  builtDirectoryPath,
  tests
}) {
  if (!isV2) {
    createV1Test({
      allCollected,
      rawTestId,
      renderedUrls,
      testPlanVersionId,
      ats,
      gitSha,
      builtDirectoryPath,
      tests
    });
  } else {
    createV2Tests({
      allCollected,
      rawTestId,
      renderedUrls,
      testPlanVersionId,
      ats,
      gitSha,
      builtDirectoryPath,
      tests
    });
  }
}

function createV1Test({
  allCollected,
  rawTestId,
  renderedUrls,
  testPlanVersionId,
  ats,
  gitSha,
  builtDirectoryPath,
  tests
}) {
  const common = allCollected[0];
  const testId = createTestId(testPlanVersionId, common.info.testId);
  const atIds = allCollected.map(
    collected => ats.find(at => at.name === collected.target.at.name).id
  );

  tests.push({
    id: testId,
    rowNumber: rawTestId,
    title: common.info.title,
    atIds,
    renderableContent: createRenderableContent(allCollected, atIds),
    renderedUrls: createRenderedUrls(
      atIds,
      renderedUrls,
      gitSha,
      builtDirectoryPath
    ),
    scenarios: createScenarios(allCollected, testId, ats),
    assertions: getAssertions(common, testId),
    viewers: [],
    testFormatVersion: 1
  });
}

function createV2Tests({
  allCollected,
  rawTestId,
  renderedUrls,
  testPlanVersionId,
  ats,
  gitSha,
  builtDirectoryPath,
  tests
}) {
  for (const [collectedIndex, collected] of allCollected.entries()) {
    const testId = createTestId(
      testPlanVersionId,
      `${collected.target.at.key}:${collected.info.testId}`
    );

    tests.push({
      id: testId,
      rawTestId,
      rowNumber: collected.info.presentationNumber,
      title: collected.info.title,
      at: createAtObject(collected),
      atIds: [ats.find(at => at.name === collected.target.at.name).id],
      renderableContent: createV2RenderableContent(collected),
      renderedUrl: getAppUrl(renderedUrls[collectedIndex], {
        gitSha,
        directoryPath: builtDirectoryPath
      }),
      scenarios: createV2Scenarios(collected, testId, ats),
      assertions: getAssertions(collected, testId),
      viewers: [],
      testFormatVersion: 2
    });
  }
}

function createRenderableContent(allCollected, atIds) {
  return Object.fromEntries(
    allCollected.map((collected, index) => [atIds[index], collected])
  );
}

function createRenderedUrls(atIds, renderedUrls, gitSha, builtDirectoryPath) {
  return Object.fromEntries(
    atIds.map((atId, index) => [
      atId,
      getAppUrl(renderedUrls[index], {
        gitSha,
        directoryPath: builtDirectoryPath
      })
    ])
  );
}

function createScenarios(allCollected, testId, ats) {
  const scenarios = [];
  allCollected.forEach(collected => {
    collected.commands.forEach(command => {
      scenarios.push({
        id: createScenarioId(testId, scenarios.length),
        atId: ats.find(at => at.name === collected.target.at.name).id,
        commandIds: command.keypresses.map(({ id }) => id)
      });
    });
  });
  return scenarios;
}

function createAtObject(collected) {
  return {
    key: collected.target.at.key,
    name: collected.target.at.name,
    settings: collected.target.at.raw.settings
  };
}

function createV2RenderableContent(collected) {
  return {
    ...collected,
    target: {
      at: collected.target.at,
      referencePage: collected.target.referencePage,
      setupScript: collected.target.setupScript
    },
    assertions: collected.assertions.map(
      ({
        assertionId,
        priority,
        assertionStatement,
        assertionPhrase,
        refIds,
        tokenizedAssertionStatements,
        tokenizedAssertionPhrases
      }) => ({
        assertionId,
        priority,
        assertionStatement:
          tokenizedAssertionStatements[collected.target.at.key] ||
          assertionStatement,
        assertionPhrase:
          tokenizedAssertionPhrases?.[collected.target.at.key] ||
          assertionPhrase,
        refIds
      })
    )
  };
}

function createV2Scenarios(collected, testId, ats) {
  return collected.commands.map((command, index) => ({
    id: createScenarioId(testId, `${index}:${command.settings}`),
    atId: ats.find(at => at.name === collected.target.at.name).id,
    commandIds: command.keypresses.map(({ id }) => id),
    settings: command.settings
  }));
}

function getAssertions(data, testId) {
  return data.assertions.map((assertion, index) => {
    const priority = convertAssertionPriority(assertion.priority);

    let result = {
      id: createAssertionId(testId, index),
      priority
    };

    if (assertion.expectation) result.text = assertion.expectation;

    if (assertion.assertionStatement) {
      const tokenizedAssertionStatement =
        assertion?.tokenizedAssertionStatements[data.target.at.key];
      const tokenizedAssertionPhrase =
        assertion?.tokenizedAssertionPhrases?.[data.target.at.key];

      result = {
        ...result,
        rawAssertionId: assertion.assertionId,
        assertionStatement:
          tokenizedAssertionStatement || assertion.assertionStatement,
        assertionPhrase: tokenizedAssertionPhrase || assertion.assertionPhrase,
        assertionExceptions: createAssertionExceptions(
          data.commands,
          assertion.assertionId
        )
      };
    }

    return result;
  });
}

function createAssertionExceptions(commands, assertionId) {
  return commands.flatMap(command =>
    command.assertionExceptions
      .filter(exception => exception.assertionId === assertionId)
      .map(({ priority }) => ({
        priority: convertAssertionPriority(priority),
        commandId: command.id,
        settings: command.settings
      }))
  );
}

module.exports = {
  parseTests
};
