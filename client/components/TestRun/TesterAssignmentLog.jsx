import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import { AuditPropType } from '../common/proptypes';
import { dates } from '@shared';
import styles from './TesterAssignmentLog.module.css';

const TesterAssignmentLog = ({ auditRecords = [] }) => {
  if (
    !auditRecords.length ||
    (auditRecords.length === 1 &&
      auditRecords[0].eventType === 'TESTER_ASSIGNMENT')
  ) {
    return null;
  }

  const getAssignmentMessage = record => {
    const { eventType, metadata } = record;

    const date = dates.convertDateToString(
      record.createdAt,
      'MMM DD, YYYY hh:mm A'
    );

    switch (eventType) {
      case 'TESTER_ASSIGNMENT': {
        const tester =
          metadata.testerUsername || `User ${metadata.testerUserId}`;
        return `This run was assigned to '${tester}' on ${date}`;
      }
      case 'TESTER_REASSIGNMENT': {
        const fromTester =
          metadata.fromTesterUsername || `User ${metadata.fromTesterUserId}`;
        const toTester =
          metadata.toTesterUsername || `User ${metadata.toTesterUserId}`;
        return `This run was reassigned from '${fromTester}' to '${toTester}' on ${date}`;
      }
      default:
        return `This run was assigned done on ${date}`;
    }
  };

  return (
    <div className={styles.assignmentContainer}>
      <div className={styles.assignmentHeader}>
        <FontAwesomeIcon icon={faHistory} />
        <span>Tester Assignment History</span>
      </div>
      <div>
        <div>
          {auditRecords.map(record => (
            <div key={record.id} className={styles.assignmentRow}>
              <FontAwesomeIcon icon={faPeopleArrows} />
              <div className={styles.assignmentRowContent}>
                <span className={styles.assignmentRowMessage}>
                  {getAssignmentMessage(record)}
                </span>
                <span className={styles.assignmentRowPerformedBy}>
                  Performed by: {record.performedBy?.username || 'Unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

TesterAssignmentLog.propTypes = {
  auditRecords: PropTypes.arrayOf(AuditPropType).isRequired
};

export default TesterAssignmentLog;
