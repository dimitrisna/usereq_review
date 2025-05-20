import React, { useState, useEffect } from 'react';
import { getProjectsStats } from '../services/api';
import Header from '../components/common/Header';
import StarRating from '../components/common/StarRating';
import {
  Search,
  ArrowUpDown,
  Calendar,
  BookOpen,
  Hexagon,
  GitBranch,
  FileCode,
  Layers,
  Smartphone,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Main effect to fetch projects based on pagination
  useEffect(() => {
    fetchProjects(pagination.currentPage, pagination.itemsPerPage, searchTerm, sortConfig.key, sortConfig.direction);
  }, [pagination.currentPage, pagination.itemsPerPage, sortConfig, searchTerm]);


  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== '') {
        fetchProjects(1, pagination.itemsPerPage, searchTerm, sortConfig.key, sortConfig.direction);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, pagination.itemsPerPage, sortConfig.key, sortConfig.direction]);

  // Modified to include search and sort parameters for the API
  const fetchProjects = async (page, limit, search = '', sortField = 'name', sortDirection = 'ascending') => {
    try {
      setLoading(true);

      // Building query parameters for backend filtering and sorting
      let queryParams = `page=${page}&limit=${limit}`;

      if (search) {
        queryParams += `&search=${encodeURIComponent(search)}`;
      }

      if (sortField) {
        queryParams += `&sortField=${sortField}&sortDirection=${sortDirection}`;
      }

      // Using the updated API method that supports query parameters
      const response = await getProjectsStats(page, limit, queryParams);
      setProjects(response.data.projects || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: response.data.projects?.length || 0,
        itemsPerPage: limit
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
    }
  };

  // Request sort with updated handling
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    // Trigger a new fetch with sort parameters
    fetchProjects(pagination.currentPage, pagination.itemsPerPage, searchTerm, key, direction);
  };

  // Fix for pagination to prevent multiple rapid clicks
  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      setLoading(true);
      fetchProjects(pagination.currentPage + 1, pagination.itemsPerPage, searchTerm, sortConfig.key, sortConfig.direction);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1 && !loading) {
      setLoading(true);
      fetchProjects(pagination.currentPage - 1, pagination.itemsPerPage, searchTerm, sortConfig.key, sortConfig.direction);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Progress bar component
  const ProgressBar = ({ value, max, color }) => {
    const percentage = Math.round((value / max) * 100) || 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
        />
      </div>
    );
  };

  // Stats card component with icon
  const StatCard = ({ icon, title, value, total, color }) => {
    const Icon = icon;

    return (
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">{title}</span>
            <span className="text-xs font-bold">{value}/{total}</span>
          </div>
          <ProgressBar value={value} max={total} color={color} />
        </div>
      </div>
    );
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <div className="text-xl text-indigo-700 font-medium">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <Info className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Error Loading Projects</h3>
          <p className="text-center text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => fetchProjects(1, pagination.itemsPerPage)}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>Total: {pagination.totalItems} projects</span>
              {loading && <span className="text-indigo-600 animate-pulse">• Refreshing</span>}
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    <button
                      onClick={() => requestSort('name')}
                      className="flex items-center space-x-1 group hover:text-gray-900"
                    >
                      <span>Project</span>
                      <ArrowUpDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    <button
                      onClick={() => requestSort('overallAverageGrade')}
                      className="flex items-center space-x-1 group hover:text-gray-900"
                    >
                      <span>Grade</span>
                      <ArrowUpDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>Artifact Reviews</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    <button
                      onClick={() => requestSort('createdAt')}
                      className="flex items-center space-x-1 group hover:text-gray-900"
                    >
                      <span>Created</span>
                      <ArrowUpDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                      {searchTerm ? 'No projects match your search. Try different keywords.' : 'No projects found.'}
                    </td>
                  </tr>
                ) : (
                  projects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <a
                          href={`/projects/${project.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {project.name}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <StarRating
                              value={Math.round((typeof project.overallAverageGrade === 'number' ? project.overallAverageGrade : 0) * 2) / 2}
                              readOnly={true}
                              allowHalf={true}
                              size="sm"
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              {typeof project.overallAverageGrade === 'number'
                                ? project.overallAverageGrade.toFixed(1)
                                : '0.0'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-w-md">
                          <StatCard
                            icon={BookOpen}
                            title="Requirements"
                            value={project.stats?.requirements?.reviewed || 0}
                            total={project.stats?.requirements?.total || 0}
                            color="bg-blue-600"
                          />
                          <StatCard
                            icon={BookOpen}
                            title="Stories"
                            value={project.stats?.stories?.reviewed || 0}
                            total={project.stats?.stories?.total || 0}
                            color="bg-green-600"
                          />
                          <StatCard
                            icon={GitBranch}
                            title="Activity Diagrams"
                            value={project.stats?.activityDiagrams?.reviewed || 0}
                            total={project.stats?.activityDiagrams?.total || 0}
                            color="bg-violet-600"
                          />
                          <StatCard
                            icon={Hexagon}
                            title="Use Case Diagrams"
                            value={project.stats?.useCaseDiagrams?.reviewed || 0}
                            total={project.stats?.useCaseDiagrams?.total || 0}
                            color="bg-indigo-600"
                          />
                          <StatCard
                            icon={GitBranch}
                            title="Sequence Diagrams"
                            value={project.stats?.sequenceDiagrams?.reviewed || 0}
                            total={project.stats?.sequenceDiagrams?.total || 0}
                            color="bg-orange-600"
                          />
                          <StatCard
                            icon={FileCode}
                            title="Class Diagrams"
                            value={project.stats?.classDiagrams?.reviewed || 0}
                            total={project.stats?.classDiagrams?.total || 0}
                            color="bg-emerald-600"
                          />
                          <StatCard
                            icon={Layers}
                            title="Design Patterns"
                            value={project.stats?.designPatterns?.reviewed || 0}
                            total={project.stats?.designPatterns?.total || 0}
                            color="bg-yellow-600"
                          />
                          <StatCard
                            icon={Smartphone}
                            title="Mockups"
                            value={project.stats?.mockups?.reviewed || 0}
                            total={project.stats?.mockups?.total || 0}
                            color="bg-pink-600"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Modified to prevent rapid clicks */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span> of <span className="font-medium">{pagination.totalItems}</span> projects
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.currentPage === 1 || loading}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === 1 || loading
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={pagination.currentPage === pagination.totalPages || loading}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === pagination.totalPages || loading
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;