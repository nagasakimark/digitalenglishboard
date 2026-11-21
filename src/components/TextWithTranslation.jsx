import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const TextWithTranslation = ({ text }) => {
  if (!text) return null;
  if (typeof text !== 'string') return text;

  // Regex to match word[translation] pattern
  // Captures: 1. The word (non-whitespace), 2. The translation (inside brackets)
  const regex = /(\S+)\[(.*?)\]/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const word = match[1];
    const translation = match[2];

    parts.push(
      <InteractiveWord key={match.index} word={word} translation={translation} />
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

const InteractiveWord = ({ word, translation }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + (rect.width / 2)
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setShowTooltip(true);
  };

  useEffect(() => {
    if (showTooltip) {
      // Update position on scroll (capture phase to catch all scrolls) or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showTooltip]);

  return (
    <>
      <span 
        ref={triggerRef}
        className="relative inline cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={(e) => {
          updatePosition();
          setShowTooltip(!showTooltip);
        }}
      >
        <span className="border-b-2 border-dashed border-blue-600 text-blue-900 bg-blue-50/50 hover:bg-blue-100 transition-colors rounded px-1 font-semibold">
          {word}
        </span>
      </span>
      
      {showTooltip && createPortal(
        <div 
          className="fixed z-[99999] pointer-events-none"
          style={{
            top: coords.top - 8, // Just above the word
            left: coords.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-xl shadow-xl border border-gray-100 whitespace-nowrap relative animate-in fade-in zoom-in-95 duration-200">
            {translation}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-white"></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TextWithTranslation;
