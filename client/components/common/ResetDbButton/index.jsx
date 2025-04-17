import React from 'react';
import { Button } from 'react-bootstrap';
import { useTriggerLoad } from '../LoadingStatus';
import { useThemedModal, THEMES } from '../../../hooks/useThemedModal';
import LoadingStatus from '../LoadingStatus/LoadingStatus';

const ResetDbButton = () => {
  const { triggerLoad, loadingMessage, loadingNote } = useTriggerLoad();
  const {
    themedModal,
    showThemedModal,
    setShowThemedModal,
    setThemedModalTitle,
    setThemedModalContent,
    setThemedModalType,
    setThemedModalActions,
    hideThemedModal
  } = useThemedModal({
    type: THEMES.SUCCESS,
    title: 'Success'
  });

  const handleConfirmReload = () => {
    window.location.reload();
  };

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
          setThemedModalContent(
            <>
              The database has been reset successfully. Click OK to reload the
              page.
            </>
          );
          setThemedModalActions([
            {
              text: 'OK',
              action: handleConfirmReload
            }
          ]);
          setShowThemedModal(true);
        } catch (e) {
          setThemedModalType(THEMES.DANGER);
          setThemedModalTitle('Error');
          setThemedModalContent(
            <div className="text-danger">
              {e.message || 'An error occurred while resetting the database'}
            </div>
          );
          setThemedModalActions([
            {
              text: 'OK',
              action: hideThemedModal
            }
          ]);
          setShowThemedModal(true);
        }
      },
      'Resetting Database',
      'This may take a moment...'
    );
  };

  return (
    <>
      <LoadingStatus message={loadingMessage} note={loadingNote} />
      <Button variant="danger" onClick={handleResetDb}>
        Reset DB
      </Button>
      {showThemedModal && themedModal}
    </>
  );
};

export default ResetDbButton;
