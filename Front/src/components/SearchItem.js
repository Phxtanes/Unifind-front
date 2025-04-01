import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";


const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchItems = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (location.state && location.state.updated) {
      fetchItems();
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!loading && !error) {
      setTimeout(() => {
        if ($.fn.DataTable.isDataTable('#itemsTable')) {
          $('#itemsTable').DataTable().destroy();
        }
        $('#itemsTable').DataTable({
          columnDefs: [
            { targets: [0, 6, 7], orderable: false }, // ไม่ให้สามารถ sort คอลัมน์ที่ 0 (รูปภาพ), 6 (แก้ไข), 7 (นำออก)
          ],
        });
      }, 500);
    }
  }, [loading, error, items]);
  


  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">หน้ารายการสิ่งของ</h2>


      {loading ? (
        <p className="text-center">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <>
        <div className="d-flex justify-content-between align-items-center mt-3">
            <button onClick={() => navigate("/home")} className="btn btn-secondary">
              กลับไปยังหน้าหลัก
            </button>
          </div>
          <table id="itemsTable" className="table table-bordered text-center">
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
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fs-4">
                    {item.picture ? (
                      <img
                        src={`http://localhost:8080/api/lost-items/${item.id}/image`}
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = "none"}
                      />
                    ) : (
                      "📷"
                    )}
                  </td>
                  <td>{item.category}</td>
                  <td>{item.name}</td>
                  <td>{formatThaiDate(item.date)}</td>
                  <td>{item.locker}</td>
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
          
        </>
      )}

    </div>
  );
};

export default InventoryList;
