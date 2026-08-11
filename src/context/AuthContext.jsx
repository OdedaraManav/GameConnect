import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getAuthMe, updateUserProfile } from '../services/api';

const TOKEN_KEY = 'gameconnect_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Startup token verification against /api/auth/me
  useEffect(() => {
    async function verifyExistingToken() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getAuthMe(storedToken);
        if (response && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          // Invalid payload structure
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Stored JWT token is invalid or expired. Logging out user.');
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifyExistingToken();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await loginUser(email, password);
      if (data.token && data.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Login failed.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to log in.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register / Sign Up handler
  const register = async (username, email, password) => {
    setError(null);
    try {
      const data = await registerUser(username, email, password);
      if (data.user) {
        return { success: true, message: data.message, user: data.user };
      } else {
        throw new Error(data.message || 'Registration failed.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to register.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Profile update handler
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const currentToken = token || localStorage.getItem(TOKEN_KEY);
      if (!currentToken) {
        throw new Error('Not authenticated.');
      }
      const data = await updateUserProfile(currentToken, profileData);
      if (data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Profile update failed.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
