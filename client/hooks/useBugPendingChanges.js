import { useMemo } from 'react';
import { usePendingChanges } from './usePendingChanges';

/**
 * Hook for managing pending bug changes in the LinkAtBugModal
 * Uses the generic usePendingChanges hook for change management
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
