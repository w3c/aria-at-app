import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import styled from '@emotion/styled';
import alphabetizeObjectBy from '../../utils/alphabetizeObjectBy';
import { none } from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import ClippedProgressBar from '@components/common/ClippedProgressBar';

const FullHeightContainer = styled(Container)`
    min-height: calc(100vh - 64px);
`;

const PhaseText = styled.span`
    font-size: 12px;
    margin-left: 6px;
    padding: 4px 6px;
    border-radius: 12px;
    overflow: hidden;
    white-space: nowrap;
    color: white;

    &.candidate {
        background: #f87f1b;
    }

    &.recommended {
        background: #b253f8;
    }
`;

const SummarizeTestPlanReports = ({ testPlanReports }) => {
    if (!testPlanReports.length) {
        return (
            <FullHeightContainer id="main" as="main" tabIndex="-1">
                <Helmet>
                    <title>Test Reports | ARIA-AT</title>
                </Helmet>
                <h1>Test Reports</h1>
                <p>
                    There are no results to show just yet. Please check back
                    soon!
                </p>
            </FullHeightContainer>
        );
    }

    const testPlanReportsById = {};
    let testPlanTargetsById = {};
    let testPlanVersionsById = {};
    testPlanReports.forEach(testPlanReport => {
        const { testPlanVersion, at, browser } = testPlanReport;

        // Construct testPlanTarget
        const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
        testPlanReportsById[testPlanReport.id] = testPlanReport;
        testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
        testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
    });
    testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
        getTestPlanTargetTitle(keyValue[1])
    );
    testPlanVersionsById = alphabetizeObjectBy(testPlanVersionsById, keyValue =>
        getTestPlanVersionTitle(keyValue[1])
    );

    const tabularReports = {};
    const tabularReportsByDirectory = {};
    Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
        const directory =
            testPlanVersionsById[testPlanVersionId].testPlan.directory;

        tabularReports[testPlanVersionId] = {};
        if (!tabularReportsByDirectory[directory])
            tabularReportsByDirectory[directory] = {};
        tabularReportsByDirectory[directory][testPlanVersionId] = {};
        Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
            tabularReports[testPlanVersionId][testPlanTargetId] = null;
            tabularReportsByDirectory[directory][testPlanVersionId][
                testPlanTargetId
            ] = null;
        });
    });
    testPlanReports.forEach(testPlanReport => {
        const { testPlanVersion, at, browser } = testPlanReport;
        const directory = testPlanVersion.testPlan.directory;

        // Construct testPlanTarget
        const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
        tabularReports[testPlanVersion.id][testPlanTarget.id] = testPlanReport;
        tabularReportsByDirectory[directory][testPlanVersion.id][
            testPlanTarget.id
        ] = testPlanReport;
        tabularReportsByDirectory[directory][
            testPlanVersion.id
        ].testPlanVersion = testPlanVersion;
    });

    const combineObject = originalObject => {
        let combinedTestPlanVersionIdArray = [];
        let resultTestPlanTargets = Object.values(originalObject)[0];
        combinedTestPlanVersionIdArray.push(
            resultTestPlanTargets.testPlanVersion.id
        );

        for (let i = 1; i < Object.values(originalObject).length; i++) {
            let testPlanTargets = Object.values(originalObject)[i];
            if (
                !combinedTestPlanVersionIdArray.includes(
                    testPlanTargets.testPlanVersion.id
                )
            )
                combinedTestPlanVersionIdArray.push(
                    testPlanTargets.testPlanVersion.id
                );

            delete testPlanTargets.testPlanVersion;

            // Check if exists in newObject and add/update newObject based on criteria
            Object.keys(testPlanTargets).forEach(testPlanTargetKey => {
                if (!resultTestPlanTargets[testPlanTargetKey])
                    resultTestPlanTargets[testPlanTargetKey] =
                        testPlanTargets[testPlanTargetKey];
                else {
                    // Compare if latest version
                    const latestPrevDate =
                        new Date(
                            testPlanTargets[
                                testPlanTargetKey
                            ]?.recommendedStatusReachedAt
                        ) >
                        new Date(
                            testPlanTargets[
                                testPlanTargetKey
                            ]?.candidateStatusReachedAt
                        )
                            ? new Date(
                                  testPlanTargets[
                                      testPlanTargetKey
                                  ]?.recommendedStatusReachedAt
                              )
                            : new Date(
                                  testPlanTargets[
                                      testPlanTargetKey
                                  ]?.candidateStatusReachedAt
                              );
                    const latestCurrDate =
                        new Date(
                            resultTestPlanTargets[
                                testPlanTargetKey
                            ]?.recommendedStatusReachedAt
                        ) >
                        new Date(
                            resultTestPlanTargets[
                                testPlanTargetKey
                            ]?.candidateStatusReachedAt
                        )
                            ? new Date(
                                  resultTestPlanTargets[
                                      testPlanTargetKey
                                  ]?.recommendedStatusReachedAt
                              )
                            : new Date(
                                  resultTestPlanTargets[
                                      testPlanTargetKey
                                  ]?.candidateStatusReachedAt
                              );

                    if (latestPrevDate > latestCurrDate)
                        resultTestPlanTargets[testPlanTargetKey] =
                            testPlanTargets[testPlanTargetKey];
                }
            });
        }
        return { resultTestPlanTargets, combinedTestPlanVersionIdArray };
    };

    return (
        <FullHeightContainer id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Test Reports | ARIA-AT</title>
            </Helmet>
            <h1>Test Reports</h1>
            <h2>Introduction</h2>
            <p>
                This page offers a high-level view of all results which have
                been collected, reviewed and published by the ARIA-AT project.
                Follow a link in the table below to view detailed results.
            </p>
            <h2>Support Levels</h2>
            <p id="support-levels-table-description">
                The percentage of assertions which passed when each Test Plan
                was executed by a given Assistive Technology and Browser.
            </p>
            <Table bordered responsive aria-label="Support Levels">
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
                    {Object.values(tabularReportsByDirectory)
                        .sort((a, b) =>
                            Object.values(a)[0].testPlanVersion.title <
                            Object.values(b)[0].testPlanVersion.title
                                ? -1
                                : 1
                        )
                        .map(tabularReport => {
                            let status = 'Recommended';
                            let reportResult = null;
                            let testPlanVersionId = null;

                            // Evaluate what is prioritised across the
                            // collection of testPlanVersions
                            if (Object.values(tabularReport).length > 1) {
                                const {
                                    resultTestPlanTargets,
                                    combinedTestPlanVersionIdArray
                                } = combineObject(tabularReport);
                                reportResult = resultTestPlanTargets;
                                testPlanVersionId = combinedTestPlanVersionIdArray.join(
                                    ','
                                );
                            } else {
                                reportResult = Object.values(tabularReport)[0];
                                testPlanVersionId =
                                    reportResult.testPlanVersion.id;
                            }

                            const testPlanVersion =
                                reportResult.testPlanVersion;
                            delete reportResult.testPlanVersion;

                            Object.values(testPlanTargetsById).forEach(
                                testPlanTarget => {
                                    const testPlanReport =
                                        reportResult[testPlanTarget.id];

                                    if (testPlanReport?.status === 'CANDIDATE')
                                        status = 'Candidate';
                                }
                            );

                            return (
                                <tr key={testPlanVersionId}>
                                    <td>
                                        <Link
                                            to={`/report/${testPlanVersionId}`}
                                            aria-label={`${getTestPlanVersionTitle(
                                                testPlanVersion
                                            )}, ${status} report`}
                                        >
                                            {getTestPlanVersionTitle(
                                                testPlanVersion
                                            )}
                                        </Link>
                                        <PhaseText
                                            className={status.toLowerCase()}
                                            aria-hidden
                                        >
                                            {status}
                                        </PhaseText>
                                    </td>
                                    {Object.values(testPlanTargetsById).map(
                                        testPlanTarget => {
                                            const testPlanReport =
                                                reportResult[testPlanTarget.id];
                                            if (!testPlanReport) {
                                                return (
                                                    <td
                                                        key={`${testPlanVersion.id}-${testPlanTarget.id}`}
                                                    >
                                                        {none}
                                                    </td>
                                                );
                                            }
                                            const metrics =
                                                testPlanReport.metrics;
                                            return (
                                                <td key={testPlanReport.id}>
                                                    <Link
                                                        to={
                                                            `/report/${testPlanReport.testPlanVersion.id}` +
                                                            `/targets/${testPlanReport.id}`
                                                        }
                                                    >
                                                        <ClippedProgressBar
                                                            progress={
                                                                metrics.supportPercent
                                                            }
                                                            label={`${getTestPlanTargetTitle(
                                                                testPlanTarget
                                                            )}, ${
                                                                metrics.supportPercent
                                                            }% completed`}
                                                        />
                                                    </Link>
                                                </td>
                                            );
                                        }
                                    )}
                                </tr>
                            );
                        })}
                    {/*{Object.values(testPlanVersionsById)
                        .sort((a, b) => (a.title < b.title ? -1 : 1))
                        .map(testPlanVersion => {
                            let status = 'Recommended';
                            Object.values(testPlanTargetsById).forEach(
                                testPlanTarget => {
                                    const testPlanReport =
                                        tabularReports[testPlanVersion.id][
                                            testPlanTarget.id
                                        ];

                                    if (testPlanReport?.status === 'CANDIDATE')
                                        status = 'Candidate';
                                }
                            );

                            return (
                                <tr key={testPlanVersion.id}>
                                    <td>
                                        <Link
                                            to={`/report/${testPlanVersion.id}`}
                                            aria-label={`${getTestPlanVersionTitle(
                                                testPlanVersion
                                            )}, ${status} report`}
                                        >
                                            {getTestPlanVersionTitle(
                                                testPlanVersion
                                            )}
                                        </Link>
                                        <PhaseText
                                            className={status.toLowerCase()}
                                            aria-hidden
                                        >
                                            {status}
                                        </PhaseText>
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
                                            const metrics =
                                                testPlanReport.metrics;
                                            return (
                                                <td key={testPlanReport.id}>
                                                    <Link
                                                        to={
                                                            `/report/${testPlanVersion.id}` +
                                                            `/targets/${testPlanReport.id}`
                                                        }
                                                    >
                                                        <ClippedProgressBar
                                                            progress={
                                                                metrics.supportPercent
                                                            }
                                                            label={`${getTestPlanTargetTitle(
                                                                testPlanTarget
                                                            )}, ${
                                                                metrics.supportPercent
                                                            }% completed`}
                                                        />
                                                    </Link>
                                                </td>
                                            );
                                        }
                                    )}
                                </tr>
                            );
                        })}*/}
                </tbody>
            </Table>
        </FullHeightContainer>
    );
};

SummarizeTestPlanReports.propTypes = {
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

export default SummarizeTestPlanReports;
