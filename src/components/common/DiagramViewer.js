// src/components/common/DiagramViewer.js
import React, { useState } from 'react';

/**
 * Component for viewing diagrams, particularly drawio files
 */
const DiagramViewer = ({ url, filename, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Iframe viewer URL for drawio files
  const iframeUrl = `https://viewer.diagrams.net/?url=${encodeURIComponent(url)}&highlight=0000ff`;

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <iframe
        src={iframeUrl}
        width="100%"
        height="450"
        frameBorder="0"
        allowFullScreen
        title={title || "Diagram"}
        onLoad={() => setIsLoading(false)}
        onError={() => setError("Could not load diagram")}
      />

      {error && (
        <div className="mt-2 p-3 bg-red-50 text-red-600 rounded text-sm">
          {error}
          <div className="mt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open original file
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramViewer;
