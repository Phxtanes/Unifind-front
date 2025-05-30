import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../main.css";

function Main() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // ถ้า login แล้วให้ redirect ไปหน้า dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอก Username และ Password");
      setLoading(false);
      return;
    }

    // เรียกใช้ฟังก์ชัน login จาก AuthContext (ให้ AuthContext ตรวจสอบ username/password)
    const success = login(username.trim(), password.trim());
    
    setLoading(false);

    if (success) {
      // Login สำเร็จ - ไปหน้า dashboard
      navigate("/dashboard", { replace: true });
    } else {
      setError("Username หรือ Password ไม่ถูกต้อง");
    }
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
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleLoginSubmit} className="login-form">
              <input
                type="text"
                className="login-input"
                placeholder="Username or email?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="login-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <span className="forgot-password">forgot password?</span>
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
              <div className="login-back">
                <span onClick={() => {
                  setShowLogin(false);
                  setError("");
                  setUsername("");
                  setPassword("");
                }}> &lt;&lt; Back</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;