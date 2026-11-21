import React from 'react';

const BookmarkCard = ({ item }) => {
  const { content, color = '#f3e5f5' } = item;
  const bookmarks = content.bookmarks || [];

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  };

  const handleBookmarkClick = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div
      className="bookmark-card"
      style={{
        width: '320px',
        minHeight: '200px',
        backgroundColor: '#f8f6f3',
        padding: '20px',
        fontFamily: 'Patrick Hand, cursive',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'visible',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: `
          radial-gradient(circle at 25% 25%, rgba(139,69,19,0.04) 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, rgba(139,69,19,0.03) 1px, transparent 1px),
          #f8f6f3
        `,
        backgroundSize: '20px 20px, 30px 30px, 100%'
      }}
    >
      {/* Cork board pins */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '15px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#d4af37',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
      }} />
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '15px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#d4af37',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
      }} />

      {/* Title */}
      <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#8b4513',
        textAlign: 'center',
        marginTop: '8px'
      }}>
        {content.title || 'Quick Links'}
      </h3>

      {/* Bookmarks List */}
      <div style={{
        maxHeight: '150px',
        overflowY: 'auto'
      }}>
        {bookmarks.length > 0 ? bookmarks.map((bookmark, index) => (
          <div
            key={index}
            onClick={() => handleBookmarkClick(bookmark.url)}
            style={{
              position: 'relative',
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: index % 2 === 0 ? '#fff8dc' : '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transform: `rotate(${(index % 2 === 0 ? 1 : -1) * Math.random() * 2}deg)`,
              fontFamily: 'Georgia, serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${(index % 2 === 0 ? 1 : -1) * Math.random() * 2}deg) translateY(0)`;
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.zIndex = '1';
            }}
          >
            {/* Small pin at top */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#dc143c',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.3)'
            }} />

            {/* Bookmark content */}
            <div style={{
              textAlign: 'center',
              paddingTop: '4px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '4px',
                lineHeight: '1.2'
              }}>
                {bookmark.title || 'Untitled'}
              </div>
              
              {/* Favicon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px'
              }}>
                {getFaviconUrl(bookmark.url) ? (
                  <img
                    src={getFaviconUrl(bookmark.url)}
                    alt=""
                    style={{
                      width: '16px',
                      height: '16px',
                      marginRight: '6px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: '14px',
                    marginRight: '6px'
                  }}>🔗</span>
                )}
              </div>

              {bookmark.url && (
                <div style={{
                  fontSize: '10px',
                  color: '#7f8c8d',
                  fontFamily: 'Monaco, monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}>
                  {bookmark.url.replace(/^https?:\/\//, '').split('/')[0]}
                </div>
              )}
            </div>
          </div>
        )) : (
          <div style={{
            color: '#999',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px 0'
          }}>
            No bookmarks added
          </div>
        )}
      </div>

      {/* Count Badge */}
      {bookmarks.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: '#9c27b0',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '12px',
          minWidth: '20px',
          textAlign: 'center'
        }}>
          {bookmarks.length}
        </div>
      )}
    </div>
  );
};

export default BookmarkCard;