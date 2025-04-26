import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); 
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <nav
        className="navbar navbar-expand-lg navbar-dark "
        style={{
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100%", 
          zIndex: 10000, 
          backgroundColor: "#2F318B"
        }}
      >
        <div className="container-fluid">
          <span className="navbar-brand">Unifind Project</span>
        </div>

        <div>
          <button
            className="btn btn-danger m-2"
            style={{ width: "150px" }}
            onClick={handleLogout}
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", marginTop: "56px" }}>
        <div
          className="bg-light d-flex flex-column justify-content-between p-3"
          style={{
            width: "250px",
            borderRight: "1px solid #ddd",
            position: "fixed",
            top: "56px",
            left: 0,
            height: "calc(100vh - 56px)",
            zIndex: 9999,
            backgroundColor: "white"
          }}
        >
          <div className="mb-auto">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  เมนูที่ 1
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  เมนูที่ 2
                </a>
              </li>
            


            </ul>
          </div>

          <div>

            <button onClick={() => navigate("/removed")} className="btn btn-secondary btn-danger mb-3 w-100">
                ถังขยะ
            </button>

            <button className="btn btn-secondary w-100" onClick={handleBack}>
              ย้อนกลับ
            </button>
            
          </div>
        </div>

        <div
          className="flex-grow-1 p-3"
          style={{ marginLeft: "250px", overflowY: "auto" }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
