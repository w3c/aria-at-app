import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useModalState } from './useModalState';
import {
  LINK_AT_BUGS_TO_NEGATIVE_SIDE_EFFECT,
  UNLINK_AT_BUGS_FROM_NEGATIVE_SIDE_EFFECT
} from '../components/FailingAssertionsSummary/queries';

/**
 * Hook for managing negative side effect bug modal actions (save, cancel, confirmation)
 * Uses the generic useModalState hook for modal state management
 */
export const useNegativeSideEffectBugModalActions = ({
  negativeSideEffect,
  pendingChanges,
  displayNegativeSideEffect,
  onLinked,
  onClose,
  clearChanges
}) => {
  const [linkAtBugsToNegativeSideEffect] = useMutation(
    LINK_AT_BUGS_TO_NEGATIVE_SIDE_EFFECT
  );
  const [unlinkAtBugsFromNegativeSideEffect] = useMutation(
    UNLINK_AT_BUGS_FROM_NEGATIVE_SIDE_EFFECT
  );

  const hasChanges =
    pendingChanges.linkedBugs.length > 0 ||
    pendingChanges.unlinkedBugs.length > 0;

  // Save changes
  const handleSave = useCallback(async () => {
    try {
      if (!negativeSideEffect?.encodedId) {
        throw new Error(
          'Negative side effect ID is missing from negative side effect object'
        );
      }

      // Link new bugs to negative side effect
      for (const bug of pendingChanges.linkedBugs) {
        await linkAtBugsToNegativeSideEffect({
          variables: {
            negativeSideEffectId: negativeSideEffect.encodedId,
            atBugIds: [bug.id]
          }
        });
      }

      // Unlink bugs from negative side effect
      if (pendingChanges.unlinkedBugs.length > 0) {
        await unlinkAtBugsFromNegativeSideEffect({
          variables: {
            negativeSideEffectId: negativeSideEffect.encodedId,
            atBugIds: pendingChanges.unlinkedBugs
          }
        });
      }

      // Create updated negative side effect with new bug links
      const updatedNegativeSideEffect = {
        ...displayNegativeSideEffect,
        assertionAtBugs: [
          ...displayNegativeSideEffect.assertionAtBugs.filter(
            bug => !pendingChanges.unlinkedBugs.includes(bug.id)
          ),
          ...pendingChanges.linkedBugs
        ]
      };

      onLinked?.(updatedNegativeSideEffect);
      clearChanges();
    } catch (error) {
      console.error('Error saving changes:', error);
      throw error;
    }
  }, [
    negativeSideEffect,
    pendingChanges,
    displayNegativeSideEffect,
    linkAtBugsToNegativeSideEffect,
    unlinkAtBugsFromNegativeSideEffect,
    onLinked,
    clearChanges
  ]);

  // Use the generic modal state hook
  const modalState = useModalState({
    hasChanges,
    onSave: handleSave,
    onClose
  });

  return {
    ...modalState,
    hasChanges
  };
};
