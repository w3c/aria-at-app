import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useModalState } from './useModalState';
import {
  LINK_AT_BUGS,
  UNLINK_AT_BUGS,
  LINK_AT_BUGS_TO_NEGATIVE_SIDE_EFFECT,
  UNLINK_AT_BUGS_FROM_NEGATIVE_SIDE_EFFECT
} from '../components/FailingAssertionsSummary/queries';

export const useBugModalActions = ({
  assertion,
  pendingChanges,
  displayAssertion,
  onLinked,
  onClose
}) => {
  const [linkAtBugs] = useMutation(LINK_AT_BUGS);
  const [unlinkAtBugs] = useMutation(UNLINK_AT_BUGS);
  const [linkAtBugsToNegativeSideEffect] = useMutation(
    LINK_AT_BUGS_TO_NEGATIVE_SIDE_EFFECT
  );
  const [unlinkAtBugsFromNegativeSideEffect] = useMutation(
    UNLINK_AT_BUGS_FROM_NEGATIVE_SIDE_EFFECT
  );

  const hasChanges =
    pendingChanges.linkedBugs.length > 0 ||
    pendingChanges.unlinkedBugs.length > 0;

  const handleSave = useCallback(
    async (newlyCreatedBug = null) => {
      try {
        // Filter out added bugs that were also removed before saving
        let bugsToLink = pendingChanges.linkedBugs.filter(
          bug => !pendingChanges.unlinkedBugs.includes(bug.id)
        );

        // Add newly created bug if provided
        if (newlyCreatedBug) {
          bugsToLink = [...bugsToLink, newlyCreatedBug];
        }

        if (assertion?.isNegativeSideEffect) {
          if (!assertion?.negativeSideEffectId) {
            throw new Error(
              'Negative side effect ID is missing from assertion object'
            );
          }

          for (const bug of bugsToLink) {
            await linkAtBugsToNegativeSideEffect({
              variables: {
                negativeSideEffectId: assertion.negativeSideEffectId,
                atBugIds: [bug.id]
              }
            });
          }

          if (pendingChanges.unlinkedBugs.length > 0) {
            await unlinkAtBugsFromNegativeSideEffect({
              variables: {
                negativeSideEffectId: assertion.negativeSideEffectId,
                atBugIds: pendingChanges.unlinkedBugs
              }
            });
          }
        } else {
          if (!assertion?.assertionId) {
            throw new Error('Assertion ID is missing from assertion object');
          }

          for (const bug of bugsToLink) {
            await linkAtBugs({
              variables: {
                assertionId: assertion.assertionId,
                atBugIds: [bug.id]
              }
            });
          }

          if (pendingChanges.unlinkedBugs.length > 0) {
            await unlinkAtBugs({
              variables: {
                assertionId: assertion.assertionId,
                atBugIds: pendingChanges.unlinkedBugs
              }
            });
          }
        }

        // Notify parent of the update
        if (onLinked) {
          const updatedAssertion = newlyCreatedBug
            ? {
                ...displayAssertion,
                assertionAtBugs: [
                  ...(displayAssertion?.assertionAtBugs || []),
                  newlyCreatedBug
                ]
              }
            : displayAssertion;
          onLinked(updatedAssertion);
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        throw error;
      }
    },
    [
      linkAtBugs,
      unlinkAtBugs,
      linkAtBugsToNegativeSideEffect,
      unlinkAtBugsFromNegativeSideEffect,
      assertion,
      pendingChanges,
      displayAssertion,
      onLinked
    ]
  );

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
