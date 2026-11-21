import React from 'react';
import { Paperclip, FileText, File } from 'lucide-react';

const FileAttachment = ({ item }) => {
  const { content } = item;
  const { title = 'Attached File', fileName, fileUrl, fileType, fileSize } = content;

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FileText size={32} color="#7B1FA2" />;
    return <File size={32} color="#8E24AA" />;
  };
  
  const isImage = fileType?.startsWith('image/') || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

  return (
    <div
      className="file-attachment"
      style={{
        width: '200px',
        backgroundColor: '#F3E5F5',
        padding: '16px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #BA68C8',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #CE93D8'
      }}>
        <Paperclip size={16} color="#7B1FA2" />
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
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
        textAlign: 'center',
        border: '1px solid #E1BEE7'
      }}>
        {isImage && fileUrl ? (
          <div style={{ marginBottom: '12px' }}>
            <img 
              src={fileUrl} 
              alt={fileName || 'Attached image'}
              style={{
                maxWidth: '100%',
                maxHeight: '120px',
                borderRadius: '4px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', marginTop: '8px' }}>
              {getFileIcon(fileType)}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '12px' }}>
            {getFileIcon(fileType)}
          </div>
        )}

        <div style={{
          fontSize: '13px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '4px',
          wordBreak: 'break-word'
        }}>
          {fileName || 'No file attached'}
        </div>

        {fileSize && (
          <div style={{
            fontSize: '11px',
            color: '#999'
          }}>
            {typeof fileSize === 'number' ? `${(fileSize / 1024).toFixed(1)} KB` : fileSize}
          </div>
        )}
      </div>

      {fileUrl && (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <button style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px',
            backgroundColor: '#8E24AA',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Open File
          </button>
        </a>
      )}
    </div>
  );
};

export default FileAttachment;
