import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth(); // เพิ่ม currentUser
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout(); // เรียกใช้ฟังก์ชัน logout จาก AuthContext เพื่อเคลียร์สถานะ authentication
    navigate("/"); // จากนั้นค่อย navigate ไปหน้าแรก
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
      {/* Modern Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-left">
          {/* Hamburger Button */}
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
          
          {/* Brand Text */}
          <h1 className="brand-text">
            ✨ Unifind Project
          </h1>
        </div>

        {/* User Info และ Logout Button */}
        <div className="d-flex align-items-center gap-3">
          {/* แสดงข้อมูลผู้ใช้ */}
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
                    href="/lostitemfrom"
                    onClick={closeSidebar}
                  >
                    ➕ Add Item
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

        {/* Main Content Area */}
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Navbar;