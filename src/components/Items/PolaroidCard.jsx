import React from 'react';
import TextWithTranslation from '../TextWithTranslation';

const PolaroidCard = ({ item }) => {
  const { content, width = 180, layout = 'polaroid' } = item;
  
  // Calculate dimensions based on width
  const cardWidth = parseInt(width);

  // --- POSTER LAYOUT (Left/Right Image) ---
  if (layout === 'poster-left' || layout === 'poster-right') {
    const isLeft = layout === 'poster-left';
    const minHeight = Math.max(200, cardWidth * 0.6);
    
    return (
      <div
        className="poster-card"
        style={{
          width: `${cardWidth * 2}px`, // Wider for poster layout
          minHeight: `${minHeight}px`,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: isLeft ? 'row' : 'row-reverse',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}
      >
        {/* Image Side */}
        <div style={{ width: '40%', position: 'relative', backgroundColor: '#f3f4f6' }}>
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={content.title || 'Image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Text Side */}
        <div style={{ width: '60%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ 
            fontSize: `${Math.max(18, cardWidth / 10)}px`, 
            fontWeight: 'bold', 
            marginBottom: '12px',
            lineHeight: '1.3',
            color: '#111827'
          }}>
            <TextWithTranslation text={content.title || 'Untitled'} />
          </div>
          
          {content.text && (
            <div style={{ 
              fontSize: `${Math.max(14, cardWidth / 14)}px`, 
              color: '#4b5563',
              lineHeight: '1.5'
            }}>
              <TextWithTranslation text={content.text} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DEFAULT POLAROID LAYOUT ---
  const imageHeight = Math.round(cardWidth * 0.85); // Maintain aspect ratio
  const minHeight = imageHeight + 80; // Space for caption and padding
  const fontSize = Math.max(16, Math.round(cardWidth / 12)); // Scale font with size

  return (
    <div
      className="polaroid-card"
      style={{
        width: `${cardWidth}px`,
        minHeight: `${minHeight}px`,
        backgroundColor: '#ffffff',
        padding: `${Math.round(cardWidth * 0.06)}px ${Math.round(cardWidth * 0.06)}px ${Math.round(cardWidth * 0.2)}px ${Math.round(cardWidth * 0.06)}px`,
        fontFamily: 'Patrick Hand, cursive',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Image area */}
      <div
        style={{
          width: '100%',
          height: `${imageHeight}px`,
          backgroundColor: '#f5f5f5',
          marginBottom: `${Math.round(cardWidth * 0.05)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #ddd'
        }}
      >
        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={content.title || 'Image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          style={{
            display: content.imageUrl ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          📷 No Image
        </div>
      </div>
      
      {/* Caption area */}
      <div
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.3',
          textAlign: 'center',
          wordWrap: 'break-word',
          overflow: 'hidden',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ width: '100%' }}>
          <TextWithTranslation text={content.title || content.text || 'Untitled'} />
        </div>
      </div>

      {/* Vintage effect overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 0%, rgba(139,69,19,0.05) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default PolaroidCard;