import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext"; // เพิ่ม import สำหรับ auth
import axios from "axios";

const Removepage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // ดึงข้อมูล user ที่ login อยู่
  
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    description: "",
    namereport: "",
    locker: "",
    receiver: "",
    staffName: "", // จะถูกตั้งค่าจาก currentUser
    // เพิ่มฟิลด์ใหม่
    finderType: "",
    studentId: "",
    universityEmail: "",
    phoneNumber: ""
  });
  const [identityDoc, setIdentityDoc] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    console.log(`เรียก API ด้วย ID: ${id}`);
    axios.get(`http://localhost:8080/api/lost-items/${id}`)
      .then((response) => {
        const data = response.data;
        setItem({
          ...data,
          // ตั้งค่าเริ่มต้นสำหรับฟิลด์ใหม่ถ้าไม่มีข้อมูล
          finderType: data.finderType || "",
          studentId: data.studentId || "",
          universityEmail: data.universityEmail || "",
          phoneNumber: data.phoneNumber || "",
          // ตั้งค่าชื่อเจ้าหน้าที่จาก user ที่ login อยู่
          staffName: currentUser?.username || ""
        });
        fetchImage(id);
      })
      .catch((error) => {
        console.error("Error fetching item data:", error);
      });
  }, [id, currentUser]);

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
      console.error("Error updating item status:", error);
      alert("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const getFinderTypeText = (type) => {
    switch(type) {
      case "student": return "นักศึกษา";
      case "employee": return "พนักงาน";
      case "outsider": return "บุคคลภายนอก";
      default: return "ไม่ระบุ";
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
            แจ้งนำสิ่งของออก
          </h1>
          <div style={{ 
            width: '60px', 
            height: '2px', 
            backgroundColor: '#dc3545', 
            margin: '0 auto'
          }}></div>
          <p style={{
            marginTop: '12px',
            color: '#666',
            fontSize: '16px'
          }}>
            ดำเนินการโดย: <span style={{ fontWeight: '600', color: '#dc3545' }}>{currentUser?.username}</span>
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

          <form onSubmit={handleSetStatusItem}>
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
                    ชื่อสิ่งของ
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}>
                    {item.name}
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
                    หมวดหมู่สิ่งของ
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}>
                    {item.category}
                  </div>
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
                    สถานที่พบ
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}>
                    {item.place}
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
                    ชื่อผู้แจ้ง
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}>
                    {item.namereport}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
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
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    minHeight: '80px'
                  }}>
                    {item.description}
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
                    เลขล็อคเกอร์
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}>
                    {item.locker || 'ไม่ระบุ'}
                  </div>
                </div>
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
                padding: '20px',
                backgroundColor: '#f8f9fc',
                borderRadius: '8px',
                border: '1px solid #e3e6f0'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  marginBottom: '15px'
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
                    <div style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      color: '#333'
                    }}>
                      {getFinderTypeText(item.finderType)}
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
                      เบอร์โทรศัพท์
                    </label>
                    <div style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      color: '#333'
                    }}>
                      {item.phoneNumber || "ไม่ระบุ"}
                    </div>
                  </div>
                </div>

                {/* แสดงข้อมูลเพิ่มเติมสำหรับนักศึกษา */}
                {item.finderType === "student" && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
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
                      <div style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                        color: '#333'
                      }}>
                        {item.studentId || "ไม่ระบุ"}
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
                        อีเมลมหาวิทยาลัย
                      </label>
                      <div style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                        color: '#333'
                      }}>
                        {item.universityEmail || "ไม่ระบุ"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Removal Information */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '500', 
                color: '#333',
                marginBottom: '24px',
                borderBottom: '1px solid #eee',
                paddingBottom: '8px'
              }}>
                ข้อมูลการนำออก
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
                    ชื่อผู้มารับของ <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="receiver" 
                    required 
                    value={item.receiver} 
                    onChange={handleChange} 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#dc3545'}
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
                    เอกสารยืนยันตัวตน <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="file" 
                    name="identityDoc" 
                    required 
                    onChange={handleFileChange} 
                    accept="image/*,.pdf"
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
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    รองรับไฟล์ภาพและ PDF
                  </small>
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
                  ชื่อเจ้าหน้าที่นำของออก
                </label>
                <div style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  position: 'relative'
                }}>
                  {item.staffName}
                  {/* <small style={{ 
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#28a745',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    ✓ อัตโนมัติ
                  </small> */}
                </div>
                {/* <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  ข้อมูลนี้จะถูกกรอกอัตโนมัติจากผู้ใช้ที่เข้าสู่ระบบ
                </small> */}
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
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                นำของออก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Removepage;