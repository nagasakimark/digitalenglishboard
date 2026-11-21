import React from 'react';
import TextWithTranslation from '../TextWithTranslation';

const QuoteCard = ({ item }) => {
  const { content } = item;
  const { quote = 'Your quote here...', author = '' } = content;

  return (
    <div
      className="quote-card"
      style={{
        width: '260px',
        minHeight: '160px',
        backgroundColor: '#FFF8DC',
        padding: '24px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        border: '3px double #D4AF37',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <div style={{
        fontSize: '48px',
        color: '#D4AF37',
        position: 'absolute',
        top: '8px',
        left: '12px',
        lineHeight: 1,
        fontFamily: 'Georgia, serif'
      }}>
        "
      </div>

      <p style={{
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#333',
        lineHeight: '1.6',
        fontFamily: 'Georgia, serif',
        textAlign: 'center'
      }}>
        <TextWithTranslation text={quote} />
      </p>

      {author && (
        <div style={{
          fontSize: '13px',
          color: '#666',
          textAlign: 'right',
          fontFamily: 'Georgia, serif',
          paddingRight: '30px'
        }}>
          — {author}
        </div>
      )}

      <div style={{
        fontSize: '48px',
        color: '#D4AF37',
        position: 'absolute',
        bottom: '8px',
        right: '12px',
        lineHeight: 1,
        fontFamily: 'Georgia, serif'
      }}>
        "
      </div>
    </div>
  );
};

export default QuoteCard;
