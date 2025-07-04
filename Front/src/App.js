import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";
import Main from "./components/Main";
import Lostitemfrom from "./components/Form/LostItemForm";
import InventoryList from "./components/Inventory";
import EditItemForm from "./components/Form/EditItemForm";
import Removepage from "./components/Form/RemovepageForm";
import Bin from "./components/Form/Bin";
import RemovedItemsList from './components/List/RemovedItemsList';
import Dashboard from "./components/Dashboard";
import Reports from "./Reports";
import UserManagement from "./components/UserManagement"; 
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="lostitemfrom" element={<Lostitemfrom />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="edit/:id" element={<EditItemForm />} />
            <Route path="remove/:id" element={<Removepage />} />
            <Route path="bin/:id" element={<Bin />} />
            <Route path="removed" element={<RemovedItemsList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;