// Image upload editor
import React from 'react';
import { Upload, Layout, AlignLeft, AlignRight, Image as ImageIcon } from 'lucide-react';

const ImageEditor = ({ item, localState, setLocalState, onUpdate }) => {
  const currentLayout = item.layout || 'polaroid';

  return (
    <div className="space-y-4">
      {/* Layout Selector */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Layout Style</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onUpdate(item.id, { layout: 'polaroid' })}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
              currentLayout === 'polaroid' 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ImageIcon size={20} />
            <span className="text-[10px] font-medium">Polaroid</span>
          </button>
          <button
            onClick={() => onUpdate(item.id, { layout: 'poster-left' })}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
              currentLayout === 'poster-left' 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlignLeft size={20} />
            <span className="text-[10px] font-medium">Left Img</span>
          </button>
          <button
            onClick={() => onUpdate(item.id, { layout: 'poster-right' })}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
              currentLayout === 'poster-right' 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlignRight size={20} />
            <span className="text-[10px] font-medium">Right Img</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Image</label>
        <label className="block group">
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
                onUpdate(item.id, {
                  content: { ...item.content, imageUrl: dataUrl }
                });
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 border-dashed px-4 py-6 rounded-xl cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all group-hover:shadow-sm">
            <Upload size={20} />
            <span className="font-medium">Choose Image File</span>
          </div>
        </label>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Upload an image to embed in the board
        </div>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
          <span className="bg-white px-2 text-gray-400">OR</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image URL</label>
        <input
          type="url"
          value={localState.imageUrl}
          onChange={(e) => {
            setLocalState({ ...localState, imageUrl: e.target.value });
            onUpdate(item.id, {
              content: { ...item.content, imageUrl: e.target.value }
            });
          }}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {localState.imageUrl && localState.imageUrl.startsWith('data:image') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mt-3">
          <strong>Performance Tip:</strong> This image is embedded directly. 
          Use the <strong>Tools</strong> menu (wrench icon) in the dock to extract it to a file for faster loading.
        </div>
      )}

      {localState.imageUrl && (
        <div className="mt-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</div>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl">
            <img
              src={localState.imageUrl}
              alt="Preview"
              className="w-full h-40 object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Card Size</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="150"
            max="500"
            step="10"
            value={item.width || 180}
            onChange={(e) => onUpdate(item.id, { width: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 min-w-[50px] text-center">
            {item.width || 180}px
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
