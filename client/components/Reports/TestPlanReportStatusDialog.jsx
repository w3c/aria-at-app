import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'react-bootstrap';
import styled from '@emotion/styled';
import { getRequiredReports } from './isRequired';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import getMetrics from './getMetrics';
import { calculateTestPlanReportCompletionPercentage } from './calculateTestPlanReportCompletionPercentage';

const TestPlanReportStatusModal = styled(Modal)`
    .modal-dialog {
        max-width: 90%;
        width: max-content;
    }
`;

const TestPlanReportStatusTableHeader = styled.th`
    background-color: var(--bs-table-bg) !important;
    font-size: 1.25rem;
    font-weight: 600;
`;

const TestPlanReportStatusTable = styled(Table)`
    td,
    th {
        padding-left: 1rem;
        min-width: 165px;
    }
`;

const IncompleteStatusReport = styled.span`
    min-width: 5rem;
    display: inline-block;
`;

const TestPlanReportStatusDialog = ({ testPlanVersion, show, handleHide }) => {
    const { data } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const { testPlanReports } = testPlanVersion;

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { isSignedIn, isAdmin } = auth;

    const requiredReports = useMemo(
        () => getRequiredReports(testPlanVersion.phase),
        [testPlanVersion.phase]
    );

    const [matchedReports, unmatchedTestPlanReports, unmatchedRequiredReports] =
        useMemo(() => {
            const matched = [];
            const unmatchedTestPlan = [...testPlanReports];
            const unmatchedRequired = [...requiredReports];

            for (let i = 0; i < requiredReports.length; i++) {
                for (let j = 0; j < testPlanReports.length; j++) {
                    if (
                        requiredReports[i].at.name ===
                            testPlanReports[j].at.name &&
                        requiredReports[i].browser.name ===
                            testPlanReports[j].browser.name
                    ) {
                        if (testPlanReports[j].status === 'DRAFT') {
                            matched.push({
                                ...testPlanReports[j],
                                metrics: getMetrics(testPlanReports[j])
                            });
                        } else {
                            matched.push(testPlanReports[j]);
                        }

                        unmatchedTestPlan.splice(
                            unmatchedTestPlan.indexOf(testPlanReports[j]),
                            1
                        );
                        unmatchedRequired.splice(
                            unmatchedRequired.indexOf(requiredReports[i]),
                            1
                        );
                        break;
                    }
                }
            }
            return [matched, unmatchedTestPlan, unmatchedRequired];
        }, [testPlanReports, requiredReports]);

    const renderTableRow = (testPlanReport, required = 'Yes') => {
        return (
            <tr
                key={`${testPlanReport.at.name}-${testPlanReport.browser.name}`}
            >
                <td>{required}</td>
                <td>{testPlanReport.at.name}</td>
                <td>{testPlanReport.browser.name}</td>
                <td>{renderReportStatus(testPlanReport)}</td>
            </tr>
        );
    };

    const getMostRecentTestPlanRun = draftTestPlanRuns => {
        let allTestResults = draftTestPlanRuns.flatMap(run => run.testResults);

        let mostRecentTestResult = allTestResults.reduce(
            (latestResult, currentResult) => {
                let latestDate = new Date(latestResult.completedAt);
                let currentDate = new Date(currentResult.completedAt);
                return currentDate > latestDate ? currentResult : latestResult;
            },
            { completedAt: new Date(0) }
        );

        return mostRecentTestResult;
    };

    const getFormattedDate = dateString => {
        let date = new Date(dateString);
        let options = { year: 'numeric', month: 'short', day: 'numeric' };
        let formattedDate = new Intl.DateTimeFormat('en-US', options).format(
            date
        );
        return formattedDate;
    };

    const renderCompleteReportStatus = (draftTestPlanRuns, id) => {
        const mostRecentRun = getMostRecentTestPlanRun(draftTestPlanRuns);
        const formattedDate = getFormattedDate(mostRecentRun.completedAt);
        return (
            <a href={`/report/${testPlanVersion.id}/targets/${id}`}>
                Report completed on <strong>{formattedDate}</strong>
            </a>
        );
    };

    const renderPartialCompleteReportStatus = (
        draftTestPlanRuns,
        percentComplete,
        metrics
    ) => {
        const conflictsCount = metrics.conflictsCount ?? 0;
        switch (draftTestPlanRuns.length) {
            case 0:
                return <span>In test queue with no testers assigned.</span>;
            case 1:
                return (
                    <span>
                        {percentComplete}% complete by{' '}
                        <a
                            href={`https://github.com/${draftTestPlanRuns[0].tester.username}`}
                        >
                            {draftTestPlanRuns[0].tester.username}
                        </a>{' '}
                        with {conflictsCount} conflicts
                    </span>
                );
            default:
                return (
                    <span>
                        {percentComplete}% complete by{' '}
                        {draftTestPlanRuns.length} testers with {conflictsCount}{' '}
                        conflicts
                    </span>
                );
        }
    };

    const renderReportStatus = testPlanReport => {
        const { metrics, draftTestPlanRuns, at, browser, id } = testPlanReport;
        if (metrics) {
            const percentComplete =
                calculateTestPlanReportCompletionPercentage(testPlanReport);
            if (percentComplete === 100) {
                return renderCompleteReportStatus(draftTestPlanRuns, id);
            } else {
                return renderPartialCompleteReportStatus(
                    draftTestPlanRuns,
                    percentComplete,
                    metrics
                );
            }
        } else {
            return (
                <>
                    <IncompleteStatusReport>Missing</IncompleteStatusReport>
                    {isSignedIn && isAdmin ? (
                        <AddTestToQueueWithConfirmation
                            at={at}
                            browser={browser}
                            testPlanVersion={testPlanVersion}
                        />
                    ) : null}
                </>
            );
        }
    };

    return (
        <TestPlanReportStatusModal
            show={show}
            onHide={handleHide}
            dialogClassName="p-3"
        >
            <Modal.Header closeButton className="pb-1">
                <h2>
                    Report Status for the &nbsp;
                    <strong>{testPlanVersion.title}</strong>
                    &nbsp;Test Plan
                </h2>
            </Modal.Header>

            <Modal.Body className="pt-0">
                <p>
                    This plan is in the
                    <span
                        className={`status-label d-inline text-capitalize mx-2 ${
                            testPlanVersion.phase === 'DRAFT'
                                ? 'not-started'
                                : 'complete'
                        }`}
                    >
                        {testPlanVersion.phase}
                    </span>
                    Review phase.{' '}
                    <strong>{requiredReports.length} AT/browser</strong> pairs
                    require reports in this phase.
                </p>
                <TestPlanReportStatusTable bordered responsive>
                    <thead>
                        <tr>
                            <TestPlanReportStatusTableHeader colSpan="5">
                                Reports for Draft Alert Test Plan
                            </TestPlanReportStatusTableHeader>
                        </tr>
                        <tr>
                            <th>Required</th>
                            <th>AT</th>
                            <th>Browser</th>
                            <th>Report Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matchedReports.map(report => renderTableRow(report))}
                        {unmatchedRequiredReports.map(report =>
                            renderTableRow(report)
                        )}
                        {unmatchedTestPlanReports.map(report =>
                            renderTableRow(report, 'No')
                        )}
                    </tbody>
                </TestPlanReportStatusTable>
            </Modal.Body>
        </TestPlanReportStatusModal>
    );
};

TestPlanReportStatusDialog.propTypes = {
    testPlanVersion: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        phase: PropTypes.oneOf(['DRAFT', 'CANDIDATE']).isRequired,
        testPlanReports: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                status: PropTypes.string.isRequired,
                runnableTests: PropTypes.arrayOf(PropTypes.object).isRequired,
                finalizedTestResults: PropTypes.arrayOf(PropTypes.object),
                at: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }).isRequired,
                browser: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                }).isRequired
            }).isRequired
        ).isRequired
    }).isRequired,
    handleHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default TestPlanReportStatusDialog;
