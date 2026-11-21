// Countdown timer editor
import React, { useState, useEffect } from 'react';

const CountdownEditor = ({ item, onUpdate }) => {
  const [localState, setLocalState] = useState({
    title: item.content.title || 'Countdown',
    targetDate: item.content.targetDate ? item.content.targetDate.slice(0, 16) : '',
    description: item.content.description || ''
  });

  useEffect(() => {
    setLocalState({
      title: item.content.title || 'Countdown',
      targetDate: item.content.targetDate ? item.content.targetDate.slice(0, 16) : '',
      description: item.content.description || ''
    });
  }, [item.id]);

  const handleBlur = () => {
    onUpdate(item.id, {
      content: {
        ...item.content,
        title: localState.title,
        targetDate: localState.targetDate ? localState.targetDate + ':00.000Z' : '',
        description: localState.description
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={localState.title}
          onChange={(e) => setLocalState({ ...localState, title: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Event Name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Target Date & Time</label>
        <input
          type="datetime-local"
          value={localState.targetDate}
          onChange={(e) => setLocalState({ ...localState, targetDate: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          value={localState.description}
          onChange={(e) => setLocalState({ ...localState, description: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default CountdownEditor;
