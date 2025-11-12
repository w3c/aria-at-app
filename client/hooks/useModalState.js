import { useState, useCallback } from 'react';

/**
 * @typedef {Object} UseModalStateOptions
 * @property {Function} onClose - Function to call when modal should close
 * @property {Function} onSave - Async function to call when saving. Receives any arguments passed to handleSave
 * @property {Function} [hasChanges=() => false] - Function that returns true if there are unsaved changes
 */

/**
 * @typedef {Object} UseModalStateReturn
 * @property {boolean} showCancelConfirm - True if cancel confirmation dialog should be shown
 * @property {Function} handleSave - Function to handle save action (can receive arguments)
 * @property {Function} handleCancel - Function to handle cancel action
 * @property {Function} handleConfirmCancel - Function to confirm cancellation and close modal
 * @property {Function} handleCancelCancel - Function to cancel the cancellation confirmation
 */

/**
 * Generic hook for managing modal state with confirmation. Handles save and cancel
 * actions, showing a confirmation dialog if there are unsaved changes when canceling.
 *
 * @param {UseModalStateOptions} options - Configuration options
 * @returns {UseModalStateReturn}
 */
export const useModalState = ({
  onClose,
  onSave,
  hasChanges = () => false
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSave = useCallback(
    async (...args) => {
      try {
        await onSave(...args);
        onClose();
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    },
    [onSave, onClose]
  );

  const handleCancel = useCallback(() => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
      return;
    }
    onClose();
  }, [hasChanges, onClose]);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false);
    onClose();
  }, [onClose]);

  const handleCancelCancel = useCallback(() => {
    setShowCancelConfirm(false);
  }, []);

  return {
    showCancelConfirm,
    handleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel
  };
};
