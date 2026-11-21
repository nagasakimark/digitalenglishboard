import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const TimeLockedCard = ({ item }) => {
  const { content, width = 200 } = item;
  const [isLocked, setIsLocked] = useState(true);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (content.unlockDate) {
      const unlockDate = parseISO(content.unlockDate);
      if (isAfter(new Date(), unlockDate)) {
        setIsLocked(false);
      }
    }
  }, [content.unlockDate]);

  const handleClick = () => {
    if (isLocked) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const unlockDate = content.unlockDate ? parseISO(content.unlockDate) : new Date();
  const formattedDate = format(unlockDate, 'MMM d, yyyy');

  return (
    <motion.div
      className="time-locked-card"
      animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      style={{
        width: `${width}px`,
        minHeight: `${width * 0.8}px`,
        backgroundColor: isLocked ? '#f87171' : '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLocked ? 'not-allowed' : 'default',
        position: 'relative',
        border: isLocked ? '4px solid #ef4444' : '1px solid #e5e7eb',
        transition: 'all 0.3s ease'
      }}
    >
      {isLocked ? (
        <>
          <div className="bg-white/20 p-4 rounded-full mb-3">
            <Lock size={32} color="white" />
          </div>
          <h3 className="text-white font-bold text-center mb-1">Locked</h3>
          <p className="text-white/90 text-xs text-center">
            Available on<br/>
            <span className="font-bold text-sm">{formattedDate}</span>
          </p>
          {content.lockedText && (
            <div className="mt-3 text-white/80 text-xs text-center italic">
              "{content.lockedText}"
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
            <Unlock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Unlocked</span>
          </div>
          
          {content.imageUrl && (
            <img 
              src={content.imageUrl} 
              alt="Unlocked Content" 
              className="w-full h-32 object-contain mb-3 rounded"
            />
          )}
          
          <h3 className="font-bold text-gray-800 text-center mb-2">{content.title}</h3>
          <p className="text-sm text-gray-600 text-center">{content.text}</p>
          
          {content.url && (
            <a 
              href={content.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto pt-3 text-blue-600 text-xs font-bold text-center hover:underline block"
            >
              Open Link →
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TimeLockedCard;
