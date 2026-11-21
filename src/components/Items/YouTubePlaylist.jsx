import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, ExternalLink, Music } from 'lucide-react';
import TextWithTranslation from '../TextWithTranslation';
import { getVideoId, getThumbnailUrl } from '../../utils/youtubeHelper';

const YouTubePlaylist = ({ item }) => {
    const { playlist = [], title } = item.content;
    const playlistRef = useRef(playlist);
    
    // Keep playlist ref in sync for callbacks
    useEffect(() => {
        playlistRef.current = playlist;
    }, [playlist]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    
    // New state for metadata
    const [videoTitle, setVideoTitle] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [wasPlayingBeforeInterruption, setWasPlayingBeforeInterruption] = useState(false);
    
    const playerRef = useRef(null);
    const progressInterval = useRef(null);

    // Listen for other media playing
    useEffect(() => {
        const handleMediaPlay = (e) => {
            // If another source started playing and we are currently playing
            if (e.detail.sourceId !== item.id && isPlaying) {
                setWasPlayingBeforeInterruption(true);
                if (playerRef.current && playerRef.current.pauseVideo) {
                    playerRef.current.pauseVideo();
                }
            }
        };

        const handleMediaPause = (e) => {
            // If another source stopped and we were interrupted
            if (e.detail.sourceId !== item.id && wasPlayingBeforeInterruption) {
                setWasPlayingBeforeInterruption(false);
                if (playerRef.current && playerRef.current.playVideo) {
                    playerRef.current.playVideo();
                }
            }
        };

        window.addEventListener('rovo-media-play', handleMediaPlay);
        window.addEventListener('rovo-media-pause', handleMediaPause);

        return () => {
            window.removeEventListener('rovo-media-play', handleMediaPlay);
            window.removeEventListener('rovo-media-pause', handleMediaPause);
        };
    }, [item.id, isPlaying, wasPlayingBeforeInterruption]);

    const stopProgressTracking = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
    };

    const startProgressTracking = () => {
        stopProgressTracking();
        progressInterval.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 1000);
    };

    // Initialize YouTube API
    useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const onPlayerReady = (event) => {
            console.log('YouTube Player Ready', item.id);
            if (isMounted) {
                setPlayerReady(true);
                if (timeoutId) clearTimeout(timeoutId);
            }
        };

        const onPlayerStateChange = (event) => {
            console.log('Player State Change:', event.data);
            if (event.data === window.YT.PlayerState.ENDED) {
                handleNext();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
                if (isMounted) {
                    setIsPlaying(true);
                    // Fetch video data when playing starts
                    if (playerRef.current && playerRef.current.getVideoData) {
                        const data = playerRef.current.getVideoData();
                        if (data && data.title) setVideoTitle(data.title);
                        setDuration(playerRef.current.getDuration());
                    }
                    // Start progress tracking
                    startProgressTracking();
                }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
                if (isMounted) {
                    setIsPlaying(false);
                    stopProgressTracking();
                }
            }
        };

        const initPlayer = () => {
            console.log('initPlayer called', { isMounted, hasYT: !!window.YT, hasPlayer: !!(window.YT && window.YT.Player) });
            if (!isMounted) return;
            if (!window.YT || !window.YT.Player) {
                return;
            }
            if (playerRef.current) {
                console.log('Player already initialized');
                return;
            }

            const currentVideoId = getVideoId(playlist[currentIndex]) || 'dQw4w9WgXcQ'; // Default fallback

            // Ensure the element exists before creating player
            const playerElement = document.getElementById(`youtube-player-${item.id}`);
            console.log('Target element found:', !!playerElement, `youtube-player-${item.id}`);
            if (!playerElement) return;

            try {
                console.log('Creating YT.Player instance...');
                playerRef.current = new window.YT.Player(`youtube-player-${item.id}`, {
                    height: '1',
                    width: '1',
                    videoId: currentVideoId,
                    playerVars: {
                        'playsinline': 1,
                        'controls': 0,
                        'disablekb': 1,
                        'origin': window.location.origin
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange,
                        'onError': (e) => {
                            console.error('YouTube Player Error Event:', e);
                            
                            // Handle restricted/unavailable videos (100, 101, 150)
                            if (e.data === 100 || e.data === 101 || e.data === 150) {
                                console.warn(`Video unavailable (Error ${e.data}), skipping to next track`);
                                if (playlistRef.current && playlistRef.current.length > 1) {
                                    setCurrentIndex(prev => (prev + 1) % playlistRef.current.length);
                                    setIsPlaying(true);
                                    return;
                                }
                            }

                            if (isMounted) setLoadError(true);
                        }
                    }
                });
                console.log('YT.Player constructor finished');
            } catch (e) {
                console.error("Failed to initialize YouTube player exception:", e);
                if (isMounted) setLoadError(true);
            }
        };

        // Robust API Loading
        if (!window.YT) {
            // Check if script is already in DOM to avoid duplicates
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                tag.onerror = () => {
                    if (isMounted) {
                        console.error('Failed to load YouTube IFrame API script');
                        setLoadError(true);
                    }
                };
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            // Setup global callback if not already set
            if (!window.onYouTubeIframeAPIReady) {
                window.onYouTubeIframeAPIReady = () => {
                    // Dispatch a custom event so all components know API is ready
                    window.dispatchEvent(new Event('youtubeApiReady'));
                };
            }
        }

        // Listen for API ready event
        const handleApiReady = () => {
            console.log('youtubeApiReady event received');
            initPlayer();
        };

        window.addEventListener('youtubeApiReady', handleApiReady);

        // If API is already ready, initialize immediately
        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        // Timeout check - wait for PLAYER readiness, not just API
        timeoutId = setTimeout(() => {
            // Check if unmounted or if playerRef is already set (meaning init started)
            // We can't rely on playerReady state here because of closure, so we check if we have a player instance
            if (isMounted && !playerRef.current) {
                console.warn('Player initialization timed out (5s)');
                setLoadError(true);
            }
        }, 5000);

        return () => {
            isMounted = false;
            window.removeEventListener('youtubeApiReady', handleApiReady);
            if (timeoutId) clearTimeout(timeoutId);
            stopProgressTracking();

            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.error('Error destroying YouTube player:', e);
                }
                playerRef.current = null;
            }
            setPlayerReady(false);
        };
    }, [item.id, retryCount]);

    // Update thumbnail when playlist item changes
    useEffect(() => {
        if (playlist[currentIndex]) {
            const videoId = getVideoId(playlist[currentIndex]);
            if (videoId) {
                setThumbnailUrl(getThumbnailUrl(videoId));
                // Reset progress when song changes
                setCurrentTime(0);
            }
        }
    }, [currentIndex, playlist]);

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle playlist changes
    useEffect(() => {
        if (playerReady && playerRef.current && typeof playerRef.current.loadVideoById === 'function' && playlist[currentIndex]) {
            const videoId = getVideoId(playlist[currentIndex]);
            if (videoId) {
                if (isPlaying) {
                    playerRef.current.loadVideoById(videoId);
                } else {
                    playerRef.current.cueVideoById(videoId);
                }
            }
        }
    }, [currentIndex, playlist, playerReady]);

    const togglePlay = () => {
        console.log(`togglePlay called. Ready: ${playerReady}, Ref: ${!!playerRef.current}, YT: ${!!window.YT}`);
        if (!playerReady || !playerRef.current || typeof playerRef.current.playVideo !== 'function') {
            console.warn('Player not ready or invalid ref');
            return;
        }

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

    const getCurrentUrl = () => {
        return playlist[currentIndex] || '';
    };

    const handleRetry = () => {
        setLoadError(false);
        setPlayerReady(false);
        setRetryCount(c => c + 1);
    };

    const renderContent = () => {
        if (loadError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-6">
                    <Music className="text-red-400 mb-2" size={24} />
                    <p className="text-sm text-red-500 text-center font-medium">Player Unavailable</p>
                    <button
                        onClick={handleRetry}
                        className="text-xs text-blue-500 hover:underline mt-1"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (!playlist || playlist.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-6">
                    <Music className="text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-500 text-center">No songs in playlist</p>
                </div>
            );
        }

        return (
            <div className="p-4 bg-gray-900 text-white relative overflow-hidden h-full flex flex-col justify-between">
                {/* Background Blur */}
                {thumbnailUrl && (
                    <div 
                        className="absolute inset-0 opacity-30 bg-center bg-cover blur-md pointer-events-none"
                        style={{ backgroundImage: `url(${thumbnailUrl})` }}
                    />
                )}
                
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-300 font-mono">
                                TRACK {currentIndex + 1}/{playlist.length}
                            </span>
                        </div>
                        {/* no "open on YouTube" link: students stay on the board */}
                    </div>

                    {/* Track Info */}
                    <div className="flex gap-3 mb-4">
                        {thumbnailUrl ? (
                            <img 
                                src={thumbnailUrl} 
                                alt="Album Art" 
                                className="w-16 h-16 rounded-md object-cover shadow-lg border border-white/10" 
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-md bg-gray-800 flex items-center justify-center">
                                <Music size={24} className="text-gray-600" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-medium text-sm text-white truncate leading-tight mb-1" title={videoTitle}>
                                <TextWithTranslation text={videoTitle || title || 'Loading...'} />
                            </h3>
                            <p className="text-xs text-gray-400 truncate">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-4 overflow-hidden backdrop-blur-sm">
                        <div 
                            className="bg-red-500 h-full rounded-full transition-all duration-300 ease-linear"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={handlePrev}
                            className={`text-gray-300 hover:text-white transition-colors ${(!playerReady || playlist.length <= 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!playerReady || playlist.length <= 1}
                        >
                            <SkipBack size={24} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-all ${
                                !playerReady 
                                    ? 'bg-gray-700 cursor-not-allowed' 
                                    : 'bg-white text-black hover:scale-105 active:scale-95'
                            }`}
                            disabled={!playerReady}
                        >
                            {!playerReady ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />
                            )}
                        </button>

                        <button
                            onClick={handleNext}
                            className={`text-gray-300 hover:text-white transition-colors ${(!playerReady || playlist.length <= 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!playerReady || playlist.length <= 1}
                        >
                            <SkipForward size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="youtube-playlist-card bg-white rounded-lg shadow-md overflow-hidden"
            style={{
                width: '300px',
                minHeight: '120px',
                transform: `rotate(${item.rotation || 0}deg)`,
            }}
        >
            {/* Hidden Player Container - Always present */}
            <div className="absolute opacity-0 pointer-events-none" style={{ zIndex: -1 }}>
                <div id={`youtube-player-${item.id}`}></div>
            </div>

            {renderContent()}
        </div>
    );
};

export default YouTubePlaylist;
