import React from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';

const BookmarkCollection = ({ item }) => {
  const { content } = item;
  const { title = 'Bookmarks', bookmarks = [] } = content;

  return (
    <div
      className="bookmark-collection"
      style={{
        width: '240px',
        minHeight: '160px',
        backgroundColor: '#F0F4F8',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        border: '3px solid #90A4AE',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '3px solid #78909C'
      }}>
        <Bookmark size={18} color="#455A64" />
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {bookmarks.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#999',
            fontSize: '13px',
            fontStyle: 'italic',
            backgroundColor: '#E3F2FD',
            borderRadius: '4px',
            border: '1px solid #BBDEFB'
          }}>
            No bookmarks yet
          </div>
        ) : (
          bookmarks.map((bookmark, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #CFD8DC',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ExternalLink size={14} color="#546E7A" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {bookmark.title || 'Untitled'}
                </div>
                {bookmark.url && (
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {bookmark.url}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookmarkCollection;
