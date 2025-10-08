import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import ConfirmationModal from '../common/ConfirmationModal';
import BugLinkingErrorBoundary from '../FailingAssertionsSummary/BugLinking/BugLinkingErrorBoundary';
import {
  NegativeSideEffectBugLinkingProvider,
  useNegativeSideEffectBugLinkingContext
} from './NegativeSideEffectBugLinkingContext';
import NegativeSideEffectBugLinkingContent from './NegativeSideEffectBugLinkingContent';

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
  } = useNegativeSideEffectBugLinkingContext();

  return (
    <>
      <BasicModal
        show={show}
        centered
        size="lg"
        title="Link AT Bug to Negative Side Effect"
        content={
          <BugLinkingErrorBoundary>
            <NegativeSideEffectBugLinkingContent />
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
 * Main LinkAtBugModal component for negative side effects
 * Provides context and renders the modal
 */
const NegativeSideEffectLinkAtBugModal = ({
  show,
  onClose,
  atId,
  negativeSideEffect,
  onLinked
}) => {
  return (
    <NegativeSideEffectBugLinkingProvider
      atId={atId}
      negativeSideEffect={negativeSideEffect}
      onLinked={onLinked}
      onClose={onClose}
    >
      <LinkAtBugModalInner show={show} onClose={onClose} />
    </NegativeSideEffectBugLinkingProvider>
  );
};

NegativeSideEffectLinkAtBugModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  negativeSideEffect: PropTypes.object,
  onLinked: PropTypes.func
};

export default NegativeSideEffectLinkAtBugModal;
