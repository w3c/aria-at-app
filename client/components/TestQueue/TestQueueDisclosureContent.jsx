import React from 'react';
import { Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import TestPlanReportStatusDialogWithButton from '../TestPlanReportStatusDialog/WithButton';
import TestQueueReportRow from './TestQueueReportRow';
import styles from './TestQueue.module.css';
import commonStyles from '../common/styles.module.css';

const TestQueueDisclosureContent = ({
  testPlan,
  testPlanVersion,
  me,
  testers
}) => {
  return (
    <>
      <div className={styles.metadataContainer}>
        <a href={`/test-review/${testPlanVersion.id}`}>
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            size="xs"
            className={commonStyles.darkGray}
          />
          View tests in {testPlanVersion.versionString}
        </a>
        <TestPlanReportStatusDialogWithButton
          testPlanVersionId={testPlanVersion.id}
        />
      </div>
      <Table
        aria-label={
          `Reports for ${testPlanVersion.title} ` +
          `${testPlanVersion.versionString} in ` +
          `${testPlanVersion.phase.toLowerCase()} phase`
        }
        bordered
        responsive
        hover={false}
        className={styles.testQueue}
      >
        <thead>
          <tr>
            <th>Assistive Technology</th>
            <th>Browser</th>
            <th>Testers</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {testPlanVersion.testPlanReports.map(testPlanReport => (
            <TestQueueReportRow
              key={testPlanReport.id}
              testPlan={testPlan}
              testPlanVersion={testPlanVersion}
              testPlanReport={testPlanReport}
              me={me}
              testers={testers}
            />
          ))}
        </tbody>
      </Table>
    </>
  );
};

TestQueueDisclosureContent.propTypes = {
  testPlan: PropTypes.object.isRequired,
  testPlanVersion: PropTypes.object.isRequired,
  me: PropTypes.object,
  testers: PropTypes.array.isRequired
};

export default TestQueueDisclosureContent;
