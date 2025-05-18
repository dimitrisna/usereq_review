import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProject, getProjectStats } from '../services/api';
import Header from '../components/common/Header';
import StarRating from '../components/common/StarRating';
import { 
  BookOpen, 
  Hexagon, 
  GitBranch, 
  FileCode, 
  Layers, 
  Smartphone, 
  ChevronRight,
  Activity
} from 'lucide-react';

const ProjectDetails = () => {
  // We would normally get projectId from useParams, but here we'll simulate it
  // In a real app, you would replace this with useParams() from react-router-dom
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        
        // Get project stats first for more details
        const statsResponse = await getProjectStats(projectId);
        console.log('Project stats:', statsResponse.data);
        // Determine if we need to fetch additional project info
        if (statsResponse.data && statsResponse.data.project) {
          setProject(statsResponse.data.project);
          setStats(statsResponse.data.stats);
        } else {
          // Fallback to regular project endpoint if needed
          const projectResponse = await getProject(projectId);
          setProject(projectResponse.data.project || projectResponse.data);
          setStats(statsResponse.data.stats || {});
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get icon by artifact type
  const getArtifactIcon = (artifactType) => {
    switch (artifactType) {
      case 'requirements': return BookOpen;
      case 'stories': return BookOpen;
      case 'activityDiagrams': return GitBranch;
      case 'useCaseDiagrams': return Hexagon;
      case 'sequenceDiagrams': return GitBranch;
      case 'classDiagrams': return FileCode;
      case 'designPatterns': return Layers;
      case 'mockups': return Smartphone;
      default: return BookOpen;
    }
  };

  // Get color by artifact type
  const getArtifactColor = (artifactType) => {
    switch (artifactType) {
      case 'requirements': return 'blue';
      case 'stories': return 'green';
      case 'activityDiagrams': return 'violet';
      case 'useCaseDiagrams': return 'indigo';
      case 'sequenceDiagrams': return 'orange';
      case 'classDiagrams': return 'emerald';
      case 'designPatterns': return 'yellow';
      case 'mockups': return 'pink';
      default: return 'gray';
    }
  };

  // Get display name for artifact type
  const getArtifactDisplayName = (artifactType) => {
    switch (artifactType) {
      case 'requirements': return 'Requirements';
      case 'stories': return 'Stories';
      case 'activityDiagrams': return 'Activity Diagrams';
      case 'useCaseDiagrams': return 'Use Case Diagrams';
      case 'sequenceDiagrams': return 'Sequence Diagrams';
      case 'classDiagrams': return 'Class Diagrams';
      case 'designPatterns': return 'Design Patterns';
      case 'mockups': return 'Mockups';
      default: return artifactType;
    }
  };
  
  // Calculate review progress percentage
  const calculateProgress = (reviewed, total) => {
    if (!total) return 0;
    return Math.round((reviewed / total) * 100);
  };

  // Progress circle component
  const ProgressCircle = ({ percentage, size = 80, strokeWidth = 8, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const dash = (percentage * circumference) / 100;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={`var(--${color}-600)`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
            style={{ 
              "--blue-600": "#2563eb", 
              "--green-600": "#16a34a", 
              "--violet-600": "#7c3aed", 
              "--indigo-600": "#4f46e5", 
              "--orange-600": "#ea580c", 
              "--emerald-600": "#059669", 
              "--yellow-600": "#ca8a04", 
              "--pink-600": "#db2777", 
              "--gray-600": "#4b5563"
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{percentage}%</span>
        </div>
      </div>
    );
  };

  // Artifact card component
  const ArtifactCard = ({ artifactType }) => {
    const Icon = getArtifactIcon(artifactType);
    const color = getArtifactColor(artifactType);
    const displayName = getArtifactDisplayName(artifactType);
    
    const total = stats?.[artifactType]?.total || 0;
    const reviewed = stats?.[artifactType]?.reviewed || 0;
    const rating = stats?.[artifactType]?.averageRating || 0;
    const progress = calculateProgress(reviewed, total);
    
    return (
      <div className={`bg-white border border-${color}-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
        <div className={`px-4 py-3 bg-${color}-50 border-b border-${color}-100 flex justify-between items-center`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-${color}-600 mr-3`}>
              <Icon size={16} className="text-white" />
            </div>
            <h3 className="font-medium text-gray-900">{displayName}</h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <ProgressCircle percentage={progress} color={color} />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{reviewed}/{total}</div>
              <div className="text-sm text-gray-500">Artifacts reviewed</div>
              <div className="mt-2 flex items-center">
                <StarRating 
                  value={typeof rating === 'number' ? rating : 0} 
                  readOnly={true}
                  allowHalf={true}
                  size="sm"
                />
                <span className="ml-2 text-gray-700 font-medium">
                  {rating ? rating.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>
          
          <a 
            href={`/projects/${projectId}/${artifactType.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            className={`mt-4 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${color}-600 hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500`}
          >
            Review {displayName}
            <ChevronRight size={16} className="ml-1" />
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <div className="text-xl text-indigo-700 font-medium">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <div className="text-center">
          <div className="text-lg text-gray-700 mb-4">Project not found</div>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Calculate overall stats
  const totalArtifacts = stats ? Object.values(stats).reduce((sum, type) => sum + (type.total || 0), 0) : 0;
  const totalReviewed = stats ? Object.values(stats).reduce((sum, type) => sum + (type.reviewed || 0), 0) : 0;
  
  // Calculate average grade from all artifact types
  const artifactTypes = stats ? Object.keys(stats) : [];
  const ratingsSum = stats ? Object.values(stats).reduce((sum, type) => {
    const rating = typeof type.averageRating === 'number' && !isNaN(type.averageRating) ? type.averageRating : 0;
    return sum + rating;
  }, 0) : 0;
  
  const validRatingsCount = stats ? Object.values(stats).filter(type => 
    typeof type.averageRating === 'number' && !isNaN(type.averageRating) && type.averageRating > 0
  ).length : 0;
  
  const averageGrade = validRatingsCount > 0 ? (ratingsSum / validRatingsCount) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Project header */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-2 text-gray-600 max-w-3xl">{project.description || 'No description provided'}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="mb-2 flex items-center">
                <StarRating 
                  value={typeof averageGrade === 'number' ? averageGrade : 0} 
                  readOnly={true}
                  allowHalf={true}
                  size="lg"
                />
                <span className="ml-2 text-gray-900 font-bold text-xl">
                  {averageGrade ? averageGrade.toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Created: <span className="font-medium">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Artifact Cards */}
        <div>          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {artifactTypes.map(type => (
              <ArtifactCard key={type} artifactType={type} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;