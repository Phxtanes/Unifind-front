import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalItems: 0,
    storedItems: 0,
    removedItems: 0,
    thisMonth: 0
  });

  const [chartData, setChartData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  
  // เพิ่ม state สำหรับข้อมูลใหม่
  const [topCategories, setTopCategories] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [latestItems, setLatestItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // ดึงข้อมูลจาก API
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

  // คำนวณสถิติเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (allItems.length > 0) {
      calculateStats();
      generateChartData();
      calculateTopStats(); // เพิ่มฟังก์ชันใหม่
    }
  }, [allItems]);

  // ฟังก์ชันคำนวณข้อมูลใหม่
  const calculateTopStats = () => {
    const validItems = allItems.filter(item => item.status !== 'deleted');
    
    // Top 3 ประเภทของหายที่พบบ่อยสุด
    const categoryCount = {};
    validItems.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });
    
    const topCategoriesArray = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    setTopCategories(topCategoriesArray);
    
    // สถานที่พบมากสุด
    const locationCount = {};
    validItems.forEach(item => {
      if (item.place) {
        locationCount[item.place] = (locationCount[item.place] || 0) + 1;
      }
    });
    
    const topLocationsArray = Object.entries(locationCount)
      .map(([place, count]) => ({ place, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setTopLocations(topLocationsArray);
    
    // ของชิ้นล่าสุดที่พบ (5 ชิ้นล่าสุด)
    const sortedItems = validItems
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    setLatestItems(sortedItems);

    // คำนวณกิจกรรมล่าสุด
    calculateRecentActivities(validItems);
  };

  // ฟังก์ชันคำนวณกิจกรรมล่าสุด
  const calculateRecentActivities = (validItems) => {
    const activities = [];
    
    // สร้างกิจกรรมจากข้อมูลที่มี
    validItems.forEach(item => {
      // กิจกรรมการเพิ่มของ (ใช้วันที่พบ)
      activities.push({
        id: `add_${item.id}`,
        type: 'add',
        item: item.name,
        category: item.category,
        place: item.place,
        date: item.date,
        reporter: item.namereport,
        status: 'เพิ่มรายการใหม่'
      });

      // ถ้าสถานะเป็น removed แสดงว่ามีการนำออก
      if (item.status === 'removed' && item.receiver && item.staffName) {
        activities.push({
          id: `remove_${item.id}`,
          type: 'remove',
          item: item.name,
          category: item.category,
          place: item.place,
          date: item.date, // ใช้วันที่เดียวกัน แต่ในระบบจริงควรมีวันที่นำออกแยก
          receiver: item.receiver,
          staff: item.staffName,
          status: 'นำของออกแล้ว'
        });
      }
    });

    // เรียงตามวันที่ล่าสุด และเอาแค่ 10 รายการ
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    setRecentActivities(sortedActivities);
  };

  const calculateStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // กรองข้อมูลที่ไม่ใช่ status "deleted"
    const validItems = allItems.filter(item => item.status !== 'deleted');
    
    const totalItems = validItems.length;
    const storedItems = validItems.filter(item => item.status === 'stored').length;
    const removedItems = validItems.filter(item => item.status === 'removed').length;
    
    const thisMonth = validItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;

    setStats({
      totalItems,
      storedItems,
      removedItems,
      thisMonth
    });

    // คำนวณสถิติตามหมวดหมู่ (เฉพาะ stored)
    const categoryCount = {};
    validItems
      .filter(item => item.status === 'stored')
      .forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        }
      });
    
    const categoryArray = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
    
    setCategoryStats(categoryArray);
  };

  const generateChartData = () => {
    // สร้างข้อมูลกราฟตาม 6 เดือนล่าสุด
    const currentDate = new Date();
    const months = [];
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      
      // นับจำนวนรายการในเดือนนั้น
      const itemsInMonth = allItems.filter(item => {
        if (item.status === 'deleted') return false;
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === monthIndex && itemDate.getFullYear() === year;
      }).length;
      
      months.push({
        month: monthNames[monthIndex],
        value: itemsInMonth
      });
    }
    
    setChartData(months);
  };

  // ฟังก์ชันฟอร์แมตวันที่
  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // ฟังก์ชันสำหรับสร้าง SVG Chart
  const SimpleLineChart = ({ data, width = 400, height = 200 }) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    if (data.length === 0) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
          <span className="text-muted">ไม่มีข้อมูล</span>
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = Math.min(...data.map(d => d.value), 0);
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d.value - minValue) / (maxValue - minValue || 1)) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="w-100">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2F318B" />
            <stop offset="100%" stopColor="#4F69C6" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(percent => {
          const y = padding + (percent / 100) * chartHeight;
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points and Value Labels */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((d.value - minValue) / (maxValue - minValue || 1)) * chartHeight;
          return (
            <g key={i}>
              {/* Point */}
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#2F318B"
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Value Label Background */}
              <rect
                x={x - 12}
                y={y - 25}
                width="24"
                height="16"
                fill="rgba(47, 49, 139, 0.9)"
                rx="8"
                ry="8"
              />
              
              {/* Value Label Text */}
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="white"
              >
                {d.value}
              </text>
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#6c757d"
            >
              {d.month}
            </text>
          );
        })}
      </svg>
    );
  };

  // ฟังก์ชันสำหรับสร้าง Donut Chart
  const DonutChart = ({ data, size = 200 }) => {
    if (data.length === 0) {
      return (
        <div className="d-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
          <span className="text-muted">ไม่มีข้อมูล</span>
        </div>
      );
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const innerRadius = radius - 30;
    
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    const colors = ['#2F318B', '#4CAF50', '#FF9800', '#9C27B0', '#FF5722'];
    
    return (
      <svg width={size} height={size} className="mx-auto">
        {data.map((item, index) => {
          const percentage = item.count / total;
          const angle = percentage * 2 * Math.PI;
          
          const x1 = centerX + Math.cos(currentAngle - Math.PI / 2) * radius;
          const y1 = centerY + Math.sin(currentAngle - Math.PI / 2) * radius;
          
          const x2 = centerX + Math.cos(currentAngle + angle - Math.PI / 2) * radius;
          const y2 = centerY + Math.sin(currentAngle + angle - Math.PI / 2) * radius;
          
          const x3 = centerX + Math.cos(currentAngle + angle - Math.PI / 2) * innerRadius;
          const y3 = centerY + Math.sin(currentAngle + angle - Math.PI / 2) * innerRadius;
          
          const x4 = centerX + Math.cos(currentAngle - Math.PI / 2) * innerRadius;
          const y4 = centerY + Math.sin(currentAngle - Math.PI / 2) * innerRadius;
          
          const largeArc = angle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
            />
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger text-center">
          <h5>เกิดข้อผิดพลาด</h5>
          <p className="mb-3">{error}</p>
          <button className="btn btn-danger" onClick={fetchAllData}>
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold" style={{ color: '#2F318B' }}>Dashboard</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-primary btn-sm" onClick={fetchAllData}>
            <i className="fas fa-sync-alt me-1"></i>
            รีเฟรช
          </button>
          <span className="text-muted">อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #2F318B' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-uppercase text-muted mb-1 fw-bold" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>
                    รายการทั้งหมด (เดือนนี้)
                  </p>
                  <h2 className="mb-0 fw-bold">{stats.thisMonth}</h2>
                </div>
                <div className="p-3 rounded" >
                  <i className="fas fa-calendar-alt fa-lg" style={{ color: '#2F318B' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #4CAF50' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-uppercase text-muted mb-1 fw-bold" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>
                    เก็บในคลัง (รวมทั้งหมด)
                  </p>
                  <h2 className="mb-0 fw-bold">{stats.storedItems}</h2>
                </div>
                <div className="p-3 rounded" >
                  <i className="fas fa-warehouse fa-lg" style={{ color: '#2F318B' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #FF9800' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-uppercase text-muted mb-1 fw-bold" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>
                    รอดำเนินการ
                  </p>
                  <h2 className="mb-0 fw-bold">{stats.storedItems}</h2>
                </div>
                <div className="p-3 rounded" s>
                  <i className="fas fa-clock fa-lg" style={{ color: '#2F318B' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #FF9800' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-uppercase text-muted mb-1 fw-bold" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>
                    สิ่งของที่นำออกแล้ว
                  </p>
                  <h2 className="mb-0 fw-bold">{stats.removedItems}</h2>
                </div>
                <div className="p-3 rounded">
                  <i className="fas fa-check-circle fa-lg" style={{ color: '#2F318B' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Line Chart */}
        <div className="col-xl-8 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
                  ภาพรวมรายการของหาย (6 เดือนล่าสุด)
                </h5>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary" type="button">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                <SimpleLineChart data={chartData} width={600} height={300} />
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="col-xl-4 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
                  หมวดหมู่สิ่งของ (เก็บในคลัง)
                </h5>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary" type="button">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <DonutChart data={categoryStats.slice(0, 5)} size={200} />
              </div>
              <div className="row">
                {categoryStats.slice(0, 5).map((item, index) => {
                  const colors = ['#2F318B', '#4CAF50', '#FF9800', '#9C27B0', '#FF5722'];
                  return (
                    <div key={index} className="col-12 mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle me-2" 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              backgroundColor: colors[index] 
                            }}
                          ></div>
                          <small className="text-muted">{item.category}</small>
                        </div>
                        <small className="fw-bold">{item.count}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Section: Top Stats & Latest Items */}
      <div className="row g-4 mb-4">
        {/* Top 3 Categories */}
        {/* <div className="col-xl-4 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
                <i className="fas fa-trophy me-2" style={{ color: '#FFD700' }}></i>
                Top 3 ของหายที่พบบ่อยสุด
              </h5>
            </div>
            <div className="card-body">
              {topCategories.length > 0 ? (
                <div className="space-y-3">
                  {topCategories.map((item, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                    return (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 rounded" 
                           style={{ backgroundColor: '#f8f9fa', marginBottom: '10px' }}>
                        <div className="d-flex align-items-center">
                          <span className="me-3" style={{ fontSize: '1.5rem' }}>{medals[index]}</span>
                          <div>
                            <h6 className="mb-0 fw-bold">{item.category}</h6>
                            <small className="text-muted">อันดับ {index + 1}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <h5 className="mb-0 fw-bold" style={{ color: colors[index] }}>{item.count}</h5>
                          <small className="text-muted">ชิ้น</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-search fa-2x mb-3"></i>
                  <p>ไม่มีข้อมูลหมวดหมู่</p>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* Top Locations */}
        {/* <div className="col-xl-4 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
                <i className="fas fa-map-marker-alt me-2" style={{ color: '#ff6600' }}></i>
                สถานที่พบมากสุด
              </h5>
            </div>
            <div className="card-body">
              {topLocations.length > 0 ? (
                <div className="space-y-2">
                  {topLocations.map((item, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                             style={{ 
                               width: '30px', 
                               height: '30px', 
                               backgroundColor: '#ff6600',
                               color: 'white',
                               fontSize: '12px',
                               fontWeight: 'bold'
                             }}>
                          {index + 1}
                        </div>
                        <div>
                          <h6 className="mb-0">{item.place}</h6>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-primary">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-map fa-2x mb-3"></i>
                  <p>ไม่มีข้อมูลสถานที่</p>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* Latest Items */}
        {/* <div className="col-xl-4 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
                <i className="fas fa-clock me-2" style={{ color: '#4CAF50' }}></i>
                สิ่งของชิ้นล่าสุดที่พบ
              </h5>
            </div>
            <div className="card-body">
              {latestItems.length > 0 ? (
                <div className="space-y-2">
                  {latestItems.map((item, index) => (
                    <div key={item.id} className="d-flex align-items-center py-2 border-bottom">
                      <div className="me-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                             style={{ 
                               width: '40px', 
                               height: '40px', 
                               backgroundColor: item.status === 'stored' ? '#4CAF50' : '#ff6600',
                               color: 'white'
                             }}>
                          <i className={item.status === 'stored' ? 'fas fa-archive' : 'fas fa-check'}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{item.name}</h6>
                        <p className="mb-0 text-muted small">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {item.place}
                        </p>
                        <p className="mb-0 text-muted small">
                          <i className="fas fa-calendar me-1"></i>
                          {formatThaiDate(item.date)}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${item.status === 'stored' ? 'bg-success' : 'bg-warning'}`}>
                          {item.status === 'stored' ? 'เก็บแล้ว' : 'นำออกแล้ว'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-inbox fa-2x mb-3"></i>
                  <p>ไม่มีของที่พบล่าสุด</p>
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>

      {/* New Section: Recent Activities */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>
                  <i className="fas fa-history me-2" style={{ color: '#17a2b8' }}></i>
                  กิจกรรมล่าสุด
                </h5>
                <small className="text-muted">10 รายการล่าสุด</small>
              </div>
            </div>
            <div className="card-body">
              {recentActivities.length > 0 ? (
                <div className="timeline">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="d-flex align-items-start mb-4">
                      <div className="me-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                             style={{ 
                               width: '40px', 
                               height: '40px', 
                               backgroundColor: activity.type === 'add' ? '#4CAF50' : '#ff6600',
                               color: 'white'
                             }}>
                          <i className={activity.type === 'add' ? 'fas fa-plus' : 'fas fa-arrow-right'}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="mb-0 fw-bold">
                            {activity.type === 'add' ? 'เพิ่มรายการใหม่' : 'นำของออก'}: {activity.item}
                          </h6>
                          <small className="text-muted">{formatThaiDate(activity.date)}</small>
                        </div>
                        <p className="mb-1 text-muted">
                          <i className="fas fa-tag me-1"></i>
                          หมวดหมู่: {activity.category}
                          <span className="mx-2">•</span>
                          <i className="fas fa-map-marker-alt me-1"></i>
                          สถานที่: {activity.place}
                        </p>
                        {activity.type === 'add' ? (
                          <p className="mb-0 small text-muted">
                            <i className="fas fa-user me-1"></i>
                            ผู้รับแจ้ง: {activity.reporter}
                          </p>
                        ) : (
                          <p className="mb-0 small text-muted">
                            <i className="fas fa-user me-1"></i>
                            ผู้รับ: {activity.receiver}
                            <span className="mx-2">•</span>
                            <i className="fas fa-user-tie me-1"></i>
                            เจ้าหน้าที่: {activity.staff}
                          </p>
                        )}
                        <span className={`badge mt-2 ${activity.type === 'add' ? 'bg-success' : 'bg-warning'}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-history fa-2x mb-3"></i>
                  <p>ไม่มีกิจกรรมล่าสุด</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {/* <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="card-title mb-0 fw-bold" style={{ color: '#2F318B' }}>สรุปประสิทธิภาพการทำงาน</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="mb-3">
                    <h4 className="mb-1" style={{ color: '#4CAF50' }}>
                      {stats.totalItems > 0 ? ((stats.storedItems / stats.totalItems) * 100).toFixed(1) : 0}%
                    </h4>
                    <small className="text-muted">อัตราการเก็บรักษา</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <h4 className="mb-1" style={{ color: '#ff6600' }}>
                      {stats.totalItems > 0 ? ((stats.removedItems / stats.totalItems) * 100).toFixed(1) : 0}%
                    </h4>
                    <small className="text-muted">อัตราการส่งคืน</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <h4 className="mb-1" style={{ color: '#2F318B' }}>
                      {categoryStats.length}
                    </h4>
                    <small className="text-muted">หมวดหมู่ที่ใช้งาน</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <h4 className="mb-1" style={{ color: '#17a2b8' }}>
                      {stats.totalItems}
                    </h4>
                    <small className="text-muted">รายการทั้งหมด</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;