import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import { ME_QUERY } from '../App/queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import RerunDashboard from './RerunDashboard';
import UpdateEventsPanel from './UpdateEventsPanel';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useAriaLiveRegion } from '../providers/AriaLiveRegionProvider';
import {
  GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
  GET_RERUNNABLE_REPORTS_QUERY,
  CREATE_COLLECTION_JOBS_MUTATION,
  GET_UPDATE_EVENTS
} from './queries';

const ReportRerun = ({ onQueueUpdate }) => {
  const { triggerLoad, loadingMessage } = useTriggerLoad();
  const eventsPanelRef = useRef(null);
  const announce = useAriaLiveRegion();
  const previousEventsCountRef = useRef(0);

  const [rerunnableReportsData, setRerunnableReportsData] = useState({});

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
      variables: {
        types: [
          'GENERAL',
          'COLLECTION_JOB_CREATION',
          'COLLECTION_JOB_START',
          'COLLECTION_JOB_COMPLETION',
          'COLLECTION_JOB_FAILURE',
          'COLLECTION_JOB_TEST_PLAN_REPORT'
        ]
      },
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

  const [getRerunnableReports] = useLazyQuery(GET_RERUNNABLE_REPORTS_QUERY, {
    fetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (automatedVersions.length > 0) {
      const currentVersionIds = automatedVersions.map(
        ({ version }) => version.id
      );

      setRerunnableReportsData(prev => {
        const filtered = {};
        currentVersionIds.forEach(versionId => {
          if (prev[versionId]) {
            filtered[versionId] = prev[versionId];
          }
        });
        return filtered;
      });

      const fetchAllReports = async () => {
        try {
          const promises = automatedVersions.map(async ({ version }) => {
            const result = await getRerunnableReports({
              variables: { atVersionId: version.id }
            });
            return { versionId: version.id, result };
          });

          const results = await Promise.all(promises);

          setRerunnableReportsData(prev => {
            const newData = { ...prev };
            results.forEach(({ versionId, result }) => {
              if (result.data?.rerunnableReports) {
                newData[versionId] = result.data;
              }
            });
            return newData;
          });
        } catch (error) {
          console.error('Error fetching rerunnable reports:', error);
        }
      };

      fetchAllReports();
    }
  }, [automatedVersions, getRerunnableReports]);

  const activeRuns = useMemo(() => {
    if (!automatedVersions.length) return [];

    return automatedVersions.map(({ at, version }) => {
      const rerunnableData = rerunnableReportsData[version.id];
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
  }, [automatedVersions, rerunnableReportsData]);

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

        const result = await getRerunnableReports({
          variables: { atVersionId: run.id },
          fetchPolicy: 'network-only'
        });

        if (result.data?.rerunnableReports) {
          setRerunnableReportsData(prev => ({
            ...prev,
            [run.id]: result.data
          }));
        }

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
    </LoadingStatus>
  );
};

ReportRerun.propTypes = {
  onQueueUpdate: PropTypes.func.isRequired
};

export default ReportRerun;
