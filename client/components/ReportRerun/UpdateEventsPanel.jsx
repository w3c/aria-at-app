import React from 'react';
import PropTypes from 'prop-types';
import { ThemeTable } from '../common/ThemeTable';

const UpdateEventsPanel = ({ events, eventsPanelRef }) => {
  return (
    <div className="events-section" ref={eventsPanelRef} tabIndex="-1">
      <h2 id="events-heading" className="events-header">
        Update Events
      </h2>
      <div className="events-content">
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
                  <td className="timestamp-cell">{event.timestamp}</td>
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
      id: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired
    })
  ).isRequired,
  eventsPanelRef: PropTypes.object.isRequired
};

export default UpdateEventsPanel;
