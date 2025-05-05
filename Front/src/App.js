import { BrowserRouter, Routes, Route } from "react-router-dom"; 

import Navbar from "./Navbar";
import Main from "./components/Main";
import Lostitemfrom from "./components/Form/LostItemForm";
import InventoryList from "./components/Inventory";
import EditItemForm from "./components/Form/EditItemForm";
import Removepage from "./components/Form/RemovepageForm";
import RemovedItemsList from './components/List/RemovedItemsList';
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/" element={<Navbar />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="lostitemfrom" element={<Lostitemfrom />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="edit/:id" element={<EditItemForm />} />
            <Route path="remove/:id" element={<Removepage />} />
            <Route path="removed" element={<RemovedItemsList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  };

export default App;
