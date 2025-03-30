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
        date: "",
        description: "",
        locker: "",
        status: "",
        picture: "",
        namereport: "",
        identityDoc:"",
        receiver:"",
        staffName:""
    });
    const [items, setItems] = useState([]);


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

    const handleSetStatusItem = (id) => {
        axios
            .put(`http://localhost:8080/api/lost-items/status/${id}`)
            .then((response) => {
                alert("Item status updated to 'Removed' successfully", response);

                setItems(items.map((item) =>
                    item.id === id ? { ...item, status: "removed" } : item
                ));
            })
            .catch((error) => {
                console.error("Error updating item status:", error);
                alert("ไม่สามารถเปลี่ยนสถานะได้");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .put(`http://localhost:8080/api/lost-items/edit/${id}`, item)
            .then(() => {
                alert("อัปเดตข้อมูลสำเร็จ!");
                navigate("/inventory");
            })
            .catch((error) => {
                console.error("Error updating item:", error);
                alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตข้อมูลได้");
            });
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="card-title text-center mb-4">นำออก</h2>
                <form onSubmit={handleSubmit} className="form-group">
                    <input
                        type="text"
                        name="name"
                        disabled
                        placeholder="ชื่อของหาย"
                        value={item.name}
                        onChange={handleChange}
                        required
                        className="form-control mb-3"
                    />

                    <select
                        name="category"
                        value={item.category}
                        onChange={handleChange}
                        required
                        disabled
                        className="form-control mb-3"
                    >
                        <option value="">เลือกประเภท</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="place"
                        placeholder="สถานที่พบ"
                        value={item.place}
                        onChange={handleChange}
                        required
                        disabled
                        className="form-control mb-3"
                    />

                    <textarea
                        name="description"
                        placeholder="รายละเอียด"
                        value={item.description}
                        onChange={handleChange}
                        required
                        disabled
                        className="form-control mb-3"
                    />

                    <input
                        type="text"
                        name="picture"
                        placeholder="URL รูปภาพ"
                        value={item.picture}
                        onChange={handleChange}
                        disabled
                        className="form-control mb-3"
                    />

                    <input
                        type="text"
                        name="namereport"
                        placeholder="ชื่อผู้แจ้ง"
                        value={item.namereport}
                        onChange={handleChange}
                        required
                        disabled
                        className="form-control mb-3"
                    />

                    <input
                        type="number"
                        name="locker"
                        placeholder="เลขล็อคเกอร์ (ถ้ามี)"
                        value={item.locker}
                        onChange={handleChange}
                        disabled
                        className="form-control mb-3"
                    />

                    <input
                        type="text"
                        name="ผู้มารับของ"
                        placeholder="ชื่อผู้มารับของ"
                        onChange={handleChange}
                        className="form-control mb-3"
                    />

                    <input
                        type="text"
                        name="เอกสารยืนยันตัวตน"
                        placeholder="เอกสารยืนยันตัวตน (ถ้ามี)"
                        onChange={handleChange}
                        className="form-control mb-3"
                    />

                    <input
                        type="text"
                        name="ชื่อเจ้าหน้าที่นำของออก"
                        placeholder="ชื่อเจ้าหน้าที่นำของออก"

                        onChange={handleChange}
                        className="form-control mb-3"
                    />

                    <button type="submit" className="btn btn-danger w-100 " onClick={() => handleSetStatusItem(item.id)}>
                        นำของออก
                    </button>
                </form>
            </div>
        </div>
    );
};




export default Removepage;