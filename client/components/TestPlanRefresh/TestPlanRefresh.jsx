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
    botName: 'VoiceOver Bot',
    newVersion: '14.0',
    versionGroups: [
      {
        prevVersion: '13.0',
        testPlanCount: 3,
        testPlans: [
          'Action Menu Button Example Using aria-activedescendant V24.09.18',
          'Alert Example V24.09.18',
          'Command Button Example V24.09.18'
        ]
      },
      {
        prevVersion: '12.5',
        testPlanCount: 2,
        testPlans: [
          'Modal Dialog Example V24.09.17',
          'Navigation Menu Button V24.10.18'
        ]
      }
    ]
  },
  {
    id: 2,
    botName: 'NVDA Bot',
    newVersion: '2025.1',
    versionGroups: [
      {
        prevVersion: '2024.2',
        testPlanCount: 4,
        testPlans: [
          'Color Viewer Slider V23.12.13',
          'Disclosure Navigation Menu Example V23.11.29',
          'Link Example 1 (span element with text content) V24.09.18',
          'Toggle Button V24.11.04'
        ]
      }
    ]
  }
];

const initialRefreshEvents = [
  {
    id: 1,
    timestamp: '12/01/2025, \n 8:02:30 AM',
    description:
      'Re-run of Action Menu Button Example using aria-activedescendant performed with VoiceOver Bot version 14.0 had an exact match for all output. Verdicts were copied and report was finalized.'
  },
  {
    id: 2,
    timestamp: '11/01/2025, \n 3:28:01 PM',
    description:
      'Re-run of Alert Example performed with NVDA Bot Version 2024.4 had mismatched output on 4 scenarios. Report added to Test Queue for review.'
  }
];

const getVersionDescription = run => {
  const totalTestPlans = run.versionGroups.reduce(
    (sum, group) => sum + group.testPlanCount,
    0
  );
  const versions = run.versionGroups.map(group => group.prevVersion).join(', ');
  return `${run.botName} ${run.newVersion} automation support has been added to the application. ${totalTestPlans} test plan versions can be re-run from ${run.versionGroups.length} previous versions, including ${versions}.`;
};

const RefreshDashboard = ({ activeRuns, onRefreshClick }) => (
  <>
    <h2 id="refresh-heading" className="refresh-header">
      Available Updates
    </h2>
    <div className="refresh-dashboard">
      {activeRuns.map(run => {
        const headingId = `refresh-heading-${run.id}`;
        const totalTestPlans = run.versionGroups.reduce(
          (sum, group) => sum + group.testPlanCount,
          0
        );
        const versionDescription = getVersionDescription(run);

        return (
          <div key={run.id} className="refresh-opportunity">
            <h3
              id={headingId}
              className="bot-name"
              aria-label={`Re-run available for ${run.botName} ${run.newVersion}`}
            >
              {run.botName} {run.newVersion}
            </h3>

            {/* Screen reader version - hidden visually */}
            <p className="sr-only">{versionDescription}</p>

            {/* Visual version - hidden from screen readers */}
            <div className="version-update" aria-hidden="true">
              <div className="version-info">
                <div className="version-groups-container">
                  {run.versionGroups.map((group, index) => (
                    <div key={index} className="version-box">
                      <span className="version-number">
                        {group.prevVersion}
                      </span>
                      <span className="version-count">
                        {group.testPlanCount}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="version-box highlight">
                  <span className="version-number">{run.newVersion}</span>
                </div>
              </div>
            </div>

            <div className="plan-summary" aria-hidden="true">
              <div className="plan-count">
                <span className="plan-count-number">{totalTestPlans}</span>
                <span className="plan-count-label">
                  {totalTestPlans === 1
                    ? 'Test plan version can be re-run'
                    : 'Test plan versions can be re-run'}
                </span>
              </div>
            </div>

            <div className="test-plans-preview">
              {run.versionGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="version-group">
                  <h4
                    className="plans-preview-title"
                    id={`plans-preview-title-${run.id}-${groupIndex}`}
                    aria-label={`Test Plan Versions from ${run.botName} ${group.prevVersion}`}
                  >
                    From Version {group.prevVersion}
                  </h4>

                  <ul
                    className="plans-list"
                    aria-labelledby={`plans-preview-title-${run.id}-${groupIndex}`}
                  >
                    {group.testPlans.map((plan, index) => (
                      <li key={index}>{plan}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="action-footer">
              <button
                className="refresh-button"
                onClick={() => onRefreshClick(run)}
                aria-label={`Start automated test plan runs for ${totalTestPlans} test plan versions using ${run.botName} ${run.newVersion}`}
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
    let eventId = nextEventId;

    run.versionGroups.forEach(group => {
      group.testPlans.forEach(plan => {
        newEvents.push({
          id: eventId++,
          timestamp: new Date().toLocaleString(),
          description: `Update run started for ${plan} using ${run.botName} ${run.newVersion} (upgrading from ${group.prevVersion})`
        });
      });
    });

    setNextEventId(eventId);
    setEvents(current => [...newEvents, ...current]);

    if (eventsPanelRef.current) {
      eventsPanelRef.current.focus();
      // Announce to screen readers that refresh has started
      const announcement = document.getElementById('refresh-announcement');
      if (announcement) {
        const totalPlans = run.versionGroups.reduce(
          (sum, group) => sum + group.testPlanCount,
          0
        );
        announcement.textContent = `Started refresh for ${totalPlans} test plans with ${run.botName} version ${run.newVersion}. Focus moved to events list.`;
      }
    }
  };

  const getVersionUpdateDescription = run => {
    return `${run.botName} ${
      run.newVersion
    } automation support has been added to the application. ${
      run.runs
    } test plan version${run.runs !== 1 ? 's' : ''} can be re-run.`;
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

      <div className="events-section" ref={eventsPanelRef} tabIndex="-1">
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
