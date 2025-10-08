import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useModalState } from './useModalState';
import {
  LINK_AT_BUGS,
  UNLINK_AT_BUGS
} from '../components/FailingAssertionsSummary/queries';

/**
 * Hook for managing bug modal actions (save, cancel, confirmation)
 * Uses the generic useModalState hook for modal state management
 */
export const useBugModalActions = ({
  assertion,
  pendingChanges,
  displayAssertion,
  onLinked,
  onClose,
  clearChanges
}) => {
  const [linkAtBugs] = useMutation(LINK_AT_BUGS);
  const [unlinkAtBugs] = useMutation(UNLINK_AT_BUGS);

  const hasChanges =
    pendingChanges.linkedBugs.length > 0 ||
    pendingChanges.unlinkedBugs.length > 0;

  // Save changes
  const handleSave = useCallback(async () => {
    try {
      if (!assertion?.assertionId) {
        throw new Error('Assertion ID is missing from assertion object');
      }

      // Link new bugs
      for (const bug of pendingChanges.linkedBugs) {
        await linkAtBugs({
          variables: { assertionId: assertion.assertionId, atBugIds: [bug.id] }
        });
      }

      // Unlink removed bugs
      if (pendingChanges.unlinkedBugs.length > 0) {
        await unlinkAtBugs({
          variables: {
            assertionId: assertion.assertionId,
            atBugIds: pendingChanges.unlinkedBugs
          }
        });
      }

      // Notify parent of the update
      if (onLinked) {
        onLinked(displayAssertion);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      throw error;
    }
  }, [
    linkAtBugs,
    unlinkAtBugs,
    assertion,
    pendingChanges,
    displayAssertion,
    onLinked
  ]);

  const {
    showCancelConfirm,
    handleSave: modalHandleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel
  } = useModalState({
    onClose,
    onSave: handleSave,
    hasChanges: () => hasChanges
  });

  return {
    showCancelConfirm,
    hasChanges,
    handleSave: modalHandleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel
  };
};
