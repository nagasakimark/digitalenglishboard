import React from 'react';

const FileAttachmentCard = ({ item }) => {
  const { content } = item;
  
  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📗';
      case 'ppt':
      case 'pptx': return '📙';
      case 'txt': return '📝';
      case 'zip':
      case 'rar': return '🗜️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬';
      case 'mp3':
      case 'wav': return '🎵';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📄';
    }
  };

  const getFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = () => {
    if (content.fileUrl) {
      const link = document.createElement('a');
      link.href = content.fileUrl;
      link.download = content.fileName || 'download';
      link.click();
    }
  };

  return (
    <div
      className="file-attachment-card"
      style={{
        width: '280px',
        minHeight: '160px',
        backgroundColor: '#fff',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid #e5e5e5'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '24px',
            minWidth: '32px'
          }}>
            {getFileIcon(content.fileName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              margin: '0',
              color: '#1a1a1a',
              marginBottom: '2px'
            }}>
              {content.title || 'File Attachment'}
            </h3>
            {content.fileName && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {content.fileName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px'
      }}>
        {/* File Details */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '2px'
            }}>
              File Size
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#333'
            }}>
              {content.fileSize ? getFileSize(content.fileSize) : 'Unknown'}
            </div>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '2px'
            }}>
              Type
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              textTransform: 'uppercase'
            }}>
              {content.fileName ? content.fileName.split('.').pop() : 'File'}
            </div>
          </div>
        </div>

        {/* Description */}
        {content.description && (
          <div style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#555',
            marginBottom: '16px',
            backgroundColor: '#f9f9f9',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #eee'
          }}>
            {content.description}
          </div>
        )}

        {/* Download Button */}
        {content.fileUrl ? (
          <button
            onClick={handleDownload}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>📥</span> Download File
          </button>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontStyle: 'italic',
            fontSize: '14px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px dashed #dee2e6'
          }}>
            No file attached
          </div>
        )}
      </div>
    </div>
  );
};

export default FileAttachmentCard;