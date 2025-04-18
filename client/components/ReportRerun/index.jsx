import React, { useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import PropTypes from 'prop-types';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import RerunDashboard from './RerunDashboard';
import UpdateEventsPanel from './UpdateEventsPanel';
import styles from './ReportRerun.module.css';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useAriaLiveRegion } from '../providers/AriaLiveRegionProvider';
import {
  GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
  GET_RERUNNABLE_REPORTS_QUERY,
  CREATE_COLLECTION_JOBS_MUTATION,
  GET_UPDATE_EVENTS
} from './queries';
import ResetDbButton from '../common/ResetDbButton';

const ReportRerun = ({ onQueueUpdate, onTotalRunsAvailable }) => {
  const client = useApolloClient();
  const { triggerLoad, loadingMessage } = useTriggerLoad();
  const eventsPanelRef = useRef(null);
  const announce = useAriaLiveRegion();
  const previousEventsCountRef = useRef(0);

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
      pollInterval: 10000,
      onCompleted: data => {
        const currentCount = data?.updateEvents?.length || 0;
        const previousCount = previousEventsCountRef.current;
        const newEventsCount = currentCount - previousCount;

        if (currentCount > 0 && newEventsCount > 0) {
          announce(
            `Update events refreshed. ${newEventsCount} new event${
              newEventsCount > 1 ? 's' : ''
            } added.`
          );
        } else if (currentCount > 0 && previousCount === 0) {
          announce(
            `Loaded ${currentCount} update event${currentCount > 1 ? 's' : ''}.`
          );
        }
        previousEventsCountRef.current = currentCount;
      },
      onError: () => {
        announce('Error fetching update events.');
        previousEventsCountRef.current = 0;
      }
    }
  );

  useEffect(() => {
    previousEventsCountRef.current = updateEvents.length;
  }, [updateEvents]);

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

      const sortedGroups = [...groups].sort((a, b) => {
        const dateA = new Date(a.previousVersion.releasedAt);
        const dateB = new Date(b.previousVersion.releasedAt);
        return dateA - dateB;
      });

      const reportGroups = sortedGroups.map(group => {
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

  useEffect(() => {
    const totalAvailableRuns = activeRuns.reduce(
      (total, run) =>
        total +
        run.reportGroups.reduce((sum, group) => sum + group.reportCount, 0),
      0
    );
    if (onTotalRunsAvailable) {
      onTotalRunsAvailable(totalAvailableRuns);
    }
  }, [activeRuns, onTotalRunsAvailable]);

  const hasRerunnableReports = useMemo(() => {
    return activeRuns.some(
      run =>
        run.reportGroups.reduce((sum, group) => sum + group.reportCount, 0) > 0
    );
  }, [activeRuns]);

  const [createCollectionJobs] = useMutation(CREATE_COLLECTION_JOBS_MUTATION);

  const handleRerunClick = async run => {
    const triggerLoadPromise = triggerLoad(async () => {
      try {
        await createCollectionJobs({
          variables: { atVersionId: run.id }
        });

        await client.query({
          query: GET_RERUNNABLE_REPORTS_QUERY,
          variables: { atVersionId: run.id },
          fetchPolicy: 'network-only'
        });

        await refetchEvents();

        onQueueUpdate();

        setTimeout(() => {
          eventsPanelRef.current?.focus();
        }, 100);

        announce(
          `Report generation successfully initiated for ${run.botName} ${run.newVersion}. Monitor events below.`
        );
      } catch (error) {
        console.error('Failed to create collection jobs:', error);
        announce(
          `Error initiating report generation for ${run.botName} ${run.newVersion}. Check console for details.`
        );
      }
    }, `Starting automated report generation for ${run.botName} ${run.newVersion}...`);

    try {
      await triggerLoadPromise;
    } catch (error) {
      if (error) {
        console.error('Failed to complete the triggerLoad operation:', error);
        announce(
          `An error occurred during the report generation process for ${run.botName} ${run.newVersion}. Check console.`
        );
      }
    }
  };

  const handleRefreshEvents = async () => {
    announce('Refreshing update events...');
    try {
      await refetchEvents();
    } catch (error) {
      console.error('Failed to refetch events:', error);
      announce('Error refreshing update events.');
    }
  };

  return (
    <LoadingStatus message={loadingMessage}>
      <div className={styles.rerunSection}>
        {isAdmin && hasRerunnableReports && (
          <RerunDashboard
            activeRuns={activeRuns.filter(
              run =>
                run.reportGroups.reduce(
                  (sum, group) => sum + group.reportCount,
                  0
                ) > 0
            )}
            onRerunClick={handleRerunClick}
          />
        )}

        <UpdateEventsPanel
          events={updateEvents}
          isAdmin={isAdmin}
          onRefresh={handleRefreshEvents}
          ref={eventsPanelRef}
        />
      </div>
    </LoadingStatus>
  );
};

ReportRerun.propTypes = {
  onQueueUpdate: PropTypes.func.isRequired,
  onTotalRunsAvailable: PropTypes.func
};

export default ReportRerun;
