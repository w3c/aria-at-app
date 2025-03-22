import React from 'react';
import PropTypes from 'prop-types';
import { ThemeTable } from '../common/ThemeTable';
import { convertDateToString } from 'shared/dates';

const UpdateEventsPanel = ({ events = [] }) => {
  return (
    <div className="events-section" tabIndex="-1">
      <h2 id="events-heading" className="events-header">
        Update Events
      </h2>
      <div className="events-content" aria-live="polite" aria-atomic="true">
        {events.length ? (
          <ThemeTable responsive aria-label="Test plan rerun events history">
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Message</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td className="timestamp-cell">
                    {convertDateToString(
                      new Date(event.timestamp),
                      'YYYY-MM-DD HH:mm'
                    )}
                  </td>
                  <td className="message-cell">{event.description}</td>
                </tr>
              ))}
            </tbody>
          </ThemeTable>
        ) : (
          <p className="p-4 empty-events-message">
            No update events to display yet. Start a rerun to see events here.
          </p>
        )}
      </div>
    </div>
  );
};

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
  )
};

export default UpdateEventsPanel;
