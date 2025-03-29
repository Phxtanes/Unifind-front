import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-50 d-flex justify-content-between">
 
        <div
          className="col-md-5 d-flex justify-content-center align-items-center bg-primary text-white p-5 rounded text-center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/lostitemfrom")}
        >
          <h2>Lost Item</h2>
        </div>

        <div
          className="col-md-5 d-flex justify-content-center align-items-center bg-danger text-white p-5 rounded text-center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/deletefrom")}
        >
          <h2>Delete Item</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;
