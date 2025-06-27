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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocker, setSelectedLocker] = useState("");

  const fetchItems = () => {
    setLoading(true);
    const params = {};

    if (selectedDate) {
      params.date = selectedDate;
    }
    if (selectedLocker) {
      params.locker = selectedLocker;
    }
    axios
      .get("http://localhost:8080/api/lost-items/status/stored", { params })
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
  }, [selectedDate, selectedLocker]);

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
            { targets: [0, 7, 8], orderable: false }, // ไม่ให้สามารถ sort คอลัมน์ที่ 0 (รูปภาพ), 7 (แก้ไข), 8 (นำออก)
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
    return `${day}-${month}-${year}`;
  };

  const getFinderTypeText = (type) => {
    switch(type) {
      case "student": return "นักศึกษา";
      case "employee": return "พนักงาน";
      case "outsider": return "บุคคลภายนอก";
      default: return "ไม่ระบุ";
    }
  };

  return (
    <div className="container-fluid mt-4" style={{borderRadius: '10px',boxShadow: '0 0 5px rgba(0,0,0,0.2)', }}>
      <div className="d-flex justify-content-between align-items-center mt-3">

      </div>

      <div className="container text-center mt-4">
          <h1 className="mb-0 fs-4 px-3 py-1">หน้ารายการสิ่งของ</h1>
          <hr style={{width:'100%'}}></hr>
      </div>

      {loading ? (
        <p className="text-center">กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mt-3"></div>
          <div className="d-flex align-items-center mb-3 justify-content-end">
            <div className="me-3">
              <select
                value={selectedLocker}
                onChange={(e) => setSelectedLocker(e.target.value)}
                className="form-select"
              >
                <option value="">Locker</option>
                <option value="1"> 1</option>
                <option value="2"> 2</option>
                <option value="3"> 3</option>
                <option value="4"> 4</option>
                <option value="5"> 5</option>
                <option value="6"> 6</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="table-responsive">
            
            <table
            
              id="itemsTable"
              className="table table-bordered table-hover table-striped table-sm text-center shadow-sm"
              style={{
                border: '2px solid #dee2e6',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
              }}
            >
              
              <thead className="thead-dark">
                <tr>
                  <th className="text-center p-3">รูปภาพ</th>
                  <th className="text-center p-3">ชื่อสิ่งของ</th>
                  <th className="text-center p-3">ประเภท</th>
                  <th className="text-center p-3">วันที่พบ</th>
                  <th className="text-center p-3">ล็อคเกอร์</th>
                  <th className="text-center p-3">ผู้พบ</th>
                  <th className="text-center p-3">สถานะ</th>
                  <th className="text-center p-3">แก้ไข</th>
                  <th className="text-center p-3">นำออก</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="align-middle">
                    <td className="fs-5 p-2">
                      {item.picture ? (
                        <img
                          src={`http://localhost:8080/api/lost-items/${item.id}/image`}
                          alt={item.name}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                          }}
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      ) : (
                        '📷'
                      )}
                    </td>
                    <td className="text-center p-2">{item.name}</td>
                    <td className="text-center p-2">{item.category}</td>
                    <td className="text-center p-2">{formatThaiDate(item.date)}</td>
                    <td className="text-center p-2">{item.locker}</td>
                    <td className="text-center p-2">
                      <span className="badge bg-info text-dark">
                        {getFinderTypeText(item.finderType)}
                      </span>
                      {item.phoneNumber && (
                        <div className="small text-muted mt-1">
                          📞 {item.phoneNumber}
                        </div>
                      )}
                      {item.finderType === "student" && item.studentId && (
                        <div className="small text-muted">
                          🎓 {item.studentId}
                        </div>
                      )}
                    </td>
                    <td className="text-center p-2">{item.status}</td>
                    <td className="p-2">
                      <Link
                        to={`/edit/${item.id}`}
                        className="btn btn-warning btn-md rounded-pill shadow-sm"
                      >
                        📝
                      </Link>
                    </td>
                    <td className="p-2">
                      <Link
                        to={`/remove/${item.id}`}
                        className="btn btn-danger btn-md rounded-pill shadow-sm"
                      >
                        📤
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default InventoryList;