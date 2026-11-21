import React, { useRef, useState } from 'react';
import { Mic, Play, Pause } from 'lucide-react';
import { previewUrlFor } from '../../utils/publish';

const AudioNote = ({ item }) => {
  const { content } = item;
  const { title = 'Audio Note', audioUrl, duration = '0:00' } = content;
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const src = audioUrl ? (previewUrlFor(audioUrl) || audioUrl.replace(/^\//, '')) : null;
  const toggle = (e) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };

  return (
    <div
      className="audio-note"
      style={{
        width: '240px',
        backgroundColor: '#E0F2F1',
        padding: '16px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #80CBC4',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid #4DB6AC'
      }}>
        <Mic size={20} color="#00897B" />
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
        backgroundColor: '#FFFFFF',
        borderRadius: '4px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #B2DFDB'
      }}>
        {src && <audio ref={audioRef} src={src} preload="none" onEnded={() => setPlaying(false)} />}
        <button onClick={toggle} style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid #00897B',
          backgroundColor: '#E0F2F1',
          color: '#00897B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0
        }}>
          {audioUrl ? (playing ? <Pause size={20} /> : <Play size={20} />) : <Mic size={20} />}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            height: '4px',
            backgroundColor: '#B2DFDB',
            borderRadius: '2px',
            marginBottom: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: '0%',
              backgroundColor: '#00897B',
              borderRadius: '2px'
            }} />
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'right'
          }}>
            {duration}
          </div>
        </div>
      </div>

      {!audioUrl && (
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          No recording yet
        </div>
      )}
    </div>
  );
};

export default AudioNote;
