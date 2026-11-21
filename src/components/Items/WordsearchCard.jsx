import { awardSticker } from '../../utils/stickers';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RefreshCw, Check, Trophy } from 'lucide-react';

const WordsearchCard = ({ item, isEditing }) => {
  const { title, words = [], grid = [], size = 10 } = item.content;
  const [isOpen, setIsOpen] = useState(false);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);

  // Reset game when opening
  useEffect(() => {
    if (isOpen) {
      setFoundWords([]);
      setSelectedCells([]);
    }
  }, [isOpen]);

  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    setStartCell({ row, col });
    setHoverCell({ row, col });
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (isDragging && startCell) {
      setHoverCell({ row, col });
      // Calculate line between start and current
      const cells = getCellsInLine(startCell, { row, col });
      setSelectedCells(cells);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      checkSelection();
    }
  };

  // Touch Support
  const handleTouchStart = (e, row, col) => {
    // Prevent default to stop scrolling while playing
    // e.preventDefault(); // Note: might block scrolling if not careful, but needed for game
    handleMouseDown(row, col);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    if (!isDragging) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      const row = element.getAttribute('data-row');
      const col = element.getAttribute('data-col');
      
      if (row !== null && col !== null) {
        handleMouseEnter(parseInt(row), parseInt(col));
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const getCellsInLine = (start, end) => {
    const cells = [];
    const dx = end.col - start.col;
    const dy = end.row - start.row;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    if (steps === 0) return [{ row: start.row, col: start.col }];

    // Only allow horizontal, vertical, or diagonal lines
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
        return [{ row: start.row, col: start.col }]; // Invalid line, just return start
    }

    const xInc = dx / steps;
    const yInc = dy / steps;

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: Math.round(start.row + i * yInc),
        col: Math.round(start.col + i * xInc)
      });
    }
    return cells;
  };

  const checkSelection = () => {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    const found = words.find(word => 
      (word === selectedWord || word === reversedWord) && !foundWords.includes(word)
    );

    if (found) {
      setFoundWords([...foundWords, found]);
      if (foundWords.length + 1 === words.length) awardSticker(item);
    }
    setSelectedCells([]);
    setStartCell(null);
    setHoverCell(null);
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row, col) => {
    // This is tricky without storing found cell coordinates. 
    // For simplicity in this version, we won't highlight found letters on the grid permanently,
    // just cross off the word list. 
    // To do it properly, we'd need to store the coordinates of found words.
    return false; 
  };

  // Preview Card
  if (!isOpen) {
    return (
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-shadow"
        style={{ width: item.width || '260px', height: item.height || '300px' }}
        onClick={() => !isEditing && setIsOpen(true)}
      >
        <div className="bg-emerald-500 p-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg truncate">{title || 'Word Search'}</h3>
          <Search size={20} />
        </div>
        <div className="flex-1 p-4 flex flex-col items-center justify-center bg-emerald-50">
          <div className="grid gap-1 p-2 bg-white rounded-lg shadow-sm opacity-75" 
               style={{ gridTemplateColumns: `repeat(5, 1fr)` }}>
            {/* Mini preview grid (5x5) */}
            {Array(25).fill(0).map((_, i) => (
              <div key={i} className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-100 rounded">
                {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
              </div>
            ))}
          </div>
          <p className="mt-4 text-emerald-700 font-medium">{words.length} words to find</p>
          <p className="text-xs text-emerald-500 mt-1">Click to play</p>
        </div>
      </div>
    );
  }

  // Full Screen Modal
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar / Header */}
        <div className="bg-emerald-500 p-6 text-white md:w-64 flex-shrink-0 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{title || 'Word Search'}</h2>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-white/80 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <h3 className="font-bold mb-3 opacity-90">Find these words:</h3>
            <div className="flex flex-wrap gap-2 md:flex-col">
              {words.map((word, idx) => (
                <div 
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    foundWords.includes(word) 
                      ? 'bg-emerald-600 text-white/50 line-through' 
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-80">Progress</span>
              <span className="font-bold">{foundWords.length} / {words.length}</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${(foundWords.length / words.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-gray-50 p-6 overflow-auto flex items-center justify-center relative">
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hidden md:block"
          >
            <X size={24} />
          </button>

          {foundWords.length === words.length ? (
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block p-6 bg-yellow-100 rounded-full mb-4"
              >
                <Trophy size={64} className="text-yellow-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Puzzle Solved!</h2>
              <p className="text-gray-600 mb-6">You found all {words.length} words.</p>
              <button 
                onClick={() => {
                  setFoundWords([]);
                  setSelectedCells([]);
                }}
                className="px-6 py-3 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={18} />
                Play Again
              </button>
            </div>
          ) : (
            <div 
              className="bg-white p-4 rounded-xl shadow-sm select-none touch-none"
              onMouseLeave={handleMouseUp}
              onMouseUp={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {grid && grid.length > 0 ? (
                <div 
                  className="grid gap-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` 
                  }}
                >
                  {grid.map((row, rIndex) => (
                    row.map((letter, cIndex) => (
                      <div
                        key={`${rIndex}-${cIndex}`}
                        data-row={rIndex}
                        data-col={cIndex}
                        className={`
                          w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
                          text-lg font-bold rounded cursor-pointer transition-colors
                          ${isCellSelected(rIndex, cIndex) 
                            ? 'bg-emerald-500 text-white transform scale-110 shadow-md z-10' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                        onMouseDown={() => handleMouseDown(rIndex, cIndex)}
                        onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                        onTouchStart={(e) => handleTouchStart(e, rIndex, cIndex)}
                      >
                        {letter}
                      </div>
                    ))
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Grid not generated.</p>
                  <p className="text-sm">Edit this card to generate the puzzle.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default WordsearchCard;
