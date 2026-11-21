import React from 'react';
import TextWithTranslation from '../TextWithTranslation';
import { getTikTokVideoId } from '../../utils/tiktokHelper';

const TikTokEmbed = ({ item, isEditing }) => {
  const { videoUrl, title } = item.content;
  const videoId = getTikTokVideoId(videoUrl);

  if (!videoId) {
    return (
      <div
        className="tiktok-embed-card bg-white rounded-lg shadow-md overflow-hidden"
        style={{
          width: '325px',
          minHeight: '280px',
          transform: `rotate(${item.rotation || 0}deg)`,
        }}
      >
        <div className="p-4">
          <h3 className="font-handwriting text-lg mb-2">{title || 'TikTok Video'}</h3>
          <div className="bg-gray-100 rounded p-4 text-center text-gray-500">
            <p className="text-sm">Invalid TikTok URL</p>
            <p className="text-xs mt-2">Please enter a valid TikTok video URL</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="tiktok-embed-card bg-white rounded-lg shadow-md overflow-hidden relative"
      style={{
        width: '325px', // Standard TikTok embed width
        transform: `rotate(${item.rotation || 0}deg)`,
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 z-50 bg-transparent cursor-move drag-handle" />
      )}
      {/* Title bar */}
      <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
        <span className="text-lg">🎵</span>
        <h3 className="font-handwriting text-lg truncate">
          <TextWithTranslation text={title || 'TikTok Video'} />
        </h3>
      </div>

      {/* Video embed */}
      <div className="relative bg-black">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          className={`w-full ${isEditing ? 'pointer-events-none' : ''}`}
          style={{ height: '575px', border: 'none' }}
          allowFullScreen
          scrolling="no"
          loading="lazy"
          title={title || 'TikTok video player'}
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between border-t border-gray-100">
        <span>TikTok</span>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:underline"
        >
          Open in TikTok
        </a>
      </div>
    </div>
  );
};

export default TikTokEmbed;
