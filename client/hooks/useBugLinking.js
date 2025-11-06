import { useBugSearch } from './useBugSearch';
import { useBugPendingChanges } from './useBugPendingChanges';
import { useBugModalActions } from './useBugModalActions';

export const useBugLinking = ({ atId, assertion, onLinked, onClose }) => {
  const pendingChanges = useBugPendingChanges({ assertion });

  const bugSearch = useBugSearch({
    atId,
    assertion: pendingChanges.displayAssertion
  });

  const modalActions = useBugModalActions({
    assertion,
    pendingChanges: pendingChanges.pendingChanges,
    displayAssertion: pendingChanges.displayAssertion,
    onLinked,
    onClose,
    clearChanges: pendingChanges.clearChanges
  });

  return {
    ...bugSearch,
    ...pendingChanges,
    ...modalActions
  };
};
