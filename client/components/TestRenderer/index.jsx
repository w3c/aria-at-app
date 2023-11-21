import React, {
    Fragment,
    useEffect,
    useLayoutEffect,
    useState,
    useRef
} from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { unescape } from 'lodash';
import TestPlanResultsTable from '../common/TestPlanResultsTable';
import { calculateAssertionsCount } from '../common/TestPlanResultsTable/utils';
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
import OutputTextArea from './OutputTextArea';
import supportJson from '../../resources/support.json';
import commandsJson from '../../resources/commands.json';
import AssertionsFieldset from './AssertionsFieldset';

const Container = styled.div`
    width: 100%;

    border: black solid 2px;
    border-radius: 0.25rem;
    padding: 1rem;

    font-size: 14px;
`;

const ErrorSection = styled.section`
    display: ${({ hasErrors }) => (hasErrors ? 'block' : 'none')};
`;

const InstructionsSection = styled.section``;

const HeadingText = styled.h1``;

const SubHeadingText = styled.h2`
    &#instruction-list-heading {
        margin-top: 0;
    }
`;

const InnerSectionHeadingText = styled.h3``;

const Text = styled.p`
    > textarea {
        width: 100%;
    }
`;

export const Feedback = styled.span`
    &.required:not(.highlight-required) {
        display: none;
    }

    &.required.highlight-required {
        color: red;
    }

    &.off-screen {
        position: absolute !important;
        height: 1px;
        width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap;
    }
`;

export const Fieldset = styled.fieldset`
    display: block;
    margin-inline-start: 2px;
    margin-inline-end: 2px;
    padding-block-start: 0.35em;
    padding-inline-start: 0.75em;
    padding-inline-end: 0.75em;
    padding-block-end: 0.75em;

    min-inline-size: min-content;

    border-width: 2px;
    border-style: groove;
    border-color: threedface;
    border-image: initial;

    > legend {
        display: block;

        float: inherit;
        width: auto;
        margin: 0;
        font-size: initial;

        padding-inline-start: 2px;
        padding-inline-end: 2px;
        border-width: initial;
        border-style: none;
        border-color: initial;
        border-image: initial;
    }

    > div {
        > label {
            display: initial;
            vertical-align: middle;
        }

        > input[type='radio'] {
            margin: 0 5px 0 0;
            vertical-align: middle;
        }

        > input[type='checkbox'] {
            margin: 0 5px 0 0;
            vertical-align: middle;
        }
    }

    &.problem-select {
        margin-top: 1em;
        margin-left: 1em;

        > label {
            display: initial;
            vertical-align: middle;
        }

        > input[type='checkbox'] {
            margin: 0 5px 0 0;
            vertical-align: middle;
        }

        > div {
            > label {
                margin-right: 5px;
            }
        }
    }
`;

const NumberedList = styled.ol``;

const Button = styled.button``;

const ResultsSection = styled.section``;

const ErrorComponent = ({ hasErrors = false }) => {
    return (
        <ErrorSection id="errors" hasErrors={hasErrors}>
            <h2>Test cannot be performed due to error(s)!</h2>
            <ul />
            <hr />
        </ErrorSection>
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
    isEdit = false,
    setIsRendererReady = false
}) => {
    const { scenarioResults, test = {}, completedAt } = testResult;
    const { renderableContent } = test;

    const mounted = useRef(false);
    const [testRunExport, setTestRunExport] = useState();
    const [pageContent, setPageContent] = useState(null);
    const [testRendererState, setTestRendererState] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [submitCalled, setSubmitCalled] = useState(false);

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

        if (
            !scenarioResults.length ||
            commands.length !== scenarioResults.length
        ) {
            return state;
        }

        for (let i = 0; i < scenarioResults.length; i++) {
            const {
                output,
                assertionResults,
                unexpectedBehaviors,
                highlightRequired = false, // atOutput
                unexpectedBehaviorHighlightRequired = false
            } = scenarioResults[i];

            if (output) commands[i].atOutput.value = output;
            commands[i].atOutput.highlightRequired = highlightRequired;

            for (let j = 0; j < assertionResults.length; j++) {
                const assertionResult = assertionResults[j];
                const { highlightRequired } = assertionResult;

                if (assertionResult.passed)
                    commands[i].assertions[j].result = 'pass';
                else if (assertionResult.failedReason === 'NO_OUTPUT')
                    commands[i].assertions[j].result = 'failMissing';
                else if (assertionResult.failedReason === 'INCORRECT_OUTPUT')
                    commands[i].assertions[j].result = 'failIncorrect';
                else commands[i].assertions[j].result = 'notSet';

                commands[i].assertions[j].highlightRequired = highlightRequired;
            }

            if (unexpectedBehaviors && unexpectedBehaviors.length) {
                commands[i].unexpected.hasUnexpected = 'hasUnexpected';

                for (let k = 0; k < unexpectedBehaviors.length; k++) {
                    /**
                     * 0 = EXCESSIVELY_VERBOSE
                     * 1 = UNEXPECTED_CURSOR_POSITION
                     * 2 = SLUGGISH
                     * 3 = AT_CRASHED
                     * 4 = BROWSER_CRASHED
                     * 5 = OTHER
                     */
                    const unexpectedBehavior = unexpectedBehaviors[k];
                    if (unexpectedBehavior.id === 'EXCESSIVELY_VERBOSE')
                        commands[i].unexpected.behaviors[0].checked = true;
                    if (unexpectedBehavior.id === 'UNEXPECTED_CURSOR_POSITION')
                        commands[i].unexpected.behaviors[1].checked = true;
                    if (unexpectedBehavior.id === 'SLUGGISH')
                        commands[i].unexpected.behaviors[2].checked = true;
                    if (unexpectedBehavior.id === 'AT_CRASHED')
                        commands[i].unexpected.behaviors[3].checked = true;
                    if (unexpectedBehavior.id === 'BROWSER_CRASHED')
                        commands[i].unexpected.behaviors[4].checked = true;
                    if (unexpectedBehavior.id === 'OTHER') {
                        commands[i].unexpected.behaviors[5].checked = true;
                        commands[i].unexpected.behaviors[5].more.value =
                            unexpectedBehavior.otherUnexpectedBehaviorText;
                        commands[
                            i
                        ].unexpected.behaviors[5].more.highlightRequired =
                            unexpectedBehavior.highlightRequired;
                    }
                }
            } else if (unexpectedBehaviors)
                // but not populated
                commands[i].unexpected.hasUnexpected = 'doesNotHaveUnexpected';
            else commands[i].unexpected.hasUnexpected = 'notSet';

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
                    submitResult &&
                    submitResult.resultsJSON &&
                    submitResult.results
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

            // Use to validate whether or not errors exist on page. Error
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
                const atOutputError =
                    item.atOutput.description[1].highlightRequired;
                if (atOutputError) return true;

                const unexpectedBehaviorError =
                    item.unexpectedBehaviors.description[1].highlightRequired;
                if (unexpectedBehaviorError) return true;

                const { failChoice } = item.unexpectedBehaviors;
                const failChoiceOptionsMoreError =
                    failChoice.options.options.some(item => {
                        if (item.more)
                            return item.more.description[1].highlightRequired;
                        else return false;
                    });
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
                renderableContent.target.at.raw
                    .defaultConfigurationInstructionsHTML;
            const setupScriptDescription = `${supportJson.testPlanStrings.openExampleInstruction} ${renderableContent.target.setupScript.scriptDescription}`;
            const testInstructions =
                renderableContent.instructions.instructions;
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

        const commands =
            pageContent.instructions.instructions.commands.commands;
        const commandsContent = parseListContent(commands);
        const content = parseListContent(allInstructions, commandsContent);

        return (
            <>
                <NumberedList aria-labelledby={labelIdRef}>
                    {content}
                </NumberedList>
                {settingsContent.length ? settingsContent : null}
            </>
        );
    };

    InstructionsContent.propTypes = { labelIdRef: PropTypes.string };

    const AssertionsContent = ({ labelIdRef }) => {
        const assertions = [...pageContent.instructions.assertions.assertions];
        const content = parseListContent(assertions);

        return (
            <NumberedList aria-labelledby={labelIdRef}>{content}</NumberedList>
        );
    };

    AssertionsContent.propTypes = { labelIdRef: PropTypes.string };

    const SubmitResultsContent = () => {
        const { results } = submitResult;
        const { header } = results;

        const { passedAssertionsCount, failedAssertionsCount } =
            calculateAssertionsCount(testResult);

        return (
            <>
                <HeadingText>{header}</HeadingText>
                <SubHeadingText id="overallstatus">
                    Test Results&nbsp;(
                    {passedAssertionsCount} passed,&nbsp;
                    {failedAssertionsCount} failed)
                </SubHeadingText>
                <TestPlanResultsTable
                    test={{ title: header, at }}
                    testResult={testResult}
                />
            </>
        );
    };

    // pageContent to render instructions; submitResult.resultsJSON indicates results have been submitted
    if (!pageContent) return null;

    return (
        <Container>
            {!isEdit &&
            submitResult &&
            submitResult.resultsJSON &&
            submitResult.results ? (
                <SubmitResultsContent />
            ) : (
                <>
                    <ErrorComponent
                        hasErrors={
                            pageContent.errors && pageContent.errors.length
                        }
                    />
                    <InstructionsSection>
                        <SubHeadingText id="instruction-list-heading">
                            Instructions
                        </SubHeadingText>
                        <InstructionsContent labelIdRef="instruction-list-heading" />
                        <Button
                            disabled={
                                !pageContent.instructions.openTestPage.enabled
                            }
                            onClick={
                                pageContent.instructions.openTestPage.click
                            }
                        >
                            {pageContent.instructions.openTestPage.button}
                        </Button>
                    </InstructionsSection>
                    <ResultsSection>
                        <SubHeadingText>
                            {pageContent.results.header.header}
                        </SubHeadingText>
                        <Text>{pageContent.results.header.description}</Text>
                        {pageContent.results.commands.map(
                            (value, commandIndex) => {
                                const {
                                    header,
                                    atOutput,
                                    assertions,
                                    unexpectedBehaviors,
                                    assertionsHeader
                                } = value;
                                return (
                                    <Fragment
                                        key={`AtOutputKey_${commandIndex}`}
                                    >
                                        <InnerSectionHeadingText>
                                            {header}
                                        </InnerSectionHeadingText>
                                        <OutputTextArea
                                            commandIndex={commandIndex}
                                            atOutput={atOutput}
                                            isSubmitted={isSubmitted}
                                        />
                                        <AssertionsFieldset
                                            assertions={assertions}
                                            commandIndex={commandIndex}
                                            assertionsHeader={assertionsHeader}
                                        />
                                        {/*Unexpected Behaviors*/}
                                        <Fieldset
                                            id={`cmd-${commandIndex}-problems`}
                                        >
                                            <legend>
                                                {
                                                    unexpectedBehaviors
                                                        .description[0]
                                                }
                                            </legend>
                                            {isSubmitted && (
                                                <Feedback
                                                    className={`${
                                                        unexpectedBehaviors
                                                            .description[1]
                                                            .required &&
                                                        'required'
                                                    } ${
                                                        unexpectedBehaviors
                                                            .description[1]
                                                            .highlightRequired &&
                                                        'highlight-required'
                                                    }`}
                                                >
                                                    {
                                                        unexpectedBehaviors
                                                            .description[1]
                                                            .description
                                                    }
                                                </Feedback>
                                            )}
                                            <div>
                                                <input
                                                    key={`Problem__${commandIndex}__true`}
                                                    type="radio"
                                                    id={`problem-${commandIndex}-true`}
                                                    name={`problem-${commandIndex}`}
                                                    autoFocus={
                                                        isSubmitted &&
                                                        unexpectedBehaviors
                                                            .passChoice.focus
                                                    }
                                                    defaultChecked={
                                                        unexpectedBehaviors
                                                            .passChoice.checked
                                                    }
                                                    onClick={
                                                        unexpectedBehaviors
                                                            .passChoice.click
                                                    }
                                                />
                                                <label
                                                    id={`problem-${commandIndex}-true-label`}
                                                    htmlFor={`problem-${commandIndex}-true`}
                                                >
                                                    {
                                                        unexpectedBehaviors
                                                            .passChoice.label
                                                    }
                                                </label>
                                            </div>
                                            <div>
                                                <input
                                                    key={`Problem__${commandIndex}__false`}
                                                    type="radio"
                                                    id={`problem-${commandIndex}-false`}
                                                    name={`problem-${commandIndex}`}
                                                    autoFocus={
                                                        isSubmitted &&
                                                        unexpectedBehaviors
                                                            .failChoice.focus
                                                    }
                                                    defaultChecked={
                                                        unexpectedBehaviors
                                                            .failChoice.checked
                                                    }
                                                    onClick={
                                                        unexpectedBehaviors
                                                            .failChoice.click
                                                    }
                                                />
                                                <label
                                                    id={`problem-${commandIndex}-false-label`}
                                                    htmlFor={`problem-${commandIndex}-false`}
                                                >
                                                    {
                                                        unexpectedBehaviors
                                                            .failChoice.label
                                                    }
                                                </label>
                                            </div>

                                            <Fieldset
                                                className="problem-select"
                                                hidden={
                                                    !unexpectedBehaviors
                                                        .failChoice.checked
                                                }
                                            >
                                                <legend>
                                                    {
                                                        unexpectedBehaviors
                                                            .failChoice.options
                                                            .header
                                                    }
                                                </legend>
                                                {unexpectedBehaviors.failChoice.options.options.map(
                                                    (option, optionIndex) => {
                                                        const {
                                                            checked,
                                                            focus,
                                                            description,
                                                            more,
                                                            change
                                                        } = option;
                                                        return (
                                                            <Fragment
                                                                key={`AssertionOptionsKey_${optionIndex}`}
                                                            >
                                                                <input
                                                                    key={`${description}__${commandIndex}`}
                                                                    type="checkbox"
                                                                    value={
                                                                        description
                                                                    }
                                                                    id={`${description}-${commandIndex}`}
                                                                    className={`undesirable-${commandIndex}`}
                                                                    tabIndex={
                                                                        optionIndex ===
                                                                        0
                                                                            ? 0
                                                                            : -1
                                                                    }
                                                                    autoFocus={
                                                                        isSubmitted &&
                                                                        focus
                                                                    }
                                                                    defaultChecked={
                                                                        checked
                                                                    }
                                                                    onClick={e =>
                                                                        change(
                                                                            e
                                                                                .target
                                                                                .checked
                                                                        )
                                                                    }
                                                                />
                                                                <label
                                                                    htmlFor={`${description}-${commandIndex}`}
                                                                >
                                                                    {
                                                                        description
                                                                    }
                                                                </label>
                                                                <br />
                                                                {more && (
                                                                    <div>
                                                                        <label
                                                                            htmlFor={`${description}-${commandIndex}-input`}
                                                                        >
                                                                            {
                                                                                more
                                                                                    .description[0]
                                                                            }
                                                                            {isSubmitted && (
                                                                                <Feedback
                                                                                    className={`${
                                                                                        more
                                                                                            .description[1]
                                                                                            .required &&
                                                                                        'required'
                                                                                    } ${
                                                                                        more
                                                                                            .description[1]
                                                                                            .highlightRequired &&
                                                                                        'highlight-required'
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        more
                                                                                            .description[1]
                                                                                            .description
                                                                                    }
                                                                                </Feedback>
                                                                            )}
                                                                        </label>
                                                                        <input
                                                                            key={`${description}__${commandIndex}__input`}
                                                                            type="text"
                                                                            id={`${description}-${commandIndex}-input`}
                                                                            name={`${description}-${commandIndex}-input`}
                                                                            className={`undesirable-${description.toLowerCase()}-input`}
                                                                            autoFocus={
                                                                                isSubmitted &&
                                                                                more.focus
                                                                            }
                                                                            value={
                                                                                more.value
                                                                            }
                                                                            onChange={e =>
                                                                                more.change(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !checked
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    }
                                                )}
                                            </Fieldset>
                                        </Fieldset>
                                    </Fragment>
                                );
                            }
                        )}
                    </ResultsSection>
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
        </Container>
    );
};

ErrorComponent.propTypes = {
    hasErrors: PropTypes.bool
};

TestRenderer.propTypes = {
    at: PropTypes.object,
    testResult: PropTypes.object,
    support: PropTypes.object,
    testPageUrl: PropTypes.string,
    testFormatVersion: PropTypes.number,
    testRunStateRef: PropTypes.any,
    recentTestRunStateRef: PropTypes.any,
    testRunResultRef: PropTypes.any,
    submitButtonRef: PropTypes.any,
    isSubmitted: PropTypes.bool,
    isEdit: PropTypes.bool,
    setIsRendererReady: PropTypes.func
};

export default TestRenderer;
