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

  // ฟังก์ชันแปลงชื่อ role เป็นภาษาไทย
  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'staff': return 'เจ้าหน้าที่';
      case 'member': return 'สมาชิก';
      default: return 'ผู้ใช้';
    }
  };

  // ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึงเมนู
  const canAccess = (requiredRole) => {
    if (!currentUser) return false;
    
    const roleHierarchy = {
      'member': 1,
      'staff': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
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
                ({getRoleText(currentUser.role)})
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
                    บทบาท: {getRoleText(currentUser.role)}
                  </small>
                </div>
              )}
            </div>
            
            {/* Navigation Menu */}
            <nav>
              <ul className="nav-menu">
                {/* Dashboard - ทุกคนเข้าถึงได้ */}
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/dashboard"
                    onClick={closeSidebar}
                  >
                    🏠 Dashboard
                  </a>
                </li>
                
                {/* Inventory - สำหรับ member ขึ้นไป */}
                {canAccess('member') && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/inventory"
                      onClick={closeSidebar}
                    >
                      📦 Inventory
                    </a>
                  </li>
                )}

                {/* Reports - สำหรับ staff ขึ้นไป */}
                {canAccess('staff') && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/reports"
                      onClick={closeSidebar}
                    >
                      📊 Reports
                    </a>
                  </li>
                )}
                
                {/* User Management - สำหรับ admin เท่านั้น */}
                {canAccess('admin') && (
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

                {/* เมนูเพิ่มเติมสำหรับ member */}
                {currentUser?.role === 'member' && (
                  <>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        href="/my-items"
                        onClick={closeSidebar}
                      >
                        📝 รายการของฉัน
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        href="/profile"
                        onClick={closeSidebar}
                      >
                        👤 ข้อมูลส่วนตัว
                      </a>
                    </li>
                  </>
                )}

                {/* เมนูเพิ่มเติมสำหรับ staff */}
                {canAccess('staff') && currentUser?.role !== 'admin' && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/manage-items"
                      onClick={closeSidebar}
                    >
                      ⚙️ จัดการรายการ
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Sidebar Actions */}
          <div className="sidebar-actions">
            {/* ถังขยะ - สำหรับ staff ขึ้นไป */}
            {canAccess('staff') && (
              <button
                className="action-btn trash-btn"
                onClick={() => {
                  navigate("/removed");
                  closeSidebar();
                }}
              >
                🗑️ ถังขยะ
              </button>
            )}
            
            <button
              className="action-btn back-btn"
              onClick={() => {
                handleBack();
                closeSidebar();
              }}
            >
              ⬅️ ย้อนกลับ
            </button>

            {/* ปุ่มออกจากระบบสำหรับ mobile */}
            <button
              className="action-btn logout-btn-mobile d-md-none"
              onClick={() => {
                handleLogout();
                closeSidebar();
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                marginTop: '10px'
              }}
            >
              🚪 ออกจากระบบ
            </button>
          </div>
        </aside>

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
          {/* แสดง FloatingAddButton เฉพาะ member ขึ้นไป */}
          {canAccess('member') && <FloatingAddButton />}
        </main>
      </div>
    </div>
  );
}

export default Navbar;