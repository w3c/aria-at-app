import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useBugSearch } from '../../../hooks/useBugSearch';
import { useBugPendingChanges } from '../../../hooks/useBugPendingChanges';
import { useBugModalActions } from '../../../hooks/useBugModalActions';

const BugLinkingContext = createContext();

/**
 * Context provider for bug linking functionality
 * Centralizes all bug linking state and logic to eliminate prop drilling
 */
export const BugLinkingProvider = ({
  children,
  atId,
  atName,
  assertion,
  onLinked,
  onClose
}) => {
  // Manage pending changes and display assertion
  const pendingChanges = useBugPendingChanges({ assertion });

  // Search and filter bugs
  const bugSearch = useBugSearch({
    atId,
    assertion: pendingChanges.displayAssertion
  });

  // Modal actions (save, cancel, confirmation)
  const modalActions = useBugModalActions({
    assertion,
    pendingChanges: pendingChanges.pendingChanges,
    displayAssertion: pendingChanges.displayAssertion,
    onLinked,
    onClose
  });

  // Combine all context values
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
      handleCancelCancel: modalActions.handleCancelCancel
    }),
    [atId, atName, bugSearch, pendingChanges, modalActions]
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
