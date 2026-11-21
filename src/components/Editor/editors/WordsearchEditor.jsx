import React, { useState } from 'react';
import { X, Plus, RefreshCw, Grid } from 'lucide-react';

const WordsearchEditor = ({ item, onUpdate }) => {
  const [newWord, setNewWord] = useState('');
  const { title, words = [], size = 10, grid = [] } = item.content;

  const handleUpdate = (updates) => {
    onUpdate(item.id, {
      content: { ...item.content, ...updates }
    });
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (newWord && !words.includes(newWord.toUpperCase())) {
      const updatedWords = [...words, newWord.toUpperCase()];
      handleUpdate({ words: updatedWords });
      setNewWord('');
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    const updatedWords = words.filter(w => w !== wordToRemove);
    handleUpdate({ words: updatedWords });
  };

  const generateGrid = () => {
    const gridSize = parseInt(size) || 10;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    const placedWords = [];

    // Sort words by length descending to place longest first
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (canPlaceWord(newGrid, word, row, col, direction, gridSize)) {
          placeWord(newGrid, word, row, col, direction);
          placed = true;
          placedWords.push(word);
        }
        attempts++;
      }
      
      if (!placed) {
        console.warn(`Could not place word: ${word}`);
      }
    }

    // Fill empty cells
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    handleUpdate({ grid: newGrid });
  };

  const canPlaceWord = (grid, word, row, col, direction, gridSize) => {
    if (direction === 0) { // Horizontal
      if (col + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) return false;
      }
    } else if (direction === 1) { // Vertical
      if (row + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) return false;
      }
    } else { // Diagonal
      if (row + word.length > gridSize || col + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col + i] !== '' && grid[row + i][col + i] !== word[i]) return false;
      }
    }
    return true;
  };

  const placeWord = (grid, word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
      if (direction === 0) grid[row][col + i] = word[i];
      else if (direction === 1) grid[row + i][col] = word[i];
      else grid[row + i][col + i] = word[i];
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Word Search Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size</label>
        <input
          type="number"
          value={size}
          onChange={(e) => handleUpdate({ size: parseInt(e.target.value) })}
          min="5"
          max="20"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Add Words</label>
        <form onSubmit={handleAddWord} className="flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Enter a word"
          />
          <button
            type="submit"
            className="p-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map((word, idx) => (
          <div key={idx} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">
            <span>{word}</span>
            <button onClick={() => handleRemoveWord(word)} className="hover:text-emerald-900">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={generateGrid}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
      >
        <RefreshCw size={18} />
        Generate Grid
      </button>

      {grid && grid.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg p-2 bg-gray-50 overflow-auto">
          <div 
            className="grid gap-px bg-gray-300 border border-gray-300"
            style={{ 
              gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
              width: 'fit-content'
            }}
          >
            {grid.map((row, rIndex) => (
              row.map((letter, cIndex) => (
                <div
                  key={`${rIndex}-${cIndex}`}
                  className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-white"
                >
                  {letter}
                </div>
              ))
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordsearchEditor;
