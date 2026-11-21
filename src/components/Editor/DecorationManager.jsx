import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

const DecorationManager = ({ boardData, onAddDecoration, onRemoveDecoration, onUpdateDecoration }) => {
  const [newDecoration, setNewDecoration] = useState({
    imageUrl: '',
    position: { x: 100, y: 100 },
    rotation: 0,
    scale: 1.0
  });

  const handleAddDecoration = () => {
    if (!newDecoration.imageUrl.trim()) return;

    const decoration = {
      id: `deco-${Date.now()}`,
      imageUrl: newDecoration.imageUrl,
      position: { x: newDecoration.position.x, y: newDecoration.position.y },
      rotation: newDecoration.rotation,
      scale: newDecoration.scale,
      zIndex: 0
    };

    onAddDecoration(decoration);
    
    // Reset form
    setNewDecoration({
      imageUrl: '',
      position: { x: 100, y: 100 },
      rotation: 0,
      scale: 1.0
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // In a real app, you'd upload this to a server or convert to base64
    // For now, we'll just show how it would work
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewDecoration(prev => ({
        ...prev,
        imageUrl: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="decoration-manager animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Board Decorations</h3>
        <p className="text-xs text-gray-500 mt-0.5">Add visual elements to your board</p>
      </div>
      
      {/* Add New Decoration */}
      <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
          Add Decoration
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image URL or Upload</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newDecoration.imageUrl}
                onChange={(e) => setNewDecoration(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.png"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <label className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-900 transition-all shadow-sm hover:shadow text-sm font-medium">
                <Upload size={16} />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">X Position</label>
              <input
                type="number"
                value={newDecoration.position.x}
                onChange={(e) => setNewDecoration(prev => ({
                  ...prev,
                  position: { ...prev.position, x: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Y Position</label>
              <input
                type="number"
                value={newDecoration.position.y}
                onChange={(e) => setNewDecoration(prev => ({
                  ...prev,
                  position: { ...prev.position, y: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rotation</label>
                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{newDecoration.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={newDecoration.rotation}
                onChange={(e) => setNewDecoration(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scale</label>
                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{newDecoration.scale}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={newDecoration.scale}
                onChange={(e) => setNewDecoration(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <button
            onClick={handleAddDecoration}
            disabled={!newDecoration.imageUrl.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Plus size={18} />
            Add Decoration
          </button>
        </div>
      </div>

      {/* Existing Decorations */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
          <span>Current Decorations</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{boardData?.decorations?.length || 0}</span>
        </h4>
        
        {boardData?.decorations?.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {boardData.decorations.map((decoration, index) => (
              <div key={decoration.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <img
                    src={decoration.imageUrl}
                    alt={`Decoration ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiA4VjI0TTggMTZIMjQiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">Decoration #{index + 1}</div>
                  <div className="text-[10px] text-gray-500 flex gap-2 mt-0.5">
                    <span>Pos: {decoration.position.x}, {decoration.position.y}</span>
                    <span>Rot: {decoration.rotation}°</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveDecoration(decoration.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove decoration"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
              <Plus className="text-gray-300" size={20} />
            </div>
            <p className="text-sm text-gray-500">No decorations added yet</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
        <div className="text-xl">💡</div>
        <p className="text-xs text-blue-800 leading-relaxed">
          <span className="font-bold">Pro Tip:</span> Use transparent PNG images for best results. Decorations always appear behind content items to create depth.

      </div>
    </div>
  );
};

export default DecorationManager;