import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { createGitHubIssueWithTitleAndBody } from '../TestRun';
import getMetrics from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import { Breadcrumb, Button, Container, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationCircle,
    faExternalLinkAlt,
    faHome
} from '@fortawesome/free-solid-svg-icons';
import { differenceBy } from 'lodash';
import DisclaimerInfo from '../DisclaimerInfo';

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

    const skippedTests = differenceBy(
        testPlanReport.runnableTests,
        testPlanReport.finalizedTestResults,
        testOrTestResult => testOrTestResult.test?.id ?? testOrTestResult.id
    );

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>
                    {getTestPlanTargetTitle(testPlanTarget)}&nbsp;for&nbsp;
                    {getTestPlanVersionTitle(testPlanVersion)} | ARIA-AT Reports
                </title>
            </Helmet>
            <h1>
                {getTestPlanVersionTitle(testPlanVersion)}&nbsp;with&nbsp;
                {getTestPlanTargetTitle(testPlanTarget)}
            </h1>
            <Breadcrumb>
                <LinkContainer to="/reports">
                    <Breadcrumb.Item>
                        <FontAwesomeIcon icon={faHome} />
                        Test Reports
                    </Breadcrumb.Item>
                </LinkContainer>
                <LinkContainer to={`/reports/${testPlanVersion.id}`}>
                    <Breadcrumb.Item>
                        {getTestPlanVersionTitle(testPlanVersion)}
                    </Breadcrumb.Item>
                </LinkContainer>
                <Breadcrumb.Item active>
                    {getTestPlanTargetTitle(testPlanTarget)}
                </Breadcrumb.Item>
            </Breadcrumb>
            <h2>Introduction</h2>
            <p>
                This page shows detailed results for each test, including
                individual commands that the tester entered into the AT, the
                output which was captured from the AT in response, and whether
                that output was deemed passing or failing for each of the
                assertions. The open test button next to each test allows you to
                preview the test in your browser.
            </p>
            {testPlanReport.finalizedTestResults.map(testResult => {
                const test = testResult.test;

                const gitHubIssueLinkWithTitleAndBody = createGitHubIssueWithTitleAndBody(
                    { test, testPlanReport, isReportViewer: true }
                );

                return (
                    <Fragment key={testResult.id}>
                        <div className="test-result-heading">
                            <h2 id={`result-${testResult.id}`} tabIndex="-1">
                                <span className="test-details">
                                    Details for test:
                                </span>
                                {test.title}
                                <DisclaimerInfo />
                            </h2>
                            <div className="test-result-buttons">
                                <Button
                                    target="_blank"
                                    rel="noreferrer"
                                    href={gitHubIssueLinkWithTitleAndBody}
                                    variant="secondary"
                                >
                                    <FontAwesomeIcon
                                        icon={faExclamationCircle}
                                    />
                                    Raise an Issue
                                </Button>
                                <Button
                                    target="_blank"
                                    rel="noreferrer"
                                    href={test.renderedUrl}
                                    variant="secondary"
                                >
                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                    Open Test
                                </Button>
                            </div>
                        </div>
                        <Table
                            bordered
                            responsive
                            aria-label={`Results for test ${test.title}`}
                        >
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
                                                    {scenarioResult.scenario.commands
                                                        .map(({ text }) => text)
                                                        .join(', then ')}
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
                        </Table>
                    </Fragment>
                );
            })}
            {skippedTests.length ? (
                <Fragment>
                    <div className="skipped-tests-heading">
                        <h2 id="skipped-tests" tabIndex="-1">
                            Skipped Tests
                        </h2>
                        <p>
                            The following tests have been skipped in this test
                            run:
                        </p>
                    </div>
                    <ol className="skipped-tests">
                        {skippedTests.map(test => (
                            <li key={test.id}>
                                <a href={test.renderedUrl}>{test.title}</a>
                            </li>
                        ))}
                    </ol>
                </Fragment>
            ) : null}
        </Container>
    );
};

SummarizeTestPlanReport.propTypes = {
    testPlanReport: PropTypes.shape({
        testPlanVersion: PropTypes.object.isRequired,
        testPlanTarget: PropTypes.object.isRequired,
        runnableTests: PropTypes.arrayOf(PropTypes.object.isRequired)
            .isRequired,
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
                            }).isRequired
                        ).isRequired,
                        unexpectedBehaviors: PropTypes.arrayOf(
                            PropTypes.shape({
                                id: PropTypes.string.isRequired,
                                text: PropTypes.string.isRequired,
                                otherUnexpectedBehaviorText: PropTypes.string
                            }).isRequired
                        ).isRequired
                    }).isRequired
                ).isRequired
            }).isRequired
        ).isRequired
    }).isRequired
};

export default SummarizeTestPlanReport;
