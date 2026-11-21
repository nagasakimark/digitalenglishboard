// Quote editor
import React from 'react';

const QuoteEditor = ({ item, localState, setLocalState, onUpdate }) => {
  const handleBlur = () => {
    onUpdate(item.id, {
      content: {
        ...item.content,
        quote: localState.quote,
        author: localState.author,
        source: localState.source
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Quote</label>
        <textarea
          value={localState.quote}
          onChange={(e) => setLocalState({ ...localState, quote: e.target.value })}
          onBlur={handleBlur}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Author</label>
        <input
          type="text"
          value={localState.author}
          onChange={(e) => setLocalState({ ...localState, author: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Source</label>
        <input
          type="text"
          value={localState.source}
          onChange={(e) => setLocalState({ ...localState, source: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default QuoteEditor;
