import React from 'react';
import { format, parseISO } from 'date-fns';

const MonthIndicator = ({ selectedMonth, itemCount }) => {
  const monthName = selectedMonth ? format(parseISO(selectedMonth + '-01'), 'MMMM yyyy') : 'All Items';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 border-2 border-wood-dark">
      <div className="text-center">
        <div className="text-lg font-handwriting text-wood-dark">
          {monthName}
        </div>
        <div className="text-sm text-gray-600">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  );
};

export default MonthIndicator;