import React, { useState, useEffect } from "react";
import axios from "axios";

const Reports = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/lost-items");
      setAllItems(response.data);
      setError(null);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันกรองข้อมูลตามช่วงเวลา
  const filterDataByPeriod = (period, customDate = null) => {
    const now = new Date();
    const validItems = allItems.filter(item => item.status !== 'deleted');
    
    switch (period) {
      case 'today':
        return validItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === now.toDateString();
        });
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return validItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === yesterday.toDateString();
        });
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return validItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= weekStart;
        });
      case 'thisMonth':
        return validItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() === now.getMonth() && 
                 itemDate.getFullYear() === now.getFullYear();
        });
      case 'thisYear':
        return validItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === now.getFullYear();
        });
      case 'custom':
        if (!customDate) return [];
        const selectedDate = new Date(customDate);
        return validItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === selectedDate.toDateString();
        });
      default:
        return validItems;
    }
  };

  // สร้างรายงานสถิติ
  const generateStatsReport = (data) => {
    const total = data.length;
    const stored = data.filter(item => item.status === 'stored').length;
    const removed = data.filter(item => item.status === 'removed').length;
    
    // สถิติตามหมวดหมู่
    const categoryStats = {};
    data.forEach(item => {
      if (item.category) {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
      }
    });

    // สถิติตามสถานที่
    const locationStats = {};
    data.forEach(item => {
      if (item.location) {
        locationStats[item.location] = (locationStats[item.location] || 0) + 1;
      }
    });

    return {
      total,
      stored,
      removed,
      categoryStats: Object.entries(categoryStats)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      locationStats: Object.entries(locationStats)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
    };
  };

  // รายงานสิ่งของที่ไม่มีคนมารับ
  const getUnclaimedItems = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return allItems.filter(item => 
      item.status === 'stored' && 
      new Date(item.date) <= thirtyDaysAgo
    );
  };

  // รายงานประสิทธิภาพการทำงาน
  const generatePerformanceReport = () => {
    const validItems = allItems.filter(item => item.status !== 'deleted');
    const total = validItems.length;
    
    if (total === 0) return null;

    const stored = validItems.filter(item => item.status === 'stored').length;
    const removed = validItems.filter(item => item.status === 'removed').length;
    
    const storageRate = ((stored / total) * 100).toFixed(1);
    const returnRate = ((removed / total) * 100).toFixed(1);
    
    // คำนวณเวลาเฉลี่ยในการเก็บรักษา
    const removedItems = validItems.filter(item => item.status === 'removed');
    const averageStorageDays = removedItems.length > 0 ? 
      removedItems.reduce((sum, item) => {
        const storeDate = new Date(item.date);
        const removeDate = new Date(item.updatedAt || item.date);
        const diffDays = Math.ceil((removeDate - storeDate) / (1000 * 60 * 60 * 24));
        return sum + Math.max(diffDays, 0);
      }, 0) / removedItems.length : 0;

    return {
      totalItems: total,
      storageRate: parseFloat(storageRate),
      returnRate: parseFloat(returnRate),
      averageStorageDays: Math.round(averageStorageDays),
      activeCategories: [...new Set(validItems.map(item => item.category))].length,
      activeLocations: [...new Set(validItems.map(item => item.location))].length
    };
  };

  // Export เป็น CSV (สำหรับใช้กับ Excel)
  const exportToCSV = (data, filename) => {
    const headers = ['วันที่', 'หมวดหมู่', 'ชื่อสิ่งของ', 'สถานที่พบ', 'ผู้พบ', 'สถานะ', 'ผู้รับ', 'เจ้าหน้าที่'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        formatThaiDate(item.date),
        item.category || '',
        `"${item.itemName || ''}"`,
        item.location || '',
        item.finder || '',
        item.status === 'stored' ? 'เก็บรักษา' : 'ส่งคืนแล้ว',
        item.receiver || '',
        item.staffName || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export รายงานเป็น HTML (สำหรับพิมพ์หรือบันทึกเป็น PDF)
  const exportToPDF = (reportType) => {
    let content = '';
    const currentDate = formatThaiDate(new Date().toISOString());
    
    if (reportType === 'stats') {
      const data = filterDataByPeriod(selectedPeriod, customDate);
      const stats = generateStatsReport(data);
      
      content = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>รายงานสถิติ</title>
            <style>
              body { font-family: 'Arial', sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
              .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .print-btn { display: none; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>รายงานสถิติของหาย</h1>
              <p>วันที่: ${currentDate}</p>
              <p>ช่วงเวลา: ${getPeriodText(selectedPeriod)}</p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <h3>รายการทั้งหมด</h3>
                <h2>${stats.total}</h2>
              </div>
              <div class="stat-card">
                <h3>กำลังเก็บรักษา</h3>
                <h2>${stats.stored}</h2>
              </div>
              <div class="stat-card">
                <h3>ส่งคืนแล้ว</h3>
                <h2>${stats.removed}</h2>
              </div>
              <div class="stat-card">
                <h3>อัตราการส่งคืน</h3>
                <h2>${((stats.removed / stats.total) * 100).toFixed(1)}%</h2>
              </div>
            </div>

            <h3>สถิติตามหมวดหมู่</h3>
            <table>
              <tr><th>หมวดหมู่</th><th>จำนวน</th></tr>
              ${stats.categoryStats.map(cat => `<tr><td>${cat.category}</td><td>${cat.count}</td></tr>`).join('')}
            </table>

            <h3>สถิติตามสถานที่</h3>
            <table>
              <tr><th>สถานที่</th><th>จำนวน</th></tr>
              ${stats.locationStats.map(loc => `<tr><td>${loc.location}</td><td>${loc.count}</td></tr>`).join('')}
            </table>

            <button class="no-print" onclick="window.print()" style="margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">พิมพ์รายงาน</button>
          </body>
        </html>
      `;
    } else if (reportType === 'unclaimed') {
      const unclaimedItems = getUnclaimedItems();
      
      content = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>รายงานสิ่งของที่ไม่มีคนมารับ</title>
            <style>
              body { font-family: 'Arial', sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .highlight { background-color: #fff3cd; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>รายงานสิ่งของที่ไม่มีคนมารับ</h1>
              <p>วันที่: ${currentDate}</p>
              <p>สิ่งของที่เก็บรักษามานานกว่า 30 วัน</p>
            </div>
            
            <p><strong>จำนวนรายการทั้งหมด: ${unclaimedItems.length} รายการ</strong></p>
            
            <table>
              <tr>
                <th>วันที่พบ</th>
                <th>หมวดหมู่</th>
                <th>ชื่อสิ่งของ</th>
                <th>สถานที่พบ</th>
                <th>ผู้พบ</th>
                <th>จำนวนวันที่เก็บ</th>
              </tr>
              ${unclaimedItems.map(item => {
                const daysDiff = Math.ceil((new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24));
                return `
                  <tr class="${daysDiff > 60 ? 'highlight' : ''}">
                    <td>${formatThaiDate(item.date)}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.itemName || '-'}</td>
                    <td>${item.location || '-'}</td>
                    <td>${item.finder || '-'}</td>
                    <td>${daysDiff} วัน</td>
                  </tr>
                `;
              }).join('')}
            </table>

            <button class="no-print" onclick="window.print()" style="margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">พิมพ์รายงาน</button>
          </body>
        </html>
      `;
    }

    const newWindow = window.open('', '_blank');
    newWindow.document.write(content);
    newWindow.document.close();
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const getPeriodText = (period) => {
    switch (period) {
      case 'today': return 'วันนี้';
      case 'yesterday': return 'เมื่อวาน';
      case 'thisWeek': return 'สัปดาห์นี้';
      case 'thisMonth': return 'เดือนนี้';
      case 'thisYear': return 'ปีนี้';
      case 'custom': return `วันที่ ${formatThaiDate(customDate)}`;
      default: return 'ทั้งหมด';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  const currentData = filterDataByPeriod(selectedPeriod, customDate);
  const currentStats = generateStatsReport(currentData);
  const unclaimedItems = getUnclaimedItems();
  const performanceStats = generatePerformanceReport();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: '#2F318B' }}>
          <i className="fas fa-chart-bar me-2"></i>
          ระบบรายงาน
        </h2>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <i className="fas fa-calendar-day me-2"></i>
            รายงานสถิติ
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'unclaimed' ? 'active' : ''}`}
            onClick={() => setActiveTab('unclaimed')}
          >
            <i className="fas fa-clock me-2"></i>
            สิ่งของไม่มีคนรับ
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <i className="fas fa-chart-line me-2"></i>
            ประสิทธิภาพการทำงาน
          </button>
        </li>
      </ul>

      {/* รายงานสถิติ */}
      {activeTab === 'daily' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">ตัวเลือกช่วงเวลา</h5>
              </div>
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">เลือกช่วงเวลา</label>
                    <select 
                      className="form-select"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <option value="today">วันนี้</option>
                      <option value="yesterday">เมื่อวาน</option>
                      <option value="thisWeek">สัปดาห์นี้</option>
                      <option value="thisMonth">เดือนนี้</option>
                      <option value="thisYear">ปีนี้</option>
                      <option value="custom">เลือกวันที่</option>
                    </select>
                  </div>
                  {selectedPeriod === 'custom' && (
                    <div className="col-md-4">
                      <label className="form-label">เลือกวันที่</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="col-md-4">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary"
                        onClick={() => exportToCSV(currentData, `รายงานสถิติ_${getPeriodText(selectedPeriod)}`)}
                      >
                        <i className="fas fa-file-excel me-2"></i>
                        Export Excel
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => exportToPDF('stats')}
                      >
                        <i className="fas fa-file-pdf me-2"></i>
                        Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* สถิติแสดงผล */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-primary">{currentStats.total}</h3>
                    <p className="mb-0 text-muted">รายการทั้งหมด</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-success">{currentStats.stored}</h3>
                    <p className="mb-0 text-muted">กำลังเก็บรักษา</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-warning">{currentStats.removed}</h3>
                    <p className="mb-0 text-muted">ส่งคืนแล้ว</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="text-info">
                      {currentStats.total > 0 ? ((currentStats.removed / currentStats.total) * 100).toFixed(1) : 0}%
                    </h3>
                    <p className="mb-0 text-muted">อัตราการส่งคืน</p>
                  </div>
                </div>
              </div>
            </div>

            {/* สถิติรายละเอียด */}
            <div className="row">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white">
                    <h6 className="mb-0">สถิติตามหมวดหมู่</h6>
                  </div>
                  <div className="card-body">
                    {currentStats.categoryStats.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>หมวดหมู่</th>
                              <th>จำนวน</th>
                              <th>%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentStats.categoryStats.slice(0, 5).map((cat, index) => (
                              <tr key={index}>
                                <td>{cat.category}</td>
                                <td>{cat.count}</td>
                                <td>{((cat.count / currentStats.total) * 100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted text-center">ไม่มีข้อมูล</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white">
                    <h6 className="mb-0">สถิติตามสถานที่</h6>
                  </div>
                  <div className="card-body">
                    {currentStats.locationStats.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>สถานที่</th>
                              <th>จำนวน</th>
                              <th>%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentStats.locationStats.slice(0, 5).map((loc, index) => (
                              <tr key={index}>
                                <td>{loc.location}</td>
                                <td>{loc.count}</td>
                                <td>{((loc.count / currentStats.total) * 100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted text-center">ไม่มีข้อมูล</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* รายงานสิ่งของที่ไม่มีคนมารับ */}
      {activeTab === 'unclaimed' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">สิ่งของที่ไม่มีคนมารับ (เก็บมานานกว่า 30 วัน)</h5>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => exportToCSV(unclaimedItems, 'สิ่งของไม่มีคนรับ')}
                  >
                    <i className="fas fa-file-excel me-2"></i>
                    Export Excel
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => exportToPDF('unclaimed')}
                  >
                    <i className="fas fa-file-pdf me-2"></i>
                    Export PDF
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  พบสิ่งของที่ไม่มีคนมารับทั้งหมด <strong>{unclaimedItems.length}</strong> รายการ
                </div>
                
                {unclaimedItems.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>วันที่พบ</th>
                          <th>หมวดหมู่</th>
                          <th>ชื่อสิ่งของ</th>
                          <th>สถานที่พบ</th>
                          <th>ผู้พบ</th>
                          <th>จำนวนวันที่เก็บ</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unclaimedItems.map((item, index) => {
                          const daysDiff = Math.ceil((new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={index} className={daysDiff > 60 ? 'table-warning' : ''}>
                              <td>{formatThaiDate(item.date)}</td>
                              <td>{item.category || '-'}</td>
                              <td>{item.name || '-'}</td>
                              <td>{item.place || '-'}</td>
                              <td>{item.namereport || '-'}</td>
                              <td>
                                <span className={`badge ${daysDiff > 60 ? 'bg-danger' : 'bg-warning'}`}>
                                  {daysDiff} วัน
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-success">เก็บรักษา</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h5>ไม่มีสิ่งของที่ค้างรับ</h5>
                    <p className="text-muted">สิ่งของทั้งหมดได้รับการส่งคืนแล้ว หรือยังไม่ถึงระยะเวลา 30 วัน</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* รายงานประสิทธิภาพการทำงาน */}
      {activeTab === 'performance' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">รายงานประสิทธิภาพการทำงาน</h5>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const content = `
                      <html>
                        <head>
                          <meta charset="UTF-8">
                          <title>รายงานประสิทธิภาพการทำงาน</title>
                          <style>
                            body { font-family: 'Arial', sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .performance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                            .performance-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
                            .performance-value { font-size: 2em; font-weight: bold; color: #2F318B; }
                            .performance-label { color: #666; margin-top: 10px; }
                            @media print { .no-print { display: none; } }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>รายงานประสิทธิภาพการทำงาน</h1>
                            <p>วันที่: ${formatThaiDate(new Date().toISOString())}</p>
                          </div>
                          
                          <div class="performance-grid">
                            <div class="performance-card">
                              <div class="performance-value">${performanceStats?.totalItems || 0}</div>
                              <div class="performance-label">รายการทั้งหมด</div>
                            </div>
                            <div class="performance-card">
                              <div class="performance-value">${performanceStats?.storageRate || 0}%</div>
                              <div class="performance-label">อัตราการเก็บรักษา</div>
                            </div>
                            <div class="performance-card">
                              <div class="performance-value">${performanceStats?.returnRate || 0}%</div>
                              <div class="performance-label">อัตราการส่งคืน</div>
                            </div>
                            <div class="performance-card">
                              <div class="performance-value">${performanceStats?.averageStorageDays || 0}</div>
                              <div class="performance-label">วันเฉลี่ยในการเก็บ</div>
                            </div>
                            <div class="performance-card">
                              <div class="performance-value">${performanceStats?.activeCategories || 0}</div>
                              <div class="performance-label">หมวดหมู่ที่ใช้งาน</div>
                            </div>
                            <div class="performance-card">
                              <div class="performance-value">${performanceStats?.activeLocations || 0}</div>
                              <div class="performance-label">สถานที่ที่ใช้งาน</div>
                            </div>
                          </div>

                          <h3>สรุปผลการดำเนินงาน</h3>
                          <ul>
                            <li>ระบบมีประสิทธิภาพในการเก็บรักษาสิ่งของ ${performanceStats?.storageRate || 0}%</li>
                            <li>อัตราการส่งคืนสิ่งของให้เจ้าของ ${performanceStats?.returnRate || 0}%</li>
                            <li>เวลาเฉลี่ยในการเก็บรักษาสิ่งของ ${performanceStats?.averageStorageDays || 0} วัน</li>
                            <li>มีการใช้งาน ${performanceStats?.activeCategories || 0} หมวดหมู่ และ ${performanceStats?.activeLocations || 0} สถานที่</li>
                          </ul>

                          <button class="no-print" onclick="window.print()" style="margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">พิมพ์รายงาน</button>
                        </body>
                      </html>
                    `;
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(content);
                    newWindow.document.close();
                  }}
                >
                  <i className="fas fa-file-pdf me-2"></i>
                  Export PDF
                </button>
              </div>
              <div className="card-body">
                {performanceStats ? (
                  <>
                    {/* KPI Cards */}
                    <div className="row g-4 mb-4">
                      <div className="col-md-4">
                        <div className="card text-center border-primary">
                          <div className="card-body">
                            <h2 className="text-primary">{performanceStats.storageRate}%</h2>
                            <p className="mb-0 text-muted">อัตราการเก็บรักษา</p>
                            <small className="text-muted">จากรายการทั้งหมด {performanceStats.totalItems} รายการ</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card text-center border-success">
                          <div className="card-body">
                            <h2 className="text-success">{performanceStats.returnRate}%</h2>
                            <p className="mb-0 text-muted">อัตราการส่งคืน</p>
                            <small className="text-muted">ประสิทธิภาพการคืนสิ่งของ</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card text-center border-info">
                          <div className="card-body">
                            <h2 className="text-info">{performanceStats.averageStorageDays}</h2>
                            <p className="mb-0 text-muted">วันเฉลี่ยในการเก็บ</p>
                            <small className="text-muted">ระยะเวลาเฉลี่ยจนกว่าจะส่งคืน</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Details */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">รายละเอียดการดำเนินงาน</h6>
                          </div>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span>รายการทั้งหมด</span>
                              <span className="badge bg-primary fs-6">{performanceStats.totalItems}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span>หมวดหมู่ที่ใช้งาน</span>
                              <span className="badge bg-info fs-6">{performanceStats.activeCategories}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span>สถานที่ที่ใช้งาน</span>
                              <span className="badge bg-warning fs-6">{performanceStats.activeLocations}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>สิ่งของที่ไม่มีคนรับ</span>
                              <span className="badge bg-danger fs-6">{unclaimedItems.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">การประเมินประสิทธิภาพ</h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>ประสิทธิภาพการเก็บรักษา</span>
                                <span>{performanceStats.storageRate >= 80 ? '🟢 ดีเยี่ยม' : performanceStats.storageRate >= 60 ? '🟡 ปานกลาง' : '🔴 ต้องปรับปรุง'}</span>
                              </div>
                              <div className="progress">
                                <div 
                                  className={`progress-bar ${performanceStats.storageRate >= 80 ? 'bg-success' : performanceStats.storageRate >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                  style={{ width: `${performanceStats.storageRate}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>ประสิทธิภาพการส่งคืน</span>
                                <span>{performanceStats.returnRate >= 70 ? '🟢 ดีเยี่ยม' : performanceStats.returnRate >= 50 ? '🟡 ปานกลาง' : '🔴 ต้องปรับปรุง'}</span>
                              </div>
                              <div className="progress">
                                <div 
                                  className={`progress-bar ${performanceStats.returnRate >= 70 ? 'bg-success' : performanceStats.returnRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                                  style={{ width: `${performanceStats.returnRate}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>ความรวดเร็วในการส่งคืน</span>
                                <span>{performanceStats.averageStorageDays <= 7 ? '🟢 รวดเร็ว' : performanceStats.averageStorageDays <= 14 ? '🟡 ปานกลาง' : '🔴 ช้า'}</span>
                              </div>
                              <small className="text-muted">เฉลี่ย {performanceStats.averageStorageDays} วัน</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">คำแนะนำสำหรับการปรับปรุง</h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <h6 className="text-success">จุดแข็ง</h6>
                                <ul className="list-unstyled">
                                  {performanceStats.storageRate >= 80 && <li><i className="fas fa-check text-success me-2"></i>อัตราการเก็บรักษาสูง</li>}
                                  {performanceStats.returnRate >= 70 && <li><i className="fas fa-check text-success me-2"></i>อัตราการส่งคืนดี</li>}
                                  {performanceStats.averageStorageDays <= 7 && <li><i className="fas fa-check text-success me-2"></i>ส่งคืนได้รวดเร็ว</li>}
                                  {unclaimedItems.length === 0 && <li><i className="fas fa-check text-success me-2"></i>ไม่มีสิ่งของค้างรับ</li>}
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <h6 className="text-warning">ข้อเสนอแนะ</h6>
                                <ul className="list-unstyled">
                                  {performanceStats.storageRate < 80 && <li><i className="fas fa-lightbulb text-warning me-2"></i>เพิ่มประสิทธิภาพการเก็บรักษา</li>}
                                  {performanceStats.returnRate < 70 && <li><i className="fas fa-lightbulb text-warning me-2"></i>ปรับปรุงกระบวนการส่งคืน</li>}
                                  {performanceStats.averageStorageDays > 14 && <li><i className="fas fa-lightbulb text-warning me-2"></i>เร่งการติดต่อเจ้าของ</li>}
                                  {unclaimedItems.length > 10 && <li><i className="fas fa-lightbulb text-warning me-2"></i>จัดการสิ่งของค้างรับ</li>}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <h5>ไม่มีข้อมูลเพียงพอ</h5>
                    <p className="text-muted">ต้องมีข้อมูลอย่างน้อย 1 รายการเพื่อแสดงรายงานประสิทธิภาพ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;