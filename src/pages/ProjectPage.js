// src/pages/ProjectPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { getProject } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('requirements');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await getProject(projectId);
        
        // The API returns data in { project: {...}, stats: {...} } format
        if (response.data && response.data.project) {
          setProject(response.data.project);
          setStats(response.data.stats || {});
        } else {
          setProject(response.data);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const renderTabSection = (title, items, link, colorClass, statKey) => {
    // Use stats if available, otherwise fallback to counting items
    const total = stats && stats[statKey] ? stats[statKey].total : (items?.length || 0);
    const reviewed = stats && stats[statKey] ? stats[statKey].reviewed : 0;
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Link to={link}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Review {title}
            </button>
          </Link>
        </div>

        <div className={`bg-${colorClass}-50 border border-${colorClass}-200 rounded-lg p-4 mb-6`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-semibold text-${colorClass}-700 mb-1`}>Reviews</h3>
              <p className="text-sm text-gray-600">
                {reviewed} out of {total} {title.toLowerCase()} reviewed
              </p>
            </div>
            <div className="text-2xl font-bold">
              {reviewed}/{total}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500">Select "Review {title}" to see the complete list</p>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      Loading project details...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">
      {error}
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      Project not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header username={currentUser?.username || currentUser?.email} />
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        
        {/* Project Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700">{project.description}</p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap">
              {[
                { id: 'requirements', label: 'Requirements' },
                { id: 'stories', label: 'Stories' },
                { id: 'activityDiagrams', label: 'Activity Diagrams' },
                { id: 'useCaseDiagrams', label: 'Use Case Diagrams' },
                { id: 'sequenceDiagrams', label: 'Sequence Diagrams' },
                { id: 'classDiagrams', label: 'Class Diagrams' },
                { id: 'designPatterns', label: 'Design Patterns' },
                { id: 'mockups', label: 'Mockups' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'requirements' && renderTabSection(
            "Requirements",
            project.requirements,
            `/projects/${projectId}/requirements`,
            "blue",
            "requirements"
          )}

          {activeTab === 'stories' && renderTabSection(
            "Stories",
            project.stories,
            `/projects/${projectId}/stories`,
            "green",
            "stories"
          )}

          {activeTab === 'activityDiagrams' && renderTabSection(
            "Activity Diagrams",
            project.activityDiagrams,
            `/projects/${projectId}/activity-diagrams`,
            "purple",
            "activityDiagrams"
          )}

          {activeTab === 'useCaseDiagrams' && renderTabSection(
            "Use Case Diagrams",
            project.useCaseDiagrams,
            `/projects/${projectId}/use-case-diagrams`,
            "purple",
            "useCaseDiagrams"
          )}

          {activeTab === 'sequenceDiagrams' && renderTabSection(
            "Sequence Diagrams",
            project.sequenceDiagrams,
            `/projects/${projectId}/sequence-diagrams`,
            "purple",
            "sequenceDiagrams"
          )}

          {activeTab === 'classDiagrams' && renderTabSection(
            "Class Diagrams",
            project.classDiagrams,
            `/projects/${projectId}/class-diagrams`,
            "purple",
            "classDiagrams"
          )}

          {activeTab === 'designPatterns' && renderTabSection(
            "Design Patterns",
            project.designPatterns,
            `/projects/${projectId}/design-patterns`,
            "yellow",
            "designPatterns"
          )}

          {activeTab === 'mockups' && renderTabSection(
            "Mockups",
            project.mockups_ref,
            `/projects/${projectId}/mockups`,
            "orange",
            "mockups"
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;