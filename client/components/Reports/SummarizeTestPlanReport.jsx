import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
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
    faHome,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { differenceBy } from 'lodash';
import { convertDateToString } from '../../utils/formatter';
import DisclaimerInfo from '../DisclaimerInfo';

const DisclosureParent = styled.div`
    border: 1px solid #d3d5da;
    border-radius: 3px;

    h3 {
        margin: 0;
        padding: 0;
    }
`;

const DisclosureButton = styled.button`
    position: relative;
    width: 100%;
    margin: 0;
    padding: 1.25rem;
    text-align: left;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 3px;
    background-color: transparent;

    &:hover,
    &:focus {
        padding: 1.25rem;
        border: 0 solid #005a9c;
        background-color: #def;
        cursor: pointer;
    }

    svg {
        position: absolute;
        margin: 0;
        top: 50%;
        right: 1.25rem;

        color: #969696;
        transform: translateY(-50%);
    }
`;

const DisclosureContainer = styled.div`
    display: ${({ show }) => (show ? 'flex' : 'none')};
    flex-direction: column;
    gap: 1.25rem;

    background-color: #f8f9fa;
    padding: 1.25rem;
    border-top: 1px solid #d3d5da;

    ul {
        margin-bottom: 0;
    }
`;

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

const getTestersRunHistory = (
    testPlanReport,
    testId,
    draftTestPlanRuns = []
) => {
    const { id: testPlanReportId, at, browser } = testPlanReport;
    let lines = [];

    draftTestPlanRuns.forEach(draftTestPlanRun => {
        const { testPlanReport, testResults, tester } = draftTestPlanRun;

        const testResult = testResults.find(item => item.test.id === testId);
        if (
            testPlanReportId === testPlanReport.id &&
            testPlanReport.status === 'FINALIZED' &&
            testResult?.completedAt
        ) {
            lines.push(
                <li
                    key={`${testResult.atVersion.id}-${testResult.browserVersion.id}-${testResult.test.id}-${tester.username}`}
                >
                    Tested with{' '}
                    <b>
                        {at.name} {testResult.atVersion.name}
                    </b>{' '}
                    and{' '}
                    <b>
                        {browser.name} {testResult.browserVersion.name}
                    </b>{' '}
                    by{' '}
                    <b>
                        <a href={`https://github.com/${tester.username}`}>
                            {tester.username}
                        </a>
                    </b>{' '}
                    on{' '}
                    {convertDateToString(
                        testResult.completedAt,
                        'MMMM DD, YYYY'
                    )}
                    .
                </li>
            );
        }
    });

    return <ul>{lines}</ul>;
};

const SummarizeTestPlanReport = ({ testPlanReport }) => {
    const { testPlanVersion, at, browser } = testPlanReport;

    const [runHistoryItems, setRunHistoryItems] = useState({});

    // Construct testPlanTarget
    const testPlanTarget = {
        id: `${at.id}${browser.id}`,
        at,
        browser
    };

    const skippedTests = differenceBy(
        testPlanReport.runnableTests,
        testPlanReport.finalizedTestResults,
        testOrTestResult => testOrTestResult.test?.id ?? testOrTestResult.id
    );

    const onClickRunHistory = testResultId => {
        // { testResultId: boolean } ]
        if (!runHistoryItems[testResultId])
            setRunHistoryItems({ ...runHistoryItems, [testResultId]: true });
        else
            setRunHistoryItems({
                ...runHistoryItems,
                [testResultId]: !runHistoryItems[testResultId]
            });
    };

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
            <Breadcrumb
                label="Breadcrumb"
                listProps={{
                    'aria-label': 'Breadcrumb Navigation'
                }}
            >
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
                    { test, testPlanReport }
                );

                // TODO: fix renderedUrl
                let modifiedRenderedUrl = test.renderedUrl.replace(
                    /.+(?=\/tests)/,
                    'https://aria-at.netlify.app'
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
                                    href={modifiedRenderedUrl}
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

                        <DisclosureParent>
                            <h3>
                                <DisclosureButton
                                    id={`run-history-${testResult.id}-button`}
                                    type="button"
                                    aria-expanded={
                                        !!runHistoryItems[testResult.id]
                                    }
                                    aria-controls={`run-history-${testResult.id}`}
                                    onClick={() =>
                                        onClickRunHistory(testResult.id)
                                    }
                                >
                                    Run History
                                    <FontAwesomeIcon
                                        icon={
                                            runHistoryItems[testResult.id]
                                                ? faChevronUp
                                                : faChevronDown
                                        }
                                    />
                                </DisclosureButton>
                            </h3>
                            <DisclosureContainer
                                role="region"
                                id={`run-history-${testResult.id}`}
                                aria-labelledby={`run-history-${testResult.id}-button`}
                                show={!!runHistoryItems[testResult.id]}
                            >
                                {getTestersRunHistory(
                                    testPlanReport,
                                    testResult.test.id,
                                    testPlanReport.draftTestPlanRuns
                                )}
                            </DisclosureContainer>
                        </DisclosureParent>
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
        id: PropTypes.string.isRequired,
        testPlanVersion: PropTypes.object.isRequired,
        runnableTests: PropTypes.arrayOf(PropTypes.object.isRequired)
            .isRequired,
        at: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        browser: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
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
        ).isRequired,
        draftTestPlanRuns: PropTypes.arrayOf(
            PropTypes.shape({
                tester: PropTypes.shape({
                    username: PropTypes.string.isRequired
                })
            })
        )
    }).isRequired
};

export default SummarizeTestPlanReport;
