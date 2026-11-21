import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { getAllEffects, getEffectById } from '../../../utils/monthThemes';

const MonthCustomizationEditor = ({ monthData, onUpdate }) => {
  const [selectedEffects, setSelectedEffects] = useState(monthData.effectIds || []);
  const [backgroundImage, setBackgroundImage] = useState(monthData.backgroundImage || '');
  const [borderImage, setBorderImage] = useState(monthData.borderImage || '');

  const effects = getAllEffects().filter(e => e.id !== 'none');

  const handleEffectToggle = (effectId) => {
    const newEffects = selectedEffects.includes(effectId)
      ? selectedEffects.filter(id => id !== effectId)
      : [...selectedEffects, effectId];
    
    setSelectedEffects(newEffects);
    
    // Combine HTML and CSS from all selected effects
    const combinedHtml = newEffects.map(id => getEffectById(id).html).join('\n');
    const combinedCss = newEffects.map(id => getEffectById(id).css).join('\n\n');
    
    onUpdate({
      effectIds: newEffects,
      customHtml: combinedHtml,
      customCss: combinedCss
    });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      if (type === 'background') {
        setBackgroundImage(base64);
        onUpdate({ backgroundImage: base64 });
      } else if (type === 'border') {
        setBorderImage(base64);
        onUpdate({ borderImage: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (type) => {
    if (type === 'background') {
      setBackgroundImage('');
      onUpdate({ backgroundImage: '' });
    } else if (type === 'border') {
      setBorderImage('');
      onUpdate({ borderImage: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Month Customization</h3>
        <p className="text-sm text-gray-600">
          Customize the appearance and effects for this month.
        </p>
      </div>

      {/* Visual Effects Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Visual Effects (select multiple)
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
          {effects.map((effect) => {
            const isSelected = selectedEffects.includes(effect.id);
            return (
              <label
                key={effect.id}
                className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleEffectToggle(effect.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{effect.name}</div>
                  <div className="text-xs text-gray-500">{effect.description}</div>
                </div>
              </label>
            );
          })}
        </div>
        {selectedEffects.length > 0 && (
          <p className="text-xs text-blue-600">
            {selectedEffects.length} effect{selectedEffects.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Background Image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Background Image
        </label>
        {backgroundImage ? (
          <div className="space-y-2">
            <div className="relative w-full h-32 border rounded overflow-hidden">
              <img
                src={backgroundImage}
                alt="Background preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => handleClearImage('background')}
              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Remove Background
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200">
            <Upload size={16} />
            Upload Background
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'background')}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-gray-500">
          This will replace the cork board texture
        </p>
      </div>

      {/* Border Image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Border/Frame Image
        </label>
        {borderImage ? (
          <div className="space-y-2">
            <div className="relative w-full h-32 border rounded overflow-hidden">
              <img
                src={borderImage}
                alt="Border preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => handleClearImage('border')}
              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Remove Border
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200">
            <Upload size={16} />
            Upload Border
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'border')}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-gray-500">
          Add a decorative border around the board
        </p>
      </div>

      {/* Info Box */}
      <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
        💡 Tip: Effects are predefined and safe to use. Background and border images are stored as base64.
      </div>
    </div>
  );
};

export default MonthCustomizationEditor;
