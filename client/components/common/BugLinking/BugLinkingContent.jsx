import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useBugCreation } from '../../../hooks/useBugCreation';
import AssertionDetails from '../../FailingAssertionsSummary/BugLinking/AssertionDetails';
import LinkedBugsList from '../../FailingAssertionsSummary/BugLinking/LinkedBugsList';
import BugSearchCombobox from '../../FailingAssertionsSummary/BugLinking/BugSearchCombobox';
import CreateBugForm from '../../FailingAssertionsSummary/BugLinking/CreateBugForm';

const BugLinkingContent = ({ useBugLinkingContext }) => {
  const [mode, setMode] = useState('select');
  const initialFocusRef = useRef();
  const createFormRef = useRef();
  const handleFormSubmitRef = useRef();

  const {
    atId,
    atName,
    searchText,
    setSearchText,
    displayAssertion,
    availableBugs,
    filteredBugs,
    bugsLoading,
    handleFetchBugs,
    addLinkedBug,
    addUnlinkedBug,
    setFormRef,
    setFormMode,
    setHandleFormSubmit
  } = useBugLinkingContext();

  const { creating, createError, handleCreateBug, checkDuplicateUrl } =
    useBugCreation({ atId, availableBugs });

  useEffect(() => {
    handleFetchBugs();
  }, [handleFetchBugs]);

  useEffect(() => {
    if (mode === 'create' && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [mode]);

  const handleSelectBug = bugId => {
    const bug = availableBugs.find(b => b.id === bugId);
    if (bug) {
      addLinkedBug(bug);
    }
  };

  const handleUnlinkBug = bugId => {
    addUnlinkedBug(bugId);
  };

  const handleCreate = async formData => {
    const created = await handleCreateBug(formData);
    if (created) {
      addLinkedBug(created);
      setMode('select');
    }
    return created;
  };

  const handleFormSubmit = useCallback(async () => {
    if (mode === 'create' && createFormRef.current) {
      const form = createFormRef.current;
      if (form.checkValidity()) {
        const formData = {
          title: form.elements['title'].value,
          bugId: form.elements['bugId'].value,
          url: form.elements['url'].value
        };
        return await handleCreate(formData);
      }
      return false;
    }
    return true;
  }, [mode, handleCreate]);

  handleFormSubmitRef.current = handleFormSubmit;

  const stableHandleFormSubmit = useCallback(async () => {
    return handleFormSubmitRef.current?.();
  }, []);

  useEffect(() => {
    setFormRef(createFormRef);
    setFormMode(mode);
    setHandleFormSubmit(() => stableHandleFormSubmit);
  }, [
    mode,
    setFormRef,
    setFormMode,
    setHandleFormSubmit,
    stableHandleFormSubmit
  ]);

  const linkedBugs = displayAssertion?.assertionAtBugs || [];

  return (
    <div>
      <div className="mb-3">
        <AssertionDetails assertion={displayAssertion} />
      </div>

      {mode === 'select' ? (
        <>
          {linkedBugs.length > 0 && (
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
          <CreateBugForm
            ref={createFormRef}
            onCreateBug={handleCreate}
            onCancel={() => setMode('select')}
            creating={creating}
            error={createError}
            checkDuplicateUrl={checkDuplicateUrl}
            showButtons={false}
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
