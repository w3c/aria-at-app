import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import TurndownService from 'turndown';

const Wrapper = styled.div`
    & h2 {
        margin-top: 0;
        ${props => props.hideHeadline && `display: none;`}
    }
    & ul li {
        list-style: disc;
        margin: 0 0 0.5em 2em;
    }
`;

const ReviewConflicts = ({
    testPlanReport,
    test,
    hideHeadline = false,
    conflictMarkdownRef = null
}) => {
    const contentRef = useRef();

    useEffect(() => {
        if (!contentRef.current || !conflictMarkdownRef) return;
        const turndownService = new TurndownService({ headingStyle: 'atx' });
        conflictMarkdownRef.current = turndownService.turndown(
            contentRef.current.outerHTML
        );
    });

    const conflicts = testPlanReport.conflicts.filter(
        conflict => conflict.source.test.id === test.id
    );

    if (conflicts.length === 0) return null;

    const commandString = scenario => {
        return scenario.commands.map(command => command.text).join(', then ');
    };

    const renderConflict = conflict => {
        const assertion = conflict.source.assertion;
        if (assertion) return renderAssertionResultConflict(conflict);
        return renderUnexpectedBehaviorConflict(conflict);
    };

    const renderAssertionResultConflict = ({
        source: { scenario, assertion },
        conflictingResults
    }) => {
        const results = conflictingResults.map(result => {
            const { testPlanRun, scenarioResult, assertionResult } = result;
            let assertionResultFormatted;
            if (assertionResult.passed) {
                assertionResultFormatted = 'passing';
            } else {
                const reasonFormatted =
                    assertionResult.failedReason === 'INCORRECT_OUTPUT'
                        ? 'incorrect output'
                        : 'no output';
                assertionResultFormatted = `failing with ${reasonFormatted}`;
            }
            return (
                <li key={testPlanRun.id}>
                    Tester {testPlanRun.tester.username} recorded output &quot;
                    {scenarioResult.output}&quot; and marked assertion as{' '}
                    {assertionResultFormatted}.
                </li>
            );
        });

        return (
            <li key={assertion.id}>
                <h3>
                    Assertion Results for &quot;
                    {commandString(scenario)}&quot; Command and &quot;
                    {assertion.text}&quot; Assertion
                </h3>
                <ul>{results}</ul>
            </li>
        );
    };

    const renderUnexpectedBehaviorConflict = ({
        source: { scenario },
        conflictingResults
    }) => {
        const results = conflictingResults.map(result => {
            const { testPlanRun, scenarioResult } = result;
            let resultFormatted;
            if (scenarioResult.unexpectedBehaviors.length) {
                resultFormatted = scenarioResult.unexpectedBehaviors
                    .map(({ text }) => text)
                    .join(' and ');
            } else {
                resultFormatted = 'no unexpected behavior';
            }
            let noteFormatted = scenarioResult.unexpectedBehaviorNote
                ? `with the note: "${scenarioResult.unexpectedBehaviorNote}"`
                : '';
            return (
                <li key={testPlanRun.id}>
                    Tester {testPlanRun.tester.username} recorded output &quot;
                    {scenarioResult.output}&quot; and identified&nbsp;
                    {resultFormatted + noteFormatted}.
                </li>
            );
        });

        return (
            <li key={scenario.id}>
                <h3>
                    Unexpected Behaviors for &quot;{commandString(scenario)}
                    &quot; Command
                </h3>
                <ul>{results}</ul>
            </li>
        );
    };

    return (
        <Wrapper ref={contentRef} hideHeadline={hideHeadline}>
            <h2>Review Conflicts for &quot;{test.title}&quot;</h2>
            <ol>{conflicts.map(renderConflict)}</ol>
        </Wrapper>
    );
};

ReviewConflicts.propTypes = {
    testPlanReport: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        conflicts: PropTypes.arrayOf(
            PropTypes.shape({
                source: PropTypes.shape({
                    test: PropTypes.shape({
                        id: PropTypes.string.isRequired
                    }).isRequired,
                    scenario: PropTypes.shape({
                        id: PropTypes.string.isRequired,
                        commands: PropTypes.arrayOf(
                            PropTypes.shape({
                                text: PropTypes.string.isRequired
                            })
                        ).isRequired
                    }).isRequired,
                    assertion: PropTypes.shape({
                        id: PropTypes.string.isRequired,
                        text: PropTypes.string.isRequired
                    })
                }).isRequired,
                conflictingResults: PropTypes.arrayOf(
                    PropTypes.shape({
                        testPlanRun: PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            tester: PropTypes.shape({
                                username: PropTypes.string.isRequired
                            }).isRequired
                        }).isRequired,
                        scenarioResult: PropTypes.shape({
                            output: PropTypes.string.isRequired,
                            unexpectedBehaviors: PropTypes.arrayOf(
                                PropTypes.shape({
                                    text: PropTypes.string.isRequired
                                })
                            ).isRequired,
                            unexpectedBehaviorNote: PropTypes.string
                        }),
                        assertionResult: PropTypes.shape({
                            passed: PropTypes.bool.isRequired,
                            failedReason: PropTypes.string
                        })
                    })
                ).isRequired
            })
        ).isRequired
    }),
    test: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        rowNumber: PropTypes.number.isRequired
    }),
    hideHeadline: PropTypes.bool,
    conflictMarkdownRef: PropTypes.shape({
        current: PropTypes.string
    })
};

export default ReviewConflicts;
