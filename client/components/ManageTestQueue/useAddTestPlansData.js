import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import {
  ADD_TEST_PLANS_QUERY,
  TEST_QUEUE_PAGE_QUERY
} from '@components/TestQueue/queries';
import { DATA_MANAGEMENT_PAGE_QUERY } from '@components/DataManagement/queries';

export const useAddTestPlansData = isOpen => {
  const { data: cachedQueueData } = useQuery(TEST_QUEUE_PAGE_QUERY, {
    skip: !isOpen,
    fetchPolicy: 'cache-only'
  });

  const { data: managementData } = useQuery(DATA_MANAGEMENT_PAGE_QUERY, {
    skip: !isOpen || !!cachedQueueData,
    fetchPolicy: 'cache-only'
  });

  const { data: gitData } = useQuery(ADD_TEST_PLANS_QUERY, {
    variables: {
      testPlanVersionPhases: ['DRAFT', 'CANDIDATE', 'RECOMMENDED']
    },
    skip: !isOpen,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first'
  });

  const mainQueryData = cachedQueueData || managementData;

  const processedData = useMemo(() => {
    if (!mainQueryData?.testPlans) {
      return { allTestPlans: [], allTestPlanVersions: [] };
    }

    const gitDataMap = {};
    if (gitData?.testPlans) {
      gitData.testPlans.forEach(testPlan => {
        testPlan.testPlanVersions.forEach(version => {
          gitDataMap[version.id] = {
            gitSha: version.gitSha,
            gitMessage: version.gitMessage
          };
        });
      });
    }

    const allTestPlanVersions = [];
    mainQueryData.testPlans.forEach(testPlan => {
      testPlan.testPlanVersions.forEach(version => {
        if (version.testPlanReports && version.testPlanReports.length > 0) {
          allTestPlanVersions.push({
            ...version,
            testPlan: { directory: testPlan.directory },
            gitSha: gitDataMap[version.id]?.gitSha,
            gitMessage: gitDataMap[version.id]?.gitMessage
          });
        }
      });
    });

    const allTestPlans = allTestPlanVersions
      .filter(
        (v, i, a) =>
          a.findIndex(
            t =>
              t.title === v.title &&
              t.testPlan.directory === v.testPlan.directory
          ) === i
      )
      .map(({ id, title, testPlan }) => ({
        id,
        title,
        directory: testPlan.directory
      }))
      .sort((a, b) => (a.title < b.title ? -1 : 1));

    return { allTestPlans, allTestPlanVersions };
  }, [mainQueryData, gitData]);

  return processedData;
};

export const useAddTestPlansFormState = allTestPlanVersions => {
  const [selectedTestPlanVersionId, setSelectedTestPlanVersionId] =
    useState('');

  useMemo(() => {
    if (allTestPlanVersions.length && !selectedTestPlanVersionId) {
      const sortedVersions = [...allTestPlanVersions].sort((a, b) => {
        if (a.title !== b.title) {
          return a.title < b.title ? -1 : 1;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      const firstValidVersion = sortedVersions.find(
        version => version.phase !== 'DEPRECATED' && version.phase !== 'RD'
      );

      if (firstValidVersion) {
        setSelectedTestPlanVersionId(firstValidVersion.id);
      }
    }
  }, [allTestPlanVersions]);

  const getMatchingTestPlanVersions = testPlanVersionId => {
    const retrievedTestPlanVersion = allTestPlanVersions.find(
      item => item.id === testPlanVersionId
    );

    if (!retrievedTestPlanVersion) return [];

    return allTestPlanVersions
      .filter(
        item =>
          item.title === retrievedTestPlanVersion.title &&
          item.testPlan.directory ===
            retrievedTestPlanVersion.testPlan.directory &&
          item.phase !== 'DEPRECATED' &&
          item.phase !== 'RD'
      )
      .sort((a, b) => (new Date(a.updatedAt) > new Date(b.updatedAt) ? -1 : 1));
  };

  return {
    selectedTestPlanVersionId,
    setSelectedTestPlanVersionId,
    getMatchingTestPlanVersions
  };
};
