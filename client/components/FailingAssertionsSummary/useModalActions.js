import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { LINK_AT_BUGS, UNLINK_AT_BUGS } from './queries';

/**
 * Hook for managing modal actions (save, cancel, confirmation)
 */
export const useModalActions = ({
  assertion,
  pendingChanges,
  displayAssertion,
  onLinked,
  onClose,
  clearChanges
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [linkAtBugs] = useMutation(LINK_AT_BUGS);
  const [unlinkAtBugs] = useMutation(UNLINK_AT_BUGS);

  const hasChanges =
    pendingChanges.linkedBugs.length > 0 ||
    pendingChanges.unlinkedBugs.length > 0;

  // Save changes
  const handleSave = useCallback(async () => {
    try {
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

      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  }, [
    linkAtBugs,
    unlinkAtBugs,
    assertion,
    pendingChanges,
    displayAssertion,
    onLinked,
    onClose
  ]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setShowCancelConfirm(true);
      return;
    }
    clearChanges();
    onClose();
  }, [hasChanges, clearChanges, onClose]);

  // Confirm cancel
  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false);
    clearChanges();
    onClose();
  }, [clearChanges, onClose]);

  // Cancel cancel confirmation
  const handleCancelCancel = useCallback(() => {
    setShowCancelConfirm(false);
  }, []);

  return {
    showCancelConfirm,
    hasChanges,
    handleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel
  };
};
