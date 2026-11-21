import React from 'react';
import TextWithTranslation from '../TextWithTranslation';

const NoteCard = ({ item }) => {
  const { content, color = '#fff' } = item;
  
  return (
    <div
      className="note-card"
      style={{
        width: '240px',
        height: '160px',
        backgroundColor: color,
        padding: '20px',
        fontFamily: 'Patrick Hand, cursive',
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        border: '1px solid #ddd',
        backgroundImage: `
          linear-gradient(to right, #ddd 1px, transparent 1px),
          linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '20px 40px'
      }}
    >
      {/* Red margin line (like school notebook) */}
      <div
        style={{
          position: 'absolute',
          left: '15px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#ff6b6b',
          opacity: 0.7
        }}
      />
      
      {/* Title */}
      {content.title && (
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#222',
          borderBottom: '1px solid #ccc',
          paddingBottom: '5px'
        }}>
          {content.title}
        </h3>
      )}
      
      {/* Content */}
      <div style={{
        fontSize: '13px',
        wordWrap: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: content.title ? '90px' : '120px'
      }}>
        <TextWithTranslation text={content.text} />
      </div>

      {/* Paper texture overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default NoteCard;