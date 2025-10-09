import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useBugCreation } from '../../../hooks/useBugCreation';
import AssertionDetails from '../../FailingAssertionsSummary/BugLinking/AssertionDetails';
import LinkedBugsList from '../../FailingAssertionsSummary/BugLinking/LinkedBugsList';
import BugSearchCombobox from '../../FailingAssertionsSummary/BugLinking/BugSearchCombobox';
import CreateBugForm from '../../FailingAssertionsSummary/BugLinking/CreateBugForm';

const BugLinkingContent = ({ useBugLinkingContext }) => {
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const initialFocusRef = useRef();

  const {
    atId,
    atName,
    searchText,
    setSearchText,
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
      <div className="mb-3">
        <AssertionDetails assertion={displayAssertion} />
      </div>

      {mode === 'select' ? (
        <>
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

          <BugSearchCombobox
            searchText={searchText}
            onSearchChange={setSearchText}
            filteredBugs={filteredBugs}
            onSelectBug={handleSelectBug}
            onFetchBugs={handleFetchBugs}
            loading={bugsLoading}
            initialFocusRef={initialFocusRef}
            atName={atName}
          />

          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setMode('create')}
            >
              + Add a New {atName} Bug
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => setMode('select')}
            >
              ← Back to search
            </button>
          </div>

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

BugLinkingContent.propTypes = {
  useBugLinkingContext: PropTypes.func.isRequired
};

export default BugLinkingContent;
