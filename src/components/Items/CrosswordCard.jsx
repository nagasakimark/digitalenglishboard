import { awardSticker } from '../../utils/stickers';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Grid, X, Trophy, RefreshCw, ChevronRight } from 'lucide-react';

const CrosswordCard = ({ item, isEditing }) => {
  const { title, clues = [], grid = [], width = 10, height = 10 } = item.content;
  const [isOpen, setIsOpen] = useState(false);
  const [userGrid, setUserGrid] = useState({}); // { "row-col": "A" }
  const [selectedCell, setSelectedCell] = useState(null); // { row, col }
  const [direction, setDirection] = useState('across'); // 'across' or 'down'
  const [solved, setSolved] = useState(false);
  const [wordMap, setWordMap] = useState({});
  const [solvedWords, setSolvedWords] = useState(new Set());

  // Reset game when opening
  useEffect(() => {
    if (isOpen) {
      setUserGrid({});
      setSolved(false);
      setSelectedCell(null);
    }
  }, [isOpen]);

  // Build word map
  useEffect(() => {
    const map = {};
    if (grid) {
      grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell && cell.char) {
            if (cell.acrossNum) {
              const key = `across-${cell.acrossNum}`;
              if (!map[key]) map[key] = [];
              map[key].push({ r, c, char: cell.char });
            }
            if (cell.downNum) {
              const key = `down-${cell.downNum}`;
              if (!map[key]) map[key] = [];
              map[key].push({ r, c, char: cell.char });
            }
          }
        });
      });
    }
    setWordMap(map);
  }, [grid]);

  // Check solved words
  useEffect(() => {
    const solved = new Set();
    Object.entries(wordMap).forEach(([key, cells]) => {
      const isComplete = cells.every(({ r, c, char }) => {
        const userChar = userGrid[`${r}-${c}`];
        return userChar && userChar.toUpperCase() === char.toUpperCase();
      });
      if (isComplete) solved.add(key);
    });
    setSolvedWords(solved);
  }, [userGrid, wordMap]);

  // Check if solved (all words solved)
  useEffect(() => {
    if (!isOpen || !grid.length || Object.keys(wordMap).length === 0) return;

    if (solvedWords.size === Object.keys(wordMap).length) {
      setSolved(true);
      awardSticker(item);
    }
  }, [solvedWords, wordMap, isOpen, grid]);

  const handleCellClick = (row, col) => {
    const cell = grid[row]?.[col];
    if (!cell || !cell.char) return;

    const hasAcross = !!cell.acrossNum;
    const hasDown = !!cell.downNum;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      if (hasAcross && hasDown) {
        setDirection(prev => prev === 'across' ? 'down' : 'across');
      }
    } else {
      setSelectedCell({ row, col });
      
      if (hasAcross && !hasDown) {
        setDirection('across');
      } else if (!hasAcross && hasDown) {
        setDirection('down');
      } else if (hasAcross && hasDown) {
        // If current direction is invalid for this cell, switch
        if (direction === 'across' && !hasAcross) setDirection('down');
        else if (direction === 'down' && !hasDown) setDirection('across');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      setUserGrid(prev => ({
        ...prev,
        [`${row}-${col}`]: e.key.toUpperCase()
      }));
      moveSelection(1);
    } else if (e.key === 'Backspace') {
      setUserGrid(prev => {
        const newGrid = { ...prev };
        delete newGrid[`${row}-${col}`];
        return newGrid;
      });
      moveSelection(-1);
    } else if (e.key === 'ArrowRight') {
      moveCell(0, 1);
    } else if (e.key === 'ArrowLeft') {
      moveCell(0, -1);
    } else if (e.key === 'ArrowDown') {
      moveCell(1, 0);
    } else if (e.key === 'ArrowUp') {
      moveCell(-1, 0);
    }
  };

  const moveSelection = (step) => {
    if (!selectedCell) return;
    let { row, col } = selectedCell;

    if (direction === 'across') {
      col += step;
    } else {
      row += step;
    }

    // Check bounds and if cell is valid
    if (grid[row]?.[col]?.char) {
      setSelectedCell({ row, col });
    }
  };

  const moveCell = (dRow, dCol) => {
    if (!selectedCell) return;
    const newRow = selectedCell.row + dRow;
    const newCol = selectedCell.col + dCol;
    
    if (grid[newRow]?.[newCol]?.char) {
      setSelectedCell({ row: newRow, col: newCol });
    }
  };

  // Get current clue
  const getCurrentClue = () => {
    if (!selectedCell) return null;
    const cell = grid[selectedCell.row][selectedCell.col];
    if (!cell) return null;

    // Find clue associated with this cell and direction
    // This assumes clues have a number and direction
    // Simplified: Just find the clue that starts at the number in this cell if any, 
    // or search for the word this cell belongs to.
    // For MVP, let's just show all clues and highlight relevant ones if possible.
    
    // Better approach: The grid cell should know which clue number it belongs to for across/down
    const clueNum = direction === 'across' ? cell.acrossNum : cell.downNum;
    if (clueNum) {
      return clues.find(c => c.number === clueNum && c.direction === direction);
    }
    return null;
  };

  const currentClue = getCurrentClue();

  // Preview Card
  if (!isOpen) {
    return (
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-shadow"
        style={{ width: item.width || '260px', height: item.height || '300px' }}
        onClick={() => !isEditing && setIsOpen(true)}
      >
        <div className="bg-blue-500 p-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg truncate">{title || 'Crossword'}</h3>
          <Grid size={20} />
        </div>
        <div className="flex-1 p-4 flex flex-col items-center justify-center bg-blue-50">
          <div className="grid gap-px p-2 bg-gray-300 rounded-lg shadow-sm opacity-75 border border-gray-300" 
               style={{ gridTemplateColumns: `repeat(5, 1fr)`, backgroundColor: '#ccc' }}>
            {/* Mini preview grid (5x5) */}
            {Array(25).fill(0).map((_, i) => (
              <div key={i} className={`w-6 h-6 ${i % 2 === 0 ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
              </div>
            ))}
          </div>
          <p className="mt-4 text-blue-700 font-medium">{clues.length} clues</p>
          <p className="text-xs text-blue-500 mt-1">Click to solve</p>
        </div>
      </div>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-500 hover:text-gray-800 shadow-sm transition-all hover:scale-110"
        >
          <X size={24} />
        </button>

        {/* Clues Sidebar */}
        <div className="bg-blue-600 p-6 text-white md:w-80 flex-shrink-0 flex flex-col border-r border-blue-500 overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{title || 'Crossword'}</h2>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-white/80 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="mb-6">
              <h3 className="font-bold text-blue-100 mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
                <ChevronRight size={14} /> Across
              </h3>
              <div className="space-y-2">
                {clues.filter(c => c.direction === 'across').map((clue, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 rounded-lg text-sm cursor-pointer transition-all ${
                      currentClue === clue 
                        ? 'bg-white text-blue-900 shadow-md transform scale-[1.02]' 
                        : 'bg-blue-700/50 text-blue-50 hover:bg-blue-700'
                    }`}
                    onClick={() => {
                      setDirection('across');
                      // Find cell logic would go here
                    }}
                  >
                    <span className="font-bold mr-1 opacity-70">{clue.number}.</span>
                    {clue.text}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-blue-100 mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
                <ChevronRight size={14} /> Down
              </h3>
              <div className="space-y-2">
                {clues.filter(c => c.direction === 'down').map((clue, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 rounded-lg text-sm cursor-pointer transition-all ${
                      currentClue === clue 
                        ? 'bg-white text-blue-900 shadow-md transform scale-[1.02]' 
                        : 'bg-blue-700/50 text-blue-50 hover:bg-blue-700'
                    }`}
                    onClick={() => setDirection('down')}
                  >
                    <span className="font-bold mr-1 opacity-70">{clue.number}.</span>
                    {clue.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-gray-50 p-6 overflow-hidden flex flex-col items-center justify-center relative">
          {solved ? (
            <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block p-6 bg-yellow-100 rounded-full mb-4"
              >
                <Trophy size={64} className="text-yellow-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Puzzle Solved!</h2>
              <p className="text-gray-600 mb-6">Great job completing the crossword.</p>
              <button 
                onClick={() => {
                  setUserGrid({});
                  setSolved(false);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={18} />
                Play Again
              </button>
            </div>
          ) : (
            <>
              {/* Current Clue Display */}
              <div className="w-full max-w-2xl bg-blue-600 text-white p-3 rounded-lg shadow-md mb-6 text-center min-h-[3.5rem] flex items-center justify-center flex-shrink-0 z-10">
                {currentClue ? (
                  <span className="font-medium text-lg">
                    <span className="font-bold mr-2 bg-blue-700 px-2 py-0.5 rounded text-sm">{currentClue.number} {currentClue.direction === 'across' ? 'ヨコ' : 'タテ'}</span>
                    {currentClue.text}
                  </span>
                ) : (
                  <span className="opacity-80 font-medium">マスを選択してヒントを表示</span>
                )}
              </div>

              {/* Grid */}
              <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden">
                {grid && grid.length > 0 ? (
                  <div 
                    className="grid gap-1"
                    style={{ 
                      gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
                      aspectRatio: `${grid[0].length} / ${grid.length}`,
                      width: '100vmax',
                      height: '100vmax',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  >
                    {grid.map((row, rIndex) => (
                      row.map((cell, cIndex) => {
                        const isBlack = !cell || !cell.char;
                        const userChar = userGrid[`${rIndex}-${cIndex}`];
                        
                        const acrossKey = cell?.acrossNum ? `across-${cell.acrossNum}` : null;
                        const downKey = cell?.downNum ? `down-${cell.downNum}` : null;
                        const isWordComplete = (acrossKey && solvedWords.has(acrossKey)) || (downKey && solvedWords.has(downKey));

                        const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
                        const isRelated = currentClue && (
                          (direction === 'across' && cell?.acrossNum === currentClue.number) ||
                          (direction === 'down' && cell?.downNum === currentClue.number)
                        );

                        return (
                          <div
                            key={`${rIndex}-${cIndex}`}
                            className={`
                              flex items-center justify-center relative
                              text-base md:text-xl font-bold uppercase select-none transition-all duration-200
                              ${isBlack ? 'invisible' : 'rounded-md shadow-sm cursor-pointer border-2'}
                              
                              ${/* Base State */ ''}
                              ${!isBlack && isWordComplete 
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                                : !isBlack 
                                  ? 'bg-white border-gray-200 hover:border-blue-300' 
                                  : ''}

                              ${/* Related State */ ''}
                              ${!isSelected && isRelated 
                                ? (isWordComplete ? '!bg-emerald-200' : '!bg-blue-50 !border-blue-200') 
                                : ''}

                              ${/* Selected State */ ''}
                              ${isSelected 
                                ? '!border-blue-600 !ring-4 !ring-blue-400/50 z-20 ' + (isWordComplete ? '!bg-emerald-200' : '!bg-blue-100')
                                : ''}
                            `}
                            onClick={() => !isBlack && handleCellClick(rIndex, cIndex)}
                          >
                            {!isBlack && (
                              <>
                                {cell.number && (
                                  <span className={`absolute top-0.5 left-0.5 text-[8px] md:text-[10px] leading-none font-normal ${isWordComplete ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {cell.number}
                                  </span>
                                )}
                                <span className={userChar ? (isWordComplete ? 'text-emerald-800' : 'text-gray-800') : 'text-transparent'}>
                                  {userChar || cell.char}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 text-center rounded-xl shadow-sm">
                    <p>Grid not generated.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default CrosswordCard;
