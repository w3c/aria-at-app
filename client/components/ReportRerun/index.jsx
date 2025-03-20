import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import PropTypes from 'prop-types';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import RerunDashboard from './RerunDashboard';
import UpdateEventsPanel from './UpdateEventsPanel';
import './ReportRerun.css';
import {
  GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
  GET_REFRESHABLE_REPORTS_QUERY,
  CREATE_COLLECTION_JOBS_MUTATION,
  GET_UPDATE_EVENTS
} from './queries';

const ReportRerun = ({ onQueueUpdate }) => {
  const [events, setEvents] = useState([]);
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

  const { data: { updateEvents = [] } = {} } = useQuery(GET_UPDATE_EVENTS, {
    variables: { type: 'COLLECTION_JOB' },
    pollInterval: 5000 // Poll every 5 seconds for updates
  });

  // Get the latest version for each AT that supports automation
  const automatedVersions = useMemo(() => {
    if (!atVersionsData?.ats) return [];

    return atVersionsData.ats
      .map(at => {
        const automationVersions = at.atVersions
          .filter(v => v.supportedByAutomation)
          .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));

        return automationVersions[0]
          ? { at, version: automationVersions[0] }
          : null;
      })
      .filter(Boolean);
  }, [atVersionsData]);

  // Query refreshable reports for each automated version
  const refreshableReportsQueries = automatedVersions.map(({ at, version }) =>
    useQuery(GET_REFRESHABLE_REPORTS_QUERY, {
      variables: { atVersionId: version.id },
      fetchPolicy: 'cache-and-network'
    })
  );

  // Transform the query results into activeRuns
  const activeRuns = useMemo(() => {
    return automatedVersions.map(({ at, version }, index) => {
      const { data: refreshableData } = refreshableReportsQueries[index];

      return {
        id: version.id,
        botName: `${at.name} Bot`,
        newVersion: version.name,
        reportGroups:
          refreshableData?.refreshableReports?.previousVersionGroups?.map(
            group => ({
              prevVersion: group.previousVersion.name,
              reportCount: group.reports.length,
              reports: group.reports
            })
          ) || []
      };
    });
  }, [automatedVersions, refreshableReportsQueries]);

  const [createCollectionJobs] = useMutation(CREATE_COLLECTION_JOBS_MUTATION);

  const handleRerunClick = async run => {
    try {
      const response = await createCollectionJobs({
        variables: { atVersionId: run.id }
      });

      const { message } =
        response.data.createCollectionJobsFromPreviousAtVersion;

      // Trigger refetch without blocking
      client.query({
        query: GET_REFRESHABLE_REPORTS_QUERY,
        variables: { atVersionId: run.id },
        fetchPolicy: 'network-only'
      });
      onQueueUpdate();

      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        description: message
      };

      setEvents(current => [newEvent, ...current]);

      if (eventsPanelRef.current) {
        eventsPanelRef.current.focus();
        const announcement = document.getElementById('rerun-announcement');
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
        id="rerun-announcement"
        aria-live="polite"
        className="sr-only"
        role="status"
      />

      {isAdmin && (
        <RerunDashboard
          activeRuns={activeRuns}
          onRerunClick={handleRerunClick}
        />
      )}

      <UpdateEventsPanel
        events={updateEvents}
        eventsPanelRef={eventsPanelRef}
      />
    </div>
  );
};

ReportRerun.propTypes = {
  onQueueUpdate: PropTypes.func.isRequired
};

export default ReportRerun;
