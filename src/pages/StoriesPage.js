// src/pages/StoriesPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import StarRating from '../components/common/StarRating';
import {
  getStories, getStory, submitReview, getMyReview,
  getRubricEvaluation, saveRubricEvaluation, getGeneralComment, saveGeneralComment, getReviewsForArtifact,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StoriesPage = () => {
  const { projectId } = useParams();
  const [stories, setStories] = useState([]);
  const [showRubric, setShowRubric] = useState(false);
  const [generalComment, setGeneralComment] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rubric, setRubric] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch stories
        const response = await getStories(projectId);
        console.log('Stories API response:', response.data);

        // Extract stories array based on response structure
        let storiesArray = [];
        if (Array.isArray(response.data)) {
          storiesArray = response.data;
        } else if (response.data && Array.isArray(response.data.stories)) {
          storiesArray = response.data.stories;
        } else if (response.data && typeof response.data === 'object') {
          storiesArray = [response.data];
        }

        // For each story, fetch all reviews (not just the user's review)
        const storiesWithReviews = await Promise.all(
          storiesArray.map(async (story) => {
            try {
              console.log(`Fetching reviews for story ${story._id}`);

              // Get all reviews for this story
              const reviewsResponse = await getMyReview('story', story._id);
              if (reviewsResponse.data) {
                return {
                  ...story,
                  rating: reviewsResponse.data.rating || 0,
                  comment: reviewsResponse.data.comment || '',
                  reviewed: true
                };
              }

              // Find the current user's review if it exists
              const userReview = reviewsResponse.data.reviews?.find(
                review => review.reviewer._id === currentUser._id
              );

              if (userReview) {
                console.log(`Found user review for story ${story._id}:`, userReview);
                return {
                  ...story,
                  rating: userReview.rating || 0,
                  comment: userReview.comment || '',
                  reviewed: true
                };
              } else {
                return {
                  ...story,
                  rating: 0,
                  comment: '',
                  reviewed: false
                };
              }
            } catch (err) {
              console.error(`Error fetching reviews for story ${story._id}:`, err);

              // If the request fails, try using the getMyReview as a fallback
              try {
                const myReviewResponse = await getMyReview('story', story._id);
                if (myReviewResponse.data) {
                  return {
                    ...story,
                    rating: myReviewResponse.data.rating || 0,
                    comment: myReviewResponse.data.comment || '',
                    reviewed: true
                  };
                }
              } catch (fallbackErr) {
                console.error(`Fallback also failed for story ${story._id}:`, fallbackErr);
              }

              return {
                ...story,
                rating: 0,
                comment: '',
                reviewed: false
              };
            }
          })
        );

        setStories(storiesWithReviews);

        // Fetch general comment
        try {
          const commentResponse = await getGeneralComment(projectId, 'stories');
          setGeneralComment(commentResponse.data?.comment || '');
        } catch (err) {
          console.error('Error fetching general comment:', err);
        }

        // Fetch rubric if showing
        if (showRubric) {
          fetchRubric();
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, showRubric, currentUser._id]);

  const fetchRubric = async () => {
    try {
      const response = await getRubricEvaluation(projectId, 'stories');
      setRubric(response.data?.evaluation?.criteria || []);

      // If no rubric exists yet, initialize with default criteria
      if (!response.data?.evaluation?.criteria?.length) {
        setRubric([
          { name: 'User Focus', description: 'Story clearly identifies the user role', score: 0 },
          { name: 'Value Proposition', description: 'Story clearly states the benefit to the user', score: 0 },
          { name: 'Acceptance Criteria', description: 'Clear criteria for when the story is complete', score: 0 },
          { name: 'Size/Scope', description: 'Story is appropriately sized for implementation', score: 0 },
          { name: 'Independence', description: 'Story can be implemented independently', score: 0 }
        ]);
      }
    } catch (err) {
      console.error('Error fetching rubric:', err);
      // Initialize empty rubric criteria
      setRubric([
        { name: 'User Focus', description: 'Story clearly identifies the user role', score: 0 },
        { name: 'Value Proposition', description: 'Story clearly states the benefit to the user', score: 0 },
        { name: 'Acceptance Criteria', description: 'Clear criteria for when the story is complete', score: 0 },
        { name: 'Size/Scope', description: 'Story is appropriately sized for implementation', score: 0 },
        { name: 'Independence', description: 'Story can be implemented independently', score: 0 }
      ]);
    }
  };

  const openReviewModal = async (story) => {
    try {
      // Get the full story details
      const response = await getStory(story._id);

      // API might return { story: {...} } or just the story object directly
      const storyData = response.data.story || response.data;

      setSelectedStory(storyData);
      setCurrentRating(story.rating || 0);
      setCurrentComment(story.comment || '');
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching story details:', err);
      alert('Failed to load story details. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  const saveReview = async () => {
    try {
      // Log the data we're about to send
      console.log('Submitting review with data:', {
        artifactType: 'story',
        artifactId: selectedStory._id,
        rating: currentRating,
        comment: currentComment
      });

      // Call the API
      const response = await submitReview('story', selectedStory._id, currentRating, currentComment);
      console.log(response.status)
      console.log('Review submission response:', response.data);

      if (response.data && response.data.review) {
        // Update the local state with the new review data
        const updatedStories = stories.map(story =>
          story._id === selectedStory._id
            ? {
              ...story,
              rating: currentRating,
              comment: currentComment,
              reviewed: true
            }
            : story
        );

        setStories(updatedStories);
        closeModal();

        // Show success message
        alert('Review saved successfully!');
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error saving review:', err);
      console.error('Error response data:', err.response?.data);

      // Show detailed error message
      alert(`Failed to save review: ${err.response?.data?.message || err.message}`);
    }
  };

  const saveRubricHandler = async () => {
    try {
      const rubricData = {
        rubricType: 'stories',
        criteria: rubric,
        project: projectId,
        evaluator: currentUser._id
      };

      await saveRubricEvaluation(rubricData);
      alert('Rubric evaluation saved successfully!');
    } catch (err) {
      console.error('Error saving rubric:', err);
      alert('Failed to save rubric evaluation. Please try again.');
    }
  };

  const saveGeneralCommentHandler = async () => {
    try {
      await saveGeneralComment(projectId, 'stories', generalComment);
      alert('General comment saved successfully!');
    } catch (err) {
      console.error('Error saving general comment:', err);
      alert('Failed to save general comment. Please try again.');
    }
  };

  const updateRubricCriteria = (index, newScore) => {
    const newRubric = [...rubric];
    newRubric[index].score = newScore;
    setRubric(newRubric);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Loading stories...</div>
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
        <div className="flex items-center mb-6">
          <Link to={`/projects/${projectId}`} className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 mr-3">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">User Stories Review</h1>
        </div>

        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={() => {
              setShowRubric(!showRubric);
              if (!showRubric) fetchRubric();
            }}
          >
            {showRubric ? 'Hide Rubric Evaluation' : 'Show Rubric Evaluation'}
          </button>
        </div>

        {showRubric && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">User Stories Rubric Evaluation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {rubric.map((criteria, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{criteria.name}</h3>
                    <StarRating
                      value={criteria.score}
                      onChange={(newValue) => updateRubricCriteria(index, newValue)}
                    />
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{criteria.description}</p>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    placeholder={`Comments about ${criteria.name}...`}
                    rows="2"
                    value={criteria.comment || ''}
                    onChange={(e) => {
                      const newRubric = [...rubric];
                      newRubric[index].comment = e.target.value;
                      setRubric(newRubric);
                    }}
                  ></textarea>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-4">
              <div>
                <span className="text-green-700 font-semibold">Overall Rubric Score:</span>
                <span className="text-xl font-bold ml-2">
                  {(rubric.reduce((acc, curr) => acc + (curr.score || 0), 0) / rubric.length).toFixed(1)}/5
                </span>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                onClick={saveRubricHandler}
              >
                Save Rubric Evaluation
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">General Comments</h2>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Add general comments about all user stories..."
            rows="4"
            value={generalComment}
            onChange={(e) => setGeneralComment(e.target.value)}
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={saveGeneralCommentHandler}
            >
              Save Comments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Individual User Stories</h2>

          {stories.length === 0 ? (
            <div className="text-center py-10">
              <p>No user stories found for this project.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {stories.map(story => (
                <div key={story._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{story.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${story.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {story.reviewed ? 'Reviewed' : 'Pending'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded mb-3 whitespace-pre-line">
                    {typeof story.text === 'string' && (
                      story.text.length > 200
                        ? `${story.text.substring(0, 200)}...`
                        : story.text
                    )}
                    {typeof story.text !== 'string' && (
                      <span className="text-gray-500">Story text not available</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      {story.rating > 0 && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Rating:</span>
                          <StarRating value={story.rating} />
                        </div>
                      )}

                    </div>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                      onClick={() => openReviewModal(story)}
                    >
                      {story.reviewed ? 'Edit Review' : 'Review'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for reviewing individual stories */}
        {showModal && selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Story: {selectedStory.title}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Story</h3>
                <div className="p-3 bg-gray-50 rounded whitespace-pre-line">
                  {typeof selectedStory.text === 'string' ? selectedStory.text : 'Story text not available'}
                </div>
              </div>

              {selectedStory.requirementsLinked && selectedStory.requirementsLinked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Linked Requirements</h3>
                  <div className="space-y-2">
                    {selectedStory.requirementsLinked.map(req => (
                      <div key={typeof req === 'object' ? req._id : req} className="bg-blue-50 p-2 rounded">
                        <span className="font-semibold">
                          #{typeof req === 'object' ? (req.seq || 'N/A') : 'N/A'}:
                        </span> {typeof req === 'object' ? req.text : req}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Your Rating</h3>
                <StarRating value={currentRating} onChange={setCurrentRating} />
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Your Comments</h3>
                <textarea
                  className="w-full border border-gray-300 rounded p-2"
                  rows="4"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder="Add your comments about this story..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                  onClick={closeModal}
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
      </div>
    </div>
  );
};

export default StoriesPage;