import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import TestPlanReportStatusDialog from './TestPlanReportStatusDialog';
import { getRequiredReports } from './isRequired';
import { getTestPlanReportPercentComplete } from './getTestPlanRunPercentComplete';

const TestPlanReportStatusDialogWithButton = ({ testPlanVersion }) => {
    const [showDialog, setShowDialog] = useState(false);
    const { testPlanReports } = testPlanVersion;

    const requiredReports = useMemo(
        () => getRequiredReports(testPlanVersion.phase),
        [testPlanVersion.phase]
    );

    const buttonLabel = useMemo(() => {
        const initialCounts = { completed: 0, inProgress: 0, missing: 0 };

        const counts = requiredReports.reduce((acc, requiredReport) => {
            const matchingReport = testPlanReports.find(
                report =>
                    report.at.id === requiredReport.at.id &&
                    report.browser.id === requiredReport.browser.id
            );
            if (matchingReport) {
                const percentComplete =
                    getTestPlanReportPercentComplete(matchingReport);
                if (percentComplete === 100) {
                    acc.completed++;
                } else {
                    acc.inProgress++;
                }
            } else {
                acc.missing++;
            }
            return acc;
        }, initialCounts);

        // All AT/browser pairs that require a report have a complete report
        if (counts.completed === requiredReports.length) {
            return <span>Required Reports Complete</span>;
        }
        // At least one AT/browser pair that requires a report does not have a complete report and is in the test queue.
        // All other AT/browser pairs that require a report are either complete or are in the test queue.
        else if (counts.inProgress > 0 && counts.missing === 0) {
            return <span>Required Reports In Progress</span>;
        }
        // At least one of the AT/browser pairs that requires a report neither has a complete report nor has a run in the test queue.
        // At the same time, at least one of the AT/browser pairs that requires a report either has a complete report or has a run in the test queue.
        else if (
            counts.missing > 0 &&
            (counts.completed > 0 || counts.inProgress > 0)
        ) {
            return <span>Some Required Reports Missing</span>;
        }
        // For every AT/browser pair that requires a report, the report is neither complete nor in the test queue.
        else if (counts.missing === requiredReports.length) {
            return <span>Required Reports Not Started</span>;
        }
        // Fallback case
        else {
            return <span>Some Reports Complete</span>;
        }
    }, [requiredReports, testPlanReports]);

    return (
        <>
            <Button onClick={() => setShowDialog(true)}>{buttonLabel}</Button>
            <TestPlanReportStatusDialog
                testPlanVersion={testPlanVersion}
                show={showDialog}
                handleHide={() => setShowDialog(false)}
            />
        </>
    );
};

TestPlanReportStatusDialogWithButton.propTypes = {
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
    }).isRequired
};

export default TestPlanReportStatusDialogWithButton;
