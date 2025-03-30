import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    axios
      .get("http://localhost:8080/api/lost-items/status/stored")
      .then((response) => {
        setItems(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
        setLoading(false);
      });
  }, []);

  const handleSetStatusItem = (id) => {
    axios
      .put(`http://localhost:8080/api/lost-items/status/${id}`)
      .then((response) => {
        alert("Item status updated to 'Removed' successfully", response);
  
        setItems(items.map((item) =>
          item.id === id ? { ...item, status: "removed" } : item
        ));
      })
      .catch((error) => {
        console.error("Error updating item status:", error);
        alert("ไม่สามารถเปลี่ยนสถานะได้");
      });
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">หน้ารายการสิ่งของ</h2>

      <input
        type="text"
        placeholder="ค้นหาสิ่งของ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="form-control mb-3"
      />

      {loading ? (
        <p className="text-center">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <table className="table table-bordered text-center">
          <thead className="thead-dark">
            <tr>
              <th>รูปภาพ</th>
              <th>หมวดหมู่</th>
              <th>ชื่อสิ่งของ</th>
              <th>วันที่พบ</th>
              <th>ตู้เก็บ</th>
              <th>สถานะ</th>
              <th>แก้ไข</th>
              <th>นำออก</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td className="fs-4">📷</td>
                <td>{item.category}</td>
                <td>{item.name}</td>
                <td>{item.date}</td>
                <td>{item.locker}</td>
                <td>{item.status}</td>
                <td>
                  <Link to={`/edit/${item.id}`} className="btn btn-warning btn-sm">
                  📝
                  </Link>
                </td>
                <td>
                  <button
                    onClick={() => handleSetStatusItem(item.id)}
                    className="btn btn-danger btn-sm"
                  >
                    📤
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
};

export default InventoryList;
