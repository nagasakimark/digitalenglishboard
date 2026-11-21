import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const BatchImageExtractor = ({ items = [], decorations = [], onUpdate, onClose }) => {
  const [status, setStatus] = useState('idle'); // idle, processing, ready, done
  const [stats, setStats] = useState({ count: 0, size: 0 });

  const findBase64Images = () => {
    const itemImages = items.filter(item => 
      item.type === 'image' && 
      item.content?.imageUrl?.startsWith('data:image')
    );
    const decorationImages = decorations.filter(dec => 
      dec.imageUrl?.startsWith('data:image')
    );
    return { itemImages, decorationImages };
  };

  const handleExtract = async () => {
    setStatus('processing');
    const zip = new JSZip();
    const { itemImages, decorationImages } = findBase64Images();
    
    const newItems = [...items];
    const newDecorations = [...decorations];
    
    let totalSize = 0;
    let processedCount = 0;

    // Helper to process an image
    const processImage = (id, imageUrl, type) => {
      const base64Data = imageUrl.split(',')[1];
      const extension = imageUrl.substring(imageUrl.indexOf('/') + 1, imageUrl.indexOf(';'));
      const filename = `extracted-${Date.now()}-${processedCount}.${extension}`;
      
      zip.file(filename, base64Data, { base64: true });
      totalSize += base64Data.length;
      processedCount++;
      
      return `assets/images/${filename}`;
    };

    // Process Items
    itemImages.forEach((item) => {
      const newPath = processImage(item.id, item.content.imageUrl, 'item');
      const index = newItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        newItems[index] = {
          ...newItems[index],
          content: {
            ...newItems[index].content,
            imageUrl: newPath
          }
        };
      }
    });

    // Process Decorations
    decorationImages.forEach((dec) => {
      const newPath = processImage(dec.id, dec.imageUrl, 'decoration');
      const index = newDecorations.findIndex(d => d.id === dec.id);
      if (index !== -1) {
        newDecorations[index] = {
          ...newDecorations[index],
          imageUrl: newPath
        };
      }
    });

    // Generate ZIP
    const content = await zip.generateAsync({ type: "blob" });
    
    // Trigger Download
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = "rovo-extracted-images.zip";
    link.click();
    window.URL.revokeObjectURL(url);

    // Update Board Data
    onUpdate({ items: newItems, decorations: newDecorations });
    
    setStats({ count: processedCount, size: (totalSize / 1024 / 1024).toFixed(2) });
    setStatus('done');
  };

  const { itemImages, decorationImages } = findBase64Images();
  const totalCount = itemImages.length + decorationImages.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <RefreshCw className="text-blue-600" />
          Optimize Images
        </h2>

        {status === 'idle' && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-yellow-800">
                  <p className="font-bold mb-1">Found {totalCount} embedded images.</p>
                  <p>These are slowing down your board. This tool will:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>Download them as a ZIP file.</li>
                    <li>Update your board to reference them as files.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button 
                onClick={handleExtract}
                disabled={totalCount === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={18} />
                Extract & Convert
              </button>
            </div>
          </>
        )}

        {status === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Zipping images...</p>
          </div>
        )}

        {status === 'done' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">
              Extracted <strong>{stats.count}</strong> images ({stats.size} MB).
            </p>
            
            <div className="bg-blue-50 text-left p-4 rounded-lg text-sm text-blue-900 mb-6">
              <strong>Next Steps:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-2">
                <li>Unzip the downloaded file.</li>
                <li>Move the images into your project folder: <br/><code className="bg-white px-1 rounded border">public/assets/images/</code></li>
                <li><strong>Save your board</strong> now to apply the path changes.</li>
              </ol>
            </div>

            <button onClick={onClose} className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              Close & Save Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchImageExtractor;
