import React, { useState, useRef } from 'react';

const AudioNoteCard = ({ item }) => {
  const { content, color = '#f3e5f5' } = item;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        setError('Unable to play audio file');
        console.error('Audio play error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setError('');
    }
  };

  const handleError = () => {
    setError('Audio file not found or invalid');
    setIsPlaying(false);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="audio-note-card"
      style={{
        width: '300px',
        minHeight: '180px',
        background: '#f7f4f0',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}
    >
      {/* Audio element */}
      {content.audioUrl && (
        <audio
          ref={audioRef}
          src={content.audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
        />
      )}

      {/* Audio cassette texture */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: `
          linear-gradient(45deg, transparent 40%, rgba(139,69,19,0.05) 50%, transparent 60%),
          radial-gradient(circle at 30% 30%, rgba(139,69,19,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px, 12px 12px',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ fontSize: '18px' }}>🎵</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0',
              color: '#fff',
              marginBottom: '2px'
            }}>
              {content.title || 'Audio Note'}
            </h3>
            {content.description && (
              <div style={{
                fontSize: '12px',
                color: '#666'
              }}>
                {content.description}
              </div>
            )}
          </div>
        </div>

        {/* Audio Controls */}
        <div style={{ marginBottom: '16px' }}>
          {content.audioUrl ? (
            <>
              {/* Center Play Button and Progress */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <button
                  onClick={handlePlayPause}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: isPlaying ? '#667eea' : '#667eea',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                <div style={{ flex: 1 }}>
                  {/* Progress Bar */}
                  <div
                    onClick={handleSeek}
                    style={{
                      height: '4px',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      height: '100%',
                      backgroundColor: '#fff',
                      width: `${progressPercent}%`,
                      transition: 'width 0.1s ease',
                      borderRadius: '2px'
                    }} />
                  </div>

                  {/* Time Display */}
                  <div style={{
                    fontSize: '11px',
                    color: '#fff',
                    opacity: 0.8,
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              color: '#fff',
              opacity: 0.7,
              textAlign: 'center',
              padding: '20px 0',
              fontStyle: 'italic'
            }}>
              No audio file selected
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              color: '#ffcdd2',
              fontSize: '12px',
              marginTop: '8px',
              textAlign: 'center',
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              padding: '8px',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioNoteCard;