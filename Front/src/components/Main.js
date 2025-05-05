import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../main.css";

function Main() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate("/Dashboard");
  };

  return (
    <div className="main-container">
      <div className="left-panel">
        <div className="content-container">
          <div className="logo">
            <div className="logo-white-box"></div>
            <div className="logo-orange-box"></div>
          </div>

          <div className="title-container">
            <h2 className="office-of">OFFICE OF</h2>
            <h1 className="student">STUDENT</h1>
            <h1 className="welfare">WELFARE</h1>
            <p className="thai-text">สำนักสวัสดิการนักศึกษา มหาวิทยาลัยหอการค้าไทย</p>
          </div>
        </div>

        <div className="contact-info">
          <div className="contact-item">
            <div className="contact-icon">☎</div>
            <div className="contact-text">02-697-6913, 6914</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">📱</div>
            <a className="contact-text" href="https://facebook.com/utccstudentwelfare" target="_blank" rel="noopener noreferrer" >facebook.com/utccstudentwelfare</a>
          </div>
          <div className="contact-item">
            <div className="contact-icon">🌐</div>
            <a className="contact-text" href="http://department.utcc.ac.th/utccswd" target="_blank" rel="noopener noreferrer">http://department.utcc.ac.th/utccswd</a>
          </div>
        </div>
      </div>

      <div className="right-panel">
        {!showLogin ? (
          <button onClick={() => setShowLogin(true)} className="btn btn-primary gologin">
            เข้าสู่ระบบ (สำหรับเจ้าหน้าที่)
          </button>
        ) : (
          <div className="login-container">
            <h4 className="login-title">== กรุณาเข้าสู่ระบบ ==</h4>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <input
                type="text"
                className="login-input"
                placeholder="Username or email?"
              />
              <input
                type="password"
                className="login-input"
                placeholder="Password"
              />
              <div className="login-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <span className="forgot-password">forgot password?</span>
              </div>
              <button type="submit" className="login-button">
                Log in
              </button>
              <div className="login-back">
                <span onClick={() => setShowLogin(false)}> &lt;&lt; Back</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
