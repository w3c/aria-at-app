import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook for managing pending changes in the LinkAtBugModal
 * Handles linking/unlinking bugs with preview functionality
 */
export const usePendingChanges = ({ assertion }) => {
  const [pendingChanges, setPendingChanges] = useState({
    linkedBugs: [],
    unlinkedBugs: []
  });

  // Reset pending changes when assertion changes
  useEffect(() => {
    setPendingChanges({ linkedBugs: [], unlinkedBugs: [] });
  }, [assertion]);

  // Create a derived assertion with pending changes applied
  const displayAssertion = useMemo(() => {
    if (!assertion) return null;

    const originalBugs = assertion.assertionAtBugs || [];
    const unlinkedBugIds = new Set(pendingChanges.unlinkedBugs);

    // Apply pending changes to show preview
    const updatedBugs = originalBugs
      .filter(bug => !unlinkedBugIds.has(bug.id))
      .concat(pendingChanges.linkedBugs);

    return {
      ...assertion,
      assertionAtBugs: updatedBugs
    };
  }, [assertion, pendingChanges]);

  const hasChanges =
    pendingChanges.linkedBugs.length > 0 ||
    pendingChanges.unlinkedBugs.length > 0;

  const addLinkedBug = useCallback(bug => {
    setPendingChanges(prev => ({
      ...prev,
      linkedBugs: [...prev.linkedBugs, bug]
    }));
  }, []);

  const addUnlinkedBug = useCallback(bugId => {
    setPendingChanges(prev => ({
      ...prev,
      unlinkedBugs: [...prev.unlinkedBugs, bugId]
    }));
  }, []);

  const clearChanges = useCallback(() => {
    setPendingChanges({ linkedBugs: [], unlinkedBugs: [] });
  }, []);

  return {
    pendingChanges,
    displayAssertion,
    hasChanges,
    addLinkedBug,
    addUnlinkedBug,
    clearChanges
  };
};
