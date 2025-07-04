import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../AuthContext"; // เพิ่ม import useAuth
import { useNavigate } from "react-router-dom"; // เพิ่ม import useNavigate

const LostItemForm = () => {
  const { currentUser } = useAuth(); // ใช้ currentUser จาก AuthContext
  const navigate = useNavigate(); // เพิ่ม useNavigate hook
  
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
  const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา","นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู","เสื้อ", "หมวก", "รองเท้า", "อื่นๆ"];

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบความครบถ้วนของข้อมูล
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(`กรุณากรอกข้อมูลให้ครบถ้วน:\n- ${validationErrors.join('\n- ')}`);
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
          // นำทางไปหน้า inventory เมื่อเพิ่มข้อมูลสำเร็จ
          navigate("/inventory");
        } else {
          console.error("Image upload failed");
          alert("เพิ่มของหายเรียบร้อย แต่อัปโหลดรูปภาพล้มเหลว");
        }
      } else {
        alert("เพิ่มของหายเรียบร้อย (ไม่มีรูปภาพ)");
        // นำทางไปหน้า inventory เมื่อเพิ่มข้อมูลสำเร็จ
        navigate("/inventory");
      }

      // Reset form แต่คงค่า namereport และ locker
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
    } catch (error) {
      console.error("=== ERROR ===");
      console.error("Error:", error);
      console.error("=============");
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง: " + error.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
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
            แจ้งนำสิ่งของเข้า
          </h1>
          <div style={{ 
            width: '60px', 
            height: '2px', 
            backgroundColor: '#007bff', 
            margin: '0 auto'
          }}></div>
        </div>
        
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          
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
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
                  วันที่พบ <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={item.date} 
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
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
                  ประเภทผู้พบ <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select 
                  name="finderType" 
                  value={item.finderType} 
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
                  เบอร์โทรศัพท์ <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={item.phoneNumber} 
                  onChange={handleChange} 
                  required 
                  placeholder="เช่น 081-234-5678"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
                    เลขทะเบียนนักศึกษา <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="studentId" 
                    value={item.studentId} 
                    onChange={handleChange} 
                    required 
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
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
                    อีเมลมหาวิทยาลัย <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="email" 
                    name="universityEmail" 
                    value={item.universityEmail} 
                    onChange={handleChange} 
                    required 
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
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
                  รูปภาพ <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  required
                  accept="image/*"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    outline: 'none'
                  }}
                />
                {/* Preview รูป */}
                {imageUrl && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      style={{ 
                        maxHeight: '160px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }} 
                    />
                  </div>
                )}
              </div>
              
              {/* เปลี่ยนส่วนนี้ - แสดงชื่อผู้รับแจ้งเป็น readonly */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#555',
                  marginBottom: '6px'
                }}>
                  ผู้รับแจ้งทรัพย์สินสูญหาย
                </label>
                <div style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-user" style={{ marginRight: '8px', color: '#6c757d' }}></i>
                  {currentUser?.username || 'ไม่ระบุ'}
                  <small style={{ marginLeft: '8px', color: '#6c757d' }}>
                    ({currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'})
                  </small>
                </div>
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  *ระบบจะบันทึกชื่อผู้ใช้ที่ล็อกอินอยู่โดยอัตโนมัติ
                </small>
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
                  ตู้เก็บ
                </label>
                <div style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-archive" style={{ marginRight: '8px', color: '#6c757d' }}></i>
                  ตู้เก็บหมายเลข {item.locker}
                  <small style={{ marginLeft: '8px', color: '#6c757d' }}>
                    (เดือน {new Date().toLocaleDateString('th-TH', { month: 'long' })})
                  </small>
                </div>
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  *ระบบจะกำหนดตู้เก็บตามเดือนปัจจุบันโดยอัตโนมัติ
                </small>
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
                  {qrUrl ? (
                    <QRCodeCanvas
                      value={qrUrl}
                      size={140}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      includeMargin
                    />
                  ) : (
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      QR Code จะปรากฏหลังจากบันทึกข้อมูล
                    </span>
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
              onClick={() => navigate("/dashboard")}
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
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '12px 32px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#007bff',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostItemForm;