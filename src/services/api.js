// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:4000';

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
export const getProjectsStats = (page = 1, limit = 10, queryParams = '') => {
  let url = `/api/projects/stats?page=${page}&limit=${limit}`;
  if (queryParams && queryParams !== '') {
    url += `&${queryParams}`;
  }
  return api.get(url);
};

export const getProjectStats = (projectId) => 
  api.get(`/api/projects/${projectId}/stats`);

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
export const submitReview = (artifactType, artifactId, rating, comment, scores = {}) => {
  console.log(`[API] Submitting review for ${artifactType} ${artifactId}:`, {
    artifactType, artifactId, rating, comment, scores
  });
  return api.post('/api/reviews', {
    artifactType,
    artifactId,
    rating,
    comment,
    ...scores
  })
    .then(response => {
      console.log('[API] Submit review response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[API] Error submitting review:', error);
      throw error;
    });
};

// Get all reviews for an artifact (from all users)
export const getReviewsForArtifact = (artifactType, artifactId) =>
  api.get(`/api/reviews/${artifactType}/${artifactId}`);

// Get current user's review for an artifact
export const getMyReview = (artifactType, artifactId) =>
  api.get(`/api/reviews/my/${artifactType}/${artifactId}`);

// Get all reviews for an artifact type in a project (from all users)
export const getAllReviewsForArtifactType = (projectId, artifactType) =>
  api.get(`/api/reviews/project/${projectId}/artifactType/${artifactType}`);

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

// Composite endpoints for dashboard and review data
export const getProjectDashboard = (projectId) =>
  api.get(`/api/composite/projects/${projectId}/dashboard`);

// Design Patterns review data
export const getDesignPatternsReviewData = (projectId) => {
  return api.get(`/api/composite/design-patterns/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Activity Diagrams review data
export const getActivityDiagramsReviewData = (projectId) => {
  return api.get(`/api/composite/activity-diagrams/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Class Diagrams review data
export const getClassDiagramsReviewData = (projectId) => {
  return api.get(`/api/composite/class-diagrams/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Sequence Diagrams review data
export const getSequenceDiagramsReviewData = (projectId) => {
  return api.get(`/api/composite/sequence-diagrams/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Use Case Diagrams review data
export const getUseCaseDiagramsReviewData = (projectId) => {
  return api.get(`/api/composite/use-case-diagrams/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Mockups review data
export const getMockupsReviewData = (projectId) => {
  return api.get(`/api/composite/mockups/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Requirements review data
export const getRequirementsReviewData = (projectId) => {
  return api.get(`/api/composite/requirements/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Stories review data
export const getStoriesReviewData = (projectId) => {
  return api.get(`/api/composite/stories/project/${projectId}/review-data`)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

// Get mockup navigation tree
export const getMockupNavigationTree = (mockupId) =>
  api.get(`/api/composite/mockups/${mockupId}/navigation-tree`);

// Submit bulk reviews
export const submitBulkReviews = (reviews) =>
  api.post('/api/composite/reviews/bulk', { reviews });

// Get linked artifact
export const getLinkedArtifact = (artifactType, artifactId) =>
  api.get(`/api/composite/linked-artifact/${artifactType}/${artifactId}`);

// Get aggregate reviews across all users (universal review)
export const getAggregateReviews = (projectId, artifactType) =>
  api.get(`/api/composite/aggregate-reviews/${projectId}/${artifactType}`);

export default api;