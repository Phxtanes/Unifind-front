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


    const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา", "นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู", "เสื้อ", "หมวก", "รองเท้า"];

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
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="card-title text-center mb-4">นำออก</h2>
                <form className="form-group" onSubmit={handleSetStatusItem}>
                    <div className="form-group mb-3">
                        <label>ชื่อของหาย</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.name}
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>ประเภท</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.category}
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>สถานที่พบ</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.place}
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>รายละเอียด</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.description}

                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>URL รูปภาพ</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.picture}

                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>ชื่อผู้แจ้ง</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.namereport}
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>เลขล็อคเกอร์ (ถ้ามี)</label>
                        <div className="form-control" style={{ backgroundColor: '#dcdcdc' }}>
                            {item.locker}

                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label>ชื่อผู้มารับของ</label>
                        <input
                            type="text"
                            name="receiver"
                            required
                            value={item.receiver}
                            onChange={handleChange} // ให้สามารถแก้ไขได้
                            className="form-control"
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label>เอกสารยืนยันตัวตน (ถ้ามี)</label>
                        <input
                            type="text"
                            name="identityDoc"
                            value={item.identityDoc}
                            onChange={handleChange} // ให้สามารถแก้ไขได้
                            className="form-control"
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label>ชื่อเจ้าหน้าที่นำของออก</label>
                        <input
                            type="text"
                            name="staffName"
                            required
                            value={item.staffName}
                            onChange={handleChange} // ให้สามารถแก้ไขได้
                            className="form-control"
                        />
                    </div>

                    <button type="submit" className="btn btn-danger w-100">
                        นำของออก
                    </button>
                </form>
            </div>
        </div>

    );
};




export default Removepage;