import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AddTestToQueueWithConfirmation from '../AddTestToQueueWithConfirmation';
import { useQuery } from '@apollo/client';
import { Table } from 'react-bootstrap';
import clsx from 'clsx';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import BasicModal from '../common/BasicModal';
import ReportStatusSummary from '../common/ReportStatusSummary';
import { AtVersion } from '../common/AtBrowserVersion';
import { TestPlanVersionPropType } from '../common/proptypes';
import styles from './TestPlanReportStatusDialog.module.css';
import commonStyles from '../common/styles.module.css';

const TestPlanReportStatusDialog = ({
  testPlanVersion,
  show,
  handleHide = () => {},
  triggerUpdate = () => {}
}) => {
  const { data: { me } = {} } = useQuery(ME_QUERY, {
    fetchPolicy: 'cache-and-network'
  });

  const auth = evaluateAuth(me);
  const { isSignedIn, isAdmin } = auth;

  const { testPlanReportStatuses } = testPlanVersion;

  const { requiredReportsCount, sortedStatuses } = useMemo(() => {
    let requiredCount = 0;

    const sorted = [...testPlanReportStatuses].sort(
      (a, b) => Number(b.isRequired) - Number(a.isRequired)
    );

    sorted.forEach(status => {
      if (status.isRequired) requiredCount += 1;
    });

    return { requiredReportsCount: requiredCount, sortedStatuses: sorted };
  }, [testPlanReportStatuses]);

  // Track only user overrides for minimum AT versions using Map to avoid array sync issues
  const [minimumAtVersionOverrides, setMinimumAtVersionOverrides] = useState(
    new Map()
  );

  const tableRowMinimumAtVersionChange = (index, newMinimumAtVersion) => {
    setMinimumAtVersionOverrides(prev => {
      const next = new Map(prev);
      next.set(index, newMinimumAtVersion);
      return next;
    });
  };

  const getMinimumAtVersionForIndex = (index, status) => {
    return minimumAtVersionOverrides.get(index) || status.minimumAtVersion;
  };

  const tableRows = sortedStatuses.map((status, index) => {
    const { isRequired, at, browser, exactAtVersion, testPlanReport } = status;

    const minimumAtVersion = getMinimumAtVersionForIndex(index, status);

    const key =
      `${at.name}-${browser.name}-` +
      `${minimumAtVersion?.id ?? exactAtVersion?.id}-` +
      `${testPlanReport?.id ?? 'missing'}`;

    return (
      <tr key={key}>
        <td>{isRequired ? 'Yes' : 'No'}</td>
        <td>
          <AtVersion
            at={at}
            allowAtVersionSelect={key.includes('missing') && isAdmin}
            minimumAtVersion={minimumAtVersion}
            exactAtVersion={exactAtVersion}
            rowIndex={index}
            onMinimumAtVersionChange={tableRowMinimumAtVersionChange}
          />
        </td>
        <td>{browser.name}</td>
        <td>
          <ReportStatusSummary
            testPlanVersion={testPlanVersion}
            testPlanReport={testPlanReport}
          />
          {isSignedIn && isAdmin && !testPlanReport ? (
            <AddTestToQueueWithConfirmation
              at={at}
              minimumAtVersion={minimumAtVersion}
              exactAtVersion={exactAtVersion}
              browser={browser}
              testPlanVersion={testPlanVersion}
              triggerUpdate={triggerUpdate}
            />
          ) : null}
        </td>
      </tr>
    );
  });

  const getContent = () => {
    const phase = testPlanVersion.phase;

    const getDescriptions = phase => {
      if (phase === 'DRAFT')
        return ['Review phase', 'required to be promoted to the next phase'];
      if (phase === 'CANDIDATE')
        return ['Review phase', 'require reports in this phase'];
      if (phase === 'RECOMMENDED')
        return ['phase', 'require reports in this phase'];
    };

    const [reviewDescription, requirementNeedsDescription] =
      getDescriptions(phase);

    return (
      <>
        {phase && (
          <p>
            This plan is in the&nbsp;
            <span
              className={clsx(
                styles.statusLabel,
                phase === 'DRAFT' ? styles.notStarted : styles.complete
              )}
            >
              {/* text-transform: capitalize will not work on all-caps string */}
              {phase[0] + phase.slice(1).toLowerCase()}
            </span>
            &nbsp;{reviewDescription}.&nbsp;
            <strong>
              {requiredReportsCount} Assistive Technology / Browser&nbsp;
            </strong>
            pairs {requirementNeedsDescription}.
          </p>
        )}

        <Table bordered responsive className={commonStyles.themeTable}>
          <thead>
            <tr>
              <th>Required</th>
              <th>Assistive Technology</th>
              <th>Browser</th>
              <th>Report Status</th>
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </Table>
      </>
    );
  };

  const getTitle = () => (
    <>
      Report Status for the&nbsp;
      <strong>{testPlanVersion.title}</strong>
      &nbsp;Test Plan
    </>
  );

  return (
    <BasicModal
      show={show}
      handleHide={handleHide}
      useOnHide={true}
      animation={false}
      centered
      dialogClassName={clsx(styles.testPlanReportStatusDialog, 'modal-60w')}
      content={getContent()}
      title={getTitle()}
    />
  );
};

TestPlanReportStatusDialog.propTypes = {
  testPlanVersion: TestPlanVersionPropType.isRequired,
  handleHide: PropTypes.func.isRequired,
  triggerUpdate: PropTypes.func,
  show: PropTypes.bool.isRequired
};

export default TestPlanReportStatusDialog;
