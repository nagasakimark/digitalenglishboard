import React, { useState, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { RotateCw } from 'lucide-react';
import { useBoardScale } from './BoardContext';

const DecorationItem = ({ decoration, isEditable = false, onUpdate, onSelect }) => {
  const { scale: boardScale } = useBoardScale();
  const [isHovered, setIsHovered] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const decorationRef = useRef(null);
  const manipulationDataRef = useRef({
    startAngle: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0
  });

  const handleRotateStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const imgElement = decorationRef.current.querySelector('img');
    const rect = imgElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    
    manipulationDataRef.current = {
      centerX,
      centerY,
      startAngle,
      startRotation: decoration.rotation || 0
    };
    
    setIsRotating(true);
  }, [decoration.rotation]);

  const handleRotateMove = useCallback((e) => {
    if (!isRotating) return;
    
    const { centerX, centerY, startAngle, startRotation } = manipulationDataRef.current;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    const deltaAngle = currentAngle - startAngle;
    const newRotation = startRotation + deltaAngle;
    
    if (onUpdate) {
      onUpdate(decoration.id, { rotation: newRotation });
    }
  }, [isRotating, decoration.id, onUpdate]);

  const handleRotateEnd = useCallback(() => {
    setIsRotating(false);
    setIsHovered(false);
  }, []);

  React.useEffect(() => {
    if (isRotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateEnd);
      return () => {
        window.removeEventListener('mousemove', handleRotateMove);
        window.removeEventListener('mouseup', handleRotateEnd);
      };
    }
  }, [isRotating, handleRotateMove, handleRotateEnd]);

  const handleClick = (e) => {
    if (onSelect && isEditable) {
      e.stopPropagation();
      onSelect(decoration);
    }
  };

  if (isEditable) {
    const currentSize = {
      width: 150 * (decoration.scale || 1),
      height: 150 * (decoration.scale || 1)
    };

    return (
      <Rnd
        position={{ x: decoration.position.x, y: decoration.position.y }}
        size={currentSize}
        scale={boardScale}
        onDragStop={(e, d) => {
          if (onUpdate) {
            onUpdate(decoration.id, {
              position: { x: d.x, y: d.y }
            });
          }
        }}
        onResize={(e, direction, ref, delta, position) => {
          const newWidth = parseInt(ref.style.width);
          const newScale = newWidth / 150;
          setSize({ width: newWidth, height: newWidth });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidth = parseInt(ref.style.width);
          const newScale = newWidth / 150;
          
          if (onUpdate) {
            onUpdate(decoration.id, {
              scale: newScale,
              position: position
            });
          }
        }}
        lockAspectRatio={true}
        disableDragging={isRotating}
        style={{
          zIndex: decoration.zIndex || 0,
          left: 0,
          top: 0
        }}
        resizeHandleStyles={{
          bottomRight: {
            width: '16px',
            height: '16px',
            background: 'white',
            border: '2px solid #10b981',
            borderRadius: '50%',
            right: '-8px',
            bottom: '-8px',
            cursor: 'nwse-resize'
          },
          topRight: {
            width: '16px',
            height: '16px',
            background: 'white',
            border: '2px solid #10b981',
            borderRadius: '50%',
            right: '-8px',
            top: '-8px',
            cursor: 'nesw-resize'
          },
          bottomLeft: {
            width: '16px',
            height: '16px',
            background: 'white',
            border: '2px solid #10b981',
            borderRadius: '50%',
            left: '-8px',
            bottom: '-8px',
            cursor: 'nesw-resize'
          },
          topLeft: {
            width: '16px',
            height: '16px',
            background: 'white',
            border: '2px solid #10b981',
            borderRadius: '50%',
            left: '-8px',
            top: '-8px',
            cursor: 'nwse-resize'
          }
        }}
      >
        <div
          ref={decorationRef}
          className="decoration-item"
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${decoration.rotation || 0}deg)`,
            transformOrigin: 'center center',
            cursor: 'move',
            position: 'relative',
            border: isHovered ? '2px dashed #3b82f6' : '2px dashed transparent',
            boxSizing: 'border-box'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            if (!isRotating) {
              setIsHovered(false);
            }
          }}
          onClick={handleClick}
        >
          <img
            src={decoration.imageUrl}
            alt="Decoration"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCAyNVY3NU0yNSA1MEg3NSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
            }}
            draggable={false}
          />
          
          {/* Rotation Handle - always show in editable mode */}
          <div
            onMouseDown={handleRotateStart}
            style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '24px',
              height: '24px',
              background: 'white',
              border: '2px solid #3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              cursor: 'grab',
              zIndex: 1001
            }}
          >
            <RotateCw size={14} color="#3b82f6" />
          </div>
        </div>
      </Rnd>
    );
  }

  // Non-editable view (student view)
  // Calculate explicit size to match Editor's Rnd behavior (which resizes from top-left)
  // instead of using scale() (which scales from center)
  const size = 150 * (decoration.scale || 1);

  return (
    <div
      className="decoration-item"
      style={{
        zIndex: decoration.zIndex || 0,
        position: 'absolute',
        left: decoration.position.x,
        top: decoration.position.y,
        width: `${size}px`,
        height: `${size}px`,
        // Only rotate, don't scale (size is handled by width/height)
        transform: `rotate(${decoration.rotation || 0}deg)`,
        transformOrigin: 'center center',
        display: 'inline-block'
      }}
    >
      <img
        src={decoration.imageUrl}
        alt="Decoration"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        onError={(e) => {
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCAyNVY3NU0yNSA1MEg3NSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
        }}
        draggable={false}
      />
    </div>
  );
};

export default DecorationItem;
