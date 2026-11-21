import React, { useState } from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarGrid = ({ availableMonths, selectedMonth, onMonthSelect, onClose }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthData = (monthIndex) => {
    const monthStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const hasContent = availableMonths.includes(monthStr);
    const isSelected = selectedMonth === monthStr;
    
    return { monthStr, hasContent, isSelected };
  };

  return (
    <div className="calendar-grid bg-white rounded-lg shadow-lg border-2 border-wood-dark p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentYear(prev => prev - 1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-handwriting text-lg text-wood-dark">{currentYear}</h3>
        <button
          onClick={() => setCurrentYear(prev => prev + 1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl ml-2"
        >
          ×
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => {
          const { monthStr, hasContent, isSelected } = getMonthData(index);
          
          return (
            <button
              key={month}
              onClick={() => {
                onMonthSelect(monthStr);
                onClose();
              }}
              className={`
                p-2 rounded text-sm font-medium transition-all
                ${isSelected 
                  ? 'bg-wood-dark text-white' 
                  : hasContent 
                    ? 'bg-cork-light text-wood-dark hover:bg-cork-dark' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }
                hover:scale-105
              `}
            >
              <div className="font-handwriting text-xs">
                {month.slice(0, 3)}
              </div>
              {hasContent && (
                <div className="text-xs mt-1">
                  📌
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        📌 = has content
      </div>
    </div>
  );
};

export default CalendarGrid;