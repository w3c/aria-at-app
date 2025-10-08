import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import { useBugSearch } from './useBugSearch';
import { usePendingChanges } from './usePendingChanges';
import { useModalActions } from './useModalActions';
import LinkAtBugModalContent from './LinkAtBugModalContent';
import CancelConfirmationModal from './CancelConfirmationModal';

const LinkAtBugModal = ({ show, onClose, atId, assertion, onLinked }) => {
  const initialFocusRef = useRef();

  // Manage pending changes and display assertion
  const {
    pendingChanges,
    displayAssertion,
    addLinkedBug,
    addUnlinkedBug,
    clearChanges
  } = usePendingChanges({ assertion });

  // Search and filter bugs
  const { linkedBugs, handleFetchBugs, availableBugs } = useBugSearch({
    atId,
    assertion: displayAssertion
  });

  // Handle linking bugs (add to pending changes)
  const handleLinkBug = useCallback(
    async bugId => {
      try {
        // Find the bug in available bugs
        const bug = availableBugs.find(b => b.id === bugId);
        if (bug) {
          addLinkedBug(bug);
        }
        return true;
      } catch (e) {
        return false;
      }
    },
    [addLinkedBug, availableBugs]
  );

  // Handle unlinking bugs (add to pending changes)
  const handleUnlinkBug = useCallback(
    async bugId => {
      addUnlinkedBug(bugId);
    },
    [addUnlinkedBug]
  );

  // Modal actions (save, cancel, confirmation)
  const {
    showCancelConfirm,
    hasChanges: modalHasChanges,
    handleSave,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel
  } = useModalActions({
    assertion,
    pendingChanges,
    displayAssertion,
    onLinked,
    onClose,
    clearChanges
  });

  const modalContent = (
    <LinkAtBugModalContent
      atId={atId}
      displayAssertion={displayAssertion}
      linkedBugs={linkedBugs}
      onLinkBug={handleLinkBug}
      onUnlinkBug={handleUnlinkBug}
      onFetchBugs={handleFetchBugs}
    />
  );

  return (
    <>
      <BasicModal
        show={show}
        centered
        size="lg"
        title="Link AT Bug to Failing Assertion"
        content={modalContent}
        handleClose={handleCancel}
        handleHide={handleCancel}
        useOnHide={true}
        initialFocusRef={initialFocusRef}
        actions={[
          {
            label: 'Cancel',
            onClick: handleCancel,
            className: 'btn-secondary'
          },
          {
            label: 'Save',
            onClick: handleSave,
            className: 'btn-primary',
            disabled: !modalHasChanges
          }
        ]}
      />

      <CancelConfirmationModal
        show={showCancelConfirm}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelCancel}
      />
    </>
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
