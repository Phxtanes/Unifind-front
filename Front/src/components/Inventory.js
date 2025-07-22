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
  
  // States สำหรับ Image Popup
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // States สำหรับ Filter
  const [filters, setFilters] = useState({
    date: "",
    locker: "",
    category: "",
    place: "",
    searchTerm: "",
    reporter: ""
  });

  // Categories สำหรับ dropdown
  const categories = [
    "อุปกรณ์อิเล็กทรอนิกส์",
    "กระเป๋า", 
    "เงินสด", 
    "แว่นตา",
    "นาฬิกา", 
    "กุญแจ", 
    "เอกสาร", 
    "แหวน/กำไล/ต่างหู",
    "เสื้อ", 
    "หมวก", 
    "รองเท้า",
    "อื่นๆ"
  ];

  const fetchItems = () => {
    setLoading(true);
    const params = {};

    if (filters.date) {
      params.date = filters.date;
    }
    if (filters.locker) {
      params.locker = filters.locker;
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
  }, [filters.date, filters.locker]);

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

        // เพิ่ม CSS สำหรับ pagination ข้างบน
        const style = document.createElement('style');
        style.textContent = `
          .top-pagination .dataTables_paginate {
            float: right !important;
            margin-top: 0 !important;
          }
          .top-pagination .dataTables_info {
            float: left !important;
            margin-top: 0 !important;
            padding-top: 8px;
          }
          .top-pagination .dataTables_length {
            float: left !important;
            margin-right: 20px !important;
          }
          .top-controls {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 15px !important;
            padding: 10px 0 !important;
          }
          .left-controls {
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
          }
          .right-controls {
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
          }
          
          /* CSS สำหรับ Image Modal */
          .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            padding: 20px;
          }
          
          .image-modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: white;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
          
          .image-modal img {
            width: 100%;
            height: auto;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 4px;
          }
          
          .close-button {
            position: absolute;
            top: -15px;
            right: -15px;
            width: 40px;
            height: 40px;
            background: #ff4757;
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }
          
          .close-button:hover {
            background: #ff3742;
            transform: scale(1.1);
          }
          
          .image-thumbnail {
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          
          .image-thumbnail:hover {
            transform: scale(1.05);
            border-color: #007bff;
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
          }
        `;
        document.head.appendChild(style);

        $('#itemsTable').DataTable({
          columnDefs: [
            { targets: [0, 7, 8], orderable: false },
          ],
          pageLength: 20,
          lengthMenu: [[20, 50, 100, 150, -1], [20, 50, 100, 150, "ทั้งหมด"]],
          language: {
            lengthMenu: "แสดง _MENU_ รายการต่อหน้า",
            zeroRecords: "ไม่พบข้อมูลที่ตรงกับการค้นหา",
            info: "แสดงหน้า _PAGE_ จาก _PAGES_ (รวม _TOTAL_ รายการ)",
            infoEmpty: "ไม่มีข้อมูล",
            infoFiltered: "(กรองจากทั้งหมด _MAX_ รายการ)",
            paginate: {
              first: "หน้าแรก",
              last: "หน้าสุดท้าย",
              next: "ถัดไป",
              previous: "ก่อนหน้า"
            }
          },
          dom: `
            <"top-controls"
              <"left-controls"
                l
                i
              >
              <"right-controls"
                f
                p
              >
            >
            rt
            
          `,
          drawCallback: function() {
            // ปรับแต่ง pagination และข้อมูลแสดงผลเพิ่มเติม
            $('.top-controls').addClass('top-pagination');
          }
        });
      }, 500);
    }
  }, [loading, error, items]); 

  // ฟังก์ชันเปิด Image Modal
  const openImageModal = (imageData) => {
    setSelectedImage(imageData);
    setShowImageModal(true);
    // ป้องกันการ scroll ของ body
    document.body.style.overflow = 'hidden';
  };

  // ฟังก์ชันปิด Image Modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    // คืนค่าการ scroll ของ body
    document.body.style.overflow = 'auto';
  };

  // ฟังก์ชันจัดการ Filter
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // ฟังก์ชันรีเซ็ต Filter
  const resetFilters = () => {
    setFilters({
      date: "",
      locker: "",
      category: "",
      place: "",
      searchTerm: "",
      reporter: ""
    });
  };

  // ฟังก์ชันกรองข้อมูลแบบ Local (สำหรับ category, place, searchTerm)
  const getFilteredItems = () => {
    let filteredItems = [...items];

    // กรองตาม category
    if (filters.category) {
      filteredItems = filteredItems.filter(item => 
        item.category === filters.category
      );
    }

    // กรองตาม place
    if (filters.place) {
      filteredItems = filteredItems.filter(item => 
        item.place && item.place.toLowerCase().includes(filters.place.toLowerCase())
      );
    }

    // กรองตาม searchTerm (ค้นหาในชื่อสิ่งของ)
    if (filters.searchTerm) {
      filteredItems = filteredItems.filter(item => 
        item.name && item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // กรองตาม ผู้รับแจ้ง(เจ้าหน้าที่)
    if (filters.reporter) {
      filteredItems = filteredItems.filter(item => {
        const reporterFields = [
          item.reporter,
          item.reporterName,
          item.finderName,
          item.name 
        ];
        
        return reporterFields.some(field => 
          field && field.toLowerCase().includes(filters.reporter.toLowerCase())
        );
      });
    }

    return filteredItems;
  };

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

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        closeImageModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showImageModal]);

  const formatPhoneNumber = (number) => {
    const cleaned = ('' + number).replace(/\D/g, ''); 
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return number; 
  };

  const filteredItems = getFilteredItems();
  const totalItems = items.length;
  const filteredCount = filteredItems.length;

  return (
    <div className="container-fluid mt-4" style={{borderRadius: '10px', boxShadow: '0 0 5px rgba(0,0,0,0.2)'}}>
      
      {/* Header */}
      <div className="container text-center mt-4">
        <h1 className="mb-0 fs-4 px-3 py-1 pt-4">หน้ารายการสิ่งของ</h1>
        <hr style={{width:'100%'}} />
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeImageModal}>
              ×
            </button>
            <img 
              src={selectedImage.url} 
              alt={selectedImage.name}
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
            <div className="text-center mt-3 p-2">
              <h6 className="mb-1 text-primary">{selectedImage.name}</h6>
              <small className="text-muted">{selectedImage.category}</small>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center mx-3">
          <h5>เกิดข้อผิดพลาด</h5>
          <p className="mb-3">{error}</p>
          <button className="btn btn-danger" onClick={fetchItems}>
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : (
        <>
          {/* Filters Section */}
          <div className="card mx-3 mb-4 border-0 shadow-sm">
            <div className="card-header bg-light py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-primary">
                  <i className="fas fa-filter me-2"></i>ตัวกรองข้อมูล
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary">
                    แสดง {filteredCount} จาก {totalItems} รายการ
                  </span>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={resetFilters}
                    title="รีเซ็ตตัวกรอง"
                  >
                    <i className="fas fa-times"></i> รีเซ็ต
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* ค้นหาชื่อสิ่งของ */}
                <div className="col-lg-2 col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-search me-1"></i>ค้นหาชื่อสิ่งของ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="พิมพ์ชื่อสิ่งของ..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                </div>

                {/* หมวดหมู่ */}
                <div className="col-lg-2 col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-tags me-1"></i>หมวดหมู่
                  </label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">ทุกหมวดหมู่</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* สถานที่พบ */}
                <div className="col-lg-2 col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-map-marker-alt me-1"></i>สถานที่พบ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="พิมพ์สถานที่..."
                    value={filters.place}
                    onChange={(e) => handleFilterChange('place', e.target.value)}
                  />
                </div>

                {/* ผู้รับแจ้ง - เพิ่มใหม่ */}
                <div className="col-lg-2 col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-user-edit me-1"></i>ผู้รับแจ้ง
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ชื่อผู้รับแจ้ง..."
                    value={filters.reporter}
                    onChange={(e) => handleFilterChange('reporter', e.target.value)}
                    disabled
                  />
                </div>

                {/* วันที่ */}
                <div className="col-lg-2 col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-calendar-alt me-1"></i>วันที่พบ
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  />
                </div>

                {/* ล็อคเกอร์ */}
                <div className="col-lg-2 col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-archive me-1"></i>ล็อคเกอร์
                  </label>
                  <select
                    className="form-select"
                    value={filters.locker}
                    onChange={(e) => handleFilterChange('locker', e.target.value)}
                  >
                    <option value="">ทุกล็อคเกอร์</option>
                    <option value="1">ล็อคเกอร์ 1</option>
                    <option value="2">ล็อคเกอร์ 2</option>
                    <option value="3">ล็อคเกอร์ 3</option>
                    <option value="4">ล็อคเกอร์ 4</option>
                    <option value="5">ล็อคเกอร์ 5</option>
                    <option value="6">ล็อคเกอร์ 6</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="mx-3 mb-4">
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
                <thead className="table-primary">
                  <tr>
                    <th className="text-center p-3" style={{width: '120px'}}>
                      <i className="fas fa-image me-1"></i>รูปภาพ
                    </th>
                    <th className="text-center p-3">
                      <i className="fas fa-box me-1"></i>ชื่อสิ่งของ
                    </th>
                    <th className="text-center p-3">
                      <i className="fas fa-tags me-1"></i>ประเภท
                    </th>
                    <th className="text-center p-3">
                      <i className="fas fa-calendar me-1"></i>วันที่พบ
                    </th>
                    <th className="text-center p-3">
                      <i className="fas fa-archive me-1"></i>ล็อคเกอร์
                    </th>
                    <th className="text-center p-3">
                      <i className="fas fa-user me-1"></i>ผู้พบ
                    </th>
                    <th className="text-center p-3">
                      <i className="fas fa-info-circle me-1"></i>สถานะ
                    </th>
                    <th className="text-center p-3" style={{width: '80px'}}>
                      <i className="fas fa-edit me-1"></i>แก้ไข
                    </th>
                    <th className="text-center p-3" style={{width: '80px'}}>
                      <i className="fas fa-sign-out-alt me-1"></i>นำออก
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="p-2">
                        {item.picture ? (
                          <img
                            src={`http://localhost:8080/api/lost-items/${item.id}/image`}
                            alt={item.name}
                            className="rounded shadow-sm image-thumbnail"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onClick={() => openImageModal({
                              url: `http://localhost:8080/api/lost-items/${item.id}/image`,
                              name: item.name,
                              category: item.category
                            })}
                          />
                        ) : null}
                        {/* <div 
                          className="d-flex align-items-center justify-content-center bg-light rounded"
                          style={{
                            width: '80px',
                            height: '80px',
                            display: item.picture ? 'none' : 'flex'
                          }}
                        >
                          <i className="fas fa-image text-muted fa-2x"></i>
                        </div> */}
                      </td>
                      <td className="text-center p-2 fw-semibold">{item.name}</td>
                      <td className="text-center p-2">
                        <span className="badge bg-info text-dark">
                          {item.category}
                        </span>
                      </td>
                      <td className="text-center p-2">{formatThaiDate(item.date)}</td>
                      <td className="text-center p-2">
                        <span className="badge bg-secondary">
                          <i className="fas fa-archive me-1"></i>
                          {item.locker || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span className="badge bg-primary">
                            {getFinderTypeText(item.finderType)}
                          </span>
                          {item.phoneNumber && (
                            <small className="text-muted">
                              <i className="fas fa-phone me-1"></i>
                              Tel: {formatPhoneNumber(item.phoneNumber)}
                            </small>
                          )}
                          {item.finderType === "student" && item.studentId && (
                            <small className="text-muted">
                              <i className="fas fa-graduation-cap me-1"></i>
                              Utcc ID: {item.studentId}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <Link
                          to={`/edit/${item.id}`}
                          className="btn btn-warning btn-sm rounded-pill shadow-sm"
                          title="แก้ไขข้อมูล"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                      </td>
                      <td className="p-2">
                        <Link
                          to={`/remove/${item.id}`}
                          className="btn btn-danger btn-sm rounded-pill shadow-sm"
                          title="นำสิ่งของออก"
                        >
                          <i className="fas fa-sign-out-alt"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* แสดงข้อความเมื่อไม่มีข้อมูล */}
              {filteredItems.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</h5>
                  <p className="text-muted">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={resetFilters}
                  >
                    <i className="fas fa-times me-2"></i>ล้างตัวกรอง
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="mx-3 mb-4">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body py-3">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-box text-primary me-2"></i>
                      <span className="fw-bold">ทั้งหมด: </span>
                      <span className="ms-1 text-primary fw-bold">{totalItems}</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-filter text-success me-2"></i>
                      <span className="fw-bold">กรองแล้ว: </span>
                      <span className="ms-1 text-success fw-bold">{filteredCount}</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-archive text-info me-2"></i>
                      <span className="fw-bold">ล็อคเกอร์ที่ใช้: </span>
                      <span className="ms-1 text-info fw-bold">
                        {[...new Set(items.filter(item => item.locker).map(item => item.locker))].length}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-tags text-warning me-2"></i>
                      <span className="fw-bold">หมวดหมู่: </span>
                      <span className="ms-1 text-warning fw-bold">
                        {[...new Set(items.map(item => item.category))].length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryList;