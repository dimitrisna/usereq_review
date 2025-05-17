// src/components/LinkedArtifactsDrawer.js
import React, { useState } from 'react';

const LinkedArtifactsDrawer = ({ isOpen, linkedItems, onClose, onSelectItem }) => {
  const [activeTab, setActiveTab] = useState('requirements');
  
  if (!isOpen) return null;
  
  const getItemCount = (type) => {
    return linkedItems[type]?.length || 0;
  };
  
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Linked Artifacts</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {['requirements', 'classDiagrams', 'stories', 'mockups'].map(tab => (
              getItemCount(tab) > 0 ? (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                  {getItemCount(tab) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {getItemCount(tab)}
                    </span>
                  )}
                </button>
              ) : null
            ))}
          </nav>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {linkedItems[activeTab]?.length > 0 ? (
            <div className="space-y-3">
              {linkedItems[activeTab].map(item => (
                <div 
                  key={item._id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => onSelectItem(activeTab, item)}
                >
                  <div className="font-medium">
                    {item.title || `#${item.seq || ''}`}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {item.text || item.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6">
              No linked {activeTab} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedArtifactsDrawer;