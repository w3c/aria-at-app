import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../../common/BasicModal';
import ConfirmationModal from '../../common/ConfirmationModal';
import BugLinkingErrorBoundary from './BugLinkingErrorBoundary';
import { BugLinkingProvider, useBugLinkingContext } from './BugLinkingContext';
import BugLinkingContent from './BugLinkingContent';

/**
 * Inner component that uses the context
 * Separated to avoid using context in the same component that provides it
 */
const LinkAtBugModalInner = ({ show, onClose }) => {
  const initialFocusRef = useRef();
  const {
    showCancelConfirm,
    modalHasChanges,
    handleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel
  } = useBugLinkingContext();

  return (
    <>
      <BasicModal
        show={show}
        centered
        size="lg"
        title="Link AT Bug to Failing Assertion"
        content={
          <BugLinkingErrorBoundary>
            <BugLinkingContent />
          </BugLinkingErrorBoundary>
        }
        handleClose={handleCancel}
        handleHide={handleCancel}
        useOnHide={true}
        initialFocusRef={initialFocusRef}
        actions={[
          {
            label: 'Save',
            onClick: handleSave,
            className: 'btn-primary',
            disabled: !modalHasChanges
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

LinkAtBugModalInner.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Main LinkAtBugModal component
 * Provides context and renders the modal
 */
const LinkAtBugModal = ({ show, onClose, atId, assertion, onLinked }) => {
  return (
    <BugLinkingProvider
      atId={atId}
      assertion={assertion}
      onLinked={onLinked}
      onClose={onClose}
    >
      <LinkAtBugModalInner show={show} onClose={onClose} />
    </BugLinkingProvider>
  );
};

LinkAtBugModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  assertion: PropTypes.object,
  onLinked: PropTypes.func
};

export default LinkAtBugModal;
