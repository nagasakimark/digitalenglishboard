import React from 'react';
import { PenTool, Type } from 'lucide-react';

const MadLibsEditor = ({ item, onUpdate }) => {
  const handleChange = (field, value) => {
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
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <PenTool size={16} />
          Title
        </label>
        <input
          type="text"
          value={item.content?.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="My Crazy Story"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Type size={16} />
          Story Text
        </label>
        <div className="text-xs text-gray-500 mb-2 bg-blue-50 p-2 rounded border border-blue-100">
          Use square brackets for blanks. Example:<br/>
          "The [adjective] dog [verb] over the fence."
        </div>
        <textarea
          value={item.content?.text || ''}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Once upon a time, there was a [adjective] princess..."
          rows={6}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default MadLibsEditor;
