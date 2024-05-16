import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import TestPlanReportStatusDialog from './index';
import { calculatePercentComplete } from '../../utils/calculatePercentComplete';
import styled from '@emotion/styled';
import ReportStatusDot from '../common/ReportStatusDot';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from './queries';
import { useQuery } from '@apollo/client';

const TestPlanReportStatusDialogButton = styled(Button)`
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0.5rem;
    font-size: 0.875rem;

    border: none;
    border-radius: 0;

    color: #6a7989;
    background: #f6f8fa;

    margin-top: auto;
`;

const TestPlanReportStatusDialogWithButton = ({
    testPlanVersionId,
    triggerUpdate: refetchOther
}) => {
    const {
        data: { testPlanVersion } = {},
        refetch,
        loading
    } = useQuery(TEST_PLAN_REPORT_STATUS_DIALOG_QUERY, {
        variables: { testPlanVersionId },
        fetchPolicy: 'cache-and-network'
    });

    const buttonRef = useRef(null);

    const [showDialog, setShowDialog] = useState(false);
    const { testPlanReportStatuses } = testPlanVersion ?? {};

    if (testPlanVersion?.title.startsWith('Radio Group')) {
        console.log(
            'TestPlanReportStatusDialogWithButton showDialog',
            showDialog
        );
    }

    const buttonLabel = useMemo(() => {
        if (!testPlanReportStatuses) return;

        const counts = { completed: 0, inProgress: 0, missing: 0 };

        testPlanReportStatuses.forEach(status => {
            if (!status.isRequired) return;

            const { testPlanReport } = status;

            if (testPlanReport) {
                const percentComplete =
                    calculatePercentComplete(testPlanReport);

                if (percentComplete === 100 && testPlanReport.markedFinalAt) {
                    counts.completed += 1;
                } else {
                    counts.inProgress += 1;
                }
            } else {
                counts.missing += 1;
            }
        });

        if (counts.missing === 0 && counts.inProgress === 0) {
            return (
                <span>
                    <ReportStatusDot className="reports-complete" />
                    Required Reports <strong>Complete</strong>
                </span>
            );
        } else if (counts.missing === 0 && counts.inProgress !== 0) {
            return (
                <span>
                    <ReportStatusDot className="reports-in-progress" />
                    Required Reports <strong>In Progress</strong>
                </span>
            );
        } else if (
            counts.missing !== 0 &&
            (counts.completed > 0 || counts.inProgress > 0)
        ) {
            return (
                <span>
                    <ReportStatusDot className="reports-missing" />
                    Some Required Reports <strong>Missing</strong>
                </span>
            );
        } else if (
            counts.missing !== 0 &&
            counts.completed === 0 &&
            counts.inProgress === 0
        ) {
            return (
                <span>
                    <ReportStatusDot className="reports-not-started" />
                    Required Reports <strong>Not Started</strong>
                </span>
            );
        } else {
            // Fallback case
            return (
                <span>
                    <ReportStatusDot className="reports-not-started" />
                    Some Reports Complete
                </span>
            );
        }
    }, [testPlanReportStatuses]);

    if (
        loading ||
        !testPlanVersion ||
        !testPlanVersion.phase ||
        (testPlanVersion.phase !== 'DRAFT' &&
            testPlanVersion.phase !== 'CANDIDATE' &&
            testPlanVersion.phase !== 'RECOMMENDED')
    ) {
        return;
    }

    return (
        <>
            <TestPlanReportStatusDialogButton
                ref={buttonRef}
                onClick={() => setShowDialog(true)}
            >
                {buttonLabel}
            </TestPlanReportStatusDialogButton>
            <TestPlanReportStatusDialog
                testPlanVersion={testPlanVersion}
                show={showDialog}
                handleHide={() => {
                    setShowDialog(false);
                    buttonRef.current.focus();
                }}
                triggerUpdate={async () => {
                    await refetch();
                    if (refetchOther) await refetchOther();
                }}
            />
        </>
    );
};

TestPlanReportStatusDialogWithButton.propTypes = {
    testPlanVersionId: PropTypes.string.isRequired,
    triggerUpdate: PropTypes.func
};

export default TestPlanReportStatusDialogWithButton;
