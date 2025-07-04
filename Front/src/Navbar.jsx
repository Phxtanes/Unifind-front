import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import FloatingAddButton from "./components/FloatingAddButton"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboard = () => {
    navigate("/dashboard");
    closeSidebar();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <nav className="modern-navbar">
        <div className="navbar-left">
          <button
            className="hamburger-btn"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <div className="hamburger-icon">
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </button>
          
          <h1 
            className="brand-text" 
            onClick={(e) => {
              e.preventDefault(); // ป้องกัน default behavior
              dashboard(); // เรียกฟังก์ชัน dashboard
            }}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              userSelect: 'none' // ป้องกันการเลือกข้อความ
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.textShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            title="กลับไปหน้า Dashboard"
          >
            ✨ Unifind Project
          </h1>
        </div>

        <div className="d-flex align-items-center gap-3">
          {currentUser && (
            <div className="text-white d-none d-md-block">
              <small>สวัสดี, </small>
              <span className="fw-bold">{currentUser.username}</span>
              <small className="ms-2 opacity-75">
                ({currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'})
              </small>
            </div>
          )}
          
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Modern Sidebar */}
        <aside className={`modern-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div>
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <h6 className="sidebar-title">
                📋 เมนูหลัก
              </h6>
              {/* แสดงข้อมูลผู้ใช้ใน sidebar สำหรับ mobile */}
              {currentUser && (
                <div className="d-md-none mt-2">
                  <small className="text-muted">ผู้ใช้: </small>
                  <span className="fw-bold">{currentUser.username}</span>
                  <br />
                  <small className="text-muted">
                    บทบาท: {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
                  </small>
                </div>
              )}
            </div>
            
            {/* Navigation Menu */}
            <nav>
              <ul className="nav-menu">
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/dashboard"
                    onClick={closeSidebar}
                  >
                    🏠 Dashboard
                  </a>
                </li>
                
                
                
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/inventory"
                    onClick={closeSidebar}
                  >
                    📦 Inventory
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/reports"
                    onClick={closeSidebar}
                  >
                    📊 Reports
                  </a>
                </li>
                
                {/* แสดงเมนู User Management เฉพาะ Admin */}
                {currentUser?.role === 'admin' && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/user-management"
                      onClick={closeSidebar}
                    >
                      👥 จัดการผู้ใช้
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Sidebar Actions */}
          <div className="sidebar-actions">
            <button
              className="action-btn trash-btn"
              onClick={() => {
                navigate("/removed");
                closeSidebar();
              }}
            >
              🗑️ ถังขยะ
            </button>
            
            <button
              className="action-btn back-btn"
              onClick={() => {
                handleBack();
                closeSidebar();
              }}
            >
              ⬅️ ย้อนกลับ
            </button>
          </div>
        </aside>

        
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
          <FloatingAddButton />
        </main>
      </div>
    </div>
  );
}

export default Navbar;