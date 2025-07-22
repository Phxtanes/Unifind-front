import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' หรือ 'pending'
  const { currentUser } = useAuth();

  // ตรวจสอบสิทธิ์ Admin
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      setLoading(false);
      return;
    }
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    await Promise.all([fetchUsers(), fetchPendingUsers()]);
  };

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

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/users/pending');
      setPendingUsers(response.data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/auth/user/${userId}/approve`);
      if (response.data.success) {
        setSuccess('อนุมัติผู้ใช้เป็นเจ้าหน้าที่สำเร็จ');
        fetchData(); // รีเฟรชข้อมูล
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('ไม่สามารถอนุมัติผู้ใช้ได้');
      console.error('Error approving user:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectUser = async (userId) => {
    if (window.confirm('คุณต้องการปฏิเสธการขอเป็นเจ้าหน้าที่นี้หรือไม่?')) {
      try {
        const response = await axios.put(`http://localhost:8080/api/auth/user/${userId}/reject`);
        if (response.data.success) {
          setSuccess('ปฏิเสธการขอเป็นเจ้าหน้าที่สำเร็จ');
          fetchData(); // รีเฟรชข้อมูล
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('ไม่สามารถปฏิเสธการขอเป็นเจ้าหน้าที่ได้');
        console.error('Error rejecting user:', err);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/auth/user/${userId}/activate`);
      if (response.data.success) {
        setSuccess('เปิดการใช้งานผู้ใช้สำเร็จ');
        fetchData(); // รีเฟรชข้อมูล
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
          fetchData(); // รีเฟรชข้อมูล
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
          fetchData(); // รีเฟรชข้อมูล
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
      case 'member': return 'สมาชิก';
      default: return role || 'ไม่ระบุ';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'bg-danger';
      case 'staff': return 'bg-primary';
      case 'member': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getApprovalStatus = (user) => {
    if (user.role === 'admin') {
      return { text: 'อนุมัติแล้ว', class: 'bg-success' };
    }
    if (user.role === 'staff' && user.isApproved) {
      return { text: 'อนุมัติแล้ว', class: 'bg-success' };
    }
    if (user.role === 'member') {
      return { text: 'รอการอนุมัติ', class: 'bg-warning' };
    }
    return { text: 'ปฏิเสธ', class: 'bg-danger' };
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

  // กรองเฉพาะ admin และ staff สำหรับแท็บ "ผู้ใช้ทั้งหมด"
  const filteredUsers = users.filter(user => user.role === 'admin' || user.role === 'staff');
  const currentUsers = activeTab === 'all' ? filteredUsers : pendingUsers;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold" style={{ color: '#2F318B' }}>
          👥 จัดการผู้ใช้งาน
        </h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-primary btn-sm" onClick={fetchData}>
            🔄 รีเฟรช
          </button>
          <span className="text-muted">ผู้ใช้ทั้งหมด: {filteredUsers.length} คน</span>
          {pendingUsers.length > 0 && (
            <span className="badge bg-warning fs-6">
              รอการอนุมัติ: {pendingUsers.length} คน
            </span>
          )}
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

      {/* Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              ผู้ใช้ทั้งหมด ({filteredUsers.length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              รอการอนุมัติ 
              {pendingUsers.length > 0 && (
                <span className="badge bg-warning ms-2">{pendingUsers.length}</span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
            {activeTab === 'all' ? 'รายการผู้ใช้ในระบบ' : 'รายการผู้ใช้ที่รอการอนุมัติเป็นเจ้าหน้าที่'}
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
                  <th className="py-3">การอนุมัติ</th>
                  <th className="py-3">วันที่สมัคร</th>
                  <th className="py-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => {
                    const approvalStatus = getApprovalStatus(user);
                    return (
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
                          <span className={`badge ${approvalStatus.class} fs-6`}>
                            {approvalStatus.text}
                          </span>
                        </td>
                        <td className="py-3">
                          <small className="text-muted">
                            {formatDate(user.createdAt)}
                          </small>
                        </td>
                        <td className="py-3 text-center">
                          <div className="btn-group" role="group">
                            {/* ปุ่มอนุมัติ/ปฏิเสธ สำหรับ member ที่รอการอนุมัติ */}
                            {user.role === 'member' && (
                              <>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleApproveUser(user.id)}
                                  title="อนุมัติเป็นเจ้าหน้าที่"
                                >
                                  ✅ อนุมัติ
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRejectUser(user.id)}
                                  title="ปฏิเสธ"
                                >
                                  ❌ ปฏิเสธ
                                </button>
                              </>
                            )}
                            
                            {/* ปุ่มเปิด/ปิดการใช้งาน สำหรับ staff */}
                            {user.role === 'staff' && (
                              <>
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
                              </>
                            )}
                            
                            {/* ปุ่มลบ */}
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        {activeTab === 'all' ? '👥 ไม่มีข้อมูลผู้ใช้' : '⏳ ไม่มีผู้ใช้ที่รอการอนุมัติ'}
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
      {/* <div className="row mt-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{filteredUsers.length}</h3>
              <p className="text-muted mb-0">ผู้ใช้ทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {filteredUsers.filter(user => user.isActive && user.role === 'staff').length}
              </h3>
              <p className="text-muted mb-0">เจ้าหน้าที่ใช้งาน</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-warning mb-1">
                {pendingUsers.length}
              </h3>
              <p className="text-muted mb-0">รอการอนุมัติ</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-danger mb-1">
                {filteredUsers.filter(user => user.role === 'admin').length}
              </h3>
              <p className="text-muted mb-0">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Role Statistics */}
      {/* <div className="row mt-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-info mb-1">
                {users.filter(user => user.role === 'member').length}
              </h3>
              <p className="text-muted mb-0">สมาชิกทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">
                {filteredUsers.filter(user => user.role === 'staff' && user.isApproved).length}
              </h3>
              <p className="text-muted mb-0">เจ้าหน้าที่ที่อนุมัติแล้ว</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <h3 className="text-warning mb-1">
                {users.filter(user => user.role === 'member' && !user.isApproved).length}
              </h3>
              <p className="text-muted mb-0">รอการอนุมัติเป็นเจ้าหน้าที่</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default UserManagement;