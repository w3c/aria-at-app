import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * @typedef {Object} PendingChanges
 * @property {Array} addedItems - Array of items to be added
 * @property {Array} removedItemIds - Array of item IDs to be removed
 */

/**
 * @typedef {Object} UsePendingChangesOptions
 * @property {Object} originalItem - The original item to track changes for
 * @property {Function} [getItemsField=item => item.items || []] - Function to extract
 *   the items array from an item
 * @property {Function} [createUpdatedItem=(item, updatedItems) => ({ ...item, items: updatedItems })] -
 *   Function to create an updated item with the new items array
 */

/**
 * @typedef {Object} UsePendingChangesReturn
 * @property {PendingChanges} pendingChanges - Object with addedItems and removedItemIds arrays
 * @property {Object|null} displayItem - Preview of the item with pending changes applied
 * @property {boolean} hasChanges - True if there are any pending changes
 * @property {Function} addItem - Function to add an item to pending changes
 * @property {Function} removeItem - Function to remove an item by ID
 * @property {Function} clearChanges - Function to clear all pending changes
 */

/**
 * Generic hook for managing pending changes with preview functionality. Tracks
 * items to be added and removed, and provides a preview of the item with changes applied.
 * Automatically resets when the original item changes.
 *
 * @param {UsePendingChangesOptions} options - Configuration options
 * @returns {UsePendingChangesReturn}
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
    // Filter out original items that were removed, and filter out added items that were also removed
    const updatedItems = originalItems
      .filter(item => !removedIds.has(item.id))
      .concat(
        pendingChanges.addedItems.filter(item => !removedIds.has(item.id))
      );

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
