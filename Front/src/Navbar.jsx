import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // เพิ่มการใช้ logout จาก AuthContext
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

        {/* Logout Button */}
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
         ออกจากระบบ
        </button>
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
                
                {/* <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={closeSidebar}
                  >
                    ⚙️ Settings
                  </a>
                </li> */}
                
                {/* <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={closeSidebar}
                  >
                    📞 Contact
                  </a>
                </li> */}
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