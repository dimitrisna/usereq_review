import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';

// Mock data for mockups
const mockupsData = [
  {
    id: '1',
    title: 'Login Screen',
    description: 'The initial login screen with social authentication options',
    url: 'https://ucarecdn.com/9b5b4064-6cc9-4c75-ab23-108306d9cab9/',
    handle: '9b5b4064-6cc9-4c75-ab23-108306d9cab9',
    filename: 'login_screen.png',
    mimetype: 'image/png',
    seq: 1,
    project: '5fb513797d8f3d66d8da982e',
    rating: 4,
    comment: 'Clean design, good use of white space and clear call to action.',
    reviewed: true,
    storiesLinked: [
      { id: '3', title: 'User Authentication', text: 'As a user, I want to log in to the app...' }
    ],
    previousScreens: [],
    nextScreens: [
      { id: '2', title: 'Dashboard' }
    ]
  },
  {
    id: '2',
    title: 'Dashboard',
    description: 'Main dashboard showing activity overview and stats',
    url: 'https://ucarecdn.com/8a7b5064-7dc9-4b75-cb45-209406e9cab8/',
    handle: '8a7b5064-7dc9-4b75-cb45-209406e9cab8',
    filename: 'dashboard.png',
    mimetype: 'image/png',
    seq: 2,
    project: '5fb513797d8f3d66d8da982e',
    rating: 3,
    comment: 'Good layout but metrics could be more visually appealing.',
    reviewed: true,
    storiesLinked: [
      { id: '8', title: 'HomeOverview', text: 'As a user, I want to view an overview of my activity statistics...' }
    ],
    previousScreens: [
      { id: '1', title: 'Login Screen' }
    ],
    nextScreens: [
      { id: '3', title: 'Activity Detail' },
      { id: '4', title: 'Profile Settings' }
    ]
  },
  {
    id: '3',
    title: 'Activity Detail',
    description: 'Detailed view of a specific activity with metrics',
    url: 'https://ucarecdn.com/7c6d4053-8ec8-3b65-da35-108306d9cab9/',
    handle: '7c6d4053-8ec8-3b65-da35-108306d9cab9',
    filename: 'activity_detail.png',
    mimetype: 'image/png',
    seq: 3,
    project: '5fb513797d8f3d66d8da982e',
    rating: 0,
    comment: '',
    reviewed: false,
    storiesLinked: [
      { id: '9', title: 'ActivityTracking', text: 'As a user, I want to track my outdoor activities...' }
    ],
    previousScreens: [
      { id: '2', title: 'Dashboard' }
    ],
    nextScreens: [
      { id: '2', title: 'Dashboard' }
    ]
  },
  {
    id: '4',
    title: 'Profile Settings',
    description: 'User profile and app settings screen',
    url: 'https://ucarecdn.com/6b5c3042-7bc7-2a54-ca24-098205c8dba7/',
    handle: '6b5c3042-7bc7-2a54-ca24-098205c8dba7',
    filename: 'profile_settings.png',
    mimetype: 'image/png',
    seq: 4,
    project: '5fb513797d8f3d66d8da982e',
    rating: 0,
    comment: '',
    reviewed: false,
    storiesLinked: [
      { id: '5', title: 'UserProfile', text: 'As a user, I want to update my profile information...' }
    ],
    previousScreens: [
      { id: '2', title: 'Dashboard' }
    ],
    nextScreens: [
      { id: '2', title: 'Dashboard' }
    ]
  }
];

// Rubric data
const mockupsRubric = [
  { name: 'UI/UX Design', description: 'Follows UI/UX best practices', score: 4 },
  { name: 'Consistency', description: 'Consistent design patterns and elements', score: 5 },
  { name: 'Flow', description: 'Logical flow between screens', score: 3 },
  { name: 'Completeness', description: 'Covers all required functionality', score: 4 },
  { name: 'User-Friendliness', description: 'Intuitive and easy to use', score: 4 }
];

// Star Rating Component
const StarRating = ({ value, max = 5, onChange = null }) => {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    stars.push(
      <span 
        key={i} 
        className={`text-2xl cursor-pointer ${i <= value ? 'text-yellow-500' : 'text-gray-300'}`}
        onClick={() => onChange && onChange(i)}
      >
        ★
      </span>
    );
  }
  return <div className="flex">{stars}</div>;
};

const MockupsPage = () => {
  const { projectId } = useParams();
  const [mockups, setMockups] = useState([]);
  const [showRubric, setShowRubric] = useState(false);
  const [generalComment, setGeneralComment] = useState('');
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');
  
  // For navigation between mockups in the modal
  // eslint-disable-next-line
  const [currentMockupId, setCurrentMockupId] = useState(null);
  
  useEffect(() => {
    // In a real app, fetch from API
    setMockups(mockupsData);
  }, [projectId]);
  
  const openReviewModal = (mockup) => {
    setSelectedMockup(mockup);
    setCurrentMockupId(mockup.id);
    setCurrentRating(mockup.rating);
    setCurrentComment(mockup.comment);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedMockup(null);
    setCurrentMockupId(null);
  };
  
  const saveReview = () => {
    // In a real app, send to API
    const updatedMockups = mockups.map(mockup => 
      mockup.id === selectedMockup.id 
        ? {...mockup, rating: currentRating, comment: currentComment, reviewed: true} 
        : mockup
    );
    setMockups(updatedMockups);
    
    // Don't close the modal if we're navigating between mockups
  };
  
  const navigateToMockup = (mockupId) => {
    // Save current review first
    saveReview();
    
    // Find the new mockup
    const newMockup = mockups.find(m => m.id === mockupId);
    if (newMockup) {
      setSelectedMockup(newMockup);
      setCurrentMockupId(newMockup.id);
      setCurrentRating(newMockup.rating);
      setCurrentComment(newMockup.comment);
    }
  };
  
  // Find previous and next screens for navigation
  const getPreviousScreens = () => {
    return selectedMockup?.previousScreens || [];
  };
  
  const getNextScreens = () => {
    return selectedMockup?.nextScreens || [];
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header username="johndoe" />
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to={`/projects/${projectId}`} className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 mr-3">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">Mockups Review</h1>
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
            <h2 className="text-xl font-bold mb-4">Mockups Rubric Evaluation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {mockupsRubric.map((criteria, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{criteria.name}</h3>
                    <StarRating value={criteria.score} />
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
            
            <div className="flex justify-between items-center bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div>
                <span className="text-orange-700 font-semibold">Overall Rubric Score:</span>
                <span className="text-xl font-bold ml-2">4.0/5</span>
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
            placeholder="Add general comments about all mockups..."
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
          <h2 className="text-xl font-bold mb-4">Mockups</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockups.map(mockup => (
              <div key={mockup.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{mockup.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${mockup.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {mockup.reviewed ? 'Reviewed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{mockup.description}</p>
                </div>
                
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="mb-2">Mockup Preview</div>
                    <p className="text-sm">Filename: {mockup.filename}</p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  {/* Navigation links */}
                  <div className="flex justify-between text-sm mb-3">
                    <div>
                      {mockup.previousScreens && mockup.previousScreens.length > 0 && (
                        <div>
                          <span className="text-gray-600">Previous:</span> 
                          {mockup.previousScreens.map((screen, idx) => (
                            <span key={idx} className="ml-1 text-blue-600">{screen.title}{idx < mockup.previousScreens.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      {mockup.nextScreens && mockup.nextScreens.length > 0 && (
                        <div>
                          <span className="text-gray-600">Next:</span> 
                          {mockup.nextScreens.map((screen, idx) => (
                            <span key={idx} className="ml-1 text-blue-600">{screen.title}{idx < mockup.nextScreens.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {mockup.reviewed && (
                    <div className="mb-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Rating:</span>
                        <StarRating value={mockup.rating} />
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    onClick={() => openReviewModal(mockup)}
                  >
                    {mockup.reviewed ? 'Edit Review' : 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal for reviewing individual mockups */}
        {showModal && selectedMockup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Mockup: {selectedMockup.title}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
              
              {/* Mockup Navigation */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    {getPreviousScreens().length > 0 && (
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">Previous Screens:</span>
                        <div className="flex space-x-2">
                          {getPreviousScreens().map(screen => (
                            <button 
                              key={screen.id} 
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                              onClick={() => navigateToMockup(screen.id)}
                            >
                              {screen.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {getNextScreens().length > 0 && (
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">Next Screens:</span>
                        <div className="flex space-x-2">
                          {getNextScreens().map(screen => (
                            <button 
                              key={screen.id} 
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                              onClick={() => navigateToMockup(screen.id)}
                            >
                              {screen.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="p-3 bg-gray-50 rounded">{selectedMockup.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Mockup</h3>
                <div className="h-96 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
                  <div className="text-center text-gray-500">
                    <div className="text-xl mb-2">Mockup Preview</div>
                    <p>Filename: {selectedMockup.filename}</p>
                    <p className="text-sm mt-2">In a real app, the actual mockup image would be displayed here</p>
                  </div>
                </div>
              </div>
              
              {selectedMockup.storiesLinked && selectedMockup.storiesLinked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Linked Stories</h3>
                  <div className="space-y-2">
                    {selectedMockup.storiesLinked.map(story => (
                      <div key={story.id} className="bg-green-50 p-2 rounded">
                        <span className="font-semibold">{story.title}:</span> {story.text}
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
                  placeholder="Add your comments about this mockup..."
                ></textarea>
              </div>
              
              <div className="flex justify-between">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                  onClick={closeModal}
                >
                  Close
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

export default MockupsPage;