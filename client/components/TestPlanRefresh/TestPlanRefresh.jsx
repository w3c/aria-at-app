import React, { useState, useRef, useEffect } from 'react';
import './TestPlanRefresh.css';
import { ThemeTable } from '../common/ThemeTable';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import PropTypes from 'prop-types';
import {
  GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
  GET_REFRESHABLE_REPORTS_QUERY,
  CREATE_COLLECTION_JOBS_MUTATION
} from './queries';

const RefreshDashboard = ({ activeRuns, onRefreshClick }) => (
  <>
    <h2 id="refresh-heading" className="refresh-header">
      Available Updates
    </h2>
    <div className="refresh-dashboard">
      {activeRuns.map(run => {
        const totalTestPlans = run.reportGroups.reduce(
          (sum, group) => sum + group.reportCount,
          0
        );
        const versionDescription = `${run.botName} ${
          run.newVersion
        } automation support has been added to the application. ${totalTestPlans} test plan versions can be re-run from ${
          run.reportGroups.length
        } previous versions, including ${run.reportGroups
          .map(g => g.prevVersion)
          .join(', ')}.`;

        return (
          <div key={run.id} className="refresh-opportunity">
            <h3
              id={`refresh-heading-${run.id}`}
              className="bot-name"
              aria-label={`Re-run available for ${run.botName} ${run.newVersion}`}
            >
              {run.botName} {run.newVersion}
            </h3>

            <p className="sr-only">{versionDescription}</p>

            <div className="version-update" aria-hidden="true">
              <div className="version-info">
                <div className="version-groups-container">
                  {run.reportGroups.map((group, index) => (
                    <div key={index} className="version-box">
                      <span className="version-number">
                        {group.prevVersion}
                      </span>
                      <span className="version-count">
                        {group.reportCount} run{group.reportCount !== 1 && 's'}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className={`version-box highlight${
                    !run.reportGroups.length ? ' no-reports' : ''
                  }`}
                >
                  <span className="version-number">{run.newVersion}</span>
                  {!run.reportGroups.length && (
                    <span className="version-count">No reports to update</span>
                  )}
                </div>
              </div>
            </div>

            <div className="plan-summary" aria-hidden="true">
              {run.reportGroups.length ? (
                <div className="plan-count">
                  <span className="plan-count-number">{totalTestPlans}</span>
                  <span className="plan-count-label">
                    {totalTestPlans === 1
                      ? 'Test plan version can be re-run'
                      : 'Test plan versions can be re-run'}
                  </span>
                </div>
              ) : (
                <div className="plan-count">
                  <span className="plan-count-label">
                    No test plans available for update
                  </span>
                </div>
              )}
            </div>

            <div className="test-plans-preview">
              {run.reportGroups.map((group, index) => (
                <div key={index} className="version-group">
                  <h4
                    className="plans-preview-title"
                    id={`plans-preview-title-${run.id}-${index}`}
                    aria-label={`Test Plan Versions from ${run.botName} ${group.prevVersion}`}
                  >
                    From Version {group.prevVersion}
                  </h4>
                  <ul
                    className="plans-list"
                    aria-labelledby={`plans-preview-title-${run.id}-${index}`}
                  >
                    {group.reports.map((report, idx) => (
                      <li key={idx}>
                        {report.testPlanVersion.title}{' '}
                        {report.testPlanVersion.versionString},{' '}
                        {report.browser.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="action-footer">
              <button
                className="refresh-button"
                disabled={!run.reportGroups.length}
                onClick={() => onRefreshClick(run)}
                aria-label={`Start automated test plan runs for ${totalTestPlans} test plan versions using ${run.botName} ${run.newVersion}`}
              >
                Start Re-runs
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </>
);

const TestPlanRefresh = () => {
  const [events, setEvents] = useState([]);
  const [activeRuns, setActiveRuns] = useState([]);
  const eventsPanelRef = useRef(null);
  const client = useApolloClient();

  const { data: { me } = {} } = useQuery(ME_QUERY);
  const { isAdmin } = evaluateAuth(me);

  const { data: atVersionsData } = useQuery(
    GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
    {
      skip: !isAdmin
    }
  );

  const [createCollectionJobs] = useMutation(CREATE_COLLECTION_JOBS_MUTATION);

  useEffect(() => {
    if (!atVersionsData?.ats) return;

    const fetchRefreshableReports = async () => {
      const runs = await Promise.all(
        atVersionsData.ats
          .map(at => {
            const automationVersions = at.atVersions
              .filter(v => v.supportedByAutomation)
              .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));

            return automationVersions[0]
              ? { at, version: automationVersions[0] }
              : null;
          })
          .filter(Boolean)
          .map(async ({ at, version }) => {
            try {
              const { data } = await client.query({
                query: GET_REFRESHABLE_REPORTS_QUERY,
                variables: { atVersionId: version.id },
                fetchPolicy: 'network-only'
              });

              return {
                id: version.id,
                botName: `${at.name} Bot`,
                newVersion: version.name,
                reportGroups:
                  data?.refreshableReports?.previousVersionGroups?.map(
                    group => ({
                      prevVersion: group.previousVersion.name,
                      reportCount: group.reports.length,
                      reports: group.reports
                    })
                  ) || []
              };
            } catch (error) {
              console.error('Error fetching refreshable reports:', error);
              return null;
            }
          })
      );

      setActiveRuns(runs.filter(Boolean));
    };

    fetchRefreshableReports();
  }, [atVersionsData, client]);

  const handleRefreshClick = async run => {
    try {
      const response = await createCollectionJobs({
        variables: { atVersionId: run.id }
      });

      const { message } =
        response.data.createCollectionJobsFromPreviousAtVersion;

      setActiveRuns(current => current.filter(item => item.id !== run.id));

      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        description: message
      };

      setEvents(current => [newEvent, ...current]);

      if (eventsPanelRef.current) {
        eventsPanelRef.current.focus();
        const announcement = document.getElementById('refresh-announcement');
        if (announcement) {
          announcement.textContent = message;
        }
      }
    } catch (error) {
      console.error('Error creating collection jobs:', error);
      setEvents(current => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          description: `Error starting re-run for ${run.botName} ${run.newVersion}: ${error.message}`
        },
        ...current
      ]);
    }
  };

  return (
    <div className="test-plan-refresh">
      <div
        id="refresh-announcement"
        aria-live="polite"
        className="sr-only"
        role="status"
      />

      {isAdmin && (
        <RefreshDashboard
          activeRuns={activeRuns}
          onRefreshClick={handleRefreshClick}
        />
      )}

      <div className="events-section" ref={eventsPanelRef} tabIndex="-1">
        <h2 id="events-heading" className="events-header">
          Update Events
        </h2>
        <div className="events-content">
          {events.length ? (
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
  onRefreshClick: PropTypes.func.isRequired
};

export default TestPlanRefresh;
