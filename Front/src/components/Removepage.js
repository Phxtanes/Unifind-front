import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Removepage = () => {
    const { id } = useParams(); // ดึง ID ของ item จาก URL
    const navigate = useNavigate();
    const [item, setItem] = useState({
        name: "",
        category: "",
        place: "",
        description: "",
        picture: "",
        namereport: "",
        locker: "",
        identityDoc: "",
        receiver: "",
        staffName: ""
    });

    useEffect(() => {
        console.log(`เรียก API ด้วย ID: ${id}`);
        axios
            .get(`http://localhost:8080/api/lost-items/${id}`)
            .then((response) => {
                console.log("ข้อมูลที่ได้จาก API:", response.data);
                setItem(response.data);
            })
            .catch((error) => {
                console.error("Error fetching item data:", error);
            });
    }, [id]);


    const handleChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    const handleSetStatusItem = (e) => {
        e.preventDefault(); // หยุดการรีเฟรชหน้าเว็บ
        axios.put(`http://localhost:8080/api/lost-items/status/${id}`, {
            identityDoc: item.identityDoc,
            receiver: item.receiver,
            staffName: item.staffName
        })
            .then((response) => {
                alert("Item status updated successfully");
                navigate("/inventory");
            })
            .catch((error) => {
                console.error("Error updating item status:", error);
                alert("ไม่สามารถเปลี่ยนสถานะได้");
            });
    };




    return (
        <div className="container mt-4">
          <div className="card shadow p-4">
            <h2 className="card-title text-center mb-3">แจ้งนำสิ่งของออก</h2>
            <hr />
            <form onSubmit={handleSetStatusItem}>
              <div className="row mt-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อสิ่งของ<span className="red-star">*</span></label>
                  <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                    {item.name}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ประเภทสิ่งของ<span className="red-star">*</span></label>
                  <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                    {item.category}
                  </div>
                </div>
              </div>
    
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">สถานที่พบ<span className="red-star">*</span></label>
                  <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                    {item.place}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">รายละเอียด<span className="red-star">*</span></label>
                  <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                    {item.description}
                  </div>
                </div>
              </div>
    
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อผู้แจ้ง<span className="red-star">*</span></label>
                  <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                    {item.namereport}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">เลขล็อคเกอร์ (ถ้ามี)<span className="red-star">*</span></label>
                  <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                    {item.locker}
                  </div>
                </div>
              </div>
    
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อผู้มารับของ <span className="red-star">*</span></label>
                  <input
                    type="text"
                    name="receiver"
                    required
                    value={item.receiver}
                    onChange={handleChange}  // แก้ไขได้
                    className="form-control"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">เอกสารยืนยันตัวตน <span className="red-star">*</span></label>
                  <input
                    type="file"
                    name="identityDoc"
                    value={item.identityDoc}
                    onChange={handleChange}  // แก้ไขได้
                    className="form-control"
                  />
                </div>
              </div>
    
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อเจ้าหน้าที่นำของออก <span className="red-star">*</span></label>
                  <input
                    type="text"
                    name="staffName"
                    required
                    value={item.staffName}
                    onChange={handleChange} // แก้ไขได้
                    className="form-control"
                  />
                </div>
              </div>
    
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>ยกเลิก</button>
                <button type="submit" className="btn btn-danger">นำของออก</button>
              </div>
            </form>
          </div>
        </div>
      );
};




export default Removepage;