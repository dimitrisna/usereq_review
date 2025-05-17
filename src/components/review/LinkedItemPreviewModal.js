import React from 'react';
import ReactMarkdown from 'react-markdown';

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
 * Modal for previewing linked items (requirements, stories, etc.)
 * with proper formatting for stories
 */
const LinkedItemPreviewModal = ({ isOpen, item, onClose }) => {
  if (!isOpen || !item) return null;

  // Determine item type based on properties
  const itemType = item.text && item.title ? 'story' :
                  item.text ? 'requirement' :
                  item.filename?.includes('drawio') ? 'diagram' : 'unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {
              itemType === 'story' ? `Story: ${item.title || ''}` :
              itemType === 'requirement' ? `Requirement #${item.seq || ''}` : 
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

              <div className="border border-gray-200 rounded">
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Diagram preview not available</p>
                </div>
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

        <div className="mt-6 flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedItemPreviewModal;