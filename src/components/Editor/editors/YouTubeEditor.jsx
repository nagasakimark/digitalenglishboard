import React from 'react';

const YouTubeEditor = ({ item, localState, setLocalState, onUpdate }) => {
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
        <label className="block text-sm font-medium mb-2">YouTube URL or Video ID</label>
        <input
          type="text"
          value={localState.videoUrl || ''}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepts: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..., or just the video ID
        </p>
      </div>

      {/* Preview info */}
      {localState.videoUrl && (
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p className="font-medium text-blue-900">Preview</p>
          <p className="text-blue-700 text-xs mt-1">
            Standard videos use 16:9 aspect ratio. Shorts use 9:16.
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeEditor;
