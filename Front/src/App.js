import { BrowserRouter, Routes, Route } from "react-router-dom"; 

import Navbar from "./components/Navbar";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />

          <Route path="/" element={<Navbar />}>
            <Route path="home" element={<Home />} />
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
