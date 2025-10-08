import { useBugSearch } from './useBugSearch';
import { useBugPendingChanges } from './useBugPendingChanges';
import { useBugModalActions } from './useBugModalActions';

/**
 * Main hook that combines all bug linking functionality
 * Provides a single interface for bug linking operations
 * @param {Object} options - Configuration options
 * @param {string|number} options.atId - AT ID for bug operations
 * @param {Object} options.assertion - Assertion object
 * @param {Function} options.onLinked - Callback when bugs are linked
 * @param {Function} options.onClose - Callback when modal closes
 * @returns {Object} Combined bug linking state and handlers
 */
export const useBugLinking = ({ atId, assertion, onLinked, onClose }) => {
  // Manage pending changes and display assertion
  const pendingChanges = useBugPendingChanges({ assertion });

  // Search and filter bugs
  const bugSearch = useBugSearch({
    atId,
    assertion: pendingChanges.displayAssertion
  });

  // Modal actions (save, cancel, confirmation)
  const modalActions = useBugModalActions({
    assertion,
    pendingChanges: pendingChanges.pendingChanges,
    displayAssertion: pendingChanges.displayAssertion,
    onLinked,
    onClose,
    clearChanges: pendingChanges.clearChanges
  });

  return {
    // Bug search state
    ...bugSearch,

    // Pending changes state
    ...pendingChanges,

    // Modal actions
    ...modalActions
  };
};
