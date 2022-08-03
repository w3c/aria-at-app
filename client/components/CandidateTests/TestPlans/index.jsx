import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from '@emotion/styled';
import { Container, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faCheck } from '@fortawesome/free-solid-svg-icons';
import alphabetizeObjectBy from '@client/utils/alphabetizeObjectBy';
import {
    getTestPlanTargetTitle,
    getTestPlanVersionTitle
} from '@components/Reports/getTitles';
import getMetrics, { none } from '@components/Reports/getMetrics';

const FullHeightContainer = styled(Container)`
    min-height: calc(100vh - 64px);
`;

const StatusText = styled.span`
    height: 1.625rem;
    font-size: 0.875rem;
    padding: 4px 10px;
    border-radius: 1.625rem;

    &.ready-for-review {
        border: 2px solid #edbb1d;
    }

    &.issue {
        border: 2px solid #f87f1b;

        svg {
            color: #f87f1b;
        }
    }

    &.ok {
        border: 2px solid #309d08;

        svg {
            color: #309d08;
        }
    }

    &.dot {
        height: 10px;
        width: 10px;
        padding: 0;
        margin-right: 8px;
        border-radius: 50%;
        background: #edbb1d;
    }
`;

const TestPlans = ({ testPlanReports }) => {
    if (!testPlanReports.length) {
        return (
            <FullHeightContainer id="main" as="main" tabIndex="-1">
                <Helmet>
                    <title>Candidate Tests | ARIA-AT</title>
                </Helmet>
                <h1>Candidate Tests</h1>
                <p>
                    There are no results to show just yet. Please check back
                    soon!
                </p>
            </FullHeightContainer>
        );
    }

    const constructTableForAtById = atId => {
        const testPlanReportsByAtId = testPlanReports.filter(
            t => t.at.id === atId
        );
        if (!testPlanReportsByAtId.length) return none;

        const testPlanReportsById = {};
        let testPlanTargetsById = {};
        let testPlanVersionsById = {};
        testPlanReportsByAtId.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            testPlanReportsById[testPlanReport.id] = testPlanReport;
            testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
            testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
        });
        testPlanTargetsById = alphabetizeObjectBy(
            testPlanTargetsById,
            keyValue => getTestPlanTargetTitle(keyValue[1])
        );
        testPlanVersionsById = alphabetizeObjectBy(
            testPlanVersionsById,
            keyValue => getTestPlanVersionTitle(keyValue[1])
        );

        const tabularReports = {};
        Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
            tabularReports[testPlanVersionId] = {};
            Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
                tabularReports[testPlanVersionId][testPlanTargetId] = null;
            });
        });
        testPlanReportsByAtId.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            tabularReports[testPlanVersion.id][
                testPlanTarget.id
            ] = testPlanReport;
        });

        return (
            <>
                <Table
                    bordered
                    responsive
                    aria-label={testPlanReportsByAtId[0].at.name}
                >
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            {Object.values(testPlanTargetsById).map(
                                testPlanTarget => (
                                    <th key={testPlanTarget.id}>
                                        {testPlanTarget.browser.name}
                                    </th>
                                )
                            )}
                            <th>Review Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(testPlanVersionsById).map(
                            testPlanVersion => {
                                return (
                                    <tr key={testPlanVersion.id}>
                                        <td>
                                            <Link
                                                to={`/candidate-tests/${testPlanVersion.id}`}
                                            >
                                                {getTestPlanVersionTitle(
                                                    testPlanVersion
                                                )}
                                            </Link>
                                        </td>
                                        {Object.values(testPlanTargetsById).map(
                                            testPlanTarget => {
                                                const testPlanReport =
                                                    tabularReports[
                                                        testPlanVersion.id
                                                    ][testPlanTarget.id];
                                                if (!testPlanReport) {
                                                    return (
                                                        <td
                                                            key={`${testPlanVersion.id}-${testPlanTarget.id}`}
                                                        >
                                                            {none}
                                                        </td>
                                                    );
                                                }
                                                const metrics = getMetrics({
                                                    testPlanReport
                                                });
                                                return (
                                                    <td key={testPlanReport.id}>
                                                        <Link
                                                            to={`/candidate-tests/${testPlanVersion.id}`}
                                                        >
                                                            <div
                                                                className="progress"
                                                                aria-label={`${getTestPlanTargetTitle(
                                                                    testPlanTarget
                                                                )}, ${
                                                                    metrics.supportPercent
                                                                }% completed`}
                                                            >
                                                                <div
                                                                    className="progress-bar bg-info"
                                                                    style={{
                                                                        width: `${metrics.supportPercent}%`
                                                                    }}
                                                                >
                                                                    {
                                                                        metrics.supportPercent
                                                                    }
                                                                    %
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                );
                                            }
                                        )}
                                        <td>
                                            <StatusText className="ready-for-review">
                                                <StatusText
                                                    className="dot"
                                                    aria-hidden={true}
                                                />
                                                Ready for Review
                                            </StatusText>
                                            <StatusText className="issue">
                                                <FontAwesomeIcon
                                                    icon={faFlag}
                                                />
                                                2 open issues
                                            </StatusText>
                                            <StatusText className="ok">
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                />
                                                Ok
                                            </StatusText>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </Table>
            </>
        );
    };

    return (
        <FullHeightContainer id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Candidate Tests | ARIA-AT</title>
            </Helmet>
            <h1>Candidate Tests</h1>
            <h2>Introduction</h2>
            <p>
                This page summarizes the test results for each AT and Browser
                which executed the Test Plan.
            </p>
            <h2>JAWS</h2>
            {constructTableForAtById('1')}
            <h2>NVDA</h2>
            {constructTableForAtById('2')}
            <h2>VoiceOver for macOS</h2>
            {constructTableForAtById('3')}
        </FullHeightContainer>
    );
};

TestPlans.propTypes = {
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            testPlanVersion: PropTypes.shape({
                id: PropTypes.string.isRequired,
                title: PropTypes.string,
                testPlan: PropTypes.shape({
                    directory: PropTypes.string.isRequired
                }).isRequired
            }).isRequired
        })
    ).isRequired
};

export default TestPlans;
