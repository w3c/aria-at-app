import React, { useState, useRef, useEffect } from 'react';
import { useNegativeSideEffectBugLinkingContext } from './NegativeSideEffectBugLinkingContext';
import { useBugCreation } from '../../hooks/useBugCreation';
import AssertionDetails from '../FailingAssertionsSummary/BugLinking/AssertionDetails';
import LinkedBugsList from '../FailingAssertionsSummary/BugLinking/LinkedBugsList';
import BugSearchCombobox from '../FailingAssertionsSummary/BugLinking/BugSearchCombobox';
import CreateBugForm from '../FailingAssertionsSummary/BugLinking/CreateBugForm';

/**
 * Content component for negative side effect bug linking modal
 * Uses the existing bug linking context but handles negative side effect specific logic
 */
const NegativeSideEffectBugLinkingContent = () => {
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const initialFocusRef = useRef();

  const {
    atId,
    bugsLoading,
    availableBugs,
    filteredBugs,
    handleFetchBugs,
    displayAssertion: displayNegativeSideEffect,
    linkedBugs,
    addLinkedBug,
    addUnlinkedBug
  } = useNegativeSideEffectBugLinkingContext();

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
      {/* Negative Side Effect Details */}
      <div className="mb-3">
        <AssertionDetails assertion={displayNegativeSideEffect} />
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
            searchText={useNegativeSideEffectBugLinkingContext().searchText}
            onSearchChange={
              useNegativeSideEffectBugLinkingContext().setSearchText
            }
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

export default NegativeSideEffectBugLinkingContent;
