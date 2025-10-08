import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useBugSearch } from './useBugSearch';
import { useBugCreation } from './useBugCreation';
import AssertionDetails from './AssertionDetails';
import LinkedBugsList from './LinkedBugsList';
import BugSearchCombobox from './BugSearchCombobox';
import CreateBugForm from './CreateBugForm';

/**
 * Main content component for LinkAtBugModal
 * Handles the select/create modes and bug operations
 */
const LinkAtBugModalContent = ({
  atId,
  displayAssertion,
  linkedBugs,
  onLinkBug,
  onUnlinkBug,
  onFetchBugs
}) => {
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const initialFocusRef = useRef();

  // Search and filter bugs
  const {
    searchText,
    setSearchText,
    bugsLoading,
    availableBugs,
    filteredBugs
  } = useBugSearch({ atId, assertion: displayAssertion });

  const { creating, createError, handleCreateBug, checkDuplicateUrl } =
    useBugCreation({ atId, availableBugs });

  useEffect(() => {
    if (mode === 'select') {
      onFetchBugs();
    }
  }, [mode, onFetchBugs]);

  const handleSelectBug = async bugId => {
    await onLinkBug(bugId);
  };

  const handleUnlink = async bugId => {
    await onUnlinkBug(bugId);
  };

  const handleCreate = async formData => {
    const created = await handleCreateBug(formData);
    if (created) {
      // Switch back to select mode and refetch bugs to include the new one
      setMode('select');
      // Trigger a refetch to get the new bug in the list
      onFetchBugs();
      // Focus the combobox input after switching back
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
    }
    return created;
  };

  return (
    <div>
      <AssertionDetails assertion={displayAssertion} />

      {mode === 'select' ? (
        <>
          <LinkedBugsList
            linkedBugs={linkedBugs}
            onUnlink={handleUnlink}
            unlinking={false}
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
            onFetchBugs={onFetchBugs}
            loading={bugsLoading}
            initialFocusRef={initialFocusRef}
          />
        </>
      ) : (
        <CreateBugForm
          onCreateBug={handleCreate}
          onCancel={() => setMode('select')}
          creating={creating}
          error={createError}
          checkDuplicateUrl={checkDuplicateUrl}
        />
      )}
    </div>
  );
};

LinkAtBugModalContent.propTypes = {
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  displayAssertion: PropTypes.object,
  linkedBugs: PropTypes.array,
  onLinkBug: PropTypes.func.isRequired,
  onUnlinkBug: PropTypes.func.isRequired,
  onFetchBugs: PropTypes.func.isRequired
};

export default LinkAtBugModalContent;
