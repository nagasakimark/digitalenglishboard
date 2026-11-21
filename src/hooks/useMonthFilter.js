import { useMemo } from 'react';
import { generateSmartPositions, shouldAutoPosition, getViewportDimensions } from '../utils/autoPositioning';
import { getMonthData, getAllAvailableMonths } from '../utils/dataStructure';

export const useMonthFilter = (boardData, selectedMonth, activeFilters = []) => {
  const filteredItems = useMemo(() => {
    if (!boardData || !selectedMonth) return [];
    
    const monthData = getMonthData(boardData, selectedMonth);
    let filtered = monthData.items || [];
    
    // Tag filter (if any filters are active)
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item => 
        activeFilters.some(filterId => item.tags?.includes(filterId))
      );
    }

    // Auto-position items when filtering by tags
    if (shouldAutoPosition(filtered, activeFilters)) {
      const viewport = getViewportDimensions();
      filtered = generateSmartPositions(filtered, viewport.width, viewport.height);
    }

    return filtered;
  }, [boardData, selectedMonth, activeFilters]);

  const availableMonths = useMemo(() => {
    return getAllAvailableMonths(boardData);
  }, [boardData]);

  return {
    filteredItems,
    availableMonths
  };
};