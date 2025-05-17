// src/components/ArtifactViewer.js
import React from 'react';

const ArtifactViewer = ({ url, filename, mimetype }) => {
  // Determine the file type
  const fileExtension = filename?.split('.').pop()?.toLowerCase();
  
  // Handle drawio files
  if (fileExtension === 'drawio' || filename?.includes('drawio')) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Drawio Diagram</p>
          <p className="text-sm text-gray-500">Filename: {filename}</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm mt-2 inline-block"
          >
            View Original
          </a>
        </div>
      </div>
    );
  }
  
  // Handle image formats
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(fileExtension) || 
      mimetype?.startsWith('image/')) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <img 
          src={url} 
          alt={filename || 'Preview'} 
          className="max-h-full max-w-full object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400x300?text=Image+Preview+Unavailable";
          }}
        />
      </div>
    );
  }
  
  // Handle PDF (simple link for now)
  if (fileExtension === 'pdf') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-2">PDF Document</p>
          <p className="text-sm text-gray-500">Filename: {filename}</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm mt-2 inline-block"
          >
            View PDF
          </a>
        </div>
      </div>
    );
  }
  
  // Default viewer for unknown types
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center text-gray-500">
        <div className="mb-2">File Preview</div>
        <p className="text-sm">Filename: {filename}</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm mt-2 inline-block"
        >
          Download File
        </a>
      </div>
    </div>
  );
};

export default ArtifactViewer;