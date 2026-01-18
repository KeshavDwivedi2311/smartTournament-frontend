import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TournamentDetails = lazy(() => import('./pages/TournamentDetails'));
const TeamDetails = lazy(() => import('./pages/TeamDetails'));

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Suspense fallback={<LoadingSpinner fullScreen size="lg" text="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tournament/:tournamentId" element={<TournamentDetails />} />
                <Route path="/team/:teamId" element={<TeamDetails />} />
                {/* Add a catch-all route for 404 */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;