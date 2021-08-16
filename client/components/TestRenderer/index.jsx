import React, { Fragment, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import {
    userCloseWindow,
    userOpenWindow
} from '../../resources/aria-at-test-run.mjs';
import {
    TestRunExport,
    TestRunInputOutput
} from '../../resources/aria-at-test-io-format.mjs';
import { TestWindow } from '../../resources/aria-at-test-window.mjs';

const Container = styled.div`
    border: black solid 2px;
    border-radius: 0.25rem;
    padding: 1rem;
`;

const ErrorSection = styled.section`
    display: ${({ hasErrors }) => (hasErrors ? 'block' : 'none')};
`;

const InstructionsSection = styled.section``;

const HeadingText = styled.h1``;

const SubHeadingText = styled.h2``;

const InnerSectionHeadingText = styled.h3``;

const Text = styled.p`
    > textarea {
        width: 100%;
    }
`;

const Feedback = styled.span`
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

const Table = styled.table`
    display: table;
    margin-bottom: 1em;
    border-spacing: 2px;

    border: black solid 1px;

    text-indent: initial;
    box-sizing: border-box;
    border-collapse: collapse;

    > tbody > tr {
        td,
        th {
            border: 1px solid black;
        }

        th {
            font-weight: bold;
        }
    }
`;

const Fieldset = styled.fieldset`
    display: block;
    margin-inline-start: 2px;
    margin-inline-end: 2px;
    padding-block-start: 0.35em;
    padding-inline-start: 0.75em;
    padding-inline-end: 0.75em;
    padding-block-end: 0.625em;

    min-inline-size: min-content;

    border-width: 2px;
    border-style: groove;
    border-color: threedface;
    border-image: initial;

    > legend {
        display: block;

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

    &.problem-select {
        margin-top: 1em;
        margin-left: 1em;
    }
`;

const NumberedList = styled.ol`
    > li {
    }
`;

const BulletList = styled.ul`
    padding-inline-start: 2.5rem;
    list-style-type: circle;

    > li {
        display: list-item;
        list-style: circle;
    }
`;

const ResultsBulletList = styled.ul`
    display: block;
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 40px;

    > li {
        display: list-item;
        list-style: disc;
        text-align: -webkit-match-parent;
    }
`;

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
    test,
    testPageUri,
    support,
    configQueryParams = [[]],
    testRunStateRef,
    testRunResultRef,
    submitButtonRef
}) => {
    const { title, directory, testJson, commandJson, state, result } = test;

    const [pageContent, setPageContent] = useState(null);
    const [submitResult, setSubmitResult] = useState(result);

    const testRunIO = new TestRunInputOutput();
    testRunIO.setTitleInputFromTitle(title);
    testRunIO.setUnexpectedInputFromBuiltin();
    testRunIO.setScriptsInputFromMap({});
    testRunIO.setSupportInputFromJSON(support);
    testRunIO.setConfigInputFromQueryParamsAndSupport(configQueryParams); // Array.from(new URL(document.location).searchParams)
    testRunIO.setKeysInputFromBuiltinAndConfig();
    testRunIO.setCommandsInputFromJSONAndConfigKeys(commandJson);
    testRunIO.setBehaviorInputFromJSONAndCommandsConfigKeysTitleUnexpected(
        testJson
    );
    testRunIO.setPageUriInputFromPageUri(
        `${process.env.GITHUB_OPEN_TEST_URI_BASE}/${directory}/${testPageUri}`
    );

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

    testWindow.prepare();

    const testRunExport = new TestRunExport({
        hooks: {
            openTestPage() {
                testWindow.open();
            },
            closeTestPage() {
                testWindow.close();
            }
        },
        state: state || testRunIO.testRunState(),
        resultsJSON: state => testRunIO.submitResultsJSON(state)
    });

    useEffect(() => {
        testRunStateRef.current = state;

        testRunExport.observe(result => {
            const { state: newState } = result;
            const submitResult = testRunExport.testPageAndResults();

            setPageContent({ ...testRunExport.instructions() });
            setSubmitResult(submitResult);

            testRunStateRef.current = newState;
            testRunResultRef.current = submitResult;
        });

        setPageContent(testRunExport.instructions());
    }, []);

    const parseRichContent = (instruction = []) => {
        let content = null;
        for (let value of instruction) {
            if (typeof value === 'string') {
                if (value === '.')
                    content = (
                        <>
                            {content}
                            {value}
                        </>
                    );
                else
                    content = content = (
                        <>
                            {content} {value}
                        </>
                    );
            } else if ('href' in value) {
                const { href, description } = value;
                content = (
                    <>
                        {content} <a href={href}>{description}</a>
                    </>
                );
            }
        }
        return content;
    };

    const parseListContent = (instructions = [], commandsContent = null) => {
        return instructions.map((value, index) => {
            if (typeof value === 'string')
                return (
                    <li key={nextId()}>
                        {value}
                        {commandsContent &&
                            index === instructions.length - 1 && (
                                <BulletList>{commandsContent}</BulletList>
                            )}
                    </li>
                );
            else if (Array.isArray(value))
                return (
                    <li key={nextId()}>
                        {parseRichContent(value)}
                        {commandsContent &&
                            index === instructions.length - 1 && (
                                <BulletList>{commandsContent}</BulletList>
                            )}
                    </li>
                );
        });
    };

    const InstructionsContent = () => {
        const allInstructions = [
            ...pageContent.instructions.instructions.instructions,
            ...pageContent.instructions.instructions.strongInstructions,
            pageContent.instructions.instructions.commands.description
        ];

        const commands =
            pageContent.instructions.instructions.commands.commands;

        const commandsContent = parseListContent(commands);
        const content = parseListContent(allInstructions, commandsContent);

        return <NumberedList>{content}</NumberedList>;
    };

    const AssertionsContent = () => {
        const assertions = [...pageContent.instructions.assertions.assertions];

        const content = parseListContent(assertions);

        return <NumberedList>{content}</NumberedList>;
    };

    const parseLinebreakOutput = (output = []) => {
        return output.map(item => {
            if (typeof item === 'string')
                return <Fragment key={nextId()}>{item}</Fragment>;
            else if (typeof item === 'object') {
                if ('whitespace' in item) {
                    if (item.whitespace === 'lineBreak')
                        return <br key={nextId()} />;
                }
            }
        });
    };

    const SubmitResultsContent = () => {
        const { results } = submitResult;
        const { header, status, table } = results;

        return (
            <>
                <HeadingText>{header}</HeadingText>
                <SubHeadingText id="overallstatus">
                    {status.header.map(text => (
                        <Fragment key={nextId()}>{text}</Fragment>
                    ))}
                </SubHeadingText>
                <Table>
                    <tbody>
                        <tr>
                            <th>{table.headers.description}</th>
                            <th>{table.headers.support}</th>
                            <th>{table.headers.details}</th>
                        </tr>
                        {table.commands.map(command => {
                            const { description, support, details } = command;

                            return (
                                <tr key={nextId()}>
                                    <td>{description}</td>
                                    <td>{support}</td>
                                    <td>
                                        <p>
                                            {parseLinebreakOutput(
                                                details.output
                                            )}
                                        </p>
                                        <div>
                                            {
                                                details.passingAssertions
                                                    .description
                                            }
                                            <ResultsBulletList>
                                                {details.passingAssertions.items.map(
                                                    item => (
                                                        <li key={nextId()}>
                                                            {item}
                                                        </li>
                                                    )
                                                )}
                                            </ResultsBulletList>
                                        </div>
                                        <div>
                                            {
                                                details.failingAssertions
                                                    .description
                                            }
                                            <ResultsBulletList>
                                                {details.failingAssertions.items.map(
                                                    item => (
                                                        <li key={nextId()}>
                                                            {item}
                                                        </li>
                                                    )
                                                )}
                                            </ResultsBulletList>
                                        </div>
                                        <div>
                                            {
                                                details.unexpectedBehaviors
                                                    .description
                                            }
                                            <ResultsBulletList>
                                                {details.unexpectedBehaviors.items.map(
                                                    item => (
                                                        <li key={nextId()}>
                                                            {item}
                                                        </li>
                                                    )
                                                )}
                                            </ResultsBulletList>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </>
        );
    };

    // pageContent to render instructions; submitResult.resultsJSON indicates results have been submitted
    if (!pageContent) return null;

    return (
        <Container>
            {submitResult && submitResult.resultsJSON ? (
                <SubmitResultsContent />
            ) : (
                <>
                    <ErrorComponent
                        hasErrors={
                            pageContent.errors && pageContent.errors.length
                        }
                    />
                    <InstructionsSection>
                        <HeadingText id="behavior-header" tabindex="0">
                            {pageContent.instructions.header.header}
                        </HeadingText>
                        <Text>{pageContent.instructions.description}</Text>
                        <SubHeadingText>
                            {pageContent.instructions.instructions.header}
                        </SubHeadingText>
                        <InstructionsContent />
                        <SubHeadingText>
                            {pageContent.instructions.assertions.header}
                        </SubHeadingText>
                        <Text>
                            {pageContent.instructions.assertions.description}
                        </Text>
                        <AssertionsContent />
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
                                    assertionsHeader,
                                    assertions,
                                    unexpectedBehaviors
                                } = value;

                                return (
                                    <Fragment
                                        key={`AtOutputKey_${commandIndex}`}
                                    >
                                        <InnerSectionHeadingText>
                                            {header}
                                        </InnerSectionHeadingText>
                                        <Text>
                                            <label>
                                                {atOutput.description[0]}
                                                <Feedback
                                                    className={`${atOutput
                                                        .description[1]
                                                        .required &&
                                                        'required'} ${atOutput
                                                        .description[1]
                                                        .highlightRequired &&
                                                        'highlight-required'}`}
                                                >
                                                    {
                                                        atOutput.description[1]
                                                            .description
                                                    }
                                                </Feedback>
                                            </label>
                                            <textarea
                                                value={atOutput.value}
                                                onChange={e =>
                                                    atOutput.change(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Text>
                                        <Table>
                                            <tbody>
                                                <tr>
                                                    <th>
                                                        {assertionsHeader.descriptionHeader ||
                                                            'Assertion'}
                                                    </th>
                                                    <th>
                                                        {assertionsHeader.passHeader ||
                                                            'Success case'}
                                                    </th>
                                                    <th>
                                                        {assertionsHeader.failHeader ||
                                                            'Failure cases'}
                                                    </th>
                                                </tr>
                                                {assertions.map(
                                                    (
                                                        assertion,
                                                        assertionIndex
                                                    ) => {
                                                        const {
                                                            description,
                                                            passChoice,
                                                            failChoices
                                                        } = assertion;

                                                        const [
                                                            missingChoice,
                                                            failureChoice
                                                        ] = failChoices;

                                                        return (
                                                            <tr
                                                                key={`AssertionKey_${assertionIndex}`}
                                                            >
                                                                {/*Assertion*/}
                                                                <td>
                                                                    {
                                                                        description[0]
                                                                    }
                                                                    <Feedback
                                                                        className={`${description[1]
                                                                            .required &&
                                                                            'required'} ${description[1]
                                                                            .highlightRequired &&
                                                                            'highlight-required'}`}
                                                                    >
                                                                        {
                                                                            description[1]
                                                                                .description
                                                                        }
                                                                    </Feedback>
                                                                </td>
                                                                {/*Success case*/}
                                                                <td>
                                                                    <input
                                                                        type="radio"
                                                                        id={`pass-${commandIndex}-${assertionIndex}`}
                                                                        name={`result-${commandIndex}-${assertionIndex}`}
                                                                        defaultChecked={
                                                                            passChoice.checked
                                                                        }
                                                                        onClick={
                                                                            passChoice.click
                                                                        }
                                                                    />
                                                                    <label
                                                                        id={`pass-${commandIndex}-${assertionIndex}-label`}
                                                                        htmlFor={`pass-${commandIndex}-${assertionIndex}`}
                                                                    >
                                                                        {
                                                                            passChoice
                                                                                .label[0]
                                                                        }
                                                                        <Feedback
                                                                            className={`${passChoice
                                                                                .label[1]
                                                                                .offScreen &&
                                                                                'off-screen'}`}
                                                                        >
                                                                            {
                                                                                passChoice
                                                                                    .label[1]
                                                                                    .description
                                                                            }
                                                                        </Feedback>
                                                                    </label>
                                                                </td>
                                                                {/*Failure cases*/}
                                                                <td>
                                                                    <input
                                                                        type="radio"
                                                                        id={`missing-${commandIndex}-${assertionIndex}`}
                                                                        name={`result-${commandIndex}-${assertionIndex}`}
                                                                        defaultChecked={
                                                                            missingChoice.checked
                                                                        }
                                                                        onClick={
                                                                            missingChoice.click
                                                                        }
                                                                    />
                                                                    <label
                                                                        id={`missing-${commandIndex}-${assertionIndex}-label`}
                                                                        htmlFor={`missing-${commandIndex}-${assertionIndex}`}
                                                                    >
                                                                        {
                                                                            missingChoice
                                                                                .label[0]
                                                                        }
                                                                        <Feedback
                                                                            className={`${missingChoice
                                                                                .label[1]
                                                                                .offScreen &&
                                                                                'off-screen'}`}
                                                                        >
                                                                            {
                                                                                missingChoice
                                                                                    .label[1]
                                                                                    .description
                                                                            }
                                                                        </Feedback>
                                                                    </label>

                                                                    <input
                                                                        type="radio"
                                                                        id={`fail-${commandIndex}-${assertionIndex}`}
                                                                        name={`result-${commandIndex}-${assertionIndex}`}
                                                                        defaultChecked={
                                                                            failureChoice.checked
                                                                        }
                                                                        onClick={
                                                                            failureChoice.click
                                                                        }
                                                                    />
                                                                    <label
                                                                        id={`fail-${commandIndex}-${assertionIndex}-label`}
                                                                        htmlFor={`fail-${commandIndex}-${assertionIndex}`}
                                                                    >
                                                                        {
                                                                            failureChoice
                                                                                .label[0]
                                                                        }
                                                                        <Feedback
                                                                            className={`${failureChoice
                                                                                .label[1]
                                                                                .offScreen &&
                                                                                'off-screen'}`}
                                                                        >
                                                                            {
                                                                                failureChoice
                                                                                    .label[1]
                                                                                    .description
                                                                            }
                                                                        </Feedback>
                                                                    </label>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </Table>
                                        {/*Unexpected Behaviors*/}
                                        <Fieldset
                                            id={`cmd-${commandIndex}-problems`}
                                        >
                                            {unexpectedBehaviors.description[0]}
                                            <Feedback
                                                className={`${unexpectedBehaviors
                                                    .description[1].required &&
                                                    'required'} ${unexpectedBehaviors
                                                    .description[1]
                                                    .highlightRequired &&
                                                    'highlight-required'}`}
                                            >
                                                {
                                                    unexpectedBehaviors
                                                        .description[1]
                                                        .description
                                                }
                                            </Feedback>
                                            <div>
                                                <input
                                                    type="radio"
                                                    id={`problem-${commandIndex}-true`}
                                                    name={`problem-${commandIndex}`}
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
                                                    type="radio"
                                                    id={`problem-${commandIndex}-false`}
                                                    name={`problem-${commandIndex}`}
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

                                            <Fieldset className="problem-select">
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
                                                            description,
                                                            more,
                                                            change
                                                        } = option;
                                                        return (
                                                            <Fragment
                                                                key={`AssertionOptionsKey_${optionIndex}`}
                                                            >
                                                                <input
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
                                                                    disabled={
                                                                        !unexpectedBehaviors
                                                                            .failChoice
                                                                            .checked
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
                                                                            <Feedback
                                                                                className={`${more
                                                                                    .description[1]
                                                                                    .required &&
                                                                                    'required'} ${more
                                                                                    .description[1]
                                                                                    .highlightRequired &&
                                                                                    'highlight-required'}`}
                                                                            >
                                                                                {
                                                                                    more
                                                                                        .description[1]
                                                                                        .description
                                                                                }
                                                                            </Feedback>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id={`${description}-${commandIndex}-input`}
                                                                            name={`${description}-${commandIndex}-input`}
                                                                            className={`undesirable-${description.toLowerCase()}-input`}
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
                        onClick={pageContent.submit.click}
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
    test: PropTypes.object,
    support: PropTypes.object,
    configQueryParams: PropTypes.array,
    testPageUri: PropTypes.string,
    testRunStateRef: PropTypes.any,
    testRunResultRef: PropTypes.any,
    submitButtonRef: PropTypes.any
};

export default TestRenderer;
