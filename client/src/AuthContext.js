import React, { createContext, useState, useContext, useEffect } from 'react';
import Axios from 'axios';
import API_URL from './config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await Axios.get(`${API_URL}/check-session`, {
        withCredentials: true
      });
      
      if (response.data.valid) {
        // Get user info from the server
        const userResponse = await Axios.get(`${API_URL}/users/${response.data.userId}`, {
          withCredentials: true
        });
        setUser(userResponse.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      if (error.response?.status === 401) {
        // Clear any invalid session data
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await Axios.post(`${API_URL}/login`, {
        username,
        password
      }, {
        withCredentials: true
      });
      
      if (response.data.message === 'Login successful') {
        // Get user info from the server
        const userResponse = await Axios.get(`${API_URL}/users/${response.data.user.id}`, {
          withCredentials: true
        });
        
        // Set user data including admin status
        setUser({
          ...userResponse.data,
          isAdmin: userResponse.data.is_admin === 1
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await Axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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