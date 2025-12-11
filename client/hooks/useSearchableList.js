import { useState, useMemo, useCallback } from 'react';

/**
 * @typedef {Object} UseSearchableListOptions
 * @property {Array} [items=[]] - Array of items to search through
 * @property {Function} [searchFields=item => [item.title, item.name, item.id]] -
 *   Function that returns an array of fields to search within for each item
 * @property {number} [maxResults=20] - Maximum number of results to return
 * @property {Array} [excludeIds=[]] - Array of item IDs to exclude from results
 */

/**
 * @typedef {Object} UseSearchableListReturn
 * @property {string} searchText - Current search text value
 * @property {Function} setSearchText - Function to update the search text
 * @property {Array} filteredItems - Array of filtered items matching the search criteria
 * @property {Function} clearSearch - Function to clear the search text
 */

/**
 * Generic hook for managing searchable lists with filtering. Filters items based on
 * search text and excludes items by ID. Limits results to a maximum number.
 *
 * @param {UseSearchableListOptions} options - Configuration options
 * @returns {UseSearchableListReturn}
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
