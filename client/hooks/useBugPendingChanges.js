import { useMemo } from 'react';
import { usePendingChanges } from './usePendingChanges';

/**
 * @typedef {Object} UseBugPendingChangesOptions
 * @property {Object} assertion - The assertion object containing assertionAtBugs array
 */

/**
 * @typedef {Object} BugPendingChanges
 * @property {Array} linkedBugs - Array of bugs to be linked
 * @property {Array} unlinkedBugs - Array of bug IDs to be unlinked
 */

/**
 * @typedef {Object} UseBugPendingChangesReturn
 * @property {BugPendingChanges} pendingChanges - Object with linkedBugs and unlinkedBugs arrays
 * @property {Object} displayAssertion - Assertion object with pending changes applied
 * @property {boolean} hasChanges - True if there are pending changes
 * @property {Function} addLinkedBug - Function to add a bug to linked bugs
 * @property {Function} addUnlinkedBug - Function to add a bug ID to unlinked bugs
 * @property {Function} clearChanges - Function to clear all pending changes
 */

/**
 * Hook for managing pending bug changes in the LinkAtBugModal. Uses the generic
 * usePendingChanges hook for change management, mapping it to bug-specific structure.
 *
 * @param {UseBugPendingChangesOptions} options - Configuration options
 * @returns {UseBugPendingChangesReturn}
 */
export const useBugPendingChanges = ({ assertion }) => {
  const {
    pendingChanges,
    displayItem: displayAssertion,
    hasChanges,
    addItem: addLinkedBug,
    removeItem: addUnlinkedBug,
    clearChanges
  } = usePendingChanges({
    originalItem: assertion,
    getItemsField: item => item.assertionAtBugs || [],
    createUpdatedItem: (item, updatedBugs) => ({
      ...item,
      assertionAtBugs: updatedBugs
    })
  });

  // Map the generic pending changes to bug-specific structure
  const bugPendingChanges = useMemo(
    () => ({
      linkedBugs: pendingChanges.addedItems,
      unlinkedBugs: pendingChanges.removedItemIds
    }),
    [pendingChanges]
  );

  return {
    pendingChanges: bugPendingChanges,
    displayAssertion,
    hasChanges,
    addLinkedBug,
    addUnlinkedBug,
    clearChanges
  };
};
