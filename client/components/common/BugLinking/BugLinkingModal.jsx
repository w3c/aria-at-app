import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../BasicModal';
import ConfirmationModal from '../ConfirmationModal';
import BugLinkingErrorBoundary from '../../FailingAssertionsSummary/BugLinking/BugLinkingErrorBoundary';
import BugLinkingContent from './BugLinkingContent';

/**
 * Shared bug linking modal component
 * Works with any bug linking context that provides the required interface
 */
const BugLinkingModal = ({ show, useBugLinkingContext, title }) => {
  const {
    atName,
    showCancelConfirm,
    modalHasChanges,
    handleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel,
    formMode,
    handleFormSubmit
  } = useBugLinkingContext();

  const handleSaveClick = async () => {
    if (formMode === 'create' && handleFormSubmit) {
      const createdBug = await handleFormSubmit();
      if (createdBug) {
        await handleSave(createdBug);
      }
    } else {
      await handleSave();
    }
  };

  const isSaveDisabled = formMode === 'create' ? false : !modalHasChanges;

  return (
    <>
      <BasicModal
        show={show}
        centered
        size="lg"
        title={title || `Link ${atName || 'AT'} Bug`}
        content={
          <BugLinkingErrorBoundary>
            <BugLinkingContent useBugLinkingContext={useBugLinkingContext} />
          </BugLinkingErrorBoundary>
        }
        handleClose={handleCancel}
        handleHide={handleCancel}
        useOnHide={true}
        actions={[
          {
            label: 'Save',
            onClick: handleSaveClick,
            className: 'btn-primary',
            disabled: isSaveDisabled
          }
        ]}
      />

      <ConfirmationModal
        show={showCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelCancel}
        confirmButtonClass="btn-danger"
        cancelButtonClass="btn-secondary"
      />
    </>
  );
};

BugLinkingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  useBugLinkingContext: PropTypes.func.isRequired,
  title: PropTypes.string
};

export default BugLinkingModal;
