import React, { useState, useRef, useEffect } from 'react';
import TextWithTranslation from '../TextWithTranslation';
import { previewUrlFor } from '../../utils/publish';

const LocalVideo = ({ item, isEditing }) => {
  const { content, width } = item;
  const videoRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        if (video.videoWidth && video.videoHeight) {
          setAspectRatio(video.videoWidth / video.videoHeight);
        }
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [content.filename]);

  // Base path for videos
  // Handle GitHub Pages deployment where base URL is not root
  const assetPath = content.filename ? `assets/videos/${content.filename}` : null;
  // A video picked in the editor but not published yet plays from this computer
  const videoSrc = assetPath ? (previewUrlFor(assetPath) || assetPath) : null;
  
  // Calculate height based on width and aspect ratio
  const currentWidth = parseInt(width) || 400;
  const currentHeight = currentWidth / aspectRatio;

  const handlePlay = () => {
    window.dispatchEvent(new CustomEvent('rovo-media-play', { 
      detail: { sourceId: item.id } 
    }));
  };

  const handlePause = () => {
    window.dispatchEvent(new CustomEvent('rovo-media-pause', { 
      detail: { sourceId: item.id } 
    }));
  };

  return (
    <div 
      className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
      style={{ width: `${currentWidth}px` }}
    >
      {/* Title Bar */}
      {content.title && (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800 leading-tight">
            <TextWithTranslation text={content.title} />
          </h3>
        </div>
      )}

      {/* Video Player Area */}
      <div
        className="relative bg-black"
        style={{
          width: '100%',
          height: `${currentHeight}px`,
          transition: 'height 0.2s'
        }}
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={content.poster || undefined}
            preload={content.poster ? 'none' : 'metadata'}
            controls={!isEditing}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handlePause}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: isEditing ? 'none' : 'auto'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white bg-gray-900">
            <div className="text-center p-4">
              <p className="font-bold mb-1">Local Video Player</p>
              <p className="text-xs text-gray-400">Select a video in the editor</p>
            </div>
          </div>
        )}
        
        {/* Overlay for edit mode to ensure drag works */}
        {isEditing && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/0 transition-colors"
          >
            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
              Drag to move
            </div>
          </div>
        )}
      </div>

      {/* Description Footer */}
      {content.description && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="text-sm text-gray-600 leading-relaxed">
            <TextWithTranslation text={content.description} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalVideo;
