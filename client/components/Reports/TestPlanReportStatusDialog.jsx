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
        [testPlanReports]
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
        const { recommendedStatusReachedAt: dateCompleted } = testPlanReport;
        return (
            <tr
                key={`${testPlanReport.at.name}-${testPlanReport.browser.name}`}
            >
                <td>{required}</td>
                <td>{testPlanReport.at.name}</td>
                <td>{testPlanReport.browser.name}</td>
                <td>
                    {dateCompleted
                        ? renderCompleteReportStatus(dateCompleted)
                        : renderIncompleteReportStatus(testPlanReport)}
                </td>
            </tr>
        );
    };

    const renderIncompleteReportStatus = ({
        metrics,
        at,
        browser,
        runnableTests
    }) => {
        if (metrics) {
            return (
                <span>
                    {metrics.testsCount === 0
                        ? 0
                        : runnableTests.length / metrics.testsCount}
                    % complete
                </span>
            );
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

    const renderCompleteReportStatus = dateCompleted => {
        return (
            <span>
                Report Completed on{' '}
                <b>
                    {new Date(dateCompleted).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </b>
            </span>
        );
    };

    return (
        <TestPlanReportStatusModal
            show={show}
            onHide={handleHide}
            dialogClassName="p-3"
        >
            <Modal.Header closeButton className="pb-1">
                <h2>
                    Report Status for the &nbsp;<b>{testPlanVersion.title}</b>
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
                    Review phase. <b>{requiredReports.length} AT/browser</b>{' '}
                    pairs require reports in this phase.
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
