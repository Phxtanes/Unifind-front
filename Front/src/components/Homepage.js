import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-75 d-flex justify-content-center">
        <div
          className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center bg-success text-white p-4 rounded text-center m-2"
          style={{ cursor: "pointer", minHeight: "200px" }}
          onClick={() => navigate("/lostitemfrom")}
        >
          <img 
            src={"./images/import.png"}
            alt="" 
            style={{ width: "150px", height: "150px", marginBottom: "30px" }}
          />
          <h4>นำของเข้า</h4>
        </div>


        <div
          className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center bg-warning text-dark p-4 rounded text-center m-2"
          style={{ cursor: "pointer", minHeight: "200px" }}
          onClick={() => navigate("/inventory")}
        >
          <img 
            src={"./images/search.png"}
            alt="" 
            style={{ width: "150px", height: "150px", marginBottom: "30px" }}
          />
          <h4>ค้นหาสิ่งของ</h4>
        </div>
      </div>
    </div>
  );
};

export default Home;

       
         {/* <div
          className="col-12 col-md-4 d-flex justify-content-center align-items-center bg-danger text-white p-5 rounded text-center m-2"
          style={{ cursor: "pointer", minHeight: "200px" }}
          onClick={() => navigate("/deletefrom")}
        >
          <h2>นำของออก</h2>
        </div>
        */}