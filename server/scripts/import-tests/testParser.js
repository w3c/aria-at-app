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

  /**
   * Creates tests to be included in [TestPlanVersion.tests]
   * @param {object} allCollected Generated tests coming from aria-at through test-{number}-{at}-collected.json files.
   * @param {string|number} rawTestId Numeric id for tests in v1 format, string id for tests in v2 format. Comes directly from `tests.csv` files.
   * @param {string[]} renderedUrls Paths to .collected.json files.
   * @param {boolean} isV2 Boolean check to see if the testFormatVersion of the collected tests are for v2, otherwise for v1.
   */
  const createTestsForFormat = ({
    allCollected,
    rawTestId,
    renderedUrls,
    // There MAY be a need to handle additional versions. This may be changed to handle that
    // when that time comes
    isV2
  }) => {
    const getRenderedUrl = index =>
      getAppUrl(renderedUrls[index], {
        gitSha,
        directoryPath: builtDirectoryPath
      });

    const getAssertions = (data, testId) => {
      return data.assertions.map((assertion, index) => {
        let priority = '';
        if (assertion.priority === 1) priority = 'MUST';
        if (assertion.priority === 2) priority = 'SHOULD';
        // Available for v2
        if (assertion.priority === 3) priority = 'MAY';
        if (assertion.priority === 0) priority = 'EXCLUDE';

        let result = {
          id: createAssertionId(testId, index),
          priority
        };

        // Available for v1
        if (assertion.expectation) result.text = assertion.expectation;

        // Available for v2
        if (assertion.assertionStatement) {
          const tokenizedAssertionStatement =
            assertion?.tokenizedAssertionStatements[data.target.at.key];
          const tokenizedAssertionPhrase =
            assertion?.tokenizedAssertionPhrases?.[data.target.at.key];

          result.rawAssertionId = assertion.assertionId;
          result.assertionStatement =
            tokenizedAssertionStatement || assertion.assertionStatement;
          result.assertionPhrase =
            tokenizedAssertionPhrase || assertion.assertionPhrase;
          result.assertionExceptions = data.commands.flatMap(command => {
            return command.assertionExceptions
              .filter(
                exception => exception.assertionId === assertion.assertionId
              )
              .map(({ priority: assertionPriority }) => {
                let priority = convertAssertionPriority(assertionPriority);

                return {
                  priority,
                  commandId: command.id,
                  settings: command.settings
                };
              });
          });
        }

        return result;
      });
    };

    // Using the v1 test format, https://github.com/w3c/aria-at/wiki/Test-Format-V1-Definition
    if (!isV2) {
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
        renderableContent: Object.fromEntries(
          allCollected.map((collected, index) => {
            /** @type RenderableContent **/
            return [atIds[index], collected];
          })
        ),
        renderedUrls: Object.fromEntries(
          atIds.map((atId, index) => {
            return [atId, getRenderedUrl(index)];
          })
        ),
        scenarios: (() => {
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
        })(),
        assertions: getAssertions(common, testId),
        viewers: [],
        testFormatVersion: 1
      });
    }

    // Using the v2 test format, https://github.com/w3c/aria-at/wiki/Test-Format-Definition-V2
    if (isV2) {
      for (const [collectedIndex, collected] of allCollected.entries()) {
        const testId = createTestId(
          testPlanVersionId,
          `${collected.target.at.key}:${collected.info.testId}`
        );

        let test = {
          id: testId,
          rawTestId,
          rowNumber: collected.info.presentationNumber,
          title: collected.info.title,
          at: {
            key: collected.target.at.key,
            name: collected.target.at.name,
            settings: collected.target.at.raw.settings
          },
          atIds: [ats.find(at => at.name === collected.target.at.name).id],
          /** @type RenderableContent **/
          renderableContent: {
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
                  assertionStatement:
                    tokenizedAssertionStatement || assertionStatement,
                  assertionPhrase: tokenizedAssertionPhrase || assertionPhrase,
                  refIds
                };
              }
            )
          },
          renderedUrl: getRenderedUrl(collectedIndex),
          scenarios: (() => {
            const scenarios = [];
            collected.commands.forEach(command => {
              scenarios.push({
                id: createScenarioId(
                  testId,
                  `${scenarios.length}:${command.settings}`
                ),
                atId: ats.find(at => at.name === collected.target.at.name).id,
                commandIds: command.keypresses.map(({ id }) => id),
                settings: command.settings
              });
            });
            return scenarios;
          })(),
          assertions: getAssertions(collected, testId),
          viewers: [],
          testFormatVersion: 2
        };

        tests.push(test);
      }
    }
  };

  Object.entries(allCollectedById).forEach(([rawTestId, allCollected]) => {
    const renderedUrls = renderedUrlsById[rawTestId];

    if (
      !deepPickEqual(allCollected, {
        excludeKeys: ['at', 'mode', 'commands']
      })
    ) {
      throw new Error(
        'Difference found in a part of a .collected.json file which ' +
          'should be equivalent'
      );
    }

    createTestsForFormat({ allCollected, rawTestId, renderedUrls, isV2 });
  });

  return tests;
};

module.exports = {
  parseTests
};
