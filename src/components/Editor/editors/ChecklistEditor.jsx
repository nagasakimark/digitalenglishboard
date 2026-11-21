// Checklist editor
import React, { useState, useEffect } from 'react';

const ChecklistEditor = ({ item, onUpdate }) => {
  const checklist = item.content.checklist || [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Checklist Items</label>
        {checklist.map((checkItem, index) => (
          <ChecklistItem
            key={index}
            checkItem={checkItem}
            index={index}
            checklist={checklist}
            item={item}
            onUpdate={onUpdate}
          />
        ))}
        <button
          onClick={() => {
            const newChecklist = [...checklist, { text: 'New item', completed: false }];
            onUpdate(item.id, {
              content: { ...item.content, checklist: newChecklist }
            });
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Item
        </button>
      </div>
    </div>
  );
};

// Separate component for each checklist item to manage local state
const ChecklistItem = ({ checkItem, index, checklist, item, onUpdate }) => {
  const [text, setText] = useState(checkItem.text);

  useEffect(() => {
    setText(checkItem.text);
  }, [checkItem.text]);

  const handleBlur = () => {
    const newChecklist = [...checklist];
    newChecklist[index] = { ...checkItem, text };
    onUpdate(item.id, {
      content: { ...item.content, checklist: newChecklist }
    });
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <input
        type="checkbox"
        checked={checkItem.completed}
        onChange={(e) => {
          const newChecklist = [...checklist];
          newChecklist[index] = { ...checkItem, completed: e.target.checked };
          onUpdate(item.id, {
            content: { ...item.content, checklist: newChecklist }
          });
        }}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        className="flex-1 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={() => {
          const newChecklist = checklist.filter((_, i) => i !== index);
          onUpdate(item.id, {
            content: { ...item.content, checklist: newChecklist }
          });
        }}
        className="text-red-600 hover:text-red-800"
      >
        ✕
      </button>
    </div>
  );
};

export default ChecklistEditor;
