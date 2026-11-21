// Bookmark collection editor
import React, { useState, useEffect } from 'react';

const BookmarkEditor = ({ item, onUpdate }) => {
  const bookmarks = item.content.bookmarks || [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Bookmarks</label>
        {bookmarks.map((bookmark, index) => (
          <BookmarkItem
            key={index}
            bookmark={bookmark}
            index={index}
            bookmarks={bookmarks}
            item={item}
            onUpdate={onUpdate}
          />
        ))}
        <button
          onClick={() => {
            const newBookmarks = [...bookmarks, { title: '', url: '' }];
            onUpdate(item.id, {
              content: { ...item.content, bookmarks: newBookmarks }
            });
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Bookmark
        </button>
      </div>
    </div>
  );
};

// Separate component for each bookmark to manage local state
const BookmarkItem = ({ bookmark, index, bookmarks, item, onUpdate }) => {
  const [title, setTitle] = useState(bookmark.title || '');
  const [url, setUrl] = useState(bookmark.url || '');

  useEffect(() => {
    setTitle(bookmark.title || '');
    setUrl(bookmark.url || '');
  }, [bookmark.title, bookmark.url]);

  const handleBlur = () => {
    const newBookmarks = [...bookmarks];
    newBookmarks[index] = { ...bookmark, title, url };
    onUpdate(item.id, {
      content: { ...item.content, bookmarks: newBookmarks }
    });
  };

  return (
    <div className="flex gap-2 mb-2 p-3 border rounded">
      <div className="flex-1 space-y-2">
        <input
          type="text"
          placeholder="Bookmark title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>
      <button
        onClick={() => {
          const newBookmarks = bookmarks.filter((_, i) => i !== index);
          onUpdate(item.id, {
            content: { ...item.content, bookmarks: newBookmarks }
          });
        }}
        className="text-red-600 hover:text-red-800 self-start mt-2"
      >
        ✕
      </button>
    </div>
  );
};

export default BookmarkEditor;
