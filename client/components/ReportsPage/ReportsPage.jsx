/* TEMP */
/* eslint react/prop-types: 0 */

import React from 'react';
import { useQuery } from '@apollo/client';
import { differenceBy } from 'lodash';
import { REPORTS_PAGE_QUERY } from './queries';
import { createGitHubIssueWithTitleAndBody } from '../TestRun';

const alphabetizeObjectBy = (object, getString) => {
    return Object.fromEntries(
        Object.entries(object).sort((a, b) => {
            // https://stackoverflow.com/a/45544166/3888572
            return getString(a).localeCompare(getString(b));
        })
    );
};

const sum = arr => arr.reduce((total, item) => total + item, 0);

const countAssertions = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    priority,
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        const all = scenarioResult[`${priority.toLowerCase()}AssertionResults`];
        if (passedOnly) return all.filter(each => each.passed).length;
        return all.length;
    };
    const countTestResult = testResult => {
        return sum(testResult.scenarioResults.map(countScenarioResult));
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countUnexpectedBehaviors = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult.unexpectedBehaviors.length;
    };
    const countTestResult = testResult => {
        return sum(testResult.scenarioResults.map(countScenarioResult));
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

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

const getMetrics = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const result = { scenarioResult, testResult, testPlanReport };
    const requiredAssertionsPassedCount = countAssertions({
        ...result,
        priority: 'REQUIRED',
        passedOnly: true
    });
    const requiredAssertionsCount = countAssertions({
        ...result,
        priority: 'REQUIRED'
    });
    const requiredAssertionsFailedCount =
        requiredAssertionsCount - requiredAssertionsPassedCount;

    const optionalAssertionsPassedCount = countAssertions({
        ...result,
        priority: 'OPTIONAL',
        passedOnly: true
    });
    const optionalAssertionsCount = countAssertions({
        ...result,
        priority: 'OPTIONAL'
    });
    const optionalAssertionsFailedCount =
        optionalAssertionsCount - optionalAssertionsPassedCount;

    const requiredFormatted = `${requiredAssertionsPassedCount} / ${requiredAssertionsCount}`;
    const optionalFormatted =
        optionalAssertionsCount === 0
            ? '-'
            : `${optionalAssertionsPassedCount} / ${optionalAssertionsCount}`;

    const unexpectedBehaviorCount = countUnexpectedBehaviors({ ...result });
    const unexpectedBehaviorsFormatted =
        unexpectedBehaviorCount === 0 ? '-' : unexpectedBehaviorCount;

    let supportLevel;
    if (unexpectedBehaviorCount > 0 || requiredAssertionsFailedCount > 0) {
        supportLevel = 'FAILING';
    } else if (optionalAssertionsFailedCount > 0) {
        supportLevel = 'ALL_REQUIRED';
    } else {
        supportLevel = 'FULL';
    }

    const supportPercent = Math.round(
        (requiredAssertionsPassedCount / requiredAssertionsCount) * 100
    );

    return {
        requiredAssertionsPassedCount,
        requiredAssertionsCount,
        requiredAssertionsFailedCount,
        optionalAssertionsPassedCount,
        optionalAssertionsCount,
        optionalAssertionsFailedCount,
        unexpectedBehaviorCount,
        requiredFormatted,
        optionalFormatted,
        unexpectedBehaviorsFormatted,
        supportLevel,
        supportPercent
    };
};

const getTestPlanTargetTitle = ({ browser, browserVersion, at, atVersion }) => {
    return `${browser.name} ${browserVersion} / ${at.name} ${atVersion}`;
};

const getTestPlanVersionTitle = testPlanVersion => {
    return testPlanVersion.title || `"${testPlanVersion.testPlan.directory}"`;
};

const TestResultSummary = ({ testPlanReport, testResult }) => {
    const test = testResult.test;

    const gitHubIssueLinkWithTitleAndBody = createGitHubIssueWithTitleAndBody({
        test,
        testPlanReport,
        isReportViewer: true
    });

    return (
        <>
            <h2>Details for test: {test.title}</h2>
            <a
                href={gitHubIssueLinkWithTitleAndBody}
                target="_blank"
                rel="noreferrer"
            >
                Raise an Issue
            </a>
            <br />
            <a href={test.renderedUrl} target="_blank" rel="noreferrer">
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
                    {testResult.scenarioResults.map(scenarioResult => {
                        const passedAssertions = scenarioResult.assertionResults.filter(
                            assertionResult => assertionResult.passed
                        );
                        const failedAssertions = scenarioResult.assertionResults.filter(
                            assertionResult => !assertionResult.passed
                        );
                        const metrics = getMetrics({ scenarioResult });
                        return (
                            <tr key={scenarioResult.id}>
                                <td>{scenarioResult.scenario.command.text}</td>
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
            </table>
        </>
    );
};

const TestPlanReportSummary = ({ testPlanReport }) => {
    const skippedTests = differenceBy(
        testPlanReport.runnableTests,
        testPlanReport.finalizedTestResults,
        testOrTestResult => testOrTestResult.test?.id ?? testOrTestResult.id
    );
    const overallMetrics = getMetrics({ testPlanReport });

    const { testPlanVersion, testPlanTarget } = testPlanReport;
    const { exampleUrl, designPatternUrl } = testPlanVersion.metadata;
    return (
        <>
            <h3>Metadata</h3>
            <ul>
                {exampleUrl ? (
                    <li>
                        <a href={exampleUrl} target="_blank" rel="noreferrer">
                            Example Under Test
                        </a>
                    </li>
                ) : null}
                {designPatternUrl ? (
                    <li>
                        <a
                            href={designPatternUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Design Pattern
                        </a>
                    </li>
                ) : null}
            </ul>

            <h3>{getTestPlanTargetTitle(testPlanTarget)}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Required Assertions</th>
                        <th>Optional Assertions</th>
                        <th>Unexpected Behaviors</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>All Tests</td>
                        <td>{overallMetrics.requiredFormatted}</td>
                        <td>{overallMetrics.optionalFormatted}</td>
                        <td>{overallMetrics.unexpectedBehaviorsFormatted}</td>
                    </tr>
                    {testPlanReport.finalizedTestResults.map(testResult => {
                        const testResultMetrics = getMetrics({ testResult });
                        return (
                            <tr key={testResult.id}>
                                <td>{testResult.test.title}</td>
                                <td>{testResultMetrics.requiredFormatted}</td>
                                <td>{testResultMetrics.optionalFormatted}</td>
                                <td>
                                    {
                                        testResultMetrics.unexpectedBehaviorsFormatted
                                    }
                                </td>
                            </tr>
                        );
                    })}
                    {skippedTests.map(test => (
                        <tr key={test.id}>
                            <td>{test.title}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

const ReportsPage = () => {
    const { data } = useQuery(REPORTS_PAGE_QUERY);
    if (!data) return null;

    const testPlanReportsById = {};
    let testPlanTargetsById = {};
    let testPlanVersionsById = {};
    data.testPlanReports.forEach(testPlanReport => {
        const { testPlanTarget, testPlanVersion } = testPlanReport;
        testPlanReportsById[testPlanReport.id] = testPlanReport;
        testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
        testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
    });
    testPlanTargetsById = alphabetizeObjectBy(
        testPlanTargetsById,
        (key, value) => getTestPlanTargetTitle(value)
    );
    testPlanVersionsById = alphabetizeObjectBy(
        testPlanVersionsById,
        (key, value) => getTestPlanVersionTitle(value)
    );

    const tabularReports = {};
    Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
        tabularReports[testPlanVersionId] = {};
        Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
            tabularReports[testPlanVersionId][testPlanTargetId] = null;
        });
    });
    data.testPlanReports.forEach(testPlanReport => {
        const { testPlanTarget, testPlanVersion } = testPlanReport;
        tabularReports[testPlanVersion.id][testPlanTarget.id] = testPlanReport;
    });

    return (
        <>
            <h1>Test Reports</h1>
            <table>
                <thead>
                    <tr>
                        <th>Test Plan</th>
                        {Object.values(testPlanTargetsById).map(
                            testPlanTarget => (
                                <th key={testPlanTarget.id}>
                                    {getTestPlanTargetTitle(testPlanTarget)}
                                </th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {Object.values(testPlanVersionsById).map(
                        testPlanVersion => {
                            const title = getTestPlanVersionTitle(
                                testPlanVersion
                            );

                            return (
                                <tr key={testPlanVersion.id}>
                                    <td>{title}</td>
                                    {Object.values(testPlanTargetsById).map(
                                        testPlanTarget => {
                                            const testPlanReport =
                                                tabularReports[
                                                    testPlanVersion.id
                                                ][testPlanTarget.id];
                                            const metrics = getMetrics({
                                                testPlanReport
                                            });
                                            return (
                                                <td key={testPlanReport.id}>
                                                    {metrics.supportPercent}
                                                </td>
                                            );
                                        }
                                    )}
                                </tr>
                            );
                        }
                    )}
                </tbody>
            </table>

            <h1>Test Report</h1>
            {data.testPlanReports.map(testPlanReport => (
                <>
                    <TestPlanReportSummary
                        key={testPlanReport.id}
                        testPlanReport={testPlanReport}
                    />
                    {testPlanReport.finalizedTestResults.map(testResult => (
                        <TestResultSummary
                            key={testResult.id}
                            testPlanReport={testPlanReport}
                            testResult={testResult}
                        />
                    ))}
                </>
            ))}
            <div style={{ height: '200px' }} />
        </>
    );
};

export default ReportsPage;
