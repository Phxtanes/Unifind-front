import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();

  // ตรวจสอบสิทธิ์ Admin
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/auth/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/auth/user/${userId}/activate`);
      if (response.data.success) {
        setSuccess('เปิดการใช้งานผู้ใช้สำเร็จ');
        fetchUsers(); // รีเฟรชข้อมูล
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('ไม่สามารถเปิดการใช้งานผู้ใช้ได้');
      console.error('Error activating user:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('คุณต้องการปิดการใช้งานผู้ใช้นี้หรือไม่?')) {
      try {
        const response = await axios.put(`http://localhost:8080/api/auth/user/${userId}/deactivate`);
        if (response.data.success) {
          setSuccess('ปิดการใช้งานผู้ใช้สำเร็จ');
          fetchUsers(); // รีเฟรชข้อมูล
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('ไม่สามารถปิดการใช้งานผู้ใช้ได้');
        console.error('Error deactivating user:', err);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('คุณต้องการลบผู้ใช้นี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/auth/user/${userId}`);
        if (response.data.success) {
          setSuccess('ลบผู้ใช้สำเร็จ');
          fetchUsers(); // รีเฟรชข้อมูล
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('ไม่สามารถลบผู้ใช้ได้');
        console.error('Error deleting user:', err);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'staff': return 'เจ้าหน้าที่';
      case 'user': return 'ผู้ใช้';
      default: return role || 'ไม่ระบุ';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'bg-danger';
      case 'staff': return 'bg-primary';
      case 'user': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger text-center">
          <h5>ไม่มีสิทธิ์เข้าถึง</h5>
          <p>คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold" style={{ color: '#2F318B' }}>
          👥 จัดการผู้ใช้
        </h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-primary btn-sm" onClick={fetchUsers}>
            🔄 รีเฟรช
          </button>
          <span className="text-muted">จำนวนผู้ใช้ทั้งหมด: {users.length} คน</span>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          ⚠️ {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          ✅ {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
            รายการผู้ใช้ในระบบ
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">ลำดับ</th>
                  <th className="py-3">Username</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">บทบาท</th>
                  <th className="py-3">สถานะ</th>
                  <th className="py-3">วันที่สมัคร</th>
                  <th className="py-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td className="py-3 px-4 fw-bold text-muted">{index + 1}</td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                               style={{ width: '40px', height: '40px' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold">{user.username}</div>
                            {user.id === currentUser?.id && (
                              <small className="text-primary">
                                👤 คุณ
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span className={`badge ${getRoleBadgeClass(user.role)} fs-6`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.isActive ? (
                          <span className="badge bg-success fs-6">
                            ✅ ใช้งานได้
                          </span>
                        ) : (
                          <span className="badge bg-danger fs-6">
                            ❌ ปิดการใช้งาน
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <small className="text-muted">
                          {formatDate(user.createdAt)}
                        </small>
                      </td>
                      <td className="py-3 text-center">
                        <div className="btn-group" role="group">
                          {user.isActive ? (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => handleDeactivateUser(user.id)}
                              disabled={user.id === currentUser?.id}
                              title={user.id === currentUser?.id ? "ไม่สามารถปิดการใช้งานตัวเองได้" : "ปิดการใช้งาน"}
                            >
                              🚫
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleActivateUser(user.id)}
                              title="เปิดการใช้งาน"
                            >
                              ✅
                            </button>
                          )}
                          
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? "ไม่สามารถลบตัวเองได้" : "ลบผู้ใช้"}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        👥 ไม่มีข้อมูลผู้ใช้
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{users.length}</h3>
              <p className="text-muted mb-0">ผู้ใช้ทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {users.filter(user => user.isActive).length}
              </h3>
              <p className="text-muted mb-0">กำลังใช้งาน</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-danger mb-1">
                {users.filter(user => user.role === 'admin').length}
              </h3>
              <p className="text-muted mb-0">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">
                {users.filter(user => user.role === 'staff').length}
              </h3>
              <p className="text-muted mb-0">เจ้าหน้าที่</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;