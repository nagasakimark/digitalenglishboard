// Link preview editor
import React from 'react';

const LinkEditor = ({ item, localState, setLocalState, onUpdate, onGeneratePreview }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={localState.url}
          onChange={(e) => setLocalState({ ...localState, url: e.target.value })}
          onBlur={() => {
            // Only update if URL has changed to avoid clearing metadata unnecessarily
            if (localState.url !== item.content.url) {
              onUpdate(item.id, {
                content: { ...item.content, url: localState.url, metadata: undefined }
              });
            }
          }}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="https://example.com or https://youtube.com/watch?v=..."
        />
        <button
          onClick={onGeneratePreview}
          disabled={!localState.url || !localState.url.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Preview
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <span className="text-blue-500">ℹ️</span> Click "Generate Preview" to fetch thumbnails and metadata
      </div>
    </div>
  );
};

export default LinkEditor;
