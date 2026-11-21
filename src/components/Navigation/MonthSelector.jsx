import React from 'react';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import { useMonthFilter } from '../../hooks/useMonthFilter';

const MonthSelector = ({ 
  selectedMonth, 
  onMonthChange, 
  showCalendar, 
  onToggleCalendar,
  boardData,
  months // optional: only these months can be visited (student board)
}) => {
  const currentDate = parseISO(selectedMonth + '-01');
  const { availableMonths: guessedMonths } = useMonthFilter(boardData?.items || [], selectedMonth);
  const restricted = Array.isArray(months) && months.length > 0;
  const availableMonths = restricted ? months : guessedMonths;
  const prevAvailable = restricted ? [...months].reverse().find((m) => m < selectedMonth) : null;
  const nextAvailable = restricted ? months.find((m) => m > selectedMonth) : null;

  const handlePrevMonth = () => {
    if (restricted) { if (prevAvailable) onMonthChange(prevAvailable); return; }
    onMonthChange(format(subMonths(currentDate, 1), 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    if (restricted) { if (nextAvailable) onMonthChange(nextAvailable); return; }
    onMonthChange(format(addMonths(currentDate, 1), 'yyyy-MM'));
  };

  // Students can only step between months that have a board; the editor can go anywhere
  const canGoPrev = restricted ? !!prevAvailable : true;
  const canGoNext = restricted ? !!nextAvailable : true;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-wood-dark">
      {/* Calendar Toggle */}
      <button
        onClick={onToggleCalendar}
        className="flex items-center gap-2 mb-3 text-wood-dark hover:text-wood-light transition-colors"
      >
        <Calendar size={20} />
        <span className="font-handwriting text-lg">Pick Month</span>
      </button>

      {/* Month Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-full transition-colors ${
            canGoPrev ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center min-w-[140px]">
          <div className="font-handwriting text-xl text-wood-dark">
            {format(currentDate, 'MMMM')}
          </div>
          <div className="text-sm text-gray-600">
            {format(currentDate, 'yyyy')}
          </div>
        </div>
        
        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-full transition-colors ${
            canGoNext ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Quick Month Selector */}
      {showCalendar && (
        <div className="mt-4">
          <CalendarGrid
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthSelect={onMonthChange}
            onClose={onToggleCalendar}
          />
        </div>
      )}
    </div>
  );
};

export default MonthSelector;