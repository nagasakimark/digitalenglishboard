// Progress tracker editor
import React, { useState, useEffect } from 'react';

const ProgressEditor = ({ item, onUpdate }) => {
  const [localState, setLocalState] = useState({
    currentValue: item.content.currentValue || item.content.current || '',
    maxValue: item.content.maxValue || item.content.total || '',
    unit: item.content.unit || '',
    description: item.content.description || ''
  });

  useEffect(() => {
    setLocalState({
      currentValue: item.content.currentValue || item.content.current || '',
      maxValue: item.content.maxValue || item.content.total || '',
      unit: item.content.unit || '',
      description: item.content.description || ''
    });
  }, [item.id]);

  const handleBlur = () => {
    onUpdate(item.id, {
      content: {
        ...item.content,
        currentValue: parseInt(localState.currentValue) || 0,
        current: parseInt(localState.currentValue) || 0,
        maxValue: parseInt(localState.maxValue) || 0,
        total: parseInt(localState.maxValue) || 0,
        unit: localState.unit,
        description: localState.description
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Current Value</label>
        <input
          type="number"
          value={localState.currentValue}
          onChange={(e) => setLocalState({ ...localState, currentValue: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Maximum Value</label>
        <input
          type="number"
          value={localState.maxValue}
          onChange={(e) => setLocalState({ ...localState, maxValue: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Unit</label>
        <input
          type="text"
          value={localState.unit}
          onChange={(e) => setLocalState({ ...localState, unit: e.target.value })}
          onBlur={handleBlur}
          placeholder="e.g., tasks, pages, days"
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

export default ProgressEditor;
