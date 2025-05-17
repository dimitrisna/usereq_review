import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import UnsavedChangesModal from '../components/common/UnsavedChangesModal';
import ReviewCriteriaRubric from '../components/review/ReviewCriteriaRubric';
import ArtifactTable from '../components/review/ArtifactTable';
import MockupReviewModal from '../components/review/MockupReviewModal';
import LinkedItemPreviewModal from '../components/review/LinkedItemPreviewModal';
import { useAuth } from '../contexts/AuthContext';
import { getMockupsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for mockups
const mockupCriteria = [
  {
    name: "UI/UX Design",
    key: "uiUxDesignScore",
    description: "Follows UI/UX best practices"
  },
  {
    name: "Consistency",
    key: "consistencyScore",
    description: "Consistent design patterns and elements"
  },
  {
    name: "Flow",
    key: "flowScore",
    description: "Logical flow between screens"
  },
  {
    name: "Completeness",
    key: "completenessScore",
    description: "Covers all required functionality"
  },
  {
    name: "User-Friendliness",
    key: "userFriendlinessScore",
    description: "Intuitive and easy to use"
  }
];

const MockupsPage = () => {
  const { projectId } = useParams();
  const [mockups, setMockups] = useState([]);
  const [generalComment, setGeneralComment] = useState('');
  const [originalGeneralComment, setOriginalGeneralComment] = useState('');
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
  // Add project state
  const [projectName, setProjectName] = useState('');

  // State for linked items preview
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Aggregated rubric data
  const [aggregateRubric, setAggregateRubric] = useState({
    criteriaAverages: {},
    overallScore: 0,
    reviewCount: 0
  });

  // Reference to track original review values
  const originalReviewRef = React.useRef(null);
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
      console.log('[MockupsPage] Refreshing aggregate rubric data');
      
      // Directly re-fetch the review data to get updated aggregate information
      const response = await getMockupsReviewData(projectId);
      
      // Only update the aggregate rubric portion of state
      if (response.data.aggregateRubric) {
        console.log('[MockupsPage] Updated aggregate rubric from API:', response.data.aggregateRubric);
        setAggregateRubric(response.data.aggregateRubric);
      }
    } catch (err) {
      console.error('[MockupsPage] Error refreshing aggregate data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`[MockupsPage] Fetching data for mockups in project ${projectId}`);

        const response = await getMockupsReviewData(projectId);
        console.log('[MockupsPage] API Response:', response.data);
        
        // Extract project name if available in response
        if (response.data.projectName) {
          setProjectName(response.data.projectName);
        }
        
        // Extract mockups and other data from response
        const { artifacts, generalComment, aggregateRubric } = response.data;
        
        setMockups(artifacts || []);
        setGeneralComment(generalComment || '');
        setOriginalGeneralComment(generalComment || '');
        
        // Handle aggregate rubric data
        setAggregateRubric(aggregateRubric || {
          criteriaAverages: {},
          overallScore: 0,
          reviewCount: 0
        });
      } catch (err) {
        console.error(`[MockupsPage] Error fetching mockups data:`, err);
        setError(`Failed to load mockups. Please try again later.`);
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

  const openReviewModal = (mockup) => {
    console.log('[MockupsPage] Opening review modal for mockup:', mockup);
    setSelectedMockup(mockup);

    // Deep clone the scores to avoid reference issues
    const deepClonedScores = mockup.scores ? JSON.parse(JSON.stringify(mockup.scores)) : {};
    
    // Initialize current review state with deep clones to avoid reference issues
    const reviewData = {
      comment: mockup.comment || '',
      scores: deepClonedScores
    };
    
    console.log('[MockupsPage] Setting current review to:', reviewData);
    setCurrentReview(reviewData);

    // Store original values for dirty check
    originalReviewRef.current = {
      comment: mockup.comment || '',
      scores: deepClonedScores
    };
    
    console.log('[MockupsPage] Original review set to:', originalReviewRef.current);
    setReviewDirty(false);
    setShowModal(true);
  };

  // Handler for dirty state changes from the modal
  const handleReviewDirtyChange = (isDirty) => {
    console.log('[MockupsPage] Review dirty state changed:', isDirty);
    setReviewDirty(isDirty);
  };

  const handleCloseReviewModal = () => {
    console.log('[MockupsPage] Close modal requested, dirty state:', reviewDirty);
    if (reviewDirty) {
      console.log('[MockupsPage] Showing unsaved changes modal');
      setShowUnsavedChangesModal(true);
    } else {
      console.log('[MockupsPage] No changes, closing modal directly');
      setShowModal(false);
      setSelectedMockup(null);
      setCurrentReview({ comment: '', scores: {} });
    }
  };

  const handleUnsavedChangesModalAction = (action) => {
    console.log('[MockupsPage] Unsaved changes action:', action);
    setShowUnsavedChangesModal(false);

    if (action === 'save') {
      console.log('[MockupsPage] Saving changes before closing');
      saveReview();
    } else if (action === 'discard') {
      console.log('[MockupsPage] Discarding changes and closing');
      setShowModal(false);
      setSelectedMockup(null);
      setCurrentReview({ comment: '', scores: {} });
    }
    // If 'cancel', just hide the unsaved changes modal but keep review modal open
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
    const sum = scores.reduce((total, score) => total + score, 0);
    return sum / scores.length;
  }, [currentReview.scores]);

  const saveReview = async () => {
    try {
      console.log('[MockupsPage] Starting save review process');
      console.log('[MockupsPage] Current review state:', currentReview);
      
      if (!selectedMockup) {
        console.error('[MockupsPage] No mockup selected!');
        return;
      }
      
      // Calculate overall rating from category scores
      const overallRating = calculateReviewOverallScore();
      console.log('[MockupsPage] Calculated overall rating:', overallRating);

      try {
        console.log('[MockupsPage] Calling submitReview with:', {
          artifactType: 'mockup',
          artifactId: selectedMockup._id,
          rating: overallRating,
          comment: currentReview.comment,
          scores: currentReview.scores
        });

        const response = await submitReview(
          'mockup',
          selectedMockup._id, 
          overallRating, 
          currentReview.comment, 
          currentReview.scores
        );
        
        console.log('[MockupsPage] API response:', response.data);

        // Create a completely new object for the updated mockup
        const updatedMockup = {
          ...selectedMockup,
          rating: overallRating,
          comment: currentReview.comment,
          scores: { ...currentReview.scores },
          reviewed: true
        };
        
        // Create a new array with the updated mockup
        const updatedMockups = mockups.map(mockup => 
          mockup._id === selectedMockup._id ? updatedMockup : mockup
        );
        
        console.log('[MockupsPage] Updated mockup:', updatedMockup);
        console.log('[MockupsPage] Updating mockups array with new review data');
        
        // Update state in sequence
        setMockups(updatedMockups);
        setReviewDirty(false);
        setShowModal(false);
        setSelectedMockup(null);
        
        // Refresh aggregate data after completing the review submission
        await refreshAggregateRubricData();

        // Show success toast notification
        showToast('Review saved successfully!');
      } catch (error) {
        console.error('[MockupsPage] API call failed:', error);
        showToast('Error saving review: ' + (error.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error('[MockupsPage] Error in save process:', err);
      showToast('Failed to process review. Please try again.', 'error');
    }
  };

  const saveGeneralCommentHandler = async () => {
    try {
      await saveGeneralComment(projectId, 'mockups', generalComment);
      setOriginalGeneralComment(generalComment);
      setCommentDirty(false);
      showToast('General comment saved successfully!');
    } catch (err) {
      console.error('Error saving general comment:', err);
      showToast('Failed to save general comment. Please try again.', 'error');
    }
  };

  // Handler for when a linked item is selected for preview
  const handlePreviewLinkedItem = (item) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  // Handler for review changes from the modal
  const handleReviewChange = (newData) => {
    console.log('[MockupsPage] Review data changed in modal:', newData);
    setCurrentReview(prev => ({
      ...prev,
      ...newData
    }));
  };

  // Handler for navigating to another mockup - not needed with popup approach
  // const handleNavigateToScreen = (targetMockup) => {
  //   // If there are unsaved changes, save them first
  //   if (reviewDirty) {
  //     saveReview();
  //   }
  //   
  //   // Find the full mockup object from our list
  //   const fullMockup = mockups.find(m => m._id === targetMockup._id);
  //   if (fullMockup) {
  //     // Open the review modal for the target mockup
  //     openReviewModal(fullMockup);
  //   }
  // };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
        <div className="text-xl text-blue-700 font-medium">
          Loading mockups<span className="animate-pulse">...</span>
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
            Mockups Reviews for project{' '}
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

        {/* Mockups Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Mockups</h2>
          <ArtifactTable 
            artifacts={mockups}
            onReview={openReviewModal}
            artifactName="mockup"
          />
        </div>

        {/* Improved Rubric and General Comments Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Rubric Section */}
          <ReviewCriteriaRubric 
            criteria={mockupCriteria}
            aggregateScores={aggregateRubric.criteriaAverages}
            overallScore={aggregateRubric.overallScore}
          />

          {/* General Comments Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">General Comments</h2>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                placeholder={`Add general comments about all mockups...`}
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

        {/* Custom Mockup Review Modal with popup previews for navigation */}
        {showModal && selectedMockup && (
          <MockupReviewModal
            artifact={selectedMockup}
            isOpen={showModal}
            onClose={handleCloseReviewModal}
            onSave={saveReview}
            initialReview={originalReviewRef.current}
            criteriaDefinitions={mockupCriteria}
            hasUnsavedChanges={reviewDirty}
            onDirtyStateChange={handleReviewDirtyChange}
            onReviewChange={handleReviewChange}
            onPreviewLinkedItem={handlePreviewLinkedItem}
          />
        )}

        {/* Linked Item Preview Modal */}
        <LinkedItemPreviewModal
          isOpen={showPreviewModal}
          item={previewItem}
          onClose={() => setShowPreviewModal(false)}
        />

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

export default MockupsPage;