import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import nextId from 'react-id-generator';
import { getMetrics } from 'shared';
import './TestPlanResultsTable.css';

const renderAssertionRow = (assertionResult, priorityString) => {
    return (
        <tr key={`${assertionResult.id}__${nextId()}`}>
            <td>{priorityString}</td>
            <td>{assertionResult.assertion.text}</td>
            <td>{assertionResult.passed ? 'Passed' : 'Failed'}</td>
        </tr>
    );
};

const TestPlanResultsTable = ({
    test,
    testResult,
    tableClassName = '',
    optionalHeader = null,
    commandHeadingLevel = 3
}) => {
    const CommandHeading = `h${commandHeadingLevel}`;

    return (
        <>
            {optionalHeader}
            {testResult.scenarioResults.map((scenarioResult, index) => {
                const {
                    assertionsPassedCount,
                    assertionsFailedCount,
                    severeImpactPassedAssertionCount,
                    moderateImpactPassedAssertionCount
                } = getMetrics({ scenarioResult });

                const hasNoSevereUnexpectedBehavior =
                    severeImpactPassedAssertionCount > 0;
                const hasNoModerateUnexpectedBehavior =
                    moderateImpactPassedAssertionCount > 0;

                // Rows are sorted by priority descending, then result (failures then passes), then
                // assertion order. Assertion order refers to the order of assertion columns in the
                // tests.csv file.
                const mustAssertionResults = scenarioResult.mustAssertionResults
                    .slice()
                    .sort((a, b) =>
                        a.passed === b.passed ? 0 : a.passed ? 1 : -1
                    );

                const shouldAssertionResults =
                    scenarioResult.shouldAssertionResults
                        .slice()
                        .sort((a, b) =>
                            a.passed === b.passed ? 0 : a.passed ? 1 : -1
                        );

                const mayAssertionResults = scenarioResult.mayAssertionResults
                    .slice()
                    .sort((a, b) =>
                        a.passed === b.passed ? 0 : a.passed ? 1 : -1
                    );

                // Workaround:
                // Remove instances of content inside '()' to address edge case of
                // COMMAND_TEXT (OPERATING_MODE) then COMMAND_TEXT (OPERATING_MODE).
                // OPERATING_MODE should only show once
                const bracketsRegex = /\((.*?)\)/g;

                const commandsString = scenarioResult.scenario.commands
                    .map(({ text }, index) => {
                        if (
                            index !==
                            scenarioResult.scenario.commands.length - 1
                        )
                            text = text.replace(bracketsRegex, '');
                        return text.trim();
                    })
                    .join(' then ');

                const sortedAssertionResults = [
                    ...mustAssertionResults.map(e => ({
                        ...e,
                        priorityString: 'MUST'
                    })),
                    {
                        id: `UnexpectedBehavior_MUST_${nextId()}`,
                        assertion: {
                            text: 'Other behaviors that create severe negative impacts are not exhibited'
                        },
                        passed: hasNoSevereUnexpectedBehavior,
                        priorityString: 'MUST'
                    },
                    ...shouldAssertionResults.map(e => ({
                        ...e,
                        priorityString: 'SHOULD'
                    })),
                    {
                        id: `UnexpectedBehavior_SHOULD_${nextId()}`,
                        assertion: {
                            text: 'Other behaviors that create moderate negative impacts are not exhibited'
                        },
                        passed: hasNoModerateUnexpectedBehavior,
                        priorityString: 'SHOULD'
                    },
                    ...mayAssertionResults.map(e => ({
                        ...e,
                        priorityString: 'MAY'
                    }))
                ].sort((a, b) => a.passed - b.passed);

                return (
                    <React.Fragment key={scenarioResult.id}>
                        <CommandHeading>
                            {commandsString}&nbsp;Results:&nbsp;
                            {assertionsPassedCount} passed,&nbsp;
                            {assertionsFailedCount} failed
                        </CommandHeading>
                        <p className="test-plan-results-response-p">
                            {test.at?.name} Response:
                        </p>
                        <blockquote className="test-plan-results-blockquote">
                            {scenarioResult.output}
                        </blockquote>
                        <Table
                            bordered
                            responsive
                            aria-label={`Results for test ${test.title}`}
                            className={`test-plan-results-table ${tableClassName}`}
                        >
                            <caption>{commandsString} Results</caption>
                            <thead>
                                <tr>
                                    <th>Priority</th>
                                    <th>Assertion</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAssertionResults.map(assertionResult =>
                                    renderAssertionRow(
                                        assertionResult,
                                        assertionResult.priorityString
                                    )
                                )}
                            </tbody>
                        </Table>
                        Other behaviors that create negative impact:{' '}
                        {scenarioResult.unexpectedBehaviors.length ? (
                            <Table
                                bordered
                                responsive
                                aria-label={`Undesirable behaviors for test ${test.title}`}
                                className={`test-plan-unexpected-behaviors-table ${tableClassName}`}
                            >
                                <thead>
                                    <tr>
                                        <th>Behavior</th>
                                        <th>Details</th>
                                        <th>Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scenarioResult.unexpectedBehaviors.map(
                                        ({ id, text, details, impact }) => (
                                            <tr key={id}>
                                                <td>{text}</td>
                                                <td>{details}</td>
                                                <td>{impact}</td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </Table>
                        ) : (
                            'None'
                        )}
                        {/* Do not show separator below last item */}
                        {index !== testResult.scenarioResults.length - 1 ? (
                            <hr aria-hidden="true" />
                        ) : null}
                    </React.Fragment>
                );
            })}
        </>
    );
};

TestPlanResultsTable.propTypes = {
    test: PropTypes.shape({
        title: PropTypes.string.isRequired,
        at: PropTypes.shape({
            name: PropTypes.string.isRequired
        }).isRequired
    }),
    testResult: PropTypes.shape({
        scenarioResults: PropTypes.array.isRequired
    }),
    tableClassName: PropTypes.string,
    optionalHeader: PropTypes.node,
    commandHeadingLevel: PropTypes.number
};

export default TestPlanResultsTable;
