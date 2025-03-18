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

const getVersionDescription = run => {
  const totalTestPlans = run.reportGroups.reduce(
    (sum, group) => sum + group.reportCount,
    0
  );
  const reports = run.reportGroups.map(group => group.prevVersion).join(', ');
  return `${run.botName} ${run.newVersion} automation support has been added to the application. ${totalTestPlans} test plan versions can be re-run from ${run.reportGroups.length} previous versions, including ${reports}.`;
};

const RefreshDashboard = ({ activeRuns, onRefreshClick }) => (
  <>
    <h2 id="refresh-heading" className="refresh-header">
      Available Updates
    </h2>
    <div className="refresh-dashboard">
      {activeRuns.map(run => {
        const headingId = `refresh-heading-${run.id}`;
        const totalTestPlans = run.reportGroups.reduce(
          (sum, group) => sum + group.reportCount,
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
                  {run.reportGroups.map((group, index) => (
                    <div key={index} className="version-box">
                      <span className="version-number">
                        {group.prevVersion}
                      </span>
                      <span className="version-count">
                        {group.reportCount} run
                        {group.reportCount === 1 ? '' : 's'}
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
              {run.reportGroups.map((group, groupIndex) => (
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
                    {group.reports.map((report, index) => (
                      <li key={index}>
                        {report.testPlanVersion.title}, {report.browser.name},{' '}
                        {report.at.name}
                      </li>
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
  const [activeRuns, setActiveRuns] = useState([]);
  const [events, setEvents] = useState([]);
  const [nextEventId, setNextEventId] = useState(1);
  const eventsPanelRef = useRef(null);
  const client = useApolloClient();

  const { data: { me } = {} } = useQuery(ME_QUERY);
  const { isAdmin } = evaluateAuth(me);

  // Fetch all automation-supported AT versions
  const { data: atVersionsData, loading: loadingVersions } = useQuery(
    GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
    {
      skip: !isAdmin
    }
  );

  // Process supported AT versions to find the latest versions
  useEffect(() => {
    if (!atVersionsData || loadingVersions) return;

    const fetchPromises = [];
    // Find the latest automatable version for each AT
    atVersionsData.ats.forEach(at => {
      // Filter to only versions that support automation and sort by release date (newest first)
      const automationVersions = at.atVersions
        .filter(version => version.supportedByAutomation)
        .sort((a, b) => {
          return new Date(b.releasedAt) - new Date(a.releasedAt);
        });

      if (automationVersions.length > 0) {
        const latestVersion = automationVersions[0];

        // Create a promise to fetch refreshable reports for this version
        fetchPromises.push(
          fetchRefreshableReports(latestVersion.id, at.name, latestVersion.name)
        );
      }
    });

    // Wait for all queries to complete
    Promise.all(fetchPromises).then(results => {
      // Filter out undefined results and set as active runs
      const validRuns = results.filter(run => run !== undefined);
      setActiveRuns(validRuns);
    });
  }, [atVersionsData, loadingVersions]);

  // Function to fetch refreshable reports for a specific AT version
  const fetchRefreshableReports = async (atVersionId, atName, versionName) => {
    try {
      const { data } = await client.query({
        query: GET_REFRESHABLE_REPORTS_QUERY,
        variables: { atVersionId },
        fetchPolicy: 'network-only'
      });

      if (!data?.refreshableReports?.previousVersionGroups?.length) {
        return undefined;
      }

      // Transform data to match the UI format
      const reportGroups = data.refreshableReports.previousVersionGroups.map(
        group => ({
          prevVersion: group.previousVersion.name,
          reportCount: group.reports.length,
          reports: group.reports
        })
      );

      return {
        id: atVersionId,
        botName: `${atName} Bot`,
        newVersion: versionName,
        reportGroups
      };
    } catch (error) {
      console.error('Error fetching refreshable reports:', error);
      if (error.graphQLErrors?.length) {
        console.error('GraphQL Errors:', error.graphQLErrors);
      }
      if (error.networkError?.result) {
        console.error('Network Error:', error.networkError);
      }
      return undefined;
    }
  };

  // Mutation to create collection jobs
  const [createCollectionJobs] = useMutation(CREATE_COLLECTION_JOBS_MUTATION);

  const handleRefreshClick = async run => {
    try {
      const response = await createCollectionJobs({
        variables: { atVersionId: run.id }
      });

      const { collectionJobs, message } =
        response.data.createCollectionJobsFromPreviousAtVersion;
      // Remove this run from active runs
      setActiveRuns(current => current.filter(item => item.id !== run.id));

      // Create events for each job
      const newEvents = [];
      let eventId = nextEventId;

      // Add a summary event
      newEvents.push({
        id: eventId++,
        timestamp: new Date().toLocaleString(),
        description: message
      });

      // Add details for each job if available
      if (collectionJobs && collectionJobs.length > 0) {
        run.versionGroups.forEach(group => {
          group.reports.forEach((report, idx) => {
            if (idx < collectionJobs.length) {
              newEvents.push({
                id: eventId++,
                timestamp: new Date().toLocaleString(),
                description: `Update run started for ${report.testPlanVersion.title} using ${run.botName} ${run.newVersion} (upgrading from ${group.prevVersion})`
              });
            }
          });
        });
      }

      setNextEventId(eventId);
      setEvents(current => [...newEvents, ...current]);

      // Announce to screen readers and move focus
      if (eventsPanelRef.current) {
        eventsPanelRef.current.focus();
        const announcement = document.getElementById('refresh-announcement');
        if (announcement) {
          const totalPlans = run.versionGroups.reduce(
            (sum, group) => sum + group.testPlanCount,
            0
          );
          announcement.textContent = `Started re-run for ${totalPlans} test plans with ${run.botName} version ${run.newVersion}. Focus moved to events list.`;
        }
      }
    } catch (error) {
      console.error('Error creating collection jobs:', error);
      const errorEvent = {
        id: nextEventId,
        timestamp: new Date().toLocaleString(),
        description: `Error starting re-run for ${run.botName} ${run.newVersion}: ${error.message}`
      };
      setNextEventId(prevId => prevId + 1);
      setEvents(current => [errorEvent, ...current]);
    }
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
  onRefreshClick: PropTypes.func.isRequired
};

export default TestPlanRefresh;
