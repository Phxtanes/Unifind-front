import React from "react";
import { useNavigate } from "react-router-dom";
import "../main.css";

function Main() {
  const navigate = useNavigate();

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
            <div className="contact-text">facebook.com/utccstudentwelfare</div>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">🌐</div>
            <div className="contact-text">http://department.utcc.ac.th/utccswd</div>
          </div>
        </div>
      </div>
      <button 
          onClick={() => navigate("/home")} 
          className="btn btn-primary login">
          เข้าสู่ระบบ(สำหรับเจ้าหน้าที่)
       </button>
    </div>
  );
      
}

export default Main;

