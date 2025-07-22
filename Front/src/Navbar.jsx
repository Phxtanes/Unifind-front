import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import FloatingAddButton from "./components/FloatingAddButton"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // ปรับ sidebar behavior ตาม screen size
      if (mobile) {
        setIsSidebarOpen(false); // ปิด sidebar ใน mobile
      } else {
        setIsSidebarOpen(true); // เปิด sidebar ใน desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowLogoutModal(false);
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const dashboard = () => {
    navigate("/dashboard");
    if (isMobile) closeSidebar();
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
      {/* Top Bar */}
      <nav className="top-bar">
        <div className="top-bar-left">
          {/* Hamburger button */}
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
              e.preventDefault();
              dashboard();
            }}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              userSelect: 'none'
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

        <div className="top-bar-right">
          {currentUser && (
            <div className="user-info">
              <small>สวัสดี, </small>
              <span className="fw-bold">{currentUser.username}</span>
              <small className="ms-2 opacity-75">
                ({getRoleText(currentUser.role)})
              </small>
            </div>
          )}
          
          <button
            className="logout-btn"
            onClick={openLogoutModal}
            aria-label="Logout"
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  ยืนยันการออกจากระบบ
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeLogoutModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="mb-3">
                  คุณต้องการออกจากระบบจริงหรือไม่?
                </p>
                <small className="text-muted">
                  การออกจากระบบจะทำให้คุณต้องเข้าสู่ระบบใหม่อีกครั้ง
                </small>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={closeLogoutModal}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 ms-2"
                  onClick={handleLogout}
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`main-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            {/* <h6 className="sidebar-title">
              📋 เมนูหลัก
            </h6> */}
            {/* แสดงข้อมูลผู้ใช้ใน sidebar สำหรับ mobile */}
           {/*  {isMobile && currentUser && (
              <div className="sidebar-user-info">
                <small className="text-muted">ผู้ใช้: </small>
                <span className="fw-bold">{currentUser.username}</span>
                <br />
                <small className="text-muted">
                  บทบาท: {getRoleText(currentUser.role)}
                </small>
              </div>
            )} */}
          </div>
          
          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            <ul className="nav-menu">
              {/* Dashboard - ทุกคนเข้าถึงได้ */}
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/dashboard"
                  onClick={(e) => {
                    if (isMobile) closeSidebar();
                  }}
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
                    onClick={(e) => {
                      if (isMobile) closeSidebar();
                    }}
                  >
                    📦 คลังเก็บของ
                  </a>
                </li>
              )}

              {/* Reports - สำหรับ staff ขึ้นไป */}
              {canAccess('staff') && (
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/reports"
                    onClick={(e) => {
                      if (isMobile) closeSidebar();
                    }}
                  >
                    📊 รายงาน
                  </a>
                </li>
              )}

              {/* สิ่งของที่ถูกนำออกแล้ว - สำหรับ staff ขึ้นไป */}
              {canAccess('staff') && (
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/removed"
                    onClick={(e) => {
                      if (isMobile) closeSidebar();
                    }}
                  >
                    🗑️ สิ่งของที่ถูกนำออกแล้ว
                  </a>
                </li>
              )}
              
              {/* User Management - สำหรับ admin เท่านั้น */}
              {canAccess('admin') && (
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/user-management"
                    onClick={(e) => {
                      if (isMobile) closeSidebar();
                    }}
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
                      onClick={(e) => {
                        if (isMobile) closeSidebar();
                      }}
                    >
                      📝 รายการของฉัน
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/profile"
                      onClick={(e) => {
                        if (isMobile) closeSidebar();
                      }}
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
                    onClick={(e) => {
                      if (isMobile) closeSidebar();
                    }}
                  >
                    ⚙️ จัดการรายการ
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* ปุ่มออกจากระบบสำหรับ mobile */}
          {isMobile && (
            <button
              className="sidebar-logout-btn"
              onClick={() => {
                openLogoutModal();
                closeSidebar();
              }}
            >
              ออกจากระบบ
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Outlet />
        {/* แสดง FloatingAddButton เฉพาะ member ขึ้นไป */}
        {canAccess('member') && <FloatingAddButton />}
      </main>
    </div>
  );
}

export default Navbar;