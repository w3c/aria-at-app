import React from 'react';
import PropTypes from 'prop-types';
import { ThemeTable } from '../common/ThemeTable';
import RefreshButton from '../common/RefreshButton';
import { convertStringFormatToAnotherFormat } from 'shared/dates';

const UpdateEventsPanel = ({ events = [], isAdmin, onRefresh }) => {
  return (
    <div className="events-section" tabIndex="-1">
      <div className="events-header">
        <div className="events-header-container">
          <h2 id="events-heading">Update Events</h2>
          <RefreshButton onRefresh={onRefresh} />
        </div>
      </div>
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
                    {convertStringFormatToAnotherFormat(
                      event.timestamp,
                      'DD-MM-YYYY HH:mm',
                      'D MMM YYYY HH:mm'
                    )}
                  </td>
                  <td className="message-cell">{event.description}</td>
                </tr>
              ))}
            </tbody>
          </ThemeTable>
        ) : (
          <p className="p-4 empty-events-message">
            {isAdmin
              ? 'No update events to display yet. Start a rerun to see events here.'
              : 'No update events to display yet.'}
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
  ),
  isAdmin: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired
};

export default UpdateEventsPanel;
