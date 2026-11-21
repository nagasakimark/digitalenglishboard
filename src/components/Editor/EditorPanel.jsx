import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateLinkPreview } from '../../utils/linkPreviewHelper';
import { getMonthData, setMonthData } from '../../utils/dataStructure';
import TagManager from './TagManager';
import ItemEditor from './ItemEditor';
import MonthCustomizationEditor from './editors/MonthCustomizationEditor';

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
  onUpdateBoardData,
  topSlot
}) => {
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
    source: '',
    videoUrl: '',
    questions: []
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
        source: selectedItem.content?.source || '',
        videoUrl: selectedItem.content?.videoUrl || '',
        questions: selectedItem.content?.questions || []
      });
    } else {
      setLocalState({
        title: '',
        text: '',
        url: '',
        imageUrl: '',
        quote: '',
        author: '',
        source: '',
        videoUrl: '',
        questions: []
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
      <div className="w-12 h-full bg-white/50 backdrop-blur-sm flex items-center justify-center border-l border-white/20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-gray-600 hover:bg-white/50 rounded-full transition-all"
          title="Expand editor panel"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="editor-panel h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="border-b border-gray-200/50 pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Editor</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
            title="Collapse panel"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {selectedMonth && (
          <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block">
            {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex mt-6 p-1 bg-gray-100/80 rounded-xl">
          {['items', 'tags', 'custom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                activeSection === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'items' && (
        <>
          {topSlot}

          {/* Selected Item Editor */}
          {selectedItem ? (
            <div key={selectedItem.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Properties</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? 'Decoration' : (selectedItem.content?.title || 'Untitled Item')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (selectedItem.type === 'decoration' || selectedItem.imageUrl) {
                      onRemoveDecoration(selectedItem.id);
                    } else {
                      onItemDelete(selectedItem.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete item"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Use new ItemEditor component */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <ItemEditor
                  item={selectedItem}
                  onUpdate={onItemUpdate}
                  localState={localState}
                  setLocalState={setLocalState}
                  onGeneratePreview={handleGeneratePreview}
                />
              </div>

              {/* Layer Control */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Layering</label>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      const maxZ = Math.max(...(boardData?.items || []).map(i => i.zIndex || 1), ...(boardData?.decorations || []).map(d => d.zIndex || 0), 0);
                      onItemUpdate(selectedItem.id, { zIndex: maxZ + 1 });
                    }}
                    className="flex-1 bg-white text-gray-700 py-2 px-3 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                    title="Bring to Front"
                  >
                    <span className="text-lg leading-none">↑</span> Front
                  </button>
                  <button
                    onClick={() => {
                      const minZ = Math.min(...(boardData?.items || []).map(i => i.zIndex || 1), ...(boardData?.decorations || []).map(d => d.zIndex || 0), 0);
                      onItemUpdate(selectedItem.id, { zIndex: minZ - 1 });
                    }}
                    className="flex-1 text-gray-600 hover:bg-white/50 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    title="Send to Back"
                  >
                    <span className="text-lg leading-none">↓</span> Back
                  </button>
                </div>
              </div>

              {/* Rotation Control */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rotation</label>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{Math.round(selectedItem.rotation || 0)}°</span>
                </div>
                <input
                  type="range"
                  min={(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? "-180" : "-45"}
                  max={(selectedItem.type === 'decoration' || selectedItem.imageUrl) ? "180" : "45"}
                  value={selectedItem.rotation || 0}
                  onChange={(e) => {
                    const newRotation = parseFloat(e.target.value);
                    onItemUpdate(selectedItem.id, { rotation: newRotation });
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {(selectedItem.type === 'decoration' || selectedItem.imageUrl) && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scale</label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{(selectedItem.scale || 1).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={selectedItem.scale || 1}
                    onChange={(e) => {
                      const newScale = parseFloat(e.target.value);
                      onItemUpdate(selectedItem.id, { scale: newScale });
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}

              {/* Tags */}
              {selectedItem.type !== 'decoration' && !selectedItem.imageUrl && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                            ? 'text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-gray-300" size={32} />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">No Item Selected</h3>
              <p className="text-sm text-gray-500 max-w-[200px]">Select an item on the board to edit its properties</p>
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

      {activeSection === 'custom' && (
        <MonthCustomizationEditor
          monthData={getMonthData(boardData, selectedMonth)}
          onUpdate={(updates) => {
            const monthData = getMonthData(boardData, selectedMonth);
            const newMonthData = { ...monthData, ...updates };
            const newBoardData = setMonthData(boardData, selectedMonth, newMonthData);
            onUpdateBoardData(newBoardData);
          }}
        />
      )}
    </div>
  );
};

export default EditorPanel;
