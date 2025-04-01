import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredItems.length));

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
              {currentItems.map((item) => (
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
          
         
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button onClick={() => navigate("/home")} className="btn btn-secondary">
              กลับไปยังหน้าหลัก
            </button>

            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                    ก่อนหน้า
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                    ถัดไป
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryList;