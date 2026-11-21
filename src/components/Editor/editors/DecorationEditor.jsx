// Decoration editor
import React from 'react';
import { Upload } from 'lucide-react';
import { DECORATION_PACKS } from '../../../utils/decorationPacks';

const DecorationEditor = ({ item, localState, setLocalState, onUpdate }) => {
  return (
    <div className="space-y-3">
      {DECORATION_PACKS.map((pack) => (
        <div key={pack.name}>
          <label className="block text-sm font-medium mb-2">{pack.name} decorations</label>
          <div className="grid grid-cols-4 gap-2">
            {pack.items.map((d) => {
              const url = `decorations/${d.file}`;
              return (
                <button
                  key={d.file}
                  title={d.file.split('/').pop().replace('.svg', '')}
                  onClick={() => {
                    setLocalState({ ...localState, imageUrl: url });
                    onUpdate(item.id, { imageUrl: url, aspect: d.aspect || 1, ...(d.scale ? { scale: d.scale } : {}) });
                  }}
                  className={`aspect-square rounded-lg p-1 border ${localState.imageUrl === url ? 'border-blue-500 bg-blue-50' : 'border-amber-100 bg-amber-50 hover:bg-amber-100'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-contain" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-2">Upload Local Image</label>
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
              }

              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target.result;
                setLocalState({ ...localState, imageUrl: dataUrl });
                onUpdate(item.id, { imageUrl: dataUrl });
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <div className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-purple-700 transition-colors">
            <Upload size={16} />
            Choose Image File
          </div>
        </label>
        <div className="text-xs text-gray-500 mt-1">
          Upload an image to use as decoration. Image will be embedded in the board data.
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image URL or Path</label>
        <input
          type="text"
          value={localState.imageUrl}
          onChange={(e) => {
            setLocalState({ ...localState, imageUrl: e.target.value });
            onUpdate(item.id, { imageUrl: e.target.value });
          }}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="/decorations/image.png or https://example.com/image.png"
        />
        <div className="text-xs text-gray-500 mt-1">
          Use transparent PNG images for best results
        </div>
      </div>

      {localState.imageUrl && localState.imageUrl.startsWith('data:image') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mt-3">
          <strong>Performance Tip:</strong> This decoration is embedded directly. 
          Use the <strong>Tools</strong> menu to extract it.
        </div>
      )}

      {localState.imageUrl && (
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Preview:</div>
          <img
            src={localState.imageUrl}
            alt="Decoration preview"
            className="max-w-full h-32 object-contain border border-gray-300 rounded bg-gray-50"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DecorationEditor;
