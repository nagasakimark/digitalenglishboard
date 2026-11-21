import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const Flashcard = ({ item }) => {
  const { content } = item;
  const { front = 'Question', back = 'Answer' } = content;
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flashcard"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        width: '240px',
        height: '130px',
        perspective: '1000px',
        cursor: 'pointer'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#FFF8E1',
          borderRadius: '4px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #FFD54F',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#F57F17',
            marginBottom: '4px',
            fontWeight: 'bold',
          }}>
            日本語の意味は？
          </div>
          <div style={{
            fontSize: '26px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            lineHeight: '1.2',
            fontFamily: 'Georgia, serif',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {front}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px'
          }}>
            <RotateCcw size={14} color="#F57F17" />
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#E8F5E9',
          borderRadius: '4px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #81C784',
          transform: 'rotateY(180deg)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#2E7D32',
            marginBottom: '4px',
            fontWeight: 'bold',
          }}>
            答え
          </div>
          <div style={{
            fontSize: '26px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            lineHeight: '1.2',
            fontFamily: 'Georgia, serif',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {back}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px'
          }}>
            <RotateCcw size={14} color="#2E7D32" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
