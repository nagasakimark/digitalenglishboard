import React, { useEffect, useRef } from 'react';

const CustomHtmlRenderer = ({ html, css }) => {
  const styleRef = useRef(null);

  useEffect(() => {
    // Inject CSS into a style tag with modified z-index
    if (styleRef.current && css) {
      // Replace z-index: 9999 with z-index: 1 to render behind border
      const modifiedCss = css.replace(/z-index:\s*9999/g, 'z-index: 1');
      styleRef.current.textContent = modifiedCss;
    }
  }, [css]);

  if (!html && !css) return null;

  return (
    <>
      {/* Inject CSS */}
      {css && <style ref={styleRef} />}
      
      {/* Render HTML */}
      {html && (
        <div 
          className="custom-html-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </>
  );
};

export default CustomHtmlRenderer;
