// src/pages/DesignPatternsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import StarRating from '../components/common/StarRating';
import { getDesignPatterns, getDesignPattern, submitReview, getMyReview, 
  getRubricEvaluation, saveRubricEvaluation, getGeneralComment, saveGeneralComment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DesignPatternsPage = () => {
  const { projectId } = useParams();
  const [designPatterns, setDesignPatterns] = useState([]);
  const [showRubric, setShowRubric] = useState(false);
  const [generalComment, setGeneralComment] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(null);
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
        
        // Fetch design patterns
        const response = await getDesignPatterns(projectId);
        
        // The API returns data in { diagrams: [...] } format based on your example
        const patterns = response.data.diagrams || [];
        
        // Fetch user's reviews for each pattern
        const patternsWithReviews = await Promise.all(
          patterns.map(async (pattern) => {
            try {
              const reviewResponse = await getMyReview('designPattern', pattern._id);
              return {
                ...pattern,
                rating: reviewResponse.data?.rating || 0,
                comment: reviewResponse.data?.comment || '',
                reviewed: !!reviewResponse.data
              };
            } catch (err) {
              return {
                ...pattern,
                rating: 0,
                comment: '',
                reviewed: false
              };
            }
          })
        );
        
        setDesignPatterns(patternsWithReviews);
        
        // Fetch general comment
        try {
          const commentResponse = await getGeneralComment(projectId, 'designPatterns');
          setGeneralComment(commentResponse.data?.comment || '');
        } catch (err) {
          console.error('Error fetching general comment:', err);
        }
        
        // Fetch rubric if showing
        if (showRubric) {
          fetchRubric();
        }
      } catch (err) {
        console.error('Error fetching design patterns:', err);
        setError('Failed to load design patterns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, showRubric]);
  
  const fetchRubric = async () => {
    try {
      const response = await getRubricEvaluation(projectId, 'designPatterns');
      setRubric(response.data?.evaluation?.criteria || []);
      
      // If no rubric exists yet, initialize with default criteria
      if (!response.data?.evaluation?.criteria?.length) {
        setRubric([
          { name: 'Pattern Selection', description: 'Appropriate pattern for the problem', score: 0 },
          { name: 'Implementation', description: 'Correctly implements the pattern', score: 0 },
          { name: 'Flexibility', description: 'Solution is flexible and extensible', score: 0 },
          { name: 'Complexity', description: 'Appropriate level of complexity', score: 0 },
          { name: 'Documentation', description: 'Well-documented rationale for pattern use', score: 0 }
        ]);
      }
    } catch (err) {
      console.error('Error fetching rubric:', err);
      // Initialize empty rubric criteria
      setRubric([
        { name: 'Pattern Selection', description: 'Appropriate pattern for the problem', score: 0 },
        { name: 'Implementation', description: 'Correctly implements the pattern', score: 0 },
        { name: 'Flexibility', description: 'Solution is flexible and extensible', score: 0 },
        { name: 'Complexity', description: 'Appropriate level of complexity', score: 0 },
        { name: 'Documentation', description: 'Well-documented rationale for pattern use', score: 0 }
      ]);
    }
  };
  
  const openReviewModal = async (pattern) => {
    setSelectedPattern(pattern);
    
    try {
      // Get the full pattern details
      const response = await getDesignPattern(pattern._id);
      setSelectedPattern(response.data.diagram);
      
      // Set current rating and comment
      setCurrentRating(pattern.rating || 0);
      setCurrentComment(pattern.comment || '');
      
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching design pattern details:', err);
      alert('Failed to load design pattern details. Please try again.');
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedPattern(null);
  };
  
  const saveReview = async () => {
    try {
      await submitReview('designPattern', selectedPattern._id, currentRating, currentComment);
      
      // Update local state
      const updatedPatterns = designPatterns.map(pattern => 
        pattern._id === selectedPattern._id 
          ? {...pattern, rating: currentRating, comment: currentComment, reviewed: true} 
          : pattern
      );
      setDesignPatterns(updatedPatterns);
      closeModal();
    } catch (err) {
      console.error('Error saving review:', err);
      alert('Failed to save review. Please try again.');
    }
  };
  
  const saveRubricHandler = async () => {
    try {
      const rubricData = {
        rubricType: 'designPatterns',
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
      await saveGeneralComment(projectId, 'designPatterns', generalComment);
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
      <div className="text-xl">Loading design patterns...</div>
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
          <h1 className="text-3xl font-bold">Design Patterns Review</h1>
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
            <h2 className="text-xl font-bold mb-4">Design Patterns Rubric Evaluation</h2>
            
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
            
            <div className="flex justify-between items-center bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div>
                <span className="text-teal-700 font-semibold">Overall Rubric Score:</span>
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
            placeholder="Add general comments about all design patterns..."
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
          <h2 className="text-xl font-bold mb-4">Design Patterns</h2>
          
          {designPatterns.length === 0 ? (
            <div className="text-center py-10">
              <p>No design patterns found for this project.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {designPatterns.map(pattern => (
                <div key={pattern._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-semibold">{pattern.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${pattern.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {pattern.reviewed ? 'Reviewed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-600">{pattern.description}</p>
                  </div>
                  
                  <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pattern.intent && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Intent:</h4>
                        <p className="text-sm text-gray-600">{pattern.intent}</p>
                      </div>
                    )}
                    {pattern.structure && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Structure:</h4>
                        <p className="text-sm text-gray-600">{pattern.structure}</p>
                      </div>
                    )}
                    {pattern.participants && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Participants:</h4>
                        <p className="text-sm text-gray-600">{pattern.participants}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-64 bg-gray-100 flex items-center justify-center">
                    {pattern.url ? (
                      <img 
                        src={pattern.url} 
                        alt={pattern.title} 
                        className="max-h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Preview+Unavailable";
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="mb-2">Design Pattern Diagram Preview</div>
                        <p className="text-sm">Filename: {pattern.filename}</p>
                      </div>
                    )}
                  </div>
                  
                  {((pattern.requirementsLinked && pattern.requirementsLinked.length > 0) || 
                   (pattern.classDiagramsLinked && pattern.classDiagramsLinked.length > 0)) && (
                    <div className="p-4 border-t border-gray-200">
                      {pattern.requirementsLinked && pattern.requirementsLinked.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-2">Linked Requirements:</h4>
                          <div className="space-y-1">
                            {pattern.requirementsLinked.map(reqId => (
                              <div key={reqId} className="bg-blue-50 p-2 rounded text-sm">
                                <span className="font-semibold">#{reqId}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {pattern.classDiagramsLinked && pattern.classDiagramsLinked.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Linked Class Diagrams:</h4>
                          <div className="space-y-1">
                            {pattern.classDiagramsLinked.map(diagramId => (
                              <div key={diagramId} className="bg-purple-50 p-2 rounded text-sm">
                                <span className="font-semibold">{diagramId}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      {pattern.reviewed && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Rating:</span>
                          <StarRating value={pattern.rating} />
                        </div>
                      )}
                    </div>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                      onClick={() => openReviewModal(pattern)}
                    >
                      {pattern.reviewed ? 'Edit Review' : 'Review'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Modal for reviewing individual design patterns */}
        {showModal && selectedPattern && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Design Pattern: {selectedPattern.title}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="p-3 bg-gray-50 rounded">{selectedPattern.description}</p>
              </div>
              
              {(selectedPattern.intent || selectedPattern.structure || selectedPattern.participants) && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedPattern.intent && (
                    <div>
                      <h3 className="font-semibold mb-2">Intent</h3>
                      <p className="p-3 bg-gray-50 rounded">{selectedPattern.intent}</p>
                    </div>
                  )}
                  {selectedPattern.structure && (
                    <div>
                      <h3 className="font-semibold mb-2">Structure</h3>
                      <p className="p-3 bg-gray-50 rounded">{selectedPattern.structure}</p>
                    </div>
                  )}
                  {selectedPattern.participants && (
                    <div>
                      <h3 className="font-semibold mb-2">Participants</h3>
                      <p className="p-3 bg-gray-50 rounded">{selectedPattern.participants}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Diagram</h3>
                <div className="h-96 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
                  {selectedPattern.url ? (
                    <img 
                      src={selectedPattern.url} 
                      alt={selectedPattern.title} 
                      className="max-h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300?text=Diagram+Preview+Unavailable";
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-xl mb-2">Design Pattern Diagram Preview</div>
                      <p>Filename: {selectedPattern.filename}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPattern.requirementsLinked && selectedPattern.requirementsLinked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Linked Requirements</h3>
                  <div className="space-y-2">
                    {selectedPattern.requirementsLinked.map(reqId => (
                      <div key={reqId} className="bg-blue-50 p-2 rounded">
                        <span className="font-semibold">#{reqId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPattern.classDiagramsLinked && selectedPattern.classDiagramsLinked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Linked Class Diagrams</h3>
                  <div className="space-y-2">
                    {selectedPattern.classDiagramsLinked.map(diagramId => (
                      <div key={diagramId} className="bg-purple-50 p-2 rounded">
                        <span className="font-semibold">{diagramId}</span>
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
                  placeholder="Add your comments about this design pattern..."
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

export default DesignPatternsPage;