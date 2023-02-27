import React from 'react';
import PropTypes from 'prop-types';
import getMetrics from './getMetrics';
import { Table } from 'react-bootstrap';

const getAssertionResultString = assertionResult => {
    let output = 'Good output';
    if (!assertionResult.passed) {
        output =
            assertionResult.failedReason === 'INCORRECT_OUTPUT'
                ? 'Incorrect output'
                : 'No output';
    }
    return `${output}: ${assertionResult.assertion.text}`;
};

const TestPlanResultsTable = ({ test, testResult, tableClassName = '' }) => {
    return (
        <>
            <Table
                bordered
                responsive
                aria-label={`Results for test ${test.title}`}
                className={tableClassName}
            >
                <thead>
                    <tr>
                        <th>Command</th>
                        <th>Support</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {testResult.scenarioResults.map(scenarioResult => {
                        const passedAssertions =
                            scenarioResult.assertionResults.filter(
                                assertionResult => assertionResult.passed
                            );
                        const failedAssertions =
                            scenarioResult.assertionResults.filter(
                                assertionResult => !assertionResult.passed
                            );
                        const metrics = getMetrics({
                            scenarioResult
                        });
                        return (
                            <tr key={scenarioResult.id}>
                                <td>
                                    {scenarioResult.scenario.commands
                                        .map(({ text }) => text)
                                        .join(', then ')}
                                </td>
                                <td>{metrics.supportLevel}</td>
                                <td>
                                    <dl>
                                        <dt>Output:</dt>
                                        <dd>{scenarioResult.output}</dd>
                                        <dt>Passing Assertions:</dt>
                                        <dd>
                                            {passedAssertions.length ? (
                                                <ul>
                                                    {passedAssertions.map(
                                                        assertionResult => (
                                                            <li
                                                                key={
                                                                    assertionResult.id
                                                                }
                                                            >
                                                                {getAssertionResultString(
                                                                    assertionResult
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                'None'
                                            )}
                                        </dd>
                                        <dt>Failing Assertions:</dt>
                                        <dd>
                                            {failedAssertions.length ? (
                                                <ul>
                                                    {failedAssertions.map(
                                                        assertionResult => (
                                                            <li
                                                                key={
                                                                    assertionResult.id
                                                                }
                                                            >
                                                                {getAssertionResultString(
                                                                    assertionResult
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                'None'
                                            )}
                                        </dd>
                                        <dt>Unexpected Behaviors:</dt>
                                        <dd>
                                            {scenarioResult.unexpectedBehaviors
                                                .length ? (
                                                <ul>
                                                    {scenarioResult.unexpectedBehaviors.map(
                                                        unexpected => (
                                                            <li
                                                                key={
                                                                    unexpected.id
                                                                }
                                                            >
                                                                {unexpected.otherUnexpectedBehaviorText ??
                                                                    unexpected.text}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                'None'
                                            )}
                                        </dd>
                                    </dl>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </>
    );
};

TestPlanResultsTable.propTypes = {
    test: PropTypes.shape({
        title: PropTypes.string.isRequired
    }),
    testResult: PropTypes.shape({
        scenarioResults: PropTypes.array.isRequired
    }),
    tableClassName: PropTypes.string
};

export default TestPlanResultsTable;
