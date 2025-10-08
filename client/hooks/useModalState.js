import { useState, useCallback } from 'react';

/**
 * Generic hook for managing modal state with confirmation
 * @param {Object} options - Configuration options
 * @param {Function} options.onClose - Function to call when modal should close
 * @param {Function} options.onSave - Function to call when changes should be saved
 * @param {Function} options.hasChanges - Function to determine if there are unsaved changes
 * @returns {Object} Modal state and handlers
 */
export const useModalState = ({
  onClose,
  onSave,
  hasChanges = () => false
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Save changes
  const handleSave = useCallback(async () => {
    try {
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  }, [onSave, onClose]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
      return;
    }
    onClose();
  }, [hasChanges, onClose]);

  // Confirm cancel
  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false);
    onClose();
  }, [onClose]);

  // Cancel cancel confirmation
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
