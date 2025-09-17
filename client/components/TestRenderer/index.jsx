import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
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
import useTestRendererFocus from '../../hooks/useTestRendererFocus';

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
  commonIssueContent,
  isRerunReport = false
}) => {
  const { scenarioResults, test = {}, completedAt } = testResult;
  const { renderableContent } = test;

  const mounted = useRef(false);
  const [testRunExport, setTestRunExport] = useState();
  const [pageContent, setPageContent] = useState(null);
  const [testRendererState, setTestRendererState] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitCalled, setSubmitCalled] = useState(false);

  useTestRendererFocus(isSubmitted, pageContent);

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

    const NegativeSideEffectsMap = {
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
        hasNegativeSideEffect,
        negativeSideEffects,
        match,
        highlightRequired = false, // atOutput
        negativeSideEffectHighlightRequired = false
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

      // Historically, the value of `hasNegativeSideEffect` was not persisted in the
      // database and instead inferred from the presence of elements in the
      // `negativeSideEffects` array. Preserve the legacy behavior for test
      // plan runs which do not specify a value for `hasNegativeSideEffect`.
      if (hasNegativeSideEffect) {
        commands[i].unexpected.hasNegativeSideEffect = hasNegativeSideEffect;
      } else if (negativeSideEffects) {
        commands[i].unexpected.hasNegativeSideEffect =
          negativeSideEffects.length
            ? 'hasNegativeSideEffect'
            : 'doesNotHaveNegativeSideEffect';
      } else {
        commands[i].unexpected.hasNegativeSideEffect = 'notSet';
      }

      if (negativeSideEffects) {
        for (let k = 0; k < negativeSideEffects.length; k++) {
          /**
           * 0 = EXCESSIVELY_VERBOSE
           * 1 = UNEXPECTED_CURSOR_POSITION
           * 2 = SLUGGISH
           * 3 = AT_CRASHED
           * 4 = BROWSER_CRASHED
           * 5 = OTHER
           */

          const { id, details, impact, highlightRequired } =
            negativeSideEffects[k];

          // Capture positional index of negative side effect based on id
          const index = NegativeSideEffectsMap[id];

          commands[i].unexpected.behaviors[index].checked = true;
          commands[i].unexpected.behaviors[index].more.value = details;
          commands[i].unexpected.behaviors[index].impact = impact.toUpperCase();
          commands[i].unexpected.behaviors[index].more.highlightRequired =
            highlightRequired;
        }
      }

      commands[i].unexpected.highlightRequired =
        negativeSideEffectHighlightRequired;
      // Attach the match metadata onto the command for downstream components
      commands[i].match = match || null;
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

        const negativeSideEffectError =
          item.negativeSideEffects.description[1].highlightRequired;
        if (negativeSideEffectError) return true;

        const { failChoice } = item.negativeSideEffects;
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
          </section>
          <section>
            <h2>{pageContent.results.header.header}</h2>
            <p className={styles.descriptionText}>
              {pageContent.results.header.description}
            </p>
            {pageContent.results.commands.map((value, commandIndex) => {
              const scenarioMatch =
                testResult?.scenarioResults?.[commandIndex]?.match || null;
              const matchAtName = at?.name || null;
              return (
                <CommandResults
                  key={commandIndex}
                  header={value.header}
                  atOutput={value.atOutput}
                  untestable={value.untestable}
                  assertions={value.assertions}
                  negativeSideEffects={value.negativeSideEffects}
                  assertionsHeader={value.assertionsHeader}
                  commonIssueContent={commonIssueContent}
                  commandIndex={commandIndex}
                  isSubmitted={isSubmitted}
                  isReviewingBot={isReviewingBot}
                  isReadOnly={isReadOnly}
                  isRerunReport={isRerunReport}
                  match={scenarioMatch}
                  historicalAtName={matchAtName}
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
  commonIssueContent: PropTypes.object,
  isRerunReport: PropTypes.bool,
  historicalTestResult: PropTypes.object,
  historicalAtName: PropTypes.string,
  historicalAtVersion: PropTypes.string
};

export default TestRenderer;
