import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getCurrentUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token
      getCurrentUser().catch(() => {
        logout();
      });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.username}!`);
      return { success: true, user };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiSignup(userData);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success(`Account created successfully! Welcome ${user.username}`);
      return { success: true, user };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};