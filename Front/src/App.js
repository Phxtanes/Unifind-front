import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Main from "./components/Main";
import Home from "./components/Homepage";
import Lostitemfrom from "./components/LostItemForm";
import InventoryList from "./components/SearchItem";
import EditItemForm from "./components/EditItemForm";
import Removepage from "./components/Removepage";
import RemovedItemsList from './components/RemovedItemsList';
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lostitemfrom" element={<Lostitemfrom />} />
        <Route path="/inventory" element={<InventoryList/>} />
        <Route path="/edit/:id" element={<EditItemForm />} />
        <Route path="/remove/:id" element={<Removepage/>} />
        <Route path="/removed" element={<RemovedItemsList />} />
      </Routes>
    </Router>
  );
};

export default App;