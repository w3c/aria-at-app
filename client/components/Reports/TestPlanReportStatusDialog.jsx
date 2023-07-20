import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'react-bootstrap';
import styled from '@emotion/styled';
import { getRequiredReports } from './isRequired';

const TestPlanReportStatusModal = styled(Modal)`
    .modal-dialog {
        max-width: 90%;
        width: max-content;
    }
`;

const TestPlanReportStatusDialog = ({
    testPlanVersion,
    testPlanReports,
    show,
    handleHide
}) => {
    if (testPlanReports.length === 0) {
        return;
    }

    // STUB: This is a placeholder, TODO: replace with TestPlanVersion.phase
    const testPlanVersionPhase =
        testPlanReports.length < 3 ? 'draft' : 'recommended';

    const requiredReports = useMemo(
        () => getRequiredReports(testPlanVersionPhase),
        [testPlanReports]
    );

    const [matchedReports, unmatchedReports] = useMemo(() => {
        const matched = requiredReports.map(requiredReport => {
            const { at, browser } = requiredReport;
            const matchedReport = testPlanReports.find(
                report =>
                    report.at.name === at && report.browser.name === browser
            );
            return {
                ...requiredReport,
                recommendedStatusReachedAt: matchedReport
                    ? matchedReport.recommendedStatusReachedAt
                    : null
            };
        });
        const unmatched = testPlanReports.filter(report => {
            return !requiredReports.find(
                requiredReport =>
                    requiredReport.at === report.at.name &&
                    requiredReport.browser === report.browser.name
            );
        });
        return [matched, unmatched];
    }, [testPlanReports, requiredReports]);

    const renderTableRow = ({
        at,
        browser,
        recommendedStatusReachedAt,
        required = 'Yes'
    }) => (
        <tr key={`${at}-${browser}`}>
            <td>{required}</td>
            <td>{at.name ?? at}</td>
            <td>{browser.name ?? browser}</td>
            <td>
                {recommendedStatusReachedAt
                    ? renderCompleteReportDate(recommendedStatusReachedAt)
                    : 'Incomplete'}
            </td>
        </tr>
    );

    const renderCompleteReportDate = dateCompleted => {
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
                <h3>
                    Report Status for the &nbsp;<b>{testPlanVersion.title}</b>
                    &nbsp;Test Plan
                </h3>
            </Modal.Header>

            <Modal.Body>
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
                <Table bordered responsive>
                    <thead>
                        <tr>
                            <th colSpan="5">
                                Reports for Draft Alert Test Plan
                            </th>
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
                        {unmatchedReports.map(report =>
                            renderTableRow({ ...report, required: 'No' })
                        )}
                    </tbody>
                </Table>
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
            finalizedTestResults: PropTypes.arrayOf(PropTypes.object).isRequired
        }).isRequired
    ).isRequired,
    handleHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default TestPlanReportStatusDialog;
