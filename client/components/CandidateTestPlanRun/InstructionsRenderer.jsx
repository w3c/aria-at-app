import React, { useEffect, useState } from 'react';
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
import { evaluateAtNameKey } from '../../utils/aria.js';

const InstructionsRenderer = ({ testResult, testPageUrl, at }) => {
    const { test = {} } = testResult;
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
                                <ul>{commandsContent}</ul>
                            )}
                    </li>
                );
            else if (Array.isArray(value))
                return (
                    <li key={nextId()}>
                        {parseRichContent(value)}
                        {commandsContent &&
                            index === instructions.length - 1 && (
                                <ul>{commandsContent}</ul>
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

    return (
        <div>
            <p>{instructionsContent.instructions.description}</p>
            <h2 id="instruction-list-heading">
                {instructionsContent.instructions.instructions.header}
            </h2>
            <ol>{allInstructionsContent}</ol>
            <h2>{instructionsContent.instructions.assertions.header}</h2>
            {instructionsContent.instructions.assertions.description}
            <ol>{assertionsContent}</ol>
            <button
                disabled={
                    !instructionsContent.instructions.openTestPage.enabled
                }
                onClick={instructionsContent.instructions.openTestPage.click}
            >
                {instructionsContent.instructions.openTestPage.button}
            </button>
        </div>
    );
};

export default InstructionsRenderer;
