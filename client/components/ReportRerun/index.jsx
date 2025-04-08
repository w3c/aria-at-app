import React, { useMemo } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import PropTypes from 'prop-types';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import RerunDashboard from './RerunDashboard';
import UpdateEventsPanel from './UpdateEventsPanel';
import { utils } from 'shared';
import styles from './ReportRerun.module.css';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import {
  GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
  GET_RERUNNABLE_REPORTS_QUERY,
  CREATE_COLLECTION_JOBS_MUTATION,
  GET_UPDATE_EVENTS
} from './queries';
import ResetDbButton from '../common/ResetDbButton';

const ReportRerun = ({ onQueueUpdate }) => {
  const client = useApolloClient();
  const { triggerLoad, loadingMessage } = useTriggerLoad();

  const { data: { me } = {} } = useQuery(ME_QUERY);
  const { isAdmin } = evaluateAuth(me);

  const { data: atVersionsData } = useQuery(
    GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
    {
      skip: !isAdmin
    }
  );

  const { data: { updateEvents = [] } = {}, refetch: refetchEvents } = useQuery(
    GET_UPDATE_EVENTS,
    {
      pollInterval: 10000
    }
  );

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

  const rerunnableReportsQueries = automatedVersions.map(({ version }) =>
    useQuery(GET_RERUNNABLE_REPORTS_QUERY, {
      variables: { atVersionId: version.id },
      fetchPolicy: 'cache-and-network'
    })
  );

  const activeRuns = useMemo(() => {
    return automatedVersions.map(({ at, version }, index) => {
      const { data: rerunnableData } = rerunnableReportsQueries[index];
      const groups =
        rerunnableData?.rerunnableReports?.previousVersionGroups || [];

      const reportGroups = utils
        .sortAtVersions(
          groups.map(group => ({
            name: group.previousVersion.name,
            releasedAt: group.previousVersion.releasedAt
          }))
        )
        .map(sortedVersion => {
          const group = groups.find(
            g => g.previousVersion.name === sortedVersion.name
          );
          return {
            prevVersion: group.previousVersion.name,
            releasedAt: group.previousVersion.releasedAt,
            reportCount: group.reports.length,
            reports: group.reports
          };
        });

      return {
        id: version.id,
        botName: `${at.name} Bot`,
        newVersion: version.name,
        reportGroups
      };
    });
  }, [automatedVersions, rerunnableReportsQueries]);

  const [createCollectionJobs] = useMutation(CREATE_COLLECTION_JOBS_MUTATION);

  const handleRerunClick = async run => {
    await triggerLoad(async () => {
      await createCollectionJobs({
        variables: { atVersionId: run.id }
      });

      await client.query({
        query: GET_RERUNNABLE_REPORTS_QUERY,
        variables: { atVersionId: run.id },
        fetchPolicy: 'network-only'
      });

      await client.query({
        query: GET_UPDATE_EVENTS,
        variables: { type: 'COLLECTION_JOB' },
        fetchPolicy: 'network-only'
      });
      onQueueUpdate();
    }, 'Starting automated test plan runs...');
  };

  const handleRefreshEvents = async () => {
    await refetchEvents();
  };

  return (
    <LoadingStatus message={loadingMessage}>
      <div className={styles.rerunSection}>
        {isAdmin && (
          <RerunDashboard
            activeRuns={activeRuns}
            onRerunClick={handleRerunClick}
          />
        )}

        <UpdateEventsPanel
          events={updateEvents}
          isAdmin={isAdmin}
          onRefresh={handleRefreshEvents}
        />

        <ResetDbButton />
      </div>
    </LoadingStatus>
  );
};

ReportRerun.propTypes = {
  onQueueUpdate: PropTypes.func.isRequired
};

export default ReportRerun;
