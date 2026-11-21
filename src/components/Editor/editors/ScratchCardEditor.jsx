import React from 'react';
import { Upload } from 'lucide-react';

const ScratchCardEditor = ({ item, localState, setLocalState, onUpdate }) => {
  return (
    <div className="space-y-4">
      {/* Hidden Content Section */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Hidden Content (Prize)</h3>
        
        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hidden Text</label>
          <input
            type="text"
            value={localState.text}
            onChange={(e) => {
              setLocalState({ ...localState, text: e.target.value });
              onUpdate(item.id, { content: { ...item.content, text: e.target.value } });
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            placeholder="e.g., You found a secret!"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hidden Image</label>
          <label className="block group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const dataUrl = event.target.result;
                  setLocalState({ ...localState, imageUrl: dataUrl });
                  onUpdate(item.id, { content: { ...item.content, imageUrl: dataUrl } });
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 border-dashed px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-100">
              <Upload size={16} />
              <span className="text-xs font-medium">Upload Hidden Image</span>
            </div>
          </label>
        </div>
      </div>

      {/* Scratch Layer Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Scratch Layer (Cover)</h3>
        
        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Color</label>
          <div className="flex gap-2">
            {['#C0C0C0', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'].map(color => (
              <button
                key={color}
                onClick={() => onUpdate(item.id, { content: { ...item.content, scratchColor: color, scratchImage: null } })}
                className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Or Cover Image</label>
          <label className="block group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const dataUrl = event.target.result;
                  onUpdate(item.id, { content: { ...item.content, scratchImage: dataUrl } });
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 border-dashed px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100">
              <Upload size={16} />
              <span className="text-xs font-medium">Upload Cover Image</span>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Card Width</label>
        <input
          type="range"
          min="200"
          max="600"
          value={item.width || 300}
          onChange={(e) => onUpdate(item.id, { width: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ScratchCardEditor;
