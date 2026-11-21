import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MonthSelector from './MonthSelector';
import TagFilter from './TagFilter';

const CollapsibleNav = ({
  selectedMonth,
  onMonthChange,
  boardData,
  activeFilters,
  onTagToggle,
  months
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-30">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3 rounded-lg shadow-lg transition-all duration-200
          ${isOpen 
            ? 'bg-wood-dark text-white' 
            : 'bg-white text-wood-dark border-2 border-wood-dark hover:bg-cork-light'
          }
        `}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 space-y-4 min-w-[300px]"
          >
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={onMonthChange}
              showCalendar={showCalendar}
              onToggleCalendar={() => setShowCalendar(!showCalendar)}
              boardData={boardData}
              months={months}
            />
            
            {boardData?.tags?.length > 0 && !months && (
              <TagFilter
                tags={boardData.tags}
                activeFilters={activeFilters}
                onTagToggle={onTagToggle}
              />
            )}

            {/* Close overlay area */}
            <div 
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleNav;