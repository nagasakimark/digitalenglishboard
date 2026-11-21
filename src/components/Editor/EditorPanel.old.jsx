import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateLinkPreview } from '../../utils/linkPreviewHelper';
import TagManager from './TagManager';

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
  const [activeSection, setActiveSection] = useState('items'); // 'items' or 'tags'

  // Local state for form editing to prevent resets
  const [localTitle, setLocalTitle] = useState('');
  const [localText, setLocalText] = useState('');
  const [localUrl, setLocalUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const [localQuote, setLocalQuote] = useState('');
  const [localAuthor, setLocalAuthor] = useState('');
  const [localSource, setLocalSource] = useState('');
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  // Store metadata separately to prevent loss
  const [preservedMetadata, setPreservedMetadata] = useState(null);

  const handleDecorationImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      
      // Update the decoration immediately with the data URL
      onItemUpdate(selectedItem.id, {
        imageUrl: dataUrl
      });
      setLocalImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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

  const handleAddItem = async () => {
    // Use the selected month from editor or current date as fallback
    const monthToUse = selectedMonth || new Date().toISOString().slice(0, 7); // YYYY-MM format

    if (newItemType === 'decoration') {
      // Create decoration instead of item
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
      const baseContent = {
        title: 'New Item',
        text: 'Click to edit...'
      };

      switch (itemType) {
        case 'link':
          return { ...baseContent, url: 'https://example.com' };
        case 'image':
          return { ...baseContent, imageUrl: 'https://example.com/image.jpg' };
        case 'checklist':
          return { 
            title: 'New Checklist',
            checklist: [
              { text: 'First task', completed: false },
              { text: 'Second task', completed: false }
            ]
          };
        case 'calendar-event':
          return {
            title: 'New Event',
            eventDate: new Date().toISOString().split('T')[0],
            eventTime: '12:00',
            description: 'Event description',
            location: ''
          };
        case 'quote':
          return {
            title: 'Inspiration',
            quote: 'Your inspiring quote here...',
            author: 'Author Name',
            source: ''
          };
        case 'audio-note':
          return {
            title: 'Audio Note',
            audioUrl: '',
            description: 'Audio description'
          };
        case 'file-attachment':
          return {
            title: 'File Attachment',
            fileName: '',
            fileUrl: '',
            fileSize: 0,
            description: 'File description'
          };
        case 'countdown':
          return {
            title: 'Countdown Timer',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Countdown description'
          };
        case 'weather':
          return {
            title: 'Weather Update',
            condition: 'sunny',
            temperature: 'warm',
            temperatureValue: 22,
            location: 'Your Location',
            notes: '',
            lastUpdated: new Date().toISOString()
          };
        case 'bookmark':
          return {
            title: 'Bookmark Collection',
            bookmarks: [
              { title: 'Example Site', url: 'https://example.com' }
            ]
          };
        case 'progress':
          return {
            title: 'Progress Tracker',
            currentValue: 0,
            maxValue: 100,
            unit: 'tasks',
            description: 'Track your progress'
          };
        case 'flashcard':
          return {
            title: 'Flashcard',
            front: 'Question side',
            back: 'Answer side'
          };
        case 'calendar':
          return {
            title: 'Calendar',
            month: new Date().toISOString().slice(0, 7),
            events: {
              '15': { title: 'Sample Event', description: 'Event details' }
            }
          };
        default:
          return baseContent;
      }
    };

    const newItem = {
      id: `item-${Date.now()}`,
      type: newItemType,
      position: { x: 200, y: 200 },
      rotation: Math.random() * 10 - 5, // Random rotation between -5 and 5
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
    const url = localUrl;
    if (!url || !url.trim()) return;

    try {
      const metadata = await generateLinkPreview(url);

      // Generate preview sets the BASE state - everything comes from this
      const newContent = {
        ...selectedItem.content,
        url,
        metadata,
        title: localTitle === 'New Item' || !localTitle ? metadata.title : localTitle,
        text: localText === 'Click to edit...' || !localText ? metadata.description : localText
      };

      // Update the item with new metadata
      onItemUpdate(selectedItem.id, { content: newContent });

      // Update local state to match exactly what we saved
      setLocalTitle(newContent.title || '');
      setLocalText(newContent.text || '');
      setLocalUrl(newContent.url || '');

      // Store metadata separately so it can't be lost
      setPreservedMetadata(newContent.metadata);

      // Mark that we have local changes so sync won't override
      setHasLocalChanges(true);

    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  };

  const handleAddTag = (newTag) => {
    const updatedBoardData = {
      ...boardData,
      tags: [...(boardData?.tags || []), newTag]
    };
    onUpdateBoardData(updatedBoardData);
  };

  const handleRemoveTag = (tagId) => {
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

  const handleUpdateTag = (tagId, updates) => {
    const updatedBoardData = {
      ...boardData,
      tags: (boardData?.tags || []).map(tag =>
        tag.id === tagId ? { ...tag, ...updates } : tag
      )
    };
    onUpdateBoardData(updatedBoardData);
  };

  // Sync local state with selected item - ONLY when item ID changes
  useEffect(() => {
    console.log('SYNCING LOCAL STATE:', {
      selectedItemId: selectedItem?.id,
      content: selectedItem?.content,
      metadata: selectedItem?.content?.metadata
    });

    if (selectedItem) {
      setLocalTitle(selectedItem.content?.title || '');
      setLocalText(selectedItem.content?.text || '');
      setLocalUrl(selectedItem.content?.url || '');
      setLocalImageUrl(selectedItem.content?.imageUrl || selectedItem.imageUrl || '');
      setLocalQuote(selectedItem.content?.quote || '');
      setLocalAuthor(selectedItem.content?.author || '');
      setLocalSource(selectedItem.content?.source || '');
      setPreservedMetadata(selectedItem.content?.metadata || null);
      setHasLocalChanges(false);
    } else {
      setLocalTitle('');
      setLocalText('');
      setLocalUrl('');
      setLocalImageUrl('');
      setLocalQuote('');
      setLocalAuthor('');
      setLocalSource('');
      setPreservedMetadata(null);
      setHasLocalChanges(false);
    }
  }, [selectedItem?.id]); // ONLY when item ID changes, not when content changes

  // Save any pending changes when switching items
  useEffect(() => {
    return () => {
      // Cleanup - save any pending changes when component unmounts or item changes
      if (hasLocalChanges && selectedItem) {
        onItemUpdate(selectedItem.id, {
          content: {
            ...selectedItem.content,
            title: localTitle,
            text: localText,
            url: localUrl
          }
        });
      }
    };
  }, [selectedItem?.id]);

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
            title="Collapse panel for full screen"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Current Month Indicator */}
        {selectedMonth && (
          <div className="mt-2 text-sm text-gray-600">
            Editing: <span className="font-medium">{new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex mt-3 space-x-1">
          <button
            onClick={() => setActiveSection('items')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeSection === 'items'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveSection('tags')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeSection === 'tags'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Tags
          </button>
        </div>

      </div>

      {activeSection === 'items' && (
        <>
          {/* Import/Export Controls */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Data Management</h3>
            <div className="space-y-2">
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload size={16} />
                    Import JSON
                  </div>
                </label>
                {importError && (
                  <div className="text-red-600 text-sm mt-1">{importError}</div>
                )}
              </div>

              <button
                onClick={onExportData}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors w-full"
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
                className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors w-full"
              >
                <Plus size={16} />
                Add {newItemType === 'note' ? 'Note' : newItemType === 'link' ? 'Link' : newItemType === 'image' ? 'Image' : 'Decoration'}
              </button>
            </div>
          </div>

          {/* Selected Item Editor */}
          {selectedItem ? (
            <div key={selectedItem.id} className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Editing: {(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? 'Decoration' : (selectedItem.content?.title || 'Untitled')}
                </h3>
                <button
                  onClick={() => {
                    // Check if this is a decoration
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

              <div className="space-y-4">
                {/* Basic Info - only for non-decoration items */}
                {selectedItem.type !== 'decoration' && !selectedItem.imageUrl && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => {
                          setLocalTitle(e.target.value);
                          setHasLocalChanges(true);
                          // DON'T update data on every keystroke - only update local state
                        }}
                        onBlur={() => {
                          // Save when user stops editing (blur event)
                          console.log('SAVING TITLE:', {
                            newTitle: localTitle,
                            preservingMetadata: preservedMetadata,
                            preservingUrl: localUrl,
                            fullContent: selectedItem.content
                          });

                          onItemUpdate(selectedItem.id, {
                            content: {
                              ...selectedItem.content,
                              title: localTitle,
                              // Use local state values to preserve all fields
                              text: localText,
                              // Use preserved metadata instead of current (which might be lost)
                              metadata: preservedMetadata,
                              url: localUrl
                            }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <textarea
                        value={localText}
                        onChange={(e) => {
                          setLocalText(e.target.value);
                          setHasLocalChanges(true);
                          // DON'T update data on every keystroke - only update local state
                        }}
                        onBlur={() => {
                          // Save when user stops editing (blur event)
                          onItemUpdate(selectedItem.id, {
                            content: {
                              ...selectedItem.content,
                              text: localText,
                              // Use local state values to preserve all fields
                              title: localTitle,
                              // Use preserved metadata
                              metadata: preservedMetadata,
                              url: localUrl
                            }
                          });
                        }}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}

                {selectedItem.type === 'link' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={localUrl}
                        onChange={(e) => {
                          setLocalUrl(e.target.value);
                          setHasLocalChanges(true);
                          // DON'T auto-update data - let user generate preview manually
                        }}
                        onBlur={() => {
                          // Only update URL, clear metadata since URL changed
                          setPreservedMetadata(null); // Clear preserved metadata too
                          onItemUpdate(selectedItem.id, {
                            content: {
                              ...selectedItem.content,
                              url: localUrl,
                              metadata: undefined // Clear metadata when URL changes
                            }
                          });
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="https://example.com or https://youtube.com/watch?v=..."
                      />
                      <button
                        onClick={handleGeneratePreview}
                        disabled={!localUrl || !localUrl.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Generate Preview
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Click "Generate Preview" to fetch thumbnails and metadata
                    </div>
                  </div>
                )}

                {selectedItem.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload Image</label>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            if (!file.type.startsWith('image/')) {
                              alert('Please select an image file');
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target.result;
                              setLocalImageUrl(dataUrl);
                              onItemUpdate(selectedItem.id, {
                                content: { ...selectedItem.content, imageUrl: dataUrl }
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-700 transition-colors">
                          <Upload size={16} />
                          Choose Image File
                        </div>
                      </label>
                      <div className="text-xs text-gray-500 mt-1">
                        Upload an image to embed in the board
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">OR</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Image URL</label>
                      <input
                        type="url"
                        value={localImageUrl}
                        onChange={(e) => {
                          setLocalImageUrl(e.target.value);
                          onItemUpdate(selectedItem.id, {
                            content: { ...selectedItem.content, imageUrl: e.target.value }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {localImageUrl && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Preview:</div>
                        <img
                          src={localImageUrl}
                          alt="Preview"
                          className="max-w-full h-32 object-contain border border-gray-300 rounded bg-gray-50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Type-specific editing fields */}
                {selectedItem.type === 'checklist' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Checklist Items</label>
                      {(selectedItem.content.checklist || []).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => {
                              const newChecklist = [...(selectedItem.content.checklist || [])];
                              newChecklist[index] = { ...item, completed: e.target.checked };
                              onItemUpdate(selectedItem.id, {
                                content: { ...selectedItem.content, checklist: newChecklist }
                              });
                            }}
                          />
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              const newChecklist = [...(selectedItem.content.checklist || [])];
                              newChecklist[index] = { ...item, text: e.target.value };
                              onItemUpdate(selectedItem.id, {
                                content: { ...selectedItem.content, checklist: newChecklist }
                              });
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => {
                              const newChecklist = selectedItem.content.checklist.filter((_, i) => i !== index);
                              onItemUpdate(selectedItem.id, {
                                content: { ...selectedItem.content, checklist: newChecklist }
                              });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newChecklist = [...(selectedItem.content.checklist || []), { text: 'New item', completed: false }];
                          onItemUpdate(selectedItem.id, {
                            content: { ...selectedItem.content, checklist: newChecklist }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'calendar-event' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Date</label>
                      <input
                        type="date"
                        value={selectedItem.content.eventDate || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, eventDate: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Time</label>
                      <input
                        type="time"
                        value={selectedItem.content.eventTime || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, eventTime: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={selectedItem.content.description || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, description: e.target.value }
                        })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        type="text"
                        value={selectedItem.content.location || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, location: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'quote' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quote</label>
                      <textarea
                        value={localQuote}
                        onChange={(e) => {
                          setLocalQuote(e.target.value);
                          setHasLocalChanges(true);
                        }}
                        onBlur={() => {
                          onItemUpdate(selectedItem.id, {
                            content: { 
                              ...selectedItem.content, 
                              quote: localQuote,
                              author: localAuthor,
                              source: localSource
                            }
                          });
                        }}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Author</label>
                      <input
                        type="text"
                        value={localAuthor}
                        onChange={(e) => {
                          setLocalAuthor(e.target.value);
                          setHasLocalChanges(true);
                        }}
                        onBlur={() => {
                          onItemUpdate(selectedItem.id, {
                            content: { 
                              ...selectedItem.content, 
                              quote: localQuote,
                              author: localAuthor,
                              source: localSource
                            }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Source</label>
                      <input
                        type="text"
                        value={localSource}
                        onChange={(e) => {
                          setLocalSource(e.target.value);
                          setHasLocalChanges(true);
                        }}
                        onBlur={() => {
                          onItemUpdate(selectedItem.id, {
                            content: { 
                              ...selectedItem.content, 
                              quote: localQuote,
                              author: localAuthor,
                              source: localSource
                            }
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'weather' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location (Get Live Weather)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedItem.content.location || ''}
                          onChange={(e) => onItemUpdate(selectedItem.id, {
                            content: { ...selectedItem.content, location: e.target.value }
                          })}
                          placeholder="Enter city name (e.g., London, Tokyo)"
                          className="flex-1 p-2 border border-gray-300 rounded"
                        />
                        <button
                          onClick={async () => {
                            const location = selectedItem.content.location;
                            if (!location) {
                              alert('Please enter a location first');
                              return;
                            }
                            
                            try {
                              // Using Open-Meteo API (free, no API key required)
                              // First, geocode the location
                              const geoResponse = await fetch(
                                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
                              );
                              const geoData = await geoResponse.json();
                              
                              if (!geoData.results || geoData.results.length === 0) {
                                alert('Location not found. Please try a different city name.');
                                return;
                              }
                              
                              const { latitude, longitude, name } = geoData.results[0];
                              
                              // Fetch weather data using coordinates
                              const weatherResponse = await fetch(
                                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
                              );
                              const weatherData = await weatherResponse.json();
                              
                              // Map weather codes to conditions
                              const weatherCode = weatherData.current.weather_code;
                              let condition = 'sunny';
                              if (weatherCode === 0) condition = 'sunny';
                              else if ([1, 2, 3].includes(weatherCode)) condition = 'cloudy';
                              else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) condition = 'rainy';
                              else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) condition = 'snowy';
                              else if ([95, 96, 99].includes(weatherCode)) condition = 'stormy';
                              
                              const temp = Math.round(weatherData.current.temperature_2m);
                              const tempFeel = temp > 25 ? 'hot' : temp > 15 ? 'warm' : temp > 5 ? 'chilly' : 'cold';
                              
                              onItemUpdate(selectedItem.id, {
                                content: {
                                  ...selectedItem.content,
                                  location: name,
                                  condition,
                                  temperature: tempFeel,
                                  temperatureValue: temp,
                                  lastUpdated: new Date().toISOString()
                                }
                              });
                            } catch (error) {
                              console.error('Weather fetch error:', error);
                              alert('Unable to fetch weather data. Please check your internet connection or try again later.');
                            }
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                        >
                          Get Weather
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click "Get Weather" to fetch live data, or use manual controls below
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Manual Condition</label>
                      <select
                        value={selectedItem.content.condition || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, condition: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="sunny">Sunny</option>
                        <option value="rainy">Rainy</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="snowy">Snowy</option>
                        <option value="windy">Windy</option>
                        <option value="stormy">Stormy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Temperature Feel</label>
                      <select
                        value={selectedItem.content.temperature || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, temperature: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="chilly">Chilly</option>
                        <option value="cold">Cold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
                      <input
                        type="number"
                        value={selectedItem.content.temperatureValue || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, temperatureValue: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'audio-note' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload Audio File</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const fileName = `audio-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                            const relativePath = `/audio/${fileName}`;
                            
                            // Create download link for user to save file manually
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const link = document.createElement('a');
                              link.href = event.target.result;
                              link.download = fileName;
                              link.click();
                              
                              alert(`Audio will be saved as: ${fileName}\\n\\nPlease place this file in the public/audio/ folder for it to play correctly.`);
                            };
                            reader.readAsDataURL(file);
                            
                            // Update the item with the relative path
                            onItemUpdate(selectedItem.id, {
                              content: { ...selectedItem.content, audioUrl: relativePath }
                            });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Select an audio file to generate relative URL
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Audio File Path (Manual)</label>
                      <input
                        type="text"
                        value={selectedItem.content.audioUrl || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, audioUrl: e.target.value }
                        })}
                        placeholder="/audio/filename.mp3"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={selectedItem.content.description || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, description: e.target.value }
                        })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'progress' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Value</label>
                      <input
                        type="number"
                        value={selectedItem.content.currentValue || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, currentValue: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Maximum Value</label>
                      <input
                        type="number"
                        value={selectedItem.content.maxValue || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, maxValue: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit</label>
                      <input
                        type="text"
                        value={selectedItem.content.unit || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, unit: e.target.value }
                        })}
                        placeholder="e.g., tasks, pages, days"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        value={selectedItem.content.description || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, description: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'flashcard' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Front (Question)</label>
                      <textarea
                        value={selectedItem.content.front || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, front: e.target.value }
                        })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Back (Answer)</label>
                      <textarea
                        value={selectedItem.content.back || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, back: e.target.value }
                        })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'file-attachment' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload File</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const fileName = `file-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                            const relativePath = `/files/${fileName}`;
                            
                            // Create download link for user to save file manually
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const link = document.createElement('a');
                              link.href = event.target.result;
                              link.download = fileName;
                              link.click();
                              
                              alert(`File will be saved as: ${fileName}\\n\\nPlease place this file in the public/files/ folder for it to be accessible.`);
                            };
                            reader.readAsDataURL(file);
                            
                            // Update the item with file info
                            onItemUpdate(selectedItem.id, {
                              content: { 
                                ...selectedItem.content, 
                                fileName: file.name,
                                fileUrl: relativePath,
                                fileSize: file.size
                              }
                            });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Select a file to upload and generate relative URL
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">File Name</label>
                      <input
                        type="text"
                        value={selectedItem.content.fileName || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, fileName: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">File URL</label>
                      <input
                        type="text"
                        value={selectedItem.content.fileUrl || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, fileUrl: e.target.value }
                        })}
                        placeholder="/files/filename.pdf"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">File Size (bytes)</label>
                      <input
                        type="number"
                        value={selectedItem.content.fileSize || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, fileSize: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={selectedItem.content.description || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, description: e.target.value }
                        })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'countdown' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Date & Time</label>
                      <input
                        type="datetime-local"
                        value={selectedItem.content.targetDate ? selectedItem.content.targetDate.slice(0, 16) : ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, targetDate: e.target.value + ':00.000Z' }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <input
                        type="text"
                        value={selectedItem.content.description || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, description: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'bookmark' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bookmarks</label>
                      {(selectedItem.content.bookmarks || []).map((bookmark, index) => (
                        <div key={index} className="flex gap-2 mb-2 p-3 border rounded">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Bookmark title"
                              value={bookmark.title || ''}
                              onChange={(e) => {
                                const newBookmarks = [...(selectedItem.content.bookmarks || [])];
                                newBookmarks[index] = { ...bookmark, title: e.target.value };
                                onItemUpdate(selectedItem.id, {
                                  content: { ...selectedItem.content, bookmarks: newBookmarks }
                                });
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="url"
                              placeholder="https://example.com"
                              value={bookmark.url || ''}
                              onChange={(e) => {
                                const newBookmarks = [...(selectedItem.content.bookmarks || [])];
                                newBookmarks[index] = { ...bookmark, url: e.target.value };
                                onItemUpdate(selectedItem.id, {
                                  content: { ...selectedItem.content, bookmarks: newBookmarks }
                                });
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newBookmarks = selectedItem.content.bookmarks.filter((_, i) => i !== index);
                              onItemUpdate(selectedItem.id, {
                                content: { ...selectedItem.content, bookmarks: newBookmarks }
                              });
                            }}
                            className="text-red-600 hover:text-red-800 self-start mt-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newBookmarks = [...(selectedItem.content.bookmarks || []), { title: '', url: '' }];
                          onItemUpdate(selectedItem.id, {
                            content: { ...selectedItem.content, bookmarks: newBookmarks }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Bookmark
                      </button>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'calendar' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Calendar Month</label>
                      <input
                        type="month"
                        value={selectedItem.content.month || ''}
                        onChange={(e) => onItemUpdate(selectedItem.id, {
                          content: { ...selectedItem.content, month: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Events</label>
                      <div className="text-sm text-gray-600 mb-2">
                        Add events for specific days (format: day number 01-31)
                      </div>
                      {Object.entries(selectedItem.content.events || {}).map(([day, event]) => (
                        <div key={day} className="flex gap-2 mb-2 p-3 border rounded">
                          <div className="w-16">
                            <label className="text-xs text-gray-500">Day</label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={day}
                              onChange={(e) => {
                                const newEvents = { ...selectedItem.content.events };
                                delete newEvents[day];
                                newEvents[e.target.value.padStart(2, '0')] = event;
                                onItemUpdate(selectedItem.id, {
                                  content: { ...selectedItem.content, events: newEvents }
                                });
                              }}
                              className="w-full p-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Event title"
                              value={event.title || ''}
                              onChange={(e) => {
                                const newEvents = { ...selectedItem.content.events };
                                newEvents[day] = { ...event, title: e.target.value };
                                onItemUpdate(selectedItem.id, {
                                  content: { ...selectedItem.content, events: newEvents }
                                });
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Event description"
                              value={event.description || ''}
                              onChange={(e) => {
                                const newEvents = { ...selectedItem.content.events };
                                newEvents[day] = { ...event, description: e.target.value };
                                onItemUpdate(selectedItem.id, {
                                  content: { ...selectedItem.content, events: newEvents }
                                });
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="url"
                              placeholder="Event image URL (optional)"
                              value={event.image || ''}
                              onChange={(e) => {
                                const newEvents = { ...selectedItem.content.events };
                                newEvents[day] = { ...event, image: e.target.value };
                                onItemUpdate(selectedItem.id, {
                                  content: { ...selectedItem.content, events: newEvents }
                                });
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newEvents = { ...selectedItem.content.events };
                              delete newEvents[day];
                              onItemUpdate(selectedItem.id, {
                                content: { ...selectedItem.content, events: newEvents }
                              });
                            }}
                            className="text-red-600 hover:text-red-800 self-start mt-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newDay = String(Object.keys(selectedItem.content.events || {}).length + 1).padStart(2, '0');
                          const newEvents = { 
                            ...selectedItem.content.events, 
                            [newDay]: { title: '', description: '', image: '' }
                          };
                          onItemUpdate(selectedItem.id, {
                            content: { ...selectedItem.content, events: newEvents }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Event
                      </button>
                    </div>
                  </div>
                )}

                {(selectedItem.type === 'decoration' || selectedItem.imageUrl) && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload Local Image</label>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDecorationImageUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-purple-700 transition-colors">
                          <Upload size={16} />
                          Choose Image File
                        </div>
                      </label>
                      <div className="text-xs text-gray-500 mt-1">
                        Upload an image to use as decoration. Image will be embedded in the board data.
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">OR</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Image URL or Path</label>
                      <input
                        type="text"
                        value={localImageUrl}
                        onChange={(e) => {
                          setLocalImageUrl(e.target.value);
                          onItemUpdate(selectedItem.id, {
                            imageUrl: e.target.value
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="/decorations/image.png or https://example.com/image.png"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Use transparent PNG images for best results
                      </div>
                    </div>

                    {localImageUrl && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Preview:</div>
                        <img
                          src={localImageUrl}
                          alt="Decoration preview"
                          className="max-w-full h-32 object-contain border border-gray-300 rounded bg-gray-50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">X Position</label>
                    <input
                      type="number"
                      value={Math.round(selectedItem.position.x)}
                      onChange={(e) => onItemUpdate(selectedItem.id, {
                        position: { ...selectedItem.position, x: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Y Position</label>
                    <input
                      type="number"
                      value={Math.round(selectedItem.position.y)}
                      onChange={(e) => onItemUpdate(selectedItem.id, {
                        position: { ...selectedItem.position, y: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rotation: {selectedItem.rotation || 0}°
                  </label>
                  <input
                    type="range"
                    min={(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? "-180" : "-45"}
                    max={(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? "180" : "45"}
                    value={selectedItem.rotation || 0}
                    onChange={(e) => onItemUpdate(selectedItem.id, {
                      rotation: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>

                {/* Scale - for decorations */}
                {(selectedItem.type === 'decoration' || selectedItem.imageUrl) && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Scale: {(selectedItem.scale || 1).toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={selectedItem.scale || 1}
                      onChange={(e) => onItemUpdate(selectedItem.id, {
                        scale: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      You can also drag the handles on the decoration to scale and rotate
                    </div>
                  </div>
                )}

                {/* Month Assignment */}
                <div>
                  <label className="block text-sm font-medium mb-2">Month</label>
                  <input
                    type="month"
                    value={selectedItem.month || ''}
                    onChange={(e) => onItemUpdate(selectedItem.id, {
                      month: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Changing month will move item to different board view
                  </div>
                </div>

                {/* Tags - only for content items, not decorations */}
                {selectedItem.type !== 'decoration' && !selectedItem.imageUrl && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="space-y-2">
                      {/* Tag Selection */}
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
                                console.log('Updating tags:', { currentTags, newTags, tagId: tag.id });
                                onItemUpdate(selectedItem.id, {
                                  tags: newTags,
                                  // Preserve all content when updating tags
                                  content: selectedItem.content
                                });
                              }}
                              className={`px-2 py-1 rounded text-xs transition-colors ${isSelected
                                ? 'text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              style={{
                                backgroundColor: isSelected ? tag.color : undefined
                              }}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Current Tags Display */}
                      {selectedItem.tags && selectedItem.tags.length > 0 && (
                        <div className="text-xs text-gray-600">
                          Selected: {selectedItem.tags.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Color (for notes) */}
                {selectedItem.type === 'note' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="flex gap-2">
                      {['#FFF740', '#FFB6C1', '#B4E7F8', '#BDFFA4', '#ffffff'].map(color => (
                        <button
                          key={color}
                          onClick={() => onItemUpdate(selectedItem.id, { color })}
                          className={`w-8 h-8 rounded border-2 ${selectedItem.color === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-gray-500 text-center py-8">
                Select an item on the board to edit its properties
              </div>
            </div>
          )}

          {/* Item Count */}
          <div className="mt-6 text-sm text-gray-500 text-center">
            {boardData?.items?.length || 0} items • {boardData?.decorations?.length || 0} decorations
          </div>
        </>
      )}

      {activeSection === 'tags' && (
        <TagManager
          tags={boardData?.tags || []}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onUpdateTag={handleUpdateTag}
        />
      )}
    </div>
  );
};

export default EditorPanel;