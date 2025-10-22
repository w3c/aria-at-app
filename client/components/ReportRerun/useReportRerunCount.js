import { useQuery } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
  GET_RERUNNABLE_REPORTS_COUNT_QUERY
} from './queries';

const useReportRerunCount = isAdmin => {
  const client = useApolloClient();
  const [totalAutomatedRuns, setTotalAutomatedRuns] = useState(null);

  const { data: atVersionsData } = useQuery(
    GET_AUTOMATION_SUPPORTED_AT_VERSIONS,
    {
      skip: !isAdmin,
      fetchPolicy: 'cache-and-network'
    }
  );

  useEffect(() => {
    if (!isAdmin || !atVersionsData?.ats) return;

    const automatedVersions = atVersionsData.ats.flatMap(at =>
      at.atVersions
        .filter(v => v.supportedByAutomation)
        .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt))
        .slice(0, 1)
        .map(version => ({ at, version }))
    );

    if (automatedVersions.length === 0) {
      setTotalAutomatedRuns(0);
      return;
    }

    Promise.all(
      automatedVersions.map(({ version }) =>
        client.query({
          query: GET_RERUNNABLE_REPORTS_COUNT_QUERY,
          variables: { atVersionId: version.id },
          fetchPolicy: 'cache-first'
        })
      )
    )
      .then(results => {
        const totalReports = results.reduce((sum, result) => {
          const groups =
            result.data?.rerunnableReports?.previousVersionGroups || [];
          return (
            sum +
            groups.reduce(
              (groupSum, group) => groupSum + group.reports.length,
              0
            )
          );
        }, 0);
        setTotalAutomatedRuns(totalReports);
      })
      .catch(error => {
        console.error('Error fetching rerunnable reports count:', error);
      });
  }, [isAdmin, atVersionsData, client]);

  return totalAutomatedRuns;
};

export default useReportRerunCount;
