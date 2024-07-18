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

const parseTests = ({
  builtDirectoryPath,
  testPlanVersionId,
  ats,
  gitSha,
  isV2
}) => {
  const tests = [];
  const { renderedUrlsById, allCollectedById } =
    collectTestData(builtDirectoryPath);

  Object.entries(allCollectedById).forEach(([rawTestId, allCollected]) => {
    const renderedUrls = renderedUrlsById[rawTestId];

    validateCollectedData(allCollected);

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
};

const collectTestData = builtDirectoryPath => {
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
};

const validateCollectedData = allCollected => {
  if (
    !deepPickEqual(allCollected, { excludeKeys: ['at', 'mode', 'commands'] })
  ) {
    throw new Error(
      'Difference found in a part of a .collected.json file which should be equivalent'
    );
  }
};

const createTestsForFormat = ({
  allCollected,
  rawTestId,
  renderedUrls,
  isV2,
  testPlanVersionId,
  ats,
  gitSha,
  builtDirectoryPath,
  tests
}) => {
  const getRenderedUrl = createRenderedUrlGetter(
    renderedUrls,
    gitSha,
    builtDirectoryPath
  );

  if (!isV2) {
    createV1Test({
      allCollected,
      rawTestId,
      renderedUrls,
      testPlanVersionId,
      ats,
      getRenderedUrl,
      tests
    });
  } else {
    createV2Tests({
      allCollected,
      rawTestId,
      testPlanVersionId,
      ats,
      getRenderedUrl,
      tests
    });
  }
};

const createRenderedUrlGetter = (renderedUrls, gitSha, builtDirectoryPath) => {
  return index =>
    getAppUrl(renderedUrls[index], {
      gitSha,
      directoryPath: builtDirectoryPath
    });
};

const createV1Test = ({
  allCollected,
  rawTestId,
  testPlanVersionId,
  ats,
  getRenderedUrl,
  tests
}) => {
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
    renderedUrls: createRenderedUrls(atIds, getRenderedUrl),
    scenarios: createScenarios(allCollected, testId, ats),
    assertions: getAssertions(common, testId),
    viewers: [],
    testFormatVersion: 1
  });
};

const createV2Tests = ({
  allCollected,
  rawTestId,
  testPlanVersionId,
  ats,
  getRenderedUrl,
  tests
}) => {
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
      renderableContent: createV2RenderableContent(collected),
      renderedUrl: getRenderedUrl(collectedIndex),
      scenarios: createV2Scenarios(collected, testId, atId),
      assertions: getAssertions(collected, testId),
      viewers: [],
      testFormatVersion: 2
    });
  });
};

const createRenderableContent = (allCollected, atIds) => {
  return Object.fromEntries(
    allCollected.map((collected, index) => [atIds[index], collected])
  );
};

const createRenderedUrls = (atIds, getRenderedUrl) => {
  return Object.fromEntries(
    atIds.map((atId, index) => [atId, getRenderedUrl(index)])
  );
};

const createScenarios = (allCollected, testId, ats) => {
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
};

const createAtObject = collected => {
  return {
    key: collected.target.at.key,
    name: collected.target.at.name,
    settings: collected.target.at.raw.settings
  };
};

const createV2RenderableContent = collected => {
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
};

const createV2Scenarios = (collected, testId, atId) => {
  return collected.commands.map((command, index) => ({
    id: createScenarioId(testId, `${index}:${command.settings}`),
    atId,
    commandIds: command.keypresses.map(({ id }) => id),
    settings: command.settings
  }));
};

const getAssertions = (data, testId) => {
  return data.assertions.map((assertion, index) => {
    const priority = convertPriority(assertion.priority);
    let result = {
      id: createAssertionId(testId, index),
      priority
    };

    if (assertion.expectation) result.text = assertion.expectation;

    if (assertion.assertionStatement) {
      result = {
        ...result,
        ...createV2AssertionData(assertion, data)
      };
    }

    return result;
  });
};

const convertPriority = priority => {
  const priorities = { 1: 'MUST', 2: 'SHOULD', 3: 'MAY', 0: 'EXCLUDE' };
  return priorities[priority] || '';
};

const createV2AssertionData = (assertion, data) => {
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
};

const createAssertionExceptions = (commands, assertionId) => {
  return commands.flatMap(command => {
    return command.assertionExceptions
      .filter(exception => exception.assertionId === assertionId)
      .map(({ priority }) => ({
        priority: convertAssertionPriority(priority),
        commandId: command.id,
        settings: command.settings
      }));
  });
};

module.exports = {
  parseTests
};
