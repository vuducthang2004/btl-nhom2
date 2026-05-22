import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportDashboard = () => {
    const navigate = useNavigate();

    const [realtimeStats] = useState({
        revenue: 4250000,
        invoices: 68,
        aov: 62500,
        occupancy: 75
    });

    const [timeframe, setTimeframe] = useState('today');

    const [topItems] = useState([
        { id: 1, name: 'Cà phê Sữa Đá', sold: 45, revenue: 1350000, margin: 65 },
        { id: 2, name: 'Trà Đào Cam Sả', sold: 32, revenue: 1120000, margin: 70 },
        { id: 3, name: 'Bánh Tiramisu', sold: 18, revenue: 720000, margin: 55 },
        { id: 4, name: 'Bạc Xỉu', sold: 15, revenue: 525000, margin: 68 }
    ]);

    const [staffStats] = useState([
        { id: 1, shift: 'Sáng', name: 'Nguyễn Văn A', revenue: 2100000, orders: 35 },
        { id: 2, shift: 'Sáng', name: 'Trần Thị B', revenue: 1850000, orders: 30 },
        { id: 3, shift: 'Chiều', name: 'Lê Văn C', revenue: 300000, orders: 3 }
    ]);

    const [inventoryAlerts] = useState([
        { id: 1, item: 'Sữa đặc Ngôi Sao', stock: '2 hộp', status: 'critical' },
        { id: 2, item: 'Hạt cà phê Arabica', stock: '1.5 kg', status: 'warning' },
        { id: 3, item: 'Ly nhựa size M', stock: '50 cái', status: 'warning' }
    ]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h2 style={styles.headerTitle}>📊 BÁO CÁO TỔNG HỢP</h2>
                    <span style={styles.liveIndicator}>● LIVE UPDATE</span>
                </div>
                <button style={styles.backBtn} onClick={() => navigate('/home')}>Quay lại trang chủ</button>
            </div>

            <div style={styles.grid4}>
                <div style={{ ...styles.card, borderTop: '4px solid #3498db' }}>
                    <div style={styles.cardTitle}>DOANH THU HIỆN TẠI</div>
                    <div style={styles.cardValue}>{realtimeStats.revenue.toLocaleString()}đ</div>
                </div>
                <div style={{ ...styles.card, borderTop: '4px solid #9b59b6' }}>
                    <div style={styles.cardTitle}>SỐ HÓA ĐƠN</div>
                    <div style={styles.cardValue}>{realtimeStats.invoices}</div>
                </div>
                <div style={{ ...styles.card, borderTop: '4px solid #2ecc71' }}>
                    <div style={styles.cardTitle}>AOV (TRUNG BÌNH/ĐƠN)</div>
                    <div style={styles.cardValue}>{realtimeStats.aov.toLocaleString()}đ</div>
                </div>
                <div style={{ ...styles.card, borderTop: '4px solid #e67e22' }}>
                    <div style={styles.cardTitle}>TỶ LỆ LẤP ĐẦY BÀN</div>
                    <div style={styles.cardValue}>{realtimeStats.occupancy}%</div>
                </div>
            </div>

            <div style={styles.grid2}>
                <div style={styles.card}>
                    <div style={styles.flexBetween}>
                        <h3 style={styles.sectionTitle}>DOANH THU THEO THỜI GIAN</h3>
                        <select style={styles.select} value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="today">Hôm nay</option>
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này (MTD)</option>
                            <option value="year">Năm nay (YoY)</option>
                        </select>
                    </div>
                    <div style={styles.growthContainer}>
                        <div style={styles.growthItem}>
                            <span style={styles.growthLabel}>So với hôm qua:</span>
                            <span style={styles.growthPositive}>▲ +12.5%</span>
                        </div>
                        <div style={styles.growthItem}>
                            <span style={styles.growthLabel}>So với cùng kỳ tháng trước:</span>
                            <span style={styles.growthPositive}>▲ +5.2%</span>
                        </div>
                    </div>
                    <div style={styles.chartPlaceholder}>
                        Biểu đồ doanh thu sẽ được hiển thị tại đây
                    </div>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>CẢNH BÁO TỒN KHO TỰ ĐỘNG</h3>
                    <div style={styles.alertList}>
                        {inventoryAlerts.map(alert => (
                            <div key={alert.id} style={styles.alertItem}>
                                <div>
                                    <strong>{alert.item}</strong>
                                    <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Tồn kho: {alert.stock}</div>
                                </div>
                                <span style={alert.status === 'critical' ? styles.badgeRed : styles.badgeYellow}>
                                    {alert.status === 'critical' ? 'CẦN NHẬP GẤP' : 'SẮP HẾT'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={styles.grid2}>
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>TOP MÓN & BIÊN LỢI NHUẬN (MARGIN)</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Tên món</th>
                                <th style={styles.th}>SL</th>
                                <th style={styles.th}>Doanh thu</th>
                                <th style={styles.th}>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topItems.map(item => (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={styles.td}><strong>{item.name}</strong></td>
                                    <td style={styles.td}>{item.sold}</td>
                                    <td style={styles.td}>{item.revenue.toLocaleString()}đ</td>
                                    <td style={styles.td}>
                                        <span style={styles.badgeGreen}>{item.margin}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>HIỆU SUẤT NHÂN VIÊN & CA LÀM</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Nhân viên</th>
                                <th style={styles.th}>Hóa đơn</th>
                                <th style={styles.th}>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffStats.map(staff => (
                                <tr key={staff.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <strong>{staff.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Ca: {staff.shift}</div>
                                    </td>
                                    <td style={styles.td}>{staff.orders}</td>
                                    <td style={styles.td}>{staff.revenue.toLocaleString()}đ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '25px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerTitle: { margin: 0, color: '#1a1a1a', fontSize: '24px' },
    liveIndicator: { backgroundColor: '#ffeaa7', color: '#d35400', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', animation: 'blink 2s infinite' },
    backBtn: { padding: '10px 20px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '20px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    cardTitle: { color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' },
    cardValue: { color: '#2c3e50', fontSize: '26px', fontWeight: 'bold' },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    sectionTitle: { margin: 0, color: '#2c3e50', fontSize: '16px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid #bdc3c7', cursor: 'pointer' },
    growthContainer: { display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' },
    growthItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
    growthLabel: { fontSize: '13px', color: '#7f8c8d' },
    growthPositive: { fontSize: '16px', fontWeight: 'bold', color: '#27ae60' },
    chartPlaceholder: { height: '150px', backgroundColor: '#ecf0f1', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { padding: '12px 10px', backgroundColor: '#f8f9fa', color: '#34495e', textAlign: 'left', borderBottom: '2px solid #ddd' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '12px 10px', color: '#2c3e50' },
    alertList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
    alertItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#fdfbfb', border: '1px solid #eee', borderRadius: '5px' },
    badgeRed: { backgroundColor: '#fce4e4', color: '#c0392b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    badgeYellow: { backgroundColor: '#fcf3cf', color: '#f39c12', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    badgeGreen: { backgroundColor: '#e8f8f5', color: '#27ae60', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }
};

export default ReportDashboard;