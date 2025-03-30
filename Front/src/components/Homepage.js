import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-75 d-flex justify-content-center">
        
        <div
          className="col-12 col-md-4 d-flex justify-content-center align-items-center bg-primary text-white p-5 rounded text-center m-2"
          style={{ cursor: "pointer", minHeight: "200px" }}
          onClick={() => navigate("/lostitemfrom")}
        >
          <h2>นำของเข้า</h2>
        </div>

        <div
          className="col-12 col-md-4 d-flex justify-content-center align-items-center bg-danger text-white p-5 rounded text-center m-2"
          style={{ cursor: "pointer", minHeight: "200px" }}
          onClick={() => navigate("/deletefrom")}
        >
          <h2>นำของออก</h2>
        </div>

        <div
          className="col-12 col-md-4 d-flex justify-content-center align-items-center bg-warning text-white p-5 rounded text-center m-2"
          style={{ cursor: "pointer", minHeight: "200px" }}
          onClick={() => navigate("/inventory")}
        >
          <h2>ค้นหาสิ่งของ</h2>
        </div>

      </div>
    </div>
  );
};

export default Home;
