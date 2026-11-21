// File attachment editor
import React, { useState, useEffect } from 'react';

const FileAttachmentEditor = ({ item, onUpdate }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Upload File</label>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const fileName = `file-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
              const relativePath = `/files/${fileName}`;
              
              // Create download link for user to save file manually
              const reader = new FileReader();
              reader.onload = (event) => {
                const link = document.createElement('a');
                link.href = event.target.result;
                link.download = fileName;
                link.click();
                
                alert(`File will be saved as: ${fileName}\n\nPlease place this file in the public/files/ folder for it to be accessible.`);
              };
              reader.readAsDataURL(file);
              
              // Update the item with file info
              onUpdate(item.id, {
                content: { 
                  ...item.content, 
                  fileName: file.name,
                  fileUrl: relativePath,
                  fileSize: file.size,
                  fileType: file.type
                }
              });
            }
          }}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="text-xs text-gray-500 mt-1">
          Select a file to upload and generate relative URL
        </div>
      </div>
      <FileNameField item={item} onUpdate={onUpdate} />
      <FileUrlField item={item} onUpdate={onUpdate} />
      <FileDescriptionField item={item} onUpdate={onUpdate} />
    </div>
  );
};

// Separate components for text fields to manage local state
const FileNameField = ({ item, onUpdate }) => {
  const [fileName, setFileName] = useState(item.content.fileName || '');

  useEffect(() => {
    setFileName(item.content.fileName || '');
  }, [item.id]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">File Name</label>
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onBlur={() => {
          onUpdate(item.id, {
            content: { ...item.content, fileName }
          });
        }}
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  );
};

const FileUrlField = ({ item, onUpdate }) => {
  const [fileUrl, setFileUrl] = useState(item.content.fileUrl || '');

  useEffect(() => {
    setFileUrl(item.content.fileUrl || '');
  }, [item.id]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">File URL</label>
      <input
        type="text"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        onBlur={() => {
          onUpdate(item.id, {
            content: { ...item.content, fileUrl }
          });
        }}
        placeholder="/files/filename.pdf"
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  );
};

const FileDescriptionField = ({ item, onUpdate }) => {
  const [description, setDescription] = useState(item.content.description || '');

  useEffect(() => {
    setDescription(item.content.description || '');
  }, [item.id]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => {
          onUpdate(item.id, {
            content: { ...item.content, description }
          });
        }}
        rows={3}
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  );
};

export default FileAttachmentEditor;
