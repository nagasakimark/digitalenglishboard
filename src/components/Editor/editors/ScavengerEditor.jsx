import React from 'react';
import { Upload } from 'lucide-react';

const ScavengerEditor = ({ item, localState, setLocalState, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Icon Image</label>
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
                onUpdate(item.id, {
                  content: { ...item.content, imageUrl: dataUrl }
                });
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 border-dashed px-4 py-4 rounded-xl cursor-pointer hover:bg-yellow-100 transition-all">
            <Upload size={20} />
            <span className="font-medium">Upload Icon</span>
          </div>
        </label>
        <div className="text-xs text-gray-500 mt-2">
          Upload a small transparent PNG (e.g., star, elf, coin).
        </div>
      </div>

      {localState.imageUrl && (
        <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
          <img src={localState.imageUrl} alt="Preview" className="w-16 h-16 object-contain" />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Size</label>
        <input
          type="range"
          min="30"
          max="150"
          value={item.width || 50}
          onChange={(e) => onUpdate(item.id, { width: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-right text-xs text-gray-500">{item.width || 50}px</div>
      </div>
    </div>
  );
};

export default ScavengerEditor;
