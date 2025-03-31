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
 * Strategies for different test format versions.
 */
const testFormatStrategies = {
  v1: {
    createTest: createV1Test,
    createRenderableContent: createV1RenderableContent,
    createRenderedUrls: createV1RenderedUrls,
    createScenarios: createV1Scenarios
  },
  v2: {
    createTest: createV2Test,
    createRenderableContent: createV2RenderableContent,
    createScenarios: createV2Scenarios
  }
};

/**
 * Creates a V1 format test object.
 * @param {Object} options
 * @param {Array} options.allCollected - Array of collected test data
 * @param {string} options.rawTestId - Raw test ID
 * @param {string} options.testPlanVersionId - ID of the test plan version
 * @param {Array} options.ats - Array of assistive technologies
 * @param {Function} options.getRenderedUrl - Function to get rendered URL
 * @param {Array} options.tests - Array to store created tests
 */
function createV1Test({
  allCollected,
  rawTestId,
  testPlanVersionId,
  ats,
  getRenderedUrl,
  tests
}) {
  // Using the v1 test format, https://github.com/w3c/aria-at/wiki/Test-Format-V1-Definition
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
    /** @type {RenderableContent} */
    renderableContent: createV1RenderableContent(allCollected, atIds),
    renderedUrls: createV1RenderedUrls(atIds, getRenderedUrl),
    scenarios: createV1Scenarios(allCollected, testId, ats),
    assertions: getAssertions(common, testId),
    testFormatVersion: 1
  });
}

/**
 * Creates V2 format test objects.
 * @param {Object} options
 * @param {Array} options.allCollected - Array of collected test data
 * @param {string} options.rawTestId - Raw test ID
 * @param {string} options.testPlanVersionId - ID of the test plan version
 * @param {Array} options.ats - Array of assistive technologies
 * @param {Function} options.getRenderedUrl - Function to get rendered URL
 * @param {Array} options.tests - Array to store created tests
 */
function createV2Test({
  allCollected,
  rawTestId,
  testPlanVersionId,
  ats,
  getRenderedUrl,
  tests
}) {
  allCollected.forEach((collected, collectedIndex) => {
    const testId = createTestId(
      testPlanVersionId,
      `${collected.target.at.key}:${collected.info.testId}`
    );
    const atId = ats.find(at => at.name === collected.target.at.name).id;

    tests.push({
      id: testId,
      rawTestId,
      rowNumber: collected.info.presentationNumber,
      title: collected.info.title,
      at: createAtObject(collected),
      atIds: [atId],
      /** @type {RenderableContent} */
      renderableContent: createV2RenderableContent(collected),
      renderedUrl: getRenderedUrl(collectedIndex),
      scenarios: createV2Scenarios(collected, testId, atId),
      assertions: getAssertions(collected, testId),
      testFormatVersion: 2
    });
  });
}

/**
 * Creates renderable content for V1 format tests.
 * @param {Array} allCollected - Array of collected test data
 * @param {Array} atIds - Array of assistive technology IDs
 * @returns {RenderableContent} Renderable content object
 */
function createV1RenderableContent(allCollected, atIds) {
  return Object.fromEntries(
    allCollected.map((collected, index) =>
      /** @type {RenderableContent} */
      [atIds[index], collected]
    )
  );
}

/**
 * Creates rendered URLs object for V1 format tests.
 * @param {Array} atIds - Array of assistive technology IDs
 * @param {Function} getRenderedUrl - Function to get rendered URL
 * @returns {Object} Rendered URLs object
 */
function createV1RenderedUrls(atIds, getRenderedUrl) {
  return Object.fromEntries(
    atIds.map((atId, index) => [atId, getRenderedUrl(index)])
  );
}

/**
 * Creates scenarios for V1 format tests.
 * @param {Array} allCollected - Array of collected test data
 * @param {string} testId - Test ID
 * @param {Array} ats - Array of assistive technologies
 * @returns {Array} Array of scenario objects
 */
function createV1Scenarios(allCollected, testId, ats) {
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

/**
 * Creates an AT object for V2 format tests.
 * @param {Object} collected - Collected test data
 * @returns {Object} AT object
 */
function createAtObject(collected) {
  return {
    key: collected.target.at.key,
    name: collected.target.at.name,
    settings: collected.target.at.raw.settings
  };
}

/**
 * Creates renderable content for V2 format tests.
 * @param {Object} collected - Collected test data
 * @returns {RenderableContent} Renderable content object
 */
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
      }) => {
        const tokenizedAssertionStatement =
          tokenizedAssertionStatements[collected.target.at.key];
        const tokenizedAssertionPhrase =
          tokenizedAssertionPhrases?.[collected.target.at.key];

        return {
          assertionId,
          priority,
          assertionStatement: tokenizedAssertionStatement || assertionStatement,
          assertionPhrase: tokenizedAssertionPhrase || assertionPhrase,
          refIds
        };
      }
    )
  };
}

/**
 * Creates scenarios for V2 format tests.
 * @param {Object} collected - Collected test data
 * @param {string} testId - Test ID
 * @param {string} atId - Assistive technology ID
 * @returns {Array} Array of scenario objects
 */
function createV2Scenarios(collected, testId, atId) {
  return collected.commands.map((command, index) => ({
    id: createScenarioId(testId, `${index}:${command.settings}`),
    atId,
    commandIds: command.keypresses.map(({ id }) => id),
    settings: command.settings
  }));
}

/**
 * Gets assertions from collected data.
 * @param {Object} data - Collected test data
 * @param {string} testId - Test ID
 * @returns {Assertion[]} Array of assertion objects
 */
function getAssertions(data, testId) {
  return data.assertions.map((assertion, index) => {
    const priority = convertPriority(assertion.priority);
    let result = {
      id: createAssertionId(testId, index),
      priority
    };

    // Available for v1
    if (assertion.expectation) result.text = assertion.expectation;

    // Available for v2
    if (assertion.assertionStatement) {
      result = {
        ...result,
        ...createV2AssertionData(assertion, data)
      };
    }

    return result;
  });
}

/**
 * Converts priority value to string representation.
 * @param {number} priority - Priority value
 * @returns {'MUST'|'SHOULD'|'MAY'|'EXCLUDE'|''} String representation of priority
 */
function convertPriority(priority) {
  // MAY and EXCLUDE available for v2
  const priorities = { 1: 'MUST', 2: 'SHOULD', 3: 'MAY', 0: 'EXCLUDE' };
  return priorities[priority] || '';
}

/**
 * Creates V2 assertion data.
 * @param {Assertion} assertion - Assertion object
 * @param {Object} data - Collected test data
 * @returns {Object} V2 assertion data object
 */
function createV2AssertionData(assertion, data) {
  const {
    assertionId,
    assertionStatement,
    assertionPhrase,
    tokenizedAssertionStatements,
    tokenizedAssertionPhrases
  } = assertion;
  const atKey = data.target.at.key;

  return {
    rawAssertionId: assertionId,
    assertionStatement:
      tokenizedAssertionStatements?.[atKey] || assertionStatement,
    assertionPhrase: tokenizedAssertionPhrases?.[atKey] || assertionPhrase,
    assertionExceptions: createAssertionExceptions(data.commands, assertionId)
  };
}

/**
 * Creates assertion exceptions.
 * @param {Array} commands - Array of command objects
 * @param {string} assertionId - Assertion ID
 * @returns {Array} Array of assertion exception objects
 */
function createAssertionExceptions(commands, assertionId) {
  return commands.flatMap(command => {
    return command.assertionExceptions
      .filter(exception => exception.assertionId === assertionId)
      .map(({ priority }) => ({
        priority: convertAssertionPriority(priority),
        commandId: command.id,
        settings: command.settings
      }));
  });
}

/**
 * Collects test data from JSON files in the built directory.
 * @param {string} builtDirectoryPath - Path to the directory containing built test files
 * @returns {Object} Object containing renderedUrlsById and allCollectedById
 */
function collectTestData(builtDirectoryPath) {
  const renderedUrlsById = {};
  const allCollectedById = {};

  fse.readdirSync(builtDirectoryPath).forEach(filePath => {
    if (!filePath.endsWith('.collected.json')) return;
    const jsonPath = path.join(builtDirectoryPath, filePath);
    const jsonString = fse.readFileSync(jsonPath, 'utf8');
    const collected = JSON.parse(jsonString);
    const renderedUrl = filePath.replace(/\.json$/, '.html');

    if (!allCollectedById[collected.info.testId]) {
      allCollectedById[collected.info.testId] = [];
      renderedUrlsById[collected.info.testId] = [];
    }
    allCollectedById[collected.info.testId].push(collected);
    renderedUrlsById[collected.info.testId].push(renderedUrl);
  });

  return { renderedUrlsById, allCollectedById };
}

/**
 * Validates collected data for consistency across different formats.
 * @param {Array} allCollected - Array of collected test data
 * @throws {Error} If inconsistencies are found in the collected data
 */
function validateCollectedData(allCollected) {
  if (
    !deepPickEqual(allCollected, { excludeKeys: ['at', 'mode', 'commands'] })
  ) {
    throw new Error(
      'Difference found in a part of a .collected.json file which should be equivalent'
    );
  }
}

/**
 * Creates a function to get rendered URLs.
 * @param {Array} renderedUrls - Array of rendered URLs
 * @param {string} gitSha - Git SHA of the current commit
 * @param {string} builtDirectoryPath - Path to the directory containing built test files
 * @returns {Function} Function to get rendered URL by index
 */
function createRenderedUrlGetter(renderedUrls, gitSha, builtDirectoryPath) {
  return index =>
    getAppUrl(renderedUrls[index], {
      gitSha,
      directoryPath: builtDirectoryPath
    });
}

/**
 * Parses test data from built files and creates test objects.
 * @param {Object} options
 * @param {string} options.builtDirectoryPath - Path to the directory containing built test files
 * @param {string} options.testPlanVersionId - ID of the test plan version
 * @param {Array} options.ats - Array of assistive technologies
 * @param {string} options.gitSha - Git SHA of the current commit
 * @param {boolean} options.isV2 - Flag indicating if it's version 2 of the test format
 * @returns {Array} Array of parsed test objects
 */
function parseTests({
  builtDirectoryPath,
  testPlanVersionId,
  ats,
  gitSha,
  isV2
}) {
  const tests = [];
  const { renderedUrlsById, allCollectedById } =
    collectTestData(builtDirectoryPath);
  const strategy = testFormatStrategies[isV2 ? 'v2' : 'v1'];

  Object.entries(allCollectedById).forEach(([rawTestId, allCollected]) => {
    const renderedUrls = renderedUrlsById[rawTestId];
    validateCollectedData(allCollected);

    const getRenderedUrl = createRenderedUrlGetter(
      renderedUrls,
      gitSha,
      builtDirectoryPath
    );

    strategy.createTest({
      allCollected,
      rawTestId,
      renderedUrls,
      testPlanVersionId,
      ats,
      getRenderedUrl,
      tests,
      createRenderableContent: strategy.createRenderableContent,
      createRenderedUrls: strategy.createRenderedUrls,
      createScenarios: strategy.createScenarios
    });
  });

  return tests;
}

module.exports = {
  parseTests
};

/** @typedef {import('./types').Assertion} Assertion */
/** @typedef {import('./types').RenderableContent} RenderableContent */
