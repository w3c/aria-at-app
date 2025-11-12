import React, { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useBugSearch } from '../../../hooks/useBugSearch';
import { useBugPendingChanges } from '../../../hooks/useBugPendingChanges';
import { useBugModalActions } from '../../../hooks/useBugModalActions';

const BugLinkingContext = createContext();

/**
 * Shared context provider for bug linking functionality
 * Centralizes all bug linking state and logic
 * Works with both regular assertions and negative side effects
 */
export const BugLinkingProvider = ({
  children,
  atId,
  atName,
  assertion,
  onLinked,
  onClose
}) => {
  const [formRef, setFormRef] = useState(null);
  const [formMode, setFormMode] = useState('select');
  const [handleFormSubmit, setHandleFormSubmit] = useState(null);

  const pendingChanges = useBugPendingChanges({ assertion });

  const bugSearch = useBugSearch({
    atId,
    assertion: pendingChanges.displayAssertion
  });

  // Transform assertion for modal actions if it's a negative side effect
  const transformedAssertion = useMemo(() => {
    if (assertion?.isNegativeSideEffect) {
      return {
        ...assertion,
        negativeSideEffectId: assertion?.encodedId
      };
    }
    return assertion;
  }, [assertion]);

  const modalActions = useBugModalActions({
    assertion: transformedAssertion,
    pendingChanges: pendingChanges.pendingChanges,
    displayAssertion: pendingChanges.displayAssertion,
    onLinked,
    onClose
  });

  const contextValue = useMemo(
    () => ({
      // Configuration
      atId,
      atName,

      // Bug search state
      searchText: bugSearch.searchText,
      setSearchText: bugSearch.setSearchText,
      bugsLoading: bugSearch.bugsLoading,
      availableBugs: bugSearch.availableBugs,
      filteredBugs: bugSearch.filteredBugs,
      linkedBugs: bugSearch.linkedBugs,
      handleFetchBugs: bugSearch.handleFetchBugs,

      // Pending changes state
      pendingChanges: pendingChanges.pendingChanges,
      displayAssertion: pendingChanges.displayAssertion,
      hasChanges: pendingChanges.hasChanges,
      addLinkedBug: pendingChanges.addLinkedBug,
      addUnlinkedBug: pendingChanges.addUnlinkedBug,
      clearChanges: pendingChanges.clearChanges,

      // Modal actions
      showCancelConfirm: modalActions.showCancelConfirm,
      modalHasChanges: modalActions.hasChanges,
      handleSave: modalActions.handleSave,
      handleCancel: modalActions.handleCancel,
      handleConfirmCancel: modalActions.handleConfirmCancel,
      handleCancelCancel: modalActions.handleCancelCancel,

      // Form ref and mode
      formRef,
      setFormRef,
      formMode,
      setFormMode,
      handleFormSubmit,
      setHandleFormSubmit
    }),
    [
      atId,
      atName,
      bugSearch,
      pendingChanges,
      modalActions,
      formRef,
      formMode,
      handleFormSubmit
    ]
  );

  return (
    <BugLinkingContext.Provider value={contextValue}>
      {children}
    </BugLinkingContext.Provider>
  );
};

BugLinkingProvider.propTypes = {
  children: PropTypes.node.isRequired,
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  atName: PropTypes.string,
  assertion: PropTypes.object,
  onLinked: PropTypes.func,
  onClose: PropTypes.func.isRequired
};

/**
 * Hook to access bug linking context
 * @returns {Object} Bug linking context value
 */
export const useBugLinkingContext = () => {
  const context = useContext(BugLinkingContext);
  if (!context) {
    throw new Error(
      'useBugLinkingContext must be used within BugLinkingProvider'
    );
  }
  return context;
};
