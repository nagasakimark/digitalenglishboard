import React, { useState, useEffect, useRef } from 'react';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardSticker } from '../../utils/stickers';

const ScavengerItem = ({ item, isEditable }) => {
  const [isFound, setIsFound] = useState(false);
  const { content } = item;
  
  useEffect(() => {
    // Check if already found
    const foundItems = JSON.parse(localStorage.getItem('rovo-scavenger-found') || '[]');
    if (foundItems.includes(item.id)) {
      setIsFound(true);
    }
  }, [item.id]);

  const handleClick = (e) => {
    if (isEditable || isFound) return;
    
    e.stopPropagation();
    
    // Mark as found
    const foundItems = JSON.parse(localStorage.getItem('rovo-scavenger-found') || '[]');
    if (!foundItems.includes(item.id)) {
      foundItems.push(item.id);
      localStorage.setItem('rovo-scavenger-found', JSON.stringify(foundItems));
      setIsFound(true);
      awardSticker(item);
      
      // Trigger global event for the overlay to update
      window.dispatchEvent(new Event('scavenger-update'));
      
      // Confetti effect at click position
      const rect = e.target.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });
    }
  };

  // In editor, show it clearly. In student view, it might be hidden/small
  const opacity = isEditable ? 1 : (isFound ? 0.5 : 1);
  const filter = isFound ? 'grayscale(100%)' : 'none';

  return (
    <div 
      className={`scavenger-item ${isFound ? 'found' : ''}`}
      onClick={handleClick}
      style={{
        width: `${item.width || 50}px`,
        height: `${item.width || 50}px`,
        cursor: isEditable ? 'move' : (isFound ? 'default' : 'pointer'),
        opacity,
        filter,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title={isEditable ? "Scavenger Hunt Item" : (isFound ? "Found!" : "???")}
    >
      {content.imageUrl ? (
        <img 
          src={content.imageUrl} 
          alt="Hidden Item" 
          style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
        />
      ) : (
        <div className={`rounded-full p-2 text-white shadow-lg ${isEditable ? 'bg-yellow-400' : 'opacity-0'}`}>
          <Trophy size={24} />
        </div>
      )}
    </div>
  );
};

export default ScavengerItem;
