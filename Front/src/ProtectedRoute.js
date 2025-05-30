import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // แสดง loading ขณะตรวจสอบสถานะ authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // ถ้าไม่ได้ login ให้ redirect ไปหน้า login พร้อมเก็บ path ที่ต้องการเข้า
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ถ้า login แล้วให้แสดงหน้าที่ต้องการ
  return children;
};

export default ProtectedRoute;