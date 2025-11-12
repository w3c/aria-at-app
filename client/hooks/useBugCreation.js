import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_AT_BUG } from '../components/FailingAssertionsSummary/queries';

/**
 * @typedef {Object} UseBugCreationOptions
 * @property {number|string} atId - The AT ID to create the bug for
 * @property {Array} availableBugs - Array of existing bugs to check for duplicates
 */

/**
 * @typedef {Object} UseBugCreationReturn
 * @property {boolean} creating - True if bug creation is in progress
 * @property {Object|undefined} createError - Error object if creation failed, undefined otherwise
 * @property {Function} handleCreateBug - Function to create a bug (title, url) => Promise<bug>
 * @property {Function} checkDuplicateUrl - Function to check if a URL already exists (url) => bug|null
 */

/**
 * Hook for creating new AT bugs. Provides mutation handling and duplicate URL checking.
 *
 * @param {UseBugCreationOptions} options - Configuration options
 * @returns {UseBugCreationReturn}
 */
export const useBugCreation = ({ atId, availableBugs }) => {
  const [createAtBug, { loading: creating, error: createError }] =
    useMutation(CREATE_AT_BUG);

  // Check if a bug with the given URL already exists
  const checkDuplicateUrl = useCallback(
    url => {
      if (!url) return null;
      const normalized = url.trim().toLowerCase();
      return availableBugs.find(
        bug => bug.url && bug.url.trim().toLowerCase() === normalized
      );
    },
    [availableBugs]
  );

  const handleCreateBug = useCallback(
    async ({ title, url }) => {
      const res = await createAtBug({
        variables: { input: { title, url, atId: Number(atId) } }
      });
      const created = res?.data?.createAtBug;
      if (created?.id) {
        return created;
      }
    },
    [createAtBug, atId]
  );

  return {
    creating,
    createError,
    handleCreateBug,
    checkDuplicateUrl
  };
};
