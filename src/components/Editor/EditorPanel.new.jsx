import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateLinkPreview } from '../../utils/linkPreviewHelper';
import TagManager from './TagManager';
import ItemEditor from './ItemEditor';

const EditorPanel = ({
  selectedItem,
  onItemUpdate,
  onItemAdd,
  onItemDelete,
  onExportData,
  onImportData,
  boardData,
  onAddDecoration,
  onRemoveDecoration,
  selectedMonth,
  onUpdateBoardData
}) => {
  const [newItemType, setNewItemType] = useState('note');
  const [importError, setImportError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('items');

  // Local state for editing
  const [localState, setLocalState] = useState({
    title: '',
    text: '',
    url: '',
    imageUrl: '',
    quote: '',
    author: '',
    source: ''
  });

  // Sync local state when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setLocalState({
        title: selectedItem.content?.title || '',
        text: selectedItem.content?.text || '',
        url: selectedItem.content?.url || '',
        imageUrl: selectedItem.content?.imageUrl || selectedItem.imageUrl || '',
        quote: selectedItem.content?.quote || '',
        author: selectedItem.content?.author || '',
        source: selectedItem.content?.source || ''
      });
    } else {
      setLocalState({
        title: '',
        text: '',
        url: '',
        imageUrl: '',
        quote: '',
        author: '',
        source: ''
      });
    }
  }, [selectedItem?.id]);

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        onImportData(data);
        setImportError('');
      } catch (error) {
        setImportError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleAddItem = () => {
    const monthToUse = selectedMonth || new Date().toISOString().slice(0, 7);

    if (newItemType === 'decoration') {
      const decoration = {
        id: `deco-${Date.now()}`,
        type: 'decoration',
        imageUrl: 'https://example.com/image.png',
        position: { x: 200, y: 200 },
        rotation: Math.random() * 10 - 5,
        scale: 1.0,
        zIndex: 0
      };
      onAddDecoration(decoration);
      return;
    }

    const getDefaultContent = (itemType) => {
      const defaults = {
        note: { title: 'New Item', text: 'Click to edit...' },
        link: { title: 'New Item', text: 'Click to edit...', url: 'https://example.com' },
        image: { title: 'New Item', text: 'Click to edit...', imageUrl: 'https://example.com/image.jpg' },
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
        calendar: { title: 'Calendar', month: new Date().toISOString().slice(0, 7), events: {} }
      };

      return defaults[itemType] || { title: 'New Item', text: 'Click to edit...' };
    };

    const newItem = {
      id: `item-${Date.now()}`,
      type: newItemType,
      position: { x: 200, y: 200 },
      rotation: Math.random() * 10 - 5,
      zIndex: 1,
      scale: 1.0,
      month: monthToUse,
      tags: [],
      style: newItemType === 'note' ? 'sticky-note' : newItemType,
      color: '#FFF740',
      content: getDefaultContent(newItemType),
      createdAt: new Date().toISOString()
    };

    onItemAdd(newItem);
  };

  const handleGeneratePreview = async () => {
    if (!localState.url || !localState.url.trim()) return;

    try {
      const metadata = await generateLinkPreview(localState.url);
      const newContent = {
        ...selectedItem.content,
        url: localState.url,
        metadata,
        title: localState.title === 'New Item' || !localState.title ? metadata.title : localState.title,
        text: localState.text === 'Click to edit...' || !localState.text ? metadata.description : localState.text
      };

      onItemUpdate(selectedItem.id, { content: newContent });
      setLocalState({
        ...localState,
        title: newContent.title || '',
        text: newContent.text || ''
      });
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  };

  const handleTagAdd = (newTag) => {
    const updatedBoardData = {
      ...boardData,
      tags: [...(boardData?.tags || []), newTag]
    };
    onUpdateBoardData(updatedBoardData);
  };

  const handleTagRemove = (tagId) => {
    const updatedBoardData = {
      ...boardData,
      tags: (boardData?.tags || []).filter(tag => tag.id !== tagId),
      items: (boardData?.items || []).map(item => ({
        ...item,
        tags: (item.tags || []).filter(id => id !== tagId)
      }))
    };
    onUpdateBoardData(updatedBoardData);
  };

  const handleTagUpdate = (tagId, updates) => {
    const updatedBoardData = {
      ...boardData,
      tags: (boardData?.tags || []).map(tag =>
        tag.id === tagId ? { ...tag, ...updates } : tag
      )
    };
    onUpdateBoardData(updatedBoardData);
  };

  if (isCollapsed) {
    return (
      <div className="w-8 h-full bg-white border-l-2 border-wood-dark flex items-center justify-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-wood-dark hover:bg-cork-light rounded"
          title="Expand editor panel"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="editor-panel h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-handwriting text-wood-dark">Editor Panel</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 text-wood-dark hover:bg-cork-light rounded"
            title="Collapse panel"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {selectedMonth && (
          <div className="mt-2 text-sm text-gray-600">
            Editing: <span className="font-medium">{new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex mt-3 space-x-1">
          <button
            onClick={() => setActiveSection('items')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeSection === 'items' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveSection('tags')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeSection === 'tags' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tags
          </button>
        </div>
      </div>

      {activeSection === 'items' && (
        <>
          {/* Import/Export */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Data Management</h3>
            <div className="space-y-2">
              <label className="block">
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-700">
                  <Upload size={16} />
                  Import JSON
                </div>
              </label>
              {importError && <div className="text-red-600 text-sm">{importError}</div>}
              <button
                onClick={onExportData}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 w-full"
              >
                <Download size={16} />
                Export JSON
              </button>
            </div>
          </div>

          {/* Add New Item */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Add New Item</h3>
            <div className="space-y-3">
              <select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="note">Sticky Note</option>
                <option value="link">Link Preview</option>
                <option value="image">Image/Photo</option>
                <option value="checklist">Checklist/Todo</option>
                <option value="calendar-event">Calendar Event</option>
                <option value="quote">Quote/Inspiration</option>
                <option value="audio-note">Audio Note</option>
                <option value="file-attachment">File Attachment</option>
                <option value="countdown">Countdown Timer</option>
                <option value="weather">Weather Widget</option>
                <option value="bookmark">Bookmark Collection</option>
                <option value="progress">Progress Tracker</option>
                <option value="flashcard">Flashcard</option>
                <option value="calendar">Calendar Card</option>
                <option value="decoration">Decoration</option>
              </select>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 w-full"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          </div>

          {/* Selected Item Editor */}
          {selectedItem && (
            <div key={selectedItem.id} className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Editing: {(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? 'Decoration' : (selectedItem.content?.title || 'Untitled')}
                </h3>
                <button
                  onClick={() => {
                    if (selectedItem.type === 'decoration' || selectedItem.imageUrl) {
                      onRemoveDecoration(selectedItem.id);
                    } else {
                      onItemDelete(selectedItem.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Use new ItemEditor component */}
              <ItemEditor
                item={selectedItem}
                onUpdate={onItemUpdate}
                localState={localState}
                setLocalState={setLocalState}
                onGeneratePreview={handleGeneratePreview}
              />

              {/* Position Controls */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-3">Position & Transform</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">X Position</label>
                    <input
                      type="number"
                      value={Math.round(selectedItem.position.x)}
                      onChange={(e) => onItemUpdate(selectedItem.id, {
                        position: { ...selectedItem.position, x: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Y Position</label>
                    <input
                      type="number"
                      value={Math.round(selectedItem.position.y)}
                      onChange={(e) => onItemUpdate(selectedItem.id, {
                        position: { ...selectedItem.position, y: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1">Rotation: {Math.round(selectedItem.rotation || 0)}°</label>
                  <input
                    type="range"
                    min={(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? "-180" : "-45"}
                    max={(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? "180" : "45"}
                    value={selectedItem.rotation || 0}
                    onChange={(e) => onItemUpdate(selectedItem.id, {
                      rotation: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>

                {(selectedItem.type === 'decoration' || selectedItem.imageUrl) && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium mb-1">Scale: {(selectedItem.scale || 1).toFixed(2)}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={selectedItem.scale || 1}
                      onChange={(e) => onItemUpdate(selectedItem.id, {
                        scale: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Month Assignment */}
              <div className="mt-4">
                <label className="block text-xs font-medium mb-1">Month</label>
                <input
                  type="month"
                  value={selectedItem.month || ''}
                  onChange={(e) => onItemUpdate(selectedItem.id, {
                    month: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>

              {/* Tags */}
              {selectedItem.type !== 'decoration' && !selectedItem.imageUrl && (
                <div className="mt-4">
                  <label className="block text-xs font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {boardData?.tags?.map((tag) => {
                      const isSelected = selectedItem.tags?.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => {
                            const currentTags = selectedItem.tags || [];
                            const newTags = isSelected
                              ? currentTags.filter(id => id !== tag.id)
                              : [...currentTags, tag.id];
                            onItemUpdate(selectedItem.id, {
                              tags: newTags,
                              content: selectedItem.content
                            });
                          }}
                          className={`px-2 py-1 rounded text-xs ${
                            isSelected
                              ? 'text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          style={isSelected ? { backgroundColor: tag.color } : {}}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeSection === 'tags' && (
        <TagManager
          tags={boardData?.tags || []}
          onAddTag={handleTagAdd}
          onRemoveTag={handleTagRemove}
          onUpdateTag={handleTagUpdate}
        />
      )}
    </div>
  );
};

export default EditorPanel;
