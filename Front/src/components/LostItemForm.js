import React, { useState } from "react";
import axios from "axios";

const LostItemForm = () => {
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    date: "",
    description: "",
    picture: "",
    namereport: "",
    locker: "",
    status: "stored",
    identityDoc: "",
    receiver: "",
  });

  const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา", "นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู", "เสื้อ", "หมวก","รองเท้า"];

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newItem = { ...item, date: new Date().toISOString() };
      await axios.post("http://localhost:8080/api/lost-items", newItem);
      alert("เพิ่มของหายเรียบร้อย!");
      setItem({
        name: "",
        category: "",
        place: "",
        date: "",
        description: "",
        picture: "",
        namereport: "",
        locker: "",
        status: "stored",
        identityDoc: "",
        receiver: "",
      });
    } catch (error) {
      console.error("Error adding lost item:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="card-title text-center mb-4">นำของเข้า</h2>
        <form onSubmit={handleSubmit} className="form-group">
          <input
            type="text"
            name="name"
            placeholder="ชื่อสิ่งของ"
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
            className="form-control mb-3"
          />

          <textarea
            name="description"
            placeholder="รายละเอียด"
            value={item.description}
            onChange={handleChange}
            required
            className="form-control mb-3"
          />

          <input
            type="text"
            name="picture"
            placeholder="URL รูปภาพ"
            value={item.picture}
            onChange={handleChange}
            className="form-control mb-3"
          />

          <input
            type="text"
            name="namereport"
            placeholder="ชื่อผู้แจ้ง"
            value={item.namereport}
            onChange={handleChange}
            required
            className="form-control mb-3"
          />

          <input
            type="number"
            name="locker"
            placeholder="เลขล็อคเกอร์ (ถ้ามี)"
            value={item.locker}
            onChange={handleChange}
            className="form-control mb-3"
          />

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            เพิ่มของหาย
          </button>
        </form>
      </div>
    </div>
  );
};

export default LostItemForm;
