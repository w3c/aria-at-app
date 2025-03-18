import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import nextId from 'react-id-generator';
import styles from './StatusBar.module.css';

const StatusBar = ({
  hasConflicts = false,
  handleReviewConflictsButtonClick = () => {}
}) => {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const statuses = [];

    if (hasConflicts) {
      const variant = 'warning';
      const action = (
        <Button variant={variant} onClick={handleReviewConflictsButtonClick}>
          Review Conflicts
        </Button>
      );
      const icon = faExclamationTriangle;
      const message = 'This test has conflicting results';
      statuses.push({
        action,
        icon,
        message,
        variant
      });
    }

    setStatuses(statuses);
  }, []);

  return (
    <>
      {statuses.map(({ action, icon, message, variant }) => {
        return (
          <Alert key={nextId()} variant={variant} className={styles.statusBar}>
            <FontAwesomeIcon icon={icon} /> {message}
            {action}
          </Alert>
        );
      })}
    </>
  );
};

StatusBar.propTypes = {
  issues: PropTypes.array,
  hasConflicts: PropTypes.bool,
  handleReviewConflictsButtonClick: PropTypes.func
};

export default StatusBar;
