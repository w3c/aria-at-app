import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';
import { unescape } from 'lodash';
import { parseListContent } from '../../TestRenderer/utils';
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

    if (isV2) {
        const commandSettingSpecified = renderableContent.commands.some(
            ({ settings }) => settings && settings !== 'defaultMode'
        );

        const defaultInstructions =
            renderableContent.target.at.raw
                .defaultConfigurationInstructionsHTML;
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

    const assertions = [...pageContent.instructions.assertions.assertions];
    const assertionsContent = parseListContent(assertions);

    const Heading = `h${headingLevel}`;

    return (
        <>
            <NumberedList>{allInstructionsContent}</NumberedList>
            {/* TODO: Remove 3 following lines to remove the Success Criteria once #863 is merged. Will need that
                  functionality to show the commands and assertions specification table and if there are any
                  exceptions, especially 0-level assertions */}
            <Heading>{pageContent.instructions.assertions.header}</Heading>
            {pageContent.instructions.assertions.description}
            <NumberedList>{assertionsContent}</NumberedList>
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
