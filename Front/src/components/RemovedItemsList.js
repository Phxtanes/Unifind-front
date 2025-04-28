import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

const RemovedItemsList = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchItems = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/lost-items/status/removed")
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
        if ($.fn.DataTable.isDataTable("#itemsTable")) {
          $("#itemsTable").DataTable().destroy();
        }
        $("#itemsTable").DataTable({
          columnDefs: [
            { targets: [0], orderable: false },
          ],
        });
      }, 500);
    }
  }, [loading, error, items]);

  const handleCheckboxChange = (id) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((itemId) => itemId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert("กรุณาเลือกสิ่งของที่ต้องการลบออกจากถังขยะ");
      return;
    }
  
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสิ่งของที่เลือก?")) {
      Promise.all(
        selectedItems.map((id) =>
          axios.put(`http://localhost:8080/api/lost-items/status/deleted/${id}`, {},
            { headers: { "Content-Type": "application/json" } }
          )
        )
      )
      .then(() => {
        setItems((prevItems) =>
          prevItems.filter((item) => !selectedItems.includes(item.id))
        );
        setSelectedItems([]);
        alert("ลบออกจากถังขยะสำเร็จแล้ว");
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการลบ:", err);
        alert("เกิดข้อผิดพลาด ไม่สามารถลบได้");
      });
    }
  };  
  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container-fluid mt-4">
      <div className="container mb-4 text-center">
        <div
          className="shadow rounded d-inline-block px-4 py-2"
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "50px",
            backgroundColor: "#FF5858",
          }}
        >
          <h1 className="mb-0 fs-4 px-3 py-1">รายการสิ่งของที่ถูกนำออก</h1>
        </div>
      </div>

      {loading ? (
        <p className="text-center">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <div className="table-responsive">
          <table
            id="itemsTable"
            className="table table-bordered table-hover table-striped table-sm text-center shadow-sm"
            style={{
              border: "2px solid #dee2e6",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            }}
          >
            <thead className="thead-dark">
              <tr>
                <th className="text-center p-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="text-center p-3">รูปภาพ</th>
                <th className="text-center p-3">ชื่อสิ่งของ</th>
                <th className="text-center p-3">ประเภท</th>
                <th className="text-center p-3">วันที่พบ</th>
                <th className="text-center p-3">ล็อคเกอร์</th>
                <th className="text-center p-3">สถานะ</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                    />
                  </td>
                  <td className="fs-5 p-2">
                    {item.picture ? (
                      <img
                        src={`http://localhost:8080/api/lost-items/${item.id}/image`}
                        alt={item.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      "📷"
                    )}
                  </td>
                  <td className="text-center p-2">{item.name}</td>
                  <td className="text-center p-2">{item.category}</td>
                  <td className="text-center p-2">{formatThaiDate(item.date)}</td>
                  <td className="text-center p-2">{item.locker}</td>
                  <td className="text-center p-2" style={{ color: "#FF0000" }}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex align-items-center mt-3 ml-3">
            <button onClick={handleDeleteSelected} className="btn btn-danger">
              ลบออกจากถังขยะ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemovedItemsList;
