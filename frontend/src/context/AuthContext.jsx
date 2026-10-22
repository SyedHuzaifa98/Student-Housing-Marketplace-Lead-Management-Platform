import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current authenticated user on load if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const data = await apiClient('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Auth verification error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient('/auth/login', { body: { email, password } });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    setLoading(true);
    try {
      const data = await apiClient('/auth/demo-login', { body: { role } });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await apiClient('/auth/register', { body: userData });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient('/auth/logout', { method: 'POST' });
      }
    } catch (err) {
      console.warn('Logout error ignored:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await apiClient('/user/profile', {
      method: 'POST',
      body: profileData,
    });
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isLandlord: user?.role === 'landlord',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

