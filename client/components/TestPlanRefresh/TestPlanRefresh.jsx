import React, { useState, useRef } from 'react';
import './TestPlanRefresh.css';
import { ThemeTable } from '../common/ThemeTable';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import PropTypes from 'prop-types';
const initialRefreshRuns = [
  {
    id: 1,
    runs: 13,
    botName: 'VoiceOver Bot',
    prevVersion: '13.0',
    newVersion: '14.0'
  },
  {
    id: 2,
    runs: 8,
    botName: 'NVDA Bot',
    prevVersion: '2024.4',
    newVersion: '2024.5'
  }
];

const initialRefreshEvents = [
  {
    id: 1,
    timestamp: '12/01/2025, \n 8:02:30 AM',
    description:
      'Refresh run of Action Menu Button Example using aria-activedescendant performed with VoiceOver Bot version 14.0 had an exact match for all output. Verdicts were copied and report was finalized.'
  },
  {
    id: 2,
    timestamp: '11/01/2025, \n 3:28:01 PM',
    description:
      'Refresh run of Alert Example performed with NVDA Bot Version 2024.4 had mismatched output on 4 scenarios. Report added to Test Queue for review.'
  }
];

const dummyTestPlanVersions = [
  'Action Menu Button Example Using aria-activedescendant V24.09.18',
  'Action Menu Button Example Using element.focus()Candidate V24.10.31',
  'Alert Example V24.09.18',
  'Color Viewer Slider V23.12.13',
  'Command Button Example V24.09.18',
  'Disclosure Navigation Menu Example V23.11.29',
  'Link Example 1 (span element with text content) V24.09.18',
  'Modal Dialog Example V24.09.17',
  'Navigation Menu Button V24.10.18',
  'Radio Group Example Using aria-activedescendant V24.10.18',
  'Toggle Button V24.11.04'
];

const RefreshDashboard = ({
  activeRuns,
  onRefreshClick,
  getVersionUpdateDescription
}) => (
  <>
    <h2 id="refresh-heading" className="refresh-header">
      Available Updates
    </h2>
    <div className="refresh-dashboard" aria-labelledby="refresh-heading">
      {activeRuns.map(run => {
        const headingId = `refresh-heading-${run.id}`;
        const versionDescription = getVersionUpdateDescription(run);

        return (
          <div key={run.id} className="refresh-opportunity">
            <h3
              id={headingId}
              className="bot-name"
              aria-label={`Refresh available for ${run.botName} ${run.newVersion}`}
            >
              {run.botName} {run.newVersion}
            </h3>

            {/* Screen reader version - hidden visually */}
            <p className="sr-only">{versionDescription}</p>

            {/* Visual version - hidden from screen readers */}
            <div className="version-update" aria-hidden="true">
              <div className="version-info">
                <div className="version-box">
                  <span>Current Version</span>
                  <span className="version-number">{run.prevVersion}</span>
                </div>

                <div className="version-arrow">→</div>

                <div className="version-box">
                  <span>New Version</span>
                  <span className="version-number">{run.newVersion}</span>
                </div>
              </div>
            </div>

            <div className="plan-summary" aria-hidden="true">
              <div className="plan-count">
                <span className="plan-count-number">{run.runs}</span>
                <span className="plan-count-label">
                  {run.runs === 1
                    ? 'Test plan version can be refreshed'
                    : 'Test plan versions can be refreshed'}
                </span>
              </div>
            </div>

            <div className="test-plans-preview">
              <h4
                className="plans-preview-title"
                id={`plans-preview-title-${run.id}`}
                aria-label={`Test Plan Versions in refresh for ${run.botName} ${run.newVersion}`}
              >
                Test Plan Versions in Refresh
              </h4>

              <ul
                className="plans-list"
                aria-labelledby={`plans-preview-title-${run.id}`}
              >
                {dummyTestPlanVersions
                  .slice(0, Math.min(run.runs, dummyTestPlanVersions.length))
                  .map((plan, index) => (
                    <li key={index}>{plan}</li>
                  ))}
              </ul>
            </div>

            <div className="action-footer">
              <button
                className="refresh-button"
                onClick={() => onRefreshClick(run)}
                aria-label={`Start automated test plan runs for ${run.runs} test plan versions using ${run.botName} ${run.newVersion}`}
              >
                Start Refresh
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </>
);

const TestPlanRefresh = () => {
  const [activeRuns, setActiveRuns] = useState(initialRefreshRuns);
  const [events, setEvents] = useState(initialRefreshEvents);
  const [nextEventId, setNextEventId] = useState(
    initialRefreshEvents.length + 1
  );
  const eventsPanelRef = useRef(null);

  const { data: { me } = {} } = useQuery(ME_QUERY);
  const { isAdmin } = evaluateAuth(me);

  const handleRefreshClick = run => {
    setActiveRuns(current => current.filter(item => item.id !== run.id));

    const newEvents = [];
    for (let i = 0; i < run.runs; i++) {
      newEvents.push({
        id: nextEventId + i,
        timestamp: new Date().toLocaleString(),
        description: `Update run started for ${
          dummyTestPlanVersions[i % dummyTestPlanVersions.length]
        } using ${run.botName} ${run.newVersion}`
      });
    }
    setNextEventId(prev => prev + run.runs);
    setEvents(current => [...newEvents, ...current]);

    if (eventsPanelRef.current) {
      eventsPanelRef.current.focus();
      // Announce to screen readers that refresh has started
      const announcement = document.getElementById('refresh-announcement');
      if (announcement) {
        announcement.textContent = `Started refresh for ${run.runs} test plans with ${run.botName} version ${run.newVersion}. Focus moved to events list.`;
      }
    }
  };

  const getVersionUpdateDescription = run => {
    return `${run.botName} ${
      run.newVersion
    } automation support has been added to the application. ${
      run.runs
    } test plan version${run.runs !== 1 ? 's' : ''} can be refreshed.`;
  };

  return (
    <div className="test-plan-refresh">
      <div
        id="refresh-announcement"
        aria-live="polite"
        className="sr-only"
        role="status"
      ></div>

      {isAdmin && (
        <RefreshDashboard
          activeRuns={activeRuns}
          onRefreshClick={handleRefreshClick}
          getVersionUpdateDescription={getVersionUpdateDescription}
        />
      )}

      <div
        className="events-section"
        ref={eventsPanelRef}
        aria-labelledby="events-heading"
        tabIndex="-1"
      >
        <h2 id="events-heading" className="events-header">
          Update Events
        </h2>
        <div className="events-content">
          {events.length > 0 ? (
            <ThemeTable
              responsive
              aria-label="Test plan refresh events history"
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
                    <td className="timestamp-cell">{event.timestamp}</td>
                    <td className="message-cell">{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </ThemeTable>
          ) : (
            <p className="p-4 empty-events-message">
              No update events to display yet. Start a refresh to see events
              here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

RefreshDashboard.propTypes = {
  activeRuns: PropTypes.array.isRequired,
  onRefreshClick: PropTypes.func.isRequired,
  getVersionUpdateDescription: PropTypes.func.isRequired
};

export default TestPlanRefresh;
