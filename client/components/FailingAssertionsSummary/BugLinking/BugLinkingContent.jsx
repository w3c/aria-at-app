import React, { useState, useRef, useEffect } from 'react';
import { useBugLinkingContext } from './BugLinkingContext';
import { useBugCreation } from '../../../hooks/useBugCreation';
import AssertionDetails from './AssertionDetails';
import LinkedBugsList from './LinkedBugsList';
import BugSearchCombobox from './BugSearchCombobox';
import CreateBugForm from './CreateBugForm';

/**
 * Main content component for bug linking modal
 * Handles mode switching between search and creation
 */
const BugLinkingContent = () => {
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const initialFocusRef = useRef();

  const {
    atId,
    displayAssertion,
    linkedBugs,
    availableBugs,
    filteredBugs,
    bugsLoading,
    handleFetchBugs,
    addLinkedBug,
    addUnlinkedBug
  } = useBugLinkingContext();

  const { creating, createError, handleCreateBug, checkDuplicateUrl } =
    useBugCreation({ atId, availableBugs });

  useEffect(() => {
    if (mode === 'select') {
      handleFetchBugs();
    }
  }, [mode, handleFetchBugs]);

  useEffect(() => {
    // Focus the form when switching to creation mode
    if (mode === 'create' && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [mode]);

  const handleSelectBug = async bugId => {
    const bug = availableBugs.find(b => b.id === bugId);
    if (bug) {
      addLinkedBug(bug);
    }
  };

  const handleUnlinkBug = async bugId => {
    addUnlinkedBug(bugId);
  };

  const handleCreate = async formData => {
    const created = await handleCreateBug(formData);
    if (created) {
      setMode('select');
      handleFetchBugs();
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
    }
    return created;
  };

  return (
    <div>
      {/* Assertion Details */}
      <div className="mb-3">
        <AssertionDetails assertion={displayAssertion} />
      </div>

      {mode === 'select' ? (
        <>
          {/* Linked Bugs */}
          {linkedBugs && linkedBugs.length > 0 && (
            <div className="mb-3">
              <h5>Linked Bugs</h5>
              <LinkedBugsList
                linkedBugs={linkedBugs}
                onUnlink={handleUnlinkBug}
                unlinking={false}
              />
            </div>
          )}

          {/* Add New Bug Button */}
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setMode('create')}
            >
              + Add a New AT Bug
            </button>
          </div>

          {/* Bug Search */}
          <BugSearchCombobox
            searchText={useBugLinkingContext().searchText}
            onSearchChange={useBugLinkingContext().setSearchText}
            filteredBugs={filteredBugs}
            onSelectBug={handleSelectBug}
            onFetchBugs={handleFetchBugs}
            loading={bugsLoading}
            initialFocusRef={initialFocusRef}
          />
        </>
      ) : (
        <>
          {/* Back Button */}
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => setMode('select')}
            >
              ← Back to search
            </button>
          </div>

          {/* Create Bug Form */}
          <CreateBugForm
            onCreateBug={handleCreate}
            onCancel={() => setMode('select')}
            creating={creating}
            error={createError}
            checkDuplicateUrl={checkDuplicateUrl}
          />
        </>
      )}
    </div>
  );
};

export default BugLinkingContent;
