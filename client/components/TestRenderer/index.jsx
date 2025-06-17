import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { unescape } from 'lodash';
import { getMetrics } from 'shared';
import TestPlanResultsTable from '../common/TestPlanResultsTable';
import { parseListContent, parseSettingsContent } from './utils.js';
import {
  userCloseWindow,
  userOpenWindow
} from '../../resources/aria-at-test-run.mjs';
import {
  TestRunExport,
  TestRunInputOutput
} from '../../resources/aria-at-test-io-format.mjs';
import { TestWindow } from '../../resources/aria-at-test-window.mjs';
import { evaluateAtNameKey } from '../../utils/aria';
import summarizeAssertions from '../../utils/summarizeAssertions.js';
import CommandResults from './CommandResults';
import supportJson from '../../resources/support.json';
import commandsJson from '../../resources/commands.json';
import { AtPropType, TestResultPropType } from '../common/proptypes/index.js';
import styles from './TestRenderer.module.css';

const ErrorComponent = ({ hasErrors = false }) => {
  return (
    <section
      id="errors"
      className={clsx(
        styles.errorSection,
        hasErrors ? styles.visible : styles.hidden
      )}
    >
      <h2>Test cannot be performed due to error(s)</h2>
      <ul />
      <hr />
    </section>
  );
};

const TestRenderer = ({
  at,
  testResult = {},
  testPageUrl,
  testFormatVersion,
  testRunStateRef,
  recentTestRunStateRef,
  testRunResultRef,
  submitButtonRef,
  isSubmitted = false,
  isReviewingBot = false,
  isReadOnly = false,
  isEdit = false,
  setIsRendererReady = false,
  commonIssueContent
}) => {
  const { scenarioResults, test = {}, completedAt } = testResult;
  const { renderableContent } = test;

  const mounted = useRef(false);
  const [testRunExport, setTestRunExport] = useState();
  const [pageContent, setPageContent] = useState(null);
  const [testRendererState, setTestRendererState] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitCalled, setSubmitCalled] = useState(false);

  const [captureSocket, setCaptureSocket] = useState(null);
  const [capturedUtterances, setCapturedUtterances] = useState([]);
  const wsRef = useRef(null);
  const [, setWsConnected] = useState(false);
  const [, setWsError] = useState(null);

  // Proof of concept in case we need to inject buttons ourselves on the test
  // page
  // May not be needed outside the testing of this prototype
  const injectButton = testWindow => {
    if (!testWindow || !testWindow.document) return;

    // Create button container if it doesn't exist
    let container = testWindow.document.getElementById(
      'aria-at-injected-buttons'
    );
    if (!container) {
      container = testWindow.document.createElement('div');
      container.id = 'aria-at-injected-buttons';
      container.style.position = 'fixed';
      container.style.top = '10px';
      container.style.right = '10px';
      container.style.zIndex = '9999';
      testWindow.document.body.appendChild(container);
    }

    // Create and add the open on Android button
    const androidButton = testWindow.document.createElement('button');
    androidButton.textContent = 'Open on Android Device';
    androidButton.style.padding = '8px 16px';
    androidButton.style.margin = '4px';
    androidButton.style.backgroundColor = '#2196F3';
    androidButton.style.color = 'white';
    androidButton.style.border = 'none';
    androidButton.style.borderRadius = '4px';
    androidButton.style.cursor = 'pointer';

    androidButton.onclick = async () => {
      await runAndroidScripts();
    };

    container.appendChild(androidButton);
  };

  const startCaptureUtterances = useCallback(async () => {
    if (wsRef.current) {
      console.error('WebSocket connection already exists, closing...');
      wsRef.current.close();
    }

    const sessionId = Date.now().toString();
    // eslint-disable-next-line no-console
    console.info('Starting capture with session ID:', sessionId);

    // Update WebSocket URL to include path and session ID
    const wsUrl = `wss://${window.location.hostname}:8000/ws?sessionId=${sessionId}`;
    // const wsUrl = `ws://${window.location.hostname}:8000/ws?sessionId=${sessionId}`;
    // const wsUrl = `ws://https://7c3f-2600-1700-4aa1-c810-6143-faa0-da66-1efb.ngrok-free.app/ws?sessionId=${sessionId}`;
    // const wsUrl = `ws://192.168.1.183:3000/ws?sessionId=${sessionId}`;

    // eslint-disable-next-line no-console
    console.info('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // eslint-disable-next-line no-console
      console.info('WebSocket connection opened');

      setWsConnected(true);
      const startMessage = { type: 'startCapture' };

      // eslint-disable-next-line no-console
      console.info('Sending start utterances capture message:', startMessage);
      ws.send(JSON.stringify(startMessage));
    };

    ws.onmessage = event => {
      // eslint-disable-next-line no-console
      console.info('Received WebSocket message:', event.data);
      try {
        const data = JSON.parse(event.data);
        // eslint-disable-next-line no-console
        console.info('Parsed message data:', data);

        if (data.type === 'utterance') {
          setCapturedUtterances(prev => [...prev, data.data]);
        } else if (data.type === 'error') {
          console.error('Capture error', data.error);
          setWsError(data.error);
        } else if (data.type === 'started') {
          // eslint-disable-next-line no-console
          console.info('Capture started', data.message);
        } else if (data.type === 'stopped') {
          // eslint-disable-next-line no-console
          console.info('Capture stopped', data.message);
        } else if (data.type === 'exit') {
          // eslint-disable-next-line no-console
          console.info('Capture process exited with code:', data.code);
        } else {
          // eslint-disable-next-line no-console
          console.info('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = error => {
      console.error('WebSocket error', error);
      setWsError('WebSocket connection error');
      setWsConnected(false);
    };

    ws.onclose = event => {
      // eslint-disable-next-line no-console
      console.info('WebSocket connection closed', event.code, event.reason);
      setWsConnected(false);
      wsRef.current = null;
    };
  }, []);

  const stopCaptureUtterances = useCallback(() => {
    if (captureSocket) {
      captureSocket.send(JSON.stringify({ type: 'stopCapture' }));
      captureSocket.close();
      setCaptureSocket(null);
    }
  }, [captureSocket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (captureSocket) captureSocket.close();
    };
  }, [captureSocket]);

  const runAndroidScripts = async () => {
    // Get the URL from the test page
    let url = renderableContent.target?.referencePage
      ? `${testPageUrl.substring(0, testPageUrl.indexOf('reference/'))}${
          renderableContent.target.referencePage
        }`
      : testPageUrl;
    url = `${window.location.hostname}${url}`;
    // url = `https://7c3f-2600-1700-4aa1-c810-6143-faa0-da66-1efb.ngrok-free.app${url}`;
    // url = `192.168.1.183:3000${url}`;

    try {
      const response = await fetch('/api/scripts/enable-talkback');
      if (!response.ok) {
        throw new Error(
          `Failed to execute enable-talkback script: ${response.status}`
        );
      }
      await response.json();
    } catch (error) {
      console.error('enable.talkback.error', error);
    }

    try {
      const response = await fetch('/api/scripts/open-web-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(
          `Failed to execute open-web-page script: ${response.status}`
        );
      }
      await response.json();
    } catch (error) {
      console.error('open.web.page.error', error);
    }

    // Start capturing utterances via WebSocket
    await startCaptureUtterances();
  };

  const setup = async () => {
    const testRunIO = new TestRunInputOutput();

    // Array.from(new URL(document.location).searchParams)
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

    const _state = remapState(testRunIO.testRunState(), scenarioResults);

    const testWindow = new TestWindow({
      ...testRunIO.testWindowOptions(),
      hooks: {
        windowOpened() {
          testRunExport.dispatch(userOpenWindow());
        },
        windowClosed() {
          testRunExport.dispatch(userCloseWindow());
          // Stop capturing utterances when the test window is closed
          stopCaptureUtterances();
        },
        windowPrepared() {
          injectButton(testWindow.window);
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
      state: _state
    });
    mounted.current && setTestRendererState(_state);
    mounted.current && setTestRunExport(testRunExport);
  };

  const remapState = (state, scenarioResults = []) => {
    const { commands } = state;

    if (!scenarioResults.length || commands.length !== scenarioResults.length) {
      return state;
    }

    const UnexpectedBehaviorsMap = {
      EXCESSIVELY_VERBOSE: 0,
      UNEXPECTED_CURSOR_POSITION: 1,
      SLUGGISH: 2,
      AT_CRASHED: 3,
      BROWSER_CRASHED: 4,
      OTHER: 5
    };

    for (let i = 0; i < scenarioResults.length; i++) {
      let {
        output,
        untestable,
        untestableHighlightRequired,
        assertionResults,
        hasUnexpected,
        unexpectedBehaviors,
        highlightRequired = false, // atOutput
        unexpectedBehaviorHighlightRequired = false
      } = scenarioResults[i];

      if (output) commands[i].atOutput.value = output;
      commands[i].atOutput.highlightRequired = highlightRequired;

      if (untestable) commands[i].untestable.value = untestable;
      commands[i].untestable.highlightRequired = !!untestableHighlightRequired;

      // Required because assertionResults can now be returned without an id if there is a 0-priority exception
      // applied
      assertionResults = assertionResults.filter(el => !!el.id);

      for (let j = 0; j < assertionResults.length; j++) {
        const { passed, highlightRequired, assertion } = assertionResults[j];

        let assertionForCommandIndex = commands[i].assertions.findIndex(
          ({ description }) => description === assertion?.text
        );
        commands[i].assertions[assertionForCommandIndex].result = passed;
        commands[i].assertions[assertionForCommandIndex].highlightRequired =
          highlightRequired;
      }

      // Historically, the value of `hasUnexpected` was not persisted in the
      // database and instead inferred from the presence of elements in the
      // `unexpectedBehaviors` array. Preserve the legacy behavior for test
      // plan runs which do not specify a value for `hasUnexpected`.
      if (hasUnexpected) {
        commands[i].unexpected.hasUnexpected = hasUnexpected;
      } else if (unexpectedBehaviors) {
        commands[i].unexpected.hasUnexpected = unexpectedBehaviors.length
          ? 'hasUnexpected'
          : 'doesNotHaveUnexpected';
      } else {
        commands[i].unexpected.hasUnexpected = 'notSet';
      }

      if (unexpectedBehaviors) {
        for (let k = 0; k < unexpectedBehaviors.length; k++) {
          /**
           * 0 = EXCESSIVELY_VERBOSE
           * 1 = UNEXPECTED_CURSOR_POSITION
           * 2 = SLUGGISH
           * 3 = AT_CRASHED
           * 4 = BROWSER_CRASHED
           * 5 = OTHER
           */

          const { id, details, impact, highlightRequired } =
            unexpectedBehaviors[k];

          // Capture positional index of unexpected behavior based on id
          const index = UnexpectedBehaviorsMap[id];

          commands[i].unexpected.behaviors[index].checked = true;
          commands[i].unexpected.behaviors[index].more.value = details;
          commands[i].unexpected.behaviors[index].impact = impact.toUpperCase();
          commands[i].unexpected.behaviors[index].more.highlightRequired =
            highlightRequired;
        }
      }

      commands[i].unexpected.highlightRequired =
        unexpectedBehaviorHighlightRequired;
    }

    return { ...state, commands, currentUserAction: 'validateResults' };
  };

  useEffect(() => {
    (async () => {
      mounted.current = true;
      await setup();
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (testRunExport) {
      testRunExport.observe(result => {
        const { state: newState } = result;
        const pageContent = testRunExport.instructions();
        const submitResult = testRunExport.testPageAndResults();

        setPageContent(pageContent);
        setSubmitResult(submitResult);

        testRunStateRef.current = newState;
        recentTestRunStateRef.current = newState;
        testRunResultRef.current =
          submitResult && submitResult.resultsJSON && submitResult.results
            ? submitResult
            : null;
      });

      setPageContent(testRunExport.instructions());
    }

    testRunStateRef.current = testRendererState;
    recentTestRunStateRef.current = testRendererState;
    setIsRendererReady(true);
  }, [testRunExport]);

  useEffect(() => {
    if (!submitCalled && completedAt && pageContent) {
      testRunStateRef.current = testRendererState;
      recentTestRunStateRef.current = testRendererState;
      pageContent.submit.click();
      setSubmitCalled(true);
    }
    return () => {
      setSubmitCalled(false);

      // Use to validate whether errors exist on the page. Error
      // feedback may be erased on submit otherwise
      if (
        !checkStateForErrors(testRunStateRef.current) &&
        !checkPageContentForErrors(pageContent)
      )
        testRunStateRef.current = null;
    };
  }, [pageContent]);

  const checkStateForErrors = state => {
    if (state) {
      const { commands } = state;
      // short circuit all checks
      return commands.some(item => {
        const atOutputError = item.atOutput.highlightRequired;
        if (atOutputError) return true;

        const untestableError = item.untestable.highlightRequired;
        if (untestableError) return true;

        const unexpectedError = item.unexpected.highlightRequired;
        if (unexpectedError) return true;

        const { behaviors } = item.unexpected;
        const uncheckedBehaviorsMoreError = behaviors.some(item => {
          if (item.more) return item.more.highlightRequired;
          return false;
        });
        if (uncheckedBehaviorsMoreError) return true;
        return false;
      });
    }
    return false;
  };

  const checkPageContentForErrors = pageContent => {
    if (pageContent) {
      const { commands } = pageContent.results;
      // short circuit all checks
      return commands.some(item => {
        const atOutputError = item.atOutput.description[1].highlightRequired;
        if (atOutputError) return true;

        const untestableError =
          item.untestable.description[1].highlightRequired;
        if (untestableError) return true;

        const unexpectedBehaviorError =
          item.unexpectedBehaviors.description[1].highlightRequired;
        if (unexpectedBehaviorError) return true;

        const { failChoice } = item.unexpectedBehaviors;
        const failChoiceOptionsMoreError = failChoice.options.options.some(
          item => {
            if (item.more) return item.more.description[1].highlightRequired;
            else return false;
          }
        );
        if (failChoiceOptionsMoreError) return true;
        return false;
      });
    }
    return false;
  };

  const InstructionsContent = ({ labelIdRef }) => {
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
    const content = parseListContent(allInstructions, commandsContent);

    return (
      <>
        <ol aria-labelledby={labelIdRef}>{content}</ol>
        {settingsContent.length ? settingsContent : null}
      </>
    );
  };

  InstructionsContent.propTypes = { labelIdRef: PropTypes.string };

  const AssertionsContent = ({ labelIdRef }) => {
    const assertions = [...pageContent.instructions.assertions.assertions];
    const content = parseListContent(assertions);

    return <ol aria-labelledby={labelIdRef}>{content}</ol>;
  };

  AssertionsContent.propTypes = { labelIdRef: PropTypes.string };

  const SubmitResultsContent = () => {
    const { results } = submitResult;
    const { header } = results;

    const assertionsSummary = summarizeAssertions(
      getMetrics({
        testResult
      })
    );

    return (
      <>
        <h1>{header}</h1>
        <h2 id="overallstatus">Test Results&nbsp;({assertionsSummary})</h2>
        <TestPlanResultsTable
          test={{ id: test.id, title: header, at }}
          testResult={testResult}
        />
      </>
    );
  };

  // pageContent to render instructions; submitResult.resultsJSON indicates results have been submitted
  if (!pageContent) return null;

  return (
    <div className={styles.testRendererContainer}>
      {!isEdit &&
      submitResult &&
      submitResult.resultsJSON &&
      submitResult.results ? (
        <SubmitResultsContent />
      ) : (
        <>
          <ErrorComponent
            hasErrors={pageContent.errors && pageContent.errors.length}
          />
          <section>
            <h2
              id="instruction-list-heading"
              className={styles.instructionsHeading}
            >
              Instructions
            </h2>
            <InstructionsContent labelIdRef="instruction-list-heading" />
            <button
              disabled={!pageContent.instructions.openTestPage.enabled}
              onClick={pageContent.instructions.openTestPage.click}
            >
              {pageContent.instructions.openTestPage.button}
            </button>
            <button
              disabled={!pageContent.instructions.openTestPage.enabled}
              onClick={async () => {
                await runAndroidScripts();
              }}
            >
              Open Test Page on Android Device
            </button>
            {capturedUtterances.length > 0 && (
              <div className={styles.captureOutput}>
                <h3>Captured Utterances:</h3>
                <pre>{capturedUtterances.join('\n')}</pre>
              </div>
            )}
          </section>
          <section>
            <h2>{pageContent.results.header.header}</h2>
            <p className={styles.descriptionText}>
              {pageContent.results.header.description}
            </p>
            {pageContent.results.commands.map((value, commandIndex) => {
              return (
                <CommandResults
                  key={commandIndex}
                  header={value.header}
                  atOutput={value.atOutput}
                  untestable={value.untestable}
                  assertions={value.assertions}
                  unexpectedBehaviors={value.unexpectedBehaviors}
                  assertionsHeader={value.assertionsHeader}
                  commonIssueContent={commonIssueContent}
                  commandIndex={commandIndex}
                  isSubmitted={isSubmitted}
                  isReviewingBot={isReviewingBot}
                  isReadOnly={isReadOnly}
                />
              );
            })}
          </section>
          <button
            ref={submitButtonRef}
            type="button"
            hidden
            onClick={() => {
              testRunStateRef.current = testRendererState;
              recentTestRunStateRef.current = testRendererState;
              pageContent.submit.click();
            }}
          >
            {pageContent.submit.button}
          </button>
        </>
      )}
    </div>
  );
};

ErrorComponent.propTypes = {
  hasErrors: PropTypes.bool
};

TestRenderer.propTypes = {
  at: AtPropType,
  testResult: TestResultPropType,
  support: PropTypes.object,
  testPageUrl: PropTypes.string,
  testFormatVersion: PropTypes.number,
  testRunStateRef: PropTypes.any,
  recentTestRunStateRef: PropTypes.any,
  testRunResultRef: PropTypes.any,
  submitButtonRef: PropTypes.any,
  isSubmitted: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isEdit: PropTypes.bool,
  isReviewingBot: PropTypes.bool,
  setIsRendererReady: PropTypes.func,
  commonIssueContent: PropTypes.object
};

export default TestRenderer;
