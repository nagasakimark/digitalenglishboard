// Auto-positioning utilities for filtered items

export const generateSmartPositions = (items, containerWidth = 1200, containerHeight = 800) => {
  if (!items || items.length === 0) return items;

  // Item dimensions (approximate)
  const itemTypes = {
    'sticky-note': { width: 200, height: 200 },
    'polaroid': { width: 180, height: 220 },
    'note-card': { width: 240, height: 160 },
    'link-preview': { width: 280, height: 140 }
  };

  const getItemDimensions = (item) => {
    const style = item.style || 'sticky-note';
    return itemTypes[style] || itemTypes['sticky-note'];
  };

  // Calculate grid spacing
  const padding = 20;
  const margin = 30;

  // Determine grid layout
  const maxItemWidth = Math.max(...Object.values(itemTypes).map(t => t.width));
  const columnsPerRow = Math.floor((containerWidth - padding * 2) / (maxItemWidth + margin));
  
  let currentRow = 0;
  let currentCol = 0;
  let rowHeights = [0]; // Track height of each row
  
  const positionedItems = items.map((item, index) => {
    const dimensions = getItemDimensions(item);
    
    // Calculate position
    const x = padding + currentCol * (maxItemWidth + margin) + Math.random() * 20 - 10; // Small random offset
    const y = padding + rowHeights.slice(0, currentRow).reduce((sum, h) => sum + h + margin, 0) + Math.random() * 15 - 7.5;
    
    // Random rotation between -8 and 8 degrees
    const rotation = Math.random() * 16 - 8;
    
    // Update row height tracking
    rowHeights[currentRow] = Math.max(rowHeights[currentRow], dimensions.height);
    
    // Move to next position
    currentCol++;
    if (currentCol >= columnsPerRow) {
      currentCol = 0;
      currentRow++;
      rowHeights[currentRow] = 0;
    }

    return {
      ...item,
      position: { x: Math.max(0, x), y: Math.max(0, y) },
      rotation: rotation,
      autoPositioned: true // Flag to indicate this was auto-positioned
    };
  });

  return positionedItems;
};

export const shouldAutoPosition = (items, activeFilters) => {
  // Auto-position when filtering by tags (not month-only filtering)
  return activeFilters && activeFilters.length > 0;
};

export const getViewportDimensions = () => {
  // Get the cork board content area dimensions
  const corkBoard = document.querySelector('.cork-board-content');
  if (corkBoard) {
    const rect = corkBoard.getBoundingClientRect();
    return {
      width: rect.width - 40, // Account for padding
      height: Math.max(rect.height, 800) // Minimum height
    };
  }
  
  // Fallback dimensions
  return {
    width: window.innerWidth * 0.8 - 40, // 80% for board area minus padding
    height: Math.max(window.innerHeight - 100, 800)
  };
};