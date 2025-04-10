import React from 'react';
import { Button } from 'react-bootstrap';
import { useTriggerLoad } from '../LoadingStatus';
import { useThemedModal, THEMES } from '../../../hooks/useThemedModal';

const ResetDbButton = () => {
  const { triggerLoad, loadingMessage } = useTriggerLoad();
  const {
    themedModal,
    showThemedModal,
    setShowThemedModal,
    setThemedModalTitle,
    setThemedModalContent,
    setThemedModalType
  } = useThemedModal({
    type: THEMES.SUCCESS,
    title: 'Success'
  });

  const handleResetDb = async () => {
    await triggerLoad(
      async () => {
        try {
          const response = await fetch('/api/database/reset', {
            method: 'POST'
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to reset the database: ${response.status} ${errorText}`
            );
          }
          setThemedModalType(THEMES.SUCCESS);
          setThemedModalTitle('Success');
          setThemedModalContent(<>The database has been reset successfully.</>);
          setShowThemedModal(true);
        } catch (e) {
          setThemedModalType(THEMES.DANGER);
          setThemedModalTitle('Error');
          setThemedModalContent(
            <div className="text-danger">
              {e.message || 'An error occurred while resetting the database'}
            </div>
          );
          setShowThemedModal(true);
        }
      },
      'Resetting Database',
      'This may take a moment...'
    );
  };

  if (process.env.ENVIRONMENT !== 'sandbox') {
    return null;
  }

  return (
    <>
      <Button
        variant="danger"
        onClick={handleResetDb}
        disabled={!!loadingMessage}
      >
        {loadingMessage ? loadingMessage : 'Reset DB'}
      </Button>
      {showThemedModal && themedModal}
    </>
  );
};

export default ResetDbButton;
