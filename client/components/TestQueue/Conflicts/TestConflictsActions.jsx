import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faFileImport
} from '@fortawesome/free-solid-svg-icons';
import { TestPlanRunPropType } from '../../common/proptypes';
import styles from './Conflicts.module.css';

const TestConflictsActions = ({
  issueLink,
  isAdmin,
  testPlanRuns,
  testIndex
}) => {
  const openResultsLabel = isAdmin ? 'Open run as...' : 'View Results for...';

  return (
    <div className={styles.conflictsActionsContainer}>
      <Button variant="secondary" target="_blank" href={issueLink}>
        <FontAwesomeIcon icon={faExclamationCircle} />
        Raise an Issue for Conflict
      </Button>
      <Dropdown>
        <Dropdown.Toggle
          variant="secondary"
          as={Button}
          className={styles.actionButton}
        >
          <FontAwesomeIcon icon={faFileImport} />
          {openResultsLabel}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {testPlanRuns.map(testPlanRun => (
            <Dropdown.Item
              key={testPlanRun.id}
              href={`/run/${testPlanRun.id}?user=${testPlanRun.tester.id}#${testIndex}`}
              target="_blank"
              onClick={e => {
                e.preventDefault();
                if (window.PUPPETEER_TESTING) {
                  window.location.href = `/run/${testPlanRun.id}?user=${testPlanRun.tester.id}#${testIndex}`;
                } else {
                  window.open(
                    `/run/${testPlanRun.id}?user=${testPlanRun.tester.id}#${testIndex}`,
                    '_blank'
                  );
                }
              }}
            >
              {testPlanRun.tester.username}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

TestConflictsActions.propTypes = {
  issueLink: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  testPlanRuns: PropTypes.arrayOf(TestPlanRunPropType).isRequired,
  testIndex: PropTypes.number.isRequired
};

export default TestConflictsActions;
