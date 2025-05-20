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
  saveGeneralComment
} from '../services/api';

// Define the criteria for requirements
const requirementCriteria = [
  {
    name: "Proper Syntax",
    key: "syntaxScore",
    description: "Requirements are formulated using strict syntax (e.g., \"The system must...\")"
  },
  {
    name: "Correct Categorization",
    key: "categorizationScore",
    description: "Requirements are correctly categorized as functional or non-functional"
  },
  {
    name: "Well-defined Scope",
    key: "scopeDefinitionScore",
    description: "Each requirement describes either a single well-defined function/quality characteristic or a related group of functions"
  },
  {
    name: "Quantification",
    key: "quantificationScore",
    description: "Quality characteristics described by non-functional requirements are adequately quantified where possible"
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

  // Helper function to get applicable criteria based on requirement type
  const getApplicableCriteria = (requirementType) => {
    // For NonFunctional requirements, show all criteria
    if (requirementType === 'NonFunctional') {
      return requirementCriteria;
    }
    
    // For all other types (including Functional), show all criteria except Quantification
    return requirementCriteria.filter(criterion => criterion.key !== 'quantificationScore');
  };
  
  // Process aggregate rubric data to ensure quantification criterion is handled correctly
  const processAggregateRubric = (rawAggregateData, requirements) => {
    // If there's no data or no requirements, return default structure
    if (!rawAggregateData || !requirements || requirements.length === 0) {
      return {
        criteriaAverages: {},
        overallScore: 0,
        reviewCount: 0
      };
    }
    
    // Count requirements by type
    const reqTypes = requirements.reduce((acc, req) => {
      const type = req.type || '';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Get number of NonFunctional requirements
    const nonFunctionalCount = reqTypes['NonFunctional'] || 0;    
    // Create a copy of the raw data
    const processed = {...rawAggregateData};
    
    // If there are no NonFunctional requirements but quantification score exists
    // This would indicate the server incorrectly calculated with quantification for all
    if (nonFunctionalCount === 0 && processed.criteriaAverages?.quantificationScore) {
      console.warn('Server included quantificationScore but no NonFunctional requirements exist');
      delete processed.criteriaAverages.quantificationScore;
    }
    
    // No longer recalculating the overall score - using the server's calculation
    
    return processed;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getRequirementsReviewData(projectId);
        if (response.data.projectName) {
          setProjectName(response.data.projectName);
        }

        const { artifacts, generalComment, aggregateRubric } = response.data;

        setRequirements(artifacts || []);
        setGeneralComment(generalComment || '');
        setOriginalGeneralComment(generalComment || '');

        // Process the aggregate rubric data to ensure proper handling of conditional criteria
        const processedAggregateRubric = processAggregateRubric(aggregateRubric, artifacts);
        setAggregateRubric(processedAggregateRubric || {
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
    setSelectedRequirement(requirement);

    // Initialize current review state with the correct keys
    const applicableCriteria = getApplicableCriteria(requirement.type);
    const initialScores = {};
    
    // Initialize scores for applicable criteria
    applicableCriteria.forEach(criterion => {
      initialScores[criterion.key] = requirement.scores?.[criterion.key] || 0;
    });

    const reviewData = {
      comment: requirement.comment || '',
      scores: requirement.scores || initialScores
    };

    setCurrentReview(reviewData);
    setReviewDirty(false);
    setShowModal(true);
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
    if (!selectedRequirement) return 0;
    
    // Get only the applicable criteria based on requirement type
    const applicableCriteria = getApplicableCriteria(selectedRequirement.type);
    
    // Only calculate based on the applicable criteria
    const relevantScores = applicableCriteria.map(criterion =>
      Number(currentReview.scores?.[criterion.key] || 0)
    );

    if (relevantScores.length === 0) return 0;

    const sum = relevantScores.reduce((total, score) => total + score, 0);
    return sum / relevantScores.length;
  }, [currentReview.scores, selectedRequirement]);

  // Update saveReview function with permission check
  const saveReview = async () => {
    // Only allow admin users to save reviews
    if (!isAdmin) {
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
        await submitReview(
          'requirement',
          selectedRequirement._id,
          overallRating,
          currentReview.comment,
          currentReview.scores
        );
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
          const processedAggregateRubric = processAggregateRubric(
            refreshResponse.data.aggregateRubric,
            refreshResponse.data.artifacts || requirements
          );
          setAggregateRubric(processedAggregateRubric);
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
                      {req.reviewed ? <StarRating value={Math.round(req.rating * 2) / 2} allowHalf={true} readOnly={true} /> : '-'}
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
                    value={Math.round(calculateReviewOverallScore() * 2) / 2}
                    size="lg"
                    allowHalf={true}
                    readOnly={true}
                  />
                  <span className="ml-3 text-gray-600">{calculateReviewOverallScore().toFixed(1)}</span>
                </div>
              </div>

              {/* Criteria-specific ratings - Only show applicable criteria */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Evaluation Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getApplicableCriteria(selectedRequirement.type).map(criteria => (
                    <div key={criteria.key} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{criteria.name}</span>
                        <StarRating
                          value={Math.round((currentReview.scores?.[criteria.key] || 0) * 2) / 2}
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