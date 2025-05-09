// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { getProjects } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getProjects();
        
        // Log the response for debugging
        console.log('API response:', response.data);
        
        // Handle different response formats
        let projectsArray = [];
        
        if (Array.isArray(response.data)) {
          projectsArray = response.data;
        } else if (response.data && Array.isArray(response.data.projects)) {
          projectsArray = response.data.projects;
        } else if (response.data && response.data.projects) {
          // For case where response might be { projects: {} }
          projectsArray = [response.data.projects];
        } else if (response.data && Object.keys(response.data).length > 0) {
          // Try to extract an array from the response
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            projectsArray = possibleArrays[0];
          } else {
            // It might be a single project object
            projectsArray = [response.data];
          }
        }
        
        setProjects(projectsArray);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter the projects only if projects is an array
  const filteredProjects = Array.isArray(projects) 
    ? projects.filter(project => 
        (project.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading projects...</div>;
  
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  
  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header username={currentUser?.username || currentUser?.email} />
        <div className="container mx-auto p-4">
          <div className="text-center py-10">
            <p>No projects found. Please check your API connection.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header username={currentUser?.username || currentUser?.email} />
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Projects Dashboard</h1>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{project.name}</h2>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 p-2 rounded">
                      <span className="text-sm font-medium">Requirements:</span>
                      <span className="float-right">
                        {Array.isArray(project.requirements) ? project.requirements.length : 0}
                      </span>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <span className="text-sm font-medium">Stories:</span>
                      <span className="float-right">
                        {Array.isArray(project.stories) ? project.stories.length : 0}
                      </span>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <span className="text-sm font-medium">Class Diagrams:</span>
                      <span className="float-right">
                        {Array.isArray(project.classDiagrams) ? project.classDiagrams.length : 0}
                      </span>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <span className="text-sm font-medium">Sequence Diagrams:</span>
                      <span className="float-right">
                        {Array.isArray(project.sequenceDiagrams) ? project.sequenceDiagrams.length : 0}
                      </span>
                    </div>
                  </div>
                  
                  <Link to={`/projects/${project._id}`}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                      View Project
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;