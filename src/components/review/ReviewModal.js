import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import StarRating from '../common/StarRating';
import DiagramViewer from '../common/DiagramViewer';

/**
 * Generic review modal that can be used for any artifact type
 * @param {Object} artifact - The artifact being reviewed
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when the modal is closed
 * @param {function} onSave - Callback to save the review
 * @param {Object} initialReview - Initial review data
 * @param {Array} criteriaDefinitions - Array of criteria objects with name, key, and description
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {function} onDirtyStateChange - Callback for dirty state changes
 * @param {function} onReviewChange - Callback for review data changes
 * @param {function} onPreviewLinkedItem - Callback to preview a linked item
 * @param {boolean} isAdmin - Whether the current user has admin privileges
 */
const ReviewModal = ({
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

    // Determine if the current artifact is editable by this user
    const isEditable = isAdmin === true;

    // Initialize review data when modal opens
    useEffect(() => {
        if (isOpen && artifact) {

            setComment(initialReview.comment || '');

            // Initialize criteria scores from initialReview or with zeros
            const scores = {};
            criteriaDefinitions.forEach(criteria => {
                scores[criteria.key] = initialReview.scores?.[criteria.key] || 0;
            });
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

        // Make sure we're structuring the data exactly as ReviewPage expects it
        const reviewData = {
            comment,
            scores: criteriaScores
        };
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

    // Helper to render linked items of a specific type
    const renderLinkedItems = (items, itemType, label) => {
        if (!items || items.length === 0) return null;

        const bgColorClass = itemType === 'requirements' ? 'blue' : 'purple';

        return (
            <div className="mb-6">
                <h3 className="font-semibold mb-2">Linked {label}</h3>
                <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                    {items.map(item => (
                        <div
                            key={item._id}
                            className={`bg-${bgColorClass}-50 p-2 rounded cursor-pointer hover:bg-${bgColorClass}-100 mb-2`}
                            onClick={() => onPreviewLinkedItem && onPreviewLinkedItem(item)}
                        >
                            <span className="font-semibold">
                                {itemType === 'requirements' ? `#${item.seq || 'N/A'}: ${item.text}` : item.title}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">(Click to preview)</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!isOpen || !artifact) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{artifact.title}</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 text-xl"
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Description</h3>
                            <div className="p-3 bg-gray-50 rounded overflow-y-auto" style={{ maxHeight: '400px' }}>
                                <ReactMarkdown>{artifact.description || ''}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Render artifact-specific fields if they exist */}
                        {(artifact.intent || artifact.structure || artifact.participants) && (
                            <div className="mb-6 grid grid-cols-1 gap-4">
                                {artifact.intent && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Intent</h3>
                                        <div className="p-3 bg-gray-50 rounded overflow-y-auto" style={{ maxHeight: '200px' }}>
                                            <ReactMarkdown>{artifact.intent}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                                {artifact.structure && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Structure</h3>
                                        <div className="p-3 bg-gray-50 rounded overflow-y-auto" style={{ maxHeight: '200px' }}>
                                            <ReactMarkdown>{artifact.structure}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                                {artifact.participants && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Participants</h3>
                                        <div className="p-3 bg-gray-50 rounded overflow-y-auto" style={{ maxHeight: '200px' }}>
                                            <ReactMarkdown>{artifact.participants}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Render linked requirements */}
                        {renderLinkedItems(artifact.requirementsLinked, 'requirements', 'Requirements')}

                        {/* Render linked class diagrams */}
                        {renderLinkedItems(artifact.classDiagramsLinked, 'classDiagrams', 'Class Diagrams')}

                        {/* Render linked stories (if applicable) */}
                        {renderLinkedItems(artifact.storiesLinked, 'stories', 'Stories')}
                    </div>

                    <div>
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Diagram</h3>
                            <div className="border border-gray-200 rounded">
                                <DiagramViewer
                                    url={artifact.url}
                                    filename={artifact.filename}
                                    title={artifact.title}
                                    mimetype={artifact.mimetype}
                                />
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
                                value={Math.round(calculateOverallScore() * 2) / 2}
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
                                            value={Math.round((criteriaScores[criteria.key] || 0) * 2) / 2}
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
                            placeholder={`${isEditable ? 'Add' : 'View'} comments about this ${artifact.artifactType || 'artifact'}...`}
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
            </div>
        </div>
    );
};

export default ReviewModal;