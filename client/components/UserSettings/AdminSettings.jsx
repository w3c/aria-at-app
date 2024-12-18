import React from 'react';
import { Button } from 'react-bootstrap';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useThemedModal, THEMES } from '@client/hooks/useThemedModal';

const AdminSettings = () => {
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
    title: 'Error Updating Test Plan Status'
  });

  const handleImportTests = async () => {
    await triggerLoad(async () => {
      try {
        const response = await fetch('/api/test/import', { method: 'POST' });
        if (!response.ok) {
          throw new Error(
            `Failed to import the latest Test Plan Versions: ${response.status}`
          );
        }

        // Success
        setThemedModalType(THEMES.SUCCESS);
        setThemedModalTitle('Success!');
        setThemedModalContent(
          <>The latest Test Plan Versions have been imported.</>
        );
        setShowThemedModal(true);
      } catch (e) {
        // Failed, show themed message
        setThemedModalType(THEMES.DANGER);
        setThemedModalTitle('Error!');
        setThemedModalContent(<>{e.message}</>);
        setShowThemedModal(true);
      }
    }, 'Importing Tests');
  };

  return (
    <LoadingStatus message={loadingMessage}>
      <section>
        <h2>Actions</h2>
        <p>Use the following actions below to perform a certain function:</p>
        <Button variant="primary" onClick={handleImportTests}>
          Import Latest Test Plan Versions
        </Button>
      </section>
      {showThemedModal && themedModal}
    </LoadingStatus>
  );
};

AdminSettings.propTypes = {};

export default AdminSettings;
