import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 fixed inset-0 z-50">
      <div className="flex flex-col items-center gap-6 w-80">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-bold text-lg">
            デジタル英語ボードを読み込んでいます
          </p>
          <p className="text-gray-500 text-sm">
            少々お待ちください...
          </p>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
