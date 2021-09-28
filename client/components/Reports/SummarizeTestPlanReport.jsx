import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { createGitHubIssueWithTitleAndBody } from '../TestRun';
import getMetrics from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';

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

const SummarizeTestPlanReport = ({ testPlanReport }) => {
    const { testPlanVersion, testPlanTarget } = testPlanReport;
    return (
        <Fragment>
            <h1>
                {getTestPlanVersionTitle(testPlanVersion)}&nbsp;with&nbsp;
                {getTestPlanTargetTitle(testPlanTarget)}
            </h1>
            {testPlanReport.finalizedTestResults.map(testResult => {
                const test = testResult.test;

                const gitHubIssueLinkWithTitleAndBody = createGitHubIssueWithTitleAndBody(
                    {
                        test,
                        testPlanReport,
                        isReportViewer: true
                    }
                );

                return (
                    <div key={testResult.id} id={`result-${testResult.id}`}>
                        <h2>Details for test: {test.title}</h2>
                        <a
                            href={gitHubIssueLinkWithTitleAndBody}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Raise an Issue
                        </a>
                        <br />
                        <a
                            href={test.renderedUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open Test
                        </a>
                        <table>
                            <thead>
                                <tr>
                                    <th>Command</th>
                                    <th>Support</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testResult.scenarioResults.map(
                                    scenarioResult => {
                                        const passedAssertions = scenarioResult.assertionResults.filter(
                                            assertionResult =>
                                                assertionResult.passed
                                        );
                                        const failedAssertions = scenarioResult.assertionResults.filter(
                                            assertionResult =>
                                                !assertionResult.passed
                                        );
                                        const metrics = getMetrics({
                                            scenarioResult
                                        });
                                        return (
                                            <tr key={scenarioResult.id}>
                                                <td>
                                                    {
                                                        scenarioResult.scenario
                                                            .command.text
                                                    }
                                                </td>
                                                <td>{metrics.supportLevel}</td>
                                                <td>
                                                    <dl>
                                                        <dt>Output:</dt>
                                                        <dd>
                                                            {
                                                                scenarioResult.output
                                                            }
                                                        </dd>
                                                        <dt>
                                                            Passing Assertions:
                                                        </dt>
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
                                                        <dt>
                                                            Failing Assertions:
                                                        </dt>
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
                                                        <dt>
                                                            Unexpected
                                                            Behaviors:
                                                        </dt>
                                                        <dd>
                                                            {scenarioResult
                                                                .unexpectedBehaviors
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
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </Fragment>
    );
};

SummarizeTestPlanReport.propTypes = {
    testPlanReport: PropTypes.shape({
        testPlanVersion: PropTypes.object.isRequired,
        testPlanTarget: PropTypes.object.isRequired,
        finalizedTestResults: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                test: PropTypes.shape({
                    title: PropTypes.string.isRequired,
                    renderedUrl: PropTypes.string.isRequired
                }).isRequired,
                scenarioResults: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.string.isRequired,
                        output: PropTypes.string.isRequired,
                        assertionResults: PropTypes.arrayOf(
                            PropTypes.shape({
                                id: PropTypes.string.isRequired,
                                passed: PropTypes.bool.isRequired,
                                failedReason: PropTypes.string,
                                assertion: PropTypes.shape({
                                    text: PropTypes.string.isRequired
                                }).isRequired
                            })
                        ),
                        unexpectedBehaviors: PropTypes.arrayOf({
                            id: PropTypes.string.isRequired,
                            text: PropTypes.string.isRequired,
                            otherUnexpectedBehaviorText: PropTypes.string
                        }).isRequired
                    }).isRequired
                ).isRequired
            }).isRequired
        ).isRequired
    }).isRequired
};

export default SummarizeTestPlanReport;
