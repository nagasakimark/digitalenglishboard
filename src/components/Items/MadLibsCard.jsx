import { awardSticker } from '../../utils/stickers';
import React, { useState, useEffect } from 'react';
import { PenTool, RefreshCw } from 'lucide-react';

const MadLibsCard = ({ item, isEditable }) => {
  const { content, width = 300 } = item;
  const [inputs, setInputs] = useState({});
  const [story, setStory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  // Parse the text to find placeholders like [noun], [verb], etc.
  useEffect(() => {
    if (!content.text) return;

    const parts = content.text.split(/(\[[^\]]+\])/g);
    setStory(parts);
    
    // Initialize inputs
    const initialInputs = {};
    parts.forEach((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        initialInputs[index] = '';
      }
    });
    setInputs(initialInputs);
    setIsComplete(false);
  }, [content.text]);

  const handleInputChange = (index, value) => {
    setInputs(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const checkCompletion = () => {
    const allFilled = Object.values(inputs).every(val => val.trim().length > 0);
    if (allFilled) {
      setIsComplete(true);
      awardSticker(item);
    }
  };

  const reset = () => {
    const newInputs = {};
    Object.keys(inputs).forEach(key => newInputs[key] = '');
    setInputs(newInputs);
    setIsComplete(false);
  };

  return (
    <div 
      className="mad-libs-card bg-yellow-50 p-6 rounded-xl shadow-lg border-2 border-yellow-200"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center justify-between mb-4 border-b border-yellow-200 pb-2">
        <h3 className="font-bold text-yellow-800 flex items-center gap-2">
          <PenTool size={18} />
          {content.title || 'Mad Libs'}
        </h3>
        {isComplete && (
          <button 
            onClick={reset}
            className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100"
            title="Reset"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2 leading-relaxed text-gray-800">
        {isComplete ? (
          <div className="animate-in fade-in duration-500">
            {story.map((part, index) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                return (
                  <span key={index} className="font-bold text-blue-600 border-b-2 border-blue-200 px-1 mx-0.5">
                    {inputs[index]}
                  </span>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 italic mb-4">Fill in the blanks to reveal the story!</p>
            {story.map((part, index) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                const label = part.slice(1, -1); // Remove [ and ]
                return (
                  <div key={index} className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
                    <input
                      type="text"
                      value={inputs[index] || ''}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                      placeholder={`Enter a ${label}...`}
                    />
                  </div>
                );
              }
              return null;
            })}
            
            <button
              onClick={checkCompletion}
              disabled={!Object.values(inputs).every(val => val.trim().length > 0)}
              className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reveal Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MadLibsCard;
