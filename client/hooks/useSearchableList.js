import { useState, useMemo, useCallback } from 'react';

/**
 * Generic hook for managing searchable lists with filtering
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Array of items to search
 * @param {Function} options.searchFields - Function that returns fields to search in each item
 * @param {number} options.maxResults - Maximum number of results to return (default: 20)
 * @param {Array} options.excludeIds - Array of IDs to exclude from results
 * @returns {Object} Search state and handlers
 */
export const useSearchableList = ({
  items = [],
  searchFields = item => [item.title, item.name, item.id],
  maxResults = 20,
  excludeIds = []
}) => {
  const [searchText, setSearchText] = useState('');

  // Filter items based on search text and exclusions
  const filteredItems = useMemo(() => {
    const excluded = new Set(excludeIds.map(id => String(id)));
    const base = items.filter(item => !excluded.has(String(item.id)));

    const query = (searchText || '').trim().toLowerCase();
    if (!query) {
      return base.slice(0, maxResults);
    }

    return base
      .filter(item => {
        const fields = searchFields(item);
        return fields
          .filter(Boolean)
          .some(field => String(field).toLowerCase().includes(query));
      })
      .slice(0, maxResults);
  }, [items, searchText, excludeIds, searchFields, maxResults]);

  const clearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  return {
    searchText,
    setSearchText,
    filteredItems,
    clearSearch
  };
};
