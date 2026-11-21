import { awardSticker } from '../../utils/stickers';
import React, { useRef, useEffect, useState } from 'react';
import TextWithTranslation from '../TextWithTranslation';

const ScratchCard = ({ item, isEditable }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const { content, width = 300 } = item;
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Fill with scratch layer
    ctx.fillStyle = content.scratchColor || '#C0C0C0'; // Silver default
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise/texture to look like foil
    if (!content.scratchImage) {
      addNoise(ctx, canvas.width, canvas.height);
      
      // Add text "Scratch Me!"
      ctx.fillStyle = '#666';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Scratch Here!', canvas.width / 2, canvas.height / 2);
    } else {
      // Load scratch image if provided
      const img = new Image();
      img.src = content.scratchImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }

    // Setup drawing
    ctx.globalCompositeOperation = 'destination-out';
    
    // Check if already revealed in this session (optional, maybe reset on reload?)
    // For now, let's keep it fresh on reload unless we want persistence
  }, [width, content.scratchColor, content.scratchImage]);

  const addNoise = (ctx, w, h) => {
    const idata = ctx.getImageData(0, 0, w, h);
    const buffer32 = new Uint32Array(idata.data.buffer);
    const len = buffer32.length;

    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.1) {
        buffer32[i] = 0xffaaaaaa; // Light noise
      }
    }
    ctx.putImageData(idata, 0, 0);
  };

  const handleMouseMove = (e) => {
    if (isEditable || isRevealed) return;
    
    // Only scratch if mouse button is pressed (buttons === 1) or it's a touch event
    const isTouch = e.type.startsWith('touch');
    if (!isTouch && e.buttons !== 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (isTouch) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    checkRevealProgress();
  };

  const checkRevealProgress = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Sample pixels to see how much is transparent
    // Optimization: only check every 10th pixel
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let transparentPixels = 0;
    const totalPixels = data.length / 4;
    
    for (let i = 0; i < totalPixels; i += 10) {
      if (data[i * 4 + 3] === 0) {
        transparentPixels++;
      }
    }
    
    if (transparentPixels / (totalPixels / 10) > 0.5) {
      setIsRevealed(true);
      awardSticker(item);
      canvas.style.opacity = 0; // Fade out rest
      canvas.style.pointerEvents = 'none';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="scratch-card"
      style={{
        width: `${width}px`,
        minHeight: `${width * 0.7}px`,
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '4px solid white'
      }}
    >
      {/* Hidden Content */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          background: content.backgroundColor || '#f0f9ff'
        }}
      >
        {content.imageUrl && (
          <img 
            src={content.imageUrl} 
            alt="Prize" 
            style={{ maxWidth: '80%', maxHeight: '60%', marginBottom: '10px', objectFit: 'contain' }} 
          />
        )}
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          <TextWithTranslation text={content.text || 'You won!'} />
        </div>
      </div>

      {/* Scratch Layer */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseDown={(e) => handleMouseMove(e)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><circle cx=\'12\' cy=\'12\' r=\'10\'/></svg>") 12 12, auto',
          transition: 'opacity 0.5s ease',
          touchAction: 'none'
        }}
      />
    </div>
  );
};

export default ScratchCard;
