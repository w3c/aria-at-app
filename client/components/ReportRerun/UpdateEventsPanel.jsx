import React from 'react';
import PropTypes from 'prop-types';
import RefreshButton from '../common/RefreshButton';
import { convertStringFormatToAnotherFormat } from 'shared/dates';
import { Table } from 'react-bootstrap';
import styles from './ReportRerun.module.css';

const UpdateEventsPanel = React.forwardRef(
  ({ events = [], isAdmin, onRefresh }, ref) => {
    return (
      <div className={styles.eventsSection} tabIndex="-1" ref={ref}>
        <div className={styles.eventsHeader}>
          <div className={styles.eventsHeaderContainer}>
            <h2 id="events-heading">Update Events</h2>
            <RefreshButton onRefresh={onRefresh} />
          </div>
        </div>
        <div className={styles.eventsContent} aria-live="polite" role="log">
          {events.length ? (
            <Table
              responsive
              aria-label="Test plan rerun events history"
              className={styles.themeTable}
            >
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Message</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td className={styles.timestampCell}>
                      {convertStringFormatToAnotherFormat(
                        event.timestamp,
                        'DD-MM-YYYY HH:mm',
                        'D MMM YYYY HH:mm'
                      )}
                    </td>
                    <td className={styles.messageCell}>{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className={styles.emptyEventsMessage}>
              {isAdmin
                ? 'No update events to display yet. Start a rerun to see events here.'
                : 'No update events to display yet.'}
            </p>
          )}
        </div>
      </div>
    );
  }
);

UpdateEventsPanel.displayName = 'UpdateEventsPanel';

UpdateEventsPanel.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        'COLLECTION_JOB',
        'GENERAL',
        'TEST_PLAN_RUN',
        'TEST_PLAN_REPORT'
      ]).isRequired
    })
  ),
  isAdmin: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired
};

export default UpdateEventsPanel;
