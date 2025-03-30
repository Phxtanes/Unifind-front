import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Homepage";
import Lostitemfrom from "./components/LostItemForm";
import InventoryList from "./components/SearchItem";
import EditItemForm from "./components/EditItemForm";
import Removepage from "./components/Removepage";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lostitemfrom" element={<Lostitemfrom />} />
        <Route path="/inventory" element={<InventoryList/>} />
        <Route path="/edit/:id" element={<EditItemForm />} />
        <Route path="/remove/:id" element={<Removepage/>} />
      </Routes>
    </Router>
  );
};

export default App;