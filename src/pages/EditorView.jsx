import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format, addMonths, differenceInCalendarMonths, parseISO } from 'date-fns';
import { renderItem as renderBoardItem } from '../components/Items/registry';
import PublishPanel from '../components/Editor/PublishPanel';
import { disableStickers } from '../utils/stickers';
import { publishMonths } from '../utils/publish';
import CorkBoard from '../components/Board/CorkBoard';
import BoardItem from '../components/Board/BoardItem';
import DecorationItem from '../components/Board/DecorationItem';
import EditorPanel from '../components/Editor/EditorPanel';
import EditorDock from '../components/Editor/EditorDock';
import CollapsibleNav from '../components/Navigation/CollapsibleNav';
import ImageLightbox from '../components/Lightbox/ImageLightbox';
import BatchImageExtractor from '../components/Editor/BatchImageExtractor';
import { useBoardData } from '../hooks/useBoardData';
import { useMonthFilter } from '../hooks/useMonthFilter';
import { getMonthData, setMonthData } from '../utils/dataStructure';


const EditorView = () => {
  const { boardData, loading, error, updateItem, addItem, removeItem, updateBoardData, ensureMonthLoaded, availableMonths, setAvailableMonths, loadMonth } = useBoardData({ fromGitHub: true, preferCurrent: true });

  // Playing games in the editor must not award stickers on this computer
  useEffect(() => { disableStickers(true); return () => disableStickers(false); }, []);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showExtractor, setShowExtractor] = useState(false);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Load month data when selectedMonth changes
  useEffect(() => {
    if (!loading && selectedMonth && ensureMonthLoaded) {
      ensureMonthLoaded(selectedMonth);
    }
  }, [selectedMonth, ensureMonthLoaded, loading]);

  // Sync selectedItem with boardData updates to prevent stale state
  useEffect(() => {
    if (selectedItem && boardData) {
      const monthData = getMonthData(boardData, selectedMonth);
      const updatedItem = monthData.items?.find(i => i.id === selectedItem.id) || 
                          monthData.decorations?.find(d => d.id === selectedItem.id);
      
      if (updatedItem && updatedItem !== selectedItem) {
        setSelectedItem(updatedItem);
      }
    }
  }, [boardData, selectedMonth, selectedItem]);

  const { filteredItems } = useMonthFilter(
    boardData,
    selectedMonth, // Always filter by month in editor
    activeFilters
  );

  const handleBatchUpdateItems = ({ items: newItems, decorations: newDecorations }) => {
    const monthData = getMonthData(boardData, selectedMonth);
    const newMonthData = {
      ...monthData,
      items: newItems,
      decorations: newDecorations
    };
    const newBoardData = setMonthData(boardData, selectedMonth, newMonthData);
    updateBoardData(newBoardData);
  };

  const handleItemUpdate = (itemId, updates) => {
    // Check if this is a decoration (decorations have imageUrl at root level)
    const monthData = getMonthData(boardData, selectedMonth);
    const isDecoration = monthData.decorations?.some(d => d.id === itemId);

    if (isDecoration) {
      // Update decoration
      const newMonthData = {
        ...monthData,
        decorations: (monthData.decorations || []).map(d =>
          d.id === itemId ? { ...d, ...updates } : d
        )
      };
      const newBoardData = setMonthData(boardData, selectedMonth, newMonthData);
      updateBoardData(newBoardData);
    } else {
      // Update regular item
      updateItem(itemId, updates);
    }
  };

  const handleTagToggle = (tagId) => {
    setActiveFilters(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddDecoration = (decoration) => {
    const monthData = getMonthData(boardData, selectedMonth);
    const newMonthData = {
      ...monthData,
      decorations: [...(monthData.decorations || []), decoration]
    };
    const newBoardData = setMonthData(boardData, selectedMonth, newMonthData);
    updateBoardData(newBoardData);
  };

  const handleRemoveDecoration = (decorationId) => {
    const monthData = getMonthData(boardData, selectedMonth);
    const newMonthData = {
      ...monthData,
      decorations: (monthData.decorations || []).filter(d => d.id !== decorationId)
    };
    const newBoardData = setMonthData(boardData, selectedMonth, newMonthData);
    updateBoardData(newBoardData);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleItemClick = (item) => {
    // Handle lightbox for images in editor too
    if (item.type === 'image' && item.content.imageUrl) {
      setLightboxImage({
        url: item.content.imageUrl,
        title: item.content.title || item.content.text
      });
    }
  };

  const handleExportData = () => {
    // Export ONLY the current month's data
    const monthData = getMonthData(boardData, selectedMonth);
    
    // Create a clean export object with just items and decorations
    const exportData = {
      items: monthData.items || [],
      decorations: monthData.decorations || [],
      customHtml: monthData.customHtml,
      customCss: monthData.customCss,
      backgroundImage: monthData.backgroundImage,
      borderImage: monthData.borderImage
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    // Name the file exactly what the system expects: YYYY-MM.json
    link.download = `${selectedMonth}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (data) => {
    try {
      if (data && Array.isArray(data.items)) {
        // A single month file (what "Download backup" makes) → load it into the month on screen
        updateBoardData(setMonthData(boardData, selectedMonth, {
          ...data,
          items: data.items.map((i) => ({ ...i, month: selectedMonth })),
        }));
      } else {
        updateBoardData(data);
      }
      setSelectedItem(null);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleItemAdd = (newItem) => {
    addItem(newItem);
    setSelectedItem(newItem);
  };

  const handleCreateItem = (type) => {
    const monthToUse = selectedMonth || new Date().toISOString().slice(0, 7);

    // Calculate position based on current scroll view
    let position = { x: 200, y: 200 };
    try {
      // Updated selector to match actual class name in CorkBoard.jsx
      const scrollContainer = document.querySelector('.cork-board-scroll-area');
      const contentContainer = document.querySelector('.cork-board-content');
      
      if (scrollContainer && contentContainer) {
        const scrollTop = scrollContainer.scrollTop;
        const clientHeight = scrollContainer.clientHeight;
        
        // Parse scale from transform: scale(0.xxx)
        const transform = contentContainer.style.transform;
        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
        
        // Calculate center of visible area in logical coordinates
        const visibleCenterY = scrollTop + (clientHeight / 2);
        const logicalY = visibleCenterY / scale;
        
        // Center X (Board width is 1366)
        const logicalX = 1366 / 2;

        position = { 
          x: logicalX - 100 + (Math.random() * 40 - 20), 
          y: logicalY - 100 + (Math.random() * 40 - 20) 
        };
      }
    } catch (e) {
      console.warn('Could not calculate relative position:', e);
    }

    if (type === 'decoration') {
      const decoration = {
        id: `deco-${Date.now()}`,
        type: 'decoration',
        imageUrl: '',
        position: position,
        rotation: Math.random() * 10 - 5,
        scale: 1.0,
        zIndex: 0
      };
      handleAddDecoration(decoration);
      return;
    }

    const getDefaultContent = (itemType) => {
      const defaults = {
        note: { title: 'New Item', text: 'Click to edit...' },
        link: { title: 'New Item', text: 'Click to edit...', url: 'https://example.com' },
        image: { title: 'New Item', text: 'Click to edit...', imageUrl: '' },
        checklist: { title: 'New Checklist', checklist: [{ text: 'First task', completed: false }] },
        'calendar-event': { title: 'New Event', eventDate: new Date().toISOString().split('T')[0], eventTime: '12:00', description: '', location: '' },
        quote: { title: 'Inspiration', quote: 'Your inspiring quote here...', author: 'Author Name', source: '' },
        'audio-note': { title: 'Audio Note', audioUrl: '', description: '' },
        'file-attachment': { title: 'File Attachment', fileName: '', fileUrl: '', fileSize: 0, description: '' },
        countdown: { title: 'Countdown Timer', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), description: '' },
        weather: { title: 'Weather Update', condition: 'sunny', temperature: 'warm', temperatureValue: 22, location: 'Your Location', lastUpdated: new Date().toISOString() },
        bookmark: { title: 'Bookmark Collection', bookmarks: [{ title: 'Example Site', url: 'https://example.com' }] },
        progress: { title: 'Progress Tracker', currentValue: 0, maxValue: 100, unit: 'tasks', description: '' },
        flashcard: { title: 'Flashcard', front: 'Question side', back: 'Answer side' },
        calendar: { title: 'Calendar', month: new Date().toISOString().slice(0, 7), events: {} },
        youtube: { title: 'YouTube Video', videoUrl: '' },
        'youtube-playlist': { title: 'Music Playlist', playlist: [] },
        tiktok: { title: 'TikTok Video', videoUrl: '' },
        'local-video': { title: 'Local Video', filename: '' },
        quiz: { title: 'New Quiz', questions: [] },
        'scavenger-item': { imageUrl: '' },
        'scratch-card': { text: 'You found a secret!', scratchColor: '#C0C0C0' },
        'time-locked': { title: 'Locked Item', unlockDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), lockedText: 'Come back later!' },
        'mad-libs': { title: 'Mad Libs', template: 'Once upon a time there was a [adjective] [noun] who loved to [verb].' },
        'crossword': { title: 'New Crossword', clues: [], grid: [], width: 10, height: 10 },
        'wordsearch': { title: 'New Word Search', words: [], grid: [], size: 10 },
        'snowball-catch': { title: 'Snowball Catch!', words: [], useFlashcards: true },
        'advent': { title: 'Advent Calendar', doors: [] },
        'decorate-tree': { title: 'Decorate the Tree!', missionCount: 6 }
      };

      return defaults[itemType] || { title: 'New Item', text: 'Click to edit...' };
    };

    const newItem = {
      id: `item-${Date.now()}`,
      type: type,
      position: position,
      rotation: Math.random() * 10 - 5,
      zIndex: 1,
      scale: 1.0,
      month: monthToUse,
      tags: [],
      style: type === 'note' ? 'sticky-note' : type,
      color: '#FFF740',
      content: getDefaultContent(type),
      createdAt: new Date().toISOString()
    };

    handleItemAdd(newItem);
  };

  const handleItemDelete = (itemId) => {
    removeItem(itemId);
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const renderItem = (item) =>
    renderBoardItem(item, { isEditing: true, boardItems: filteredItems, onUpdate: handleItemUpdate });

  // ---------- unsaved changes & publishing ----------
  // A snapshot of each month as it was loaded/published; anything different is "unpublished".
  const snapshots = useRef({});
  useEffect(() => {
    if (!boardData?.months) return;
    Object.entries(boardData.months).forEach(([key, data]) => {
      if (!(key in snapshots.current)) snapshots.current[key] = JSON.stringify(data);
    });
  }, [boardData]);
  const [publishTick, setPublishTick] = useState(0);
  const dirtyMonths = useMemo(() => {
    if (!boardData?.months) return [];
    return Object.entries(boardData.months)
      .filter(([key, data]) => key in snapshots.current && snapshots.current[key] !== JSON.stringify(data))
      .map(([key]) => key)
      .sort();
  }, [boardData, publishTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before closing the tab with unpublished changes
  useEffect(() => {
    const warn = (e) => {
      if (dirtyMonths.length) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtyMonths]);

  const handlePublish = async (onProgress) => {
    const months = {};
    dirtyMonths.forEach((k) => { months[k] = boardData.months[k]; });
    const sha = await publishMonths(months, boardData.tags, onProgress);
    dirtyMonths.forEach((k) => { snapshots.current[k] = JSON.stringify(boardData.months[k]); });
    setAvailableMonths((prev) => [...new Set([...prev, ...dirtyMonths])].sort());
    setPublishTick((t) => t + 1);
    return sha;
  };

  // ---------- copy another month's board into this one ----------
  const handleCopyMonth = async (sourceKey) => {
    const source = boardData.months?.[sourceKey] || (await loadMonth(sourceKey));
    if (!source) return;
    const shift = differenceInCalendarMonths(parseISO(selectedMonth + '-01'), parseISO(sourceKey + '-01'));
    const moveDate = (iso) => {
      if (!iso) return iso;
      try { return addMonths(new Date(iso), shift).toISOString(); } catch { return iso; }
    };
    const stamp = Date.now();
    const items = (source.items || []).map((item, i) => {
      const content = { ...(item.content || {}) };
      if (item.type === 'calendar') content.month = selectedMonth;
      if (item.type === 'countdown') content.targetDate = moveDate(content.targetDate);
      if (item.type === 'time-locked') content.unlockDate = moveDate(content.unlockDate);
      return { ...item, id: `item-${stamp}-${i}`, month: selectedMonth, content, createdAt: new Date().toISOString() };
    });
    const decorations = (source.decorations || []).map((d, i) => ({ ...d, id: `deco-${stamp}-${i}` }));
    const current = getMonthData(boardData, selectedMonth);
    updateBoardData(setMonthData(boardData, selectedMonth, {
      ...current,
      items,
      decorations,
      customHtml: source.customHtml || '',
      customCss: source.customCss || '',
      backgroundImage: source.backgroundImage,
      borderImage: source.borderImage,
    }));
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cork-light">
        <div className="text-xl font-handwriting">Loading editor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cork-light">
        <div className="text-xl text-red-600 font-handwriting">
          Error loading editor: {error}
        </div>
      </div>
    );
  }

  const monthData = getMonthData(boardData, selectedMonth);

  // Calculate dynamic board height based on content
  const calculateBoardHeight = () => {
    const BASE_HEIGHT = 768;
    let maxBottom = BASE_HEIGHT;

    const checkItem = (y, height) => {
      if (y + height > maxBottom) {
        maxBottom = y + height;
      }
    };

    // Check items
    filteredItems.forEach(item => {
      let height = 300; // Default fallback
      
      if (item.size?.height) {
        height = item.size.height;
      } else {
        switch(item.type) {
          case 'tiktok': height = 600; break;
          case 'youtube': 
          case 'youtube-playlist': height = 450; break;
          case 'image': height = 400; break;
          case 'note': height = 300; break;
          case 'calendar': height = 400; break;
          case 'weather': height = 300; break;
          default: height = 250;
        }
      }
      
      checkItem(item.position.y, height);
    });

    // Check decorations
    monthData.decorations?.forEach(dec => {
      const size = 150 * (dec.scale || 1);
      checkItem(dec.position.y, size);
    });

    return maxBottom + 500; // Add generous padding to prevent items from hanging off
  };

  const boardHeight = calculateBoardHeight();

  return (
    <div className="relative h-screen bg-gray-100 overflow-hidden">
      {/* Cork Board - with right margin for editor panel */}
      <div className="h-full flex flex-col" style={{ marginRight: '320px' }}>
        {/* Use CollapsibleNav like student view */}
        <CollapsibleNav
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          boardData={boardData}
          activeFilters={activeFilters}
          onTagToggle={handleTagToggle}
        />

        <div className="flex-1 relative overflow-hidden">
          <CorkBoard
            backgroundImage={monthData.backgroundImage}
            borderImage={monthData.borderImage}
            customHtml={monthData.customHtml}
            customCss={monthData.customCss}
            // No viewportHeight passed - fills container
            contentHeight={boardHeight}
          >
            {/* Decorations */}
            {boardData && monthData.decorations?.map((decoration) => (
              <DecorationItem
                key={decoration.id}
                decoration={decoration}
                isEditable={true}
                onUpdate={(id, updates) => {
                  const monthData = getMonthData(boardData, selectedMonth);
                  const newMonthData = {
                    ...monthData,
                    decorations: (monthData.decorations || []).map(d =>
                      d.id === id ? { ...d, ...updates } : d
                    )
                  };
                  const newBoardData = setMonthData(boardData, selectedMonth, newMonthData);
                  updateBoardData(newBoardData);
                }}
                onSelect={handleItemSelect}
              />
            ))}

            {/* Board Items */}
            {filteredItems.map((item) => (
              <BoardItem
                key={item.id}
                item={item}
                isEditable={true}
                onUpdate={handleItemUpdate}
                onSelect={(clickedItem) => {
                  // Handle both selection and lightbox
                  handleItemSelect(clickedItem);
                  handleItemClick(clickedItem);
                }}
              >
                {renderItem(item)}
              </BoardItem>
            ))}
          </CorkBoard>
        </div>

        {/* Editor Dock - Static Bottom Area */}
        <EditorDock 
          onAddItem={handleCreateItem} 
          onOpenTools={() => setShowExtractor(true)}
        />
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage?.url}
        title={lightboxImage?.title}
        onClose={() => setLightboxImage(null)}
      />

      {/* Batch Image Extractor Modal */}
      {showExtractor && (
        <BatchImageExtractor
          items={getMonthData(boardData, selectedMonth).items || []}
          decorations={getMonthData(boardData, selectedMonth).decorations || []}
          onUpdate={handleBatchUpdateItems}
          onClose={() => setShowExtractor(false)}
        />
      )}

      {/* Editor Panel - Fixed Sidebar with Modern Style */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white/90 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50">
        <EditorPanel
          selectedItem={selectedItem}
          onItemUpdate={handleItemUpdate}
          onItemAdd={handleItemAdd}
          onItemDelete={handleItemDelete}
          onExportData={handleExportData}
          onImportData={handleImportData}
          boardData={boardData}
          onAddDecoration={handleAddDecoration}
          onRemoveDecoration={handleRemoveDecoration}
          selectedMonth={selectedMonth}
          onUpdateBoardData={updateBoardData}
          topSlot={
            <PublishPanel
              selectedMonth={selectedMonth}
              dirtyMonths={dirtyMonths}
              availableMonths={availableMonths}
              onPublish={handlePublish}
              onCopyMonth={handleCopyMonth}
              currentHasItems={(getMonthData(boardData, selectedMonth).items || []).length > 0}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          }
        />
      </div>
    </div>
  );
};

export default EditorView;