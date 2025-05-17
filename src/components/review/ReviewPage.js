import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../common/Header';
import Toast from '../common/Toast';
import UnsavedChangesModal from '../common/UnsavedChangesModal';
import ReviewCriteriaRubric from './ReviewCriteriaRubric';
import ArtifactTable from './ArtifactTable';
import ReviewModal from './ReviewModal';
import LinkedItemPreviewModal from './LinkedItemPreviewModal';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Generic review page component that can be used for any artifact type
 * @param {string} artifactType - Type of artifact being reviewed
 * @param {function} fetchReviewData - Function to fetch review data
 * @param {function} submitReviewFn - Function to submit a review
 * @param {function} saveGeneralCommentFn - Function to save general comment
 * @param {Array} criteriaDefinitions - Array of criteria objects with name, key, and description
 * @param {string} pageTitle - Title for the page
 */
const ReviewPage = ({
    artifactType,
    fetchReviewData,
    submitReviewFn,
    saveGeneralCommentFn,
    criteriaDefinitions,
    pageTitle
}) => {
    const { projectId } = useParams();
    const [artifacts, setArtifacts] = useState([]);
    const [generalComment, setGeneralComment] = useState('');
    const [originalGeneralComment, setOriginalGeneralComment] = useState('');
    const [selectedArtifact, setSelectedArtifact] = useState(null);
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
    const originalReviewRef = useRef(null);
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
            console.log('[ReviewPage] Refreshing aggregate rubric data');

            // Directly re-fetch the review data to get updated aggregate information
            const response = await fetchReviewData(projectId);

            // Only update the aggregate rubric portion of state
            if (response.data.aggregateRubric) {
                console.log('[ReviewPage] Updated aggregate rubric from API:', response.data.aggregateRubric);
                setAggregateRubric(response.data.aggregateRubric);
            }
        } catch (err) {
            console.error('[ReviewPage] Error refreshing aggregate data:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log(`[ReviewPage] Fetching data for ${artifactType} in project ${projectId}`);

                const response = await fetchReviewData(projectId);
                console.log('[ReviewPage] API Response:', response.data);

                // Extract project name if available in response
                if (response.data.projectName) {
                    setProjectName(response.data.projectName);
                }

                // Log what we're extracting from the response
                console.log('[ReviewPage] Artifacts from response:', response.data.artifacts ||
                    response.data.diagrams || 'none');
                console.log('[ReviewPage] General comment:', response.data.generalComment);
                console.log('[ReviewPage] Aggregate rubric:', response.data.aggregateRubric);

                // The response structure may vary depending on the artifact type
                const { artifacts: fetchedArtifacts, diagrams, generalComment, aggregateRubric } = response.data;

                // Handle both "artifacts" and "diagrams" field names
                const artifactsToUse = fetchedArtifacts || diagrams || [];
                console.log('[ReviewPage] Using artifacts:', artifactsToUse);

                setArtifacts(artifactsToUse);
                setGeneralComment(generalComment || '');
                setOriginalGeneralComment(generalComment || '');

                // Handle aggregate rubric data
                setAggregateRubric(aggregateRubric || {
                    criteriaAverages: {},
                    overallScore: 0,
                    reviewCount: 0
                });
            } catch (err) {
                console.error(`[ReviewPage] Error fetching ${artifactType} data:`, err);
                setError(`Failed to load ${artifactType}. Please try again later.`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, artifactType, fetchReviewData]);

    // Check if general comment has changed
    useEffect(() => {
        setCommentDirty(generalComment !== originalGeneralComment);
    }, [generalComment, originalGeneralComment]);

    // Add this useEffect to monitor artifacts state changes
    useEffect(() => {
        if (artifacts.length > 0) {
            console.log('[ReviewPage] Artifacts state changed. New count:', artifacts.length);
            console.log('[ReviewPage] First artifact reviewed status:', artifacts[0]?.reviewed);
        }
    }, [artifacts]);

    const openReviewModal = (artifact) => {
        console.log('[ReviewPage] Opening review modal for artifact:', artifact);
        setSelectedArtifact(artifact);

        // Deep clone the scores to avoid reference issues
        const deepClonedScores = artifact.scores ? JSON.parse(JSON.stringify(artifact.scores)) : {};

        // Initialize current review state with deep clones to avoid reference issues
        const reviewData = {
            comment: artifact.comment || '',
            scores: deepClonedScores
        };

        console.log('[ReviewPage] Setting current review to:', reviewData);
        setCurrentReview(reviewData);

        // Store original values for dirty check
        originalReviewRef.current = {
            comment: artifact.comment || '',
            scores: deepClonedScores
        };

        console.log('[ReviewPage] Original review set to:', originalReviewRef.current);
        setReviewDirty(false);
        setShowModal(true);
    };

    // Handler for dirty state changes from the modal
    const handleReviewDirtyChange = (isDirty) => {
        console.log('[ReviewPage] Review dirty state changed:', isDirty);
        setReviewDirty(isDirty);
    };

    const handleCloseReviewModal = () => {
        console.log('[ReviewPage] Close modal requested, dirty state:', reviewDirty);
        if (reviewDirty) {
            console.log('[ReviewPage] Showing unsaved changes modal');
            setShowUnsavedChangesModal(true);
        } else {
            console.log('[ReviewPage] No changes, closing modal directly');
            setShowModal(false);
            setSelectedArtifact(null);
            setCurrentReview({ comment: '', scores: {} });
        }
    };

    const handleUnsavedChangesModalAction = (action) => {
        console.log('[ReviewPage] Unsaved changes action:', action);
        setShowUnsavedChangesModal(false);

        if (action === 'save') {
            console.log('[ReviewPage] Saving changes before closing');
            saveReview();
        } else if (action === 'discard') {
            console.log('[ReviewPage] Discarding changes and closing');
            setShowModal(false);
            setSelectedArtifact(null);
            setCurrentReview({ comment: '', scores: {} });
        }
        // If 'cancel', just hide the unsaved changes modal but keep review modal open
    };

    const formatArtifactType = (type) => {
        if (!type) return '';
        return type
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // insert space before capital letters
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // separate all caps like "APIResponse" -> "API Response"
            .replace(/^./, str => str.toUpperCase()); // capitalize first letter
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
            console.log('[ReviewPage] Starting save review process');
            console.log('[ReviewPage] Current review state:', currentReview);

            if (!selectedArtifact) {
                console.error('[ReviewPage] No artifact selected!');
                return;
            }

            // Calculate overall rating from category scores
            const overallRating = calculateReviewOverallScore();
            console.log('[ReviewPage] Calculated overall rating:', overallRating);

            // Create a new scores object for the API call
            const scoresForApi = { ...currentReview.scores };
            console.log('[ReviewPage] Scores being sent to API:', scoresForApi);

            try {
                console.log('[ReviewPage] Calling submitReviewFn with:', {
                    artifactType: artifactType.slice(0, -1),
                    artifactId: selectedArtifact._id,
                    rating: overallRating,
                    comment: currentReview.comment,
                    scores: scoresForApi
                });

                const response = await submitReviewFn(
                    artifactType.slice(0, -1),
                    selectedArtifact._id,
                    overallRating,
                    currentReview.comment,
                    scoresForApi
                );

                console.log('[ReviewPage] API response:', response.data);

                // Create a completely new object for the updated artifact
                const updatedArtifact = {
                    ...selectedArtifact,
                    rating: overallRating,
                    comment: currentReview.comment,
                    scores: { ...scoresForApi },
                    reviewed: true
                };

                // Create a new array with the updated artifact
                const updatedArtifacts = artifacts.map(artifact =>
                    artifact._id === selectedArtifact._id ? updatedArtifact : artifact
                );

                console.log('[ReviewPage] Updated artifact:', updatedArtifact);
                console.log('[ReviewPage] Updating artifacts array with new review data');

                // Update state in sequence
                setArtifacts(updatedArtifacts);
                setReviewDirty(false);
                setShowModal(false);
                setSelectedArtifact(null);

                // Refresh aggregate data after completing the review submission
                await refreshAggregateRubricData();

                // Show success toast notification
                showToast('Review saved successfully!');
            } catch (error) {
                console.error('[ReviewPage] API call failed:', error);
                showToast('Error saving review: ' + (error.message || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error('[ReviewPage] Error in save process:', err);
            showToast('Failed to process review. Please try again.', 'error');
        }
    };

    const saveGeneralCommentHandler = async () => {
        try {
            await saveGeneralCommentFn(projectId, artifactType, generalComment);
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
        console.log('[ReviewPage] Review data changed in modal:', newData);
        setCurrentReview(prev => ({
            ...prev,
            ...newData
        }));
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
                <div className="text-xl text-blue-700 font-medium">
                    Loading {artifactType}<span className="animate-pulse">...</span>
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
                        {formatArtifactType(artifactType)} Reviews for project{' '}
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

                {/* Artifacts Table */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">{formatArtifactType(artifactType)}</h2>
                    <ArtifactTable
                        artifacts={artifacts}
                        onReview={openReviewModal}
                        artifactName={artifactType.slice(0, -1)} // singular form
                    />
                </div>

                {/* Improved Rubric and General Comments Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Rubric Section */}
                    <ReviewCriteriaRubric
                        criteria={criteriaDefinitions}
                        aggregateScores={aggregateRubric.criteriaAverages}
                        overallScore={aggregateRubric.overallScore}
                    />

                    {/* General Comments Section */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">General Comments</h2>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2"
                                placeholder={`Add general comments about all ${artifactType}...`}
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
                <ReviewModal
                    artifact={selectedArtifact}
                    isOpen={showModal}
                    onClose={handleCloseReviewModal}
                    onSave={saveReview}
                    initialReview={originalReviewRef.current}
                    criteriaDefinitions={criteriaDefinitions}
                    hasUnsavedChanges={reviewDirty}
                    onDirtyStateChange={handleReviewDirtyChange}
                    onReviewChange={handleReviewChange}
                    onPreviewLinkedItem={handlePreviewLinkedItem}
                />

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

export default ReviewPage;