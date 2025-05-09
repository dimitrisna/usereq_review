import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';

// Mock data
const requirementsData = [
  { 
    id: '29', 
    text: 'The user must be able to pay for their selected trip plan directly through the application.', 
    description: 'The user must be able to complete payment for paid travel plans (e.g. premium plans) within the app without redirecting to external payment websites.',
    type: 'Functional', 
    user_priority: 'Medium',
    system_priority: 'High',
    rating: 4, 
    comment: 'Good requirement, clearly defined.', 
    reviewed: true 
  },
  { 
    id: '30', 
    text: 'The system must support multiple payment methods including credit cards and PayPal.', 
    description: 'Users should have flexibility in how they pay, supporting major credit cards and PayPal integration at minimum.',
    type: 'Functional', 
    user_priority: 'High',
    system_priority: 'High',
    rating: 0, 
    comment: '', 
    reviewed: false 
  },
  { 
    id: '31', 
    text: 'The application must be accessible for users with disabilities and comply with WCAG 2.1 standards.', 
    description: 'All app features must be accessible to users with disabilities, conforming to WCAG 2.1 Level AA standards.',
    type: 'Non-Functional', 
    user_priority: 'Medium',
    system_priority: 'Medium',
    rating: 3, 
    comment: 'Need to specify which WCAG level (A, AA, or AAA) is required.', 
    reviewed: true 
  }
];

// Rubric data
const requirementsRubric = [
  { name: 'Clarity', description: 'Requirements are clear and unambiguous', score: 4 },
  { name: 'Testability', description: 'Requirements can be verified through testing', score: 3 },
  { name: 'Feasibility', description: 'Requirements are technically and operationally feasible', score: 4 },
  { name: 'Necessity', description: 'Each requirement is essential to the system', score: 5 },
  { name: 'Prioritization', description: 'Requirements are properly prioritized', score: 3 }
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

const RequirementsPage = () => {
  const { projectId } = useParams();
  const [requirements, setRequirements] = useState([]);
  const [showRubric, setShowRubric] = useState(false);
  const [generalComment, setGeneralComment] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');
  
  useEffect(() => {
    // In a real app, fetch from API
    setRequirements(requirementsData);
  }, [projectId]);
  
  const openReviewModal = (req) => {
    setSelectedReq(req);
    setCurrentRating(req.rating);
    setCurrentComment(req.comment);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedReq(null);
  };
  
  const saveReview = () => {
    // In a real app, send to API
    const updatedRequirements = requirements.map(req => 
      req.id === selectedReq.id 
        ? {...req, rating: currentRating, comment: currentComment, reviewed: true} 
        : req
    );
    setRequirements(updatedRequirements);
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
          <h1 className="text-3xl font-bold">Requirements Review</h1>
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
            <h2 className="text-xl font-bold mb-4">Requirements Rubric Evaluation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {requirementsRubric.map((criteria, index) => (
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
            
            <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div>
                <span className="text-blue-700 font-semibold">Overall Rubric Score:</span>
                <span className="text-xl font-bold ml-2">3.8/5</span>
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
            placeholder="Add general comments about all requirements..."
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
          <h2 className="text-xl font-bold mb-4">Individual Requirements</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requirements.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">#{req.id}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">{req.text.substring(0, 60)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.user_priority}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.system_priority}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating value={req.rating} onChange={null} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${req.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.reviewed ? 'Reviewed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openReviewModal(req)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal for reviewing individual requirements */}
        {showModal && selectedReq && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Requirement #{selectedReq.id}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Requirement Text</h3>
                <p className="p-3 bg-gray-50 rounded">{selectedReq.text}</p>
              </div>
              
              {selectedReq.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="p-3 bg-gray-50 rounded">{selectedReq.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Type</h3>
                  <p className="px-2 py-1 bg-gray-100 rounded text-sm inline-block">{selectedReq.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">User Priority</h3>
                  <p className="px-2 py-1 bg-gray-100 rounded text-sm inline-block">{selectedReq.user_priority}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">System Priority</h3>
                  <p className="px-2 py-1 bg-gray-100 rounded text-sm inline-block">{selectedReq.system_priority}</p>
                </div>
              </div>
              
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
                  placeholder="Add your comments about this requirement..."
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

export default RequirementsPage;