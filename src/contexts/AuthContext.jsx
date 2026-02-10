
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Simple user list - you can easily modify this
const USERS = [
  { username: 'nap-admin-user', password: 'nap-admin-user', role: 'admin' },
  { username: 'organizer', password: 'org123', role: 'admin' },
  { username: 'sport', password: 'sport', role: 'admin' },
  { username: 'VFZiggo', password: 'VFZiggo', role: 'admin' },
    { username: 'pso', password: 'pso', role: 'admin' },

];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
    }
  }, []);

  const login = (username, password) => {
    const foundUser = USERS.find(u =>
      u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = { username: foundUser.username, role: foundUser.role };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      setIsAdmin(foundUser.role === 'admin');
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      isLoggedIn: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
