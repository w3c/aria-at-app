import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { CONFLICTING_TEST_RESULT_QUERY } from './queries';
import TurndownService from 'turndown';

const Wrapper = styled.div`
    & h2 {
        margin-top: 0;
    }
    & ul li {
        list-style: disc;
        margin: 0 0 0.5em 2em;
    }
`;

const ConflictingTestResults = ({
    testPlanReportId,
    testId,
    copyMarkdownToClipboardRef
}) => {
    const { data } = useQuery(CONFLICTING_TEST_RESULT_QUERY, {
        variables: { testPlanReportId }
    });

    const contentRef = useRef();

    if (copyMarkdownToClipboardRef) {
        copyMarkdownToClipboardRef.current = () => {
            const turndownService = new TurndownService({
                headingStyle: 'atx'
            });
            const markdown = turndownService.turndown(
                contentRef.current.outerHTML
            );
            navigator.clipboard.writeText(markdown);
        };
    }

    if (!data) return null;

    const { testPlanReport } = data;
    const { testPlanVersion } = testPlanReport;
    const conflicts = testPlanReport.conflicts.filter(
        conflict => conflict.source.test.id === testId
    );
    const { test } = conflicts[0].source;

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
                    assertion.failedReason === 'INCORRECT_OUTPUT'
                        ? 'incorrect output'
                        : 'no output';
                assertionResultFormatted = `failing with ${reasonFormatted}`;
            }
            return (
                <li key={testPlanRun.id}>
                    Tester {testPlanRun.tester.username} recorded output &quot;
                    {scenarioResult.output}&quot; and marked assertion as&nbsp;
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
                    .map(({ otherUnexpectedBehaviorText, text }) => {
                        return `"${otherUnexpectedBehaviorText ?? text}"`;
                    })
                    .join(' and ');
            } else {
                resultFormatted = 'no unexpected behavior';
            }
            return (
                <li key={testPlanRun.id}>
                    Tester {testPlanRun.tester.username} recorded output &quot;
                    {scenarioResult.output}&quot; and noted {resultFormatted}.
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
        <Wrapper ref={contentRef}>
            <h2>Conflicting Test Results</h2>
            <p>
                The following differences were found in submitted test results
                for test {test.rowNumber}, &quot;{test.title}&quot;, of the{' '}
                {testPlanVersion.title} test plan.
            </p>
            <ol>{conflicts.map(renderConflict)}</ol>
        </Wrapper>
    );
};

ConflictingTestResults.propTypes = {
    testPlanReportId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
    testId: PropTypes.string.isRequired,
    copyMarkdownToClipboardRef: PropTypes.shape({
        current: PropTypes.any
    })
};

export default ConflictingTestResults;
