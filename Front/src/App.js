import './App.css';
import LostItemForm from "./components/LostItemForm";
import LostItemList from "./components/LostItemList";

function App() {
  return (
    <div>
      <h1>ระบบบันทึกของหาย</h1>
      <LostItemForm />
      <LostItemList />
    </div>
  );
}
export default App;
