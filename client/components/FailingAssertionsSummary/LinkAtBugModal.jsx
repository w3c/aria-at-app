import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import { useBugSearch } from './useBugSearch';
import { useBugLinking } from './useBugLinking';
import { useBugCreation } from './useBugCreation';
import AssertionDetails from './AssertionDetails';
import LinkedBugsList from './LinkedBugsList';
import BugSearchCombobox from './BugSearchCombobox';
import CreateBugForm from './CreateBugForm';

const LinkAtBugModal = ({ show, onClose, atId, assertion, onLinked }) => {
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const [localAtBugs, setLocalAtBugs] = useState([]);
  const initialFocusRef = useRef();

  // Sync local bugs when assertion changes
  React.useEffect(() => {
    setLocalAtBugs(assertion?.assertionAtBugs || []);
  }, [assertion]);

  // Create a derived assertion with local bug updates
  const displayAssertion = React.useMemo(
    () =>
      assertion
        ? {
            ...assertion,
            assertionAtBugs: localAtBugs
          }
        : null,
    [assertion, localAtBugs]
  );

  // Search and filter bugs
  const {
    searchText,
    setSearchText,
    bugsLoading,
    availableBugs,
    filteredBugs,
    linkedBugs,
    handleFetchBugs
  } = useBugSearch({ atId, assertion: displayAssertion });

  // Link and unlink bugs
  const handleBugUpdate = atBugs => {
    // Update local state immediately for instant UI feedback
    setLocalAtBugs(atBugs);
    // Notify parent to update its state
    if (onLinked) {
      onLinked({
        ...assertion,
        assertionAtBugs: atBugs
      });
    }
  };

  const {
    linkLoading,
    unlinkLoading,
    linkError,
    unlinkError,
    handleLinkBug,
    handleUnlinkBug
  } = useBugLinking({
    assertion,
    onUpdate: handleBugUpdate
  });

  const {
    creating,
    createError,
    handleCreateBug,
    checkDuplicateUrl,
    checkDuplicateBugId
  } = useBugCreation({ atId, availableBugs });

  useEffect(() => {
    if (show && mode === 'select') {
      handleFetchBugs();
    }
  }, [show, mode, handleFetchBugs]);

  const handleSelectBug = async bugId => {
    const success = await handleLinkBug(bugId);
    if (success) {
      setSearchText('');
    }
  };

  const handleUnlink = async bugId => {
    await handleUnlinkBug(bugId);
  };

  const handleCreate = async formData => {
    const created = await handleCreateBug(formData);
    if (created) {
      // Switch back to select mode and refetch bugs to include the new one
      setMode('select');
      // Trigger a refetch to get the new bug in the list
      handleFetchBugs();
      // Focus the combobox input after switching back
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
    }
    return created;
  };

  const modalContent = (
    <div>
      <AssertionDetails assertion={displayAssertion} />

      {mode === 'select' ? (
        <>
          <LinkedBugsList
            linkedBugs={linkedBugs}
            onUnlink={handleUnlink}
            unlinking={unlinkLoading}
          />

          <div className="mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setMode('create')}
            >
              + Add a New AT Bug
            </button>
          </div>

          <BugSearchCombobox
            searchText={searchText}
            onSearchChange={setSearchText}
            filteredBugs={filteredBugs}
            onSelectBug={handleSelectBug}
            onFetchBugs={handleFetchBugs}
            loading={bugsLoading}
            initialFocusRef={initialFocusRef}
          />

          {(linkError || unlinkError) && (
            <div
              className="alert alert-danger"
              role="alert"
              aria-live="assertive"
            >
              {(linkError || unlinkError).message}
            </div>
          )}
        </>
      ) : (
        <CreateBugForm
          onCreateBug={handleCreate}
          onCancel={() => setMode('select')}
          creating={creating}
          error={createError}
          checkDuplicateUrl={checkDuplicateUrl}
          checkDuplicateBugId={checkDuplicateBugId}
        />
      )}
    </div>
  );

  return (
    <BasicModal
      show={show}
      centered
      size="lg"
      title="Link AT Bug to Failing Assertion"
      content={modalContent}
      handleClose={onClose}
      useOnHide={true}
      initialFocusRef={mode === 'select' ? initialFocusRef : undefined}
      actions={[
        {
          label: 'Close',
          onClick: onClose,
          className: 'btn-secondary',
          disabled: linkLoading || unlinkLoading
        }
      ]}
    />
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
