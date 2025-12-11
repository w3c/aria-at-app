import { useBugSearch } from './useBugSearch';
import { useBugPendingChanges } from './useBugPendingChanges';
import { useBugModalActions } from './useBugModalActions';

/**
 * @typedef {Object} UseBugLinkingOptions
 * @property {number|string} atId - The AT ID to fetch bugs for
 * @property {Object} assertion - The assertion object to link bugs to
 * @property {Function} onLinked - Callback function called when bugs are successfully linked
 * @property {Function} onClose - Callback function called when the modal should close
 */

/**
 * Hook that combines bug search, pending changes, and modal actions for bug linking functionality.
 * Provides a unified interface for linking AT bugs to assertions.
 *
 * @param {UseBugLinkingOptions} options - Configuration options
 * @returns {Object} Combined return values from useBugSearch, useBugPendingChanges, and useBugModalActions
 */
export const useBugLinking = ({ atId, assertion, onLinked, onClose }) => {
  const pendingChanges = useBugPendingChanges({ assertion });

  const bugSearch = useBugSearch({
    atId,
    assertion: pendingChanges.displayAssertion
  });

  const modalActions = useBugModalActions({
    assertion,
    pendingChanges: pendingChanges.pendingChanges,
    displayAssertion: pendingChanges.displayAssertion,
    onLinked,
    onClose,
    clearChanges: pendingChanges.clearChanges
  });

  return {
    ...bugSearch,
    ...pendingChanges,
    ...modalActions
  };
};
