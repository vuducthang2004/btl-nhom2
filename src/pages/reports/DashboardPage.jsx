import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';

const DashboardPage = () => {
  const [data, setData] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    lowStockItems: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await reportApi.getDashboardOverview();
        const dashboardData = response.data.data || response.data;
        setData({
          todayRevenue: dashboardData.todayRevenue ?? dashboardData.today_revenue ?? 0,
          totalOrders: dashboardData.todayOrders ?? dashboardData.totalOrders ?? dashboardData.total_orders ?? 0,
          lowStockItems: dashboardData.lowStockCount ?? dashboardData.lowStockItems ?? dashboardData.low_stock_items ?? 0,
          completedOrders: dashboardData.completedOrders ?? dashboardData.completed_orders ?? 0
        });
      } catch (error) {
        console.error('Lỗi tải Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const styles = {
    container: { padding: '20px', fontFamily: '"Segoe UI", sans-serif' },
    title: { color: '#4a3728', marginBottom: '20px', fontSize: '28px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    card: (bgColor, color) => ({
      backgroundColor: bgColor, color: color, padding: '25px', borderRadius: '12px', 
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', 
      justifyContent: 'space-between', minHeight: '120px'
    }),
    cardTitle: { fontSize: '16px', fontWeight: 'bold', margin: 0, opacity: 0.9 },
    cardValue: { fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0 0' }
  };

  if (loading) return <h3 style={{ padding: '20px', color: '#6f4e37' }}>Đang tải bảng điều khiển...</h3>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Tổng quan Hôm nay</h2>
      <div style={styles.grid}>
        <div style={styles.card('#e8f5e9', '#2e7d32')}>
          <p style={styles.cardTitle}>💰 Doanh thu trong ngày</p>
          <p style={styles.cardValue}>{formatVND(data.todayRevenue)}</p>
        </div>
        <div style={styles.card('#e3f2fd', '#1565c0')}>
          <p style={styles.cardTitle}>🧾 Tổng số đơn hàng</p>
          <p style={styles.cardValue}>{data.totalOrders} <span style={{fontSize: '16px', fontWeight: 'normal'}}>đơn</span></p>
        </div>
        <div style={styles.card('#fff8e1', '#f57f17')}>
          <p style={styles.cardTitle}>☕ Đã pha chế xong</p>
          <p style={styles.cardValue}>{data.completedOrders} <span style={{fontSize: '16px', fontWeight: 'normal'}}>đơn</span></p>
        </div>
        <div style={styles.card('#ffebee', '#c62828')}>
          <p style={styles.cardTitle}>⚠️ Nguyên liệu sắp hết</p>
          <p style={styles.cardValue}>{data.lowStockItems} <span style={{fontSize: '16px', fontWeight: 'normal'}}>món</span></p>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;