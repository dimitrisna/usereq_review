import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import StarRating from '../common/StarRating';
import LinkedItemPreviewModal from './LinkedItemPreviewModal';

/**
 * Popup to show preview of previous/next screens
 */
const ScreenPreviewPopup = ({ screen, onClose, isNext }) => {
  const colorClass = isNext ? 'green' : 'blue'; // Green for next, blue for previous
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`bg-${colorClass}-50 rounded-lg shadow-xl p-4 max-w-xl w-full max-h-[90vh] overflow-y-auto border-l-4 border-${colorClass}-500`} 
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-semibold text-${colorClass}-800`}>
            {isNext ? '→ Next Screen: ' : '← Previous Screen: '} 
            {screen.title || `Screen #${screen.seq || ''}`}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="mb-3">
          {screen.description && (
            <p className="text-sm text-gray-600 mb-2">{screen.description}</p>
          )}
        </div>
        
        <div className={`border border-${colorClass}-200 rounded bg-white p-2 flex items-center justify-center`} style={{ minHeight: '300px' }}>
          {screen.url ? (
            <img 
              src={screen.url} 
              alt={screen.title || "Mockup"} 
              className="max-w-full max-h-[300px] object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
              }}
            />
          ) : (
            <div className="text-center text-gray-500">
              <p>No preview available</p>
              <p className="text-sm">Filename: {screen.filename}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Specialized modal for reviewing mockups with navigation between screens
 */
const MockupReviewModal = ({
  artifact,
  isOpen,
  onClose,
  onSave,
  initialReview = {},
  criteriaDefinitions = [],
  hasUnsavedChanges,
  onDirtyStateChange,
  onReviewChange,
  onPreviewLinkedItem,
  isAdmin = false
}) => {
  const [comment, setComment] = useState('');
  const [criteriaScores, setCriteriaScores] = useState({});
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // State for screen previews
  const [previewScreen, setPreviewScreen] = useState(null);
  const [isNextScreen, setIsNextScreen] = useState(false);
  
  // Determine if the current artifact is editable by this user
  const isEditable = isAdmin === true;

  // Initialize review data when modal opens
  useEffect(() => {
    if (isOpen && artifact) {
      console.log('[MockupReviewModal] Modal opened with artifact:', artifact);
      console.log('[MockupReviewModal] Initial review data:', initialReview);

      setComment(initialReview.comment || '');

      // Initialize criteria scores from initialReview or with zeros
      const scores = {};
      criteriaDefinitions.forEach(criteria => {
        scores[criteria.key] = initialReview.scores?.[criteria.key] || 0;
      });

      console.log('[MockupReviewModal] Setting criteria scores to:', scores);
      setCriteriaScores(scores);
    }
  }, [isOpen, artifact, initialReview, criteriaDefinitions]);

  // Track dirty state
  useEffect(() => {
    if (!isOpen || !artifact || !initialReview || !isEditable) return;

    // Only check for dirty state when modal is open and we have data
    const hasCommentChanged = comment !== (initialReview.comment || '');

    // Check if any score has changed
    let hasScoresChanged = false;
    criteriaDefinitions.forEach(criteria => {
      const originalScore = initialReview.scores?.[criteria.key] || 0;
      const currentScore = criteriaScores[criteria.key] || 0;
      if (originalScore !== currentScore) {
        hasScoresChanged = true;
      }
    });

    // Set the dirty flag based on changes
    const isDirty = hasCommentChanged || hasScoresChanged;
    if (onDirtyStateChange) {
      onDirtyStateChange(isDirty);
    }

  }, [isOpen, artifact, comment, criteriaScores, initialReview, criteriaDefinitions, onDirtyStateChange, isEditable]);

  const handleCriteriaChange = (key, value) => {
    if (!isEditable) return;
    
    console.log(`[MockupReviewModal] Criteria ${key} changed to ${value}`);

    // Create a new scores object with the updated value
    const newScores = { ...criteriaScores, [key]: value };
    setCriteriaScores(newScores);

    // Also notify parent component of the change
    if (onReviewChange) {
      onReviewChange({
        scores: newScores
      });
    }
  };

  const handleCommentChange = (e) => {
    if (!isEditable) return;
    
    const newComment = e.target.value;
    setComment(newComment);

    // Notify parent component
    if (onReviewChange) {
      onReviewChange({
        comment: newComment
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (!isEditable) return;
    
    // Make sure we're structuring the data correctly
    const reviewData = {
      comment,
      scores: criteriaScores
    };

    console.log('[MockupReviewModal] Saving review with data:', reviewData);

    // Pass the data to the parent component
    onSave(reviewData);
  };

  // Calculate overall rating as average of criteria scores
  const calculateOverallScore = () => {
    const scores = Object.values(criteriaScores);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((total, score) => total + score, 0);
    return sum / scores.length;
  };

  // Handle preview of a previous/next screen
  const handleScreenPreview = (screen, isNext) => {
    setPreviewScreen(screen);
    setIsNextScreen(isNext);
  };

  // Handle preview of linked items
  const handlePreviewItem = (item) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  if (!isOpen || !artifact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Mockups</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* Mockup Navigation */}
        {(artifact.previousScreens?.length > 0 || artifact.nextScreens?.length > 0) && (
          <div className="mb-6 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex flex-wrap justify-between">
              {artifact.previousScreens?.length > 0 && (
                <div className="mb-2 md:mb-0">
                  <span className="text-gray-600 mr-2">Previous Screens:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artifact.previousScreens.map(screen => (
                      <button 
                        key={screen._id} 
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm border border-blue-300 flex items-center"
                        onClick={() => handleScreenPreview(screen, false)}
                      >
                        <span className="mr-1">←</span>
                        {screen.title || `Screen #${screen.seq || ''}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {artifact.nextScreens?.length > 0 && (
                <div>
                  <span className="text-gray-600 mr-2">Next Screens:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artifact.nextScreens.map(screen => (
                      <button 
                        key={screen._id} 
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm border border-green-300 flex items-center"
                        onClick={() => handleScreenPreview(screen, true)}
                      >
                        {screen.title || `Screen #${screen.seq || ''}`}
                        <span className="ml-1">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="p-3 bg-gray-50 rounded overflow-y-auto" style={{ maxHeight: '400px' }}>
                <ReactMarkdown>{artifact.description || ''}</ReactMarkdown>
              </div>
            </div>

            {/* Render linked stories if they exist */}
            {artifact.storiesLinked?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Linked User Stories</h3>
                <div className="space-y-2">
                  {artifact.storiesLinked.map(story => (
                    <div
                      key={story._id}
                      className="bg-green-50 p-2 rounded cursor-pointer hover:bg-green-100"
                      onClick={() => handlePreviewItem(story)}
                    >
                      <span className="font-semibold">{story.title || `Story #${story.seq || ''}`}</span>
                      <span className="text-xs text-gray-500 ml-2">(Click to preview)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Mockup</h3>
              <div className="border border-gray-200 rounded flex items-center justify-center bg-gray-50 p-2" style={{ minHeight: '400px' }}>
                {artifact.url ? (
                  <img 
                    src={artifact.url} 
                    alt={artifact.title || "Mockup"} 
                    className="max-w-full max-h-[400px] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="mb-2">No mockup image available</p>
                    <p className="text-sm">Filename: {artifact.filename}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="font-semibold mb-4 text-lg">Review</h3>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Overall Rating (Auto-calculated)</h4>
            <div className="flex items-center">
              <StarRating
                value={calculateOverallScore()}
                size="lg"
                allowHalf={true}
                readOnly={true}
              />
              <span className="ml-3 text-gray-600">{calculateOverallScore().toFixed(1)}</span>
            </div>
          </div>

          {/* Criteria-specific ratings */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Evaluation Criteria</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criteriaDefinitions.map(criteria => (
                <div key={criteria.key} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{criteria.name}</span>
                    <StarRating
                      value={criteriaScores[criteria.key] || 0}
                      onChange={isEditable ? value => handleCriteriaChange(criteria.key, value) : undefined}
                      allowHalf={true}
                      readOnly={!isEditable}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{criteria.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">
              {isEditable ? 'Your Comments' : 'Reviewer Comments'}
            </h4>
            <textarea
              className={`w-full border border-gray-300 rounded p-2 ${!isEditable ? 'bg-gray-50' : ''}`}
              rows="6"
              style={{ height: '150px', resize: 'vertical' }}
              value={comment}
              onChange={handleCommentChange}
              placeholder={`${isEditable ? 'Add' : 'View'} comments about this mockup...`}
              readOnly={!isEditable}
              disabled={!isAdmin}
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
              onClick={handleClose}
            >
              {isEditable ? 'Cancel' : 'Close'}
            </button>
            {isEditable && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                onClick={handleSave}
              >
                Save Review
              </button>
            )}
          </div>
        </div>

        {/* Preview Modal for Linked Items */}
        {showPreviewModal && previewItem && (
          <LinkedItemPreviewModal
            isOpen={showPreviewModal}
            item={previewItem}
            onClose={() => setShowPreviewModal(false)}
          />
        )}
        
        {/* Screen Preview Popup */}
        {previewScreen && (
          <ScreenPreviewPopup 
            screen={previewScreen}
            isNext={isNextScreen}
            onClose={() => setPreviewScreen(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MockupReviewModal;