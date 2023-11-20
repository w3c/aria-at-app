import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';
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

const BulletList = styled.ul`
    padding-inline-start: 2.5rem;
    list-style-type: circle;

    > li {
        display: list-item;
        list-style: circle;
    }
`;

const InstructionsRenderer = ({ test, testPageUrl, at, headingLevel = 2 }) => {
    const { renderableContent } = test;
    const [testRunExport, setTestRunExport] = useState();
    const [instructionsContent, setInstructionsContent] = useState({
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
            setInstructionsContent(testRunExport.instructions());
        }
    }, [testRunExport]);

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

    const allInstructions = [
        ...instructionsContent.instructions.instructions.instructions,
        ...instructionsContent.instructions.instructions.strongInstructions,
        instructionsContent.instructions.instructions.commands.description
    ];

    const commands =
        instructionsContent.instructions.instructions.commands.commands;

    const commandsContent = parseListContent(commands);
    const allInstructionsContent = parseListContent(
        allInstructions,
        commandsContent
    );

    const assertions = [
        ...instructionsContent.instructions.assertions.assertions
    ];

    const assertionsContent = parseListContent(assertions);

    const Heading = `h${headingLevel}`;

    return (
        <>
            <p>{instructionsContent.instructions.description}</p>
            <Heading>
                {instructionsContent.instructions.instructions.header}
            </Heading>
            <NumberedList>{allInstructionsContent}</NumberedList>
            <Heading>
                {instructionsContent.instructions.assertions.header}
            </Heading>
            {instructionsContent.instructions.assertions.description}
            <NumberedList>{assertionsContent}</NumberedList>
            <Button
                disabled={
                    !instructionsContent.instructions.openTestPage.enabled
                }
                onClick={instructionsContent.instructions.openTestPage.click}
            >
                {instructionsContent.instructions.openTestPage.button}
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
    headingLevel: PropTypes.number
};

export default InstructionsRenderer;
