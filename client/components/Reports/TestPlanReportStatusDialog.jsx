import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'react-bootstrap';
import styled from '@emotion/styled';
import { getRequiredReports } from './isRequired';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';

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

const TestPlanReportStatusDialog = ({
    testPlanVersion,
    testPlanReports,
    show,
    handleHide
}) => {
    const { data } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    const auth = evaluateAuth(data && data.me ? data.me : {});
    const { isSignedIn, isAdmin } = auth;

    // STUB: This is a placeholder, TODO: replace with TestPlanVersion.phase
    const testPlanVersionPhase =
        testPlanReports.length < 3 ? 'draft' : 'recommended';

    const requiredReports = useMemo(
        () => getRequiredReports(testPlanVersionPhase),
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
                        matched.push(testPlanReports[j]);

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

    const renderTableRow = ({
        at,
        browser,
        // STUB: This will later be TestPlanReport.markedReadyAt, TODO: Replace with final implementation
        recommendedStatusReachedAt: dateCompleted,
        required = 'Yes'
    }) => (
        <tr key={`${at.name}-${browser.name}`}>
            <td>{required}</td>
            <td>{at.name}</td>
            <td>{browser.name}</td>
            <td>
                {dateCompleted
                    ? renderCompleteReportStatus(dateCompleted)
                    : renderIncompleteReportStatus(at, browser)}
            </td>
        </tr>
    );

    const renderIncompleteReportStatus = (at, browser) => {
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
                            testPlanVersionPhase === 'draft'
                                ? 'not-started'
                                : 'complete'
                        }`}
                    >
                        {testPlanVersionPhase}
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
                            renderTableRow({ ...report, required: 'No' })
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
        title: PropTypes.string.isRequired
    }).isRequired,
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            runnableTests: PropTypes.arrayOf(PropTypes.object).isRequired,
            finalizedTestResults: PropTypes.arrayOf(PropTypes.object)
                .isRequired,
            at: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            browser: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired
        }).isRequired
    ).isRequired,
    handleHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default TestPlanReportStatusDialog;
