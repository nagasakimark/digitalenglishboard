import React, { useState } from 'react';
import { X, Plus, RefreshCw, Grid } from 'lucide-react';

const CrosswordEditor = ({ item, onUpdate }) => {
  const [newWord, setNewWord] = useState('');
  const [newClue, setNewClue] = useState('');
  const { title, clues = [], grid = [], width = 15, height = 15 } = item.content;
  // We store raw words/clues separately from the generated grid clues
  // But for simplicity, let's just store the input list and regenerate everything.
  const [wordList, setWordList] = useState(item.content.wordList || []); 

  const handleUpdate = (updates) => {
    onUpdate(item.id, {
      content: { ...item.content, ...updates }
    });
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (newWord && newClue) {
      const newItem = { word: newWord.toUpperCase(), clue: newClue };
      const updatedList = [...wordList, newItem];
      setWordList(updatedList);
      handleUpdate({ wordList: updatedList });
      setNewWord('');
      setNewClue('');
    }
  };

  const handleRemoveWord = (idx) => {
    const updatedList = wordList.filter((_, i) => i !== idx);
    setWordList(updatedList);
    handleUpdate({ wordList: updatedList });
  };

  const generateGrid = () => {
    // Very basic crossword generator
    // 1. Sort words by length
    // 2. Place first word in middle
    // 3. Try to place subsequent words intersecting with existing words
    
    const gridSize = 20; // Fixed large size for generation, then crop? Or just use fixed size.
    const tempGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const placedWords = [];
    const generatedClues = [];

    const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);

    if (sortedWords.length === 0) return;

    // Place first word horizontally in middle
    const first = sortedWords[0];
    const startRow = Math.floor(gridSize / 2);
    const startCol = Math.floor((gridSize - first.word.length) / 2);
    
    placeWord(tempGrid, first.word, startRow, startCol, 'across');
    placedWords.push({ ...first, row: startRow, col: startCol, dir: 'across' });

    // Try to place others
    for (let i = 1; i < sortedWords.length; i++) {
      const current = sortedWords[i];
      let placed = false;

      // Try to intersect with any placed word
      for (const placedWord of placedWords) {
        if (placed) break;

        // Find intersection characters
        for (let j = 0; j < current.word.length; j++) {
          if (placed) break;
          const char = current.word[j];

          for (let k = 0; k < placedWord.word.length; k++) {
            if (placedWord.word[k] === char) {
              // Potential intersection
              // If placed is across, we try down. If placed is down, we try across.
              const newDir = placedWord.dir === 'across' ? 'down' : 'across';
              
              // Calculate start position for new word
              let newRow, newCol;
              if (placedWord.dir === 'across') {
                // Intersection at (placedWord.row, placedWord.col + k)
                // New word is down, so it intersects at its index j
                newRow = placedWord.row - j;
                newCol = placedWord.col + k;
              } else {
                // Intersection at (placedWord.row + k, placedWord.col)
                // New word is across, so it intersects at its index j
                newRow = placedWord.row + k;
                newCol = placedWord.col - j;
              }

              if (canPlace(tempGrid, current.word, newRow, newCol, newDir, gridSize)) {
                placeWord(tempGrid, current.word, newRow, newCol, newDir);
                placedWords.push({ ...current, row: newRow, col: newCol, dir: newDir });
                placed = true;
                break;
              }
            }
          }
        }
      }
    }

    // Generate clues with numbers
    // Sort placed words by position (row then col) to assign numbers
    placedWords.sort((a, b) => (a.row - b.row) || (a.col - b.col));

    let clueNumber = 1;
    const finalClues = [];
    
    // Map to store numbers at positions
    const numberMap = {};

    placedWords.forEach(pw => {
      const key = `${pw.row}-${pw.col}`;
      let number = numberMap[key];
      if (!number) {
        number = clueNumber++;
        numberMap[key] = number;
      }
      
      finalClues.push({
        number,
        direction: pw.dir,
        text: pw.clue,
        word: pw.word
      });

      // Update grid with numbers
      if (!tempGrid[pw.row][pw.col]) {
         // Should be there, but just in case
         tempGrid[pw.row][pw.col] = { char: pw.word[0] };
      }
      tempGrid[pw.row][pw.col].number = number;
      
      // Mark cells with clue numbers for highlighting
      for(let i=0; i<pw.word.length; i++) {
        let r = pw.row + (pw.dir === 'down' ? i : 0);
        let c = pw.col + (pw.dir === 'across' ? i : 0);
        if(tempGrid[r][c]) {
            if(pw.dir === 'across') tempGrid[r][c].acrossNum = number;
            if(pw.dir === 'down') tempGrid[r][c].downNum = number;
        }
      }
    });

    handleUpdate({ grid: tempGrid, clues: finalClues, width: gridSize, height: gridSize });
  };

  const canPlace = (grid, word, row, col, dir, size) => {
    if (row < 0 || col < 0) return false;
    if (dir === 'across') {
      if (col + word.length > size) return false;
      // Check start and end (must be empty before and after)
      if (col > 0 && grid[row][col - 1]) return false;
      if (col + word.length < size && grid[row][col + word.length]) return false;

      for (let i = 0; i < word.length; i++) {
        const cell = grid[row][col + i];
        if (cell && cell.char !== word[i]) return false;
        
        // Check neighbors (if cell is empty, neighbors must be empty to avoid adjacent words)
        if (!cell) {
            if (row > 0 && grid[row - 1][col + i]) return false;
            if (row < size - 1 && grid[row + 1][col + i]) return false;
        }
      }
    } else {
      if (row + word.length > size) return false;
      if (row > 0 && grid[row - 1][col]) return false;
      if (row + word.length < size && grid[row + word.length][col]) return false;

      for (let i = 0; i < word.length; i++) {
        const cell = grid[row + i][col];
        if (cell && cell.char !== word[i]) return false;
        
        if (!cell) {
            if (col > 0 && grid[row + i][col - 1]) return false;
            if (col < size - 1 && grid[row + i][col + 1]) return false;
        }
      }
    }
    return true;
  };

  const placeWord = (grid, word, row, col, dir) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + (dir === 'down' ? i : 0);
      const c = col + (dir === 'across' ? i : 0);
      if (!grid[r][c]) {
        grid[r][c] = { char: word[i] };
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Crossword Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Add Word & Clue</label>
        <form onSubmit={handleAddWord} className="space-y-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Word (e.g. REACT)"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newClue}
              onChange={(e) => setNewClue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Clue (e.g. A JS library)"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {wordList.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
            <div>
              <span className="font-bold">{item.word}</span>: {item.clue}
            </div>
            <button onClick={() => handleRemoveWord(idx)} className="text-red-500 hover:text-red-700">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={generateGrid}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <RefreshCw size={18} />
        Generate Crossword
      </button>

      {grid && grid.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg p-2 bg-gray-50 overflow-auto">
          <div 
            className="grid gap-px bg-black border border-black"
            style={{ 
              gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
              width: 'fit-content'
            }}
          >
            {grid.map((row, rIndex) => (
              row.map((cell, cIndex) => (
                <div
                  key={`${rIndex}-${cIndex}`}
                  className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${cell ? 'bg-white' : 'bg-black'}`}
                >
                  {cell?.char}
                </div>
              ))
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrosswordEditor;
