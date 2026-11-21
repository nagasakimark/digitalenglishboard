import React from 'react';
import { Calendar, Lock, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const TimeLockedEditor = ({ content, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...content,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Calendar size={16} />
          Unlock Date & Time
        </label>
        <input
          type="datetime-local"
          value={content.unlockDate || ''}
          onChange={(e) => handleChange('unlockDate', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Content will be hidden until this date.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Lock size={16} />
          Locked Message
        </label>
        <input
          type="text"
          value={content.lockedText || ''}
          onChange={(e) => handleChange('lockedText', e.target.value)}
          placeholder="e.g. Wait for Christmas!"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Unlocked Content</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Title when unlocked"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Type size={14} />
              Message
            </label>
            <textarea
              value={content.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Secret message..."
              rows={3}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
              <ImageIcon size={14} />
              Image URL (Optional)
            </label>
            <input
              type="text"
              value={content.imageUrl || ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
              <LinkIcon size={14} />
              Link URL (Optional)
            </label>
            <input
              type="text"
              value={content.url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeLockedEditor;
