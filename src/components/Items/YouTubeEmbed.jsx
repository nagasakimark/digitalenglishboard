import React from 'react';
import TextWithTranslation from '../TextWithTranslation';
import { getVideoId } from '../../utils/youtubeHelper';

const YouTubeEmbed = ({ item, isEditing }) => {
  const { videoUrl, title } = item.content;

  // getVideoId is now imported from utils

  const videoId = getVideoId(videoUrl);
  const isShorts = videoUrl && videoUrl.includes('/shorts/');

  if (!videoId) {
    return (
      <div
        className="youtube-embed-card bg-white rounded-lg shadow-md overflow-hidden"
        style={{
          width: '400px',
          minHeight: '280px',
          transform: `rotate(${item.rotation || 0}deg)`,
        }}
      >
        <div className="p-4">
          <h3 className="font-handwriting text-lg mb-2">{title || 'YouTube Video'}</h3>
          <div className="bg-gray-100 rounded p-4 text-center text-gray-500">
            <p className="text-sm">Invalid YouTube URL</p>
            <p className="text-xs mt-2">Please enter a valid YouTube video URL</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="youtube-embed-card bg-white rounded-lg shadow-md overflow-hidden relative"
      style={{
        width: isShorts ? '280px' : '400px',
        transform: `rotate(${item.rotation || 0}deg)`,
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 z-50 bg-transparent cursor-move drag-handle" />
      )}
      {/* Title bar */}
      <div className="bg-red-600 text-white px-4 py-2">
        <h3 className="font-handwriting text-lg truncate">
          <TextWithTranslation text={title || (isShorts ? 'YouTube Short' : 'YouTube Video')} />
        </h3>
      </div>

      {/* Video embed */}
      <div className="relative" style={{ paddingBottom: isShorts ? '177.77%' : '56.25%' }}>
        <iframe
          className={`absolute top-0 left-0 w-full h-full ${isEditing ? 'pointer-events-none' : ''}`}
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Footer with YouTube branding */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
        <span>{isShorts ? '📱 Shorts' : '▶️ YouTube'}</span>

      </div>
    </div>
  );
};

export default YouTubeEmbed;
