import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // ตรวจสอบสถานะการ login เมื่อแอพเริ่มต้น
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // ฟังก์ชัน login
  const login = (username, password) => {
  if (username === 'admin' && password === 'uf@min') {  // ← ที่นี่
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  }
  return false;
  };

  // ฟังก์ชัน logout
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};