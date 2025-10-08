import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useBugSearch } from '../../hooks/useBugSearch';
import { useBugPendingChanges } from '../../hooks/useBugPendingChanges';
import { useNegativeSideEffectBugModalActions } from '../../hooks/useNegativeSideEffectBugModalActions';

const NegativeSideEffectBugLinkingContext = createContext();

/**
 * Context provider for negative side effect bug linking functionality
 * Centralizes all negative side effect bug linking state and logic
 */
export const NegativeSideEffectBugLinkingProvider = ({
  children,
  atId,
  negativeSideEffect,
  onLinked,
  onClose
}) => {
  // Manage pending changes and display negative side effect
  const pendingChanges = useBugPendingChanges({
    assertion: negativeSideEffect
  });

  // Search and filter bugs
  const bugSearch = useBugSearch({
    atId,
    assertion: pendingChanges.displayAssertion
  });

  // Modal actions (save, cancel, confirmation)
  const modalActions = useNegativeSideEffectBugModalActions({
    negativeSideEffect,
    pendingChanges: pendingChanges.pendingChanges,
    displayNegativeSideEffect: pendingChanges.displayAssertion,
    onLinked,
    onClose,
    clearChanges: pendingChanges.clearChanges
  });

  // Combine all context values
  const contextValue = useMemo(
    () => ({
      // Configuration
      atId,

      // Bug search state
      searchText: bugSearch.searchText,
      setSearchText: bugSearch.setSearchText,
      bugsLoading: bugSearch.bugsLoading,
      availableBugs: bugSearch.availableBugs,
      filteredBugs: bugSearch.filteredBugs,
      searchError: bugSearch.searchError,
      handleFetchBugs: bugSearch.handleFetchBugs,
      linkedBugs: bugSearch.linkedBugs,

      // Bug linking state
      displayAssertion: pendingChanges.displayAssertion,
      pendingChanges: pendingChanges.pendingChanges,
      hasChanges: pendingChanges.hasChanges,
      addLinkedBug: pendingChanges.addLinkedBug,
      addUnlinkedBug: pendingChanges.addUnlinkedBug,
      clearChanges: pendingChanges.clearChanges,

      // Modal state
      modalHasChanges: modalActions.hasChanges,
      showCancelConfirm: modalActions.showCancelConfirm,
      handleSave: modalActions.handleSave,
      handleCancel: modalActions.handleCancel,
      handleConfirmCancel: modalActions.handleConfirmCancel,
      handleCancelCancel: modalActions.handleCancelCancel
    }),
    [atId, bugSearch, pendingChanges, modalActions]
  );

  return (
    <NegativeSideEffectBugLinkingContext.Provider value={contextValue}>
      {children}
    </NegativeSideEffectBugLinkingContext.Provider>
  );
};

NegativeSideEffectBugLinkingProvider.propTypes = {
  children: PropTypes.node.isRequired,
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  negativeSideEffect: PropTypes.object,
  onLinked: PropTypes.func,
  onClose: PropTypes.func.isRequired
};

/**
 * Hook to use the negative side effect bug linking context
 */
export const useNegativeSideEffectBugLinkingContext = () => {
  const context = useContext(NegativeSideEffectBugLinkingContext);
  if (!context) {
    throw new Error(
      'useNegativeSideEffectBugLinkingContext must be used within a NegativeSideEffectBugLinkingProvider'
    );
  }
  return context;
};
