// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import pages
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectPage';
import RequirementsPage from './pages/RequirementsPage';
import StoriesPage from './pages/StoriesPage';
import ClassDiagramsPage from './pages/ClassDiagramsPage';
import ActivityDiagramsPage from './pages/ActivityDiagramPage';
import SequenceDiagramsPage from './pages/SequenceDiagramsPage';
import UseCaseDiagramsPage from './pages/UseCaseDiagramPage';
import DesignPatternsPage from './pages/DesignPatternsPage';
import MockupsPage from './pages/MockupsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ProtectedRoute component
const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
        <div className="text-xl text-blue-700 font-medium">
          Loading...<span className="animate-pulse">...</span>
        </div>
      </div>
    </div>
  );
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/projects/:projectId/requirements" element={<RequirementsPage />} />
            <Route path="/projects/:projectId/stories" element={<StoriesPage />} />
            <Route path="/projects/:projectId/activity-diagrams" element={<ActivityDiagramsPage />} />
            <Route path="/projects/:projectId/use-case-diagrams" element={<UseCaseDiagramsPage />} />
            <Route path="/projects/:projectId/sequence-diagrams" element={<SequenceDiagramsPage />} />
            <Route path="/projects/:projectId/class-diagrams" element={<ClassDiagramsPage />} />
            <Route path="/projects/:projectId/design-patterns" element={<DesignPatternsPage />} />
            <Route path="/projects/:projectId/mockups" element={<MockupsPage />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;