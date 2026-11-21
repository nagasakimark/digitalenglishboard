import { useCallback, useRef } from 'react';

export const useDragUpdate = (onUpdate, selectedItemId) => {
  const dragUpdateRef = useRef(null);

  const handleDragUpdate = useCallback((itemId, updates, isDragUpdate = false) => {
    if (isDragUpdate) {
      // Store drag updates separately to avoid form resets
      dragUpdateRef.current = { itemId, updates };
      
      // If this is not the selected item, update immediately
      if (itemId !== selectedItemId) {
        onUpdate(itemId, updates);
      }
      return;
    }

    // For non-drag updates, always update immediately
    onUpdate(itemId, updates);
    
    // Clear any pending drag update
    dragUpdateRef.current = null;
  }, [onUpdate, selectedItemId]);

  const flushDragUpdates = useCallback(() => {
    // Apply any pending drag updates when selection changes
    if (dragUpdateRef.current) {
      const { itemId, updates } = dragUpdateRef.current;
      onUpdate(itemId, updates);
      dragUpdateRef.current = null;
    }
  }, [onUpdate]);

  return { handleDragUpdate, flushDragUpdates };
};