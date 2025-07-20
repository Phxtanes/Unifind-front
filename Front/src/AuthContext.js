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
      try {
        const user = JSON.parse(userData);
        // ตรวจสอบว่าผู้ใช้ยังคงมีสิทธิ์เข้าใช้งานหรือไม่อย่างเข้มงวด
        // เฉพาะ admin หรือ staff ที่ได้รับการอนุมัติแล้วเท่านั้น
        // ห้าม member เข้าสู่ระบบโดยเด็ดขาด
        if (user && user.isActive && 
            ((user.role === 'admin') || 
             (user.role === 'staff' && user.isApproved === true))) {
          setIsAuthenticated(true);
          setCurrentUser(user);
        } else {
          // ถ้าไม่มีสิทธิ์แล้ว ให้ logout
          console.log('User does not have permission to access system:', user?.role, 'approved:', user?.isApproved);
          logout();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
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
        const user = response.data.user;
        
        setIsAuthenticated(true);
        setCurrentUser(user);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
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
      // กำหนดให้ผู้ใช้ใหม่เป็น member เสมอ
      const registerData = {
        ...userData,
        role: 'member'
      };

      const response = await axios.post('http://localhost:8080/api/auth/register', registerData);

      if (response.data.success) {
        return { 
          success: true, 
          message: 'สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบเพื่อเป็นเจ้าหน้าที่' 
        };
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

  // ฟังก์ชันตรวจสอบสิทธิ์
  const hasPermission = (requiredRole) => {
    if (!currentUser) return false;
    
    const roleHierarchy = {
      'member': 0, // member ไม่สามารถเข้าถึงอะไรได้
      'staff': 1,
      'admin': 2
    };

    const userLevel = roleHierarchy[currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  // ฟังก์ชันตรวจสอบว่าเป็น admin หรือไม่
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // ฟังก์ชันตรวจสอบว่าเป็น staff หรือสูงกว่าหรือไม่
  const isStaffOrAbove = () => {
    return hasPermission('staff');
  };

  const value = {
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    updateCurrentUser,
    hasPermission,
    isAdmin,
    isStaffOrAbove,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};