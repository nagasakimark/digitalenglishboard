import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rnd } from 'react-rnd';
import Thumbtack from './Thumbtack';
import { useBoardScale } from './BoardContext';

const BoardItem = ({
  item,
  isEditable = false,
  onUpdate,
  onSelect,
  children
}) => {
  const { scale } = useBoardScale();
  const isDecoration = item.type === 'decoration';
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);

  const handleClick = (e) => {
    // Don't trigger click if we just finished dragging
    if (isDragging) {
      setIsDragging(false);
      return;
    }

    if (onSelect) {
      onSelect(item);
    }

    // Handle link clicks
    if (item.type === 'link' && item.content.url) {
      // In editor mode: Ctrl+click to open links
      // In student mode: any click opens links
      if (!isEditable || e.ctrlKey || e.metaKey) {
        window.open(item.content.url, '_blank');
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (e, data) => {
    if (isEditable && onUpdate) {
      onUpdate(item.id, {
        position: { x: data.x, y: data.y }
      });
    }
    // Keep isDragging true briefly to prevent click
    setTimeout(() => setIsDragging(false), 100);
  };

  const itemStyle = {
    zIndex: item.zIndex || 1,
    position: 'absolute',
    left: item.position.x,
    top: item.position.y,
    willChange: 'transform', // Performance optimization
  };

  if (isEditable) {
    return (
      <Rnd
        position={{ x: item.position.x, y: item.position.y }}
        scale={scale}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        dragHandleClassName="drag-handle"
        enableResizing={false}
        style={{ zIndex: item.zIndex || 1 }}
      >
        <motion.div
          ref={nodeRef}
          className="board-item"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative', // Reset position for inner content
            willChange: 'transform' // Performance optimization
          }}
          animate={{
            rotate: item.rotation || 0,
            scale: item.scale || 1
          }}
          whileHover={!isDecoration ? {
            rotate: 0,
            scale: (item.scale || 1) * 1.05,
            transition: { duration: 0.2 }
          } : undefined}
          onClick={handleClick}
        >
          {!isDecoration && item.type !== 'scavenger-item' && <Thumbtack />}
          <div className="item-content drag-handle">
            {children}
          </div>
        </motion.div>
      </Rnd>
    );
  }

  return (
    <motion.div
      className="board-item"
      style={itemStyle}
      animate={{
        rotate: item.rotation || 0,
        scale: item.scale || 1
      }}
      whileHover={!isDecoration ? {
        rotate: 0,
        scale: (item.scale || 1) * 1.05,
        transition: { duration: 0.2 }
      } : undefined}
      onClick={handleClick}
    >
      {!isDecoration && item.type !== 'scavenger-item' && <Thumbtack />}
      <div className="item-content">
        {children}
      </div>
    </motion.div>
  );
};

export default BoardItem;