import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
/* import QRCode from "qrcode.react"; */

const EditItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    date: "",
    description: "",
    locker: "",
    status: "",
    picture: "",
    namereport: "",
    qrCode: "", 
  });

  const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา", "นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู", "เสื้อ", "หมวก", "รองเท้า"];

  useEffect(() => {
    axios.get(`http://localhost:8080/api/lost-items/${id}`)
      .then(response => {
        setItem(response.data);
      })
      .catch(error => console.error("Error fetching item data:", error));
  }, [id]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/api/lost-items/edit/${id}`, item)
      .then(() => {
        alert("อัปเดตข้อมูลสำเร็จ!");
        navigate("/inventory");
      })
      .catch(error => {
        console.error("Error updating item:", error);
        alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตข้อมูลได้");
      });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="text-center mb-3">แก้ไขข้อมูลของหาย - <span className="red-star">กำลังแก้ไข</span></h2>
        <hr></hr>
        <div className="row mt-4">
          <div className="col-md-4 text-center">
            {item.picture ? (
              <img src={item.picture} alt="Lost Item" className="img-fluid rounded" />
            ) : (
              <div className="border p-5" >ไม่มีรูปภาพ</div>
            )}
             <div className="col-md-12 mb-3 mt-3 text-left">
              <label className="form-label ">รายละเอียด <span className="text-danger">*</span></label>
              <textarea
                name="name"
                value={item.description}
                onChange={handleChange}
                required
                className="form-control"
                style={{ resize: 'none' }} 
              />
            </div>
          </div>
          
          <div className="col-md-8">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อสิ่งของ <span className="red-star">*</span></label>
                  <input type="text" name="name" value={item.name} onChange={handleChange} required className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ประเภท <span className="red-star">*</span></label>
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
                  <label className="form-label">วันที่พบ <span className="red-star">*</span></label>
                  <input type="date" name="date" value={item.date} onChange={handleChange} required className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ตู้เก็บ</label>
                  <input type="number" name="locker" value={item.locker} onChange={handleChange} className="form-control" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ระบุชื่อผู้แจ้งทรัพย์สินสูญหาย <span className="red-star">*</span></label>
                  <input type="text" name="namereport" value={item.namereport} onChange={handleChange} required className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">สถานะ <span className="red-star">*</span></label>
                  <input type="text" name="namereport" value={item.status} onChange={handleChange} required className="form-control" />
                </div>
              </div>


              {/* ส่วน QR Code */}
              <div className="text-center mb-3">
                {/* <QRCode value={item.qrCode || "N/A"} size={120} /> */}
                {/* <p className="mt-2">{item.qrCode}</p> */}
              </div>
              
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/inventory")}>Cancel</button>
                <button type="submit" className="btn btn-warning">Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditItemForm;