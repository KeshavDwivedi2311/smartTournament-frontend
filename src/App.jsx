import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TournamentDetails = lazy(() => import('./pages/TournamentDetails'));
const TeamDetails = lazy(() => import('./pages/TeamDetails'));

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner fullScreen size="lg" text="Loading..." />}>
          <Routes>
            {/* ── Public / Marketing ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* ── App (authenticated area) ── */}
            <Route
              path="/app"
              element={
                <div className="min-h-screen bg-gray-50">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </div>
              }
            />
            <Route
              path="/app/tournament/:tournamentId"
              element={
                <div className="min-h-screen bg-gray-50">
                  <Layout>
                    <TournamentDetails />
                  </Layout>
                </div>
              }
            />
            <Route
              path="/app/team/:teamId"
              element={
                <div className="min-h-screen bg-gray-50">
                  <Layout>
                    <TeamDetails />
                  </Layout>
                </div>
              }
            />

            {/* ── Legacy redirects ── */}
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="/tournament/:tournamentId" element={<Navigate to="/app/tournament/:tournamentId" replace />} />
            <Route path="/team/:teamId" element={<Navigate to="/app/team/:teamId" replace />} />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
