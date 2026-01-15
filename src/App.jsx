import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TournamentDetails from './pages/TournamentDetails';
import TeamDetails from './pages/TeamDetails';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tournament/:tournamentId" element={<TournamentDetails />} />
              <Route path="/team/:teamId" element={<TeamDetails />} />
              {/* Add a catch-all route for 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;