import { useState, useCallback } from 'react';

/**
 * Generic hook for managing modal state with confirmation
 */
export const useModalState = ({
  onClose,
  onSave,
  hasChanges = () => false
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  }, [onSave, onClose]);

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
