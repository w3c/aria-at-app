import { useMemo, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useSearchableList } from './useSearchableList';
import { AT_BUGS_QUERY } from '../components/FailingAssertionsSummary/queries';

/**
 * @typedef {Object} UseBugSearchOptions
 * @property {number|string} atId - The AT ID to fetch bugs for
 * @property {Object} assertion - The assertion object containing assertionAtBugs
 */

/**
 * @typedef {Object} UseBugSearchReturn
 * @property {string} searchText - Current search text
 * @property {Function} setSearchText - Function to update search text
 * @property {boolean} bugsLoading - Loading state of the bugs query
 * @property {Array} availableBugs - All available bugs from the query
 * @property {Array} filteredBugs - Bugs filtered by search text, excluding linked bugs
 * @property {Array} linkedBugs - Bugs currently linked to the assertion
 * @property {Function} handleFetchBugs - Function to trigger fetching bugs
 */

/**
 * Hook for searching and filtering AT bugs. Uses lazy query to fetch bugs on demand
 * and provides searchable list functionality. Excludes bugs that are already linked
 * to the assertion.
 *
 * @param {UseBugSearchOptions} options - Configuration options
 * @returns {UseBugSearchReturn}
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
    searchFields: bug => [bug.title, bug.url],
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
