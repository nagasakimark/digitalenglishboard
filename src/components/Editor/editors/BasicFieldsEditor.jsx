// Basic title and text fields used by most items
import React from 'react';

const BasicFieldsEditor = ({ item, localState, setLocalState, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
        <input
          type="text"
          value={localState.title}
          onChange={(e) => setLocalState({ ...localState, title: e.target.value })}
          onBlur={() => {
            onUpdate(item.id, {
              content: { 
                ...item.content, 
                title: localState.title,
                text: localState.text, // Ensure text is also preserved from local state
                // Preserve imageUrl if it exists in localState (handles race conditions with ImageEditor)
                ...(localState.imageUrl ? { imageUrl: localState.imageUrl } : {})
              }
            });
          }}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="Enter title..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content</label>
        <textarea
          value={localState.text}
          onChange={(e) => setLocalState({ ...localState, text: e.target.value })}
          onBlur={() => {
            onUpdate(item.id, {
              content: { 
                ...item.content, 
                title: localState.title, // Ensure title is also preserved from local state
                text: localState.text,
                // Preserve imageUrl if it exists in localState
                ...(localState.imageUrl ? { imageUrl: localState.imageUrl } : {})
              }
            });
          }}
          rows={4}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          placeholder="Enter content..."
        />
      </div>
    </div>
  );
};

export default BasicFieldsEditor;
