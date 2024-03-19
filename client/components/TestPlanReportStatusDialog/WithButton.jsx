import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import TestPlanReportStatusDialog from './index';
import { getRequiredReports } from './isRequired';
import { calculateTestPlanReportCompletionPercentage } from './calculateTestPlanReportCompletionPercentage';
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

const TestPlanReportStatusDialogWithButton = ({ ats, testPlanVersionId }) => {
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
  const { testPlanReports } = testPlanVersion ?? {};

  // TODO: Use the DB provided AtBrowsers combinations when doing the edit UI task
  const requiredReports = useMemo(
    () => getRequiredReports(testPlanVersion?.phase),
    [testPlanVersion?.phase]
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
          calculateTestPlanReportCompletionPercentage(matchingReport);
        if (percentComplete === 100 && matchingReport.markedFinalAt) {
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
      return (
        <span>
          <ReportStatusDot className="reports-complete" />
          Required Reports <strong>Complete</strong>
        </span>
      );
    }
    // At least one AT/browser pair that requires a report does not have a complete report and is in the test queue.
    // All other AT/browser pairs that require a report are either complete or are in the test queue.
    else if (counts.inProgress > 0 && counts.missing === 0) {
      return (
        <span>
          <ReportStatusDot className="reports-in-progress" />
          Required Reports <strong>In Progress</strong>
        </span>
      );
    }
    // At least one of the AT/browser pairs that requires a report neither has a complete report nor has a run in the test queue.
    // At the same time, at least one of the AT/browser pairs that requires a report either has a complete report or has a run in the test queue.
    else if (
      counts.missing > 0 &&
      (counts.completed > 0 || counts.inProgress > 0)
    ) {
      return (
        <span>
          <ReportStatusDot className="reports-missing" />
          Some Required Reports <strong>Missing</strong>
        </span>
      );
    }
    // For every AT/browser pair that requires a report, the report is neither complete nor in the test queue.
    else if (counts.missing === requiredReports.length) {
      return (
        <span>
          <ReportStatusDot className="reports-not-started" />
          Required Reports <strong>Not Started</strong>
        </span>
      );
    }
    // Fallback case
    else {
      return (
        <span>
          <ReportStatusDot className="reports-not-started" />
          Some Reports Complete
        </span>
      );
    }
  }, [requiredReports, testPlanReports]);

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
        triggerUpdate={refetch}
        ats={ats}
      />
    </>
  );
};

TestPlanReportStatusDialogWithButton.propTypes = {
  ats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      browsers: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired
      ).isRequired,
      candidateBrowsers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired
        }).isRequired
      ).isRequired,
      recommendedBrowsers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  testPlanVersionId: PropTypes.string.isRequired
};

export default TestPlanReportStatusDialogWithButton;
