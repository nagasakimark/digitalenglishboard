import React, { useState, useEffect } from 'react';
import { addPendingFile } from '../../../utils/publish';

// Grab a frame from the video to use as its poster image (so students don't download the video until they press play)
const capturePoster = (file) => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.muted = true; v.preload = 'auto'; v.src = url;
  v.onloadeddata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 3); };
  v.onseeked = () => {
    const scale = Math.min(1, 640 / (v.videoWidth || 640));
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    resolve(c.toDataURL('image/jpeg', 0.75));
  };
  v.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
});

const LocalVideoEditor = ({ item, onUpdate }) => {
  const { content, width } = item;
  const [title, setTitle] = useState(content.title || '');
  const [description, setDescription] = useState(content.description || '');
  const [filename, setFilename] = useState(content.filename || '');

  // Sync local state with item content when item changes
  useEffect(() => {
    setTitle(content.title || '');
    setDescription(content.description || '');
    setFilename(content.filename || '');
  }, [item.id, content.title, content.description, content.filename]);

  const handleBlur = () => {
    onUpdate(item.id, {
      content: {
        ...content,
        filename,
        title,
        description
      }
    });
  };

  const handleFilenameChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const newFilename = file.name.replace(/\s+/g, '-');
    addPendingFile(`assets/videos/${newFilename}`, file);
    setFilename(newFilename);
    const poster = await capturePoster(file);
    onUpdate(item.id, {
      content: { ...content, filename: newFilename, ...(poster ? { poster } : {}) }
    });
  };

  const handleWidthChange = (e) => {
    onUpdate(item.id, { width: parseInt(e.target.value) || 300 });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          placeholder="Video Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video File
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Pick a video from your computer. It is uploaded when you press <b>Publish</b>.
          Keep videos under ~50 MB so they load quickly on school Wi-Fi.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={handleFilenameChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        {content.filename && (
          <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Selected File</div>
            <div className="text-sm font-medium text-gray-800 break-all">
              {content.filename}
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          placeholder="Add a description..."
          rows={3}
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Player Size
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="200"
            max="1000"
            step="10"
            value={parseInt(width) || 400}
            onChange={handleWidthChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-mono text-gray-600 w-16 text-right">
            {parseInt(width) || 400}px
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Adjust the width. The height will automatically scale to match the video's aspect ratio.
        </p>
      </div>
    </div>
  );
};

export default LocalVideoEditor;
