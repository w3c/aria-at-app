import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import './TestPlanResultsTable.css';
import nextId from 'react-id-generator';

const renderAssertionRow = assertionResult => {
    return (
        <tr key={`${assertionResult.id}__${nextId()}`}>
            <td>Required</td>
            <td>{assertionResult.assertion.text}</td>
            <td>{assertionResult.passed ? 'Passed' : 'Failed'}</td>
        </tr>
    );
};

const TestPlanResultsTable = ({ test, testResult, tableClassName = '' }) => {
    return (
        <>
            {testResult.scenarioResults.map((scenarioResult, index) => {
                const passedAssertions = scenarioResult.assertionResults.filter(
                    assertionResult => assertionResult.passed
                );
                const failedAssertions = scenarioResult.assertionResults.filter(
                    assertionResult => !assertionResult.passed
                );

                // Rows are sorted by priority descending, then result (failures then passes), then
                // assertion order. Assertion order refers to the order of assertion columns in the
                // tests.csv file.
                const requiredAssertionResults =
                    scenarioResult.requiredAssertionResults
                        .slice()
                        .sort((a, b) =>
                            a.passed === b.passed ? 0 : a.passed ? 1 : -1
                        );

                const optionalAssertionResults =
                    scenarioResult.optionalAssertionResults
                        .slice()
                        .sort((a, b) =>
                            a.passed === b.passed ? 0 : a.passed ? 1 : -1
                        );

                const commandsString = scenarioResult.scenario.commands
                    .map(({ text }) => text)
                    .join(' then ');

                return (
                    <React.Fragment key={scenarioResult.id}>
                        <h3>
                            {commandsString}&nbsp;Results:&nbsp;
                            {passedAssertions.length} passed,&nbsp;
                            {failedAssertions.length} failed
                        </h3>
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
                                {requiredAssertionResults.map(
                                    renderAssertionRow
                                )}
                                {optionalAssertionResults.map(
                                    renderAssertionRow
                                )}
                            </tbody>
                        </Table>
                        <p>
                            Unexpected Behaviors:{' '}
                            {scenarioResult.unexpectedBehaviors.length ? (
                                <ul>
                                    {scenarioResult.unexpectedBehaviors.map(
                                        unexpected => (
                                            <li key={unexpected.id}>
                                                {unexpected.otherUnexpectedBehaviorText ??
                                                    unexpected.text}
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                'None'
                            )}
                        </p>
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
    tableClassName: PropTypes.string
};

export default TestPlanResultsTable;
