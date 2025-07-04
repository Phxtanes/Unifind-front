import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext"; // เพิ่ม import สำหรับ auth
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

// สร้าง state เก็บข้อมูลของ
const EditItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // ดึงข้อมูล user ที่ login อยู่
  
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    date: "",
    description: "",
    locker: "",
    status: "",
    namereport: "",
    // เพิ่มฟิลด์ใหม่
    finderType: "",
    studentId: "",
    universityEmail: "",
    phoneNumber: ""
  });
  const [qrUrl, setQrUrl] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา", "นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู", "เสื้อ", "หมวก", "รองเท้า", "อื่นๆ"];

  const fetchImage = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/lost-items/${id}/image`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  }, [id]);

  useEffect(() => {
    // ดึงข้อมูลจาก API
    axios.get(`http://localhost:8080/api/lost-items/${id}`)
      .then(response => {
        const data = response.data;
        const formattedDate = data.date ? data.date.split("T")[0] : "";
        setItem({ 
          ...data, 
          date: formattedDate,
          // ตั้งค่าเริ่มต้นสำหรับฟิลด์ใหม่ถ้าไม่มีข้อมูล
          finderType: data.finderType || "",
          studentId: data.studentId || "",
          universityEmail: data.universityEmail || "",
          phoneNumber: data.phoneNumber || ""
        });
        setQrUrl(`http://localhost:3000/remove/${id}`);
        fetchImage();
      })
      .catch(error => console.error("Error fetching item data:", error));
  }, [id, fetchImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
    
    // ถ้าเปลี่ยนประเภทผู้พบ ให้รีเซ็ตฟิลด์ที่เกี่ยวข้อง
    if (name === "finderType") {
      setItem(prev => ({
        ...prev,
        [name]: value,
        studentId: value === "student" ? prev.studentId : "",
        universityEmail: value === "student" ? prev.universityEmail : ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedItem = { ...item };

    if (updatedItem.date) {
      updatedItem.date = new Date(updatedItem.date).toISOString().split(".")[0];
    }

    Object.keys(updatedItem).forEach(key => {
      if (updatedItem[key] === "" || updatedItem[key] === null) {
        delete updatedItem[key];
      }
    });

    console.log("Data Sent to Server:", updatedItem);
    try {
      await axios.put(`http://localhost:8080/api/lost-items/edit/${id}`, updatedItem, {
        headers: { "Content-Type": "application/json" },
      });
      alert("อัปเดตข้อมูลสำเร็จ!");
      navigate("/inventory");
    } catch (error) {
      console.error("Error updating item:", error.response ? error.response.data : error);
      alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '40px 20px'
      }}>
        
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: '#1a1a1a',
            margin: '0 0 8px 0'
          }}>
            แก้ไขข้อมูลของหาย
          </h1>
          <div style={{ 
            width: '60px', 
            height: '2px', 
            backgroundColor: '#ff9800', 
            margin: '0 auto'
          }}></div>
          <p style={{
            marginTop: '12px',
            color: '#666',
            fontSize: '16px'
          }}>
            แก้ไขโดย: <span style={{ fontWeight: '600', color: '#ff9800' }}>{currentUser?.username}</span>
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          
          {/* Image Preview Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              color: '#333',
              marginBottom: '24px',
              borderBottom: '1px solid #eee',
              paddingBottom: '8px'
            }}>
              รูปภาพสิ่งของ
            </h2>
            
            <div style={{ textAlign: 'center' }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Lost Item"
                  style={{ 
                    maxHeight: '280px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <div style={{
                  padding: '60px',
                  border: '2px dashed #ddd',
                  borderRadius: '12px',
                  backgroundColor: '#f8f9fa',
                  color: '#666'
                }}>
                  <i className="fas fa-image" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <p>ไม่มีรูปภาพ</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Item Information */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '500', 
                color: '#333',
                marginBottom: '24px',
                borderBottom: '1px solid #eee',
                paddingBottom: '8px'
              }}>
                ข้อมูลสิ่งของ
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    ชื่อสิ่งของ <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={item.name} 
                    onChange={handleChange} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    หมวดหมู่สิ่งของ <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <select 
                    name="category" 
                    value={item.category} 
                    onChange={handleChange} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="">เลือกประเภท</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    สถานที่พบ <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="place" 
                    value={item.place} 
                    onChange={handleChange} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    วันที่พบ
                  </label>
                  <input 
                    type="date" 
                    name="date" 
                    value={item.date} 
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#555',
                  marginBottom: '6px'
                }}>
                  รายละเอียด
                </label>
                <textarea 
                  name="description" 
                  value={item.description} 
                  onChange={handleChange} 
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>

            {/* Finder Information */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '500', 
                color: '#333',
                marginBottom: '24px',
                borderBottom: '1px solid #eee',
                paddingBottom: '8px'
              }}>
                ข้อมูลผู้พบสิ่งของ
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    ประเภทผู้พบ
                  </label>
                  <select 
                    name="finderType" 
                    value={item.finderType} 
                    onChange={handleChange} 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="">เลือกประเภทผู้พบ</option>
                    <option value="student">นักศึกษา</option>
                    <option value="employee">พนักงาน</option>
                    <option value="outsider">บุคคลภายนอก</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    เบอร์โทรศัพท์
                  </label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={item.phoneNumber} 
                    onChange={handleChange} 
                    placeholder="เช่น 081-234-5678"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>
              </div>

              {/* แสดงฟิลด์เพิ่มเติมสำหรับนักศึกษา */}
              {item.finderType === "student" && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  marginTop: '20px',
                  padding: '20px',
                  backgroundColor: '#f8f9fc',
                  borderRadius: '8px',
                  border: '1px solid #e3e6f0'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '6px'
                    }}>
                      เลขทะเบียนนักศึกษา
                    </label>
                    <input 
                      type="text" 
                      name="studentId" 
                      value={item.studentId} 
                      onChange={handleChange} 
                      placeholder="เช่น 64010123456"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                      onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#555',
                      marginBottom: '6px'
                    }}>
                      อีเมลมหาวิทยาลัย
                    </label>
                    <input 
                      type="email" 
                      name="universityEmail" 
                      value={item.universityEmail} 
                      onChange={handleChange} 
                      placeholder="เช่น student@university.ac.th"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                      onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '500', 
                color: '#333',
                marginBottom: '24px',
                borderBottom: '1px solid #eee',
                paddingBottom: '8px'
              }}>
                ข้อมูลเพิ่มเติม
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    ชื่อผู้รับแจ้งทรัพย์สินสูญหาย <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    disabled
                    type="text" 
                    name="namereport" 
                    value={item.namereport} 
                    onChange={handleChange} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    ตู้เก็บ
                  </label>
                  <input 
                    type="number" 
                    name="locker" 
                    value={item.locker} 
                    onChange={handleChange} 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff9800'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                alignItems: 'start'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    สถานะ
                  </label>
                  <input 
                    type="text" 
                    name="status" 
                    value={item.status} 
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '6px'
                  }}>
                    คิวอาร์โค้ด
                  </label>
                  <div style={{ 
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa',
                    textAlign: 'center',
                    minHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {qrUrl && (
                      <QRCodeCanvas
                        value={qrUrl}
                        size={140}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        includeMargin
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #eee'
            }}>
              <button 
                type="button" 
                onClick={() => navigate("/inventory")}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#ccc';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#ff9800',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e68900'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ff9800'}
              >
                อัปเดต
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItemForm;