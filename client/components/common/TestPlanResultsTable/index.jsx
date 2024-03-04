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
                    highImpactPassedAssertionCount,
                    moderateImpactPassedAssertionCount
                } = getMetrics({ scenarioResult });

                const hasNoHighUnexpectedBehavior =
                    highImpactPassedAssertionCount > 0;
                const hasNoModerateUnexpectedBehavior =
                    moderateImpactPassedAssertionCount > 0;

                // Rows are sorted by priority descending, then result (failures then passes), then
                // assertion order. Assertion order refers to the order of assertion columns in the
                // tests.csv file.
                // TODO: Update named references of REQUIRED to MUST
                const requiredAssertionResults =
                    scenarioResult.requiredAssertionResults
                        .slice()
                        .sort((a, b) =>
                            a.passed === b.passed ? 0 : a.passed ? 1 : -1
                        );

                // TODO: Update named references of OPTIONAL to SHOULD
                const optionalAssertionResults =
                    scenarioResult.optionalAssertionResults
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
                    ...requiredAssertionResults.map(e => ({
                        ...e,
                        priorityString: 'MUST'
                    })),
                    {
                        id: `UnexpectedBehavior_MUST_${nextId()}`,
                        assertion: {
                            text: 'Other behaviors that create high negative-impacts are not exhibited'
                        },
                        passed: hasNoHighUnexpectedBehavior,
                        priorityString: 'MUST'
                    },
                    ...optionalAssertionResults.map(e => ({
                        ...e,
                        priorityString: 'SHOULD'
                    })),
                    {
                        id: `UnexpectedBehavior_SHOULD_${nextId()}`,
                        assertion: {
                            text: 'Other behaviors that create moderate negative-impacts are not exhibited'
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
                        Unexpected Behaviors:{' '}
                        {scenarioResult.unexpectedBehaviors.length ? (
                            <ul>
                                {scenarioResult.unexpectedBehaviors.map(
                                    ({ id, text, impact, details }) => {
                                        const description = `${text} (Details: ${details}, Impact: ${impact})`;
                                        return (
                                            <li
                                                key={id}
                                                className="test-plan-results-li"
                                            >
                                                {description}
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
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
