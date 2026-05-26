import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize DB and load session on mount
  useEffect(() => {
    db.init();
    const sessionUser = db.getCurrentUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const user = db.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const refreshUser = () => {
    const sessionUser = db.getCurrentUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
  };

  const setClientPasswordWithToken = async (token, password) => {
    try {
      const updatedUser = db.setPasswordViaToken(token, password);
      return updatedUser;
    } catch (err) {
      throw new Error(err.message || 'Failed to set password');
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    refreshUser,
    setClientPasswordWithToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
