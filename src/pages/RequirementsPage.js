import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import UnsavedChangesModal from '../components/common/UnsavedChangesModal';
import ReviewCriteriaRubric from '../components/review/ReviewCriteriaRubric';
import StarRating from '../components/common/StarRating';
import { useAuth } from '../contexts/AuthContext';
import {
  getRequirementsReviewData,
  submitReview,
  saveGeneralComment,
  saveRubricEvaluation
} from '../services/api';

// Define the criteria for requirements
const requirementCriteria = [
  {
    name: "Clarity",
    key: "clarityScore",
    description: "Requirements are clear and unambiguous"
  },
  {
    name: "Testability",
    key: "testabilityScore",
    description: "Requirements can be verified through testing"
  },
  {
    name: "Feasibility",
    key: "feasibilityScore",
    description: "Requirements are technically and operationally feasible"
  },
  {
    name: "Necessity",
    key: "necessityScore",
    description: "Each requirement is essential to the system"
  },
  {
    name: "Prioritization",
    key: "prioritizationScore",
    description: "Requirements are properly prioritized"
  }
];

const RequirementsPage = () => {
  const { projectId } = useParams();
  const [requirements, setRequirements] = useState([]);
  const [generalComment, setGeneralComment] = useState('');
  const [originalGeneralComment, setOriginalGeneralComment] = useState('');
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [projectName, setProjectName] = useState('');

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

  // Get current user and determine admin status
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getRequirementsReviewData(projectId);
        console.log('API Response:', response.data);

        if (response.data.projectName) {
          setProjectName(response.data.projectName);
        }

        const { artifacts, generalComment, aggregateRubric } = response.data;

        setRequirements(artifacts || []);
        setGeneralComment(generalComment || '');
        setOriginalGeneralComment(generalComment || '');

        setAggregateRubric(aggregateRubric || {
          criteriaAverages: {},
          overallScore: 0,
          reviewCount: 0
        });
      } catch (err) {
        console.error('Error fetching requirements data:', err);
        setError('Failed to load requirements. Please try again later.');
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

  const openReviewModal = (requirement) => {
    console.log('Opening review modal for requirement:', requirement);
    setSelectedRequirement(requirement);

    // Initialize current review state
    const reviewData = {
      comment: requirement.comment || '',
      scores: requirement.scores || {
        clarityScore: 0,
        testabilityScore: 0,
        feasibilityScore: 0,
        necessityScore: 0,
        prioritizationScore: 0
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

  // Update handleCloseReviewModal to only show unsaved changes for admins
  const handleCloseReviewModal = () => {
    if (reviewDirty && isAdmin) {
      setShowUnsavedChangesModal(true);
    } else {
      setShowModal(false);
      setSelectedRequirement(null);
      setCurrentReview({ comment: '', scores: {} });
    }
  };

  const handleUnsavedChangesModalAction = (action) => {
    setShowUnsavedChangesModal(false);

    if (action === 'save') {
      saveReview();
    } else if (action === 'discard') {
      setShowModal(false);
      setSelectedRequirement(null);
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
    const sum = scores.reduce((total, score) => total + (score || 0), 0);
    return sum / scores.length;
  }, [currentReview.scores]);

  // Update saveReview function with permission check
  const saveReview = async () => {
    // Only allow admin users to save reviews
    if (!isAdmin) {
      console.log('[RequirementsPage] Non-admin user attempted to save a review');
      return;
    }

    try {
      if (!selectedRequirement) {
        console.error('No requirement selected!');
        return;
      }

      // Calculate overall rating from category scores
      const overallRating = calculateReviewOverallScore();

      try {
        const response = await submitReview(
          'requirement',
          selectedRequirement._id,
          overallRating,
          currentReview.comment,
          currentReview.scores
        );

        console.log('API response:', response.data);

        // Create a completely new object for the updated requirement
        const updatedRequirement = {
          ...selectedRequirement,
          rating: overallRating,
          comment: currentReview.comment,
          scores: { ...currentReview.scores },
          reviewed: true
        };

        // Create a new array with the updated requirement
        const updatedRequirements = requirements.map(requirement =>
          requirement._id === selectedRequirement._id ? updatedRequirement : requirement
        );

        // Update state
        setRequirements(updatedRequirements);
        setReviewDirty(false);
        setShowModal(false);
        setSelectedRequirement(null);

        // Refresh aggregate data
        const refreshResponse = await getRequirementsReviewData(projectId);
        if (refreshResponse.data.aggregateRubric) {
          setAggregateRubric(refreshResponse.data.aggregateRubric);
        }

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

  // Update saveGeneralCommentHandler with permission check
  const saveGeneralCommentHandler = async () => {
    // Only allow admin users to save general comments
    if (!isAdmin) {
      console.log('[RequirementsPage] Non-admin user attempted to save a general comment');
      return;
    }

    try {
      await saveGeneralComment(projectId, 'requirements', generalComment);
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
        <div className="text-xl text-blue-700 font-medium">
          Loading requirements<span className="animate-pulse">...</span>
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
            Requirements Reviews for project{' '}
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

        {/* Requirements Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Requirements</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requirements.map(req => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">#{req.seq || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">{req.text?.substring(0, 60)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.type || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.user_priority || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.system_priority || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.reviewed ? <StarRating value={req.rating} allowHalf={true} readOnly={true} /> : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${req.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.reviewed ? 'Reviewed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                        onClick={() => openReviewModal(req)}
                      >

                        {isAdmin
                          ? (req.reviewed ? 'Edit Review' : 'Review')
                          : 'View Review'}
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
            criteria={requirementCriteria}
            aggregateScores={aggregateRubric.criteriaAverages}
            overallScore={aggregateRubric.overallScore}
          />

          {/* General Comments Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">General Comments</h2>
              <textarea
                className={`w-full border border-gray-300 rounded p-2 ${!isAdmin ? 'bg-gray-50' : ''}`}
                placeholder={`${isAdmin ? 'Add' : 'View'} general comments about all requirements...`}
                rows="12"
                style={{ height: '250px', resize: 'vertical' }}
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                readOnly={!isAdmin}
                disabled={!isAdmin}
              ></textarea>
              {commentDirty && isAdmin && (
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
        {showModal && selectedRequirement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Requirement #{selectedRequirement.seq || 'N/A'}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={handleCloseReviewModal}
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Requirement Text</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <p>{selectedRequirement.text}</p>
                </div>
              </div>

              {selectedRequirement.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="p-3 bg-gray-50 rounded">
                    <p>{selectedRequirement.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Type</h3>
                  <div className="p-2 bg-gray-50 rounded">
                    <p>{selectedRequirement.type || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">User Priority</h3>
                  <div className="p-2 bg-gray-50 rounded">
                    <p>{selectedRequirement.user_priority || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">System Priority</h3>
                  <div className="p-2 bg-gray-50 rounded">
                    <p>{selectedRequirement.system_priority || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Overall Rating (Auto-calculated)</h4>
                <div className="flex items-center">
                  <StarRating
                    value={calculateReviewOverallScore()}
                    size="lg"
                    allowHalf={true}
                    readOnly={true}
                  />
                  <span className="ml-3 text-gray-600">{calculateReviewOverallScore().toFixed(1)}</span>
                </div>
              </div>

              {/* Criteria-specific ratings */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Evaluation Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requirementCriteria.map(criteria => (
                    <div key={criteria.key} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{criteria.name}</span>
                        <StarRating
                          value={currentReview.scores?.[criteria.key] || 0}
                          onChange={isAdmin ? value => handleScoreChange(criteria.key, value) : undefined}
                          allowHalf={true}
                          readOnly={!isAdmin}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{criteria.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">{isAdmin ? 'Your Comments' : 'Reviewer Comments'}</h4>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 ${!isAdmin ? 'bg-gray-50' : ''}`}
                  rows="6"
                  style={{ height: '150px', resize: 'vertical' }}
                  value={currentReview.comment}
                  onChange={isAdmin ? (e) => handleReviewChange({ comment: e.target.value }) : undefined}
                  placeholder={`${isAdmin ? 'Add' : 'View'} comments about this requirement...`}
                  readOnly={!isAdmin}
                  disabled={!isAdmin}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                  onClick={handleCloseReviewModal}
                >
                  {isAdmin ? 'Cancel' : 'Close'}
                </button>
                {isAdmin && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    onClick={saveReview}
                  >
                    Save Review
                  </button>
                )}
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

export default RequirementsPage;