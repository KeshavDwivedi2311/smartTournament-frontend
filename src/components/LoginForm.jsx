
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAdmin, login, logout } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(username, password);

    if (result.success) {
      setUsername('');
      setPassword('');
      setError('');
      setShowLogin(false);
    } else {
      setError(result.error);
    }
  };

  // If user is logged in, show user info and logout
  if (user) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isAdmin ? '✏️ Editor' : '👁️ Viewer'}
          </span>
          <span className="text-gray-700 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
            Welcome, {user.username}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 sm:py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors w-full sm:w-auto"
        >
          Logout
        </button>
      </div>
    );
  }

  // If not logged in, show login button or form
  if (!showLogin) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
        <span className="text-gray-500 text-xs sm:text-sm">👁️ View Only Mode</span>
        <button
          onClick={() => setShowLogin(true)}
          className="px-3 py-1.5 sm:py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors w-full sm:w-auto whitespace-nowrap"
        >
          Login to Edit
        </button>
      </div>
    );
  }

  // Show login form
  return (
    <div className="fixed inset-0 sm:relative sm:inset-auto bg-black bg-opacity-50 sm:bg-transparent flex items-center justify-center p-4 sm:p-0 z-50 sm:z-auto">
      <div className="bg-white border rounded-lg p-4 sm:p-4 shadow-lg w-full max-w-sm sm:max-w-none sm:w-auto">
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">Login to Edit</h3>
            <button
              type="button"
              onClick={() => {
                setShowLogin(false);
                setError('');
                setUsername('');
                setPassword('');
              }}
              className="text-gray-400 hover:text-gray-600 text-lg sm:text-base p-1"
            >
              ✕
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2.5 sm:py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors order-2 sm:order-1"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="px-3 py-2.5 sm:py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors order-1 sm:order-2"
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2 text-center sm:text-left">
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
