import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

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

  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
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
        <>
          <table className="table table-bordered text-center">
            <thead className="thead-dark">
              <tr>
                <th>รูปภาพ</th>
                <th>ประเภท</th>
                <th>ชื่อสิ่งของ</th>
                <th>วันที่พบ</th>
                <th>ล็อคเกอร์</th>
                <th>สถานะ</th>
                <th>แก้ไข</th>
                <th>นำออก</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="fs-4">
                    {/* เช็คว่า รูปภาพมีค่าไหม */}
                    {item.picture ? (
                      <img src={item.picture} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    ) : (
                      "📷"  // ถ้าไม่มีภาพให้แสดงเป็นไอคอน 📷
                    )}
                  </td>
                  <td>{item.category}</td>
                  <td>{item.name}</td>
                  <td>{formatThaiDate(item.date)}</td>
                  <td>{item.locker}</td>
                  {/* ต้องเพิ่มคนรับด้วย ก็คือคนที่ล้อคอินและรับของเข้า */}
                  <td>{item.status}</td>
                  <td>
                    <Link to={`/edit/${item.id}`} className="btn btn-warning btn-sm">
                      📝
                    </Link>
                  </td>
                  <td>
                    <Link to={`/remove/${item.id}`} className="btn btn-danger btn-sm">
                      📤
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-end mt-3">
            <button onClick={() => navigate("/home")} className="btn btn-secondary">
              ย้อนกลับ
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryList;
