import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import StarRating from '../components/common/StarRating';

// Mock data for use case diagrams
const useCaseDiagramsData = [
  {
    id: '1',
    title: 'User Management System',
    description: 'Use case diagram showing all user-related functionality',
    url: 'https://ucarecdn.com/85ac3de7-1fd4-433c-9cc2-105c192b1a01/',
    handle: '85ac3de7-1fd4-433c-9cc2-105c192b1a01',
    filename: 'user_management_usecase.drawio',
    mimetype: 'application/octet-stream',
    seq: 1,
    project: '5fb513797d8f3d66d8da982e',
    rating: 3,
    comment: 'Good identification of actors but some use cases could be more specific.',
    reviewed: true,
    requirementsLinked: [
      { id: '12', text: 'The system must support user registration and authentication.' },
      { id: '13', text: 'Administrators must be able to manage user accounts.' },
      { id: '15', text: 'Users must be able to manage their profile information.' }
    ]
  },
  {
    id: '2',
    title: 'Activity Planning System',
    description: 'Use case diagram showing the activity planning functionality',
    url: 'https://ucarecdn.com/76bc4de9-2fd4-453c-9bb2-115d194b1c02/',
    handle: '76bc4de9-2fd4-453c-9bb2-115d194b1c02',
    filename: 'activity_planning_usecase.drawio',
    mimetype: 'application/octet-stream',
    seq: 2,
    project: '5fb513797d8f3d66d8da982e',
    rating: 0,
    comment: '',
    reviewed: false,
    requirementsLinked: [
      { id: '18', text: 'The app must track user activities including duration, distance, and calories.' },
      { id: '21', text: 'Users must be able to plan and schedule future activities.' },
      { id: '22', text: 'The system should suggest activities based on user preferences and history.' }
    ]
  }
];

// Rubric data
const useCaseDiagramRubric = [
  { name: 'Actor Identification', description: 'Correctly identifies external actors', score: 4 },
  { name: 'Use Case Definition', description: 'Use cases represent valuable user goals', score: 3 },
  { name: 'Relationships', description: 'Proper use of include/extend relationships', score: 2 },
  { name: 'System Boundary', description: 'Clear system boundaries', score: 4 },
  { name: 'Completeness', description: 'Covers all user interactions with the system', score: 3 }
];

const UseCaseDiagramsPage = () => {
  const { projectId } = useParams();
  const [useCaseDiagrams, setUseCaseDiagrams] = useState([]);
  const [showRubric, setShowRubric] = useState(false);
  const [generalComment, setGeneralComment] = useState('');
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');
  
  useEffect(() => {
    // In a real app, fetch from API
    setUseCaseDiagrams(useCaseDiagramsData);
  }, [projectId]);
  
  const openReviewModal = (diagram) => {
    setSelectedDiagram(diagram);
    setCurrentRating(diagram.rating);
    setCurrentComment(diagram.comment);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedDiagram(null);
  };
  
  const saveReview = () => {
    // In a real app, send to API
    const updatedDiagrams = useCaseDiagrams.map(diagram => 
      diagram.id === selectedDiagram.id 
        ? {...diagram, rating: currentRating, comment: currentComment, reviewed: true} 
        : diagram
    );
    setUseCaseDiagrams(updatedDiagrams);
    closeModal();
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header username="johndoe" />
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to={`/projects/${projectId}`} className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 mr-3">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">Use Case Diagrams Review</h1>
        </div>
        
        <div className="flex justify-end mb-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={() => setShowRubric(!showRubric)}
          >
            {showRubric ? 'Hide Rubric Evaluation' : 'Show Rubric Evaluation'}
          </button>
        </div>
        
        {showRubric && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Use Case Diagrams Rubric Evaluation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {useCaseDiagramRubric.map((criteria, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{criteria.name}</h3>
                    <StarRating value={criteria.score} onChange={(newValue) => {
                      const updatedRubric = [...useCaseDiagramRubric];
                      updatedRubric[index].score = newValue;
                      // In a real app, you'd update the state here
                    }} />
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{criteria.description}</p>
                  <textarea 
                    className="w-full border border-gray-300 rounded p-2 text-sm" 
                    placeholder={`Comments about ${criteria.name}...`}
                    rows="2"
                  ></textarea>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div>
                <span className="text-pink-700 font-semibold">Overall Rubric Score:</span>
                <span className="text-xl font-bold ml-2">3.2/5</span>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                Save Rubric Evaluation
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">General Comments</h2>
          <textarea 
            className="w-full border border-gray-300 rounded p-2" 
            placeholder="Add general comments about all use case diagrams..."
            rows="4"
            value={generalComment}
            onChange={(e) => setGeneralComment(e.target.value)}
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Save Comments
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Use Case Diagrams</h2>
          
          <div className="space-y-6">
            {useCaseDiagrams.map(diagram => (
              <div key={diagram.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{diagram.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${diagram.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {diagram.reviewed ? 'Reviewed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600">{diagram.description}</p>
                </div>
                
                <div className="h-64 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="mb-2">Use Case Diagram Preview</div>
                    <p className="text-sm">Filename: {diagram.filename}</p>
                  </div>
                </div>
                
                {diagram.requirementsLinked && diagram.requirementsLinked.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="font-medium text-sm mb-2">Linked Requirements:</h4>
                    <div className="space-y-1">
                      {diagram.requirementsLinked.map(req => (
                        <div key={req.id} className="bg-blue-50 p-2 rounded text-sm">
                          <span className="font-semibold">#{req.id}:</span> {req.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    {diagram.reviewed && (
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Rating:</span>
                        <StarRating value={diagram.rating} />
                      </div>
                    )}
                  </div>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    onClick={() => openReviewModal(diagram)}
                  >
                    {diagram.reviewed ? 'Edit Review' : 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal for reviewing individual diagrams */}
        {showModal && selectedDiagram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Use Case Diagram: {selectedDiagram.title}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="p-3 bg-gray-50 rounded">{selectedDiagram.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Diagram</h3>
                <div className="h-96 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
                  <div className="text-center text-gray-500">
                    <div className="text-xl mb-2">Use Case Diagram Preview</div>
                    <p>Filename: {selectedDiagram.filename}</p>
                    <p className="text-sm mt-2">In a real app, the actual diagram would be displayed here</p>
                  </div>
                </div>
              </div>
              
              {selectedDiagram.requirementsLinked && selectedDiagram.requirementsLinked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Linked Requirements</h3>
                  <div className="space-y-2">
                    {selectedDiagram.requirementsLinked.map(req => (
                      <div key={req.id} className="bg-blue-50 p-2 rounded">
                        <span className="font-semibold">#{req.id}:</span> {req.text}
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
                  placeholder="Add your comments about this use case diagram..."
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

export default UseCaseDiagramsPage;