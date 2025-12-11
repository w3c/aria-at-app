import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useModalState } from './useModalState';
import {
  LINK_AT_BUGS,
  UNLINK_AT_BUGS,
  LINK_AT_BUGS_TO_NEGATIVE_SIDE_EFFECT,
  UNLINK_AT_BUGS_FROM_NEGATIVE_SIDE_EFFECT
} from '../components/FailingAssertionsSummary/queries';

/**
 * @typedef {Object} BugPendingChanges
 * @property {Array} linkedBugs - Array of bugs to be linked
 * @property {Array} unlinkedBugs - Array of bug IDs to be unlinked
 */

/**
 * @typedef {Object} UseBugModalActionsOptions
 * @property {Object} assertion - The assertion object containing assertionId or negativeSideEffectId
 * @property {BugPendingChanges} pendingChanges - Object with linkedBugs and unlinkedBugs arrays
 * @property {Object} displayAssertion - The assertion object with pending changes applied
 * @property {Function} onLinked - Callback function called with updated assertion after successful save
 * @property {Function} onClose - Callback function called when modal should close
 */

/**
 * @typedef {Object} UseBugModalActionsReturn
 * @property {boolean} showCancelConfirm - True if cancel confirmation should be shown
 * @property {boolean} hasChanges - True if there are pending changes
 * @property {Function} handleSave - Function to save changes (can receive newlyCreatedBug parameter)
 * @property {Function} handleCancel - Function to handle cancel action
 * @property {Function} handleConfirmCancel - Function to confirm cancellation
 * @property {Function} handleCancelCancel - Function to cancel the cancellation confirmation
 */

/**
 * Hook for managing bug linking modal actions. Handles saving bug links/unlinks for
 * both regular assertions and negative side effects. Updates commandIds arrays appropriately
 * and notifies parent component of changes.
 *
 * @param {UseBugModalActionsOptions} options - Configuration options
 * @returns {UseBugModalActionsReturn}
 */
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
                atBugIds: [bug.id],
                commandId: assertion.commandId
              }
            });
          }

          if (pendingChanges.unlinkedBugs.length > 0) {
            await unlinkAtBugs({
              variables: {
                assertionId: assertion.assertionId,
                atBugIds: pendingChanges.unlinkedBugs,
                commandId: assertion.commandId
              }
            });
          }
        }

        // Notify parent of the update
        if (onLinked) {
          // Build updated bugs list with commandIds set correctly
          const existingBugs = displayAssertion?.assertionAtBugs || [];
          const unlinkedBugIds = new Set(pendingChanges.unlinkedBugs);
          const linkedBugIds = new Set(bugsToLink.map(bug => bug.id));

          // Process existing bugs: update commandIds arrays
          const updatedBugs = existingBugs
            .map(bug => {
              const wasUnlinked = unlinkedBugIds.has(bug.id);
              const wasRelinked = linkedBugIds.has(bug.id);

              if (wasUnlinked && !wasRelinked) {
                // Remove this commandId from the bug's commandIds array
                const updatedCommandIds = (bug.commandIds || []).filter(
                  cid => cid !== assertion.commandId
                );
                // If bug has no commandIds left, remove it entirely
                if (updatedCommandIds.length === 0) {
                  return null;
                }
                return {
                  ...bug,
                  commandIds: updatedCommandIds
                };
              }

              if (wasRelinked) {
                // Add this commandId to the bug's commandIds array if not already present
                const commandIds = bug.commandIds || [];
                if (!commandIds.includes(assertion.commandId)) {
                  return {
                    ...bug,
                    commandIds: [...commandIds, assertion.commandId]
                  };
                }
              }

              return bug;
            })
            .filter(bug => bug !== null);

          // Add newly linked bugs that weren't already in the list
          const existingBugIds = new Set(existingBugs.map(bug => bug.id));
          const newlyLinkedBugs = bugsToLink
            .filter(bug => !existingBugIds.has(bug.id))
            .map(bug => ({
              ...bug,
              commandIds: [assertion.commandId]
            }));

          const updatedAssertion = {
            ...displayAssertion,
            assertionAtBugs: [...updatedBugs, ...newlyLinkedBugs]
          };

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
