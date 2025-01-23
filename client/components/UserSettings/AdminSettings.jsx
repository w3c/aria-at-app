import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { LoadingStatus, useTriggerLoad } from '../common/LoadingStatus';
import { useThemedModal, THEMES } from '../../hooks/useThemedModal';
import { dates } from 'shared';

const AdminSettings = ({ latestTestPlanVersion, refetch }) => {
  const { triggerLoad, loadingMessage, loadingNote } = useTriggerLoad();
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

  const handleImportTests = async () => {
    await triggerLoad(
      async () => {
        try {
          const response = await fetch('/api/test/import', { method: 'POST' });
          if (!response.ok) {
            throw new Error(
              `Failed to import the latest Test Plan Versions: ${response.status}`
            );
          }

          // Success
          setThemedModalType(THEMES.SUCCESS);
          setThemedModalTitle('Success');
          setThemedModalContent(
            <>The latest Test Plan Versions have been imported.</>
          );
          setShowThemedModal(true);
          await refetch();
        } catch (e) {
          // Failed, show themed message
          setThemedModalType(THEMES.DANGER);
          setThemedModalTitle('Error');
          setThemedModalContent(<>{e.message}</>);
          setShowThemedModal(true);
        }
      },
      'Importing latest Test Plan Versions',
      'This may take a few minutes ...'
    );
  };

  return (
    <LoadingStatus message={loadingMessage} note={loadingNote}>
      <section>
        <h2>Admin Actions</h2>
        <Button variant="primary" onClick={handleImportTests}>
          Import Latest Test Plan Versions
        </Button>
        <p>
          Date of latest test plan version:{' '}
          {dates.convertDateToString(
            latestTestPlanVersion?.updatedAt,
            'MMMM D, YYYY HH:mm z'
          )}
        </p>
      </section>
      {showThemedModal && themedModal}
    </LoadingStatus>
  );
};

AdminSettings.propTypes = {
  latestTestPlanVersion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }),
  refetch: PropTypes.func
};

export default AdminSettings;
