import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import UnsavedChangesModal from '../components/common/UnsavedChangesModal';
import ReviewCriteriaRubric from '../components/review/ReviewCriteriaRubric';
import StarRating from '../components/common/StarRating';
import { useAuth } from '../contexts/AuthContext';
import {
  getStoriesReviewData,
  submitReview,
  saveGeneralComment
} from '../services/api';

// Define the criteria for stories
const storyCriteria = [
  {
    name: "User Focus",
    key: "userFocusScore",
    description: "Story clearly identifies the user role"
  },
  {
    name: "Value Proposition",
    key: "valuePropositionScore",
    description: "Story clearly states the benefit to the user"
  },
  {
    name: "Acceptance Criteria",
    key: "acceptanceCriteriaScore",
    description: "Clear criteria for when the story is complete"
  },
  {
    name: "Size/Scope",
    key: "sizeScore",
    description: "Story is appropriately sized for implementation"
  },
  {
    name: "Independence",
    key: "independenceScore",
    description: "Story can be implemented independently"
  }
];

const StoriesPage = () => {
  const { projectId } = useParams();
  const [stories, setStories] = useState([]);
  const [generalComment, setGeneralComment] = useState('');
  const [originalGeneralComment, setOriginalGeneralComment] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [projectName, setProjectName] = useState('');

  // Preview modal for linked requirements
  const [previewRequirement, setPreviewRequirement] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Aggregated rubric data
  const [aggregateRubric, setAggregateRubric] = useState({
    criteriaAverages: {},
    overallScore: 0,
    reviewCount: 0
  });

  const [reviewDirty, setReviewDirty] = useState(false);
  const [currentReview, setCurrentReview] = useState({
    comment: '',
    scores: {}
  });

  // Track if comment is dirty (has unsaved changes)
  const [commentDirty, setCommentDirty] = useState(false);

  const { currentUser } = useAuth();

  // Function to refresh aggregate rubric data
  const refreshAggregateRubricData = async () => {
    try {
      console.log('Refreshing aggregate rubric data');

      // Directly re-fetch the review data to get updated aggregate information
      const response = await getStoriesReviewData(projectId);

      // Only update the aggregate rubric portion of state
      if (response.data.aggregateRubric) {
        console.log('Updated aggregate rubric from API:', response.data.aggregateRubric);
        setAggregateRubric(response.data.aggregateRubric);
      }
    } catch (err) {
      console.error('Error refreshing aggregate data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getStoriesReviewData(projectId);
        console.log('API Response:', response.data);

        if (response.data.projectName) {
          setProjectName(response.data.projectName);
        }

        const { artifacts, generalComment, aggregateRubric } = response.data;
        console.log('✅ Parsed aggregateRubric:', aggregateRubric);
        setStories(artifacts || []);
        setGeneralComment(generalComment || '');
        setOriginalGeneralComment(generalComment || '');

        setAggregateRubric(aggregateRubric || {
          criteriaAverages: {},
          overallScore: 0,
          reviewCount: 0
        });
      } catch (err) {
        console.error('Error fetching stories data:', err);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Check if general comment has changed
  useEffect(() => {
    setCommentDirty(generalComment !== originalGeneralComment);
  }, [generalComment, originalGeneralComment]);

  const openReviewModal = (story) => {
    console.log('Opening review modal for story:', story);
    setSelectedStory(story);

    // Initialize current review state
    const reviewData = {
      comment: story.comment || '',
      scores: story.scores || {
        userFocusScore: 0,
        valuePropositionScore: 0,
        acceptanceCriteriaScore: 0,
        sizeScore: 0,
        independenceScore: 0
      }
    };

    setCurrentReview(reviewData);
    setReviewDirty(false);
    setShowModal(true);
  };

  // Handler for dirty state changes from the modal
  const handleReviewDirtyChange = (isDirty) => {
    setReviewDirty(isDirty);
  };

  const handleCloseReviewModal = () => {
    if (reviewDirty) {
      setShowUnsavedChangesModal(true);
    } else {
      setShowModal(false);
      setSelectedStory(null);
      setCurrentReview({ comment: '', scores: {} });
    }
  };

  const handleUnsavedChangesModalAction = (action) => {
    setShowUnsavedChangesModal(false);

    if (action === 'save') {
      saveReview();
    } else if (action === 'discard') {
      setShowModal(false);
      setSelectedStory(null);
      setCurrentReview({ comment: '', scores: {} });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Calculate overall rating from category scores
  const calculateReviewOverallScore = useCallback(() => {
    const scores = Object.values(currentReview.scores || {});
    if (scores.length === 0) return 0;
    // Filter out undefined or null values
    const validScores = scores.filter(score => score !== undefined && score !== null);
    if (validScores.length === 0) return 0;

    const sum = validScores.reduce((total, score) => total + (Number(score) || 0), 0);
    return sum / validScores.length;
  }, [currentReview.scores]);

  const saveReview = async () => {
    try {
      if (!selectedStory) {
        console.error('No story selected!');
        return;
      }

      // Calculate overall rating from category scores
      const overallRating = calculateReviewOverallScore();
      console.log('Calculated overall rating:', overallRating);
      console.log('Current scores:', currentReview.scores);

      try {
        const response = await submitReview(
          'story',
          selectedStory._id,
          overallRating,
          currentReview.comment,
          currentReview.scores
        );

        console.log('API response:', response.data);

        // Create a completely new object for the updated story
        const updatedStory = {
          ...selectedStory,
          rating: overallRating,
          comment: currentReview.comment,
          scores: { ...currentReview.scores },
          reviewed: true
        };

        // Create a new array with the updated story
        const updatedStories = stories.map(story =>
          story._id === selectedStory._id ? updatedStory : story
        );

        // Update state
        setStories(updatedStories);
        setReviewDirty(false);
        setShowModal(false);
        setSelectedStory(null);

        // Refresh aggregate data
        await refreshAggregateRubricData();

        // Show success toast notification
        showToast('Review saved successfully!');
      } catch (error) {
        console.error('API call failed:', error);
        showToast('Error saving review: ' + (error.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error('Error in save process:', err);
      showToast('Failed to process review. Please try again.', 'error');
    }
  };

  const saveGeneralCommentHandler = async () => {
    try {
      await saveGeneralComment(projectId, 'stories', generalComment);
      setOriginalGeneralComment(generalComment);
      setCommentDirty(false);
      showToast('General comment saved successfully!');
    } catch (err) {
      console.error('Error saving general comment:', err);
      showToast('Failed to save general comment. Please try again.', 'error');
    }
  };

  // Handler for review changes from the modal
  const handleReviewChange = (newData) => {
    setCurrentReview(prev => ({
      ...prev,
      ...newData
    }));
    setReviewDirty(true);
  };

  // Update specific score
  const handleScoreChange = (key, value) => {
    setCurrentReview(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [key]: value
      }
    }));
    setReviewDirty(true);
  };

  // Preview a linked requirement
  const handlePreviewRequirement = (req) => {
    setPreviewRequirement(req);
    setShowPreviewModal(true);
  };

  // Helper to format Gherkin-style user stories with color highlighting
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


  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
        <div className="text-xl text-blue-700 font-medium">
          Loading stories<span className="animate-pulse">...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header username={currentUser?.username || currentUser?.email} />
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Stories Reviews for project{' '}
            {projectName && projectId && (
              <Link
                to={`/projects/${projectId}`}
                className="text-blue-700 hover:underline"
              >
                {projectName}
              </Link>
            )}
          </h1>
        </div>

        {/* Stories Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User Stories</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stories.map(story => (
                  <tr key={story._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-blue-600">{story.title || `Story #${story.seq || 'N/A'}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${story.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {story.reviewed ? 'Reviewed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {story.reviewed ? <StarRating value={story.rating} allowHalf={true} /> : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                        onClick={() => openReviewModal(story)}
                      >
                        {story.reviewed ? 'Edit Review' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rubric and General Comments Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Rubric Section */}
          <ReviewCriteriaRubric
            criteria={storyCriteria}
            aggregateScores={aggregateRubric.criteriaAverages}
            overallScore={aggregateRubric.overallScore}
          />

          {/* General Comments Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">General Comments</h2>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Add general comments about all user stories..."
                rows="12"
                style={{ height: '250px', resize: 'vertical' }}
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
              ></textarea>
              {commentDirty && (
                <div className="mt-4 flex justify-end">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    onClick={saveGeneralCommentHandler}
                  >
                    Save Comments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showModal && selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Story: {selectedStory.title || `Story #${selectedStory.seq || 'N/A'}`}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={handleCloseReviewModal}
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Story</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  {formatStoryText(selectedStory.text)}
                </div>
              </div>

              {selectedStory.requirementsLinked && selectedStory.requirementsLinked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Linked Requirements</h3>
                  <div className="space-y-2">
                    {selectedStory.requirementsLinked.map(req => (
                      <div
                        key={req._id}
                        className="bg-blue-50 p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handlePreviewRequirement(req)}
                      >
                        <span className="font-semibold">#{req.seq || 'N/A'}:</span> {req.text}
                        <span className="text-xs text-gray-500 ml-2">(Click to preview)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-medium mb-3">Overall Rating (Auto-calculated)</h4>
                <div className="flex items-center">
                  <StarRating
                    value={calculateReviewOverallScore()}
                    size="lg"
                    allowHalf={true}
                  />
                  <span className="ml-3 text-gray-600">{calculateReviewOverallScore().toFixed(1)}</span>
                </div>
              </div>

              {/* Criteria-specific ratings */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Evaluation Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storyCriteria.map(criteria => (
                    <div key={criteria.key} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{criteria.name}</span>
                        <StarRating
                          value={currentReview.scores?.[criteria.key] || 0}
                          onChange={value => handleScoreChange(criteria.key, value)}
                          allowHalf={true}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{criteria.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Your Comments</h4>
                <textarea
                  className="w-full border border-gray-300 rounded p-2"
                  rows="6"
                  style={{ height: '150px', resize: 'vertical' }}
                  value={currentReview.comment}
                  onChange={(e) => handleReviewChange({ comment: e.target.value })}
                  placeholder="Add your comments about this user story..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                  onClick={handleCloseReviewModal}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  onClick={saveReview}
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requirement Preview Modal */}
        {showPreviewModal && previewRequirement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Requirement #{previewRequirement.seq || 'N/A'}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={() => setShowPreviewModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Requirement Text</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <p>{previewRequirement.text}</p>
                </div>
              </div>

              {previewRequirement.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="p-3 bg-gray-50 rounded">
                    <p>{previewRequirement.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Type</h3>
                  <div className="p-2 bg-gray-50 rounded">
                    <p>{previewRequirement.type || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">User Priority</h3>
                  <div className="p-2 bg-gray-50 rounded">
                    <p>{previewRequirement.user_priority || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">System Priority</h3>
                  <div className="p-2 bg-gray-50 rounded">
                    <p>{previewRequirement.system_priority || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Modal */}
        {showUnsavedChangesModal && (
          <UnsavedChangesModal
            onSave={() => handleUnsavedChangesModalAction('save')}
            onDiscard={() => handleUnsavedChangesModalAction('discard')}
            onCancel={() => handleUnsavedChangesModalAction('cancel')}
          />
        )}

        {/* Toast Notifications */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </div>
    </div>
  );
};

export default StoriesPage;