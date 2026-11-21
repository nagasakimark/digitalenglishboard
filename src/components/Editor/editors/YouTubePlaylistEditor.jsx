import React, { useState, useEffect } from 'react';
import { getVideoId } from '../../../utils/youtubeHelper';

const YouTubePlaylistEditor = ({ item, onUpdate }) => {
    const [playlistText, setPlaylistText] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        // Only sync from item if we haven't edited yet or if item changed externally
        // But for simplicity, let's just sync on mount and when item.id changes
        if (item.content) {
            setTitle(item.content.title || '');
            setPlaylistText((item.content.playlist || []).join('\n'));
        }
    }, [item.id]);

    const handleUpdate = (newTitle, newPlaylistText) => {
        const urls = newPlaylistText.split('\n').filter(line => line.trim() !== '');
        const validUrls = urls.filter(url => getVideoId(url) !== null);

        onUpdate(item.id, {
            content: {
                ...item.content,
                title: newTitle,
                playlist: validUrls
            }
        });
    };

    const handlePlaylistChange = (e) => {
        const text = e.target.value;
        setPlaylistText(text);
    };

    const handlePlaylistBlur = () => {
        handleUpdate(title, playlistText);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        handleUpdate(title, playlistText);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Playlist Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    placeholder="My Awesome Playlist"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URLs (one per line)
                </label>
                <textarea
                    value={playlistText}
                    onChange={handlePlaylistChange}
                    onBlur={handlePlaylistBlur}
                    placeholder="https://www.youtube.com/watch?v=...\nhttps://youtu.be/..."
                    className="w-full p-2 border border-gray-300 rounded h-40 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                    {(item.content?.playlist || []).length} valid tracks found
                </p>
            </div>

            <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                <p>Tip: Copy and paste multiple YouTube links here. The player will play them in order.</p>
            </div>
        </div>
    );
};

export default YouTubePlaylistEditor;
