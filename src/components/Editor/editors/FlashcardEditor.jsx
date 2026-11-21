// Flashcard editor
import React, { useState, useEffect } from 'react';

const FlashcardEditor = ({ item, onUpdate }) => {
  const [localState, setLocalState] = useState({
    front: item.content.front || '',
    back: item.content.back || ''
  });

  useEffect(() => {
    setLocalState({
      front: item.content.front || '',
      back: item.content.back || ''
    });
  }, [item.id]);

  const handleBlur = () => {
    onUpdate(item.id, {
      content: {
        ...item.content,
        front: localState.front,
        back: localState.back
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Front (Question)</label>
        <textarea
          value={localState.front}
          onChange={(e) => setLocalState({ ...localState, front: e.target.value })}
          onBlur={handleBlur}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Back (Answer)</label>
        <textarea
          value={localState.back}
          onChange={(e) => setLocalState({ ...localState, back: e.target.value })}
          onBlur={handleBlur}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default FlashcardEditor;
