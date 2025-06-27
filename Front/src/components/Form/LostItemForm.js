import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { QRCodeCanvas } from "qrcode.react";

const LostItemForm = () => {
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    date: "",
    description: "",
    namereport: "",
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
  const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา","นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู","เสื้อ", "หมวก", "รองเท้า", "อื่นๆ"];

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newItem = { ...item, date: new Date().toISOString() };
      
      // Debug: แสดงข้อมูลที่จะส่งไป Backend
      console.log("=== DEBUG: Data being sent to backend ===");
      console.log(JSON.stringify(newItem, null, 2));
      console.log("=========================================");
      
      const response = await axios.post("http://localhost:8080/api/lost-items", newItem);
      const lostItemId = response.data.id;
      console.log("Lost Item ID:", lostItemId);
      
      // Debug: แสดงข้อมูลที่ Backend ส่งกลับมา
      console.log("=== DEBUG: Response from backend ===");
      console.log(JSON.stringify(response.data, null, 2));
      console.log("===================================");

      const url = `http://localhost:3000/remove/${lostItemId}`;
      setQrUrl(url);
      console.log("QR URL:", url);

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        console.log("Uploading image with formData:", formData);

        await axios.post(`http://localhost:8080/api/lost-items/${lostItemId}/upload-image`,formData,{
        headers: { "Content-Type": "multipart/form-data" },
          });
        alert("เพิ่มของหายและอัปโหลดรูปภาพเรียบร้อย!");
      } else {
        alert("เพิ่มของหายเรียบร้อย (ไม่มีรูปภาพ)");
      }

      // Reset form
      setItem({
        name: "",
        category: "",
        place: "",
        date: "",
        description: "",
        namereport: "",
        locker: "",
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
    } catch (error) {
      console.error("=== ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      console.error("=============");
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="card-title text-center mb-3">แจ้งนำสิ่งของเข้า</h2>
        <hr />
        
        {/* Debug: แสดงข้อมูลปัจจุบันใน State */}
        {/* <div className="alert alert-info" style={{ fontSize: '12px', marginBottom: '20px' }}>
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </div> */}
        
        <form onSubmit={handleSubmit}>
          <div className="row mt-3">
            <div className="col-md-6 mb-3">
              <label className="form-label">ชื่อสิ่งของ <span className="red-star">*</span></label>
              <input type="text" name="name" value={item.name} onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">หมวดหมู่สิ่งของ <span className="red-star">*</span></label>
              <select name="category" value={item.category} onChange={handleChange} required className="form-select">
                <option value="">เลือกประเภท</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">สถานที่พบ <span className="red-star">*</span></label>
              <input type="text" name="place" value={item.place} onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">วันที่พบ <span className="red-star">*</span></label>
              <input type="date" name="date" value={item.date} onChange={handleChange} required className="form-control" />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">รายละเอียด</label>
            <textarea name="description" value={item.description} onChange={handleChange} className="form-control"></textarea>
          </div>

          {/* ส่วนใหม่: ผู้พบสิ่งของ */}
          <div className="card mb-3" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="card-header">
              <h5 className="mb-0">ข้อมูลผู้พบสิ่งของ</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ประเภทผู้พบ <span className="red-star">*</span></label>
                  <select name="finderType" value={item.finderType} onChange={handleChange} required className="form-select">
                    <option value="">เลือกประเภทผู้พบ</option>
                    <option value="student">นักศึกษา</option>
                    <option value="employee">พนักงาน</option>
                    <option value="outsider">บุคคลภายนอก</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">เบอร์โทรศัพท์ <span className="red-star">*</span></label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={item.phoneNumber} 
                    onChange={handleChange} 
                    required 
                    className="form-control"
                    placeholder="เช่น 081-234-5678"
                  />
                </div>
              </div>

              {/* แสดงฟิลด์เพิ่มเติมสำหรับนักศึกษา */}
              {item.finderType === "student" && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">เลขทะเบียนนักศึกษา <span className="red-star">*</span></label>
                    <input 
                      type="text" 
                      name="studentId" 
                      value={item.studentId} 
                      onChange={handleChange} 
                      required 
                      className="form-control"
                      placeholder="เช่น 64010123456"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">อีเมลมหาวิทยาลัย <span className="red-star">*</span></label>
                    <input 
                      type="email" 
                      name="universityEmail" 
                      value={item.universityEmail} 
                      onChange={handleChange} 
                      required 
                      className="form-control"
                      placeholder="เช่น student@university.ac.th"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">รูปภาพ <span className="red-star">*</span></label>
              <input type="file" className="form-control" onChange={handleFileChange} />
              {/* Preview รูป */}
              {imageUrl && (
                <div className="mt-3 text-center">
                  <img src={imageUrl} alt="Preview" className="img-thumbnail" style={{ maxHeight: "200px" }} />
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">ระบุชื่อผู้รับแจ้งทรัพย์สินสูญหาย <span className="red-star">*</span></label>
              <input type="text" name="namereport" value={item.namereport} onChange={handleChange} required className="form-control" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">ตู้เก็บ <span className="red-star">*</span></label>
              <input type="number" name="locker" value={item.locker} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6 mb-3 text-center">
              <label className="form-label">คิวอาร์โค้ด</label>
              <div className="border p-3 rounded bg-light d-flex justify-content-center">
                {qrUrl && (
                  <QRCodeCanvas
                    value={qrUrl}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin
                  />
                )}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => (window.location.href = "/home")}>Cancel</button>
            <button type="submit" className="btn btn-primary save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostItemForm;