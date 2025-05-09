// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (email, password, name) => api.post('/api/auth/register', { email, password, name });
export const getCurrentUser = () => api.get('/api/auth/me');
export const logout = () => api.post('/api/auth/logout');

// Projects endpoints
export const getProjects = () => api.get('/api/projects');
export const getProject = (id) => api.get(`/api/projects/${id}`);

// Requirements endpoints
export const getRequirements = (projectId) => api.get(`/api/requirements/project/${projectId}`);
export const getRequirement = (id) => api.get(`/api/requirements/${id}`);
export const updateRequirement = (id, data) => api.put(`/api/requirements/${id}`, data);

// Stories endpoints
export const getStories = (projectId) => api.get(`/api/stories/project/${projectId}`);
export const getStory = (id) => api.get(`/api/stories/${id}`);
export const updateStory = (id, data) => api.put(`/api/stories/${id}`, data);

// Class Diagrams endpoints
export const getClassDiagrams = (projectId) => api.get(`/api/class-diagrams/project/${projectId}`);
export const getClassDiagram = (id) => api.get(`/api/class-diagrams/${id}`);
export const updateClassDiagram = (id, data) => api.put(`/api/class-diagrams/${id}`, data);

// Design Patterns endpoints
export const getDesignPatterns = (projectId) => api.get(`/api/design-patterns/project/${projectId}`);
export const getDesignPattern = (id) => api.get(`/api/design-patterns/${id}`);
export const updateDesignPattern = (id, data) => api.put(`/api/design-patterns/${id}`, data);

// Sequence Diagrams endpoints
export const getSequenceDiagrams = (projectId) => api.get(`/api/sequence-diagrams/project/${projectId}`);
export const getSequenceDiagram = (id) => api.get(`/api/sequence-diagrams/${id}`);
export const updateSequenceDiagram = (id, data) => api.put(`/api/sequence-diagrams/${id}`, data);

// Use Case Diagrams endpoints
export const getUseCaseDiagrams = (projectId) => api.get(`/api/use-case-diagrams/project/${projectId}`);
export const getUseCaseDiagram = (id) => api.get(`/api/use-case-diagrams/${id}`);
export const updateUseCaseDiagram = (id, data) => api.put(`/api/use-case-diagrams/${id}`, data);

// Activity Diagrams endpoints
export const getActivityDiagrams = (projectId) => api.get(`/api/activity-diagrams/project/${projectId}`);
export const getActivityDiagram = (id) => api.get(`/api/activity-diagrams/${id}`);
export const updateActivityDiagram = (id, data) => api.put(`/api/activity-diagrams/${id}`, data);

// Mockups endpoints
export const getMockups = (projectId) => api.get(`/api/mockups/project/${projectId}`);
export const getMockup = (id) => api.get(`/api/mockups/${id}`);
export const updateMockup = (id, data) => api.put(`/api/mockups/${id}`, data);

// Reviews endpoints
export const submitReview = (artifactType, artifactId, rating, comment) => 
    api.post('/api/reviews', { 
      artifactType, // 'story', 'requirement', etc.
      artifactId,   // The _id of the artifact
      rating,       // Numeric rating
      comment       // Comment text
    });
export const getReviewsForArtifact = (artifactType, artifactId) => 
  api.get(`/api/reviews/${artifactType}/${artifactId}`);
export const getMyReview = (artifactType, artifactId) => 
  api.get(`/api/reviews/my/${artifactType}/${artifactId}`);

// General Comments endpoints
export const saveGeneralComment = (projectId, artifactType, comment) => 
  api.post('/api/reviews/general-comment', { projectId, artifactType, comment });
export const getGeneralComment = (projectId, artifactType) => 
  api.get(`/api/reviews/general-comment/${projectId}/${artifactType}`);

// Rubric Evaluations endpoints
export const getRubricEvaluation = (projectId, rubricType) => 
  api.get(`/api/rubric-evaluations/${projectId}/${rubricType}`);
export const saveRubricEvaluation = (data) => 
  api.post('/api/rubric-evaluations', data);
export const saveRubricGeneralComment = (projectId, rubricType, comment) => 
  api.post('/api/rubric-evaluations/general-comment', { projectId, rubricType, comment });

export default api;