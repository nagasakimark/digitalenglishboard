import React, { useState, useEffect, useRef } from 'react';
import CustomHtmlRenderer from '../CustomHtmlRenderer';
import BoardContext from './BoardContext';
import './CorkBoard.css';

// Fixed dimensions for Chromebook target resolution
// This ensures pixel-perfect positioning between Editor and Student views
const BOARD_WIDTH = 1366;
const BOARD_HEIGHT = 768;

const CorkBoard = ({ children, backgroundImage, borderImage, customHtml, customCss, viewportHeight, contentHeight }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);

  // Calculate effective height based on content or default
  const effectiveHeight = Math.max(BOARD_HEIGHT, contentHeight || 0);

  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true);
    }
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // We need the width of the container's content box (excluding border)
        // clientWidth includes padding but excludes border.
        const parentWidth = containerRef.current.clientWidth;
        
        // Calculate scale to fit width
        // Ensure we don't divide by zero or get negative values
        if (parentWidth > 0) {
          const newScale = parentWidth / BOARD_WIDTH;
          setScale(newScale);
        }
      }
    };

    // Initial calculation
    updateScale();

    // Resize observer
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      resizeObserver.disconnect();
    };
  }, []);

  const containerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'local' // Ensures background scrolls with content
  } : {};

  const borderStyle = borderImage ? {
    border: '20px solid transparent',
    borderImage: `url(${borderImage}) 30 round`,
    borderImageSlice: '30 fill'
  } : {};

  // Wrapper style for viewport simulation
  const wrapperStyle = viewportHeight ? {
    height: `${viewportHeight * scale}px`,
    width: '100%',
    position: 'relative',
    boxShadow: '0 10px 20px rgba(0,0,0,0.5)', // Visual cue for viewport bottom
    marginBottom: '20px'
  } : {
    width: '100%',
    height: '100%'
  };

  // Board style (The Content + Border)
  const boardStyle = {
    ...borderStyle,
    height: viewportHeight ? `${viewportHeight * scale}px` : '100%',
    // Override CSS min-height: 100vh which causes overflow in flex containers
    minHeight: viewportHeight ? `${viewportHeight * scale}px` : '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  // Inner scrollable area
  const scrollableStyle = {
    ...containerStyle,
    width: '100%',
    position: 'relative',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
  };

  return (
    <BoardContext.Provider value={{ scale }}>
      <div style={wrapperStyle} className={viewportHeight ? "cork-board-viewport" : ""}>
        <div 
          ref={containerRef}
          className="cork-board-container" 
          style={boardStyle}
        >
          {/* Inner wrapper for scrolling and background */}
          <div 
            style={scrollableStyle} 
            className={`cork-board-surface cork-board-scroll-area ${isScrolling ? 'is-scrolling' : ''}`}
            onScroll={handleScroll}
          >
            {/* Custom effects render inside the board */}
            <CustomHtmlRenderer html={customHtml} css={customCss} />
            
            {/* Fixed-size content area matching Chromebook resolution */}
            <div 
              className="cork-board-content"
              style={{
                width: `${BOARD_WIDTH}px`,
                minHeight: `${effectiveHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                // Compensate for layout space not changing with transform
                marginBottom: `${-(effectiveHeight * (1 - scale))}px`,
                marginRight: `${-(BOARD_WIDTH * (1 - scale))}px`
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </BoardContext.Provider>
  );
};

export default CorkBoard;