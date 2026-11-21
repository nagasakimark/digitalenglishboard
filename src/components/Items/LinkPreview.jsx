import React from 'react';
import { ExternalLink, Globe, Play } from 'lucide-react';
import { getDomainFromUrl, extractVideoId } from '../../utils/linkPreviewHelper';

const LinkPreview = ({ item }) => {
  const { content } = item;
  const { url, metadata = {} } = content;
  
  // Check if this is a video
  const videoId = extractVideoId(url);
  const isVideo = !!videoId;

  return (
    <div
      className="link-preview"
      style={{
        width: '280px',
        minHeight: '140px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Thumbnail */}
      {(metadata.imageUrl || isVideo) && (
        <div
          style={{
            width: '100%',
            height: '80px',
            backgroundImage: `url(${metadata.imageUrl || (isVideo ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#f5f5f5',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isVideo && (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Play size={20} fill="white" />
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div style={{ padding: '12px' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1a1a1a',
          marginBottom: '4px',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'Open Sans, sans-serif'
        }}>
          {content.title || metadata.title || 'Link'}
        </h3>
        
        {/* Description */}
        {(content.text || metadata.description) && (
          <p style={{
            fontSize: '12px',
            color: '#666',
            lineHeight: '1.4',
            marginBottom: '8px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            fontFamily: 'Open Sans, sans-serif'
          }}>
            {content.text || metadata.description}
          </p>
        )}
        
        {/* Site info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#999'
        }}>
          <Globe size={12} />
          <span>{metadata.siteName || getDomainFromUrl(url)}</span>
          <ExternalLink size={10} style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none'
        }}
        className="hover-overlay"
      />
    </div>
  );
};

export default LinkPreview;