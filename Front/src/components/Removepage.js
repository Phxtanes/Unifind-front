import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Removepage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    description: "",
    namereport: "",
    locker: "",
    receiver: "",
    staffName: ""
  });
  const [identityDoc, setIdentityDoc] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    console.log(`เรียก API ด้วย ID: ${id}`);
    axios.get(`http://localhost:8080/api/lost-items/${id}`)
      .then((response) => {
        //console.log("ข้อมูลที่ได้จาก API:", response.data); 
        setItem(response.data);
        fetchImage(id);
      })
      .catch((error) => {
        //console.error("Error fetching item data:", error);
      });
  }, [id]);

  const fetchImage = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/lost-items/${id}/image`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setImageUrl(imageUrl);
      //console.log("Image Loaded:", imageUrl);
    } catch (error) {
      //console.error("Error fetching image:", error);
    }
  }, [id]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setIdentityDoc(e.target.files[0]);
  };

  const handleSetStatusItem = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("receiver", item.receiver);
    formData.append("staffName", item.staffName);
    if (identityDoc) {
      formData.append("identityDoc", identityDoc);
    }

    try {
      await axios.put(`http://localhost:8080/api/lost-items/status/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Item status updated successfully");
      navigate("/inventory");
    } catch (error) {
      //console.error("Error updating item status:", error);
      alert("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="card-title text-center mb-3">แจ้งนำสิ่งของออก</h2>
        <hr />

        <form onSubmit={handleSetStatusItem}>
          <div className="row mb-3">
            <div className="col-md-4 text-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Lost Item"
                  className="img-fluid rounded"
                  style={{ maxHeight: "250px", objectFit: "cover" }}
                />
              ) : (
                <div className="border p-5">ไม่มีรูปภาพ</div>
              )}
            </div>

            <div className="col-md-8">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อสิ่งของ<span className="red-star">*</span></label>
                  <div className="form-control bg-light">{item.name}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ประเภทสิ่งของ<span className="red-star">*</span></label>
                  <div className="form-control bg-light">{item.category}</div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">สถานที่พบ<span className="red-star">*</span></label>
                  <div className="form-control bg-light">{item.place}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อผู้แจ้ง<span className="red-star">*</span></label>
                  <div className="form-control bg-light">{item.namereport}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">รายละเอียด<span className="red-star">*</span></label>
              <div className="form-control bg-light">{item.description}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">เลขล็อคเกอร์ (ถ้ามี)<span className="red-star">*</span></label>
              <div className="form-control bg-light">{item.locker}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">ชื่อผู้มารับของ <span className="red-star">*</span></label>
              <input type="text" name="receiver" required value={item.receiver} onChange={handleChange} className="form-control"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">เอกสารยืนยันตัวตน <span className="red-star">*</span></label>
              <input type="file" name="identityDoc" required onChange={handleFileChange} className="form-control"/>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">ชื่อเจ้าหน้าที่นำของออก <span className="red-star">*</span></label>
              <input type="text" name="staffName" required value={item.staffName} onChange={handleChange} className="form-control"/>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/inventory")}>ยกเลิก</button>
            <button type="submit" className="btn btn-danger">นำของออก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Removepage;
