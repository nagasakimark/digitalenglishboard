import { addPendingFile } from '../../../utils/publish';
// Audio note editor
import React from 'react';

const AudioNoteEditor = ({ item, onUpdate }) => {
  return (
    <div className="space-y-3" style={{ display: 'contents' }}>
      <div>
        <label className="block text-sm font-medium mb-2">Upload Audio File</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const fileName = `audio-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
              const relativePath = `assets/audio/${fileName}`;
              // Uploaded to the website when you press Publish
              addPendingFile(relativePath, file);

              // Update the item with the relative path
              onUpdate(item.id, {
                content: { ...item.content, audioUrl: relativePath }
              });
            }
          }}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="text-xs text-gray-500 mt-1">
          Pick an audio file — it is uploaded when you press Publish
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Audio File Path (Manual)</label>
        <input
          type="text"
          value={item.content.audioUrl || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            // Update immediately for file paths (no typing delay needed)
            onUpdate(item.id, {
              content: { ...item.content, audioUrl: newValue }
            });
          }}
          placeholder="/audio/filename.mp3"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <AudioDescriptionField item={item} onUpdate={onUpdate} />
    </div>
  );
};

// Separate component for description to manage local state
const AudioDescriptionField = ({ item, onUpdate }) => {
  const [description, setDescription] = React.useState(item.content.description || '');

  React.useEffect(() => {
    setDescription(item.content.description || '');
  }, [item.id]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => {
          onUpdate(item.id, {
            content: { ...item.content, description }
          });
        }}
        rows={3}
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  );
};

export default AudioNoteEditor;
