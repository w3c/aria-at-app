import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button, Table } from 'react-bootstrap';
import { unescape } from 'lodash';
import {
  parseListContent,
  parseSettingsContent
} from '../../TestRenderer/utils';
import {
  userCloseWindow,
  userOpenWindow
} from '../../../resources/aria-at-test-run.mjs';
import {
  TestRunExport,
  TestRunInputOutput
} from '../../../resources/aria-at-test-io-format.mjs';
import { TestWindow } from '../../../resources/aria-at-test-window.mjs';
import { evaluateAtNameKey } from '../../../utils/aria.js';
import commandsJson from '../../../resources/commands.json';
import supportJson from '../../../resources/support.json';
import { convertAssertionPriority } from 'shared';

const NumberedList = styled.ol`
  counter-reset: numbered-list;
  list-style: none;
  > li {
    counter-increment: numbered-list;
    position: relative;
    margin-bottom: 10px;
  }

  > li::before {
    content: counter(numbered-list);
    position: absolute;
    color: #78869c;
    font-size: 1em;
    --size: 25px;
    left: calc(-1 * var(--size) - 10px);
    line-height: var(--size);
    width: var(--size);
    height: var(--size);
    top: 2px;
    background: #edf6ff;
    border-radius: 50%;
    border: 1px solid #d5deec;
    text-align: center;
  }
`;

const InstructionsRenderer = ({
  test,
  testPageUrl,
  at,
  headingLevel = 2,
  testFormatVersion
}) => {
  const { renderableContent } = test;
  const [testRunExport, setTestRunExport] = useState();
  const [pageContent, setPageContent] = useState({
    instructions: {
      assertions: { assertions: [] },
      instructions: {
        instructions: [],
        strongInstructions: [],
        commands: { commands: [], description: '' }
      },
      openTestPage: { enabled: false }
    }
  });
  const setup = async () => {
    const testRunIO = new TestRunInputOutput();
    const configQueryParams = [['at', evaluateAtNameKey(at.name)]];

    testRunIO.setAllCommandsInputFromJSON(commandsJson);
    await testRunIO.setInputsFromCollectedTestAsync(renderableContent);
    testRunIO.setConfigInputFromQueryParamsAndSupport(configQueryParams);

    if (renderableContent.target?.referencePage) {
      const replaceIndex = testPageUrl.indexOf('reference/');
      // sync with proxy url expected for aria-at-app to work properly
      const constructedTestPageUrl =
        testPageUrl.substring(0, replaceIndex) +
        renderableContent.target?.referencePage;
      testRunIO.setPageUriInputFromPageUri(constructedTestPageUrl);
    } else testRunIO.setPageUriInputFromPageUri(testPageUrl);

    const testWindow = new TestWindow({
      ...testRunIO.testWindowOptions(),
      hooks: {
        windowOpened() {
          testRunExport.dispatch(userOpenWindow());
        },
        windowClosed() {
          testRunExport.dispatch(userCloseWindow());
        }
      }
    });

    const testRunExport = new TestRunExport({
      hooks: {
        openTestPage() {
          testWindow.open();
        },
        closeTestPage() {
          testWindow.close();
        }
      },
      resultsJSON: state => testRunIO.submitResultsJSON(state),
      state: testRunIO.testRunState()
    });
    setTestRunExport(testRunExport);
  };

  useEffect(() => {
    setup();
  }, []);

  useEffect(() => {
    if (testRunExport) {
      setPageContent(testRunExport.instructions());
    }
  }, [testRunExport]);

  let allInstructions;
  const isV2 = testFormatVersion === 2;
  let settingsContent = [];

  if (isV2) {
    // There is at least one defined 'setting' for the list of AT commands
    const commandSettingSpecified = renderableContent.commands.some(
      ({ settings }) => settings && settings !== 'defaultMode'
    );

    const defaultInstructions =
      renderableContent.target.at.raw.defaultConfigurationInstructionsHTML;
    const setupScriptDescription = `${supportJson.testPlanStrings.openExampleInstruction} ${renderableContent.target.setupScript.scriptDescription}`;
    const testInstructions = renderableContent.instructions.instructions;
    const settingsInstructions = `${
      supportJson.testPlanStrings.commandListPreface
    }${
      commandSettingSpecified
        ? ` ${supportJson.testPlanStrings.commandListSettingsPreface}`
        : ''
    }`;

    allInstructions = [
      defaultInstructions,
      setupScriptDescription + '.',
      testInstructions + ' ' + settingsInstructions
    ].map(e => unescape(e));
    settingsContent = parseSettingsContent(
      renderableContent.instructions.mode,
      renderableContent.target.at.raw.settings
    );
  } else {
    allInstructions = [
      ...pageContent.instructions.instructions.instructions,
      ...pageContent.instructions.instructions.strongInstructions,
      pageContent.instructions.instructions.commands.description
    ];
  }

  const commands = pageContent.instructions.instructions.commands.commands;
  const commandsContent = parseListContent(commands);

  const allInstructionsContent = parseListContent(
    allInstructions,
    commandsContent
  );

  const Heading = `h${headingLevel}`;

  return (
    <>
      <NumberedList>{allInstructionsContent}</NumberedList>
      {settingsContent.length ? settingsContent : null}

      {renderableContent.commands.map(
        ({ id, settings, assertionExceptions = [] }, i) => {
          const settingsScreenText = isV2
            ? renderableContent.target.at.raw.settings[settings]?.screenText ??
              ''
            : null;

          let mustCount = 0;
          let shouldCount = 0;
          let mayCount = 0;

          let assertions = [...renderableContent.assertions];

          assertionExceptions.forEach(exception => {
            const assertionIndex = assertions.findIndex(assertion => {
              return assertion.assertionId === exception.assertionId;
            });

            if (assertionIndex < 0) return;

            if (exception.priority === 0) {
              assertions.splice(assertionIndex, 1);
            } else {
              assertions[assertionIndex] = {
                ...assertions[assertionIndex],
                priority: exception.priority
              };
            }
          });

          // Filter out assertions that were originally set to 0 when declared through
          // tests.csv instead of *-commands.csv
          assertions = assertions.filter(({ priority }) => priority !== 0);

          assertions.forEach(({ priority }) => {
            const priorityString = convertAssertionPriority(priority);
            if (priorityString === 'MUST') mustCount += 1;
            if (priorityString === 'SHOULD') shouldCount += 1;
            if (priorityString === 'MAY') mayCount += 1;
          });

          const settingsScreenTextFormatted = settingsScreenText
            ? ` (${settingsScreenText})`
            : '';

          const scenarioTitle =
            `${renderableContent.commands[i].keystroke}` +
            `${settingsScreenTextFormatted}: ${mustCount} MUST, ` +
            `${shouldCount} SHOULD, ${mayCount} MAY Assertions`;

          const scenarioId =
            `${at.name}-test${test.rowNumber}-${id}-cmd${i}`.replaceAll(
              /[,+\s]+/g,
              '_'
            );

          if (isV2) {
            return (
              <React.Fragment key={`command-${id}-${i}`}>
                <Heading id={scenarioId}>{scenarioTitle}</Heading>
                <Table
                  key={`${id}-${i}`}
                  bordered
                  responsive
                  aria-labelledby={scenarioId}
                >
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Assertion Phrase</th>
                      <th>Assertion Statement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assertions.map(
                      ({
                        assertionPhrase,
                        assertionStatement,
                        priority,
                        assertionId
                      }) => (
                        <tr key={`${i}-${assertionId}`}>
                          <td>{convertAssertionPriority(priority)}</td>
                          <td>{assertionPhrase}</td>
                          <td>{assertionStatement}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={`command-${id}-${i}`}>
                <Heading id={scenarioId}>{scenarioTitle}</Heading>
                <Table
                  key={`${id}-${i}`}
                  bordered
                  responsive
                  aria-labelledby={scenarioId}
                >
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Assertion Statement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assertions.map(({ expectation, priority }) => (
                      <tr key={`${i}-${expectation}`}>
                        <td>{convertAssertionPriority(priority)}</td>
                        <td>{expectation}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </React.Fragment>
            );
          }
        }
      )}

      <Button
        disabled={!pageContent.instructions.openTestPage.enabled}
        onClick={pageContent.instructions.openTestPage.click}
      >
        {pageContent.instructions.openTestPage.button}
      </Button>
    </>
  );
};

InstructionsRenderer.propTypes = {
  test: PropTypes.object.isRequired,
  testPageUrl: PropTypes.string,
  at: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  testFormatVersion: PropTypes.number,
  headingLevel: PropTypes.number
};

export default InstructionsRenderer;
