import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Generic hook for managing pending changes with preview functionality
 */
export const usePendingChanges = ({
  originalItem,
  getItemsField = item => item.items || [],
  createUpdatedItem = (item, updatedItems) => ({ ...item, items: updatedItems })
}) => {
  const [pendingChanges, setPendingChanges] = useState({
    addedItems: [],
    removedItemIds: []
  });

  // Reset pending changes when original item changes
  useEffect(() => {
    setPendingChanges({ addedItems: [], removedItemIds: [] });
  }, [originalItem]);

  // Create a derived item with pending changes applied
  const displayItem = useMemo(() => {
    if (!originalItem) return null;

    const originalItems = getItemsField(originalItem);
    const removedIds = new Set(pendingChanges.removedItemIds);

    // Apply pending changes to show preview
    const updatedItems = originalItems
      .filter(item => !removedIds.has(item.id))
      .concat(pendingChanges.addedItems);

    return createUpdatedItem(originalItem, updatedItems);
  }, [originalItem, pendingChanges, getItemsField, createUpdatedItem]);

  const hasChanges =
    pendingChanges.addedItems.length > 0 ||
    pendingChanges.removedItemIds.length > 0;

  const addItem = useCallback(item => {
    setPendingChanges(prev => ({
      ...prev,
      addedItems: [...prev.addedItems, item]
    }));
  }, []);

  const removeItem = useCallback(itemId => {
    setPendingChanges(prev => ({
      ...prev,
      removedItemIds: [...prev.removedItemIds, itemId]
    }));
  }, []);

  const clearChanges = useCallback(() => {
    setPendingChanges({ addedItems: [], removedItemIds: [] });
  }, []);

  return {
    pendingChanges,
    displayItem,
    hasChanges,
    addItem,
    removeItem,
    clearChanges
  };
};
