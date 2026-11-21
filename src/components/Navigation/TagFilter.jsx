import React from 'react';
import { X } from 'lucide-react';

const TagFilter = ({ tags, activeFilters, onTagToggle }) => {
  const clearAllFilters = () => {
    activeFilters.forEach(filterId => onTagToggle(filterId));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-wood-dark max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-handwriting text-lg text-wood-dark">Filter by Tags</h3>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {tags.map((tag) => {
          const isActive = activeFilters.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'text-white shadow-md transform scale-105' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }
              `}
              style={{
                backgroundColor: isActive ? tag.color : undefined,
              }}
            >
              <span className="flex items-center justify-between">
                {tag.label}
                {isActive && (
                  <span className="bg-white bg-opacity-30 px-2 py-1 rounded text-xs">
                    Active
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      
      {tags.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4">
          No tags available
        </div>
      )}
    </div>
  );
};

export default TagFilter;