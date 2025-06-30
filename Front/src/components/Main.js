import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../main.css";

function Main() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

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
    setSuccess("");

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอก Username และ Password");
      setLoading(false);
      return;
    }

    // เรียกใช้ฟังก์ชัน login จาก AuthContext
    const result = await login(username.trim(), password.trim());
    
    setLoading(false);

    if (result.success) {
      // Login สำเร็จ - ไปหน้า dashboard
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // ตรวจสอบข้อมูล
    if (!username.trim() || !password.trim() || !email.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("กรุณากรอก Email ที่ถูกต้อง");
      setLoading(false);
      return;
    }

    // เรียกใช้ฟังก์ชัน register จาก AuthContext
    const result = await register({
      username: username.trim(),
      password: password.trim(),
      email: email.trim(),
      role: role
    });

    setLoading(false);

    if (result.success) {
      setSuccess("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      // รีเซ็ตฟอร์ม
      setUsername("");
      setPassword("");
      setEmail("");
      setConfirmPassword("");
      setRole("staff");
      // แสดงหน้า login หลังจากสมัครสำเร็จ
      setTimeout(() => {
        setShowRegister(false);
        setShowLogin(true);
        setSuccess("");
      }, 2000);
    } else {
      setError(result.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  const resetForms = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setConfirmPassword("");
    setRole("staff");
    setError("");
    setSuccess("");
    setShowLogin(false);
    setShowRegister(false);
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
        {/* หน้าแรก - แสดงปุ่มเข้าสู่ระบบ */}
        {!showLogin && !showRegister && (
          <div className="text-center">
            <button onClick={() => setShowLogin(true)} className="btn btn-primary gologin mb-3">
              เข้าสู่ระบบ (สำหรับเจ้าหน้าที่)
            </button>
            <br />
            {/* <button onClick={() => setShowRegister(true)} className="btn btn-secondary" style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              สมัครสมาชิก
            </button> */}
          </div>
        )}

        {/* หน้า Login */}
        {showLogin && !showRegister && (
          <div className="login-container">
            <h4 className="login-title">== เข้าสู่ระบบ ==</h4>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="login-form">
              <input
                type="text"
                className="login-input"
                placeholder="Username หรือ Email"
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
                <span 
                  className="forgot-password" 
                  style={{ cursor: 'pointer', color: '#007bff' }}
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                >
                  สมัครสมาชิก
                </span>
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
              <div className="login-back">
                <span onClick={resetForms}> &lt;&lt; ย้อนกลับ</span>
              </div>
            </form>
          </div>
        )}

        {/* หน้า Register */}
        {showRegister && !showLogin && (
          <div className="login-container">
            <h4 className="login-title">== สมัครสมาชิก ==</h4>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="login-form">
              <input
                type="text"
                className="login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <input
                type="email"
                className="login-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                className="login-input"
                placeholder="Password (อย่างน้อย 6 ตัวอักษร)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                className="login-input"
                placeholder="ยืนยัน Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <select
                className="login-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
              
              <div className="login-options">
                <span 
                  style={{ cursor: 'pointer', color: '#007bff' }}
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                >
                  มีบัญชีแล้ว? เข้าสู่ระบบ
                </span>
              </div>
              
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  "สมัครสมาชิก"
                )}
              </button>
              <div className="login-back">
                <span onClick={resetForms}> &lt;&lt; ย้อนกลับ</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;