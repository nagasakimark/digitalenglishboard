import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const TagManager = ({ tags, onAddTag, onRemoveTag, onUpdateTag }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState({ label: '', color: '#ff6b6b' });
  const [editingTag, setEditingTag] = useState(null);

  const predefinedColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#9b59b6', '#e67e22', '#f39c12', '#e74c3c',
    '#3498db', '#2ecc71', '#f1c40f', '#8e44ad'
  ];

  const handleAddTag = () => {
    if (!newTag.label.trim()) return;
    
    const tag = {
      id: newTag.label.toLowerCase().replace(/\s+/g, '-'),
      label: newTag.label,
      color: newTag.color
    };
    
    onAddTag(tag);
    setNewTag({ label: '', color: '#ff6b6b' });
    setIsAdding(false);
  };

  const handleUpdateTag = (tagId, updates) => {
    onUpdateTag(tagId, updates);
    setEditingTag(null);
  };

  return (
    <div className="tag-manager mb-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Manage Tags</h3>
          <p className="text-xs text-gray-500 mt-0.5">Organize your board items</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 hover:shadow transition-all"
        >
          <Plus size={16} />
          Add Tag
        </button>
      </div>

      {/* Add New Tag Form */}
      {isAdding && (
        <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tag Name</label>
              <input
                type="text"
                value={newTag.label}
                onChange={(e) => setNewTag(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter tag name"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTag(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      newTag.color === color ? 'border-gray-800 scale-110 shadow-sm' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddTag}
                disabled={!newTag.label.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Add Tag
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewTag({ label: '', color: '#ff6b6b' });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Tags */}
      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {editingTag === tag.id ? (
              // Edit mode
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={tag.label}
                  onChange={(e) => handleUpdateTag(tag.id, { label: e.target.value })}
                  className="flex-1 p-1 border border-gray-300 rounded text-sm"
                />
                <div className="flex gap-1">
                  {predefinedColors.slice(0, 6).map(color => (
                    <button
                      key={color}
                      onClick={() => handleUpdateTag(tag.id, { color })}
                      className={`w-4 h-4 rounded border ${
                        tag.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setEditingTag(null)}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  ✓
                </button>
              </div>
            ) : (
              // View mode
              <>
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 text-sm">{tag.label}</span>
                <button
                  onClick={() => setEditingTag(tag.id)}
                  className="text-gray-600 hover:text-gray-800 p-1"
                  title="Edit tag"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => onRemoveTag(tag.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete tag"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {tags.length === 0 && !isAdding && (
        <div className="text-sm text-gray-500 text-center py-4">
          No tags created yet. Click "Add Tag" to create your first tag.
        </div>
      )}
    </div>
  );
};

export default TagManager;