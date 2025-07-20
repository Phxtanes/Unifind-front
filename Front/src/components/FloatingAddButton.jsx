import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../AuthContext"; // เพิ่ม import useAuth

const FloatingAddButton = () => {
  const { currentUser } = useAuth(); // ใช้ currentUser จาก AuthContext
  
  const [showModal, setShowModal] = useState(false);
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    date: "",
    description: "",
    namereport: "", // จะถูกตั้งค่าจาก currentUser.username
    locker: "",
    status: "stored",
    identityDoc: "",
    receiver: "",
    staffName: "",
    // เพิ่มฟิลด์ใหม่
    finderType: "",
    studentId: "",
    universityEmail: "",
    phoneNumber: ""
  });

  const [qrUrl, setQrUrl] = useState("");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const categories = [
    "อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา",
    "นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู",
    "เสื้อ", "หมวก", "รองเท้า", "อื่นๆ"
  ];

  // ตั้งค่า namereport จาก currentUser และ locker ตามเดือนปัจจุบัน
  useEffect(() => {
    if (currentUser?.username) {
      const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
      setItem(prevItem => ({
        ...prevItem,
        namereport: currentUser.username,
        locker: currentMonth.toString() // ตั้งค่าตู้เก็บตามเดือนปัจจุบัน
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Debug log
    setItem({ ...item, [name]: value });
    
    // ถ้าเปลี่ยนประเภทผู้พบ ให้รีเซ็ตฟิลด์ที่เกี่ยวข้อง
    if (name === "finderType") {
      setItem(prev => ({
        ...prev,
        [name]: value,
        studentId: "",
        universityEmail: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setImageUrl(previewUrl);
    }
  };

  // ฟังก์ชันตรวจสอบความครบถ้วนของข้อมูล
  const validateForm = () => {
    const errors = [];

    // ตรวจสอบฟิลด์พื้นฐาน
    if (!item.name.trim()) errors.push("ชื่อสิ่งของ");
    if (!item.category) errors.push("หมวดหมู่สิ่งของ");
    if (!item.place.trim()) errors.push("สถานที่พบ");
    if (!item.date) errors.push("วันที่พบ");
    if (!item.finderType) errors.push("ประเภทผู้พบ");
    if (!item.phoneNumber.trim()) errors.push("เบอร์โทรศัพท์");
    if (!file) errors.push("รูปภาพ");

    // ตรวจสอบฟิลด์เพิ่มเติมสำหรับนักศึกษา
    if (item.finderType === "student") {
      if (!item.studentId.trim()) errors.push("เลขทะเบียนนักศึกษา");
      if (!item.universityEmail.trim()) errors.push("อีเมลมหาวิทยาลัย");
    }

    return errors;
  };

  const resetForm = () => {
    const currentMonth = new Date().getMonth() + 1;
    setItem({
      name: "",
      category: "",
      place: "",
      date: "",
      description: "",
      namereport: currentUser?.username || "", // คง username ไว้
      locker: currentMonth.toString(), // คงค่าตู้เก็บตามเดือนปัจจุบัน
      status: "stored",
      identityDoc: "",
      receiver: "",
      staffName: "",
      finderType: "",
      studentId: "",
      universityEmail: "",
      phoneNumber: ""
    });
    setFile(null);
    setImageUrl("");
    setQrUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ตรวจสอบความครบถ้วนของข้อมูล
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(`กรุณากรอกข้อมูลให้ครบถ้วน:\n- ${validationErrors.join('\n- ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // เตรียมข้อมูลส่ง API
      const newItem = { ...item, date: new Date().toISOString() };
      
      // Debug: แสดงข้อมูลที่จะส่งไป Backend
      console.log("=== DEBUG: Data being sent to backend ===");
      console.log(JSON.stringify(newItem, null, 2));
      console.log("=========================================");
      
      // เรียก API จริงเพื่อสร้าง Lost Item
      const response = await fetch("http://localhost:8080/api/lost-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdItem = await response.json();
      console.log("Lost Item created successfully:", createdItem);
      
      // สร้าง QR URL ด้วย ID จริงที่ได้จาก API
      const url = `http://localhost:3000/remove/${createdItem.id}`;
      setQrUrl(url);
      console.log("QR URL:", url);

      // อัปโหลดรูปภาพถ้ามี
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(`http://localhost:8080/api/lost-items/${createdItem.id}/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          console.log("Image upload successful");
          alert("เพิ่มของหายและอัปโหลดรูปภาพเรียบร้อย!");
        } else {
          console.error("Image upload failed");
          alert("เพิ่มของหายเรียบร้อย แต่อัปโหลดรูปภาพล้มเหลว");
        }
      } else {
        alert("เพิ่มของหายเรียบร้อย (ไม่มีรูปภาพ)");
      }

      resetForm();
      setShowModal(false);
      
      // รีเฟรชหน้าเพื่อแสดงข้อมูลใหม่
      window.location.reload();
    } catch (error) {
      console.error("=== ERROR ===");
      console.error("Error:", error);
      console.error("=============");
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    // ตั้งวันที่เป็นวันปัจจุบัน
    const today = new Date().toISOString().split('T')[0];
    setItem(prev => ({ ...prev, date: today }));
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <>
      {hovered && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            backgroundColor: '#2F318B',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1001,
          }}
        >
          เพิ่มสิ่งของ 
        </div>
      )}

      <button
        onClick={openModal}
        className="btn btn-primary rounded-circle shadow-lg position-fixed"
        style={{
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          zIndex: 1000,
          border: 'none',
          background: 'linear-gradient(135deg, #2F318B 0%, #4F69C6 100%)',
          boxShadow: hovered
            ? '0 6px 25px rgba(47, 49, 139, 0.6)'
            : '0 4px 20px rgba(47, 49, 139, 0.4)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="เพิ่มสิ่งของใหม่"
      >
        <i
          className="fas fa-plus"
          style={{
            transform: 'none',
            pointerEvents: 'none',
            color: '#fff',
          }}
        ></i>
      </button>

      {/* Left button back */}
        {/* <button
          onClick={() => window.history.back()}
          className="btn btn-danger rounded-circle shadow-lg position-fixed"
          style={{
            bottom: '30px',
            left: '30px',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            zIndex: 1000,
            border: 'none',
            background: 'linear-gradient(135deg, #dc3545 0%, #e66c6c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          title="ย้อนกลับ"
          >
          <i className="fas fa-arrow-left" style={{ color: '#fff' }}></i>
        </button> */}

      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: '20px' }}
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-scrollable"
            style={{ maxHeight: 'calc(100vh - 40px)' }}
            onClick={(e) => e.stopPropagation()}
          >rgb(162 175 223)
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2F318B 0%, #A2AFDF 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-plus-circle me-2"></i>
                  
                  แจ้งนำสิ่งของเข้า
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeModal}
                ></button>
              </div>
              
              <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit}>
                  
                  {/* ข้อมูลสิ่งของ */}
                  <div className="mb-4">
                    <h6 className="text-primary mb-3 pb-2 border-bottom">
                      <i className="fas fa-box me-2"></i>ข้อมูลสิ่งของ
                    </h6>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          ชื่อสิ่งของ <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="name" 
                          value={item.name} 
                          onChange={handleChange} 
                          required 
                          className="form-control"
                          placeholder="ระบุชื่อสิ่งของ"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">
                          หมวดหมู่สิ่งของ <span className="text-danger">*</span>
                        </label>
                        <select 
                          name="category" 
                          value={item.category} 
                          onChange={handleChange} 
                          required 
                          className="form-select"
                        >
                          <option value="">เลือกประเภท</option>
                          {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-md-6">
                        <label className="form-label">
                          สถานที่พบ <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="place" 
                          value={item.place} 
                          onChange={handleChange} 
                          required 
                          className="form-control"
                          placeholder="ระบุสถานที่พบ"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">
                          วันที่พบ <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="date" 
                          name="date" 
                          value={item.date} 
                          onChange={handleChange} 
                          required 
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label">รายละเอียด</label>
                      <textarea 
                        name="description" 
                        value={item.description} 
                        onChange={handleChange} 
                        rows="3"
                        className="form-control"
                        placeholder="ระบุรายละเอียดเพิ่มเติม"
                      />
                    </div>
                  </div>

                  {/* ข้อมูลผู้พบ */}
                  <div className="mb-4">
                    <h6 className="text-primary mb-3 pb-2 border-bottom">
                      <i className="fas fa-user me-2"></i>ข้อมูลผู้พบสิ่งของ
                    </h6>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          ประเภทผู้พบ <span className="text-danger">*</span>
                        </label>
                        <select 
                          name="finderType" 
                          value={item.finderType} 
                          onChange={handleChange} 
                          required 
                          className="form-select"
                        >
                          <option value="">เลือกประเภทผู้พบ</option>
                          <option value="student">นักศึกษา</option>
                          <option value="employee">พนักงาน</option>
                          <option value="outsider">บุคคลภายนอก</option>
                        </select>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">
                          เบอร์โทรศัพท์ <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="tel" 
                          name="phoneNumber" 
                          value={item.phoneNumber} 
                          onChange={handleChange} 
                          required 
                          placeholder="เช่น 081-234-5678"
                          className="form-control"
                          maxLength={10}
                          pattern="^0[0-9]{2}-[0-9]{3}-[0-9]{4}$" 
                        />
                      </div>
                    </div>

                    {/* ฟิลด์เพิ่มเติมสำหรับนักศึกษา */}
                    {item.finderType === "student" && (
                      <div 
                        className="row g-3 mt-3 p-3 rounded"
                        style={{ backgroundColor: '#f8f9fc', border: '1px solid #e3e6f0' }}
                      >
                        <div className="col-12">
                          <small className="text-muted fw-bold">
                            <i className="fas fa-graduation-cap me-1"></i>
                            ข้อมูลเพิ่มเติมสำหรับนักศึกษา
                          </small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            เลขทะเบียนนักศึกษา <span className="text-danger">*</span>
                          </label>
                          <input 
                            type="text" 
                            name="studentId" 
                            value={item.studentId} 
                            onChange={handleChange} 
                            required 
                            placeholder="เช่น 64010123456"
                            className="form-control"
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">
                            อีเมลมหาวิทยาลัย <span className="text-danger">*</span>
                          </label>
                          <input 
                            type="email" 
                            name="universityEmail" 
                            value={item.universityEmail} 
                            onChange={handleChange} 
                            required 
                            placeholder="เช่น student@university.ac.th"
                            className="form-control"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="mb-4">
                    <h6 className="text-primary mb-3 pb-2 border-bottom">
                      <i className="fas fa-cog me-2"></i>ข้อมูลเพิ่มเติม
                    </h6>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          รูปภาพ <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          required
                          accept="image/*"
                          className="form-control"
                        />
                        {imageUrl && (
                          <div className="mt-3 text-center">
                            <img 
                              src={imageUrl} 
                              alt="Preview" 
                              className="img-thumbnail"
                              style={{ maxHeight: '160px' }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">
                          ผู้รับแจ้งทรัพย์สินสูญหาย
                        </label>
                        <div 
                          className="form-control bg-light d-flex align-items-center"
                          style={{ color: '#495057' }}
                        >
                          <i className="fas fa-user me-2 text-muted"></i>
                          {currentUser?.username || 'ไม่ระบุ'}
                          <small className="ms-2 text-muted">
                            ({currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'})
                          </small>
                        </div>
                        <small className="text-muted mt-1 d-block">
                          *ระบบจะบันทึกชื่อผู้ใช้ที่ล็อกอินอยู่โดยอัตโนมัติ
                        </small>
                      </div>
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-md-6">
                        <label className="form-label">ตู้เก็บ</label>
                        <div 
                          className="form-control bg-light d-flex align-items-center"
                          style={{ color: '#495057' }}
                        >
                          <i className="fas fa-archive me-2 text-muted"></i>
                          ตู้เก็บหมายเลข {item.locker}
                          <small className="ms-2 text-muted">
                            (เดือน {new Date().toLocaleDateString('th-TH', { month: 'long' })})
                          </small>
                        </div>
                        <small className="text-muted mt-1 d-block">
                          *ระบบจะกำหนดตู้เก็บตามเดือนปัจจุบันโดยอัตโนมัติ
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">คิวอาร์โค้ด</label>
                        <div 
                          className="border rounded p-3 bg-light text-center"
                          style={{ minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {qrUrl ? (
                            <QRCodeCanvas
                              value={qrUrl}
                              size={120}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="H"
                              includeMargin
                            />
                          ) : (
                            <div className="text-muted">
                              <i className="fas fa-qrcode fa-3x mb-2"></i>
                              <br />
                              <small>QR Code จะปรากฏหลังจากบันทึกข้อมูล</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer bg-light">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                 ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                     บันทึกข้อมูล
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAddButton;