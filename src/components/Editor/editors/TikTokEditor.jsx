import React from 'react';

const TikTokEditor = ({ item, localState, setLocalState, onUpdate }) => {
  const handleChange = (field, value) => {
    const newState = { ...localState, [field]: value };
    setLocalState(newState);
    
    onUpdate(item.id, {
      content: {
        ...item.content,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={localState.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Video title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">TikTok URL</label>
        <input
          type="text"
          value={localState.videoUrl || ''}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="https://www.tiktok.com/@user/video/..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste the full TikTok video URL here.
        </p>
      </div>

      {/* Preview info */}
      {localState.videoUrl && (
        <div className="bg-pink-50 p-3 rounded text-sm">
          <p className="font-medium text-pink-900">Preview</p>
          <p className="text-pink-700 text-xs mt-1">
            TikTok videos are embedded in a vertical format.
          </p>
        </div>
      )}
    </div>
  );
};

export default TikTokEditor;
