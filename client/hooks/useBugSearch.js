import { useState, useMemo, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useSearchableList } from './useSearchableList';
import { AT_BUGS_QUERY } from '../components/FailingAssertionsSummary/queries';

/**
 * Hook for searching and filtering available bugs
 * Uses the generic useSearchableList hook for filtering logic
 */
export const useBugSearch = ({ atId, assertion }) => {
  const [fetchBugs, { data: bugsData, loading: bugsLoading }] = useLazyQuery(
    AT_BUGS_QUERY,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

  const availableBugs = useMemo(() => bugsData?.atBugs || [], [bugsData]);

  const linkedBugIds = useMemo(
    () => (assertion?.assertionAtBugs || []).map(b => b.id),
    [assertion]
  );

  const {
    searchText,
    setSearchText,
    filteredItems: filteredBugs
  } = useSearchableList({
    items: availableBugs,
    searchFields: bug => [bug.title, bug.bugId, bug.url],
    excludeIds: linkedBugIds,
    maxResults: 20
  });

  const handleFetchBugs = useCallback(() => {
    fetchBugs({ variables: { atId: Number(atId) } });
  }, [fetchBugs, atId]);

  return {
    searchText,
    setSearchText,
    bugsLoading,
    availableBugs,
    filteredBugs,
    linkedBugs: assertion?.assertionAtBugs || [],
    handleFetchBugs
  };
};

