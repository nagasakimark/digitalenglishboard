import { useState, useEffect, useCallback } from 'react';
import { migrateLegacyData, createEmptyBoardData, getMonthData, setMonthData } from '../utils/dataStructure';

import { readJsonFile, listDir, hasToken } from '../utils/github';

// Pick which month to show first: this month if it exists, otherwise the newest month before it,
// otherwise the newest month there is. (So the board is never empty between months.)
export const pickStartMonth = (available, current) => {
  if (!available || available.length === 0) return current;
  if (available.includes(current)) return current;
  const past = available.filter((m) => m <= current);
  return past.length ? past[past.length - 1] : available[available.length - 1];
};

/**
 * options.fromGitHub: load straight from the repo's main branch (editor with a token),
 * so the editor always sees the newest data even before the site has redeployed.
 */
export const useBoardData = (options = {}) => {
  const fromGitHub = !!options.fromGitHub && hasToken();
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedMonths, setLoadedMonths] = useState(new Set());
  const [availableMonths, setAvailableMonths] = useState([]);
  const [startMonth, setStartMonth] = useState(null);

  // Load tags (shared across all months)
  const loadTags = async () => {
    try {
      if (fromGitHub) return (await readJsonFile('public/data/tags.json')) || [];
      const response = await fetch('data/tags.json', { cache: 'no-cache' });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.log('No tags file found, using empty tags');
    }
    return [];
  };

  const loadMonthList = async () => {
    try {
      if (fromGitHub) {
        const entries = await listDir('public/data/months');
        return entries.map((e) => e.name).filter((n) => /^\d{4}-\d{2}\.json$/.test(n)).map((n) => n.slice(0, 7)).sort();
      }
      const res = await fetch('data/months/index.json', { cache: 'no-cache' });
      if (res.ok) return (await res.json()).sort();
    } catch (err) {
      console.log('No month index found');
    }
    return [];
  };

  // Load a specific month's data
  const loadMonth = useCallback(async (monthKey) => {
    try {
      let data = null;
      if (fromGitHub) {
        data = await readJsonFile(`public/data/months/${monthKey}.json`);
      } else {
        const response = await fetch(`data/months/${monthKey}.json`, { cache: 'no-cache' });
        if (response.ok) data = await response.json();
      }
      if (data) {
        // Handle full board export format (if user saved the entire board export as a month file)
        if (data.months && data.months[monthKey]) {
          return data.months[monthKey];
        }
        return data;
      }
    } catch (err) {
      console.log(`No data file for ${monthKey}, creating empty month`);
    }
    return { items: [], decorations: [] };
  }, [fromGitHub]);

  // Initial load - month list, tags, and the month to show first
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [tags, months] = await Promise.all([loadTags(), loadMonthList()]);
        const first = options.preferCurrent ? currentMonth : pickStartMonth(months, currentMonth);
        const monthData = await loadMonth(first);

        setAvailableMonths(months);
        setStartMonth(first);
        setBoardData({
          version: '3.0',
          tags: tags,
          months: {
            [first]: monthData
          }
        });

        setLoadedMonths(new Set([first]));
      } catch (err) {
        setError(err.message);
        setBoardData(createEmptyBoardData());
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [loadMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateBoardData = (newData) => {
    setBoardData(newData);
  };

  // Load a month if not already loaded
  const ensureMonthLoaded = useCallback(async (monthKey) => {
    if (loadedMonths.has(monthKey)) {
      return null; // Already loaded
    }

    const monthData = await loadMonth(monthKey);
    
    setBoardData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        months: {
          ...prev.months,
          [monthKey]: monthData
        }
      };
    });
    
    setLoadedMonths(prev => new Set([...prev, monthKey]));
    return monthData;
  }, [loadedMonths, loadMonth]);

  // Save month data to file (in a real app, this would be a server call)
  const saveMonth = useCallback(async (monthKey, monthData) => {
    // In browser, we can't write files directly
    // This would need a backend API or download functionality
    console.log(`Would save ${monthKey}.json:`, monthData);
    
    // For now, just trigger a download
    const dataStr = JSON.stringify(monthData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${monthKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // Save tags
  const saveTags = useCallback(async (tags) => {
    console.log('Would save tags.json:', tags);
    
    const dataStr = JSON.stringify(tags, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tags.json';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const updateItem = (itemId, updates, targetMonth) => {
    console.log('UPDATE ITEM CALLED:', { itemId, updates });
    
    setBoardData(prev => {
      const newData = { ...prev };
      
      // Ensure months object exists
      if (!newData.months) {
        newData.months = {};
      }
      
      // Find the item across all months
      let foundMonth = null;
      let foundItem = null;
      
      Object.keys(newData.months).forEach(month => {
        const monthData = newData.months[month];
        if (monthData && monthData.items) {
          const itemIndex = monthData.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            foundMonth = month;
            foundItem = monthData.items[itemIndex];
          }
        }
      });
      
      if (foundItem && foundMonth) {
        const updatedItem = { ...foundItem, ...updates };
        console.log('UPDATING ITEM:', {
          before: foundItem,
          updates: updates,
          after: updatedItem
        });
        
        const newMonth = updatedItem.month || foundMonth;
        
        // If month changed, move item to new month
        if (newMonth !== foundMonth) {
          // Remove from old month
          if (newData.months[foundMonth] && newData.months[foundMonth].items) {
            newData.months[foundMonth].items = newData.months[foundMonth].items.filter(item => item.id !== itemId);
          }
          
          // Add to new month
          if (!newData.months[newMonth]) {
            newData.months[newMonth] = { items: [], decorations: [] };
          }
          if (!newData.months[newMonth].items) {
            newData.months[newMonth].items = [];
          }
          newData.months[newMonth].items.push(updatedItem);
        } else {
          // Update in same month
          if (newData.months[foundMonth] && newData.months[foundMonth].items) {
            newData.months[foundMonth].items = newData.months[foundMonth].items.map(item =>
              item.id === itemId ? updatedItem : item
            );
          }
        }
      }
      
      return newData;
    });
  };

  const addItem = (newItem) => {
    setBoardData(prev => {
      const newData = { ...prev };
      const month = newItem.month || new Date().toISOString().slice(0, 7);
      
      if (!newData.months) {
        newData.months = {};
      }
      if (!newData.months[month]) {
        newData.months[month] = { items: [], decorations: [] };
      }
      if (!newData.months[month].items) {
        newData.months[month].items = [];
      }
      
      newData.months[month].items.push(newItem);
      return newData;
    });
  };

  const removeItem = (itemId) => {
    setBoardData(prev => {
      const newData = { ...prev };
      
      // Remove from all months
      Object.keys(newData.months || {}).forEach(month => {
        if (newData.months[month] && newData.months[month].items) {
          newData.months[month].items = newData.months[month].items.filter(item => item.id !== itemId);
        }
      });
      
      return newData;
    });
  };

  return {
    boardData,
    loading,
    error,
    availableMonths,
    setAvailableMonths,
    startMonth,
    loadMonth,
    updateBoardData,
    updateItem,
    addItem,
    removeItem,
    ensureMonthLoaded,
    saveMonth,
    saveTags
  };
};