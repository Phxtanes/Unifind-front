import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// สร้าง Context
const AuthContext = createContext();

// Hook สำหรับใช้ AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // ตรวจสอบสถานะการ login เมื่อแอพเริ่มต้น
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('currentUser');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // ฟังก์ชัน login ใหม่ที่ใช้ API
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: username,
        password: password
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setCurrentUser(response.data.user);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message };
      } else {
        return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
      }
    }
  };

  // ฟังก์ชัน register
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', userData);

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message };
      } else {
        return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
      }
    }
  };

  // ฟังก์ชัน logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  };

  // ฟังก์ชันอัปเดตข้อมูลผู้ใช้
  const updateCurrentUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const value = {
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    updateCurrentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};