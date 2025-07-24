import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import TestPlanReportStatusDialog from './index';
import ReportStatusDot, { REPORT_STATUSES } from '../common/ReportStatusDot';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from './queries';
import { useQuery } from '@apollo/client';
import styles from './TestPlanReportStatusDialog.module.css';

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

  const buttonLabel = useMemo(() => {
    if (!testPlanReportStatuses) return;

    const counts = { completed: 0, inProgress: 0, missing: 0 };

    testPlanReportStatuses.forEach(status => {
      if (!status.isRequired) return;

      const { testPlanReport } = status;

      if (testPlanReport) {
        const { percentComplete } = testPlanReport;

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
          <ReportStatusDot status={REPORT_STATUSES.REPORTS_COMPLETE} />
          Required Reports <strong>Complete</strong>
        </span>
      );
    } else if (counts.missing === 0 && counts.inProgress !== 0) {
      return (
        <span>
          <ReportStatusDot status={REPORT_STATUSES.REPORTS_IN_PROGRESS} />
          Required Reports <strong>In Progress</strong>
        </span>
      );
    } else if (
      counts.missing !== 0 &&
      (counts.completed > 0 || counts.inProgress > 0)
    ) {
      return (
        <span>
          <ReportStatusDot status={REPORT_STATUSES.REPORTS_MISSING} />
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
          <ReportStatusDot status={REPORT_STATUSES.REPORTS_NOT_STARTED} />
          Required Reports <strong>Not Started</strong>
        </span>
      );
    } else {
      // Fallback case
      return (
        <span>
          <ReportStatusDot status={REPORT_STATUSES.REPORTS_NOT_STARTED} />
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
      <Button
        ref={buttonRef}
        className={styles.testPlanReportStatusDialogButton}
        onClick={() => setShowDialog(true)}
      >
        {buttonLabel}
      </Button>
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
