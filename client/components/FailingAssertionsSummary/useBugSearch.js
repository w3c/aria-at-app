import { useState, useMemo, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { AT_BUGS_QUERY } from './queries';

/**
 * Hook for searching and filtering available bugs
 */
export const useBugSearch = ({ atId, assertion }) => {
  const [searchText, setSearchText] = useState('');

  const [fetchBugs, { data: bugsData, loading: bugsLoading }] = useLazyQuery(
    AT_BUGS_QUERY,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

  const linkedBugIds = useMemo(
    () => (assertion?.assertionAtBugs || []).map(b => b.id),
    [assertion]
  );

  const availableBugs = useMemo(() => bugsData?.atBugs || [], [bugsData]);

  // Filter out already linked bugs and limit results
  const filteredBugs = useMemo(() => {
    const base = availableBugs.filter(b => !linkedBugIds.includes(b.id));
    const q = (searchText || '').trim().toLowerCase();
    if (!q) return base.slice(0, 20);
    return base
      .filter(b =>
        [b.title, b.bugId, b.url]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [availableBugs, searchText, linkedBugIds]);

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
