import React, { Fragment, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';

import * as AriaAtTestRun from '../../resources/aria-at-test-run.mjs';

const Container = styled.div`
    border: black solid 2px;
    border-radius: 0.25rem;
    padding: 1rem;
`;

const ErrorSection = styled.section`
    display: ${({ hasErrors }) => (hasErrors ? 'block' : 'none')};
`;

const InstructionsSection = styled.section``;

const HeaderText = styled.h1``;

const SubHeadingText = styled.h2``;

const InnerSectionHeadingText = styled.h3``;

const Text = styled.p`
    > label {
        > span {
            display: none;
        }
    }
    > textarea {
        width: 100%;
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

            > span {
                display: none;
            }

            > label span {
                display: none;
            }
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

    > span {
        display: none;
    }

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

    .problem-select {
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

const TestRenderer = () => {
    const [pageContent, setPageContent] = useState(null);

    useEffect(() => {
        const testRun = new AriaAtTestRun.TestRun({
            hooks: {},
            state: {
                info: {
                    description:
                        'Navigate to an unchecked checkbox in reading mode',
                    task: 'navigate to unchecked checkbox',
                    mode: 'reading',
                    modeInstructions:
                        'Insure NVDA is in browse mode by pressing Escape. Note: This command has no effect if NVDA is already in browse mode.',
                    userInstructions: [
                        'Navigate to the first checkbox. Note: it should be in the unchecked state.'
                    ],
                    setupScriptDescription: ''
                },
                config: {
                    at: {
                        key: 'nvda',
                        name: 'NVDA'
                    },
                    renderResultsAfterSubmit: false,
                    displaySubmitButton: false
                },
                currentUserAction: 'loadPage',
                commands: [
                    {
                        description: 'X / Shift+X',
                        atOutput: { highlightRequired: false },
                        assertions: [
                            {
                                description: 'Role "checkbox" is conveyed',
                                priority: 1
                            },
                            {
                                description: 'Name "Lettuce" is conveyed',
                                priority: 1
                            },
                            {
                                description:
                                    'State of the checkbox (not checked) is conveyed',
                                priority: 1
                            }
                        ],
                        additionalAssertions: [],
                        unexpected: {
                            highlightRequired: false,
                            behaviors: [
                                {
                                    description:
                                        'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech'
                                },
                                {
                                    description:
                                        'Reading cursor position changed in an unexpected manner'
                                },
                                {
                                    description:
                                        'Screen reader became extremely sluggish'
                                },
                                {
                                    description: 'Screen reader crashed'
                                },
                                {
                                    description: 'Browser crashed'
                                },
                                {
                                    description: 'Other',
                                    more: [
                                        {
                                            highlightRequired: false
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        description: 'F / Shift+F',
                        atOutput: { highlightRequired: false },
                        assertions: [
                            {
                                description: 'Role "checkbox" is conveyed',
                                priority: 1
                            },
                            {
                                description: 'Name "Lettuce" is conveyed',
                                priority: 1
                            },
                            {
                                description:
                                    'State of the checkbox (not checked) is conveyed',
                                priority: 1
                            }
                        ],
                        additionalAssertions: [],
                        unexpected: {
                            highlightRequired: false,
                            behaviors: [
                                {
                                    description:
                                        'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech'
                                },
                                {
                                    description:
                                        'Reading cursor position changed in an unexpected manner'
                                },
                                {
                                    description:
                                        'Screen reader became extremely sluggish'
                                },
                                {
                                    description: 'Screen reader crashed'
                                },
                                {
                                    description: 'Browser crashed'
                                },
                                {
                                    description: 'Other',
                                    more: [
                                        {
                                            highlightRequired: false
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        description: 'Tab / Shift+Tab',
                        atOutput: { highlightRequired: false },
                        assertions: [
                            {
                                description: 'Role "checkbox" is conveyed',
                                priority: 1
                            },
                            {
                                description: 'Name "Lettuce" is conveyed',
                                priority: 1
                            },
                            {
                                description:
                                    'State of the checkbox (not checked) is conveyed',
                                priority: 1
                            }
                        ],
                        additionalAssertions: [],
                        unexpected: {
                            highlightRequired: false,
                            behaviors: [
                                {
                                    description:
                                        'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech'
                                },
                                {
                                    description:
                                        'Reading cursor position changed in an unexpected manner'
                                },
                                {
                                    description:
                                        'Screen reader became extremely sluggish'
                                },
                                {
                                    description: 'Screen reader crashed'
                                },
                                {
                                    description: 'Browser crashed'
                                },
                                {
                                    description: 'Other',
                                    more: [
                                        {
                                            highlightRequired: false
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        description: 'Up Arrow / Down Arrow',
                        atOutput: { highlightRequired: false },
                        assertions: [
                            {
                                description: 'Role "checkbox" is conveyed',
                                priority: 1
                            },
                            {
                                description: 'Name "Lettuce" is conveyed',
                                priority: 1
                            },
                            {
                                description:
                                    'State of the checkbox (not checked) is conveyed',
                                priority: 1
                            }
                        ],
                        additionalAssertions: [],
                        unexpected: {
                            highlightRequired: false,
                            behaviors: [
                                {
                                    description:
                                        'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech'
                                },
                                {
                                    description:
                                        'Reading cursor position changed in an unexpected manner'
                                },
                                {
                                    description:
                                        'Screen reader became extremely sluggish'
                                },
                                {
                                    description: 'Screen reader crashed'
                                },
                                {
                                    description: 'Browser crashed'
                                },
                                {
                                    description: 'Other',
                                    more: [
                                        {
                                            highlightRequired: false
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ],
                openTest: {
                    enabled: true
                }
            }
        });

        setPageContent(testRun.testPage());
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
            ...pageContent.instructions.instructions.instructions.instructions,
            ...pageContent.instructions.instructions.instructions
                .strongInstructions,
            pageContent.instructions.instructions.instructions.commands
                .description
        ];

        const commands =
            pageContent.instructions.instructions.instructions.commands
                .commands;

        const commandsContent = parseListContent(commands);
        const content = parseListContent(allInstructions, commandsContent);

        return <NumberedList>{content}</NumberedList>;
    };

    const AssertionsContent = () => {
        const assertions = [
            ...pageContent.instructions.instructions.assertions.assertions
        ];

        const content = parseListContent(assertions);

        return <NumberedList>{content}</NumberedList>;
    };

    const ResultsContent = () => {
        const resultCommands = [...pageContent.instructions.results.commands];

        return resultCommands.map((value, commandIndex) => {
            const {
                header,
                atOutput,
                assertionsHeader,
                assertions,
                unexpectedBehaviors
            } = value;

            return (
                <Fragment key={nextId()}>
                    <InnerSectionHeadingText>{header}</InnerSectionHeadingText>
                    <Text>
                        <label>
                            {atOutput.description[0]}
                            <span
                                className={`${atOutput.description[1]
                                    .required && 'required'} ${atOutput
                                    .description[1].highlightRequired &&
                                    'highlight-required'}`}
                            >
                                {atOutput.description[1].description}
                            </span>
                        </label>
                        <textarea />
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
                            {assertions.map((assertion, assertionIndex) => {
                                const {
                                    description,
                                    passChoice,
                                    failChoices
                                } = assertion;

                                const [missingCase, failureCase] = failChoices;

                                return (
                                    <tr key={nextId()}>
                                        {/*Assertion*/}
                                        <td>
                                            {description[0]}
                                            <span
                                                className={`${description[1]
                                                    .required &&
                                                    'required'} ${description[1]
                                                    .highlightRequired &&
                                                    'highlight-required'}`}
                                            >
                                                {description[1].description}
                                            </span>
                                        </td>
                                        {/*Success case*/}
                                        <td>
                                            <input
                                                type="radio"
                                                id={`pass-${commandIndex}-${assertionIndex}`}
                                                name={`result-${commandIndex}-${assertionIndex}`}
                                            />
                                            <label
                                                id={`pass-${commandIndex}-${assertionIndex}-label`}
                                                htmlFor={`pass-${commandIndex}-${assertionIndex}`}
                                            >
                                                {passChoice.label[0]}
                                                <span
                                                    className={`${passChoice
                                                        .label[1].offScreen &&
                                                        'off-screen'}`}
                                                >
                                                    {
                                                        passChoice.label[1]
                                                            .description
                                                    }
                                                </span>
                                            </label>
                                        </td>
                                        {/*Failure cases*/}
                                        <td>
                                            <input
                                                type="radio"
                                                id={`missing-${commandIndex}-${assertionIndex}`}
                                                name={`result-${commandIndex}-${assertionIndex}`}
                                            />
                                            <label
                                                id={`missing-${commandIndex}-${assertionIndex}-label`}
                                                htmlFor={`missing-${commandIndex}-${assertionIndex}`}
                                            >
                                                {missingCase.label[0]}
                                                <span
                                                    className={`${missingCase
                                                        .label[1].offScreen &&
                                                        'off-screen'}`}
                                                >
                                                    {
                                                        missingCase.label[1]
                                                            .description
                                                    }
                                                </span>
                                            </label>

                                            <input
                                                type="radio"
                                                id={`fail-${commandIndex}-${assertionIndex}`}
                                                name={`result-${commandIndex}-${assertionIndex}`}
                                            />
                                            <label
                                                id={`fail-${commandIndex}-${assertionIndex}-label`}
                                                htmlFor={`fail-${commandIndex}-${assertionIndex}`}
                                            >
                                                {failureCase.label[0]}
                                                <span
                                                    className={`${failureCase
                                                        .label[1].offScreen &&
                                                        'off-screen'}`}
                                                >
                                                    {
                                                        failureCase.label[1]
                                                            .description
                                                    }
                                                </span>
                                            </label>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    <Fieldset id={`cmd-${commandIndex}-problems`}>
                        {unexpectedBehaviors.description[0]}
                        <span
                            className={`${unexpectedBehaviors.description[1]
                                .required && 'required'} ${unexpectedBehaviors
                                .description[1].highlightRequired &&
                                'highlight-required'}`}
                        >
                            {unexpectedBehaviors.description[1].description}
                        </span>
                        <div>
                            <input
                                type="radio"
                                id={`problem-${commandIndex}-true`}
                                name={`problem-${commandIndex}`}
                            />
                            <label
                                id={`problem-${commandIndex}-true-label`}
                                htmlFor={`problem-${commandIndex}-true`}
                            >
                                {unexpectedBehaviors.passChoice.label}
                            </label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id={`problem-${commandIndex}-false`}
                                name={`problem-${commandIndex}`}
                            />
                            <label
                                id={`problem-${commandIndex}-false-label`}
                                htmlFor={`problem-${commandIndex}-false`}
                            >
                                {unexpectedBehaviors.failChoice.label}
                            </label>
                        </div>

                        <Fieldset className="problem-select">
                            <legend>
                                {unexpectedBehaviors.failChoice.options.header}
                            </legend>
                            {unexpectedBehaviors.failChoice.options.options.map(
                                (option, optionIndex) => {
                                    const { description, more } = option;
                                    return (
                                        <Fragment key={nextId()}>
                                            <input
                                                type="checkbox"
                                                value={description}
                                                id={`${description}-${commandIndex}`}
                                                className={`undesirable-${commandIndex}`}
                                                tabIndex={
                                                    optionIndex === 0 ? 0 : -1
                                                }
                                                disabled
                                            />
                                            <label
                                                htmlFor={`${description}-${commandIndex}`}
                                            >
                                                {description}
                                            </label>
                                            <br />
                                            {more && (
                                                <div>
                                                    <label
                                                        htmlFor={`${description}-${commandIndex}-input`}
                                                    >
                                                        {more.description[0]}
                                                        <span
                                                            style={{
                                                                // TODO: temporary
                                                                display: 'none'
                                                            }}
                                                            className={`${more
                                                                .description[1]
                                                                .required &&
                                                                'required'}`}
                                                        >
                                                            {
                                                                more
                                                                    .description[1]
                                                                    .description
                                                            }
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id={`${description}-${commandIndex}-input`}
                                                        name={`${description}-${commandIndex}-input`}
                                                        className={`undesirable-${description.toLowerCase()}-input`}
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
        });
    };

    if (!pageContent) return null;

    return (
        <Container>
            <ErrorComponent hasErrors={!!pageContent.errors} />
            <InstructionsSection>
                <HeaderText id="behavior-header" tabindex="0">
                    {pageContent.instructions.instructions.header.header}
                </HeaderText>
                <Text>{pageContent.instructions.instructions.description}</Text>
                <SubHeadingText>
                    {pageContent.instructions.instructions.instructions.header}
                </SubHeadingText>
                <InstructionsContent />
                <SubHeadingText>
                    {pageContent.instructions.instructions.assertions.header}
                </SubHeadingText>
                <Text>
                    {
                        pageContent.instructions.instructions.assertions
                            .description
                    }
                </Text>
                <AssertionsContent />
                {pageContent.instructions.instructions.openTestPage.enabled && (
                    <Button
                        onClick={
                            pageContent.instructions.instructions.openTestPage
                                .click
                        }
                    >
                        {
                            pageContent.instructions.instructions.openTestPage
                                .button
                        }
                    </Button>
                )}
            </InstructionsSection>
            <ResultsSection>
                <SubHeadingText>
                    {pageContent.instructions.results.header.header}
                </SubHeadingText>
                <Text>
                    {pageContent.instructions.results.header.description}
                </Text>
                <ResultsContent />
            </ResultsSection>
        </Container>
    );
};

ErrorComponent.propTypes = {
    hasErrors: PropTypes.bool
};

export default TestRenderer;
