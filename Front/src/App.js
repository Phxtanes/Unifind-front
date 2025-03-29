import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Homepage";
import Lostitemfrom from "./components/LostItemForm";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lostitemfrom" element={<Lostitemfrom />} />
      </Routes>
    </Router>
  );
};

export default App;