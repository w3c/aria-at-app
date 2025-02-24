import React, { useState, useRef } from 'react';
import './TestPlanRefresh.css';
import DisclosureComponent from '../common/DisclosureComponent';
import { ThemeTable } from '../common/ThemeTable';

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

const TestPlanRefresh = () => {
  const [activeRuns, setActiveRuns] = useState(initialRefreshRuns);
  const [events, setEvents] = useState(initialRefreshEvents);
  const [nextEventId, setNextEventId] = useState(
    initialRefreshEvents.length + 1
  );
  const [showEvents, setShowEvents] = useState(false);
  const eventsPanelRef = useRef(null);

  const handleRefreshClick = run => {
    // Remove the run disclosure
    setActiveRuns(current => current.filter(item => item.id !== run.id));

    // Create new events for each job started
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

    // Prepend new events so that the latest appear on top
    setEvents(current => [...newEvents, ...current]);
    setShowEvents(true);

    // Move focus to the events panel
    if (eventsPanelRef.current) {
      setShowEvents(true);
      eventsPanelRef.current.focus();
    }
  };

  return (
    <section
      id="test-plan-refresh"
      className="test-plan-refresh"
      aria-label="Test Plan Reports Refresh Section"
    >
      <h2 className="refresh-heading">Test Plan Reports Refresh</h2>
      <div className="refresh-runs">
        {activeRuns.map(run => (
          <DisclosureComponent
            key={run.id}
            title={`${run.runs} runs for ${run.botName} ${run.newVersion} support refresh`}
            disclosureContainerView={
              <div className="refresh-run-disclosure-content">
                <p className="refresh-run-description">
                  {`${run.runs} runs completed by ${run.botName} with ${run.prevVersion} support being rerun with ${run.newVersion}. Starting a refresh will use ${run.botName} ${run.newVersion} to create new test plan reports for the following test plan versions.`}
                </p>
                <div className="refresh-run-versions">
                  <h4>Test Plan Versions:</h4>
                  <ul>
                    {dummyTestPlanVersions
                      .slice(
                        0,
                        Math.min(run.runs, dummyTestPlanVersions.length)
                      )
                      .map((plan, index) => (
                        <li key={index}>{plan}</li>
                      ))}
                  </ul>
                </div>
                <div className="refresh-run-action">
                  <button
                    className="refresh-run-button"
                    onClick={() => handleRefreshClick(run)}
                    aria-label={`Start refresh for ${run.runs} runs with ${run.botName} ${run.newVersion}`}
                  >
                    Start Refresh
                  </button>
                </div>
              </div>
            }
          />
        ))}
      </div>
      <div
        className="refresh-events-panel"
        ref={eventsPanelRef}
        tabIndex="0"
        aria-live="polite"
      >
        <DisclosureComponent
          title="Show Refresh Events"
          expanded={showEvents}
          onClick={() => setShowEvents(prev => !prev)}
          disclosureContainerView={
            <>
              <ThemeTable
                bordered
                responsive
                aria-labelledby="refresh-events-header"
              >
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>{event.timestamp}</td>
                      <td>{event.description}</td>
                    </tr>
                  ))}
                </tbody>
              </ThemeTable>
            </>
          }
        />
      </div>
    </section>
  );
};

export default TestPlanRefresh;
