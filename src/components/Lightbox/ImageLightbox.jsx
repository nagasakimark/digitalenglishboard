import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageLightbox = ({ isOpen, imageUrl, title, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="lightbox-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000, // Higher than EventModal (9999)
          padding: '20px'
        }}
      >
        <motion.div
          className="lightbox-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '95vw',
            maxHeight: '95vh',
            position: 'relative'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '-40px',
              right: '0',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.4)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={24} />
          </button>

          <img
            src={imageUrl}
            alt={title || 'Full screen view'}
            style={{
              maxWidth: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          />
          
          {title && (
            <div style={{
              color: 'white',
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '18px',
              fontWeight: '500'
            }}>
              {title}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ImageLightbox;