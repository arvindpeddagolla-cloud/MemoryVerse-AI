import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { TimelinePage } from './pages/TimelinePage';
import { AiChat } from './pages/AiChat';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { CareerInsightsPage } from './pages/CareerInsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicPortfolio } from './pages/PublicPortfolio';

// Loading Spinner for Lazy-loaded/Suspense fallback
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      <p className="text-xs font-semibold text-slate-500">Loading MemoryVerse...</p>
    </div>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/portfolio/:userId" element={<PublicPortfolio />} />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/graph" 
              element={
                <ProtectedRoute>
                  <KnowledgeGraphPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/timeline" 
              element={
                <ProtectedRoute>
                  <TimelinePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <AiChat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume" 
              element={
                <ProtectedRoute>
                  <ResumeBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insights" 
              element={
                <ProtectedRoute>
                  <CareerInsightsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
