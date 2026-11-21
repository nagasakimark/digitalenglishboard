import React from 'react';
import TextWithTranslation from '../TextWithTranslation';

const StickyNote = ({ item }) => {
  const { color = '#FFF740', content } = item;
  
  return (
    <div
      className="sticky-note"
      style={{
        width: '200px',
        height: '200px',
        backgroundColor: color,
        padding: '20px',
        fontFamily: 'Patrick Hand, cursive',
        fontSize: '16px',
        lineHeight: '1.4',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {/* Paper curl effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20px',
          height: '20px',
          background: `linear-gradient(135deg, transparent 50%, ${color} 50%)`,
          transform: 'rotate(45deg)',
          transformOrigin: 'bottom left'
        }}
      />
      
      {/* Title */}
      {content.title && (
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#222'
        }}>
          {content.title}
        </h3>
      )}
      
      {/* Content */}
      <div style={{
        fontSize: '14px',
        wordWrap: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        <TextWithTranslation text={content.text} />
      </div>
    </div>
  );
};

export default StickyNote;