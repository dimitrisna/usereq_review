import React from 'react';
import ReactMarkdown from 'react-markdown';
import DiagramViewer from '../common/DiagramViewer';

/**
 * Helper to format Gherkin-style user stories with color highlighting
 */
const formatStoryText = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  let currentContext = null;

  const getStyledLine = (keyword, colorClass, line, index) => {
    const restOfLine = line.slice(keyword.length);
    return (
      <p key={index}>
        <span className={colorClass}>{keyword}</span>{restOfLine}
      </p>
    );
  };

  return (
    <div className="font-mono text-sm">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (/^Feature:/i.test(trimmedLine)) {
          return getStyledLine('Feature:', 'text-purple-700 font-bold', trimmedLine, index);
        }
        else if (/^Scenario:/i.test(trimmedLine)) {
          return getStyledLine('Scenario:', 'text-blue-700 font-bold', trimmedLine, index);
        }
        else if (/^Given\s/i.test(trimmedLine)) {
          currentContext = 'given';
          return getStyledLine('Given ', 'text-green-700 font-semibold', trimmedLine, index);
        }
        else if (/^When\s/i.test(trimmedLine)) {
          currentContext = 'when';
          return getStyledLine('When ', 'text-yellow-600 font-semibold', trimmedLine, index);
        }
        else if (/^Then\s/i.test(trimmedLine)) {
          currentContext = 'then';
          return getStyledLine('Then ', 'text-red-700 font-semibold', trimmedLine, index);
        }
        else if (/^And\s/i.test(trimmedLine)) {
          let colorClass = 'text-gray-700 font-semibold';
          if (currentContext === 'given') colorClass = 'text-green-700 font-semibold';
          else if (currentContext === 'when') colorClass = 'text-yellow-600 font-semibold';
          else if (currentContext === 'then') colorClass = 'text-red-700 font-semibold';
          return getStyledLine('And ', colorClass, trimmedLine, index);
        }
        else if (/^(As a |I want to |So that )/i.test(trimmedLine)) {
          return <p key={index}><span className="text-indigo-700">{trimmedLine}</span></p>;
        }
        else if (trimmedLine === '') {
          currentContext = null;
          return <p key={index}>&nbsp;</p>;
        }
        else {
          return <p key={index}>{line}</p>;
        }
      })}
    </div>
  );
};

/**
 * Modal for previewing linked items (requirements, stories, diagrams, etc.)
 * with proper rendering for each type, including diagrams
 */
const LinkedItemPreviewModal = ({ isOpen, item, onClose }) => {
  if (!isOpen || !item) return null;

  // Improved item type detection
  const isDiagram = item.url && (
    item.filename?.toLowerCase().includes('.drawio') || 
    item.mimetype?.includes('application/xml') ||
    (item.url?.toLowerCase().includes('.png') || item.url?.toLowerCase().includes('.jpg') || item.url?.toLowerCase().includes('.svg'))
  );

  const itemType = item.text && item.title ? 'story' :
                  item.text ? 'requirement' :
                  isDiagram ? 'diagram' : 'unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" 
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {
              itemType === 'story' ? `Story: ${item.title || ''}` :
              itemType === 'requirement' ? `Requirement #${item.seq || ''}` : 
              itemType === 'diagram' ? `Diagram: ${item.title || ''}` :
              item.title || 'Item Preview'
            }
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content area */}
        <div className="space-y-4">
          {/* For user stories */}
          {itemType === 'story' && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Story Text</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  {formatStoryText(item.text)}
                </div>
              </div>

              {item.requirementsLinked && item.requirementsLinked.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Linked Requirements</h3>
                  <div className="space-y-2">
                    {item.requirementsLinked.map(req => (
                      <div key={req._id} className="p-2 bg-blue-50 rounded border border-blue-100">
                        <span className="font-semibold">#{req.seq || 'N/A'}:</span> {req.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* For requirements */}
          {itemType === 'requirement' && (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Requirement Text</h3>
                <div className="p-3 bg-gray-50 rounded border border-gray-200 mt-1">
                  <p>{item.text}</p>
                </div>
              </div>

              {item.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 mt-1">
                    <ReactMarkdown>{item.description}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {item.type && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 mt-1">
                      <p>{item.type}</p>
                    </div>
                  </div>
                )}

                {(item.user_priority || item.system_priority) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 mt-1">
                      {item.user_priority && (
                        <p>User: {item.user_priority}</p>
                      )}
                      {item.system_priority && (
                        <p>System: {item.system_priority}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* For diagrams */}
          {itemType === 'diagram' && (
            <>
              {item.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 mt-1">
                    <ReactMarkdown>{item.description}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded mt-4">
                {item.url ? (
                  <div className="w-full" style={{ height: '400px' }}>
                    {/* Use the DiagramViewer for .drawio files */}
                    {item.filename?.toLowerCase().includes('.drawio') || 
                     item.mimetype?.includes('application/xml') ? (
                      <DiagramViewer 
                        url={item.url} 
                        filename={item.filename}
                        title={item.title}
                        mimetype={item.mimetype}
                      />
                    ) : (
                      /* For regular image files */
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 p-2">
                        <img 
                          src={item.url} 
                          alt={item.title || "Diagram"} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">
                      Diagram preview not available
                      {item.filename && <span className="block mt-1 text-sm">File: {item.filename}</span>}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Unknown item type */}
          {itemType === 'unknown' && (
            <div className="p-3 bg-gray-50 rounded text-center">
              <p>No preview available for this item type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedItemPreviewModal;